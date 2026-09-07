import { Router } from "express";

import { auth } from "../../middleware/auth.js";
import { validateRequest } from "../../middleware/validateRequest.js";

import { assessmentController } from "./assessment.controller.js";
import {
  addProblemSchema,
  createAssessmentSchema,
  updateAssessmentSchema,
} from "./assessment.validation.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Assessment
 *   description: Assessment management APIs
 */

// =====================================================
// Create Assessment
// =====================================================

/**
 * @swagger
 * /api/v1/assessments:
 *   post:
 *     summary: Create an assessment
 *     description: Creates a new draft assessment for the authenticated recruiter. The recruiter must have a company before creating an assessment.
 *     tags: [Assessment]
 *     security:
 *       - bearerAuth: []
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
 *                 example: Assessment for evaluating backend development skills
 *               duration:
 *                 type: integer
 *                 minimum: 1
 *                 example: 60
 *                 description: Assessment duration in minutes
 *     responses:
 *       201:
 *         description: Assessment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AssessmentResponse'
 *       400:
 *         description: Recruiter must create a company before creating an assessment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Only recruiters can create assessments
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Recruiter not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  "/",
  auth("RECRUITER"),
  validateRequest(createAssessmentSchema),
  assessmentController.createAssessment,
);

// =====================================================
// Get My Assessments
// =====================================================

/**
 * @swagger
 * /api/v1/assessments:
 *   get:
 *     summary: Get my assessments
 *     description: Returns all assessments created by the authenticated recruiter, including their problems ordered by question order.
 *     tags: [Assessment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Assessments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AssessmentListResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  "/",
  auth("RECRUITER"),
  assessmentController.getMyAssessments,
);

// =====================================================
// Get Assessment By ID
// =====================================================

/**
 * @swagger
 * /api/v1/assessments/{id}:
 *   get:
 *     summary: Get assessment by ID
 *     description: Returns detailed information about an assessment owned by the authenticated recruiter, including its problems.
 *     tags: [Assessment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Assessment ID
 *     responses:
 *       200:
 *         description: Assessment retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AssessmentDetailResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Assessment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  "/:id",
  auth("RECRUITER"),
  assessmentController.getAssessmentById,
);

// =====================================================
// Update Assessment
// =====================================================

/**
 * @swagger
 * /api/v1/assessments/{id}:
 *   patch:
 *     summary: Update an assessment
 *     description: Updates the title, description, or duration of a draft assessment owned by the authenticated recruiter.
 *     tags: [Assessment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Assessment ID
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
 *                 example: Advanced Backend Developer Assessment
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 example: Updated assessment description
 *               duration:
 *                 type: integer
 *                 minimum: 1
 *                 example: 90
 *                 description: Assessment duration in minutes
 *     responses:
 *       200:
 *         description: Assessment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AssessmentResponse'
 *       400:
 *         description: Only draft assessments can be updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Assessment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch(
  "/:id",
  auth("RECRUITER"),
  validateRequest(updateAssessmentSchema),
  assessmentController.updateAssessment,
);

// =====================================================
// Add Problem To Assessment
// =====================================================

/**
 * @swagger
 * /api/v1/assessments/{id}/problems:
 *   post:
 *     summary: Add a problem to an assessment
 *     description: Adds an existing problem to a draft assessment and automatically recalculates the assessment total marks.
 *     tags: [Assessment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Assessment ID
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
 *                 description: Question order inside the assessment
 *     responses:
 *       201:
 *         description: Problem added to assessment successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AssessmentProblemResponse'
 *       400:
 *         description: Problems can only be added to a draft assessment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Assessment or problem not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Problem already exists in this assessment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  "/:id/problems",
  auth("RECRUITER"),
  validateRequest(addProblemSchema),
  assessmentController.addProblem,
);

// =====================================================
// Remove Problem From Assessment
// =====================================================

/**
 * @swagger
 * /api/v1/assessments/{id}/problems/{problemId}:
 *   delete:
 *     summary: Remove a problem from an assessment
 *     description: Removes a problem from a draft assessment and automatically recalculates the assessment total marks.
 *     tags: [Assessment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Assessment ID
 *       - in: path
 *         name: problemId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Problem ID to remove
 *     responses:
 *       200:
 *         description: Problem removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AssessmentResponse'
 *       400:
 *         description: Problems can only be removed from a draft assessment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Assessment or problem not found in the assessment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete(
  "/:id/problems/:problemId",
  auth("RECRUITER"),
  assessmentController.removeProblem,
);

// =====================================================
// Publish Assessment
// =====================================================

/**
 * @swagger
 * /api/v1/assessments/{id}/publish:
 *   patch:
 *     summary: Publish an assessment
 *     description: Publishes a draft assessment. The assessment must contain at least one problem and have total marks greater than zero.
 *     tags: [Assessment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Assessment ID
 *     responses:
 *       200:
 *         description: Assessment published successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AssessmentResponse'
 *       400:
 *         description: Assessment cannot be published
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Assessment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch(
  "/:id/publish",
  auth("RECRUITER"),
  assessmentController.publishAssessment,
);

// =====================================================
// Unpublish Assessment
// =====================================================

/**
 * @swagger
 * /api/v1/assessments/{id}/unpublish:
 *   patch:
 *     summary: Unpublish an assessment
 *     description: Moves a published assessment back to draft status.
 *     tags: [Assessment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Assessment ID
 *     responses:
 *       200:
 *         description: Assessment unpublished successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AssessmentResponse'
 *       400:
 *         description: Only published assessments can be unpublished
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Assessment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch(
  "/:id/unpublish",
  auth("RECRUITER"),
  assessmentController.unpublishAssessment,
);

export const assessmentRoutes = router;