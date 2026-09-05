import { z } from "zod";

export const manualEvaluationSchema = z.object({
  score: z.number().int().min(0),

  feedback: z
    .string()
    .max(2000)
    .optional(),
});

export type ManualEvaluationInput =
  z.infer<typeof manualEvaluationSchema>;