
import { z } from "zod";


export const checkoutSchema = z.object({
  plan: z.enum(["STARTER", "PRO"]),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;