/**
 * One-time migration: fix phase assignments for FIFA 2026 knockout stage.
 *
 * Before:
 *   QUARTER_FINALS → matches 89-96 (actually Octavos / Round of 16)
 *   SEMI_FINALS    → matches 97-102 (mixes Cuartos 97-100 + Semis 101-102)
 *
 * After:
 *   ROUND_OF_16    → matches 89-96  (Octavos de Final)
 *   QUARTER_FINALS → matches 97-100 (Cuartos de Final)
 *   SEMI_FINALS    → matches 101-102 (Semifinales)
 */

import { PrismaClient, PhaseType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // ── 1. Create the new ROUND_OF_16 Phase record ─────────────────────────────
  const r16 = await prisma.phase.create({
    data: {
      name: "Octavos de Final",
      slug: PhaseType.ROUND_OF_16,
      order: 3,
      startDate: new Date("2026-07-04"),
      endDate: new Date("2026-07-07"),
    },
  });
  console.log("Created phase:", r16.slug, r16.name);

  // ── 2. Update order of existing knockout phases ─────────────────────────────
  await prisma.phase.update({
    where: { slug: PhaseType.QUARTER_FINALS },
    data: { name: "Cuartos de Final", order: 4 },
  });
  await prisma.phase.update({
    where: { slug: PhaseType.SEMI_FINALS },
    data: { name: "Semifinales", order: 5 },
  });
  await prisma.phase.update({
    where: { slug: PhaseType.THIRD_PLACE },
    data: { order: 6 },
  });
  await prisma.phase.update({
    where: { slug: PhaseType.FINAL },
    data: { order: 7 },
  });
  console.log("Updated phase orders");

  // ── 3. Fetch phase ids we need ──────────────────────────────────────────────
  const [qfPhase, sfPhase] = await Promise.all([
    prisma.phase.findUnique({ where: { slug: PhaseType.QUARTER_FINALS } }),
    prisma.phase.findUnique({ where: { slug: PhaseType.SEMI_FINALS } }),
  ]);
  if (!qfPhase || !sfPhase) throw new Error("Could not find required phases");

  // ── 4. Move matches 89-96 (currently QUARTER_FINALS) → ROUND_OF_16 ─────────
  const moved89to96 = await prisma.match.updateMany({
    where: { matchNumber: { gte: 89, lte: 96 } },
    data: { phaseId: r16.id },
  });
  console.log(`Moved ${moved89to96.count} matches (89-96) to ROUND_OF_16`);

  // ── 5. Move matches 97-100 (currently SEMI_FINALS) → QUARTER_FINALS ─────────
  const moved97to100 = await prisma.match.updateMany({
    where: { matchNumber: { gte: 97, lte: 100 } },
    data: { phaseId: qfPhase.id },
  });
  console.log(`Moved ${moved97to100.count} matches (97-100) to QUARTER_FINALS`);

  // Matches 101-102 remain in SEMI_FINALS — no action needed
  console.log("Matches 101-102 stay in SEMI_FINALS ✓");

  // ── 6. Verify ────────────────────────────────────────────────────────────────
  const counts = await prisma.phase.findMany({
    select: { slug: true, name: true, order: true, _count: { select: { matches: true } } },
    orderBy: { order: "asc" },
  });
  console.log("\nFinal phase match counts:");
  for (const p of counts) {
    console.log(`  [${p.order}] ${p.slug} (${p.name}): ${p._count.matches} matches`);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
