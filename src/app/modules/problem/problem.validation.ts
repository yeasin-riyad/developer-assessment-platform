import { z } from "zod";

const optionSchema = z.object({
  text: z.string().min(1),
  isCorrect: z.boolean().default(false),
});

const testCaseSchema = z.object({
  input: z.string(),
  expectedOutput: z.string(),
  isHidden: z.boolean().default(true),
});

export const createProblemSchema = z.object({
  title: z.string().min(3).max(200),

  description: z.string().min(10),

  type: z.enum(["CODING", "MCQ", "WRITTEN"]),

  difficulty: z
    .enum(["EASY", "MEDIUM", "HARD"])
    .default("MEDIUM"),

  points: z.number().int().positive().default(10),

  options: z.array(optionSchema).optional(),

  testCases: z.array(testCaseSchema).optional(),
});