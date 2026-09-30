# Emote animation sequencing

How a client plays an emote over time, and how it transitions from one emote to
the next. This elaborates the `preanim` / `postanim` / `anim` fields defined for
`[emote <name>]` blocks in [README.md](./README.md); read that first for the
field grammar. Sequencing applies to the block format; legacy `#` banks have no
`postanim` and follow only the base gate below.

## The three phases

An emote is up to three clips played back to back:

1. `preanim` (entry): a one shot animation played when the emote begins, before
   its loop. Optional; null when the file omits it or writes `-`.
2. `anim` (loop): the resting animation. For 2D the client derives the idle and
   talking sprites (`(a)<anim>` / `(b)<anim>`); for 3D idle and talking share
   one base VMD and the mouth is morph driven. This is what shows while the
   character sits on screen.
3. `postanim` (exit): a one shot animation played when the emote is left, before
   the next emote's `preanim`. Optional; null when omitted. Block format only.

`preanim` is the mirror of `postanim`: one opens the emote, the other closes it.

## The base gate: is preanim enabled for this message?

The preanim phase is gated per message. It runs only when preanim is enabled,
which is carried on the wire as the MS emote modifier:

- Enabled by `preanim`, `preanim_and_objection`, `objection_zoom`.
- Not enabled by `no_preanim` or `zoom`.

In a client UI this is the "Preanim" checkbox. An emote's own `modifier` field
(in its block) is the default for messages sent with that emote, so an emote
authored with a preanim-playing `modifier` shows the box pre-checked.

### When the gate is open (preanim enabled)

The transition plays in full:

```
leaving.postanim  ->  entering.preanim  ->  entering.anim (loop)
```

Either one shot may be absent and is simply skipped: an emote with no `postanim`
is left instantly, and an entering emote with no `preanim` starts its loop
directly. If both are absent, the switch is immediate.

### When the gate is closed (preanim disabled)

Neither one shot plays. The leaving emote is dropped and the entering emote
starts on its loop right away:

```
entering.anim (loop)
```

## The same-character continuation override

There is one case where the transition plays even though the gate is closed:

> When the same character is already on screen (showing its idle loop, not
> making a fresh entrance) and switches to another emote, and the leaving emote
> has a `postanim` and the entering emote has a `preanim`, the client plays the
> full `postanim -> preanim -> loop` transition regardless of the preanim
> toggle.

The intent: an author who gives an emote a `postanim` and the next a `preanim`
means those two clips to chain into a continuous motion. On a same-character
emote change that pairing should read smoothly whether or not the sender checked
the box, so the pair is honored automatically.

All of the following must hold for the override to fire:

- The character on screen does not change across the switch (same character).
- That character is already visible on its idle loop, i.e. this is a
  continuation, not a fresh entrance into the scene.
- The leaving emote has a non-null `postanim`.
- The entering emote has a non-null `preanim`.

If any condition fails, the base gate decides:

- Different character: no override. A character entering the scene never borrows
  the previous character's postanim.
- Only one of the two clips exists: no override. A lone `postanim` or a lone
  `preanim` is not a chained pair, so it plays only when the gate is open.
- Character not yet on a loop (mid entrance): no override.

## Worked examples

Same character, both clips present, box unchecked:

```
[emote point]   postanim = lower_arm.gif
[emote think]   preanim  = raise_hand.gif
```

Switching point -> think plays `lower_arm.gif` then `raise_hand.gif` then
think's loop, because the override fires.

Same character, box unchecked, only a preanim on the entering emote:

```
[emote point]   (no postanim)
[emote think]   preanim = raise_hand.gif
```

Switching point -> think goes straight to think's loop. No override (no leaving
postanim), and the gate is closed, so `raise_hand.gif` does not play. Check the
box (or send a preanim-playing modifier) to force it.

Different character takes the scene, box checked:

```
leaving  = Alice / point (postanim = lower_arm.gif)
entering = Bob   / wave  (preanim  = step_in.gif)
```

Because the gate is open the entering character plays its own `preanim`
(`step_in.gif`) then its loop. The leaving character's `postanim` does not play:
postanim is a same-character exit, not a hand off between characters.

## Relation to sound and camera

Sound (`sound`, `sounddelayms`) is scheduled off the same timeline: the delay is
measured from the start of playback and fires during whichever phase it lands
in. 3D camera motion is the emote's own `camera` VMD (a `.vmd` carrying a camera
track that frames the emote; see [README.md](./README.md)). Both are layered on
top of the phase sequence described here and do not change which animation
phases run.
