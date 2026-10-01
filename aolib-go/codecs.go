package aolib

import (
	"encoding/json"
	"fmt"
	"strconv"
)

// Hand-written wire forms for x-fanta-codec packets; see spec/packets/CODECS.md.

// ARUP.UpdateData holds player counts as decimal strings; JSON carries them as numbers.

func (p *ARUP) Args() []string {
	args := []string{itoa(areaUpdateTypeToWire[p.UpdateType])}
	for _, v := range p.UpdateData {
		if p.UpdateType != AreaUpdateTypePlayerCount {
			v = escapeFanta(v)
		}
		args = append(args, v)
	}
	return args
}

func ParseARUP(body []string) (*ARUP, error) {
	p := &ARUP{UpdateType: AreaUpdateTypePlayerCount, UpdateData: []string{}}
	if len(body) == 0 {
		return p, nil
	}
	t, ok := areaUpdateTypeFromWire[atoiOrZero(body[0])]
	if !ok {
		return nil, fmt.Errorf("ARUP: unknown update_type wire value %q", body[0])
	}
	p.UpdateType = t
	for _, v := range body[1:] {
		if t == AreaUpdateTypePlayerCount {
			v = itoa(atoiOrZero(v))
		} else {
			v = unescapeFanta(v)
		}
		p.UpdateData = append(p.UpdateData, v)
	}
	return p, nil
}

func (p ARUP) MarshalJSON() ([]byte, error) {
	data := make([]any, len(p.UpdateData))
	for i, v := range p.UpdateData {
		data[i] = v
		if p.UpdateType == AreaUpdateTypePlayerCount {
			n, err := strconv.Atoi(v)
			if err != nil {
				return nil, fmt.Errorf("ARUP: player count %q is not an integer", v)
			}
			data[i] = n
		}
	}
	return json.Marshal(struct {
		UpdateType AreaUpdateType `json:"update_type"`
		UpdateData []any          `json:"update_data"`
	}{p.UpdateType, data})
}

func (p *ARUP) UnmarshalJSON(raw []byte) error {
	var in struct {
		UpdateType AreaUpdateType    `json:"update_type"`
		UpdateData []json.RawMessage `json:"update_data"`
	}
	if err := json.Unmarshal(raw, &in); err != nil {
		return err
	}
	if _, ok := areaUpdateTypeToWire[in.UpdateType]; !ok {
		return fmt.Errorf("ARUP: unknown update_type %q", in.UpdateType)
	}
	p.UpdateType = in.UpdateType
	p.UpdateData = make([]string, len(in.UpdateData))
	for i, item := range in.UpdateData {
		var s string
		if err := json.Unmarshal(item, &s); err == nil {
			p.UpdateData[i] = s
			continue
		}
		var n int
		if err := json.Unmarshal(item, &n); err != nil {
			return fmt.Errorf("ARUP: update_data[%d] is neither integer nor string", i)
		}
		p.UpdateData[i] = itoa(n)
	}
	return nil
}

var rtAnimationToWire = map[RTAnimation][]string{
	RTAnimationWitnessTestimony: {"testimony1", "0"},
	RTAnimationEndAnimation:     {"testimony1", "1"},
	RTAnimationCrossExamination: {"testimony2", "0"},
	RTAnimationNotGuilty:        {"judgeruling", "0"},
	RTAnimationGuilty:           {"judgeruling", "1"},
}

func rtArgs(animation RTAnimation, name string) []string {
	if animation == RTAnimationCustom {
		return []string{escapeFanta(name)}
	}
	return append([]string(nil), rtAnimationToWire[animation]...)
}

func parseRT(body []string) (RTAnimation, string, error) {
	get := func(i int) string {
		if i < len(body) {
			return body[i]
		}
		return ""
	}
	variant := atoiOrZero(get(1))
	switch name := get(0); name {
	case "":
		return "", "", fmt.Errorf("RT: empty animation slot")
	case "testimony1":
		if variant == 1 {
			return RTAnimationEndAnimation, "", nil
		}
		return RTAnimationWitnessTestimony, "", nil
	case "testimony2":
		return RTAnimationCrossExamination, "", nil
	case "judgeruling":
		switch variant {
		case 0:
			return RTAnimationNotGuilty, "", nil
		case 1:
			return RTAnimationGuilty, "", nil
		}
		return "", "", fmt.Errorf("RT: unknown judgeruling variant %q", get(1))
	default:
		return RTAnimationCustom, unescapeFanta(name), nil
	}
}

func (p *RTToServer) Args() []string { return rtArgs(p.Animation, p.Name) }
func (p *RTToClient) Args() []string { return rtArgs(p.Animation, p.Name) }

func ParseRTToServer(body []string) (*RTToServer, error) {
	a, n, err := parseRT(body)
	if err != nil {
		return nil, err
	}
	return &RTToServer{Animation: a, Name: n}, nil
}

func ParseRTToClient(body []string) (*RTToClient, error) {
	a, n, err := parseRT(body)
	if err != nil {
		return nil, err
	}
	return &RTToClient{Animation: a, Name: n}, nil
}
