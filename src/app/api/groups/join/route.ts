import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const joinSchema = z.object({ code: z.string().length(6) });

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const parsed = joinSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Código inválido" }, { status: 400 });

  const group = await db.friendGroup.findUnique({
    where: { code: parsed.data.code },
    include: { _count: { select: { members: true } } },
  });

  if (!group) return NextResponse.json({ error: "Grupo no encontrado" }, { status: 404 });
  if (!group.isActive) return NextResponse.json({ error: "Grupo inactivo" }, { status: 403 });

  const existing = await db.friendGroupMember.findUnique({
    where: { groupId_userId: { groupId: group.id, userId: session.user.id } },
  });
  if (existing) return NextResponse.json({ error: "Ya eres miembro de este grupo" }, { status: 409 });

  const member = await db.friendGroupMember.create({
    data: { groupId: group.id, userId: session.user.id },
  });

  return NextResponse.json({
    group: {
      id: group.id,
      name: group.name,
      description: group.description,
      code: group.code,
      memberCount: group._count.members + 1,
      currentUserRank: member.groupRank,
      currentUserPoints: member.groupPoints,
    },
  });
}
