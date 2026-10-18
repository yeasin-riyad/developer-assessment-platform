import { Router } from "express";
import { billingController } from "./billing.controller.js";
import { auth } from "../../middleware/auth.js";

const router = Router();

router.get("/plans", billingController.getPlans);

router.post("/checkout", auth("CANDIDATE"), billingController.createCheckout);
// router.post("/subscribe/free", auth("CANDIDATE"), billingController.subscribeFree);
router.get("/me", auth("CANDIDATE"), billingController.getMySubscription);
router.get("/payments", auth("CANDIDATE"), billingController.getPaymentHistory);

router.post("/sslcommerz/success", billingController.paymentSuccess);
router.post("/sslcommerz/fail", billingController.paymentFail);
router.post("/sslcommerz/cancel", billingController.paymentCancel);
router.post("/sslcommerz/ipn", billingController.paymentIPN);

export const billingRoutes = router;   