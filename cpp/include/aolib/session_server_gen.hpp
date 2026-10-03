    // AUTO-GENERATED from spec. Do not edit; run aolib-gen.
    void OnARUP(std::function<void(const ARUP&)> h) { core()->on("ARUP", [h](std::any a) { auto sp = std::any_cast<std::shared_ptr<Outgoing>>(a); h(*std::dynamic_pointer_cast<ARUP>(sp)); }); }
    void OnASS(std::function<void(const ASS&)> h) { core()->on("ASS", [h](std::any a) { auto sp = std::any_cast<std::shared_ptr<Outgoing>>(a); h(*std::dynamic_pointer_cast<ASS>(sp)); }); }
    void OnAUTH(std::function<void(const AUTH&)> h) { core()->on("AUTH", [h](std::any a) { auto sp = std::any_cast<std::shared_ptr<Outgoing>>(a); h(*std::dynamic_pointer_cast<AUTH>(sp)); }); }
    void OnBB(std::function<void(const BB&)> h) { core()->on("BB", [h](std::any a) { auto sp = std::any_cast<std::shared_ptr<Outgoing>>(a); h(*std::dynamic_pointer_cast<BB>(sp)); }); }
    void OnBD(std::function<void(const BD&)> h) { core()->on("BD", [h](std::any a) { auto sp = std::any_cast<std::shared_ptr<Outgoing>>(a); h(*std::dynamic_pointer_cast<BD>(sp)); }); }
    void OnBN(std::function<void(const BN&)> h) { core()->on("BN", [h](std::any a) { auto sp = std::any_cast<std::shared_ptr<Outgoing>>(a); h(*std::dynamic_pointer_cast<BN>(sp)); }); }
    void OnCASEA(std::function<void(const CASEAToClient&)> h) { core()->on("CASEA", [h](std::any a) { auto sp = std::any_cast<std::shared_ptr<Outgoing>>(a); h(*std::dynamic_pointer_cast<CASEAToClient>(sp)); }); }
    void SendCASEA(const CASEAToServer& p) { core()->send(p); }
    void SendCC(const CC& p) { core()->send(p); }
    void SendCH(const CH& p) { core()->send(p); }
    void OnCHECK(std::function<void(const CHECK&)> h) { core()->on("CHECK", [h](std::any a) { auto sp = std::any_cast<std::shared_ptr<Outgoing>>(a); h(*std::dynamic_pointer_cast<CHECK>(sp)); }); }
    void OnCI(std::function<void(const CI&)> h) { core()->on("CI", [h](std::any a) { auto sp = std::any_cast<std::shared_ptr<Outgoing>>(a); h(*std::dynamic_pointer_cast<CI>(sp)); }); }
    void OnCT(std::function<void(const CTToClient&)> h) { core()->on("CT", [h](std::any a) { auto sp = std::any_cast<std::shared_ptr<Outgoing>>(a); h(*std::dynamic_pointer_cast<CTToClient>(sp)); }); }
    void SendCT(const CTToServer& p) { core()->send(p); }
    void OnCharsCheck(std::function<void(const CharsCheck&)> h) { core()->on("CharsCheck", [h](std::any a) { auto sp = std::any_cast<std::shared_ptr<Outgoing>>(a); h(*std::dynamic_pointer_cast<CharsCheck>(sp)); }); }
    void SendDE(const DE& p) { core()->send(p); }
    void OnDONE(std::function<void(const DONE&)> h) { core()->on("DONE", [h](std::any a) { auto sp = std::any_cast<std::shared_ptr<Outgoing>>(a); h(*std::dynamic_pointer_cast<DONE>(sp)); }); }
    void SendEE(const EE& p) { core()->send(p); }
    void OnEI(std::function<void(const EI&)> h) { core()->on("EI", [h](std::any a) { auto sp = std::any_cast<std::shared_ptr<Outgoing>>(a); h(*std::dynamic_pointer_cast<EI>(sp)); }); }
    void OnEM(std::function<void(const EM&)> h) { core()->on("EM", [h](std::any a) { auto sp = std::any_cast<std::shared_ptr<Outgoing>>(a); h(*std::dynamic_pointer_cast<EM>(sp)); }); }
    void OnFA(std::function<void(const FA&)> h) { core()->on("FA", [h](std::any a) { auto sp = std::any_cast<std::shared_ptr<Outgoing>>(a); h(*std::dynamic_pointer_cast<FA>(sp)); }); }
    void OnFL(std::function<void(const FL&)> h) { core()->on("FL", [h](std::any a) { auto sp = std::any_cast<std::shared_ptr<Outgoing>>(a); h(*std::dynamic_pointer_cast<FL>(sp)); }); }
    void OnFM(std::function<void(const FM&)> h) { core()->on("FM", [h](std::any a) { auto sp = std::any_cast<std::shared_ptr<Outgoing>>(a); h(*std::dynamic_pointer_cast<FM>(sp)); }); }
    void SendHI(const HI& p) { core()->send(p); }
    void OnHP(std::function<void(const HPToClient&)> h) { core()->on("HP", [h](std::any a) { auto sp = std::any_cast<std::shared_ptr<Outgoing>>(a); h(*std::dynamic_pointer_cast<HPToClient>(sp)); }); }
    void SendHP(const HPToServer& p) { core()->send(p); }
    void OnID(std::function<void(const IDToClient&)> h) { core()->on("ID", [h](std::any a) { auto sp = std::any_cast<std::shared_ptr<Outgoing>>(a); h(*std::dynamic_pointer_cast<IDToClient>(sp)); }); }
    void SendID(const IDToServer& p) { core()->send(p); }
    void OnJD(std::function<void(const JD&)> h) { core()->on("JD", [h](std::any a) { auto sp = std::any_cast<std::shared_ptr<Outgoing>>(a); h(*std::dynamic_pointer_cast<JD>(sp)); }); }
    void OnKB(std::function<void(const KB&)> h) { core()->on("KB", [h](std::any a) { auto sp = std::any_cast<std::shared_ptr<Outgoing>>(a); h(*std::dynamic_pointer_cast<KB>(sp)); }); }
    void OnKK(std::function<void(const KK&)> h) { core()->on("KK", [h](std::any a) { auto sp = std::any_cast<std::shared_ptr<Outgoing>>(a); h(*std::dynamic_pointer_cast<KK>(sp)); }); }
    void OnLE(std::function<void(const LE&)> h) { core()->on("LE", [h](std::any a) { auto sp = std::any_cast<std::shared_ptr<Outgoing>>(a); h(*std::dynamic_pointer_cast<LE>(sp)); }); }
    void SendMA(const MA& p) { core()->send(p); }
    void OnMC(std::function<void(const MCToClient&)> h) { core()->on("MC", [h](std::any a) { auto sp = std::any_cast<std::shared_ptr<Outgoing>>(a); h(*std::dynamic_pointer_cast<MCToClient>(sp)); }); }
    void SendMC(const MCToServer& p) { core()->send(p); }
    void OnMS(std::function<void(const MSToClient&)> h) { core()->on("MS", [h](std::any a) { auto sp = std::any_cast<std::shared_ptr<Outgoing>>(a); h(*std::dynamic_pointer_cast<MSToClient>(sp)); }); }
    void SendMS(const MSToServer& p) { core()->send(p); }
    void SendPE(const PE& p) { core()->send(p); }
    void OnPN(std::function<void(const PN&)> h) { core()->on("PN", [h](std::any a) { auto sp = std::any_cast<std::shared_ptr<Outgoing>>(a); h(*std::dynamic_pointer_cast<PN>(sp)); }); }
    void OnPR(std::function<void(const PR&)> h) { core()->on("PR", [h](std::any a) { auto sp = std::any_cast<std::shared_ptr<Outgoing>>(a); h(*std::dynamic_pointer_cast<PR>(sp)); }); }
    void OnPU(std::function<void(const PU&)> h) { core()->on("PU", [h](std::any a) { auto sp = std::any_cast<std::shared_ptr<Outgoing>>(a); h(*std::dynamic_pointer_cast<PU>(sp)); }); }
    void OnPV(std::function<void(const PV&)> h) { core()->on("PV", [h](std::any a) { auto sp = std::any_cast<std::shared_ptr<Outgoing>>(a); h(*std::dynamic_pointer_cast<PV>(sp)); }); }
    void SendRC(const RC& p) { core()->send(p); }
    void SendRD(const RD& p) { core()->send(p); }
    void SendRM(const RM& p) { core()->send(p); }
    void OnRMC(std::function<void(const RMC&)> h) { core()->on("RMC", [h](std::any a) { auto sp = std::any_cast<std::shared_ptr<Outgoing>>(a); h(*std::dynamic_pointer_cast<RMC>(sp)); }); }
    void OnRT(std::function<void(const RTToClient&)> h) { core()->on("RT", [h](std::any a) { auto sp = std::any_cast<std::shared_ptr<Outgoing>>(a); h(*std::dynamic_pointer_cast<RTToClient>(sp)); }); }
    void SendRT(const RTToServer& p) { core()->send(p); }
    void OnSC(std::function<void(const SC&)> h) { core()->on("SC", [h](std::any a) { auto sp = std::any_cast<std::shared_ptr<Outgoing>>(a); h(*std::dynamic_pointer_cast<SC>(sp)); }); }
    void SendSETCASE(const SETCASE& p) { core()->send(p); }
    void OnSI(std::function<void(const SI&)> h) { core()->on("SI", [h](std::any a) { auto sp = std::any_cast<std::shared_ptr<Outgoing>>(a); h(*std::dynamic_pointer_cast<SI>(sp)); }); }
    void OnSM(std::function<void(const SM&)> h) { core()->on("SM", [h](std::any a) { auto sp = std::any_cast<std::shared_ptr<Outgoing>>(a); h(*std::dynamic_pointer_cast<SM>(sp)); }); }
    void OnSP(std::function<void(const SP&)> h) { core()->on("SP", [h](std::any a) { auto sp = std::any_cast<std::shared_ptr<Outgoing>>(a); h(*std::dynamic_pointer_cast<SP>(sp)); }); }
    void OnST(std::function<void(const ST&)> h) { core()->on("ST", [h](std::any a) { auto sp = std::any_cast<std::shared_ptr<Outgoing>>(a); h(*std::dynamic_pointer_cast<ST>(sp)); }); }
    void OnTI(std::function<void(const TI&)> h) { core()->on("TI", [h](std::any a) { auto sp = std::any_cast<std::shared_ptr<Outgoing>>(a); h(*std::dynamic_pointer_cast<TI>(sp)); }); }
    void OnZZ(std::function<void(const ZZToClient&)> h) { core()->on("ZZ", [h](std::any a) { auto sp = std::any_cast<std::shared_ptr<Outgoing>>(a); h(*std::dynamic_pointer_cast<ZZToClient>(sp)); }); }
    void SendZZ(const ZZToServer& p) { core()->send(p); }
    void SendAskchaa(const askchaa& p) { core()->send(p); }
    void OnDecryptor(std::function<void(const decryptor&)> h) { core()->on("decryptor", [h](std::any a) { auto sp = std::any_cast<std::shared_ptr<Outgoing>>(a); h(*std::dynamic_pointer_cast<decryptor>(sp)); }); }
