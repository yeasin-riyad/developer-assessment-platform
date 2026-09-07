
import express from "express";

import { auth } from "../../middleware/auth.js";
import { validateRequest } from "../../middleware/validateRequest.js";

import { resultController } from "./result.controller.js";
import { resultQuerySchema } from "./result.validation.js";

const router = express.Router();

/**
 * @swagger
 * /api/v1/results/attempts/{attemptId}/generate:
 *   post:
 *     summary: Generate final result for an attempt
 *     description: Generates the final result after the candidate has submitted or the attempt has expired. All submissions must be evaluated before the result can be generated.
 *     tags:
 *       - Result
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: attemptId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the attempt
 *     responses:
 *       201:
 *         description: Result generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GeneratedResultResponse'
 *
 *       400:
 *         description: Result cannot be generated because the attempt has not been submitted/expired or submissions are still pending evaluation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *       403:
 *         description: Candidate is not allowed to generate result for this attempt
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *       404:
 *         description: Attempt not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  "/attempts/:attemptId/generate",
  auth("CANDIDATE"),
  resultController.generateResult,
);

/**
 * @swagger
 * /api/v1/results/attempts/{attemptId}:
 *   get:
 *     summary: Get my assessment result
 *     description: Returns the result of an assessment attempt belonging to the authenticated candidate.
 *     tags:
 *       - Result
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: attemptId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the attempt
 *     responses:
 *       200:
 *         description: Result retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MyResultResponse'
 *
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *       403:
 *         description: Candidate is not allowed to view this result
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *       404:
 *         description: Result not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  "/attempts/:attemptId",
  auth("CANDIDATE"),
  resultController.getMyResult,
);

/**
 * @swagger
 * /api/v1/results/assessments/{assessmentId}/statistics:
 *   get:
 *     summary: Get assessment statistics
 *     description: Returns candidate completion, pass/fail, average score, highest score, lowest score, and pass percentage statistics for an assessment.
 *     tags:
 *       - Result
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assessmentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the assessment
 *     responses:
 *       200:
 *         description: Assessment statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AssessmentStatisticsResponse'
 *
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *       403:
 *         description: Recruiter does not own this assessment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *       404:
 *         description: Assessment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  "/assessments/:assessmentId/statistics",
  auth("RECRUITER"),
  resultController.getAssessmentStatistics,
);

/**
 * @swagger
 * /api/v1/results/assessments/{assessmentId}:
 *   get:
 *     summary: Get all results for an assessment
 *     description: Returns all generated results for candidates who attempted the specified assessment. Results are ordered by obtained marks, percentage, and creation time.
 *     tags:
 *       - Result
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assessmentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the assessment
 *
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum:
 *             - PASS
 *             - FAIL
 *         description: Filter results by PASS or FAIL status
 *
 *     responses:
 *       200:
 *         description: Assessment results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AssessmentResultsResponse'
 *
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *       403:
 *         description: Recruiter does not own this assessment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *       404:
 *         description: Assessment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  "/assessments/:assessmentId",
  auth("RECRUITER"),
  validateRequest(resultQuerySchema, "query"),
  resultController.getAssessmentResults,
);

/**
 * @swagger
 * /api/v1/results/{resultId}:
 *   get:
 *     summary: Get a specific candidate result
 *     description: Returns detailed result information for a candidate. Only the recruiter who owns the assessment can access the result.
 *     tags:
 *       - Result
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: resultId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the result
 *     responses:
 *       200:
 *         description: Result retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RecruiterResultResponse'
 *
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *       403:
 *         description: Recruiter is not allowed to view this result
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *       404:
 *         description: Result not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  "/:resultId",
  auth("RECRUITER"),
  resultController.getRecruiterResultById,
);

export const resultRoutes = router;

