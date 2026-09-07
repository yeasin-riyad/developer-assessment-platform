import { Router } from "express";

import {
  createSubmissionSchema,
} from "./submission.validation.js";

import {
  submissionController,
} from "./submission.controller.js";

import { auth } from "../../middleware/auth.js";

import { validateRequest } from "../../middleware/validateRequest.js";

const router = Router();

/**
 * @swagger
 * /api/v1/submissions/attempts/{attemptId}:
 *   post:
 *     summary: Create a submission
 *     description: Submit an answer for a problem within an assessment attempt.
 *     tags:
 *       - Submission
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: attemptId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Assessment attempt ID
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - problemId
 *               - answer
 *             properties:
 *               problemId:
 *                 type: string
 *                 format: uuid
 *                 example: 550e8400-e29b-41d4-a716-446655440000
 *               answer:
 *                 type: string
 *                 minLength: 1
 *                 example: O(log n)
 *               language:
 *                 type: string
 *                 example: javascript
 *
 *     responses:
 *       201:
 *         description: Submission created successfully
 *
 *       400:
 *         description: Invalid request data or submission cannot be created
 *
 *       401:
 *         description: Unauthorized
 *
 *       403:
 *         description: Forbidden - only candidates can create submissions
 *
 *       404:
 *         description: Attempt or problem not found
 */
router.post(
  "/attempts/:attemptId",
  auth("CANDIDATE"),
  validateRequest(createSubmissionSchema),
  submissionController.createSubmission,
);


/**
 * @swagger
 * /api/v1/submissions/my:
 *   get:
 *     summary: Get my submissions
 *     description: Retrieve all submissions created by the authenticated candidate.
 *     tags:
 *       - Submission
 *
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Submissions retrieved successfully
 *
 *       401:
 *         description: Unauthorized
 *
 *       403:
 *         description: Forbidden - only candidates can access their submissions
 */
router.get(
  "/my",
  auth("CANDIDATE"),
  submissionController.getMySubmissions,
);


/**
 * @swagger
 * /api/v1/submissions/{submissionId}:
 *   get:
 *     summary: Get submission by ID
 *     description: Retrieve a specific submission created by the authenticated candidate.
 *     tags:
 *       - Submission
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: submissionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Submission ID
 *
 *     responses:
 *       200:
 *         description: Submission retrieved successfully
 *
 *       401:
 *         description: Unauthorized
 *
 *       403:
 *         description: Forbidden - only candidates can access submissions
 *
 *       404:
 *         description: Submission not found
 */
router.get(
  "/:submissionId",
  auth("CANDIDATE"),
  submissionController.getSubmissionById,
);

export const submissionRoutes = router;