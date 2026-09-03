import { z } from "zod";

export const createAssessmentSchema = z.object({
  title: z
    .string()
    .min(3)
    .max(200),

  description: z
    .string()
    .max(1000)
    .optional(),

  duration: z
    .number()
    .int()
    .positive(),
});

export const updateAssessmentSchema = z.object({
  title: z
    .string()
    .min(3)
    .max(200)
    .optional(),

  description: z
    .string()
    .max(1000)
    .optional(),

  duration: z
    .number()
    .int()
    .positive()
    .optional(),
});

export const addProblemSchema = z.object({
  problemId: z
    .uuid(),

  points: z
    .number()
    .int()
    .positive(),

  order: z
    .number()
    .int()
    .positive(),
});