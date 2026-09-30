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

// This file defines the typed structs for every AO2 packet in
// ~/ao/docs/docs/Development/network/Packet Reference.md plus the Athena
// extensions (VS_*, "decryptor"). The goal is that every packet is
// serialized/deserialized exactly once in the whole codebase:
//
//   - Inbound handlers call the matching ParseXxx(body) at the top and
//     thereafter operate on named fields.
//   - Outbound senders construct a typed value and pass it to
//     Client.Send / writeToAreaPkt etc., which call Args() once.
//
// Number-typed fields (char_id, evidence id, etc.) are decoded to int by
// ParseXxx; composite or optional fields (ShoutModifier "4&name",
// SelfOffset "x&y", OtherCharID "pid^...") stay as strings because they
// carry sub-structure that the AO2 protocol embeds inside a "number" slot.

import (
	"fmt"
	"strconv"
	"strings"
)

// Outgoing is the common interface implemented by every server-outgoing
// packet type. Header() is the AO2 packet header (e.g. "HP", "PV") and
// Args() returns the wire-format field values without the header and
// trailing "#%". The transport adds those.
type Outgoing interface {
	Header() string
	Args() []string
}

// JSONOutgoing is an Outgoing packet whose JSON wire form carries additional
// named fields beyond the classic positional Args(). The classic FantaCode
// path keeps using Args(); JSON-mode clients get the extra fields merged into
// their JSON object via JSONExtra(). Only the MS packet implements it today
// (the multi-pair "additional_chars" list), which is what keeps that data off
// the FantaCode wire entirely.
type JSONOutgoing interface {
	Outgoing
	JSONExtra() map[string]any
}

// ----------------------------------------------------------------------------
// internal helpers
// ----------------------------------------------------------------------------

// getStr returns body[i] or "" if i is out of range.
func getStr(body []string, i int) string {
	if i < len(body) {
		return body[i]
	}
	return ""
}

// parseIntField decodes body[i] as a base-10 int. The name is used in the
// returned error to make handler-level debug logs interpretable.
func parseIntField(body []string, i int, name, hdr string) (int, error) {
	if i >= len(body) {
		return 0, fmt.Errorf("%s: missing field %s", hdr, name)
	}
	v, err := strconv.Atoi(strings.TrimSpace(body[i]))
	if err != nil {
		return 0, fmt.Errorf("%s: field %s: %w", hdr, name, err)
	}
	return v, nil
}

// itoa is a one-letter alias kept local so Args() implementations stay short.
func itoa(n int) string { return strconv.Itoa(n) }

// ============================================================================
// INCOMING — client → server
// ============================================================================

// HI carries the client's HDID (a device fingerprint). The server hashes
// the value before storing it, but the wire field is the raw HDID.
type HI struct {
	HDID string
}

// ParseHI decodes "HI#{hdid}#%".
func ParseHI(body []string) (*HI, error) {
	if len(body) < 1 {
		return nil, fmt.Errorf("HI: missing hdid")
	}
	return &HI{HDID: body[0]}, nil
}

// Header/Args make HI an Outgoing packet (client→server). Wire: HI#{hdid}#%.
func (p *HI) Header() string          { return "HI" }
func (p *HI) Args() []string          { return []string{p.HDID} }

// IDServer is the client-sent ID handshake packet ("ID (Server)" in the
// AO2 docs — receiver=Server). Wire: ID#{software}#{version}#%.
type IDServer struct {
	Software string
	Version  string
}

// ParseIDServer decodes ID#{software}#{version}#%.
func ParseIDServer(body []string) (*IDServer, error) {
	if len(body) < 2 {
		return nil, fmt.Errorf("ID: expected 2 fields, got %d", len(body))
	}
	return &IDServer{Software: body[0], Version: body[1]}, nil
}

// Header/Args make IDServer an Outgoing packet (client→server). Wire: ID#{software}#{version}#%.
func (p *IDServer) Header() string { return "ID" }
func (p *IDServer) Args() []string { return []string{p.Software, p.Version} }

// ParseIDClient decodes the server→client ID form: ID#{player_id}#{software}#{version}#%.
func ParseIDClient(body []string) (*IDClient, error) {
	if len(body) < 3 {
		return nil, fmt.Errorf("ID: expected 3 fields, got %d", len(body))
	}
	pid, err := strconv.Atoi(strings.TrimSpace(body[0]))
	if err != nil {
		return nil, fmt.Errorf("ID: player_id: %w", err)
	}
	return &IDClient{PlayerNumber: pid, Software: body[1], Version: body[2]}, nil
}

// ParsePV decodes the server→client PV form: PV#{player_id}#CID#{char_id}#%.
func ParsePV(body []string) (*PV, error) {
	if len(body) < 3 {
		return nil, fmt.Errorf("PV: expected 3 fields, got %d", len(body))
	}
	pid, err := strconv.Atoi(strings.TrimSpace(body[0]))
	if err != nil {
		return nil, fmt.Errorf("PV: player_id: %w", err)
	}
	cid, err := strconv.Atoi(strings.TrimSpace(body[2]))
	if err != nil {
		return nil, fmt.Errorf("PV: char_id: %w", err)
	}
	return &PV{PlayerID: pid, CharID: cid}, nil
}

// ParseMCToClient decodes the server→client MC form:
// MC#{name}#{char_id}#{showname}#{looping}#{channel}#{effects}#%.
func ParseMCToClient(body []string) (*MCToClient, error) {
	if len(body) < 2 {
		return nil, fmt.Errorf("MC: expected at least 2 fields, got %d", len(body))
	}
	cid, err := strconv.Atoi(strings.TrimSpace(body[1]))
	if err != nil {
		return nil, fmt.Errorf("MC: char_id: %w", err)
	}
	return &MCToClient{
		Name:     getStr(body, 0),
		CharID:   cid,
		Showname: getStr(body, 2),
		Looping:  getStr(body, 3),
		Channel:  getStr(body, 4),
		Effects:  getStr(body, 5),
	}, nil
}

// CC selects a character. Wire: CC#0#{char_id}#{char_pw}#%. The leading
// "0" slot is a protocol relic and is ignored.
type CC struct {
	CharID int
	CharPW string
}

// ParseCC decodes a CC body.
func ParseCC(body []string) (*CC, error) {
	if len(body) < 2 {
		return nil, fmt.Errorf("CC: expected at least 2 fields, got %d", len(body))
	}
	id, err := strconv.Atoi(strings.TrimSpace(body[1]))
	if err != nil {
		return nil, fmt.Errorf("CC: char_id: %w", err)
	}
	pw := ""
	if len(body) > 2 {
		pw = body[2]
	}
	return &CC{CharID: id, CharPW: pw}, nil
}

// Header/Args make CC an Outgoing packet (client→server). Wire: CC#0#{char_id}#{char_pw}#%.
func (p *CC) Header() string { return "CC" }
func (p *CC) Args() []string { return []string{"0", itoa(p.CharID), p.CharPW} }

// MCFromClient is the music-or-area-change packet sent by a client.
// Wire: MC#{songname}#{char_id}#{showname}#{effects}#% (last two optional).
type MCFromClient struct {
	Name     string // song name OR area name (extension presence decides)
	CharID   int
	Showname string // optional
	Effects  string // optional, kept as string because AO2 sends it raw
}

func (p *MCFromClient) Header() string { return "MC" }
func (p *MCFromClient) Args() []string {
	return []string{p.Name, itoa(p.CharID), p.Showname, p.Effects}
}

// ParseMCFromClient decodes a client-side MC body.
func ParseMCFromClient(body []string) (*MCFromClient, error) {
	if len(body) < 2 {
		return nil, fmt.Errorf("MC: expected at least 2 fields, got %d", len(body))
	}
	cid, err := strconv.Atoi(strings.TrimSpace(body[1]))
	if err != nil {
		return nil, fmt.Errorf("MC: char_id: %w", err)
	}
	return &MCFromClient{
		Name:     body[0],
		CharID:   cid,
		Showname: getStr(body, 2),
		Effects:  getStr(body, 3),
	}, nil
}

// HPPacket updates a penalty bar. Bi-directional with the same shape.
// Wire: HP#{bar}#{value}#%.
type HPPacket struct {
	Bar   int
	Value int
}

// ParseHP decodes an HP body.
func ParseHP(body []string) (*HPPacket, error) {
	bar, err := parseIntField(body, 0, "bar", "HP")
	if err != nil {
		return nil, err
	}
	val, err := parseIntField(body, 1, "value", "HP")
	if err != nil {
		return nil, err
	}
	return &HPPacket{Bar: bar, Value: val}, nil
}

// Header / Args make HPPacket an Outgoing.
func (p *HPPacket) Header() string { return "HP" }
func (p *HPPacket) Args() []string { return []string{itoa(p.Bar), itoa(p.Value)} }

// RTPacket plays a WT/CE animation. Bi-directional. Wire: RT#{animation}#%.
//
// Some clients send a second field (e.g. judgeruling#0 vs the variant
// where animation already carries the suffix). We expose it as Variant
// and pass it through if non-empty.
type RTPacket struct {
	Animation string
	Variant   string // optional second field
}

// ParseRT decodes an RT body.
func ParseRT(body []string) (*RTPacket, error) {
	if len(body) < 1 {
		return nil, fmt.Errorf("RT: missing animation")
	}
	return &RTPacket{Animation: body[0], Variant: getStr(body, 1)}, nil
}

// Header / Args make RTPacket an Outgoing.
func (p *RTPacket) Header() string { return "RT" }
func (p *RTPacket) Args() []string {
	if p.Variant != "" {
		return []string{p.Animation, p.Variant}
	}
	return []string{p.Animation}
}

// TTPacket sets the testimony title overlay. Bi-directional. Wire: TT#{type}#{title}#%.
type TTPacket struct {
	Type  string
	Title string
}

func ParseTT(body []string) (*TTPacket, error) {
	if len(body) < 2 {
		return nil, fmt.Errorf("TT: need at least 2 fields")
	}
	return &TTPacket{Type: body[0], Title: body[1]}, nil
}

func (p *TTPacket) Header() string { return "TT" }
func (p *TTPacket) Args() []string { return []string{p.Type, p.Title} }

// CTFromClient is the OOC chat / command packet sent by a client.
// Wire: CT#{name}#{message}#%.
type CTFromClient struct {
	Name    string
	Message string
}

// ParseCTFromClient decodes a client-side CT body.
func ParseCTFromClient(body []string) (*CTFromClient, error) {
	if len(body) < 2 {
		return nil, fmt.Errorf("CT: expected 2 fields, got %d", len(body))
	}
	return &CTFromClient{Name: body[0], Message: body[1]}, nil
}

// PE adds an evidence item. Wire: PE#{name}#{description}#{image}#%.
type PE struct {
	Name        string
	Description string
	Image       string
}

// ParsePE decodes a PE body.
func ParsePE(body []string) (*PE, error) {
	if len(body) < 3 {
		return nil, fmt.Errorf("PE: expected 3 fields, got %d", len(body))
	}
	return &PE{Name: body[0], Description: body[1], Image: body[2]}, nil
}

// DE removes an evidence item. Wire: DE#{id}#%.
type DE struct {
	ID int
}

// ParseDE decodes a DE body.
func ParseDE(body []string) (*DE, error) {
	id, err := parseIntField(body, 0, "id", "DE")
	if err != nil {
		return nil, err
	}
	return &DE{ID: id}, nil
}

// EE edits an evidence item. Wire: EE#{id}#{name}#{description}#{image}#%.
type EE struct {
	ID          int
	Name        string
	Description string
	Image       string
}

// ParseEE decodes an EE body.
func ParseEE(body []string) (*EE, error) {
	if len(body) < 4 {
		return nil, fmt.Errorf("EE: expected 4 fields, got %d", len(body))
	}
	id, err := strconv.Atoi(strings.TrimSpace(body[0]))
	if err != nil {
		return nil, fmt.Errorf("EE: id: %w", err)
	}
	return &EE{ID: id, Name: body[1], Description: body[2], Image: body[3]}, nil
}

// ZZ is the modcall packet. Bi-directional; reason is optional from the
// client. Wire: ZZ#{reason}#%.
type ZZ struct {
	Reason string
}

// ParseZZ decodes a ZZ body (reason is optional).
func ParseZZ(body []string) (*ZZ, error) {
	return &ZZ{Reason: getStr(body, 0)}, nil
}

// Header / Args make ZZ an Outgoing.
func (p *ZZ) Header() string { return "ZZ" }
func (p *ZZ) Args() []string { return []string{p.Reason} }

// SETCASE indicates which case roles the player is willing to fill.
// Wire: SETCASE#{caselist}#{cm}#{def}#{pro}#{judge}#{jury}#{steno}#%.
type SETCASE struct {
	Caselist string
	CM       string // "0"/"1"
	Def      string
	Pro      string
	Judge    string
	Jury     string
	Steno    string
}

// ParseSETCASE decodes a SETCASE body.
func ParseSETCASE(body []string) (*SETCASE, error) {
	if len(body) < 7 {
		return nil, fmt.Errorf("SETCASE: expected 7 fields, got %d", len(body))
	}
	return &SETCASE{
		Caselist: body[0], CM: body[1], Def: body[2], Pro: body[3],
		Judge: body[4], Jury: body[5], Steno: body[6],
	}, nil
}

// CASEA is the case-announcement packet. Bi-directional.
// Wire: CASEA#{case_title}#{need_def}#{need_pro}#{need_judge}#{need_jury}#{need_steno}#%.
type CASEA struct {
	CaseTitle string
	NeedDef   string
	NeedPro   string
	NeedJudge string
	NeedJury  string
	NeedSteno string
}

// ParseCASEA decodes a CASEA body.
func ParseCASEA(body []string) (*CASEA, error) {
	if len(body) < 6 {
		return nil, fmt.Errorf("CASEA: expected 6 fields, got %d", len(body))
	}
	return &CASEA{
		CaseTitle: body[0], NeedDef: body[1], NeedPro: body[2],
		NeedJudge: body[3], NeedJury: body[4], NeedSteno: body[5],
	}, nil
}

// VSFrame carries a base64-encoded Opus frame from a speaking client.
// Wire: VS_FRAME#{b64_opus}#%.
type VSFrame struct {
	Payload string
}

// ParseVSFrame decodes a VS_FRAME body.
func ParseVSFrame(body []string) (*VSFrame, error) {
	if len(body) < 1 {
		return nil, fmt.Errorf("VS_FRAME: missing payload")
	}
	return &VSFrame{Payload: body[0]}, nil
}

// VSSpeak signals the client's start/stop talking state.
// Wire (from client): VS_SPEAK#{on_off}#%.
type VSSpeak struct {
	On bool
}

// ParseVSSpeak decodes a client-side VS_SPEAK body. The wire form is "0"
// or "1"; anything else is treated as off.
func ParseVSSpeak(body []string) (*VSSpeak, error) {
	if len(body) < 1 {
		return nil, fmt.Errorf("VS_SPEAK: missing state")
	}
	return &VSSpeak{On: strings.TrimSpace(body[0]) == "1"}, nil
}

// ============================================================================
// OUTGOING — server → client
// ============================================================================

// IDClient is the server-sent ID handshake. Wire: ID#{player_number}#{software}#{version}#%.
// (Doc calls this "ID (Client)" because receiver=Client.)
type IDClient struct {
	PlayerNumber int
	Software     string
	Version      string
}

func (p *IDClient) Header() string { return "ID" }
func (p *IDClient) Args() []string { return []string{itoa(p.PlayerNumber), p.Software, p.Version} }

// PN is the player-count packet. Wire: PN#{players}#{max}#{server_description}#%.
type PN struct {
	PlayerCount       int
	MaxPlayers        int
	ServerDescription string
}

func (p *PN) Header() string { return "PN" }
func (p *PN) Args() []string {
	return []string{itoa(p.PlayerCount), itoa(p.MaxPlayers), p.ServerDescription}
}

// FL declares supported features. Wire: FL#{f1}#{f2}#...#%.
type FL struct {
	Features []string
}

func (p *FL) Header() string { return "FL" }
func (p *FL) Args() []string { return p.Features }

// ASS gives the WebAO asset URL. Wire: ASS#{asset_url}#%.
type ASS struct {
	AssetURL string
}

func (p *ASS) Header() string { return "ASS" }
func (p *ASS) Args() []string { return []string{p.AssetURL} }

// SI is sent in response to askchaa. Wire: SI#{char_cnt}#{evi_cnt}#{mus_cnt}#%.
type SI struct {
	CharCount     int
	EvidenceCount int
	MusicCount    int
}

func (p *SI) Header() string { return "SI" }
func (p *SI) Args() []string {
	return []string{itoa(p.CharCount), itoa(p.EvidenceCount), itoa(p.MusicCount)}
}

// SC sends the character list. Each entry is already pre-joined as
// "name&desc&evidence". Wire: SC#{entry1}#{entry2}#...#%.
type SC struct {
	Entries []string
}

func (p *SC) Header() string { return "SC" }
func (p *SC) Args() []string { return p.Entries }

// SM sends the music+area list. Wire: SM#{name1}#{name2}#...#%.
type SM struct {
	Items []string
}

func (p *SM) Header() string { return "SM" }
func (p *SM) Args() []string { return p.Items }

// DONE marks the end of the joining process. Wire: DONE#%.
type DONE struct{}

func (p *DONE) Header() string { return "DONE" }
func (p *DONE) Args() []string { return nil }

// CHECK is the ping reply. Wire: CHECK#%.
type CHECK struct{}

func (p *CHECK) Header() string { return "CHECK" }
func (p *CHECK) Args() []string { return nil }

// BN sets the background. Wire: BN#{background}#{position}#%.
type BN struct {
	Background string
	Position   string // optional
}

func (p *BN) Header() string { return "BN" }
func (p *BN) Args() []string {
	if p.Position != "" {
		return []string{p.Background, p.Position}
	}
	return []string{p.Background}
}

// ARUPType enumerates the four ARUP sub-packets.
type ARUPType int

const (
	ARUPPlayerCounts ARUPType = 0
	ARUPStatuses     ARUPType = 1
	ARUPCMs          ARUPType = 2
	ARUPLocks        ARUPType = 3
)

// ARUP is the all-areas-update packet. Wire: ARUP#{type}#{v1}#{v2}#...#%.
// The Data slice contains the per-area values; their semantic depends on
// Type (int counts for Type=0, status/CM/lock strings for Type=1..3).
type ARUP struct {
	Type ARUPType
	Data []string
}

func (p *ARUP) Header() string { return "ARUP" }
func (p *ARUP) Args() []string {
	out := make([]string, 0, 1+len(p.Data))
	out = append(out, itoa(int(p.Type)))
	out = append(out, p.Data...)
	return out
}

// CharsCheck reports which characters are taken. Each entry is "-1"
// (taken) or "0" (free). Wire: CharsCheck#{e0}#{e1}#...#%.
type CharsCheck struct {
	Entries []string
}

func (p *CharsCheck) Header() string { return "CharsCheck" }
func (p *CharsCheck) Args() []string { return p.Entries }

// CTToClient is the server-form OOC chat packet. Wire: CT#{name}#{message}#{is_from_server}#%.
type CTToClient struct {
	Name         string
	Message      string
	IsFromServer string // "0" or "1"
}

func (p *CTToClient) Header() string { return "CT" }
func (p *CTToClient) Args() []string { return []string{p.Name, p.Message, p.IsFromServer} }

// PR adds or removes a player from the player list. Wire: PR#{id}#{type}#%.
type PR struct {
	ID   int
	Type int // 0=add, 1=remove
}

func (p *PR) Header() string { return "PR" }
func (p *PR) Args() []string { return []string{itoa(p.ID), itoa(p.Type)} }

// PU updates a player-list field. Wire: PU#{id}#{type}#{data}#%.
//
// Type values: 0=OOC name, 1=character name, 2=showname, 3=area id,
// 4=IPID. Type 4 is never sent via a broadcast-to-everyone helper — the
// server only emits it to individual recipients it has itself verified hold
// the BAN_INFO permission (see broadcastIPIDToMods / sendModIPIDsToClient in
// internal/athena), mirroring the same per-viewer gate /gas already uses for
// its own IPID reveal. Every other type is public and broadcast to all.
type PU struct {
	ID   int
	Type int
	Data string
}

func (p *PU) Header() string { return "PU" }
func (p *PU) Args() []string { return []string{itoa(p.ID), itoa(p.Type), p.Data} }

// PV hides char select and forces a character choice on the client.
// Wire: PV#{player_id}#CID#{char_id}#%. PlayerID is always 0 in practice.
type PV struct {
	PlayerID int
	CharID   int
}

func (p *PV) Header() string { return "PV" }
func (p *PV) Args() []string { return []string{itoa(p.PlayerID), "CID", itoa(p.CharID)} }

// MCToClient is the server-form MC packet. Wire: MC#{songname}#{char_id}#{showname}#{looping}#{channel}#{effects}#%.
type MCToClient struct {
	Name     string
	CharID   int
	Showname string
	Looping  string
	Channel  string
	Effects  string
}

func (p *MCToClient) Header() string { return "MC" }
func (p *MCToClient) Args() []string {
	// Looping, Channel and Effects are numeric fields on the wire. AO2 clients
	// fail to parse the MC packet when any of them is empty (it renders as a
	// bare "##", e.g. "MC#url#1##1#0##%"), and the music change is dropped
	// silently. Default the empty form to "0" here — the single serialization
	// point — so no caller can emit a malformed packet.
	looping, channel, effects := p.Looping, p.Channel, p.Effects
	if looping == "" {
		looping = "0"
	}
	if channel == "" {
		channel = "0"
	}
	if effects == "" {
		effects = "0"
	}
	return []string{p.Name, itoa(p.CharID), p.Showname, looping, channel, effects}
}

// KK is the kick packet. Wire: KK#{reason}#%.
type KK struct {
	Reason string
}

func (p *KK) Header() string { return "KK" }
func (p *KK) Args() []string { return []string{p.Reason} }

// KB notifies a banned client. Wire: KB#{reason}#%.
type KB struct {
	Reason string
}

func (p *KB) Header() string { return "KB" }
func (p *KB) Args() []string { return []string{p.Reason} }

// BD blocks a join. Wire: BD#{reason}#%.
type BD struct {
	Reason string
}

func (p *BD) Header() string { return "BD" }
func (p *BD) Args() []string { return []string{p.Reason} }

// BB shows a popup. Wire: BB#{message}#%.
type BB struct {
	Message string
}

func (p *BB) Header() string { return "BB" }
func (p *BB) Args() []string { return []string{p.Message} }

// AUTH announces login state. Wire: AUTH#{auth_state}#%. State: -1, 0, 1.
type AUTH struct {
	State int
}

func (p *AUTH) Header() string { return "AUTH" }
func (p *AUTH) Args() []string { return []string{itoa(p.State)} }

// JD shows/hides judge controls. Wire: JD#{state}#%.
type JD struct {
	State int
}

func (p *JD) Header() string { return "JD" }
func (p *JD) Args() []string { return []string{itoa(p.State)} }

// LE sends the evidence list. Each Item is already pre-joined as
// "name&description&image" because the evidence subsystem stores entries
// in that form. Wire: LE#{e1}#{e2}#...#%.
type LE struct {
	Items []string
}

func (p *LE) Header() string { return "LE" }
func (p *LE) Args() []string { return p.Items }

// MA reports moderator action. Wire: MA#{id}#{duration}#{reason}#%.
type MA struct {
	ID       int
	Duration int
	Reason   string
}

func (p *MA) Header() string { return "MA" }
func (p *MA) Args() []string { return []string{itoa(p.ID), itoa(p.Duration), p.Reason} }

// SP sets the position dropdown. Wire: SP#{side}#%.
type SP struct {
	Side string
}

func (p *SP) Header() string { return "SP" }
func (p *SP) Args() []string { return []string{p.Side} }

// SD overrides the position dropdown with a list. Note the '*' separator —
// the list is joined into a SINGLE wire field. Wire: SD#{s1*s2*...}#%.
type SD struct {
	Sides []string
}

func (p *SD) Header() string { return "SD" }
func (p *SD) Args() []string { return []string{strings.Join(p.Sides, "*")} }

// ST switches the client subtheme. Wire: ST#{subtheme_name}#{should_reload}#%.
type ST struct {
	SubthemeName string
	ShouldReload int
}

func (p *ST) Header() string { return "ST" }
func (p *ST) Args() []string { return []string{p.SubthemeName, itoa(p.ShouldReload)} }

// TI manipulates a UI timer. Wire: TI#{timer_id}#{command}#{time}#%.
type TI struct {
	TimerID int
	Command int
	TimeMs  int
}

func (p *TI) Header() string { return "TI" }
func (p *TI) Args() []string { return []string{itoa(p.TimerID), itoa(p.Command), itoa(p.TimeMs)} }

// FA sends the area list. Wire: FA#{a1}#{a2}#...#%.
type FA struct {
	Areas []string
}

func (p *FA) Header() string { return "FA" }
func (p *FA) Args() []string { return p.Areas }

// FM sends the music list (no areas, unlike SM). Wire: FM#{m1}#{m2}#...#%.
type FM struct {
	Items []string
}

func (p *FM) Header() string { return "FM" }
func (p *FM) Args() []string { return p.Items }

// CASEAOut makes CASEA implement Outgoing for the broadcast direction.
// (It's bidirectional; the same struct round-trips.)
func (p *CASEA) Header() string { return "CASEA" }
func (p *CASEA) Args() []string {
	return []string{p.CaseTitle, p.NeedDef, p.NeedPro, p.NeedJudge, p.NeedJury, p.NeedSteno}
}

// MSOutgoing wraps an MSPacket to satisfy Outgoing. The wire encode is
// the existing ServerArgs(). Keeping the wrapper means callers don't need
// to remember which method to call.
func (ms *MSPacket) Header() string { return "MS" }
func (ms *MSPacket) Args() []string { return ms.ServerArgs() }

// ============================================================================
// VOICE — Athena extension (not in upstream AO2 docs)
// ============================================================================
//
// Protocol summary (from CLAUDE.md / internal/athena/voice.go):
//
//   VS_CAPS#<enabled>#<ptt>#<max_peers>#<codec>#<sample_rate>#<frame_ms>#<max_frame_bytes>#%
//   VS_JOIN — C→S (no fields); S→peers (uid joined)
//   VS_LEAVE — same shape as VS_JOIN, but for leaves
//   VS_PEERS#<csv_uids>#%
//   VS_FRAME — C→S (b64 opus)
//   VS_AUDIO#<from_uid>#<b64>#% — S→peers
//   VS_SPEAK#<uid>#<on_off>#% — S→peers (C→S form has only on_off; see VSSpeak above)

// VSCaps advertises voice-chat capability to a client.
type VSCaps struct {
	Enabled       string // "0"/"1"
	PTT           string // "0"/"1"
	MaxPeers      string
	Codec         string
	SampleRate    int
	FrameMs       int
	MaxFrameBytes int
}

func (p *VSCaps) Header() string { return "VS_CAPS" }
func (p *VSCaps) Args() []string {
	return []string{p.Enabled, p.PTT, p.MaxPeers, p.Codec, itoa(p.SampleRate), itoa(p.FrameMs), itoa(p.MaxFrameBytes)}
}

// VSPeers gives a joining client the existing peer set as a comma-separated
// list. Wire: VS_PEERS#{csv_uids}#%.
type VSPeers struct {
	UIDs []int
}

func (p *VSPeers) Header() string { return "VS_PEERS" }
func (p *VSPeers) Args() []string {
	parts := make([]string, 0, len(p.UIDs))
	for _, u := range p.UIDs {
		parts = append(parts, itoa(u))
	}
	return []string{strings.Join(parts, ",")}
}

// VSJoinOut announces "uid joined the room" to existing peers.
// Wire (S→C): VS_JOIN#{uid}#%.
type VSJoinOut struct {
	UID int
}

func (p *VSJoinOut) Header() string { return "VS_JOIN" }
func (p *VSJoinOut) Args() []string { return []string{itoa(p.UID)} }

// VSLeaveOut announces "uid left the room" to remaining peers.
// Wire (S→C): VS_LEAVE#{uid}#%.
type VSLeaveOut struct {
	UID int
}

func (p *VSLeaveOut) Header() string { return "VS_LEAVE" }
func (p *VSLeaveOut) Args() []string { return []string{itoa(p.UID)} }

// VSAudio fans out a single Opus frame to peers.
// Wire: VS_AUDIO#{from_uid}#{b64}#%.
type VSAudio struct {
	FromUID int
	Payload string
}

func (p *VSAudio) Header() string { return "VS_AUDIO" }
func (p *VSAudio) Args() []string { return []string{itoa(p.FromUID), p.Payload} }

// VSSpeakOut fans out the speaking indicator. Wire: VS_SPEAK#{uid}#{on_off}#%.
type VSSpeakOut struct {
	UID int
	On  string // "0"/"1"
}

func (p *VSSpeakOut) Header() string { return "VS_SPEAK" }
func (p *VSSpeakOut) Args() []string { return []string{itoa(p.UID), p.On} }

// ============================================================================
// FantaCrypt relic
// ============================================================================

// Decryptor is the FantaCrypt-era "decryptor" packet sent at the very
// start of the handshake. The encryption layer it once gated is dead, but
// the header is still useful as a server-capability signal: the payload
// "JSON" advertises that the server understands JSON-encoded packets.
// Clients that recognise it switch to JSON; older clients ignore the value
// and continue in classic FantaCode, exactly as if the relic still read
// "NOENCRYPT". The per-client decision is made in HandleClient based on
// whether the first inbound packet starts with '{'.
type Decryptor struct{}

func (p *Decryptor) Header() string { return "decryptor" }
func (p *Decryptor) Args() []string { return []string{"JSON"} }
