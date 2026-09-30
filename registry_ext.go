package aolib

// Hand-written decoders for packets the codegen does not emit (the MS packet,
// which carries Nyathena extensions, and the Athena-only TT/SETCASE/CASEA).
// These are merged into the generated registry at init.

func init() {
	c2sDecoders["MS"] = func(b []string) (any, error) { return ParseMSToServer(b) }
	c2sDecoders["TT"] = func(b []string) (any, error) { return ParseTT(b) }
	c2sDecoders["SETCASE"] = func(b []string) (any, error) { return ParseSETCASE(b) }
	c2sDecoders["CASEA"] = func(b []string) (any, error) { return ParseCASEA(b) }
	s2cDecoders["MS"] = func(b []string) (any, error) { return ParseMSToClient(b) }
	// FL is bidirectional in Nyathena (the client advertises its own feature
	// list for the multi-pair handshake); canonical aolib-meta marks it s2c
	// only, so register the client->server direction here.
	c2sDecoders["FL"] = func(b []string) (any, error) { return ParseFL(b) }
}
