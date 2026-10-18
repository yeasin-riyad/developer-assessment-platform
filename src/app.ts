import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./app/config/swagger.js";

// Import your routes and handlers...
import { authRoutes } from "./app/modules/auth/auth.route.js";
import { notFound } from "./app/middleware/notFound.js";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler.js";
import { userRoutes } from "./app/modules/user/user.route.js";
import { companyRoutes } from "./app/modules/company/company.route.js";
import { problemRoutes } from "./app/modules/problem/problem.route.js";
import { assessmentRoutes } from "./app/modules/assessment/assessment.route.js";
import { invitationRoutes } from "./app/modules/invitation/invitation.route.js";
import { attemptRoutes } from "./app/modules/attempt/attempt.route.js";
import { submissionRoutes } from "./app/modules/submission/submission.route.js";
import { evaluationRoutes } from "./app/modules/evaluation/evaluation.route.js";
import { resultRoutes } from "./app/modules/result/result.route.js";
import { adminRoutes } from "./app/modules/admin/admin.route.js";
import { subscriptionRoutes } from "./app/modules/subscription/subscription.route.js";
import { candidateRoutes } from "./app/modules/candidate/candidate.route.js";

import config from "./app/config/index.js";
import { creatorRoutes } from "./app/modules/creator/creator.route.js";
import { settingsRoutes } from "./app/modules/settings/settings.route.js";
import { billingRoutes } from "./app/modules/billing/billing.route.js";

const app = express();

// Helmet Configured to allow Swagger CDN assets
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://cdnjs.cloudflare.com",
        ],
        styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
        imgSrc: ["'self'", "data:", "https://validator.swagger.io"],
      },
    },
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CDN URL options for Swagger UI
const SWAGGER_CDN_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.18.3";

const swaggerOptions = {
  explorer: true,
  customCssUrl: `${SWAGGER_CDN_URL}/swagger-ui.min.css`,
  customJs: [
    `${SWAGGER_CDN_URL}/swagger-ui-bundle.js`,
    `${SWAGGER_CDN_URL}/swagger-ui-standalone-preset.js`,
  ],
};

// Swagger Route Setup
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, swaggerOptions),
);



const allowedOrigins = new Set([
  config.client_url,
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:7005",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  "https://sandbox.sslcommerz.com",
]);

app.use(
  cors({
    origin(origin, callback) {
      // Allow: no origin, "null" origin, or whitelisted origin
      if (!origin || origin === "null" || allowedOrigins.has(origin)) {
        return callback(null, true);
      }
      console.error("Blocked CORS origin:", origin);
      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Developer Assessment Platform API is running",
    timestamp: new Date().toISOString(),
  });
});


app.use("/api/v1/billing", billingRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/companies", companyRoutes);
app.use("/api/v1/problems", problemRoutes);
app.use("/api/v1/assessments", assessmentRoutes);
app.use("/api/v1/invitations", invitationRoutes);
app.use("/api/v1/attempts", attemptRoutes);
app.use("/api/v1/submissions", submissionRoutes);
app.use("/api/v1/evaluations", evaluationRoutes);
app.use("/api/v1/results", resultRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/subscriptions", subscriptionRoutes);
app.use("/api/v1/candidates",candidateRoutes);
app.use("/api/v1/creator", creatorRoutes);
app.use("/api/v1/settings", settingsRoutes);


app.use(notFound);
app.use(globalErrorHandler);

export default app;
