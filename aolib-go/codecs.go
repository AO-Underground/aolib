package aolib

import "fmt"

// Hand-written wire forms for x-fanta-codec packets; see spec/packets/CODECS.md.

func (p *ARUP) Args() []string {
	args := []string{itoa(areaUpdateTypeToWire[p.UpdateType])}
	return append(args, p.UpdateData...)
}

func ParseARUP(body []string) (*ARUP, error) {
	p := &ARUP{}
	if len(body) > 0 {
		p.UpdateType = areaUpdateTypeFromWire[atoiOrZero(body[0])]
		p.UpdateData = body[1:]
	} else {
		p.UpdateType = areaUpdateTypeFromWire[0]
	}
	return p, nil
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

// parseRT mirrors AO2-Client's handle_wtce.
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
