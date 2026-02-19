import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") ?? "50");
  const groupId = searchParams.get("groupId");

  if (groupId) {
    // Friend group leaderboard
    const members = await db.friendGroupMember.findMany({
      where: { groupId },
      orderBy: { groupPoints: "desc" },
      take: limit,
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    return NextResponse.json({
      leaderboard: members.map((m, i) => ({
        userId: m.userId,
        name: m.user.name,
        image: m.user.image,
        totalPoints: m.groupPoints,
        globalRank: m.groupRank,
        rank: i + 1,
      })),
    });
  }

  // Global leaderboard
  const entries = await db.leaderboard.findMany({
    orderBy: { totalPoints: "desc" },
    take: limit,
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
  });

  const session = await auth();
  const currentUserId = session?.user?.id;

  return NextResponse.json({
    leaderboard: entries.map((e, i) => ({
      userId: e.userId,
      name: e.user.name,
      image: e.user.image,
      totalPoints: e.totalPoints,
      globalRank: i + 1,
      matchesPlayed: e.matchesPlayed,
      exactScores: e.exactScores,
      accuracy: e.accuracy,
      isCurrentUser: e.userId === currentUserId,
    })),
  });
}
