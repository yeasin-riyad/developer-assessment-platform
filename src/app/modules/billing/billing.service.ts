import axios from "axios";
import crypto from "node:crypto";
import {
    Prisma,
  SubscriptionPaymentStatus,
  SubscriptionPlan,
  SubscriptionStatus,
} from "../../../generated/prisma/client.js";

import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import httpStatus from "http-status";
import { BILLING_PLANS } from "./billing.config.js";
import config from "../../config/index.js";


const isLive = config.isLive;

const STORE_ID = config.store_id;
const STORE_PASSWORD = config.store_password;

const BACKEND_URL = config.backend_url;
 

const FRONTEND_URL = config.frontend_url;


const INITIATE_URL = isLive
  ? "https://securepay.sslcommerz.com/gwprocess/v4/api.php"
  : "https://sandbox.sslcommerz.com/gwprocess/v4/api.php";

const VALIDATION_URL = isLive
  ? "https://securepay.sslcommerz.com/validator/api/validationserverAPI.php"
  : "https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php";

const CURRENCY = "BDT";
const PLAN_DURATION_DAYS = 30;

type CheckoutInput = {
  plan: "STARTER" | "PRO";
};

type GatewayValidation = {
  status?: string;
  val_id?: string;
  tran_id?: string;
  amount?: string;
  currency?: string;
  bank_tran_id?: string;
  tran_date?: string;
  store_amount?: string;
  risk_level?: string;
  risk_title?: string;
  [key: string]: unknown;
};

type GatewayInitResponse = {
  status?: string;
  failedreason?: string;
  sessionkey?: string;
  GatewayPageURL?: string;
  [key: string]: unknown;
};

function getStoreCredentials() {
  if (!STORE_ID || !STORE_PASSWORD) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "SSLCOMMERZ credentials are not configured",
    );
  }

  return {
    storeId: STORE_ID,
    storePassword: STORE_PASSWORD,
  };
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function getGatewayUrl(value: unknown): string {
  if (typeof value !== "string" || !value) {
    throw new AppError(
      httpStatus.BAD_GATEWAY,
      "SSLCOMMERZ did not return a checkout URL",
    );
  }

  let parsed: URL;

  try {
    parsed = new URL(value);
  } catch {
    throw new AppError(
      httpStatus.BAD_GATEWAY,
      "SSLCOMMERZ returned an invalid checkout URL",
    );
  }

  const allowedHosts = isLive
    ? ["securepay.sslcommerz.com"]
    : ["sandbox.sslcommerz.com"];

  if (
    parsed.protocol !== "https:" ||
    !allowedHosts.includes(parsed.hostname)
  ) {
    throw new AppError(
      httpStatus.BAD_GATEWAY,
      "SSLCOMMERZ returned an unexpected checkout URL",
    );
  }

  return parsed.toString();
}

/**
 * GET JSON from SSLCOMMERZ.
 * Network errors and invalid responses are logged without exposing secrets.
 */
async function getJson<T>(url: string): Promise<T> {
  try {
    const response = await axios.get<T>(url, {
      timeout: 20_000,
      headers: {
        Accept: "application/json",
      },
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("SSLCOMMERZ API request failed:", {
        status: error.response?.status,
        response:
          typeof error.response?.data === "string"
            ? error.response.data.slice(0, 500)
            : error.response?.data,
        code: error.code,
        message: error.message,
      });
    } else {
      console.error("SSLCOMMERZ API error:", error);
    }

    throw new AppError(
      httpStatus.BAD_GATEWAY,
      "Could not validate payment with gateway",
    );
  }
}

/**
 * Initiate a hosted checkout session.
 * The amount is always determined by the server's plan configuration.
 */
async function initiateGatewayCheckout(params: {
  amount: number;
  invoiceNumber: string;
  planName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}): Promise<GatewayInitResponse> {
  const { storeId, storePassword } = getStoreCredentials();

  const form = new URLSearchParams({
    store_id: storeId,
    store_passwd: storePassword,
    total_amount: params.amount.toFixed(2),
    currency: CURRENCY,
    tran_id: params.invoiceNumber,

    success_url: `${BACKEND_URL}/api/v1/billing/sslcommerz/success`,
    fail_url: `${BACKEND_URL}/api/v1/billing/sslcommerz/fail`,
    cancel_url: `${BACKEND_URL}/api/v1/billing/sslcommerz/cancel`,
    ipn_url: `${BACKEND_URL}/api/v1/billing/sslcommerz/ipn`,

    shipping_method: "NO",
    product_name: params.planName,
    product_category: "Subscription",
    product_profile: "non-physical-goods",

    cus_name: params.customerName,
    cus_email: params.customerEmail,
    cus_phone: params.customerPhone,
    cus_add1: "N/A",
    cus_city: "Dhaka",
    cus_state: "Dhaka",
    cus_postcode: "1000",
    cus_country: "Bangladesh",
  });

  try {
    const response = await axios.post<GatewayInitResponse>(
      INITIATE_URL,
      form.toString(),
      {
        timeout: 20_000,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
      },
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("SSLCOMMERZ checkout initiation failed:", {
        status: error.response?.status,
        response:
          typeof error.response?.data === "string"
            ? error.response.data.slice(0, 500)
            : error.response?.data,
        code: error.code,
        message: error.message,
      });
    }

    throw new AppError(
      httpStatus.BAD_GATEWAY,
      "Could not initiate SSLCOMMERZ checkout",
    );
  }
}

/**
 * Create a pending subscription and payment, then initiate hosted checkout.
 */
async function createCheckout(
  candidateId: string,
  input: CheckoutInput,
) {
  const plan = BILLING_PLANS[input.plan];

  if (!plan || plan.amount <= 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Please select a valid paid subscription plan",
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: candidateId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
    },
  });

  if (!user || !user.isActive || user.role !== "CANDIDATE") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Only active candidates can purchase a subscription",
    );
  }

  // User currently has no phone field in the supplied Prisma model.
  // Prefer adding an optional phone field to User and using user.phone.
  // Do not invent a phone number or send fake customer details.
  const customerPhone =config.sslcommerz_default_customer_phone;

  if (!customerPhone) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "A customer phone number is required. Add it to the candidate profile or configure SSLCOMMERZ_DEFAULT_CUSTOMER_PHONE.",
    );
  }

  const invoiceNumber = `SUB_${crypto.randomUUID()}`;

  const subscription = await prisma.subscription.create({
    data: {
      candidateId,
      plan: input.plan as SubscriptionPlan,
      status: SubscriptionStatus.PENDING,
    },
  });

  let payment;

  try {
    payment = await prisma.subscriptionPayment.create({
      data: {
        subscriptionId: subscription.id,
        merchantInvoiceNumber: invoiceNumber,
        amount: plan.amount,
        status: SubscriptionPaymentStatus.PENDING,
      },
    });
  } catch (error) {
    await prisma.subscription.delete({
      where: { id: subscription.id },
    }).catch(() => undefined);

    throw error;
  }

  try {
    const gateway = await initiateGatewayCheckout({
      amount: plan.amount,
      invoiceNumber,
      planName: plan.name,
      customerName: user.name,
      customerEmail: user.email,
      customerPhone,
    });

    if (!gateway.GatewayPageURL || !gateway.sessionkey) {
      console.error("SSLCOMMERZ rejected checkout initiation:", {
        status: gateway.status,
        reason: gateway.failedreason,
      });

      await prisma.subscriptionPayment.update({
        where: { id: payment.id },
        data: {
          status: SubscriptionPaymentStatus.FAILED,
          gatewayResponse: gateway as Prisma.InputJsonValue,
        },
      });

      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: SubscriptionStatus.CANCELLED },
      });

      throw new AppError(
        httpStatus.BAD_GATEWAY,
        "SSLCOMMERZ could not create a checkout session",
      );
    }

    const checkoutUrl = getGatewayUrl(gateway.GatewayPageURL);

    await prisma.subscriptionPayment.update({
      where: { id: payment.id },
      data: {
        sslcommerzSessionKey: gateway.sessionkey,
        gatewayResponse: gateway as Prisma.InputJsonValue,
      },
    });

    return {
      checkoutUrl,
      invoiceNumber,
      subscriptionId: subscription.id,
    };
  } catch (error) {
    // Do not mark a payment as failed if the gateway response is uncertain:
    // the gateway might have created a session despite a network timeout.
    if (
      error instanceof AppError &&
      error.message === "SSLCOMMERZ could not create a checkout session"
    ) {
      throw error;
    }

    console.error("Checkout initiation outcome is uncertain:", {
      invoiceNumber,
      message: error instanceof Error ? error.message : "Unknown error",
    });

    throw error;
  }
}

/**
 * Validate a payment directly with SSLCOMMERZ.
 */
async function validateWithGateway(
  valId: string,
): Promise<GatewayValidation> {
  const { storeId, storePassword } = getStoreCredentials();

  const url = new URL(VALIDATION_URL);
  url.search = new URLSearchParams({
    val_id: valId,
    store_id: storeId,
    store_passwd: storePassword,
    format: "json",
  }).toString();

  return getJson<GatewayValidation>(url.toString());
}

/**
 * Verify and activate a subscription.
 * The payment's invoice, amount, currency, validation ID and status
 * must match before the subscription becomes ACTIVE.
 */
async function verifyAndActivatePayment(
  valId: string,
  invoiceNumber: string,
) {
  if (!valId || !invoiceNumber) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Payment validation ID and invoice number are required",
    );
  }

  const payment = await prisma.subscriptionPayment.findUnique({
    where: { merchantInvoiceNumber: invoiceNumber },
    include: {
      subscription: true,
    },
  });

  if (!payment) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Payment record not found",
    );
  }

  // Idempotency: do not activate the same payment twice.
  if (payment.status === SubscriptionPaymentStatus.PAID) {
    return {
      success: true,
      alreadyPaid: true,
      subscriptionId: payment.subscriptionId,
    };
  }

  if (payment.status !== SubscriptionPaymentStatus.PENDING) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "This payment is not pending verification",
    );
  }

  const validation = await validateWithGateway(valId);

  const validStatuses = ["VALID", "VALIDATED"];

  if (!validStatuses.includes(validation.status ?? "")) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "SSLCOMMERZ did not validate this payment",
    );
  }

  if (validation.val_id !== valId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Payment validation ID mismatch",
    );
  }

  if (validation.tran_id !== invoiceNumber) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Payment invoice number mismatch",
    );
  }

  const expectedAmount = Number(payment.amount);
  const actualAmount = Number(validation.amount);

  if (
    !Number.isFinite(actualAmount) ||
    Math.abs(actualAmount - expectedAmount) > 0.01
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Payment amount mismatch",
    );
  }

  if (validation.currency !== CURRENCY) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Payment currency mismatch",
    );
  }

  const now = new Date();
  const endDate = addDays(now, PLAN_DURATION_DAYS);

  // Use a transaction to prevent a duplicate callback/IPN from activating
  // the subscription more than once.
  const result = await prisma.$transaction(
    async (tx) => {
      const currentPayment =
        await tx.subscriptionPayment.findUnique({
          where: { id: payment.id },
        });

      if (!currentPayment) {
        throw new AppError(
          httpStatus.NOT_FOUND,
          "Payment record not found",
        );
      }

      if (
        currentPayment.status === SubscriptionPaymentStatus.PAID
      ) {
        return {
          success: true,
          alreadyPaid: true,
          subscriptionId: currentPayment.subscriptionId,
        };
      }

      if (
        currentPayment.status !== SubscriptionPaymentStatus.PENDING
      ) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          "Payment is no longer pending",
        );
      }

      // Conditional update protects against concurrent callbacks.
      const updated = await tx.subscriptionPayment.updateMany({
        where: {
          id: currentPayment.id,
          status: SubscriptionPaymentStatus.PENDING,
        },
        data: {
          status: SubscriptionPaymentStatus.PAID,
          sslcommerzValId: valId,
          paidAt: now,
          gatewayResponse: validation as Prisma.InputJsonValue,
        },
      });

      if (updated.count !== 1) {
        const latest = await tx.subscriptionPayment.findUnique({
          where: { id: currentPayment.id },
        });

        if (latest?.status === SubscriptionPaymentStatus.PAID) {
          return {
            success: true,
            alreadyPaid: true,
            subscriptionId: currentPayment.subscriptionId,
          };
        }

        throw new AppError(
          httpStatus.CONFLICT,
          "Payment is being processed; please retry shortly",
        );
      }

      await tx.subscription.update({
        where: { id: currentPayment.subscriptionId },
        data: {
          status: SubscriptionStatus.ACTIVE,
          startDate: now,
          endDate,
        },
      });

      return {
        success: true,
        alreadyPaid: false,
        subscriptionId: currentPayment.subscriptionId,
      };
    },
    {
      isolationLevel: "Serializable",
    },
  );

  return result;
}

/**
 * Activate a free subscription without using the gateway.
 */
// async function subscribeFree(candidateId: string) {
//   const user = await prisma.user.findUnique({
//     where: { id: candidateId },
//     select: {
//       id: true,
//       role: true,
//       isActive: true,
//     },
//   });

//   if (!user || !user.isActive || user.role !== "CANDIDATE") {
//     throw new AppError(
//       httpStatus.FORBIDDEN,
//       "Only active candidates can subscribe",
//     );
//   }

//   const now = new Date();
//   const endDate = addDays(now, PLAN_DURATION_DAYS);

//   const result = await prisma.$transaction(async (tx) => {
//     const activeSubscription = await tx.subscription.findFirst({
//       where: {
//         candidateId,
//         status: SubscriptionStatus.ACTIVE,
//         endDate: { gt: now },
//       },
//       orderBy: { endDate: "desc" },
//     });

//     if (activeSubscription) {
//       throw new AppError(
//         httpStatus.CONFLICT,
//         "You already have an active subscription",
//       );
//     }

//     const subscription = await tx.subscription.create({
//       data: {
//         candidateId,
//         plan: SubscriptionPlan.FREE,
//         status: SubscriptionStatus.ACTIVE,
//         startDate: now,
//         endDate,
//       },
//     });

//     return subscription;
//   });

//   return result;
// }

/**
 * Return public plan details without exposing gateway credentials.
 */
function getPlans() {
  return Object.entries(BILLING_PLANS).map(([key, plan]) => ({
    plan: key,
    name: plan.name,
    amount: plan.amount,
    currency: CURRENCY,
    durationDays: PLAN_DURATION_DAYS,
  }));
}

/**
 * Return the candidate's latest subscription.
 */
async function getMySubscription(candidateId: string) {
  const now = new Date();

  // Expire only subscriptions whose end date has passed.
  await prisma.subscription.updateMany({
    where: {
      candidateId,
      status: SubscriptionStatus.ACTIVE,
      endDate: { lte: now },
    },
    data: {
      status: SubscriptionStatus.EXPIRED,
    },
  });

  return prisma.subscription.findFirst({
    where: { candidateId },
    orderBy: { createdAt: "desc" },
    include: {
      payments: {
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

/**
 * Return payment history for the authenticated candidate only.
 */
async function getPaymentHistory(candidateId: string) {
  return prisma.subscriptionPayment.findMany({
    where: {
      subscription: {
        candidateId,
      },
    },
    orderBy: { createdAt: "desc" },
    include: {
      subscription: {
        select: {
          id: true,
          plan: true,
          status: true,
          startDate: true,
          endDate: true,
        },
      },
    },
  });
}

export const billingService = {
  getPlans,
  createCheckout,
  verifyAndActivatePayment,
  // subscribeFree,
  getMySubscription,
  getPaymentHistory,
};