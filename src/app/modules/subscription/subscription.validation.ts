import { z } from "zod";

export const emptySubscriptionSchema = z.object({});

export const subscriptionIdSchema = z.object({
  subscriptionId: z.string().uuid(),
});

export const subscriptionValidation = {
  emptySubscriptionSchema,
  subscriptionIdSchema,
};