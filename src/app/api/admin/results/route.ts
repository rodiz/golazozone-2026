import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { computeWinner, calculateScore } from "@/lib/scoring/engine";

const resultSchema = z.object({
  matchId: z.string().cuid(),
  homeScore: z.number().int().min(0).max(30),
  awayScore: z.number().int().min(0).max(30),
  topScorer: z.string().max(100).optional().nullable(),
  firstScorer: z.string().max(100).optional().nullable(),
  mvp: z.string().max(100).optional().nullable(),
  yellowCards: z.number().int().min(0).max(20).default(0),
  redCards: z.number().int().min(0).max(10).default(0),
  mostPasses: z.string().max(100).optional().nullable(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = resultSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const data = parsed.data;
    const winner = computeWinner(data.homeScore, data.awayScore);

    // Upsert result
    const result = await db.result.upsert({
      where: { matchId: data.matchId },
      update: {
        homeScore: data.homeScore,
        awayScore: data.awayScore,
        winner,
        topScorer: data.topScorer ?? null,
        firstScorer: data.firstScorer ?? null,
        mvp: data.mvp ?? null,
        yellowCards: data.yellowCards,
        redCards: data.redCards,
        mostPasses: data.mostPasses ?? null,
      },
      create: {
        matchId: data.matchId,
        homeScore: data.homeScore,
        awayScore: data.awayScore,
        winner,
        topScorer: data.topScorer ?? null,
        firstScorer: data.firstScorer ?? null,
        mvp: data.mvp ?? null,
        yellowCards: data.yellowCards,
        redCards: data.redCards,
        mostPasses: data.mostPasses ?? null,
      },
    });

    // Update match status
    await db.match.update({
      where: { id: data.matchId },
      data: { status: "FINISHED" },
    });

    // Get scoring config
    const config = await db.scoringConfig.findFirst();
    if (!config) throw new Error("ScoringConfig not found");

    // Calculate and save scores for all predictions of this match
    const predictions = await db.prediction.findMany({
      where: { matchId: data.matchId },
    });

    for (const pred of predictions) {
      const breakdown = calculateScore(pred, result, config);

      await db.predictionScore.upsert({
        where: { predictionId: pred.id },
        update: {
          pointsWinner: breakdown.pointsWinner,
          pointsExactScore: breakdown.pointsExactScore,
          pointsTopScorer: breakdown.pointsTopScorer,
          pointsFirstScorer: breakdown.pointsFirstScorer,
          pointsMvp: breakdown.pointsMvp,
          pointsYellowCards: breakdown.pointsYellowCards,
          pointsRedCards: breakdown.pointsRedCards,
          pointsMostPasses: breakdown.pointsMostPasses,
          pointsPerfectBonus: breakdown.pointsPerfectBonus,
          totalPoints: breakdown.totalPoints,
          calculatedAt: new Date(),
        },
        create: {
          predictionId: pred.id,
          pointsWinner: breakdown.pointsWinner,
          pointsExactScore: breakdown.pointsExactScore,
          pointsTopScorer: breakdown.pointsTopScorer,
          pointsFirstScorer: breakdown.pointsFirstScorer,
          pointsMvp: breakdown.pointsMvp,
          pointsYellowCards: breakdown.pointsYellowCards,
          pointsRedCards: breakdown.pointsRedCards,
          pointsMostPasses: breakdown.pointsMostPasses,
          pointsPerfectBonus: breakdown.pointsPerfectBonus,
          totalPoints: breakdown.totalPoints,
        },
      });

      // Update leaderboard
      const leaderboard = await db.leaderboard.findUnique({ where: { userId: pred.userId } });
      if (leaderboard) {
        const isExact = breakdown.pointsExactScore > 0;
        const isCorrectWinner = breakdown.pointsWinner > 0 || isExact;
        const newTotal = leaderboard.totalPoints + breakdown.totalPoints;
        const newMatches = leaderboard.matchesPlayed + 1;
        const newExact = leaderboard.exactScores + (isExact ? 1 : 0);
        const newCorrect = leaderboard.correctWinners + (isCorrectWinner ? 1 : 0);
        const accuracy = newMatches > 0 ? (newCorrect / newMatches) * 100 : 0;

        await db.leaderboard.update({
          where: { userId: pred.userId },
          data: {
            totalPoints: newTotal,
            matchesPlayed: newMatches,
            exactScores: newExact,
            correctWinners: newCorrect,
            accuracy,
          },
        });

        // Update friend group points
        await db.friendGroupMember.updateMany({
          where: { userId: pred.userId },
          data: { groupPoints: { increment: breakdown.totalPoints } },
        });
      }
    }

    // Recalculate global ranks
    const allEntries = await db.leaderboard.findMany({
      orderBy: { totalPoints: "desc" },
    });
    for (let i = 0; i < allEntries.length; i++) {
      await db.leaderboard.update({
        where: { id: allEntries[i].id },
        data: { globalRank: i + 1 },
      });
    }

    // Audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "RESULT_CREATED",
        entity: "Match",
        entityId: data.matchId,
        metadata: { homeScore: data.homeScore, awayScore: data.awayScore },
      },
    });

    return NextResponse.json({ result, predictionsUpdated: predictions.length });
  } catch (error) {
    console.error("[ADMIN RESULTS POST]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
