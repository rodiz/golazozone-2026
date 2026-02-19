import type { Role, MatchStatus, PhaseType, WinnerEnum, NotificationType } from "@prisma/client";

// ── Auth ──────────────────────────────────────────────────────
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: Role;
      emailVerified: Date | null;
    };
  }
}

// ── Match ─────────────────────────────────────────────────────
export interface MatchWithDetails {
  id: string;
  matchNumber: number;
  phase: { slug: PhaseType; name: string };
  group: { letter: string; name: string } | null;
  matchday: number | null;
  // Prisma relation names (home/away) aliased as homeTeam/awayTeam
  homeTeam: TeamInfo | null;
  awayTeam: TeamInfo | null;
  // Also accept Prisma raw names for server component usage
  home?: TeamInfo | null;
  away?: TeamInfo | null;
  homeSlotLabel: string | null;
  awaySlotLabel: string | null;
  dateUTC: Date;
  dateColombia: string;
  venue: string;
  city: string;
  country: string;
  status: MatchStatus;
  predictable: boolean;
  lockAt: Date;
  isFeatured: boolean;
  result: ResultInfo | null;
  userPrediction?: PredictionInfo | null;
}

export interface TeamInfo {
  id: string;
  name: string;
  shortCode: string;
  flag: string;
  confirmed: boolean;
  playoffSlotLabel: string | null;
  playoffCandidates: string | null;
}

export interface ResultInfo {
  homeScore: number;
  awayScore: number;
  winner: WinnerEnum;
  topScorer: string | null;
  firstScorer: string | null;
  mvp: string | null;
  yellowCards: number;
  redCards: number;
  mostPasses: string | null;
}

export interface PredictionInfo {
  id: string;
  homeScore: number;
  awayScore: number;
  winner: WinnerEnum;
  topScorer: string | null;
  firstScorer: string | null;
  mvp: string | null;
  yellowCards: number | null;
  redCards: number | null;
  mostPasses: string | null;
  lockedAt: Date | null;
  score?: {
    totalPoints: number;
    pointsWinner: number;
    pointsExactScore: number;
    pointsTopScorer: number;
    pointsFirstScorer: number;
    pointsMvp: number;
    pointsYellowCards: number;
    pointsRedCards: number;
    pointsMostPasses: number;
    pointsPerfectBonus: number;
  } | null;
}

// ── Leaderboard ───────────────────────────────────────────────
export interface LeaderboardEntry {
  userId: string;
  name: string | null;
  image: string | null;
  totalPoints: number;
  globalRank: number;
  matchesPlayed: number;
  exactScores: number;
  accuracy: number;
}

// ── Groups ────────────────────────────────────────────────────
export interface FriendGroupWithMembers {
  id: string;
  name: string;
  description: string | null;
  code: string;
  isActive: boolean;
  memberCount: number;
  currentUserRank: number;
  currentUserPoints: number;
}

// ── Notifications ─────────────────────────────────────────────
export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  sentAt: Date;
}

// ── Dashboard stats ───────────────────────────────────────────
export interface DashboardStats {
  totalPoints: number;
  globalRank: number;
  matchesPredicted: number;
  exactScores: number;
  upcomingMatches: MatchWithDetails[];
  recentResults: Array<MatchWithDetails & { pointsEarned: number }>;
  unreadNotifications: number;
}
