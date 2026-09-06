import { z } from "zod";

export const resultQuerySchema = z.object({
  status: z
    .enum(["PASS", "FAIL"])
    .optional(),
});

export type ResultQueryInput =
  z.infer<typeof resultQuerySchema>;