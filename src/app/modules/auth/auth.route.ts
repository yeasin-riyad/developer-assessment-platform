import { Router } from "express";

import { authController } from "./auth.controller.js";

import {
  registerSchema,
  loginSchema,
} from "./auth.validation.js";
import { validateRequest } from "../../middleware/validateRequest.js";

const router = Router();

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

export const authRoutes = router;