import { randomUUID } from "crypto";
import httpStatus from "http-status";

import config from "../../config/index.js";

import { AppError } from "../../utils/AppError.js";

import { SUBSCRIPTION_CONSTANT } from "./subscription.constant.js";
import { prisma } from "../../lib/prisma.js";
import {
  SubscriptionPaymentStatus,
  SubscriptionPlan,
  SubscriptionStatus,
} from "../../../generated/prisma/enums.js";
import { getBkashIdToken } from "../../lib/bkash.js";

const parseBkashDate = (dateString: string): Date => {
  // bKash format:
  // 2026-09-08T15:10:29:554 GMT+0600
  //
  // Convert to:
  // 2026-09-08T15:10:29.554+06:00

  const normalizedDate = dateString.replace(
    /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}):(\d{3}) GMT([+-])(\d{2})(\d{2})$/,
    "$1.$2$3$4:$5",
  );

  const date = new Date(normalizedDate);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid bKash payment date: ${dateString}`);
  }

  return date;
};

const createBkashPayment = async (
  subscriptionId: string,
  paymentId: string,
  merchantInvoiceNumber: string,
  email: string,
) => {
  /*
   * Get bKash token.
   */
  const bkashIdToken = await getBkashIdToken();

  if (!bkashIdToken) {
    await prisma.subscriptionPayment.update({
      where: {
        id: paymentId,
      },
      data: {
        status: SubscriptionPaymentStatus.FAILED,
      },
    });

    await prisma.subscription.update({
      where: {
        id: subscriptionId,
      },
      data: {
        status: SubscriptionStatus.CANCELLED,
      },
    });

    throw new AppError(httpStatus.BAD_GATEWAY, "No bKash Access Token Found");
  }

  /*
   * Create bKash payment.
   */
  const bkashCreatePaymentResponse = await fetch(
    `${config.bkash_base_url}/tokenized/checkout/create`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: bkashIdToken,
        "X-App-Key": config.bkash_app_key || "",
      },
      body: JSON.stringify({
        mode: "0011",

        payerReference: email,

        callbackURL: `${config.bkash_callback_url}/payment/callback`,

        amount: SUBSCRIPTION_CONSTANT.PREMIUM.PRICE.toString(),

        currency: "BDT",

        intent: "sale",

        merchantInvoiceNumber,
      }),
    },
  );

  const bkashCreatePaymentResult = await bkashCreatePaymentResponse.json();

  /*
   * bKash may return HTTP 200 even when
   * payment creation fails.
   */
  if (
    !bkashCreatePaymentResponse.ok ||
    !bkashCreatePaymentResult?.paymentID ||
    !bkashCreatePaymentResult?.bkashURL
  ) {
    await prisma.subscriptionPayment.update({
      where: {
        id: paymentId,
      },
      data: {
        status: SubscriptionPaymentStatus.FAILED,

        gatewayResponse: bkashCreatePaymentResult,
      },
    });

    await prisma.subscription.update({
      where: {
        id: subscriptionId,
      },
      data: {
        status: SubscriptionStatus.CANCELLED,
      },
    });

    throw new AppError(
      httpStatus.BAD_GATEWAY,
      "Failed To Create bKash Payment",
    );
  }

  /*
   * Save bKash payment information.
   */
  await prisma.subscriptionPayment.update({
    where: {
      id: paymentId,
    },
    data: {
      /*
       * If this payment record is being reused,
       * replace the old bKash payment ID.
       */
      bkashPaymentId: bkashCreatePaymentResult.paymentID,

      gatewayResponse: bkashCreatePaymentResult,

      payerReference: email,

      status: SubscriptionPaymentStatus.PENDING,
    },
  });

  return {
    subscriptionId,

    paymentId,

    paymentUrl: bkashCreatePaymentResult.bkashURL,

    amount: SUBSCRIPTION_CONSTANT.PREMIUM.PRICE,

    plan: SubscriptionPlan.PREMIUM,
  };
};

const createPremiumSubscription = async (userId: string, email: string) => {
  /*
   * Check latest subscription.
   */
  let existingSubscription = await prisma.subscription.findFirst({
    where: {
      candidateId: userId,
      status: {
        in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.PENDING],
      },
    },
    include: {
      payments: {
        where: {
          status: SubscriptionPaymentStatus.PENDING,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  /*
   * ACTIVE subscription
   */
  if (existingSubscription) {
    /*
     * If active subscription has expired,
     * mark it as expired and allow a new subscription.
     */
    if (
      existingSubscription.status === SubscriptionStatus.ACTIVE &&
      existingSubscription.endDate &&
      existingSubscription.endDate <= new Date()
    ) {
      existingSubscription = await prisma.subscription.update({
        where: {
          id: existingSubscription.id,
        },
        data: {
          status: SubscriptionStatus.EXPIRED,
        },
        include: {
          payments: {
            where: {
              status: SubscriptionPaymentStatus.PENDING,
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
        },
      });
    } else if (existingSubscription.status === SubscriptionStatus.ACTIVE) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "You Already Have An Active Premium Subscription",
      );
    }
  }

  /*
   * PENDING subscription
   *
   * Instead of throwing an error, reuse the
   * existing pending payment.
   */
  if (existingSubscription?.status === SubscriptionStatus.PENDING) {
    const existingPayment = existingSubscription.payments[0];

    if (!existingPayment) {
      /*
       * Safety fallback:
       * If subscription is PENDING but payment record
       * doesn't exist, create a payment record.
       */
      const merchantInvoiceNumber = `SUB-${randomUUID()}`;

      const subscriptionPayment = await prisma.subscriptionPayment.create({
        data: {
          subscriptionId: existingSubscription.id,
          merchantInvoiceNumber,
          amount: SUBSCRIPTION_CONSTANT.PREMIUM.PRICE,
          status: SubscriptionPaymentStatus.PENDING,
          payerReference: email,
        },
      });

      return await createBkashPayment(
        existingSubscription.id,
        subscriptionPayment.id,
        merchantInvoiceNumber,
        email,
      );
    }

    /*
     * Reuse existing pending payment.
     */
    return await createBkashPayment(
      existingSubscription.id,
      existingPayment.id,
      existingPayment.merchantInvoiceNumber,
      email,
    );
  }

  /*
   * Create a NEW subscription.
   */
  const subscription = await prisma.subscription.create({
    data: {
      candidateId: userId,
      plan: SubscriptionPlan.PREMIUM,
      status: SubscriptionStatus.PENDING,
    },
  });

  /*
   * Generate merchant invoice number.
   */
  const merchantInvoiceNumber = `SUB-${randomUUID()}`;

  /*
   * Create payment record.
   */
  const subscriptionPayment = await prisma.subscriptionPayment.create({
    data: {
      subscriptionId: subscription.id,
      merchantInvoiceNumber,
      amount: SUBSCRIPTION_CONSTANT.PREMIUM.PRICE,
      status: SubscriptionPaymentStatus.PENDING,
      payerReference: email,
    },
  });

  /*
   * Create bKash payment.
   */
  return await createBkashPayment(
    subscription.id,
    subscriptionPayment.id,
    merchantInvoiceNumber,
    email,
  );
};

const getMySubscription = async (userId: string) => {
  const subscription = await prisma.subscription.findFirst({
    where: {
      candidateId: userId,
    },
    include: {
      payments: {
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!subscription) {
    return null;
  }

  /*
   * Automatically mark expired subscription.
   */
  if (
    subscription.status === SubscriptionStatus.ACTIVE &&
    subscription.endDate &&
    subscription.endDate <= new Date()
  ) {
    return await prisma.subscription.update({
      where: {
        id: subscription.id,
      },
      data: {
        status: SubscriptionStatus.EXPIRED,
      },
      include: {
        payments: {
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        },
      },
    });
  }

  return subscription;
};

const cancelSubscription = async (userId: string) => {
  const subscription = await prisma.subscription.findFirst({
    where: {
      candidateId: userId,
      status: SubscriptionStatus.ACTIVE,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!subscription) {
    throw new AppError(httpStatus.NOT_FOUND, "Active Subscription Not Found");
  }

  /*
   * This cancellation means:
   * - Premium remains available until endDate
   * - We mark it CANCELLED so it won't renew.
   *
   * Since we don't have auto-renewal currently,
   * this is sufficient.
   */
  const updatedSubscription = await prisma.subscription.update({
    where: {
      id: subscription.id,
    },
    data: {
      status: SubscriptionStatus.CANCELLED,
    },
  });

  return updatedSubscription;
};

const subscriptionPaymentCallback = async (query: Record<string, any>) => {
  const paymentId = query.paymentID;
  const status = query.status;

  if (!paymentId) {
    throw new AppError(httpStatus.BAD_REQUEST, "Payment Id Missing");
  }

  if (!status) {
    throw new AppError(httpStatus.BAD_REQUEST, "Payment Status Missing");
  }

  /*
   * Find payment.
   */
  const existingPayment = await prisma.subscriptionPayment.findUnique({
    where: {
      bkashPaymentId: paymentId,
    },
    include: {
      subscription: true,
    },
  });

  if (!existingPayment) {
    throw new AppError(httpStatus.NOT_FOUND, "Subscription Payment Not Found");
  }

  /*
   * Idempotency protection.
   *
   * If bKash sends the callback more than once,
   * don't activate the subscription twice.
   */
  if (
    existingPayment.status === SubscriptionPaymentStatus.PAID &&
    existingPayment.subscription.status === SubscriptionStatus.ACTIVE
  ) {
    return {
      redirectUrl: `${config.frontend_url}/dashboard/subscription?status=success`,
    };
  }

  const bkashIdToken = await getBkashIdToken();

  if (!bkashIdToken) {
    throw new AppError(httpStatus.BAD_GATEWAY, "No bKash Access Token Found");
  }

  /*
   * Execute bKash payment.
   */
  const executedPaymentResponse = await fetch(
    `${config.bkash_base_url}/tokenized/checkout/execute`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: bkashIdToken,
        "X-App-Key": config.bkash_app_key || "",
      },
      body: JSON.stringify({
        paymentID: paymentId,
      }),
    },
  );

  const executedPaymentResult = await executedPaymentResponse.json();

  /*
   * SUCCESS
   */
  if (status === "success") {
    /*
     * Verify bKash actually executed successfully.
     */
    if (!executedPaymentResponse.ok || !executedPaymentResult?.trxID) {
      await prisma.subscriptionPayment.update({
        where: {
          id: existingPayment.id,
        },
        data: {
          status: SubscriptionPaymentStatus.FAILED,
          gatewayResponse: executedPaymentResult,
        },
      });

      await prisma.subscription.update({
        where: {
          id: existingPayment.subscriptionId,
        },
        data: {
          status: SubscriptionStatus.CANCELLED,
        },
      });

      return {
        redirectUrl: `${config.frontend_url}/dashboard/subscription?status=failed`,
      };
    }

    const now = new Date();

    const endDate = new Date(now);

    endDate.setDate(
      endDate.getDate() + SUBSCRIPTION_CONSTANT.PREMIUM.DURATION_DAYS,
    );

    /*
     * Use transaction only for database changes.
     */
    await prisma.$transaction(async (tx) => {
      /*
       * Update payment.
       */
      await tx.subscriptionPayment.update({
        where: {
          id: existingPayment.id,
        },
        data: {
          status: SubscriptionPaymentStatus.PAID,

          bkashTrxId: executedPaymentResult.trxID,

          paidAt: executedPaymentResult.paymentExecuteTime
            ? parseBkashDate(executedPaymentResult.paymentExecuteTime)
            : now,

          gatewayResponse: executedPaymentResult,
        },
      });

      /*
       * Activate subscription.
       */
      await tx.subscription.update({
        where: {
          id: existingPayment.subscriptionId,
        },
        data: {
          status: SubscriptionStatus.ACTIVE,

          startDate: now,

          endDate,
        },
      });
    });

    return {
      redirectUrl: `${config.frontend_url}/dashboard/subscription?status=success`,
    };
  }

  /*
   * FAILURE
   */
  if (status === "failure") {
    await prisma.$transaction(async (tx) => {
      await tx.subscriptionPayment.update({
        where: {
          id: existingPayment.id,
        },
        data: {
          status: SubscriptionPaymentStatus.FAILED,
          gatewayResponse: executedPaymentResult,
        },
      });

      await tx.subscription.update({
        where: {
          id: existingPayment.subscriptionId,
        },
        data: {
          status: SubscriptionStatus.CANCELLED,
        },
      });
    });

    return {
      redirectUrl: `${config.frontend_url}/dashboard/subscription?status=failed`,
    };
  }

  /*
   * CANCEL
   */
  if (status === "cancel") {
    await prisma.$transaction(async (tx) => {
      await tx.subscriptionPayment.update({
        where: {
          id: existingPayment.id,
        },
        data: {
          status: SubscriptionPaymentStatus.CANCELLED,

          gatewayResponse: executedPaymentResult,
        },
      });

      await tx.subscription.update({
        where: {
          id: existingPayment.subscriptionId,
        },
        data: {
          status: SubscriptionStatus.CANCELLED,
        },
      });
    });

    return {
      redirectUrl: `${config.frontend_url}/dashboard/subscription?status=cancel`,
    };
  }

  /*
   * Unknown status.
   */
  return {
    redirectUrl: `${config.frontend_url}/dashboard/subscription?status=failed`,
  };
};

export const subscriptionService = {
  createPremiumSubscription,
  getMySubscription,
  cancelSubscription,
  subscriptionPaymentCallback,
};
