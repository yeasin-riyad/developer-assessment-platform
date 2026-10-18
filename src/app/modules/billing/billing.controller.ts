
import type { Request, Response } from "express";
import httpStatus from "http-status";

import { catchAsync } from "../../utils/catchAsync.js";
import { billingService } from "./billing.service.js";
import config from "../../config/index.js";

const FRONTEND_URL =config.frontend_url;

function getString(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  return undefined;
}

/**
 * GET /api/v1/billing/plans
 * Public: list available plans.
 */
const getPlans = catchAsync(async (_req: Request, res: Response) => {
  const data = billingService.getPlans();

  res.status(httpStatus.OK).json({
    success: true,
    statusCode: httpStatus.OK,
    message: "Billing plans retrieved successfully",
    data,
  });
});

/**
 * POST /api/v1/billing/checkout
 * Candidate: create a paid-plan checkout session.
 */
const createCheckout = catchAsync(
  async (req: Request, res: Response) => {
    const candidateId = req.user?.userId;

    if (!candidateId) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        success: false,
        statusCode: httpStatus.UNAUTHORIZED,
        message: "Authentication required",
      });
    }

    const plan = getString(req.body?.plan);

    if (plan !== "STARTER" && plan !== "PRO") {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        statusCode: httpStatus.BAD_REQUEST,
        message: "Select a valid paid plan: STARTER or PRO",
      });
    }

    const data = await billingService.createCheckout(
      candidateId,
      { plan },
    );

    return res.status(httpStatus.OK).json({
      success: true,
      statusCode: httpStatus.OK,
      message: "Checkout session created successfully",
      data,
    });
  },
);

/**
 * POST /api/v1/billing/subscribe/free
 * Candidate: activate the FREE plan.
 */
// const subscribeFree = catchAsync(
//   async (req: Request, res: Response) => {
//     const candidateId = req.user?.userId;

//     if (!candidateId) {
//       return res.status(httpStatus.UNAUTHORIZED).json({
//         success: false,
//         statusCode: httpStatus.UNAUTHORIZED,
//         message: "Authentication required",
//       });
//     }

//     const data = await billingService.subscribeFree(candidateId);

//     return res.status(httpStatus.CREATED).json({
//       success: true,
//       statusCode: httpStatus.CREATED,
//       message: "Free subscription activated successfully",
//       data,
//     });
//   },
// );

/**
 * GET /api/v1/billing/me
 * Candidate: retrieve current/latest subscription.
 */
const getMySubscription = catchAsync(
  async (req: Request, res: Response) => {
    const candidateId = req.user?.userId;


    if (!candidateId) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        success: false,
        statusCode: httpStatus.UNAUTHORIZED,
        message: "Authentication required",
      });
    }

    const data =
      await billingService.getMySubscription(candidateId);

    return res.status(httpStatus.OK).json({
      success: true,
      statusCode: httpStatus.OK,
      message: "Subscription retrieved successfully",
      data,
    });
  },
);

/**
 * GET /api/v1/billing/payments
 * Candidate: list only their own payments.
 */
const getPaymentHistory = catchAsync(
  async (req: Request, res: Response) => {
    const candidateId = req.user?.userId;

    if (!candidateId) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        success: false,
        statusCode: httpStatus.UNAUTHORIZED,
        message: "Authentication required",
      });
    }

    const data =
      await billingService.getPaymentHistory(candidateId);

    return res.status(httpStatus.OK).json({
      success: true,
      statusCode: httpStatus.OK,
      message: "Payment history retrieved successfully",
      data,
    });
  },
);

/**
 * POST /api/v1/billing/sslcommerz/success
 * Gateway redirects here after payment.
 *
 * This callback is not trusted until the server validates it.
 */
const paymentSuccess = catchAsync(
  async (req: Request, res: Response) => {
    const valId = getString(req.body?.val_id);
    const invoiceNumber = getString(req.body?.tran_id);

    if (!valId || !invoiceNumber) {
      return res.redirect(
        `${FRONTEND_URL}/billing/failed?reason=missing_payment_reference`,
      );
    }

    try {
      await billingService.verifyAndActivatePayment(
        valId,
        invoiceNumber,
      );

      return res.redirect(
        `${FRONTEND_URL}/billing/success?tran_id=${encodeURIComponent(invoiceNumber)}`,
      );
    } catch (error) {
      console.error("SSLCOMMERZ success callback verification failed:", {
        invoiceNumber,
        message:
          error instanceof Error ? error.message : "Unknown error",
      });

      return res.redirect(
        `${FRONTEND_URL}/billing/failed?tran_id=${encodeURIComponent(invoiceNumber)}`,
      );
    }
  },
);

/**
 * POST /api/v1/billing/sslcommerz/ipn
 * Server-to-server notification. Always verify with the gateway.
 */
const paymentIPN = catchAsync(
  async (req: Request, res: Response) => {
    const valId = getString(req.body?.val_id);
    const invoiceNumber = getString(req.body?.tran_id);

    if (!valId || !invoiceNumber) {
      return res.status(httpStatus.BAD_REQUEST).send("Missing payment reference");
    }

    try {
      await billingService.verifyAndActivatePayment(
        valId,
        invoiceNumber,
      );

      return res.status(httpStatus.OK).send("OK");
    } catch (error) {
      console.error("SSLCOMMERZ IPN verification failed:", {
        invoiceNumber,
        message:
          error instanceof Error ? error.message : "Unknown error",
      });

      // A non-2xx response lets the gateway retry if appropriate.
      return res.status(httpStatus.BAD_GATEWAY).send("Verification failed");
    }
  },
);

/**
 * POST /api/v1/billing/sslcommerz/fail
 *
 * Do not mark payment failed just because the browser was redirected here.
 * The callback itself is not proof of the final payment state.
 */
const paymentFail = catchAsync(
  async (req: Request, res: Response) => {
    const invoiceNumber = getString(req.body?.tran_id);

    return res.redirect(
      invoiceNumber
        ? `${FRONTEND_URL}/billing/failed?tran_id=${encodeURIComponent(invoiceNumber)}`
        : `${FRONTEND_URL}/billing/failed`,
    );
  },
);

/**
 * POST /api/v1/billing/sslcommerz/cancel
 *
 * Do not trust the redirect alone to mutate payment state.
 */
const paymentCancel = catchAsync(
  async (req: Request, res: Response) => {
    const invoiceNumber = getString(req.body?.tran_id);

    return res.redirect(
      invoiceNumber
        ? `${FRONTEND_URL}/billing/cancelled?tran_id=${encodeURIComponent(invoiceNumber)}`
        : `${FRONTEND_URL}/billing/cancelled`,
    );
  },
);

export const billingController = {
  getPlans,
  createCheckout,
  // subscribeFree,
  getMySubscription,
  getPaymentHistory,
  paymentSuccess,
  paymentIPN,
  paymentFail,
  paymentCancel,
};