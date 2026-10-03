// AUTO-GENERATED from spec. Do not edit; run aolib-gen.
#pragma once

#include <any>
#include <functional>

#include "aolib/session.hpp"
#include "aolib/packets_gen.hpp"

namespace aolib {

inline void ClientSession::SendARUP(const ARUP& p) { core()->send(p); }
inline void ClientSession::SendASS(const ASS& p) { core()->send(p); }
inline void ClientSession::SendAUTH(const AUTH& p) { core()->send(p); }
inline void ClientSession::SendBB(const BB& p) { core()->send(p); }
inline void ClientSession::SendBD(const BD& p) { core()->send(p); }
inline void ClientSession::SendBN(const BN& p) { core()->send(p); }
inline void ClientSession::SendCASEA(const CASEAToClient& p) { core()->send(p); }
inline void ClientSession::OnCASEA(std::function<void(const CASEAToServer&)> h) { core()->on("CASEA", [h](std::any a) { h(std::any_cast<CASEAToServer>(a)); }); }
inline void ClientSession::OnCC(std::function<void(const CC&)> h) { core()->on("CC", [h](std::any a) { h(std::any_cast<CC>(a)); }); }
inline void ClientSession::OnCH(std::function<void(const CH&)> h) { core()->on("CH", [h](std::any a) { h(std::any_cast<CH>(a)); }); }
inline void ClientSession::SendCHECK(const CHECK& p) { core()->send(p); }
inline void ClientSession::SendCI(const CI& p) { core()->send(p); }
inline void ClientSession::SendCT(const CTToClient& p) { core()->send(p); }
inline void ClientSession::OnCT(std::function<void(const CTToServer&)> h) { core()->on("CT", [h](std::any a) { h(std::any_cast<CTToServer>(a)); }); }
inline void ClientSession::SendCharsCheck(const CharsCheck& p) { core()->send(p); }
inline void ClientSession::OnDE(std::function<void(const DE&)> h) { core()->on("DE", [h](std::any a) { h(std::any_cast<DE>(a)); }); }
inline void ClientSession::SendDONE(const DONE& p) { core()->send(p); }
inline void ClientSession::OnEE(std::function<void(const EE&)> h) { core()->on("EE", [h](std::any a) { h(std::any_cast<EE>(a)); }); }
inline void ClientSession::SendEI(const EI& p) { core()->send(p); }
inline void ClientSession::SendEM(const EM& p) { core()->send(p); }
inline void ClientSession::SendFA(const FA& p) { core()->send(p); }
inline void ClientSession::SendFL(const FL& p) { core()->send(p); }
inline void ClientSession::SendFM(const FM& p) { core()->send(p); }
inline void ClientSession::OnHI(std::function<void(const HI&)> h) { core()->on("HI", [h](std::any a) { h(std::any_cast<HI>(a)); }); }
inline void ClientSession::SendHP(const HPToClient& p) { core()->send(p); }
inline void ClientSession::OnHP(std::function<void(const HPToServer&)> h) { core()->on("HP", [h](std::any a) { h(std::any_cast<HPToServer>(a)); }); }
inline void ClientSession::SendID(const IDToClient& p) { core()->send(p); }
inline void ClientSession::OnID(std::function<void(const IDToServer&)> h) { core()->on("ID", [h](std::any a) { h(std::any_cast<IDToServer>(a)); }); }
inline void ClientSession::SendJD(const JD& p) { core()->send(p); }
inline void ClientSession::SendKB(const KB& p) { core()->send(p); }
inline void ClientSession::SendKK(const KK& p) { core()->send(p); }
inline void ClientSession::SendLE(const LE& p) { core()->send(p); }
inline void ClientSession::OnMA(std::function<void(const MA&)> h) { core()->on("MA", [h](std::any a) { h(std::any_cast<MA>(a)); }); }
inline void ClientSession::SendMC(const MCToClient& p) { core()->send(p); }
inline void ClientSession::OnMC(std::function<void(const MCToServer&)> h) { core()->on("MC", [h](std::any a) { h(std::any_cast<MCToServer>(a)); }); }
inline void ClientSession::SendMS(const MSToClient& p) { core()->send(p); }
inline void ClientSession::OnMS(std::function<void(const MSToServer&)> h) { core()->on("MS", [h](std::any a) { h(std::any_cast<MSToServer>(a)); }); }
inline void ClientSession::OnPE(std::function<void(const PE&)> h) { core()->on("PE", [h](std::any a) { h(std::any_cast<PE>(a)); }); }
inline void ClientSession::SendPN(const PN& p) { core()->send(p); }
inline void ClientSession::SendPR(const PR& p) { core()->send(p); }
inline void ClientSession::SendPU(const PU& p) { core()->send(p); }
inline void ClientSession::SendPV(const PV& p) { core()->send(p); }
inline void ClientSession::OnRC(std::function<void(const RC&)> h) { core()->on("RC", [h](std::any a) { h(std::any_cast<RC>(a)); }); }
inline void ClientSession::OnRD(std::function<void(const RD&)> h) { core()->on("RD", [h](std::any a) { h(std::any_cast<RD>(a)); }); }
inline void ClientSession::OnRM(std::function<void(const RM&)> h) { core()->on("RM", [h](std::any a) { h(std::any_cast<RM>(a)); }); }
inline void ClientSession::SendRMC(const RMC& p) { core()->send(p); }
inline void ClientSession::SendRT(const RTToClient& p) { core()->send(p); }
inline void ClientSession::OnRT(std::function<void(const RTToServer&)> h) { core()->on("RT", [h](std::any a) { h(std::any_cast<RTToServer>(a)); }); }
inline void ClientSession::SendSC(const SC& p) { core()->send(p); }
inline void ClientSession::OnSETCASE(std::function<void(const SETCASE&)> h) { core()->on("SETCASE", [h](std::any a) { h(std::any_cast<SETCASE>(a)); }); }
inline void ClientSession::SendSI(const SI& p) { core()->send(p); }
inline void ClientSession::SendSM(const SM& p) { core()->send(p); }
inline void ClientSession::SendSP(const SP& p) { core()->send(p); }
inline void ClientSession::SendST(const ST& p) { core()->send(p); }
inline void ClientSession::SendTI(const TI& p) { core()->send(p); }
inline void ClientSession::SendZZ(const ZZToClient& p) { core()->send(p); }
inline void ClientSession::OnZZ(std::function<void(const ZZToServer&)> h) { core()->on("ZZ", [h](std::any a) { h(std::any_cast<ZZToServer>(a)); }); }
inline void ClientSession::OnAskchaa(std::function<void(const askchaa&)> h) { core()->on("askchaa", [h](std::any a) { h(std::any_cast<askchaa>(a)); }); }
inline void ClientSession::SendDecryptor(const decryptor& p) { core()->send(p); }

}  // namespace aolib
