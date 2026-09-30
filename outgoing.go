package aolib

// Outgoing is the common interface implemented by every packet type.
// Header() is the AO2 packet header (e.g. "HP", "PV") and Args() returns the
// wire-format field values without the header and trailing "#%". The transport
// adds those.
type Outgoing interface {
	Header() string
	Args() []string
}

// JSONOutgoing is an Outgoing packet whose JSON wire form carries additional
// named fields beyond the classic positional Args(). Only the MS packet
// implements it today (the multi-pair "additional_chars" list).
type JSONOutgoing interface {
	Outgoing
	JSONExtra() map[string]any
}
