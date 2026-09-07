import { Router } from "express";

import { auth } from "../../middleware/auth.js";

import { validateRequest } from "../../middleware/validateRequest.js";

import { attemptController } from "./attempt.controller.js";

import { saveAnswerSchema } from "./attempt.validation.js";

const router = Router();

/**
 * @swagger
 * /api/v1/attempts/{id}:
 *   get:
 *     summary: Get my attempt
 *     description: Retrieve the authenticated candidate's assessment attempt.
 *     tags:
 *       - Attempt
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Attempt ID
 *
 *     responses:
 *       200:
 *         description: Attempt retrieved successfully
 *
 *       401:
 *         description: Unauthorized
 *
 *       403:
 *         description: Forbidden - only candidates can access attempts
 *
 *       404:
 *         description: Attempt not found
 */
router.get(
  "/:id",
  auth("CANDIDATE"),
  attemptController.getMyAttempt,
);


/**
 * @swagger
 * /api/v1/attempts/{id}/start:
 *   post:
 *     summary: Start an assessment attempt
 *     description: Start the assessment attempt for the authenticated candidate.
 *     tags:
 *       - Attempt
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Attempt ID
 *
 *     responses:
 *       200:
 *         description: Assessment attempt started successfully
 *
 *       400:
 *         description: Attempt cannot be started
 *
 *       401:
 *         description: Unauthorized
 *
 *       403:
 *         description: Forbidden - only candidates can start attempts
 *
 *       404:
 *         description: Attempt not found
 */
router.post(
  "/:id/start",
  auth("CANDIDATE"),
  attemptController.startAttempt,
);


/**
 * @swagger
 * /api/v1/attempts/{id}/questions:
 *   get:
 *     summary: Get attempt questions
 *     description: Retrieve the questions belonging to the candidate's assessment attempt.
 *     tags:
 *       - Attempt
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Attempt ID
 *
 *     responses:
 *       200:
 *         description: Attempt questions retrieved successfully
 *
 *       401:
 *         description: Unauthorized
 *
 *       403:
 *         description: Forbidden - only candidates can access attempt questions
 *
 *       404:
 *         description: Attempt not found
 */
router.get(
  "/:id/questions",
  auth("CANDIDATE"),
  attemptController.getAttemptQuestions,
);


/**
 * @swagger
 * /api/v1/attempts/{id}/status:
 *   get:
 *     summary: Get attempt status
 *     description: Retrieve the current status and timing information of an assessment attempt.
 *     tags:
 *       - Attempt
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Attempt ID
 *
 *     responses:
 *       200:
 *         description: Attempt status retrieved successfully
 *
 *       401:
 *         description: Unauthorized
 *
 *       403:
 *         description: Forbidden - only candidates can access attempt status
 *
 *       404:
 *         description: Attempt not found
 */
router.get(
  "/:id/status",
  auth("CANDIDATE"),
  attemptController.getAttemptStatus,
);


/**
 * @swagger
 * /api/v1/attempts/{id}/answers:
 *   patch:
 *     summary: Save an answer
 *     description: Save or update the authenticated candidate's answer for a problem in the assessment attempt.
 *     tags:
 *       - Attempt
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Attempt ID
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
 *                 example: O(log n)
 *
 *     responses:
 *       200:
 *         description: Answer saved successfully
 *
 *       400:
 *         description: Invalid request data or attempt cannot accept answers
 *
 *       401:
 *         description: Unauthorized
 *
 *       403:
 *         description: Forbidden - only candidates can save answers
 *
 *       404:
 *         description: Attempt or problem not found
 */
router.patch(
  "/:id/answers",
  auth("CANDIDATE"),
  validateRequest(saveAnswerSchema),
  attemptController.saveAnswer,
);


/**
 * @swagger
 * /api/v1/attempts/{id}/submit:
 *   post:
 *     summary: Submit an assessment attempt
 *     description: Submit the assessment attempt and finish the candidate's assessment.
 *     tags:
 *       - Attempt
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Attempt ID
 *
 *     responses:
 *       200:
 *         description: Assessment attempt submitted successfully
 *
 *       400:
 *         description: Attempt cannot be submitted
 *
 *       401:
 *         description: Unauthorized
 *
 *       403:
 *         description: Forbidden - only candidates can submit attempts
 *
 *       404:
 *         description: Attempt not found
 */
router.post(
  "/:id/submit",
  auth("CANDIDATE"),
  attemptController.submitAttempt,
);

export const attemptRoutes = router;