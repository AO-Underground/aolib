/**
 * Session: the role-typed, dispatch-driving surface aolib exposes.
 *
 * Two factories:
 *   `server(config)`, for client-side code; the session represents
 *     the remote *server*. `.send.<X>` ships C2S packets; `.on.<X>`
 *     registers handlers for S2C packets.
 *   `client(config)`, for server-side code; the session represents
 *     one remote *client*. `.send.<X>` ships S2C packets; `.on.<X>`
 *     registers handlers for C2S packets.
 *
 * Sessions are named for the *remote* party so that `client.send.MC`
 * reads as "send MC to the client". The role determines which direction
 * lookup we do at every `.send.X` / `.on.X` access, wrong-direction
 * calls fail at compile time AND runtime.
 *
 * Wire mode is per-session and starts at fanta. By default the session
 * negotiates JSON itself: a `server()` session switches on `decryptor#JSON`,
 * a `client()` session on the first frame starting with `{`. Set
 * `disableAutoJson` to leave it to `setJsonMode`.
 *
 *   transport bytes ─► receive(wire)
 *      │
 *      ├── readHeader(wire)                  ─── fail ─► onMalformedFrame
 *      ├── lookup schema in inbound map      ─── miss ─► onUnknownHeader
 *      ├── decode(schema, wire)              ─── fail ─► onDecodeError
 *      ├── handler = handlers[header]        ─── miss ─► onUnhandled
 *      └── handler(packet)                   ─── throw ► onHandlerError
 *
 *   send.X(packet) ─► encode(outboundSchemas[X], packet, mode) ─► config.send(wire)
 */

import { encode, type WireMode } from "./encode";
import { decode, readHeader } from "./decode";
import { lookupCodec } from "./fanta";
import {
  c2sSchemas,
  s2cSchemas,
  type Packet,
  type C2SInputs,
  type S2CInputs,
  type C2SOutputs,
  type S2COutputs,
} from "../generated/packets";
import type { JsonSchema } from "./types";

// Public types

export interface SessionConfig {
  send(wire: string): void;
  /**
   * Turn off automatic JSON negotiation. By default a `server()` session
   * switches outbound to JSON on `decryptor#JSON`, and a `client()` session
   * on the first frame that starts with `{`.
   */
  disableAutoJson?: boolean;
  onMalformedFrame?(err: Error, wire: string): void;
  onUnknownHeader?(header: string, wire: string): void;
  onDecodeError?(header: string, err: Error, wire: string): void;
  onUnhandled?(header: string, packet: unknown): void;
  onHandlerError?(header: string, err: Error, packet: unknown): void;
}

type SendMap<Inputs> = {
  [K in keyof Inputs]: (packet: Inputs[K]) => void;
};
type OnMap<Outputs> = {
  [K in keyof Outputs]: (handler: (packet: Outputs[K]) => void) => void;
};

/**
 * Custom packets: headers the meta schemas don't model. Each needs a codec
 * registered with `registerCodec`, which encodes and decodes it in both wire
 * formats; `sendCustom` throws without one. A header takes `on.<X>` or
 * `onCustom("X")`, not both; the second registration throws.
 */
interface CustomChannel {
  // The generic P (vs a plain `Packet` param) is what lets an inline literal
  // carry extra fields without an excess-property error.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  sendCustom<P extends Packet>(packet: P): void;
  onCustom<T extends Packet = Packet & Record<string, unknown>>(
    header: T["$header"],
    handler: (packet: T) => void,
  ): void;
}

/** Returned from `server(config)`. Owns the C2S send side, S2C on side. */
export interface ServerSession extends CustomChannel {
  send: SendMap<C2SInputs>;
  on: OnMap<S2COutputs>;
  receive(wire: string): void;
  close(): void;
  /**
   * Toggle the outbound wire format: `true` = JSON envelopes,
   * `false` = positional fanta. Inbound always auto-detects.
   */
  setJsonMode(enabled: boolean): void;
}

/** Returned from `client(config)`. Owns the S2C send side, C2S on side. */
export interface ClientSession extends CustomChannel {
  send: SendMap<S2CInputs>;
  on: OnMap<C2SOutputs>;
  receive(wire: string): void;
  close(): void;
  /**
   * Toggle the outbound wire format: `true` = JSON envelopes,
   * `false` = positional fanta. Inbound always auto-detects.
   */
  setJsonMode(enabled: boolean): void;
}

// Implementation

type Role = "client" | "server";

type SchemaMap = Record<string, JsonSchema>;

// Guarantee a custom codec's JSON object carries a matching "$header".
function withJsonHeader(raw: string, header: string): string {
  const { $header: _, ...fields } = JSON.parse(raw) as Record<string, unknown>;
  return JSON.stringify({ $header: header, ...fields });
}

function makeSession(role: Role, config: SessionConfig): ServerSession & ClientSession {
  // role "server" → this represents the remote server → from us-as-client.
  //   outbound: C2S (we are the client speaking to the server)
  //   inbound: S2C
  // role "client" → this represents a remote client → from us-as-server.
  //   outbound: S2C
  //   inbound: C2S
  const outboundSchemas = (role === "server" ? c2sSchemas : s2cSchemas) as SchemaMap;
  const inboundSchemas = (role === "server" ? s2cSchemas : c2sSchemas) as SchemaMap;
  const oppositeOutbound = role === "server" ? s2cSchemas : c2sSchemas;
  const oppositeInbound = role === "server" ? c2sSchemas : s2cSchemas;

  let mode: WireMode = "fanta";
  const autoJson = !config.disableAutoJson;
  let closed = false;
  const handlers: Record<string, (packet: unknown) => void> = {};
  const customHandlers: Record<string, (packet: unknown) => void> = {};

  const send = new Proxy({}, {
    get: (_t, prop) => {
      if (typeof prop !== "string") return undefined;
      const header = prop;
      const schema = outboundSchemas[header];
      if (!schema) {
        if (header in oppositeOutbound) {
          throw wrongDirectionSendError(role, header);
        }
        throw new Error(`aolib: no schema registered for header '${header}'`);
      }
      return (packet: unknown) => {
        if (closed) {
          throw new Error(`aolib: send.${header} on a closed session`);
        }
        const wire = encode(schema, packet as Record<string, unknown>, mode);
        config.send(wire);
      };
    },
  });

  const on = new Proxy({}, {
    get: (_t, prop) => {
      if (typeof prop !== "string") return undefined;
      const header = prop;
      if (!(header in inboundSchemas)) {
        if (header in oppositeInbound) {
          throw wrongDirectionOnError(role, header);
        }
        throw new Error(`aolib: no schema registered for header '${header}'`);
      }
      return (handler: (packet: unknown) => void) => {
        if (header in customHandlers) throw customCollisionError(header);
        handlers[header] = handler;
      };
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  function sendCustom<P extends Packet>(packet: P): void {
    if (closed) {
      throw new Error(`aolib: sendCustom on a closed session`);
    }
    const header = packet.$header;
    if (typeof header !== "string" || header === "") {
      throw new Error(`aolib: sendCustom requires a non-empty string $header`);
    }
    const codec = lookupCodec(header);
    if (!codec) {
      throw new Error(
        `aolib: sendCustom('${header}') needs a codec; call registerCodec('${header}', ...) first`,
      );
    }
    if (mode === "json") {
      if (!codec.encodeJson) {
        throw new Error(`aolib: codec for '${header}' must implement encodeJson`);
      }
      config.send(withJsonHeader(codec.encodeJson(packet as Record<string, unknown>), header));
      return;
    }
    const args = codec.encodeFanta(packet as Record<string, unknown>);
    const body = args.join("#");
    config.send(body === "" ? `${header}#%` : `${header}#${body}#%`);
  }

  function onCustom<T extends Packet = Packet & Record<string, unknown>>(
    header: T["$header"],
    handler: (packet: T) => void,
  ): void {
    if (header in handlers) throw customCollisionError(header);
    customHandlers[header] = handler as (packet: unknown) => void;
  }

  function receive(wire: string): void {
    if (closed) return;
    if (autoJson && role === "client" && wire.startsWith("{")) mode = "json";

    let header: string;
    try {
      header = readHeader(wire);
    } catch (err) {
      if (!callHook(config.onMalformedFrame, err as Error, wire)) {
        defaultMalformedFrame(err as Error, wire);
      }
      return;
    }

    // Custom handlers win over the typed path; the header's codec decodes the
    // frame in either format.
    const custom = customHandlers[header];
    if (custom) {
      const codec = lookupCodec(header);
      let raw: Record<string, unknown> | undefined;
      if (wire.startsWith("{")) {
        if (codec?.decodeJson) raw = codec.decodeJson(wire);
      } else if (codec) {
        const rest = wire.replace(/#?%$/, "").slice(header.length + 1);
        const args = rest === "" ? [] : rest.split("#");
        raw = codec.decodeFanta(args);
      }
      if (raw !== undefined) {
        try {
          custom(raw);
        } catch (err) {
          if (!callHook(config.onHandlerError, header, err as Error, raw)) {
            defaultHandlerError(header, err as Error, raw);
          }
        }
        return;
      }
    }

    const schema = inboundSchemas[header];
    if (!schema) {
      if (!callHook(config.onUnknownHeader, header, wire)) {
        defaultUnknownHeader(header, wire);
      }
      return;
    }

    let packet: object;
    try {
      // Packets are plain data: the decoded, Ajv-defaulted object matches
      // the OutMap type directly, no class rehydration.
      packet = decode(schema, wire);
    } catch (err) {
      if (!callHook(config.onDecodeError, header, err as Error, wire)) {
        defaultDecodeError(header, err as Error, wire);
      }
      return;
    }

    if (autoJson && role === "server" && header === "decryptor" && (packet as { value?: unknown }).value === "JSON") {
      mode = "json";
    }

    const handler = handlers[header];
    if (!handler) {
      if (!callHook(config.onUnhandled, header, packet)) {
        defaultUnhandled(header, packet);
      }
      return;
    }

    try {
      handler(packet);
    } catch (err) {
      if (!callHook(config.onHandlerError, header, err as Error, packet)) {
        defaultHandlerError(header, err as Error, packet);
      }
    }
  }

  function close(): void {
    closed = true;
    for (const k of Object.keys(handlers)) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- clearing all handler keys on close
      delete handlers[k];
    }
    for (const k of Object.keys(customHandlers)) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- clearing all custom handler keys on close
      delete customHandlers[k];
    }
  }

  function setJsonMode(enabled: boolean): void {
    mode = enabled ? "json" : "fanta";
  }

  return {
    send: send as unknown as SendMap<C2SInputs> & SendMap<S2CInputs>,
    on: on as unknown as OnMap<S2COutputs> & OnMap<C2SOutputs>,
    sendCustom,
    onCustom,
    receive,
    close,
    setJsonMode,
  };
}

// Error helpers

function wrongDirectionSendError(role: Role, header: string): Error {
  if (role === "server") {
    return new Error(
      `aolib: server-session.send.${header}, '${header}' is server -> client. ` +
        `On a server session (representing the remote server), you can only send ` +
        `client -> server packets. Use client(config).send.${header} instead, or ` +
        `register a handler with server.on.${header}(...) to receive this packet.`,
    );
  }
  return new Error(
    `aolib: client-session.send.${header}, '${header}' is client -> server. ` +
      `On a client session (representing a remote client), you can only send ` +
      `server -> client packets. Use server(config).send.${header} instead, or ` +
      `register a handler with client.on.${header}(...) to receive this packet.`,
  );
}

function wrongDirectionOnError(role: Role, header: string): Error {
  if (role === "server") {
    return new Error(
      `aolib: server-session.on.${header}, '${header}' is client -> server. ` +
        `On a server session (representing the remote server), you can only ` +
        `register handlers for server -> client packets. Use client(config).on.${header} ` +
        `instead, or send the packet with server.send.${header}(...).`,
    );
  }
  return new Error(
    `aolib: client-session.on.${header}, '${header}' is server -> client. ` +
      `On a client session (representing a remote client), you can only register ` +
      `handlers for client -> server packets. Use server(config).on.${header} ` +
      `instead, or send the packet with client.send.${header}(...).`,
  );
}

function customCollisionError(header: string): Error {
  return new Error(
    `aolib: header '${header}' already has both a typed on.${header} handler ` +
      `and onCustom('${header}'). Register one or the other, not both.`,
  );
}

// Hook plumbing

type Hook<A extends unknown[]> = (...args: A) => void;

function callHook<A extends unknown[]>(
  hook: Hook<A> | undefined,
  ...args: A
): true | undefined {
  if (!hook) return undefined;
  hook(...args);
  return true;
}

function defaultMalformedFrame(err: Error, wire: string): void {
  console.warn(
    `[aolib] malformed wire frame: ${err.message}\n  wire: ${truncate(wire)}`,
  );
}

function defaultUnknownHeader(header: string, wire: string): void {
  console.warn(
    `[aolib] unknown packet header '${header}' (no schema registered)\n  wire: ${truncate(wire)}`,
  );
}

function defaultDecodeError(header: string, err: Error, wire: string): void {
  console.warn(
    `[aolib] decode error for '${header}': ${err.message}\n  wire: ${truncate(wire)}`,
  );
}

function defaultUnhandled(header: string, _packet: unknown): void {
  console.warn(`[aolib] no handler registered for '${header}'`);
}

function defaultHandlerError(header: string, err: Error, _packet: unknown): void {
  console.error(`[aolib] handler for '${header}' threw: ${err.message}`);
}

function truncate(s: string, max = 200): string {
  return s.length <= max ? s : `${s.slice(0, max)}...`;
}

// Factories

export function server(config: SessionConfig): ServerSession {
  return makeSession("server", config);
}

export function client(config: SessionConfig): ClientSession {
  return makeSession("client", config);
}
