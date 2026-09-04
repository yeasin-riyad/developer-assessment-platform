import { z } from "zod";

export const saveAnswerSchema = z.object({
  problemId: z.uuid(),

  answer: z.string(),
});