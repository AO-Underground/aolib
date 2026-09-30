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
 * Wire mode is per-session and starts at fanta. Switching to JSON
 * (or back) is the application's job, call `session.setJsonMode(true)`
 * from whatever handler reads the protocol's mode-switch signal. The
 * library doesn't inspect packet contents to flip modes on its own.
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
import {
  c2sSchemas,
  s2cSchemas,
  c2sClasses,
  s2cClasses,
  type C2SInputs,
  type S2CInputs,
  type C2SOutputs,
  type S2COutputs,
} from "../generated/packets";
import type { JsonSchema } from "./types";

type ClassCtor = { prototype: object };

// Public types

export interface SessionConfig {
  send(wire: string): void;
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

/** Returned from `server(config)`. Owns the C2S send side, S2C on side. */
export interface ServerSession {
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
export interface ClientSession {
  send: SendMap<S2CInputs>;
  on: OnMap<C2SOutputs>;
  receive(wire: string): void;
  close(): void;
  /**
   * Toggle the outbound wire format: `true` = JSON envelopes,
   * `false` = positional fanta. Inbound always auto-detects.
   */
  setJsonMode(enabled: boolean): void;
  area?: number;
}

// Implementation

type Role = "client" | "server";

type SchemaMap = Record<string, JsonSchema>;
type ClassMap = Record<string, ClassCtor>;

function makeSession(role: Role, config: SessionConfig): ServerSession & ClientSession {
  // role "server" → this represents the remote server → from us-as-client.
  //   outbound: C2S (we are the client speaking to the server)
  //   inbound: S2C
  // role "client" → this represents a remote client → from us-as-server.
  //   outbound: S2C
  //   inbound: C2S
  const outboundSchemas = (role === "server" ? c2sSchemas : s2cSchemas) as SchemaMap;
  const inboundSchemas = (role === "server" ? s2cSchemas : c2sSchemas) as SchemaMap;
  const inboundClasses = (role === "server" ? s2cClasses : c2sClasses) as unknown as ClassMap;
  const oppositeOutbound = role === "server" ? s2cSchemas : c2sSchemas;
  const oppositeInbound = role === "server" ? c2sSchemas : s2cSchemas;

  let mode: WireMode = "fanta";
  let closed = false;
  const handlers: Record<string, (packet: unknown) => void> = {};

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
        handlers[header] = handler;
      };
    },
  });

  function receive(wire: string): void {
    if (closed) return;

    let header: string;
    try {
      header = readHeader(wire);
    } catch (err) {
      if (!callHook(config.onMalformedFrame, err as Error, wire)) {
        defaultMalformedFrame(err as Error, wire);
      }
      return;
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
      const parsed = decode(schema, wire);
      const ctor = inboundClasses[header];
      // Rehydrate as a class instance so handlers can rely on
      // `instanceof` and the typed shape matches the OutMap.
      packet = ctor
        ? Object.assign(Object.create(ctor.prototype) as object, parsed)
        : parsed;
    } catch (err) {
      if (!callHook(config.onDecodeError, header, err as Error, wire)) {
        defaultDecodeError(header, err as Error, wire);
      }
      return;
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
  }

  function setJsonMode(enabled: boolean): void {
    mode = enabled ? "json" : "fanta";
  }

  return {
    send: send as unknown as SendMap<C2SInputs> & SendMap<S2CInputs>,
    on: on as unknown as OnMap<S2COutputs> & OnMap<C2SOutputs>,
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
