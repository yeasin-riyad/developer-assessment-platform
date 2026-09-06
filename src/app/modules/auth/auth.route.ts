import { Router } from "express";

import { authController } from "./auth.controller.js";

import {
  registerSchema,
  loginSchema,
} from "./auth.validation.js";

import { validateRequest } from "../../middleware/validateRequest.js";

const router = Router();

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user account.
 *     tags:
 *       - Auth
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *
 *     responses:
 *       201:
 *         description: User registered successfully
 *
 *       400:
 *         description: Invalid request data
 *
 *       409:
 *         description: Email already exists
 */
router.post(
  "/register",
  validateRequest(registerSchema),
  authController.register,
);


/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login user
 *     description: Authenticate a user using email and password.
 *     tags:
 *       - Auth
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *
 *       400:
 *         description: Invalid request data
 *
 *       401:
 *         description: Invalid email or password
 *
 *       403:
 *         description: User account is deactivated
 */
router.post(
  "/login",
  validateRequest(loginSchema),
  authController.login,
);


/**
 * @swagger
 * /api/v1/auth/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     description: Generate a new access token using the refresh token stored in an HTTP-only cookie.
 *     tags:
 *       - Auth
 *
 *     responses:
 *       200:
 *         description: Access token refreshed successfully
 *
 *       401:
 *         description: Refresh token is missing, invalid, or expired
 *
 *       403:
 *         description: User account is deactivated
 */
router.post(
  "/refresh-token",
  authController.refreshToken,
);


/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Logout the current user and clear the refresh token cookie.
 *     tags:
 *       - Auth
 *
 *     responses:
 *       200:
 *         description: Logout successful
 *
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/logout",
  authController.logout,
);


export const authRoutes = router;