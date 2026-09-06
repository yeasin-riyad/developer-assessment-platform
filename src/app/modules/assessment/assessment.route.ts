import { Router } from "express";

import { auth } from "../../middleware/auth.js";

import { validateRequest } from "../../middleware/validateRequest.js";

import { assessmentController } from "./assessment.controller.js";

import {
  createAssessmentSchema,
  updateAssessmentSchema,
  addProblemSchema,
} from "./assessment.validation.js";

const router = Router();

/**
 * @swagger
 * /api/v1/assessments:
 *   post:
 *     summary: Create a new assessment
 *     description: Create a new assessment in DRAFT status.
 *     tags:
 *       - Assessment
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
 *               - title
 *               - duration
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 200
 *                 example: Backend Developer Assessment
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 example: Assessment for evaluating backend development skills.
 *               duration:
 *                 type: integer
 *                 minimum: 1
 *                 example: 60
 *
 *     responses:
 *       201:
 *         description: Assessment created successfully
 *
 *       400:
 *         description: Invalid request data
 *
 *       401:
 *         description: Unauthorized
 *
 *       403:
 *         description: Forbidden - only recruiters can create assessments
 */
router.post(
  "/",
  auth("RECRUITER"),
  validateRequest(createAssessmentSchema),
  assessmentController.createAssessment,
);


/**
 * @swagger
 * /api/v1/assessments:
 *   get:
 *     summary: Get my assessments
 *     description: Retrieve all assessments created by the authenticated recruiter.
 *     tags:
 *       - Assessment
 *
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Assessments retrieved successfully
 *
 *       401:
 *         description: Unauthorized
 *
 *       403:
 *         description: Forbidden - only recruiters can access their assessments
 */
router.get(
  "/",
  auth("RECRUITER"),
  assessmentController.getMyAssessments,
);


/**
 * @swagger
 * /api/v1/assessments/{id}:
 *   get:
 *     summary: Get assessment by ID
 *     description: Retrieve a specific assessment created by the authenticated recruiter.
 *     tags:
 *       - Assessment
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
 *         description: Assessment ID
 *
 *     responses:
 *       200:
 *         description: Assessment retrieved successfully
 *
 *       401:
 *         description: Unauthorized
 *
 *       403:
 *         description: Forbidden
 *
 *       404:
 *         description: Assessment not found
 */
router.get(
  "/:id",
  auth("RECRUITER"),
  assessmentController.getAssessmentById,
);


/**
 * @swagger
 * /api/v1/assessments/{id}:
 *   patch:
 *     summary: Update an assessment
 *     description: Update the title, description, or duration of an assessment.
 *     tags:
 *       - Assessment
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
 *         description: Assessment ID
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 200
 *                 example: Senior Backend Developer Assessment
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 example: Updated assessment for senior backend developers.
 *               duration:
 *                 type: integer
 *                 minimum: 1
 *                 example: 90
 *
 *     responses:
 *       200:
 *         description: Assessment updated successfully
 *
 *       400:
 *         description: Invalid request data
 *
 *       401:
 *         description: Unauthorized
 *
 *       403:
 *         description: Forbidden
 *
 *       404:
 *         description: Assessment not found
 */
router.patch(
  "/:id",
  auth("RECRUITER"),
  validateRequest(updateAssessmentSchema),
  assessmentController.updateAssessment,
);


/**
 * @swagger
 * /api/v1/assessments/{id}/problems:
 *   post:
 *     summary: Add a problem to an assessment
 *     description: Add an existing problem from the problem bank to an assessment.
 *     tags:
 *       - Assessment
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
 *         description: Assessment ID
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - problemId
 *               - points
 *               - order
 *             properties:
 *               problemId:
 *                 type: string
 *                 format: uuid
 *                 example: 550e8400-e29b-41d4-a716-446655440000
 *               points:
 *                 type: integer
 *                 minimum: 1
 *                 example: 10
 *               order:
 *                 type: integer
 *                 minimum: 1
 *                 example: 1
 *
 *     responses:
 *       201:
 *         description: Problem added to assessment successfully
 *
 *       400:
 *         description: Invalid request data
 *
 *       401:
 *         description: Unauthorized
 *
 *       403:
 *         description: Forbidden
 *
 *       404:
 *         description: Assessment or problem not found
 */
router.post(
  "/:id/problems",
  auth("RECRUITER"),
  validateRequest(addProblemSchema),
  assessmentController.addProblem,
);


/**
 * @swagger
 * /api/v1/assessments/{id}/problems/{problemId}:
 *   delete:
 *     summary: Remove a problem from an assessment
 *     description: Remove an existing problem from an assessment.
 *     tags:
 *       - Assessment
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
 *         description: Assessment ID
 *
 *       - in: path
 *         name: problemId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Problem ID
 *
 *     responses:
 *       200:
 *         description: Problem removed from assessment successfully
 *
 *       401:
 *         description: Unauthorized
 *
 *       403:
 *         description: Forbidden
 *
 *       404:
 *         description: Assessment or problem not found
 */
router.delete(
  "/:id/problems/:problemId",
  auth("RECRUITER"),
  assessmentController.removeProblem,
);


/**
 * @swagger
 * /api/v1/assessments/{id}/publish:
 *   patch:
 *     summary: Publish an assessment
 *     description: Publish a draft assessment so it can be used for candidate invitations.
 *     tags:
 *       - Assessment
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
 *         description: Assessment ID
 *
 *     responses:
 *       200:
 *         description: Assessment published successfully
 *
 *       400:
 *         description: Assessment cannot be published
 *
 *       401:
 *         description: Unauthorized
 *
 *       403:
 *         description: Forbidden
 *
 *       404:
 *         description: Assessment not found
 */
router.patch(
  "/:id/publish",
  auth("RECRUITER"),
  assessmentController.publishAssessment,
);


/**
 * @swagger
 * /api/v1/assessments/{id}/unpublish:
 *   patch:
 *     summary: Unpublish an assessment
 *     description: Move a published assessment back to DRAFT status.
 *     tags:
 *       - Assessment
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
 *         description: Assessment ID
 *
 *     responses:
 *       200:
 *         description: Assessment unpublished successfully
 *
 *       400:
 *         description: Assessment cannot be unpublished
 *
 *       401:
 *         description: Unauthorized
 *
 *       403:
 *         description: Forbidden
 *
 *       404:
 *         description: Assessment not found
 */
router.patch(
  "/:id/unpublish",
  auth("RECRUITER"),
  assessmentController.unpublishAssessment,
);

export const assessmentRoutes = router;