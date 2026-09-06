import { z } from "zod";

export const updateUserRoleSchema = z.object({
  role: z.enum([
    "CANDIDATE",
    "RECRUITER",
    "CREATOR",
    "EVALUATOR",
    "ADMIN",
  ]),
});

export const updateUserStatusSchema = z.object({
  isActive: z.boolean(),
});

export const getUsersQuerySchema = z.object({
  role: z
    .enum([
      "CANDIDATE",
      "RECRUITER",
      "CREATOR",
      "EVALUATOR",
      "ADMIN",
    ])
    .optional(),

  isActive: z
    .enum(["true", "false"])
    .optional(),

  search: z
    .string()
    .trim()
    .min(1)
    .optional(),
});

export type UpdateUserRoleInput =
  z.infer<typeof updateUserRoleSchema>;

export type UpdateUserStatusInput =
  z.infer<typeof updateUserStatusSchema>;

export type GetUsersQueryInput =
  z.infer<typeof getUsersQuerySchema>;