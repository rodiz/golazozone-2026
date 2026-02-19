import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const scoringSchema = z.object({
  pointsWinner: z.number().int().min(0).max(10),
  pointsExactScore: z.number().int().min(0).max(10),
  pointsTopScorer: z.number().int().min(0).max(10),
  pointsFirstScorer: z.number().int().min(0).max(10),
  pointsMvp: z.number().int().min(0).max(10),
  pointsYellowCards: z.number().int().min(0).max(5),
  pointsRedCards: z.number().int().min(0).max(10),
  pointsMostPasses: z.number().int().min(0).max(5),
  pointsPerfectBonus: z.number().int().min(0).max(20),
});

export async function GET() {
  const config = await db.scoringConfig.findFirst();
  return NextResponse.json({ config });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = scoringSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const config = await db.scoringConfig.upsert({
    where: { id: "singleton" },
    update: { ...parsed.data, updatedBy: session.user.id },
    create: { id: "singleton", ...parsed.data, updatedBy: session.user.id },
  });

  await db.auditLog.create({
    data: {
      userId: session.user.id,
      action: "SCORING_UPDATED",
      entity: "ScoringConfig",
      entityId: "singleton",
      metadata: parsed.data,
    },
  });

  return NextResponse.json({ config });
}
