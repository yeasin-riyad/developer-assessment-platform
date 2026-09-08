import type {
  Request,
  Response,
} from "express";

import httpStatus from "http-status";

import { catchAsync } from "../../utils/catchAsync.js";

import { subscriptionService } from "./subscription.service.js";

const subscribePremium = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user!;

    const result =
      await subscriptionService.createPremiumSubscription(
        user.userId,
        user.email,
      );

    res.status(httpStatus.OK).json({
      success: true,
      message:
        "Premium Subscription Payment Created Successfully",
      data: result,
    });
  },
);

const getMySubscription = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user!;

    const result =
      await subscriptionService.getMySubscription(
        user.userId,
      );

    res.status(httpStatus.OK).json({
      success: true,
      message: "Subscription Retrieved Successfully",
      data: result,
    });
  },
);

const cancelSubscription = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user!;

    const result =
      await subscriptionService.cancelSubscription(
        user.userId,
      );

    res.status(httpStatus.OK).json({
      success: true,
      message:
        "Subscription Cancelled Successfully",
      data: result,
    });
  },
);

const paymentCallback = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await subscriptionService.subscriptionPaymentCallback(
        req.query,
      );

    res.redirect(result.redirectUrl);
  },
);

export const subscriptionController = {
  subscribePremium,
  getMySubscription,
  cancelSubscription,
  paymentCallback,
};