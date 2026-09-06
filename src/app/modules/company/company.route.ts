import { Router } from "express";

import { companyController } from "./company.controller.js";

import { createCompanySchema } from "./company.validation.js";

import { auth } from "../../middleware/auth.js";

import { validateRequest } from "../../middleware/validateRequest.js";

const router = Router();

/**
 * @swagger
 * /api/v1/companies:
 *   post:
 *     summary: Create a company
 *     description: Create a company profile for the authenticated recruiter.
 *     tags:
 *       - Company
 *
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: TechNova Solutions
 *               description:
 *                 type: string
 *                 example: A software company building modern digital solutions.
 *               website:
 *                 type: string
 *                 example: https://technova.example.com
 *               logo:
 *                 type: string
 *                 example: https://technova.example.com/logo.png
 *
 *     responses:
 *       201:
 *         description: Company created successfully
 *
 *       400:
 *         description: Invalid request data
 *
 *       401:
 *         description: Unauthorized - access token is missing or invalid
 *
 *       403:
 *         description: Forbidden - only recruiters can create a company
 *
 *       409:
 *         description: Company already exists for this recruiter
 */
router.post(
  "/",
  auth("RECRUITER"),
  validateRequest(createCompanySchema),
  companyController.createCompany,
);


/**
 * @swagger
 * /api/v1/companies/me:
 *   get:
 *     summary: Get my company
 *     description: Retrieve the company profile belonging to the authenticated recruiter.
 *     tags:
 *       - Company
 *
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Company retrieved successfully
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
 *                   example: Company retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: 7c8f3b8a-9f0a-4f7e-8b2c-123456789abc
 *                     name:
 *                       type: string
 *                       example: TechNova Solutions
 *                     description:
 *                       type: string
 *                       example: A software company building modern digital solutions.
 *                     website:
 *                       type: string
 *                       example: https://technova.example.com
 *                     logo:
 *                       type: string
 *                       example: https://technova.example.com/logo.png
 *                     status:
 *                       type: string
 *                       enum:
 *                         - ACTIVE
 *                         - SUSPENDED
 *                       example: ACTIVE
 *                     recruiterId:
 *                       type: string
 *                       format: uuid
 *                       example: 7c8f3b8a-9f0a-4f7e-8b2c-123456789abc
 *
 *       401:
 *         description: Unauthorized - access token is missing or invalid
 *
 *       403:
 *         description: Forbidden - only recruiters can access this resource
 *
 *       404:
 *         description: Company not found
 */
router.get(
  "/me",
  auth("RECRUITER"),
  companyController.getMyCompany,
);

export const companyRoutes = router;