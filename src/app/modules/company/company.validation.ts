import { z } from "zod";

export const createCompanySchema = z.object({
  name: z.string().min(2).max(150),
  description: z.string().max(1000).optional(),
  website: z.url().optional(),
  logo: z.url().optional(),
});