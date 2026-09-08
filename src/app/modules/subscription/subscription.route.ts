import { Router } from "express";

import { auth } from "../../middleware/auth.js";

import { subscriptionController } from "./subscription.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Subscription
 *   description: Candidate premium subscription and payment APIs
 */

/**
 * @swagger
 * /api/v1/subscriptions/subscribe:
 *   post:
 *     summary: Subscribe to Premium
 *     description: Creates a Premium subscription and returns the bKash payment URL.
 *     tags:
 *       - Subscription
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Premium payment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Premium Subscription Payment Created Successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     subscriptionId:
 *                       type: string
 *                       example: 9d2f5b8e-1234-4567-8901-123456789abc
 *                     paymentId:
 *                       type: string
 *                       example: 7e1c8b2a-1234-4567-8901-123456789abc
 *                     paymentUrl:
 *                       type: string
 *                       example: https://tokenized.pay.bka.sh/checkout
 *                     amount:
 *                       type: number
 *                       example: 499
 *                     plan:
 *                       type: string
 *                       example: PREMIUM
 *       400:
 *         description: Candidate already has an active or pending subscription
 *       401:
 *         description: Unauthorized
 *       502:
 *         description: bKash payment creation failed
 */
router.post(
  "/subscribe",
  auth("CANDIDATE"),
  subscriptionController.subscribePremium,
);

/**
 * @swagger
 * /api/v1/subscriptions/me:
 *   get:
 *     summary: Get my subscription
 *     description: Returns the currently logged-in candidate's latest subscription.
 *     tags:
 *       - Subscription
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/me", auth("CANDIDATE"), subscriptionController.getMySubscription);

/**
 * @swagger
 * /api/v1/subscriptions/cancel:
 *   patch:
 *     summary: Cancel Premium subscription
 *     description: Cancels the current Premium subscription.
 *     tags:
 *       - Subscription
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription cancelled successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Active subscription not found
 */
router.patch(
  "/cancel",
  auth("CANDIDATE"),
  subscriptionController.cancelSubscription,
);

/**
 * @swagger
 * /api/v1/subscriptions/payment/callback:
 *   get:
 *     summary: bKash subscription payment callback
 *     description: Handles the bKash payment callback and activates the subscription after successful payment.
 *     tags:
 *       - Subscription
 *     parameters:
 *       - in: query
 *         name: paymentID
 *         required: true
 *         schema:
 *           type: string
 *         example: TR0011ABCD123
 *       - in: query
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum:
 *             - success
 *             - failure
 *             - cancel
 *         example: success
 *     responses:
 *       302:
 *         description: Redirects candidate to frontend subscription page
 */
router.get("/payment/callback", subscriptionController.paymentCallback);

export const subscriptionRoutes = router;
