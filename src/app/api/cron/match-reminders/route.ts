// Vercel Cron Job — runs every hour
// Sends email reminders for matches starting in 2 hours

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendMatchReminderEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const twoHoursAndFiveMins = new Date(now.getTime() + 2 * 60 * 60 * 1000 + 5 * 60 * 1000);

  // Find matches starting in ~2 hours
  const upcomingMatches = await db.match.findMany({
    where: {
      status: "SCHEDULED",
      dateUTC: { gte: twoHoursLater, lte: twoHoursAndFiveMins },
    },
    include: {
      home: true,
      away: true,
    },
  });

  let reminders = 0;

  for (const match of upcomingMatches) {
    // Get users who haven't predicted this match
    const usersWithoutPrediction = await db.user.findMany({
      where: {
        isBlocked: false,
        emailVerified: { not: null },
        predictions: { none: { matchId: match.id } },
      },
      select: { email: true, name: true },
    });

    const homeTeamName = match.home?.name ?? match.homeSlotLabel ?? "Local";
    const awayTeamName = match.away?.name ?? match.awaySlotLabel ?? "Visitante";

    for (const user of usersWithoutPrediction) {
      try {
        await sendMatchReminderEmail(user.email, user.name ?? "crack", {
          homeTeam: homeTeamName,
          awayTeam: awayTeamName,
          venue: match.venue,
          time: match.dateColombia,
        });
        reminders++;
      } catch (e) {
        console.error(`Failed to send reminder to ${user.email}:`, e);
      }
    }
  }

  return NextResponse.json({
    matchesFound: upcomingMatches.length,
    remindersSent: reminders,
    timestamp: now.toISOString(),
  });
}
