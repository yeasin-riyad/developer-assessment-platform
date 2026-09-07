import { Router } from "express";

import { manualEvaluationSchema } from "./evaluation.validation.js";

import { evaluationController } from "./evaluation.controller.js";

import { auth } from "../../middleware/auth.js";

import { validateRequest } from "../../middleware/validateRequest.js";

const router = Router();

/**
 * @swagger
 * /api/v1/evaluations/pending:
 *   get:
 *     summary: Get pending evaluations
 *     description: Retrieve all pending written submissions waiting for manual evaluation.
 *     tags:
 *       - Evaluation
 *
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Pending evaluations retrieved successfully
 *
 *       401:
 *         description: Unauthorized
 *
 *       403:
 *         description: Forbidden - only evaluators and admins can access pending evaluations
 */
router.get(
  "/pending",
  auth(
    "EVALUATOR",
    "ADMIN",
  ),
  evaluationController.getPendingEvaluations,
);


/**
 * @swagger
 * /api/v1/evaluations/submissions/{submissionId}:
 *   get:
 *     summary: Get submission for evaluation
 *     description: Retrieve a submission before manually evaluating it.
 *     tags:
 *       - Evaluation
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
 *         description: Forbidden - only evaluators and admins can access submissions for evaluation
 *
 *       404:
 *         description: Submission not found
 */
router.get(
  "/submissions/:submissionId",
  auth(
    "EVALUATOR",
    "ADMIN",
  ),
  evaluationController.getSubmissionForEvaluation,
);


/**
 * @swagger
 * /api/v1/evaluations/{submissionId}/review:
 *   post:
 *     summary: Evaluate a written submission
 *     description: Manually evaluate a WRITTEN submission and provide a score and optional feedback.
 *     tags:
 *       - Evaluation
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - score
 *             properties:
 *               score:
 *                 type: integer
 *                 minimum: 0
 *                 example: 8
 *               feedback:
 *                 type: string
 *                 maxLength: 2000
 *                 example: Good explanation, but the answer could provide more details about the approach.
 *
 *     responses:
 *       201:
 *         description: Submission evaluated successfully
 *
 *       400:
 *         description: Invalid request data or submission cannot be evaluated
 *
 *       401:
 *         description: Unauthorized
 *
 *       403:
 *         description: Forbidden - only evaluators and admins can evaluate submissions
 *
 *       404:
 *         description: Submission not found
 */
router.post(
  "/:submissionId/review",
  auth(
    "EVALUATOR",
    "ADMIN",
  ),
  validateRequest(
    manualEvaluationSchema,
  ),
  evaluationController.evaluateWritten,
);


/**
 * @swagger
 * /api/v1/evaluations/{submissionId}:
 *   get:
 *     summary: Get evaluation details
 *     description: Retrieve the evaluation details for a specific submission.
 *     tags:
 *       - Evaluation
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
 *         description: Evaluation retrieved successfully
 *
 *       401:
 *         description: Unauthorized
 *
 *       403:
 *         description: Forbidden - only evaluators and admins can access evaluation details
 *
 *       404:
 *         description: Evaluation not found
 */
router.get(
  "/:submissionId",
  auth(
    "EVALUATOR",
    "ADMIN",
  ),
  evaluationController.getEvaluationBySubmissionId,
);


export const evaluationRoutes = router;