import { z } from "zod";

export const createInvitationSchema = z.object({
  assessmentId: z.string().uuid(),

  candidateId: z.string().uuid(),

  expiresAt: z.coerce.date().optional(),
});