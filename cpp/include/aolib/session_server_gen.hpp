// AUTO-GENERATED from spec. Do not edit; run aolib-gen.
#pragma once

#include <any>
#include <functional>

#include "aolib/session.hpp"
#include "aolib/packets_gen.hpp"

namespace aolib {

inline void ServerSession::OnARUP(std::function<void(const ARUP&)> h) { core()->on("ARUP", [h](std::any a) { h(std::any_cast<ARUP>(a)); }); }
inline void ServerSession::OnASS(std::function<void(const ASS&)> h) { core()->on("ASS", [h](std::any a) { h(std::any_cast<ASS>(a)); }); }
inline void ServerSession::OnAUTH(std::function<void(const AUTH&)> h) { core()->on("AUTH", [h](std::any a) { h(std::any_cast<AUTH>(a)); }); }
inline void ServerSession::OnBB(std::function<void(const BB&)> h) { core()->on("BB", [h](std::any a) { h(std::any_cast<BB>(a)); }); }
inline void ServerSession::OnBD(std::function<void(const BD&)> h) { core()->on("BD", [h](std::any a) { h(std::any_cast<BD>(a)); }); }
inline void ServerSession::OnBN(std::function<void(const BN&)> h) { core()->on("BN", [h](std::any a) { h(std::any_cast<BN>(a)); }); }
inline void ServerSession::OnCASEA(std::function<void(const CASEAToClient&)> h) { core()->on("CASEA", [h](std::any a) { h(std::any_cast<CASEAToClient>(a)); }); }
inline void ServerSession::SendCASEA(const CASEAToServer& p) { core()->send(p); }
inline void ServerSession::SendCC(const CC& p) { core()->send(p); }
inline void ServerSession::SendCH(const CH& p) { core()->send(p); }
inline void ServerSession::OnCHECK(std::function<void(const CHECK&)> h) { core()->on("CHECK", [h](std::any a) { h(std::any_cast<CHECK>(a)); }); }
inline void ServerSession::OnCI(std::function<void(const CI&)> h) { core()->on("CI", [h](std::any a) { h(std::any_cast<CI>(a)); }); }
inline void ServerSession::OnCT(std::function<void(const CTToClient&)> h) { core()->on("CT", [h](std::any a) { h(std::any_cast<CTToClient>(a)); }); }
inline void ServerSession::SendCT(const CTToServer& p) { core()->send(p); }
inline void ServerSession::OnCharsCheck(std::function<void(const CharsCheck&)> h) { core()->on("CharsCheck", [h](std::any a) { h(std::any_cast<CharsCheck>(a)); }); }
inline void ServerSession::SendDE(const DE& p) { core()->send(p); }
inline void ServerSession::OnDONE(std::function<void(const DONE&)> h) { core()->on("DONE", [h](std::any a) { h(std::any_cast<DONE>(a)); }); }
inline void ServerSession::SendEE(const EE& p) { core()->send(p); }
inline void ServerSession::OnEI(std::function<void(const EI&)> h) { core()->on("EI", [h](std::any a) { h(std::any_cast<EI>(a)); }); }
inline void ServerSession::OnEM(std::function<void(const EM&)> h) { core()->on("EM", [h](std::any a) { h(std::any_cast<EM>(a)); }); }
inline void ServerSession::OnFA(std::function<void(const FA&)> h) { core()->on("FA", [h](std::any a) { h(std::any_cast<FA>(a)); }); }
inline void ServerSession::OnFL(std::function<void(const FL&)> h) { core()->on("FL", [h](std::any a) { h(std::any_cast<FL>(a)); }); }
inline void ServerSession::OnFM(std::function<void(const FM&)> h) { core()->on("FM", [h](std::any a) { h(std::any_cast<FM>(a)); }); }
inline void ServerSession::SendHI(const HI& p) { core()->send(p); }
inline void ServerSession::OnHP(std::function<void(const HPToClient&)> h) { core()->on("HP", [h](std::any a) { h(std::any_cast<HPToClient>(a)); }); }
inline void ServerSession::SendHP(const HPToServer& p) { core()->send(p); }
inline void ServerSession::OnID(std::function<void(const IDToClient&)> h) { core()->on("ID", [h](std::any a) { h(std::any_cast<IDToClient>(a)); }); }
inline void ServerSession::SendID(const IDToServer& p) { core()->send(p); }
inline void ServerSession::OnJD(std::function<void(const JD&)> h) { core()->on("JD", [h](std::any a) { h(std::any_cast<JD>(a)); }); }
inline void ServerSession::OnKB(std::function<void(const KB&)> h) { core()->on("KB", [h](std::any a) { h(std::any_cast<KB>(a)); }); }
inline void ServerSession::OnKK(std::function<void(const KK&)> h) { core()->on("KK", [h](std::any a) { h(std::any_cast<KK>(a)); }); }
inline void ServerSession::OnLE(std::function<void(const LE&)> h) { core()->on("LE", [h](std::any a) { h(std::any_cast<LE>(a)); }); }
inline void ServerSession::SendMA(const MA& p) { core()->send(p); }
inline void ServerSession::OnMC(std::function<void(const MCToClient&)> h) { core()->on("MC", [h](std::any a) { h(std::any_cast<MCToClient>(a)); }); }
inline void ServerSession::SendMC(const MCToServer& p) { core()->send(p); }
inline void ServerSession::OnMS(std::function<void(const MSToClient&)> h) { core()->on("MS", [h](std::any a) { h(std::any_cast<MSToClient>(a)); }); }
inline void ServerSession::SendMS(const MSToServer& p) { core()->send(p); }
inline void ServerSession::SendPE(const PE& p) { core()->send(p); }
inline void ServerSession::OnPN(std::function<void(const PN&)> h) { core()->on("PN", [h](std::any a) { h(std::any_cast<PN>(a)); }); }
inline void ServerSession::OnPR(std::function<void(const PR&)> h) { core()->on("PR", [h](std::any a) { h(std::any_cast<PR>(a)); }); }
inline void ServerSession::OnPU(std::function<void(const PU&)> h) { core()->on("PU", [h](std::any a) { h(std::any_cast<PU>(a)); }); }
inline void ServerSession::OnPV(std::function<void(const PV&)> h) { core()->on("PV", [h](std::any a) { h(std::any_cast<PV>(a)); }); }
inline void ServerSession::SendRC(const RC& p) { core()->send(p); }
inline void ServerSession::SendRD(const RD& p) { core()->send(p); }
inline void ServerSession::SendRM(const RM& p) { core()->send(p); }
inline void ServerSession::OnRMC(std::function<void(const RMC&)> h) { core()->on("RMC", [h](std::any a) { h(std::any_cast<RMC>(a)); }); }
inline void ServerSession::OnRT(std::function<void(const RTToClient&)> h) { core()->on("RT", [h](std::any a) { h(std::any_cast<RTToClient>(a)); }); }
inline void ServerSession::SendRT(const RTToServer& p) { core()->send(p); }
inline void ServerSession::OnSC(std::function<void(const SC&)> h) { core()->on("SC", [h](std::any a) { h(std::any_cast<SC>(a)); }); }
inline void ServerSession::SendSETCASE(const SETCASE& p) { core()->send(p); }
inline void ServerSession::OnSI(std::function<void(const SI&)> h) { core()->on("SI", [h](std::any a) { h(std::any_cast<SI>(a)); }); }
inline void ServerSession::OnSM(std::function<void(const SM&)> h) { core()->on("SM", [h](std::any a) { h(std::any_cast<SM>(a)); }); }
inline void ServerSession::OnSP(std::function<void(const SP&)> h) { core()->on("SP", [h](std::any a) { h(std::any_cast<SP>(a)); }); }
inline void ServerSession::OnST(std::function<void(const ST&)> h) { core()->on("ST", [h](std::any a) { h(std::any_cast<ST>(a)); }); }
inline void ServerSession::OnTI(std::function<void(const TI&)> h) { core()->on("TI", [h](std::any a) { h(std::any_cast<TI>(a)); }); }
inline void ServerSession::OnZZ(std::function<void(const ZZToClient&)> h) { core()->on("ZZ", [h](std::any a) { h(std::any_cast<ZZToClient>(a)); }); }
inline void ServerSession::SendZZ(const ZZToServer& p) { core()->send(p); }
inline void ServerSession::SendAskchaa(const askchaa& p) { core()->send(p); }
inline void ServerSession::OnDecryptor(std::function<void(const decryptor&)> h) { core()->on("decryptor", [h](std::any a) { h(std::any_cast<decryptor>(a)); }); }

}  // namespace aolib
