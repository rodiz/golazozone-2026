import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { predictionSchema } from "@/lib/validations/prediction";
import { computeWinner } from "@/lib/scoring/engine";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = predictionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const data = parsed.data;

    // Check match exists and is not locked
    const match = await db.match.findUnique({ where: { id: data.matchId } });
    if (!match) return NextResponse.json({ error: "Partido no encontrado" }, { status: 404 });
    if (!match.predictable) return NextResponse.json({ error: "Partido no pronosticable" }, { status: 403 });
    if (new Date() >= match.lockAt) {
      return NextResponse.json({ error: "Los pronósticos ya cerraron para este partido" }, { status: 403 });
    }

    const winner = computeWinner(data.homeScore, data.awayScore);

    const prediction = await db.prediction.upsert({
      where: { userId_matchId: { userId: session.user.id, matchId: data.matchId } },
      update: {
        homeScore: data.homeScore,
        awayScore: data.awayScore,
        winner,
        topScorer: data.topScorer ?? null,
        firstScorer: data.firstScorer ?? null,
        mvp: data.mvp ?? null,
        yellowCards: data.yellowCards ?? null,
        redCards: data.redCards ?? null,
        mostPasses: data.mostPasses ?? null,
      },
      create: {
        userId: session.user.id,
        matchId: data.matchId,
        homeScore: data.homeScore,
        awayScore: data.awayScore,
        winner,
        topScorer: data.topScorer ?? null,
        firstScorer: data.firstScorer ?? null,
        mvp: data.mvp ?? null,
        yellowCards: data.yellowCards ?? null,
        redCards: data.redCards ?? null,
        mostPasses: data.mostPasses ?? null,
      },
    });

    return NextResponse.json({ prediction }, { status: 200 });
  } catch (error) {
    console.error("[PREDICTIONS POST]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const matchId = searchParams.get("matchId");

  const where = matchId
    ? { userId: session.user.id, matchId }
    : { userId: session.user.id };

  const predictions = await db.prediction.findMany({
    where,
    include: {
      match: {
        include: {
          home: true,
          away: true,
          phase: true,
          group: true,
          result: true,
        },
      },
      score: true,
    },
    orderBy: { match: { dateUTC: "asc" } },
  });

  return NextResponse.json({ predictions });
}
