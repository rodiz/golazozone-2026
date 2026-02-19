import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const phase = searchParams.get("phase");
  const group = searchParams.get("group");

  const session = await auth();
  const userId = session?.user?.id;

  const matches = await db.match.findMany({
    where: {
      ...(phase ? { phase: { slug: phase as any } } : {}),
      ...(group ? { group: { letter: group } } : {}),
    },
    include: {
      phase: { select: { slug: true, name: true } },
      group: { select: { letter: true, name: true } },
      home: true,
      away: true,
      result: true,
      predictions: userId
        ? {
            where: { userId },
            include: { score: true },
          }
        : false,
    },
    orderBy: { dateUTC: "asc" },
  });

  // Shape response to add userPrediction
  const shaped = matches.map((m) => {
    const preds = (m as any).predictions;
    const userPrediction = Array.isArray(preds) && preds.length > 0 ? preds[0] : null;
    const { predictions: _, ...rest } = m as any;
    return { ...rest, userPrediction };
  });

  return NextResponse.json({ matches: shaped });
}
