/* Athena - A server for Attorney Online 2 written in Go
Copyright (C) 2022 MangosArentLiterature <mango@transmenace.dev>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>. */

package aolib

import (
	"strconv"
	"strings"
)

// MSPacket is the structured form of the AO2 in-character ("MS") packet.
//
// AO2 reference:
// https://github.com/AttorneyOnline/docs/blob/master/docs/Development/network/MS%20Packet%20Reference.md
//
// The wire format differs by direction:
//
//   - From the client: 26 fields. OtherName and OtherEmote are absent —
//     SelfOffset follows OtherCharID directly, and the server-only pair
//     fields (OtherName/OtherEmote/OtherOffset/OtherFlip) are simply not
//     transmitted.
//   - From the server: 30 fields. OtherName and OtherEmote occupy slots 17
//     and 18, and OtherOffset / OtherFlip occupy slots 20 and 21.
//
// Use ParseMSClient / ParseMSServer to decode and ServerArgs / ServerString
// to encode. The whole point of this type is that no other code in the
// codebase should ever index into the MS packet by position.
type MSPacket struct {
	DeskMod                string // [0]
	PreAnim                string // [1]
	Character              string // [2]
	Emote                  string // [3]
	Message                string // [4]
	Side                   string // [5]
	SfxName                string // [6]
	EmoteModifier          string // [7]
	CharID                 string // [8]
	SfxDelay               string // [9]
	ShoutModifier          string // [10] (objection_modifier)
	Evidence               string // [11]
	Flip                   string // [12]
	Realization            string // [13]
	TextColor              string // [14]
	Showname               string // [15] (2.6+)
	OtherCharID            string // [16] (pair)
	OtherName              string // [17] (server-only — not present from client)
	OtherEmote             string // [18] (server-only — not present from client)
	SelfOffset             string // [19] (client [17])
	OtherOffset            string // [20] (server-only)
	OtherFlip              string // [21] (server-only)
	NonInterruptingPreAnim string // [22] (client [18])
	SfxLooping             string // [23] (2.8+)
	Screenshake            string // [24]
	FramesShake            string // [25]
	FramesRealization      string // [26]
	FramesSfx              string // [27]
	Additive               string // [28]
	Effect                 string // [29]
	Blips                  string // [30] (2.10.2+)

	// AdditionalChars holds the multi-pair partners beyond the standard pair
	// (JSON wire only). The classic FantaCode MS ends at Blips; these are
	// emitted solely via JSONExtra()["additional_chars"] and never reach
	// FantaCode clients. Empty means no extra partners.
	AdditionalChars []AdditionalChar
}

// AdditionalChar is one on-screen partner beyond the standard pair. It mirrors
// the paired_* fields as a typed record and serialises to a JSON object
// (charid / name / emote / offset{x,y} / flip) inside the MS additional_chars
// array.
type AdditionalChar struct {
	CharID int      `json:"charid"`
	Name   string   `json:"name"`
	Emote  string   `json:"emote"`
	Offset PairOffset `json:"offset"`
	Flip   int      `json:"flip"`
}

// PairOffset is an {x,y} screen-coordinate pair (percent of viewport),
// matching the offset / paired_offset shape in the MS JSON schema.
type PairOffset struct {
	X int `json:"x"`
	Y int `json:"y"`
}

// msServerFieldCount is the maximum number of fields in a server-direction
// MS packet (DeskMod through Blips). Older clients send fewer fields; older
// server emissions can omit Blips. The value is used both to size the
// outgoing slice and to bound the parser's read.
const msServerFieldCount = 31

// ParseMSClient decodes an MS packet body received from a client.
//
// On the wire the client packet has up to 26 fields and OMITS OtherName and
// OtherEmote — SelfOffset (server slot 19) is at client slot 17. Older
// clients send fewer fields; missing fields are left blank.
func ParseMSClient(body []string) *MSPacket {
	ms := &MSPacket{}
	if len(body) > 0 {
		ms.DeskMod = body[0]
	}
	if len(body) > 1 {
		ms.PreAnim = body[1]
	}
	if len(body) > 2 {
		ms.Character = body[2]
	}
	if len(body) > 3 {
		ms.Emote = body[3]
	}
	if len(body) > 4 {
		ms.Message = body[4]
	}
	if len(body) > 5 {
		ms.Side = body[5]
	}
	if len(body) > 6 {
		ms.SfxName = body[6]
	}
	if len(body) > 7 {
		ms.EmoteModifier = body[7]
	}
	if len(body) > 8 {
		ms.CharID = body[8]
	}
	if len(body) > 9 {
		ms.SfxDelay = body[9]
	}
	if len(body) > 10 {
		ms.ShoutModifier = body[10]
	}
	if len(body) > 11 {
		ms.Evidence = body[11]
	}
	if len(body) > 12 {
		ms.Flip = body[12]
	}
	if len(body) > 13 {
		ms.Realization = body[13]
	}
	if len(body) > 14 {
		ms.TextColor = body[14]
	}
	if len(body) > 15 {
		ms.Showname = body[15]
	}
	if len(body) > 16 {
		ms.OtherCharID = body[16]
	}
	// Client packet jumps from OtherCharID directly to SelfOffset.
	if len(body) > 17 {
		ms.SelfOffset = body[17]
	}
	if len(body) > 18 {
		ms.NonInterruptingPreAnim = body[18]
	}
	if len(body) > 19 {
		ms.SfxLooping = body[19]
	}
	if len(body) > 20 {
		ms.Screenshake = body[20]
	}
	if len(body) > 21 {
		ms.FramesShake = body[21]
	}
	if len(body) > 22 {
		ms.FramesRealization = body[22]
	}
	if len(body) > 23 {
		ms.FramesSfx = body[23]
	}
	if len(body) > 24 {
		ms.Additive = body[24]
	}
	if len(body) > 25 {
		ms.Effect = body[25]
	}
	if len(body) > 26 {
		ms.Blips = body[26]
	}
	return ms
}

// ParseMSServer decodes an MS packet body in server format (30 or 31 fields,
// with OtherName/OtherEmote at slots 17/18 and OtherOffset/OtherFlip at
// slots 20/21). Used to round-trip an MS line that was previously archived
// in wire form, e.g. testimony recorder statements.
func ParseMSServer(body []string) *MSPacket {
	ms := &MSPacket{}
	get := func(i int) string {
		if i < len(body) {
			return body[i]
		}
		return ""
	}
	ms.DeskMod = get(0)
	ms.PreAnim = get(1)
	ms.Character = get(2)
	ms.Emote = get(3)
	ms.Message = get(4)
	ms.Side = get(5)
	ms.SfxName = get(6)
	ms.EmoteModifier = get(7)
	ms.CharID = get(8)
	ms.SfxDelay = get(9)
	ms.ShoutModifier = get(10)
	ms.Evidence = get(11)
	ms.Flip = get(12)
	ms.Realization = get(13)
	ms.TextColor = get(14)
	ms.Showname = get(15)
	ms.OtherCharID = get(16)
	ms.OtherName = get(17)
	ms.OtherEmote = get(18)
	ms.SelfOffset = get(19)
	ms.OtherOffset = get(20)
	ms.OtherFlip = get(21)
	ms.NonInterruptingPreAnim = get(22)
	ms.SfxLooping = get(23)
	ms.Screenshake = get(24)
	ms.FramesShake = get(25)
	ms.FramesRealization = get(26)
	ms.FramesSfx = get(27)
	ms.Additive = get(28)
	ms.Effect = get(29)
	ms.Blips = get(30)
	return ms
}

// ParseMSServerString splits a server-format MS body joined by '#' and
// decodes it into an MSPacket.
func ParseMSServerString(s string) *MSPacket {
	if s == "" {
		return &MSPacket{}
	}
	return ParseMSServer(strings.Split(s, "#"))
}

// Shout parses the shout/objection modifier (wire field 10) as an integer.
//
// The field can carry an "&"-suffixed sub-value naming a custom objection
// ("2&myshout"), so the numeric part has to be split off before parsing --
// a plain Atoi on the raw field fails on every custom shout. This lives here,
// on the packet, so every reader of the field agrees on what it says: the IC
// handler validates against it and the raid guard scores against it, and a
// second hand-rolled parse in either place could silently disagree with the
// other.
func (ms *MSPacket) Shout() (int, error) {
	objStr, _, _ := strings.Cut(ms.ShoutModifier, "&")
	return strconv.Atoi(objStr)
}

// ServerArgs returns the MS packet body in server wire format — 30 fields
// fixed, with the optional Blips appended only when a value is set. The
// returned slice can be passed straight to Client.SendPacket("MS", args...).
func (ms *MSPacket) ServerArgs() []string {
	n := 30
	if ms.Blips != "" {
		n = 31
	}
	args := make([]string, n)
	args[0] = ms.DeskMod
	args[1] = ms.PreAnim
	args[2] = ms.Character
	args[3] = ms.Emote
	args[4] = ms.Message
	args[5] = ms.Side
	args[6] = ms.SfxName
	args[7] = ms.EmoteModifier
	args[8] = ms.CharID
	args[9] = ms.SfxDelay
	args[10] = ms.ShoutModifier
	args[11] = ms.Evidence
	args[12] = ms.Flip
	args[13] = ms.Realization
	args[14] = ms.TextColor
	args[15] = ms.Showname
	args[16] = ms.OtherCharID
	args[17] = ms.OtherName
	args[18] = ms.OtherEmote
	args[19] = ms.SelfOffset
	args[20] = ms.OtherOffset
	args[21] = ms.OtherFlip
	args[22] = ms.NonInterruptingPreAnim
	args[23] = ms.SfxLooping
	args[24] = ms.Screenshake
	args[25] = ms.FramesShake
	args[26] = ms.FramesRealization
	args[27] = ms.FramesSfx
	args[28] = ms.Additive
	args[29] = ms.Effect
	if ms.Blips != "" {
		args[30] = ms.Blips
	}
	return args
}

// JSONExtra returns the JSON-only MS fields: the multi-pair "additional_chars"
// list, or nil when there are no extra partners (so the field is omitted and
// the schema default applies). Part of the JSONOutgoing interface.
func (ms *MSPacket) JSONExtra() map[string]any {
	if len(ms.AdditionalChars) == 0 {
		return nil
	}
	return map[string]any{"additional_chars": ms.AdditionalChars}
}

// ServerString joins ServerArgs with '#'. Used when an entire MS body needs
// to be carried as a single opaque token (e.g. testimony storage) and split
// again on the receiving side.
func (ms *MSPacket) ServerString() string {
	return strings.Join(ms.ServerArgs(), "#")
}

// SetTextColorInServerString rewrites the TextColor field of a wire-format
// MS body without forcing every caller to know which slot index holds it.
// The string is parsed, the field is reassigned, and the result is
// re-encoded — i.e. the only place in the codebase that knows TextColor
// lives at slot 14 is ParseMSServer / ServerArgs.
func SetTextColorInServerString(s, color string) string {
	ms := ParseMSServerString(s)
	ms.TextColor = color
	return ms.ServerString()
}
