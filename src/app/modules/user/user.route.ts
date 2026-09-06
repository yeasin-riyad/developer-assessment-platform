import { Router } from "express";

import { userController } from "./user.controller.js";

import { auth } from "../../middleware/auth.js";

const router = Router();

/**
 * @swagger
 * /api/v1/users/me:
 *   get:
 *     summary: Get my profile
 *     description: Retrieve the profile information of the currently authenticated user.
 *     tags:
 *       - User
 *
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User profile retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: 7c8f3b8a-9f0a-4f7e-8b2c-123456789abc
 *                     name:
 *                       type: string
 *                       example: Yeasin Mazumder
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: yeasin@example.com
 *                     role:
 *                       type: string
 *                       example: CANDIDATE
 *                     isActive:
 *                       type: boolean
 *                       example: true
 *
 *       401:
 *         description: Unauthorized - access token is missing or invalid
 *
 *       403:
 *         description: User account is deactivated or user does not have permission
 */
router.get(
  "/me",
  auth(),
  userController.getMyProfile,
);

export const userRoutes = router;