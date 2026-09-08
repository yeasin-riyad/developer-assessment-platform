
import { Router } from "express";

import { authController } from "./auth.controller.js";

import {
  registerSchema,
  loginSchema,
} from "./auth.validation.js";

import { validateRequest } from "../../middleware/validateRequest.js";

const router = Router();

// ======================================================
// LOCAL AUTHENTICATION
// ======================================================

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account using name, email, password, and an optional role.
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
 *     description: Authenticates a user using email and password. A refresh token is stored in an HTTP-only cookie.
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
 *         headers:
 *           Set-Cookie:
 *             description: HTTP-only refresh token cookie
 *             schema:
 *               type: string
 *
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
 *     description: Generates a new access token using the refresh token stored in an HTTP-only cookie.
 *     tags:
 *       - Auth
 *
 *     responses:
 *       200:
 *         description: Access token refreshed successfully
 *
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *
 *                 message:
 *                   type: string
 *                   example: Access token refreshed successfully
 *
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
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
 *     description: Clears the refresh token HTTP-only cookie.
 *     tags:
 *       - Auth
 *
 *     responses:
 *       200:
 *         description: Logout successful
 *
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *
 *                 message:
 *                   type: string
 *                   example: Logout successful
 *
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/logout",
  authController.logout,
);


// ======================================================
// GOOGLE OAUTH
// ======================================================

/**
 * @swagger
 * /api/v1/auth/google:
 *   get:
 *     summary: Login with Google
 *     description: Starts the Google OAuth 2.0 authentication flow. The user is redirected to Google's login and consent page.
 *     tags:
 *       - Auth
 *
 *     responses:
 *       302:
 *         description: Redirects the user to Google's OAuth authorization page.
 */
router.get(
  "/google",
  authController.googleLogin,
);


/**
 * @swagger
 * /api/v1/auth/google/callback:
 *   get:
 *     summary: Google OAuth callback
 *     description: Handles the authorization code returned by Google after successful authentication.
 *     tags:
 *       - Auth
 *
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         description: Authorization code returned by Google.
 *         schema:
 *           type: string
 *         example: 4/0AeaYSHExampleAuthorizationCode
 *
 *     responses:
 *       200:
 *         description: Google login successful.
 *
 *         headers:
 *           Set-Cookie:
 *             description: HTTP-only refresh token cookie.
 *             schema:
 *               type: string
 *
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *
 *       400:
 *         description: Google authorization code is missing.
 *
 *       401:
 *         description: Google authentication failed.
 *
 *       500:
 *         description: Internal server error.
 */
router.get(
  "/google/callback",
  authController.googleCallback,
);


export const authRoutes = router;

