import type {
  NextFunction,
  Request,
  Response,
} from "express";

import httpStatus from "http-status";
import { AppError } from "../utils/AppError.js";
import { prisma } from "../lib/prisma.js";



export const requireSubscription = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const user = req.user;

  if (!user) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Unauthorized",
    );
  }

  const subscription =
    await prisma.subscription.findFirst({
      where: {
        candidateId: user.userId,
        status: "ACTIVE",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

  if (!subscription) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Premium Subscription Required",
    );
  }

  /*
   * Check expiration.
   */
  if (
    subscription.endDate &&
    subscription.endDate <= new Date()
  ) {
    await prisma.subscription.update({
      where: {
        id: subscription.id,
      },
      data: {
        status: "EXPIRED",
      },
    });

    throw new AppError(
      httpStatus.FORBIDDEN,
      "Your Premium Subscription Has Expired",
    );
  }

  next();
};