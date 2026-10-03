    // AUTO-GENERATED from spec. Do not edit; run aolib-gen.
    void SendARUP(const ARUP& p) { core()->send(p); }
    void SendASS(const ASS& p) { core()->send(p); }
    void SendAUTH(const AUTH& p) { core()->send(p); }
    void SendBB(const BB& p) { core()->send(p); }
    void SendBD(const BD& p) { core()->send(p); }
    void SendBN(const BN& p) { core()->send(p); }
    void SendCASEA(const CASEAToClient& p) { core()->send(p); }
    void OnCASEA(std::function<void(const CASEAToServer&)> h) { core()->on("CASEA", [h](std::any a) { auto sp = std::any_cast<std::shared_ptr<Outgoing>>(a); h(*std::dynamic_pointer_cast<CASEAToServer>(sp)); }); }
    void OnCC(std::function<void(const CC&)> h) { core()->on("CC", [h](std::any a) { auto sp = std::any_cast<std::shared_ptr<Outgoing>>(a); h(*std::dynamic_pointer_cast<CC>(sp)); }); }
    void OnCH(std::function<void(const CH&)> h) { core()->on("CH", [h](std::any a) { auto sp = std::any_cast<std::shared_ptr<Outgoing>>(a); h(*std::dynamic_pointer_cast<CH>(sp)); }); }
    void SendCHECK(const CHECK& p) { core()->send(p); }
    void SendCI(const CI& p) { core()->send(p); }
    void SendCT(const CTToClient& p) { core()->send(p); }
    void OnCT(std::function<void(const CTToServer&)> h) { core()->on("CT", [h](std::any a) { auto sp = std::any_cast<std::shared_ptr<Outgoing>>(a); h(*std::dynamic_pointer_cast<CTToServer>(sp)); }); }
    void SendCharsCheck(const CharsCheck& p) { core()->send(p); }
    void OnDE(std::function<void(const DE&)> h) { core()->on("DE", [h](std::any a) { auto sp = std::any_cast<std::shared_ptr<Outgoing>>(a); h(*std::dynamic_pointer_cast<DE>(sp)); }); }
    void SendDONE(const DONE& p) { core()->send(p); }
    void OnEE(std::function<void(const EE&)> h) { core()->on("EE", [h](std::any a) { auto sp = std::any_cast<std::shared_ptr<Outgoing>>(a); h(*std::dynamic_pointer_cast<EE>(sp)); }); }
    void SendEI(const EI& p) { core()->send(p); }
    void SendEM(const EM& p) { core()->send(p); }
    void SendFA(const FA& p) { core()->send(p); }
    void SendFL(const FL& p) { core()->send(p); }
    void SendFM(const FM& p) { core()->send(p); }
    void OnHI(std::function<void(const HI&)> h) { core()->on("HI", [h](std::any a) { auto sp = std::any_cast<std::shared_ptr<Outgoing>>(a); h(*std::dynamic_pointer_cast<HI>(sp)); }); }
    void SendHP(const HPToClient& p) { core()->send(p); }
    void OnHP(std::function<void(const HPToServer&)> h) { core()->on("HP", [h](std::any a) { auto sp = std::any_cast<std::shared_ptr<Outgoing>>(a); h(*std::dynamic_pointer_cast<HPToServer>(sp)); }); }
    void SendID(const IDToClient& p) { core()->send(p); }
    void OnID(std::function<void(const IDToServer&)> h) { core()->on("ID", [h](std::any a) { auto sp = std::any_cast<std::shared_ptr<Outgoing>>(a); h(*std::dynamic_pointer_cast<IDToServer>(sp)); }); }
    void SendJD(const JD& p) { core()->send(p); }
    void SendKB(const KB& p) { core()->send(p); }
    void SendKK(const KK& p) { core()->send(p); }
    void SendLE(const LE& p) { core()->send(p); }
    void OnMA(std::function<void(const MA&)> h) { core()->on("MA", [h](std::any a) { auto sp = std::any_cast<std::shared_ptr<Outgoing>>(a); h(*std::dynamic_pointer_cast<MA>(sp)); }); }
    void SendMC(const MCToClient& p) { core()->send(p); }
    void OnMC(std::function<void(const MCToServer&)> h) { core()->on("MC", [h](std::any a) { auto sp = std::any_cast<std::shared_ptr<Outgoing>>(a); h(*std::dynamic_pointer_cast<MCToServer>(sp)); }); }
    void SendMS(const MSToClient& p) { core()->send(p); }
    void OnMS(std::function<void(const MSToServer&)> h) { core()->on("MS", [h](std::any a) { auto sp = std::any_cast<std::shared_ptr<Outgoing>>(a); h(*std::dynamic_pointer_cast<MSToServer>(sp)); }); }
    void OnPE(std::function<void(const PE&)> h) { core()->on("PE", [h](std::any a) { auto sp = std::any_cast<std::shared_ptr<Outgoing>>(a); h(*std::dynamic_pointer_cast<PE>(sp)); }); }
    void SendPN(const PN& p) { core()->send(p); }
    void SendPR(const PR& p) { core()->send(p); }
    void SendPU(const PU& p) { core()->send(p); }
    void SendPV(const PV& p) { core()->send(p); }
    void OnRC(std::function<void(const RC&)> h) { core()->on("RC", [h](std::any a) { auto sp = std::any_cast<std::shared_ptr<Outgoing>>(a); h(*std::dynamic_pointer_cast<RC>(sp)); }); }
    void OnRD(std::function<void(const RD&)> h) { core()->on("RD", [h](std::any a) { auto sp = std::any_cast<std::shared_ptr<Outgoing>>(a); h(*std::dynamic_pointer_cast<RD>(sp)); }); }
    void OnRM(std::function<void(const RM&)> h) { core()->on("RM", [h](std::any a) { auto sp = std::any_cast<std::shared_ptr<Outgoing>>(a); h(*std::dynamic_pointer_cast<RM>(sp)); }); }
    void SendRMC(const RMC& p) { core()->send(p); }
    void SendRT(const RTToClient& p) { core()->send(p); }
    void OnRT(std::function<void(const RTToServer&)> h) { core()->on("RT", [h](std::any a) { auto sp = std::any_cast<std::shared_ptr<Outgoing>>(a); h(*std::dynamic_pointer_cast<RTToServer>(sp)); }); }
    void SendSC(const SC& p) { core()->send(p); }
    void OnSETCASE(std::function<void(const SETCASE&)> h) { core()->on("SETCASE", [h](std::any a) { auto sp = std::any_cast<std::shared_ptr<Outgoing>>(a); h(*std::dynamic_pointer_cast<SETCASE>(sp)); }); }
    void SendSI(const SI& p) { core()->send(p); }
    void SendSM(const SM& p) { core()->send(p); }
    void SendSP(const SP& p) { core()->send(p); }
    void SendST(const ST& p) { core()->send(p); }
    void SendTI(const TI& p) { core()->send(p); }
    void SendZZ(const ZZToClient& p) { core()->send(p); }
    void OnZZ(std::function<void(const ZZToServer&)> h) { core()->on("ZZ", [h](std::any a) { auto sp = std::any_cast<std::shared_ptr<Outgoing>>(a); h(*std::dynamic_pointer_cast<ZZToServer>(sp)); }); }
    void OnAskchaa(std::function<void(const askchaa&)> h) { core()->on("askchaa", [h](std::any a) { auto sp = std::any_cast<std::shared_ptr<Outgoing>>(a); h(*std::dynamic_pointer_cast<askchaa>(sp)); }); }
    void SendDecryptor(const decryptor& p) { core()->send(p); }
