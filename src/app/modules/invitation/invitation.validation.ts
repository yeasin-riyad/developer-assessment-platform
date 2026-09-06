import { z } from "zod";

export const createInvitationSchema = z.object({
  assessmentId: z.uuid(),

  candidateId: z.uuid(),

  expiresAt: z.coerce.date().optional(),
});