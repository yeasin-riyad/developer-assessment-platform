import { z } from "zod";

export const createSubmissionSchema = z.object({
  problemId: z.uuid(),
  answer: z.string().min(1),
  language: z.string().optional(),
});