import { Router } from "express";

import { validateRequest } from "../../middleware/validateRequest.js";
import { authController } from "./auth.controller.js";
import { loginSchema, registerSchema } from "./auth.validation.js";

const router = Router();

// ======================================================
// LOCAL AUTHENTICATION ROUTES
// ======================================================

router.post(
  "/register",
  validateRequest(registerSchema),
  authController.register,
);

router.post(
  "/login",
  validateRequest(loginSchema),
  authController.login,
);

router.post(
  "/refresh-token",
  authController.refreshToken,
);

router.post(
  "/logout",
  authController.logout,
);

// ======================================================
// GOOGLE OAUTH ROUTES
// ======================================================

router.get("/google", authController.googleLogin);

router.get("/google/callback", authController.googleCallback);

export const authRoutes = router;