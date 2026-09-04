import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { authRoutes } from "./app/modules/auth/auth.route.js";
import { notFound } from "./app/middleware/notFound.js";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler.js";
import { userRoutes } from "./app/modules/user/user.route.js";
import { companyRoutes } from "./app/modules/company/company.route.js";
import { problemRoutes } from "./app/modules/problem/problem.route.js";
import { assessmentRoutes } from "./app/modules/assessment/assessment.route.js";
import { invitationRoutes } from "./app/modules/invitation/invitation.route.js";
import { attemptRoutes } from "./app/modules/attempt/attempt.route.js";

const app = express();

app.use(helmet());

// app.use(
//   cors({
//     origin: config.client_url,
//     credentials: true,
//   }),
// );

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Developer Assessment Platform API is running",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/companies", companyRoutes);
app.use("/api/v1/problems", problemRoutes);
app.use("/api/v1/assessments", assessmentRoutes);
app.use("/api/v1/invitations", invitationRoutes);
app.use("/api/v1/attempts", attemptRoutes);

app.use(notFound);
app.use(globalErrorHandler);

export default app;
