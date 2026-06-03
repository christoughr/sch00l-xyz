import { z } from "zod";

export const studentContextSchema = z
  .object({
    streakDays: z.number().int().min(0).max(3650),
    totalSessions: z.number().int().min(0).max(100000),
    latestLift: z.string().max(120).nullable().optional(),
    preScoreToday: z.number().int().min(0).max(100).nullable().optional(),
    weakTopics: z
      .array(
        z.object({
          subject: z.string().max(20),
          topic: z.string().max(80),
          confidence: z.number().int().min(0).max(100),
        })
      )
      .max(8)
      .optional(),
    strongTopics: z
      .array(
        z.object({
          subject: z.string().max(20),
          topic: z.string().max(80),
          confidence: z.number().int().min(0).max(100),
        })
      )
      .max(5)
      .optional(),
    recentTopics: z
      .array(
        z.object({
          subject: z.string().max(20),
          topic: z.string().max(80),
          confidence: z.number().int().min(0).max(100),
        })
      )
      .max(8)
      .optional(),
    recentSessionSummaries: z.array(z.string().max(400)).max(6).optional(),
  })
  .optional();

export type ParsedStudentContext = z.infer<typeof studentContextSchema>;
