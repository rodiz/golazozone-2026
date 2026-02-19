// Vercel Cron Job — runs every 5 minutes
// Locks predictions for matches that have started (past their lockAt time)

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Validate cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Find predictions that should be locked (match lockAt has passed, prediction not yet locked)
  const predictionsToLock = await db.prediction.findMany({
    where: {
      lockedAt: null,
      match: {
        lockAt: { lte: now },
        status: { in: ["SCHEDULED", "LIVE"] },
      },
    },
    select: { id: true, matchId: true },
  });

  if (predictionsToLock.length > 0) {
    await db.prediction.updateMany({
      where: { id: { in: predictionsToLock.map((p) => p.id) } },
      data: { lockedAt: now },
    });

    // Update match status to LIVE for matches that just started
    const matchIds = [...new Set(predictionsToLock.map((p) => p.matchId))];
    await db.match.updateMany({
      where: {
        id: { in: matchIds },
        status: "SCHEDULED",
        lockAt: { lte: now },
      },
      data: { status: "LIVE" },
    });
  }

  return NextResponse.json({
    locked: predictionsToLock.length,
    timestamp: now.toISOString(),
  });
}
