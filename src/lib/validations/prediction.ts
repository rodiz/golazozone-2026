import { z } from "zod";

export const predictionSchema = z.object({
  matchId: z.string().cuid(),
  homeScore: z.number().int().min(0).max(30),
  awayScore: z.number().int().min(0).max(30),
  topScorer: z.string().max(100).optional(),
  firstScorer: z.string().max(100).optional(),
  mvp: z.string().max(100).optional(),
  yellowCards: z.number().int().min(0).max(20).optional(),
  redCards: z.number().int().min(0).max(10).optional(),
  mostPasses: z.string().max(100).optional(),
});

export type PredictionInput = z.infer<typeof predictionSchema>;
