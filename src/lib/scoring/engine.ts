// GolazoZone 2026 — Scoring Engine
// Calculates points for a user's prediction against the real result

import type { Prediction, Result, ScoringConfig, WinnerEnum } from "@prisma/client";

export function computeWinner(homeScore: number, awayScore: number): WinnerEnum {
  if (homeScore > awayScore) return "HOME";
  if (awayScore > homeScore) return "AWAY";
  return "DRAW";
}

export interface ScoreBreakdown {
  pointsWinner: number;
  pointsExactScore: number;
  pointsTopScorer: number;
  pointsFirstScorer: number;
  pointsMvp: number;
  pointsYellowCards: number;
  pointsRedCards: number;
  pointsMostPasses: number;
  pointsPerfectBonus: number;
  totalPoints: number;
}

export function calculateScore(
  prediction: Prediction,
  result: Result,
  config: ScoringConfig
): ScoreBreakdown {
  const breakdown: ScoreBreakdown = {
    pointsWinner: 0,
    pointsExactScore: 0,
    pointsTopScorer: 0,
    pointsFirstScorer: 0,
    pointsMvp: 0,
    pointsYellowCards: 0,
    pointsRedCards: 0,
    pointsMostPasses: 0,
    pointsPerfectBonus: 0,
    totalPoints: 0,
  };

  const predictedWinner = computeWinner(prediction.homeScore, prediction.awayScore);
  const actualWinner = result.winner;
  const isExactScore =
    prediction.homeScore === result.homeScore &&
    prediction.awayScore === result.awayScore;

  // Exact score (includes correct winner)
  if (isExactScore) {
    breakdown.pointsExactScore = config.pointsExactScore;
  } else if (predictedWinner === actualWinner) {
    // Correct winner but wrong score
    breakdown.pointsWinner = config.pointsWinner;
  }

  // Top scorer
  if (
    prediction.topScorer &&
    result.topScorer &&
    normalize(prediction.topScorer) === normalize(result.topScorer)
  ) {
    breakdown.pointsTopScorer = config.pointsTopScorer;
  }

  // First scorer
  if (
    prediction.firstScorer &&
    result.firstScorer &&
    normalize(prediction.firstScorer) === normalize(result.firstScorer)
  ) {
    breakdown.pointsFirstScorer = config.pointsFirstScorer;
  }

  // MVP
  if (
    prediction.mvp &&
    result.mvp &&
    normalize(prediction.mvp) === normalize(result.mvp)
  ) {
    breakdown.pointsMvp = config.pointsMvp;
  }

  // Yellow cards
  if (
    prediction.yellowCards !== null &&
    prediction.yellowCards !== undefined &&
    prediction.yellowCards === result.yellowCards
  ) {
    breakdown.pointsYellowCards = config.pointsYellowCards;
  }

  // Red cards
  if (
    prediction.redCards !== null &&
    prediction.redCards !== undefined &&
    prediction.redCards === result.redCards
  ) {
    breakdown.pointsRedCards = config.pointsRedCards;
  }

  // Most passes
  if (
    prediction.mostPasses &&
    result.mostPasses &&
    normalize(prediction.mostPasses) === normalize(result.mostPasses)
  ) {
    breakdown.pointsMostPasses = config.pointsMostPasses;
  }

  // Sum subtotal
  const subtotal =
    breakdown.pointsWinner +
    breakdown.pointsExactScore +
    breakdown.pointsTopScorer +
    breakdown.pointsFirstScorer +
    breakdown.pointsMvp +
    breakdown.pointsYellowCards +
    breakdown.pointsRedCards +
    breakdown.pointsMostPasses;

  // Perfect bonus: all fields correct
  const allFieldsPerfect =
    isExactScore &&
    breakdown.pointsTopScorer > 0 &&
    breakdown.pointsFirstScorer > 0 &&
    breakdown.pointsMvp > 0 &&
    breakdown.pointsYellowCards > 0 &&
    breakdown.pointsRedCards > 0 &&
    breakdown.pointsMostPasses > 0;

  if (allFieldsPerfect) {
    breakdown.pointsPerfectBonus = config.pointsPerfectBonus;
  }

  breakdown.totalPoints = subtotal + breakdown.pointsPerfectBonus;

  return breakdown;
}

function normalize(str: string): string {
  return str.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
