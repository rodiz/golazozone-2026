import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateGroupCode } from "@/lib/utils";
import { z } from "zod";

const createGroupSchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().max(200).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const memberships = await db.friendGroupMember.findMany({
    where: { userId: session.user.id },
    include: {
      group: {
        include: {
          _count: { select: { members: true } },
        },
      },
    },
    orderBy: { joinedAt: "desc" },
  });

  const groups = memberships.map((m) => ({
    id: m.group.id,
    name: m.group.name,
    description: m.group.description,
    code: m.group.code,
    memberCount: m.group._count.members,
    currentUserRank: m.groupRank,
    currentUserPoints: m.groupPoints,
  }));

  return NextResponse.json({ groups });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const parsed = createGroupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const { name, description } = parsed.data;
  let code = generateGroupCode();

  // Ensure unique code
  let attempts = 0;
  while (await db.friendGroup.findUnique({ where: { code } }) && attempts < 10) {
    code = generateGroupCode();
    attempts++;
  }

  const group = await db.friendGroup.create({
    data: {
      name,
      description: description ?? null,
      code,
      ownerId: session.user.id,
      members: {
        create: { userId: session.user.id },
      },
    },
    include: { _count: { select: { members: true } } },
  });

  return NextResponse.json({
    group: {
      id: group.id,
      name: group.name,
      description: group.description,
      code: group.code,
      memberCount: group._count.members,
      currentUserRank: 1,
      currentUserPoints: 0,
    },
  }, { status: 201 });
}
