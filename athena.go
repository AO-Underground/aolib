package aolib

// Athena/Nyathena-only packets that have no canonical aolib-meta schema. Kept
// hand-written alongside the generated packets.

// TTPacket sets the testimony title overlay. Wire: TT#{type}#{title}#%.
type TTPacket struct {
	Type  string
	Title string
}

func (p *TTPacket) Header() string { return "TT" }
func (p *TTPacket) Args() []string { return []string{escapeFanta(p.Type), escapeFanta(p.Title)} }

// ParseTT decodes a TT body.
func ParseTT(body []string) (*TTPacket, error) {
	return &TTPacket{Type: unescapeFanta(getStr(body, 0)), Title: unescapeFanta(getStr(body, 1))}, nil
}

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
	get := func(i int) string { return unescapeFanta(getStr(body, i)) }
	return &SETCASE{
		Caselist: get(0), CM: get(1), Def: get(2), Pro: get(3),
		Judge: get(4), Jury: get(5), Steno: get(6),
	}, nil
}

// CASEA is the case-announcement packet.
// Wire: CASEA#{case_title}#{need_def}#{need_pro}#{need_judge}#{need_jury}#{need_steno}#%.
type CASEA struct {
	CaseTitle string
	NeedDef   string
	NeedPro   string
	NeedJudge string
	NeedJury  string
	NeedSteno string
}

func (p *CASEA) Header() string { return "CASEA" }
func (p *CASEA) Args() []string {
	return []string{
		escapeFanta(p.CaseTitle), p.NeedDef, p.NeedPro,
		p.NeedJudge, p.NeedJury, p.NeedSteno,
	}
}

// ParseCASEA decodes a CASEA body.
func ParseCASEA(body []string) (*CASEA, error) {
	get := func(i int) string { return unescapeFanta(getStr(body, i)) }
	return &CASEA{
		CaseTitle: get(0), NeedDef: get(1), NeedPro: get(2),
		NeedJudge: get(3), NeedJury: get(4), NeedSteno: get(5),
	}, nil
}
