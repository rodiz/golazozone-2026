// GolazoZone 2026 — Complete Seed
// FIFA World Cup 2026: 48 teams, 12 groups, 104 matches
// All times in UTC; Colombia display strings in COT (UTC-5)

import { PrismaClient, PhaseType, MatchStatus, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ── PHASES ──────────────────────────────────────────────────────────────────
const phases = [
  { name: "Fase de Grupos", slug: PhaseType.GROUP_STAGE, order: 1, startDate: new Date("2026-06-11"), endDate: new Date("2026-06-27") },
  { name: "16avos de Final", slug: PhaseType.ROUND_OF_32, order: 2, startDate: new Date("2026-06-28"), endDate: new Date("2026-07-03") },
  { name: "Cuartos de Final", slug: PhaseType.QUARTER_FINALS, order: 3, startDate: new Date("2026-07-04"), endDate: new Date("2026-07-07") },
  { name: "Semifinales", slug: PhaseType.SEMI_FINALS, order: 4, startDate: new Date("2026-07-09"), endDate: new Date("2026-07-15") },
  { name: "Tercer Puesto", slug: PhaseType.THIRD_PLACE, order: 5, startDate: new Date("2026-07-18"), endDate: new Date("2026-07-18") },
  { name: "Final", slug: PhaseType.FINAL, order: 6, startDate: new Date("2026-07-19"), endDate: new Date("2026-07-19") },
];

// ── GROUPS ──────────────────────────────────────────────────────────────────
const groups = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

// ── TEAMS ───────────────────────────────────────────────────────────────────
const teams = [
  // Group A
  { id: "mex", name: "México", shortCode: "MEX", flag: "🇲🇽", confirmed: true },
  { id: "rsa", name: "Sudáfrica", shortCode: "RSA", flag: "🇿🇦", confirmed: true },
  { id: "kor", name: "Corea del Sur", shortCode: "KOR", flag: "🇰🇷", confirmed: true },
  { id: "rep-uefad", name: "Pos: Chequia / Macedonia / Irlanda / Dinamarca", shortCode: "RUD", flag: "⏳", confirmed: false, playoffSlotLabel: "Ganador Repechaje UEFA-D", playoffCandidates: "Chequia / Macedonia / Irlanda / Dinamarca" },
  // Group B
  { id: "can", name: "Canadá", shortCode: "CAN", flag: "🇨🇦", confirmed: true },
  { id: "sui", name: "Suiza", shortCode: "SUI", flag: "🇨🇭", confirmed: true },
  { id: "qat", name: "Qatar", shortCode: "QAT", flag: "🇶🇦", confirmed: true },
  { id: "rep-uefaa", name: "Pos: Gales / Italia / Bosnia / Irlanda del Norte", shortCode: "RUA", flag: "⏳", confirmed: false, playoffSlotLabel: "Ganador Repechaje UEFA-A", playoffCandidates: "Gales / Italia / Bosnia / Irlanda del Norte" },
  // Group C
  { id: "bra", name: "Brasil", shortCode: "BRA", flag: "🇧🇷", confirmed: true },
  { id: "mar", name: "Marruecos", shortCode: "MAR", flag: "🇲🇦", confirmed: true },
  { id: "sco", name: "Escocia", shortCode: "SCO", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", confirmed: true },
  { id: "hai", name: "Haití", shortCode: "HAI", flag: "🇭🇹", confirmed: true },
  // Group D
  { id: "usa", name: "Estados Unidos", shortCode: "USA", flag: "🇺🇸", confirmed: true },
  { id: "par", name: "Paraguay", shortCode: "PAR", flag: "🇵🇾", confirmed: true },
  { id: "aus", name: "Australia", shortCode: "AUS", flag: "🇦🇺", confirmed: true },
  { id: "rep-uefac", name: "Pos: Turquía / Rumania / Eslovaquia / Kosovo", shortCode: "RUC", flag: "⏳", confirmed: false, playoffSlotLabel: "Ganador Repechaje UEFA-C", playoffCandidates: "Turquía / Rumania / Eslovaquia / Kosovo" },
  // Group E
  { id: "ger", name: "Alemania", shortCode: "GER", flag: "🇩🇪", confirmed: true },
  { id: "cuw", name: "Curazao", shortCode: "CUW", flag: "🇨🇼", confirmed: true },
  { id: "civ", name: "Costa de Marfil", shortCode: "CIV", flag: "🇨🇮", confirmed: true },
  { id: "ecu", name: "Ecuador", shortCode: "ECU", flag: "🇪🇨", confirmed: true },
  // Group F
  { id: "ned", name: "Países Bajos", shortCode: "NED", flag: "🇳🇱", confirmed: true },
  { id: "jpn", name: "Japón", shortCode: "JPN", flag: "🇯🇵", confirmed: true },
  { id: "rep-uefab", name: "Pos: Polonia / Albania / Ucrania / Suecia", shortCode: "RUB", flag: "⏳", confirmed: false, playoffSlotLabel: "Ganador Repechaje UEFA-B", playoffCandidates: "Polonia / Albania / Ucrania / Suecia" },
  { id: "tun", name: "Túnez", shortCode: "TUN", flag: "🇹🇳", confirmed: true },
  // Group G
  { id: "bel", name: "Bélgica", shortCode: "BEL", flag: "🇧🇪", confirmed: true },
  { id: "egy", name: "Egipto", shortCode: "EGY", flag: "🇪🇬", confirmed: true },
  { id: "irn", name: "Irán", shortCode: "IRN", flag: "🇮🇷", confirmed: true },
  { id: "nzl", name: "Nueva Zelanda", shortCode: "NZL", flag: "🇳🇿", confirmed: true },
  // Group H
  { id: "esp", name: "España", shortCode: "ESP", flag: "🇪🇸", confirmed: true },
  { id: "cpv", name: "Cabo Verde", shortCode: "CPV", flag: "🇨🇻", confirmed: true },
  { id: "ksa", name: "Arabia Saudita", shortCode: "KSA", flag: "🇸🇦", confirmed: true },
  { id: "uru", name: "Uruguay", shortCode: "URU", flag: "🇺🇾", confirmed: true },
  // Group I
  { id: "fra", name: "Francia", shortCode: "FRA", flag: "🇫🇷", confirmed: true },
  { id: "sen", name: "Senegal", shortCode: "SEN", flag: "🇸🇳", confirmed: true },
  { id: "rep-fifa2", name: "Pos: Congo DR / Jamaica / Nueva Caledonia", shortCode: "RF2", flag: "⏳", confirmed: false, playoffSlotLabel: "Ganador Repechaje FIFA-2", playoffCandidates: "Congo DR / Jamaica / Nueva Caledonia" },
  { id: "nor", name: "Noruega", shortCode: "NOR", flag: "🇳🇴", confirmed: true },
  // Group J
  { id: "arg", name: "Argentina", shortCode: "ARG", flag: "🇦🇷", confirmed: true },
  { id: "dza", name: "Argelia", shortCode: "DZA", flag: "🇩🇿", confirmed: true },
  { id: "aut", name: "Austria", shortCode: "AUT", flag: "🇦🇹", confirmed: true },
  { id: "jor", name: "Jordania", shortCode: "JOR", flag: "🇯🇴", confirmed: true },
  // Group K
  { id: "por", name: "Portugal", shortCode: "POR", flag: "🇵🇹", confirmed: true },
  { id: "rep-fifa1", name: "Pos: Congo DR / Jamaica / Nueva Caledonia (cruce interconf.)", shortCode: "RF1", flag: "⏳", confirmed: false, playoffSlotLabel: "Ganador Repechaje FIFA-1", playoffCandidates: "Congo DR / Jamaica / Nueva Caledonia" },
  { id: "uzb", name: "Uzbekistán", shortCode: "UZB", flag: "🇺🇿", confirmed: true },
  { id: "col", name: "Colombia", shortCode: "COL", flag: "🇨🇴", confirmed: true },
  // Group L
  { id: "eng", name: "Inglaterra", shortCode: "ENG", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", confirmed: true },
  { id: "cro", name: "Croacia", shortCode: "CRO", flag: "🇭🇷", confirmed: true },
  { id: "gha", name: "Ghana", shortCode: "GHA", flag: "🇬🇭", confirmed: true },
  { id: "pan", name: "Panamá", shortCode: "PAN", flag: "🇵🇦", confirmed: true },
];

// ── GROUP ASSIGNMENTS ────────────────────────────────────────────────────────
const groupAssignments: Record<string, string[]> = {
  A: ["mex", "rsa", "kor", "rep-uefad"],
  B: ["can", "sui", "qat", "rep-uefaa"],
  C: ["bra", "mar", "sco", "hai"],
  D: ["usa", "par", "aus", "rep-uefac"],
  E: ["ger", "cuw", "civ", "ecu"],
  F: ["ned", "jpn", "rep-uefab", "tun"],
  G: ["bel", "egy", "irn", "nzl"],
  H: ["esp", "cpv", "ksa", "uru"],
  I: ["fra", "sen", "rep-fifa2", "nor"],
  J: ["arg", "dza", "aut", "jor"],
  K: ["por", "rep-fifa1", "uzb", "col"],
  L: ["eng", "cro", "gha", "pan"],
};

// Helper: convert Colombia time "YYYY-MM-DDTHH:MM" to UTC DateTime (COT = UTC-5)
function cotToUtc(cotStr: string): Date {
  const d = new Date(cotStr + ":00-05:00");
  return d;
}
function lockAt(utcDate: Date): Date {
  return new Date(utcDate.getTime() - 15 * 60 * 1000);
}

// ── MATCHES ──────────────────────────────────────────────────────────────────
interface MatchSeed {
  matchNumber: number;
  phase: PhaseType;
  group?: string;
  matchday?: number;
  homeTeam?: string;
  awayTeam?: string;
  homeSlot?: string;
  awaySlot?: string;
  dateCOT: string; // "YYYY-MM-DDTHH:MM"
  venue: string;
  city: string;
  country: string;
  isFeatured?: boolean;
}

const matchSeeds: MatchSeed[] = [
  // ── JORNADA 1: Jun 11-14 ─────────────────────────────────────────────
  { matchNumber: 1, phase: PhaseType.GROUP_STAGE, group: "A", matchday: 1, homeTeam: "mex", awayTeam: "rsa", dateCOT: "2026-06-11T13:00", venue: "Estadio Azteca", city: "Ciudad de México", country: "México" },
  { matchNumber: 2, phase: PhaseType.GROUP_STAGE, group: "A", matchday: 1, homeTeam: "kor", awayTeam: "rep-uefad", dateCOT: "2026-06-11T20:00", venue: "Estadio Akron (Banorte)", city: "Guadalajara", country: "México" },
  { matchNumber: 3, phase: PhaseType.GROUP_STAGE, group: "B", matchday: 1, homeTeam: "can", awayTeam: "rep-uefaa", dateCOT: "2026-06-12T13:00", venue: "BMO Field", city: "Toronto", country: "Canadá" },
  { matchNumber: 4, phase: PhaseType.GROUP_STAGE, group: "D", matchday: 1, homeTeam: "usa", awayTeam: "par", dateCOT: "2026-06-12T20:00", venue: "SoFi Stadium", city: "Los Ángeles", country: "EE.UU." },
  { matchNumber: 5, phase: PhaseType.GROUP_STAGE, group: "B", matchday: 1, homeTeam: "qat", awayTeam: "sui", dateCOT: "2026-06-13T10:00", venue: "Levi's Stadium", city: "San Francisco", country: "EE.UU." },
  { matchNumber: 6, phase: PhaseType.GROUP_STAGE, group: "C", matchday: 1, homeTeam: "bra", awayTeam: "mar", dateCOT: "2026-06-13T17:00", venue: "MetLife Stadium", city: "Nueva York/NJ", country: "EE.UU." },
  { matchNumber: 7, phase: PhaseType.GROUP_STAGE, group: "C", matchday: 1, homeTeam: "hai", awayTeam: "sco", dateCOT: "2026-06-13T10:00", venue: "Gillette Stadium", city: "Boston", country: "EE.UU." },
  { matchNumber: 8, phase: PhaseType.GROUP_STAGE, group: "E", matchday: 1, homeTeam: "ger", awayTeam: "cuw", dateCOT: "2026-06-14T11:00", venue: "NRG Stadium", city: "Houston", country: "EE.UU." },
  { matchNumber: 9, phase: PhaseType.GROUP_STAGE, group: "F", matchday: 1, homeTeam: "ned", awayTeam: "jpn", dateCOT: "2026-06-14T14:00", venue: "AT&T Stadium", city: "Dallas", country: "EE.UU." },
  { matchNumber: 10, phase: PhaseType.GROUP_STAGE, group: "E", matchday: 1, homeTeam: "civ", awayTeam: "ecu", dateCOT: "2026-06-14T15:00", venue: "Lincoln Financial Field", city: "Filadelfia", country: "EE.UU." },
  { matchNumber: 11, phase: PhaseType.GROUP_STAGE, group: "F", matchday: 1, homeTeam: "rep-uefab", awayTeam: "tun", dateCOT: "2026-06-14T11:00", venue: "Estadio BBVA", city: "Monterrey", country: "México" },
  { matchNumber: 12, phase: PhaseType.GROUP_STAGE, group: "D", matchday: 1, homeTeam: "aus", awayTeam: "rep-uefac", dateCOT: "2026-06-14T20:00", venue: "BC Place", city: "Vancouver", country: "Canadá" },
  // ── JORNADA 1 cont.: Jun 15-16 ─────────────────────────────────────────
  { matchNumber: 13, phase: PhaseType.GROUP_STAGE, group: "G", matchday: 1, homeTeam: "irn", awayTeam: "nzl", dateCOT: "2026-06-15T20:00", venue: "SoFi Stadium", city: "Los Ángeles", country: "EE.UU." },
  { matchNumber: 14, phase: PhaseType.GROUP_STAGE, group: "H", matchday: 1, homeTeam: "esp", awayTeam: "cpv", dateCOT: "2026-06-15T10:00", venue: "Mercedes-Benz Stadium", city: "Atlanta", country: "EE.UU." },
  { matchNumber: 15, phase: PhaseType.GROUP_STAGE, group: "H", matchday: 1, homeTeam: "ksa", awayTeam: "uru", dateCOT: "2026-06-15T11:00", venue: "Hard Rock Stadium", city: "Miami", country: "EE.UU." },
  { matchNumber: 16, phase: PhaseType.GROUP_STAGE, group: "I", matchday: 1, homeTeam: "rep-fifa2", awayTeam: "nor", dateCOT: "2026-06-16T07:00", venue: "Gillette Stadium", city: "Boston", country: "EE.UU." },
  { matchNumber: 17, phase: PhaseType.GROUP_STAGE, group: "I", matchday: 1, homeTeam: "fra", awayTeam: "sen", dateCOT: "2026-06-16T13:00", venue: "MetLife Stadium", city: "Nueva York/NJ", country: "EE.UU." },
  { matchNumber: 18, phase: PhaseType.GROUP_STAGE, group: "J", matchday: 1, homeTeam: "arg", awayTeam: "dza", dateCOT: "2026-06-16T19:00", venue: "GEHA Arrowhead Stadium", city: "Kansas City", country: "EE.UU." },
  { matchNumber: 19, phase: PhaseType.GROUP_STAGE, group: "J", matchday: 1, homeTeam: "aut", awayTeam: "jor", dateCOT: "2026-06-16T13:00", venue: "Levi's Stadium", city: "San Francisco", country: "EE.UU." },
  { matchNumber: 20, phase: PhaseType.GROUP_STAGE, group: "G", matchday: 1, homeTeam: "bel", awayTeam: "egy", dateCOT: "2026-06-16T13:00", venue: "Lumen Field", city: "Seattle", country: "EE.UU." },
  // ── JORNADA 2: Jun 17-20 ─────────────────────────────────────────────
  { matchNumber: 21, phase: PhaseType.GROUP_STAGE, group: "L", matchday: 2, homeTeam: "eng", awayTeam: "cro", dateCOT: "2026-06-17T14:00", venue: "AT&T Stadium", city: "Dallas", country: "EE.UU." },
  { matchNumber: 22, phase: PhaseType.GROUP_STAGE, group: "L", matchday: 2, homeTeam: "gha", awayTeam: "pan", dateCOT: "2026-06-17T17:00", venue: "BMO Field", city: "Toronto", country: "Canadá" },
  { matchNumber: 23, phase: PhaseType.GROUP_STAGE, group: "K", matchday: 2, homeTeam: "uzb", awayTeam: "col", dateCOT: "2026-06-17T20:00", venue: "Estadio Azteca", city: "Ciudad de México", country: "México", isFeatured: true },
  { matchNumber: 24, phase: PhaseType.GROUP_STAGE, group: "K", matchday: 2, homeTeam: "por", awayTeam: "rep-fifa1", dateCOT: "2026-06-17T11:00", venue: "NRG Stadium", city: "Houston", country: "EE.UU." },
  { matchNumber: 25, phase: PhaseType.GROUP_STAGE, group: "A", matchday: 2, homeTeam: "rep-uefad", awayTeam: "rsa", dateCOT: "2026-06-18T10:00", venue: "Mercedes-Benz Stadium", city: "Atlanta", country: "EE.UU." },
  { matchNumber: 26, phase: PhaseType.GROUP_STAGE, group: "B", matchday: 2, homeTeam: "sui", awayTeam: "rep-uefaa", dateCOT: "2026-06-18T13:00", venue: "SoFi Stadium", city: "Los Ángeles", country: "EE.UU." },
  { matchNumber: 27, phase: PhaseType.GROUP_STAGE, group: "B", matchday: 2, homeTeam: "can", awayTeam: "qat", dateCOT: "2026-06-18T16:00", venue: "BC Place", city: "Vancouver", country: "Canadá" },
  { matchNumber: 28, phase: PhaseType.GROUP_STAGE, group: "A", matchday: 2, homeTeam: "mex", awayTeam: "kor", dateCOT: "2026-06-18T19:00", venue: "Estadio Akron (Banorte)", city: "Guadalajara", country: "México" },
  { matchNumber: 29, phase: PhaseType.GROUP_STAGE, group: "C", matchday: 2, homeTeam: "sco", awayTeam: "mar", dateCOT: "2026-06-19T13:00", venue: "Gillette Stadium", city: "Boston", country: "EE.UU." },
  { matchNumber: 30, phase: PhaseType.GROUP_STAGE, group: "C", matchday: 2, homeTeam: "bra", awayTeam: "hai", dateCOT: "2026-06-19T18:00", venue: "Lincoln Financial Field", city: "Filadelfia", country: "EE.UU." },
  { matchNumber: 31, phase: PhaseType.GROUP_STAGE, group: "D", matchday: 2, homeTeam: "rep-uefac", awayTeam: "par", dateCOT: "2026-06-19T21:00", venue: "Levi's Stadium", city: "San Francisco", country: "EE.UU." },
  { matchNumber: 32, phase: PhaseType.GROUP_STAGE, group: "D", matchday: 2, homeTeam: "usa", awayTeam: "aus", dateCOT: "2026-06-19T13:00", venue: "Lumen Field", city: "Seattle", country: "EE.UU." },
  { matchNumber: 33, phase: PhaseType.GROUP_STAGE, group: "F", matchday: 2, homeTeam: "tun", awayTeam: "jpn", dateCOT: "2026-06-20T10:00", venue: "Estadio BBVA", city: "Monterrey", country: "México" },
  { matchNumber: 34, phase: PhaseType.GROUP_STAGE, group: "E", matchday: 2, homeTeam: "ger", awayTeam: "civ", dateCOT: "2026-06-20T11:00", venue: "BMO Field", city: "Toronto", country: "Canadá" },
  { matchNumber: 35, phase: PhaseType.GROUP_STAGE, group: "E", matchday: 2, homeTeam: "ecu", awayTeam: "cuw", dateCOT: "2026-06-20T18:00", venue: "GEHA Arrowhead Stadium", city: "Kansas City", country: "EE.UU." },
  { matchNumber: 36, phase: PhaseType.GROUP_STAGE, group: "F", matchday: 2, homeTeam: "ned", awayTeam: "rep-uefab", dateCOT: "2026-06-20T11:00", venue: "NRG Stadium", city: "Houston", country: "EE.UU." },
  { matchNumber: 37, phase: PhaseType.GROUP_STAGE, group: "H", matchday: 2, homeTeam: "esp", awayTeam: "ksa", dateCOT: "2026-06-21T10:00", venue: "Mercedes-Benz Stadium", city: "Atlanta", country: "EE.UU." },
  { matchNumber: 38, phase: PhaseType.GROUP_STAGE, group: "H", matchday: 2, homeTeam: "uru", awayTeam: "cpv", dateCOT: "2026-06-21T11:00", venue: "Hard Rock Stadium", city: "Miami", country: "EE.UU." },
  { matchNumber: 39, phase: PhaseType.GROUP_STAGE, group: "G", matchday: 2, homeTeam: "nzl", awayTeam: "egy", dateCOT: "2026-06-21T11:00", venue: "BC Place", city: "Vancouver", country: "Canadá" },
  { matchNumber: 40, phase: PhaseType.GROUP_STAGE, group: "G", matchday: 2, homeTeam: "bel", awayTeam: "irn", dateCOT: "2026-06-21T14:00", venue: "SoFi Stadium", city: "Los Ángeles", country: "EE.UU." },
  // ── JORNADA 2 cont: Jun 22-23 ──────────────────────────────────────────
  { matchNumber: 41, phase: PhaseType.GROUP_STAGE, group: "J", matchday: 2, homeTeam: "arg", awayTeam: "aut", dateCOT: "2026-06-22T11:00", venue: "AT&T Stadium", city: "Dallas", country: "EE.UU." },
  { matchNumber: 42, phase: PhaseType.GROUP_STAGE, group: "I", matchday: 2, homeTeam: "nor", awayTeam: "sen", dateCOT: "2026-06-22T19:00", venue: "MetLife Stadium", city: "Nueva York/NJ", country: "EE.UU." },
  { matchNumber: 43, phase: PhaseType.GROUP_STAGE, group: "I", matchday: 2, homeTeam: "fra", awayTeam: "rep-fifa2", dateCOT: "2026-06-22T18:00", venue: "Lincoln Financial Field", city: "Filadelfia", country: "EE.UU." },
  { matchNumber: 44, phase: PhaseType.GROUP_STAGE, group: "J", matchday: 2, homeTeam: "jor", awayTeam: "dza", dateCOT: "2026-06-22T20:00", venue: "Levi's Stadium", city: "San Francisco", country: "EE.UU." },
  { matchNumber: 45, phase: PhaseType.GROUP_STAGE, group: "K", matchday: 2, homeTeam: "col", awayTeam: "rep-fifa1", dateCOT: "2026-06-23T20:00", venue: "Estadio Akron (Banorte)", city: "Guadalajara", country: "México", isFeatured: true },
  { matchNumber: 46, phase: PhaseType.GROUP_STAGE, group: "K", matchday: 2, homeTeam: "por", awayTeam: "uzb", dateCOT: "2026-06-23T11:00", venue: "NRG Stadium", city: "Houston", country: "EE.UU." },
  { matchNumber: 47, phase: PhaseType.GROUP_STAGE, group: "L", matchday: 2, homeTeam: "eng", awayTeam: "gha", dateCOT: "2026-06-23T14:00", venue: "Gillette Stadium", city: "Boston", country: "EE.UU." },
  { matchNumber: 48, phase: PhaseType.GROUP_STAGE, group: "L", matchday: 2, homeTeam: "pan", awayTeam: "cro", dateCOT: "2026-06-23T17:00", venue: "BMO Field", city: "Toronto", country: "Canadá" },
  // ── JORNADA 3 (SIMULTÁNEOS): Jun 24-27 ──────────────────────────────────
  // Group A
  { matchNumber: 49, phase: PhaseType.GROUP_STAGE, group: "A", matchday: 3, homeTeam: "mex", awayTeam: "rep-uefad", dateCOT: "2026-06-24T19:00", venue: "Estadio Azteca", city: "Ciudad de México", country: "México" },
  { matchNumber: 50, phase: PhaseType.GROUP_STAGE, group: "A", matchday: 3, homeTeam: "rsa", awayTeam: "kor", dateCOT: "2026-06-24T19:00", venue: "Estadio BBVA", city: "Monterrey", country: "México" },
  // Group B
  { matchNumber: 51, phase: PhaseType.GROUP_STAGE, group: "B", matchday: 3, homeTeam: "can", awayTeam: "sui", dateCOT: "2026-06-24T13:00", venue: "BC Place", city: "Vancouver", country: "Canadá" },
  { matchNumber: 52, phase: PhaseType.GROUP_STAGE, group: "B", matchday: 3, homeTeam: "qat", awayTeam: "rep-uefaa", dateCOT: "2026-06-24T13:00", venue: "Lumen Field", city: "Seattle", country: "EE.UU." },
  // Group C
  { matchNumber: 53, phase: PhaseType.GROUP_STAGE, group: "C", matchday: 3, homeTeam: "bra", awayTeam: "sco", dateCOT: "2026-06-24T15:00", venue: "Hard Rock Stadium", city: "Miami", country: "EE.UU." },
  { matchNumber: 54, phase: PhaseType.GROUP_STAGE, group: "C", matchday: 3, homeTeam: "mar", awayTeam: "hai", dateCOT: "2026-06-24T15:00", venue: "Mercedes-Benz Stadium", city: "Atlanta", country: "EE.UU." },
  // Group D
  { matchNumber: 55, phase: PhaseType.GROUP_STAGE, group: "D", matchday: 3, homeTeam: "usa", awayTeam: "rep-uefac", dateCOT: "2026-06-25T13:00", venue: "SoFi Stadium", city: "Los Ángeles", country: "EE.UU." },
  { matchNumber: 56, phase: PhaseType.GROUP_STAGE, group: "D", matchday: 3, homeTeam: "par", awayTeam: "aus", dateCOT: "2026-06-25T13:00", venue: "Levi's Stadium", city: "San Francisco", country: "EE.UU." },
  // Group E
  { matchNumber: 57, phase: PhaseType.GROUP_STAGE, group: "E", matchday: 3, homeTeam: "ecu", awayTeam: "ger", dateCOT: "2026-06-25T15:00", venue: "MetLife Stadium", city: "Nueva York/NJ", country: "EE.UU." },
  { matchNumber: 58, phase: PhaseType.GROUP_STAGE, group: "E", matchday: 3, homeTeam: "cuw", awayTeam: "civ", dateCOT: "2026-06-25T15:00", venue: "Lincoln Financial Field", city: "Filadelfia", country: "EE.UU." },
  // Group F
  { matchNumber: 59, phase: PhaseType.GROUP_STAGE, group: "F", matchday: 3, homeTeam: "ned", awayTeam: "tun", dateCOT: "2026-06-25T18:00", venue: "GEHA Arrowhead Stadium", city: "Kansas City", country: "EE.UU." },
  { matchNumber: 60, phase: PhaseType.GROUP_STAGE, group: "F", matchday: 3, homeTeam: "jpn", awayTeam: "rep-uefab", dateCOT: "2026-06-25T18:00", venue: "AT&T Stadium", city: "Dallas", country: "EE.UU." },
  // Group H
  { matchNumber: 61, phase: PhaseType.GROUP_STAGE, group: "H", matchday: 3, homeTeam: "esp", awayTeam: "uru", dateCOT: "2026-06-26T13:00", venue: "Estadio Akron (Banorte)", city: "Guadalajara", country: "México" },
  { matchNumber: 62, phase: PhaseType.GROUP_STAGE, group: "H", matchday: 3, homeTeam: "cpv", awayTeam: "ksa", dateCOT: "2026-06-26T18:00", venue: "NRG Stadium", city: "Houston", country: "EE.UU." },
  // Group G
  { matchNumber: 63, phase: PhaseType.GROUP_STAGE, group: "G", matchday: 3, homeTeam: "bel", awayTeam: "nzl", dateCOT: "2026-06-26T13:00", venue: "BC Place", city: "Vancouver", country: "Canadá" },
  { matchNumber: 64, phase: PhaseType.GROUP_STAGE, group: "G", matchday: 3, homeTeam: "egy", awayTeam: "irn", dateCOT: "2026-06-26T14:00", venue: "Lumen Field", city: "Seattle", country: "EE.UU." },
  // Group I
  { matchNumber: 65, phase: PhaseType.GROUP_STAGE, group: "I", matchday: 3, homeTeam: "nor", awayTeam: "fra", dateCOT: "2026-06-26T14:00", venue: "Gillette Stadium", city: "Boston", country: "EE.UU." },
  { matchNumber: 66, phase: PhaseType.GROUP_STAGE, group: "I", matchday: 3, homeTeam: "sen", awayTeam: "rep-fifa2", dateCOT: "2026-06-26T16:00", venue: "BMO Field", city: "Toronto", country: "Canadá" },
  // Group J
  { matchNumber: 67, phase: PhaseType.GROUP_STAGE, group: "J", matchday: 3, homeTeam: "arg", awayTeam: "jor", dateCOT: "2026-06-27T21:00", venue: "AT&T Stadium", city: "Dallas", country: "EE.UU." },
  { matchNumber: 68, phase: PhaseType.GROUP_STAGE, group: "J", matchday: 3, homeTeam: "dza", awayTeam: "aut", dateCOT: "2026-06-27T22:00", venue: "GEHA Arrowhead Stadium", city: "Kansas City", country: "EE.UU." },
  // Group K — Colombia juega vs Portugal (DESTACADO)
  { matchNumber: 69, phase: PhaseType.GROUP_STAGE, group: "K", matchday: 3, homeTeam: "col", awayTeam: "por", dateCOT: "2026-06-27T17:30", venue: "Hard Rock Stadium", city: "Miami", country: "EE.UU.", isFeatured: true },
  { matchNumber: 70, phase: PhaseType.GROUP_STAGE, group: "K", matchday: 3, homeTeam: "rep-fifa1", awayTeam: "uzb", dateCOT: "2026-06-27T17:30", venue: "Mercedes-Benz Stadium", city: "Atlanta", country: "EE.UU." },
  // Group L
  { matchNumber: 71, phase: PhaseType.GROUP_STAGE, group: "L", matchday: 3, homeTeam: "eng", awayTeam: "pan", dateCOT: "2026-06-27T15:00", venue: "MetLife Stadium", city: "Nueva York/NJ", country: "EE.UU." },
  { matchNumber: 72, phase: PhaseType.GROUP_STAGE, group: "L", matchday: 3, homeTeam: "cro", awayTeam: "gha", dateCOT: "2026-06-27T15:00", venue: "Lincoln Financial Field", city: "Filadelfia", country: "EE.UU." },
  // ── ROUND OF 32 (16avos): Jun 28 – Jul 3 ────────────────────────────────
  { matchNumber: 73, phase: PhaseType.ROUND_OF_32, homeSlot: "2° Grupo A", awaySlot: "2° Grupo B", dateCOT: "2026-06-28T12:00", venue: "SoFi Stadium", city: "Los Ángeles", country: "EE.UU." },
  { matchNumber: 74, phase: PhaseType.ROUND_OF_32, homeSlot: "1° Grupo E", awaySlot: "3° mejor (A/B/C/D/F)", dateCOT: "2026-06-29T15:30", venue: "Gillette Stadium", city: "Boston", country: "EE.UU." },
  { matchNumber: 75, phase: PhaseType.ROUND_OF_32, homeSlot: "1° Grupo F", awaySlot: "2° Grupo C", dateCOT: "2026-06-29T11:00", venue: "Estadio BBVA", city: "Monterrey", country: "México" },
  { matchNumber: 76, phase: PhaseType.ROUND_OF_32, homeSlot: "1° Grupo E", awaySlot: "2° Grupo F", dateCOT: "2026-06-29T12:00", venue: "NRG Stadium", city: "Houston", country: "EE.UU." },
  { matchNumber: 77, phase: PhaseType.ROUND_OF_32, homeSlot: "1° Grupo I", awaySlot: "3° (C/D/F/G/H)", dateCOT: "2026-06-30T16:00", venue: "MetLife Stadium", city: "Nueva York/NJ", country: "EE.UU." },
  { matchNumber: 78, phase: PhaseType.ROUND_OF_32, homeSlot: "2° Grupo E", awaySlot: "2° Grupo I", dateCOT: "2026-06-30T12:00", venue: "AT&T Stadium", city: "Dallas", country: "EE.UU." },
  { matchNumber: 79, phase: PhaseType.ROUND_OF_32, homeSlot: "1° Grupo A", awaySlot: "3° (C/E/F/H/I)", dateCOT: "2026-06-30T20:00", venue: "Estadio Azteca", city: "Ciudad de México", country: "México" },
  { matchNumber: 80, phase: PhaseType.ROUND_OF_32, homeSlot: "1° Grupo L", awaySlot: "3° (E/H/I/J/K)", dateCOT: "2026-07-01T11:00", venue: "Mercedes-Benz Stadium", city: "Atlanta", country: "EE.UU." },
  { matchNumber: 81, phase: PhaseType.ROUND_OF_32, homeSlot: "1° Grupo D", awaySlot: "3° (B/E/F/I/J)", dateCOT: "2026-07-01T20:00", venue: "Levi's Stadium", city: "San Francisco", country: "EE.UU." },
  { matchNumber: 82, phase: PhaseType.ROUND_OF_32, homeSlot: "1° Grupo G", awaySlot: "3° (A/E/H/I/J)", dateCOT: "2026-07-01T14:00", venue: "Lumen Field", city: "Seattle", country: "EE.UU." },
  { matchNumber: 83, phase: PhaseType.ROUND_OF_32, homeSlot: "2° Grupo K", awaySlot: "2° Grupo L", dateCOT: "2026-07-02T12:00", venue: "BC Place", city: "Vancouver", country: "Canadá" },
  { matchNumber: 84, phase: PhaseType.ROUND_OF_32, homeSlot: "2° Grupo H", awaySlot: "1° Grupo J", dateCOT: "2026-07-02T14:00", venue: "SoFi Stadium", city: "Los Ángeles", country: "EE.UU." },
  { matchNumber: 85, phase: PhaseType.ROUND_OF_32, homeSlot: "1° Grupo B", awaySlot: "3° (E/F/G/I/J)", dateCOT: "2026-07-02T12:00", venue: "BMO Field", city: "Toronto", country: "Canadá" },
  { matchNumber: 86, phase: PhaseType.ROUND_OF_32, homeSlot: "1° Grupo C", awaySlot: "3° (A/B/D/F/H)", dateCOT: "2026-07-02T12:00", venue: "Hard Rock Stadium", city: "Miami", country: "EE.UU." },
  { matchNumber: 87, phase: PhaseType.ROUND_OF_32, homeSlot: "2° Grupo D", awaySlot: "2° Grupo G", dateCOT: "2026-07-03T13:00", venue: "AT&T Stadium", city: "Dallas", country: "EE.UU." },
  { matchNumber: 88, phase: PhaseType.ROUND_OF_32, homeSlot: "1° Grupo K", awaySlot: "3° (D/E/I/J/L)", dateCOT: "2026-07-03T12:00", venue: "GEHA Arrowhead Stadium", city: "Kansas City", country: "EE.UU." },
  // ── QUARTER-FINALS: Jul 4-7 ──────────────────────────────────────────────
  { matchNumber: 89, phase: PhaseType.QUARTER_FINALS, homeSlot: "W73", awaySlot: "W75", dateCOT: "2026-07-04T11:00", venue: "NRG Stadium", city: "Houston", country: "EE.UU." },
  { matchNumber: 90, phase: PhaseType.QUARTER_FINALS, homeSlot: "W74", awaySlot: "W77", dateCOT: "2026-07-04T16:00", venue: "Lincoln Financial Field", city: "Filadelfia", country: "EE.UU." },
  { matchNumber: 91, phase: PhaseType.QUARTER_FINALS, homeSlot: "W76", awaySlot: "W78", dateCOT: "2026-07-05T15:00", venue: "MetLife Stadium", city: "Nueva York/NJ", country: "EE.UU." },
  { matchNumber: 92, phase: PhaseType.QUARTER_FINALS, homeSlot: "W79", awaySlot: "W80", dateCOT: "2026-07-05T19:00", venue: "Estadio Azteca", city: "Ciudad de México", country: "México" },
  { matchNumber: 93, phase: PhaseType.QUARTER_FINALS, homeSlot: "W83", awaySlot: "W84", dateCOT: "2026-07-06T14:00", venue: "AT&T Stadium", city: "Dallas", country: "EE.UU." },
  { matchNumber: 94, phase: PhaseType.QUARTER_FINALS, homeSlot: "W81", awaySlot: "W82", dateCOT: "2026-07-06T19:00", venue: "Lumen Field", city: "Seattle", country: "EE.UU." },
  { matchNumber: 95, phase: PhaseType.QUARTER_FINALS, homeSlot: "W86", awaySlot: "W88", dateCOT: "2026-07-07T11:00", venue: "Mercedes-Benz Stadium", city: "Atlanta", country: "EE.UU." },
  { matchNumber: 96, phase: PhaseType.QUARTER_FINALS, homeSlot: "W85", awaySlot: "W87", dateCOT: "2026-07-07T15:00", venue: "BC Place", city: "Vancouver", country: "Canadá" },
  // ── SEMI-FINALS: Jul 9-15 ────────────────────────────────────────────────
  { matchNumber: 97, phase: PhaseType.SEMI_FINALS, homeSlot: "W89", awaySlot: "W90", dateCOT: "2026-07-09T15:30", venue: "Gillette Stadium", city: "Boston", country: "EE.UU." },
  { matchNumber: 98, phase: PhaseType.SEMI_FINALS, homeSlot: "W93", awaySlot: "W94", dateCOT: "2026-07-10T14:00", venue: "SoFi Stadium", city: "Los Ángeles", country: "EE.UU." },
  { matchNumber: 99, phase: PhaseType.SEMI_FINALS, homeSlot: "W91", awaySlot: "W92", dateCOT: "2026-07-11T16:00", venue: "Hard Rock Stadium", city: "Miami", country: "EE.UU." },
  { matchNumber: 100, phase: PhaseType.SEMI_FINALS, homeSlot: "W95", awaySlot: "W96", dateCOT: "2026-07-11T20:00", venue: "GEHA Arrowhead Stadium", city: "Kansas City", country: "EE.UU." },
  { matchNumber: 101, phase: PhaseType.SEMI_FINALS, homeSlot: "W97", awaySlot: "W98", dateCOT: "2026-07-14T14:00", venue: "AT&T Stadium", city: "Dallas", country: "EE.UU." },
  { matchNumber: 102, phase: PhaseType.SEMI_FINALS, homeSlot: "W99", awaySlot: "W100", dateCOT: "2026-07-15T14:00", venue: "SoFi Stadium", city: "Los Ángeles", country: "EE.UU." },
  // ── THIRD PLACE: Jul 18 ──────────────────────────────────────────────────
  { matchNumber: 103, phase: PhaseType.THIRD_PLACE, homeSlot: "L101", awaySlot: "L102", dateCOT: "2026-07-18T15:00", venue: "Hard Rock Stadium", city: "Miami", country: "EE.UU." },
  // ── FINAL: Jul 19 ───────────────────────────────────────────────────────
  { matchNumber: 104, phase: PhaseType.FINAL, homeSlot: "W101", awaySlot: "W102", dateCOT: "2026-07-19T13:00", venue: "MetLife Stadium", city: "Nueva York/NJ", country: "EE.UU." },
];

// ── MAIN SEED FUNCTION ───────────────────────────────────────────────────────
async function main() {
  console.log("🌱 Starting GolazoZone 2026 seed...");

  // 1. Scoring Config (singleton)
  await prisma.scoringConfig.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });
  console.log("✅ ScoringConfig created");

  // 2. Phases
  const phaseMap = new Map<PhaseType, string>();
  for (const p of phases) {
    const phase = await prisma.phase.upsert({
      where: { slug: p.slug },
      update: { name: p.name, order: p.order },
      create: { name: p.name, slug: p.slug, order: p.order, startDate: p.startDate, endDate: p.endDate },
    });
    phaseMap.set(p.slug, phase.id);
  }
  console.log("✅ Phases created");

  // 3. Groups
  const groupMap = new Map<string, string>();
  for (const letter of groups) {
    const grp = await prisma.tournamentGroup.upsert({
      where: { letter },
      update: {},
      create: { name: `Grupo ${letter}`, letter },
    });
    groupMap.set(letter, grp.id);
  }
  console.log("✅ Groups created");

  // 4. Teams
  const teamMap = new Map<string, string>();
  for (const t of teams) {
    const team = await prisma.team.upsert({
      where: { shortCode: t.shortCode },
      update: { name: t.name, flag: t.flag, confirmed: t.confirmed },
      create: {
        id: t.id,
        name: t.name,
        shortCode: t.shortCode,
        flag: t.flag,
        confirmed: t.confirmed,
        playoffSlotLabel: t.playoffSlotLabel,
        playoffCandidates: t.playoffCandidates,
      },
    });
    teamMap.set(t.id, team.id);
  }
  console.log("✅ Teams created:", teamMap.size);

  // 5. Team-Group assignments
  for (const [letter, teamIds] of Object.entries(groupAssignments)) {
    const groupId = groupMap.get(letter)!;
    for (const teamId of teamIds) {
      const dbTeamId = teamMap.get(teamId)!;
      await prisma.teamGroup.upsert({
        where: { teamId_groupId: { teamId: dbTeamId, groupId } },
        update: {},
        create: { teamId: dbTeamId, groupId },
      });
    }
  }
  console.log("✅ Team-Group assignments created");

  // 6. Matches
  for (const m of matchSeeds) {
    const phaseId = phaseMap.get(m.phase)!;
    const groupId = m.group ? groupMap.get(m.group) : undefined;
    const homeTeamId = m.homeTeam ? teamMap.get(m.homeTeam) : undefined;
    const awayTeamId = m.awayTeam ? teamMap.get(m.awayTeam) : undefined;
    const dateUTC = cotToUtc(m.dateCOT);
    const lock = lockAt(dateUTC);

    await prisma.match.upsert({
      where: { matchNumber: m.matchNumber },
      update: {},
      create: {
        matchNumber: m.matchNumber,
        phaseId,
        groupId: groupId ?? null,
        matchday: m.matchday ?? null,
        homeTeamId: homeTeamId ?? null,
        awayTeamId: awayTeamId ?? null,
        homeSlotLabel: m.homeSlot ?? null,
        awaySlotLabel: m.awaySlot ?? null,
        dateUTC,
        dateColombia: m.dateCOT,
        venue: m.venue,
        city: m.city,
        country: m.country,
        lockAt: lock,
        isFeatured: m.isFeatured ?? false,
      },
    });
  }
  console.log("✅ Matches created:", matchSeeds.length);

  // 7. Superadmin user
  const hashedPassword = await bcrypt.hash("SuperAdmin2026!", 12);
  await prisma.user.upsert({
    where: { email: "admin@golazozone.com" },
    update: {},
    create: {
      email: "admin@golazozone.com",
      name: "Super Admin",
      password: hashedPassword,
      role: Role.SUPERADMIN,
      emailVerified: new Date(),
    },
  });
  console.log("✅ Superadmin created: admin@golazozone.com / SuperAdmin2026!");

  console.log("🏆 Seed complete! GolazoZone 2026 is ready.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
