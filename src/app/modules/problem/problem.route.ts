import { Router } from "express";

import { problemController } from "./problem.controller.js";

import { createProblemSchema } from "./problem.validation.js";

import { auth } from "../../middleware/auth.js";

import { validateRequest } from "../../middleware/validateRequest.js";

const router = Router();

/**
 * @swagger
 * /api/v1/problems:
 *   post:
 *     summary: Create a new problem
 *     description: Create a new coding, MCQ, or written problem with four answer options.
 *     tags:
 *       - Problem
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
 *               - description
 *               - type
 *             properties:
 *               title:
 *                 type: string
 *                 example: What is the time complexity of binary search?
 *               description:
 *                 type: string
 *                 example: Choose the correct time complexity for the binary search algorithm.
 *               type:
 *                 type: string
 *                 enum:
 *                   - CODING
 *                   - MCQ
 *                   - WRITTEN
 *                 example: MCQ
 *               difficulty:
 *                 type: string
 *                 enum:
 *                   - EASY
 *                   - MEDIUM
 *                   - HARD
 *                 example: EASY
 *               points:
 *                 type: integer
 *                 example: 10
 *               options:
 *                 type: array
 *                 minItems: 4
 *                 maxItems: 4
 *                 items:
 *                   type: object
 *                   required:
 *                     - text
 *                     - isCorrect
 *                   properties:
 *                     text:
 *                       type: string
 *                     isCorrect:
 *                       type: boolean
 *                 example:
 *                   - text: O(1)
 *                     isCorrect: false
 *                   - text: O(log n)
 *                     isCorrect: true
 *                   - text: O(n)
 *                     isCorrect: false
 *                   - text: O(n log n)
 *                     isCorrect: false
 *
 *     responses:
 *       201:
 *         description: Problem created successfully
 *
 *       400:
 *         description: Invalid request data
 *
 *       401:
 *         description: Unauthorized
 *
 *       403:
 *         description: Forbidden - only creators and admins can create problems
 */
router.post(
  "/",
  auth("CREATOR", "ADMIN"),
  validateRequest(createProblemSchema),
  problemController.createProblem,
);


/**
 * @swagger
 * /api/v1/problems:
 *   get:
 *     summary: Get all problems
 *     description: Retrieve all problems accessible to creators, recruiters, evaluators, and admins.
 *     tags:
 *       - Problem
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum:
 *             - CODING
 *             - MCQ
 *             - WRITTEN
 *         description: Filter problems by type
 *
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum:
 *             - EASY
 *             - MEDIUM
 *             - HARD
 *         description: Filter problems by difficulty
 *
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search problems by title or description
 *
 *     responses:
 *       200:
 *         description: Problems retrieved successfully
 *
 *       401:
 *         description: Unauthorized
 *
 *       403:
 *         description: Forbidden
 */
router.get(
  "/",
  auth("CREATOR", "RECRUITER", "EVALUATOR", "ADMIN"),
  problemController.getAllProblems,
);


/**
 * @swagger
 * /api/v1/problems/{id}:
 *   get:
 *     summary: Get problem by ID
 *     description: Retrieve detailed information about a specific problem.
 *     tags:
 *       - Problem
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
 *         description: Problem ID
 *
 *     responses:
 *       200:
 *         description: Problem retrieved successfully
 *
 *       401:
 *         description: Unauthorized
 *
 *       403:
 *         description: Forbidden
 *
 *       404:
 *         description: Problem not found
 */
router.get(
  "/:id",
  auth("CREATOR", "RECRUITER", "EVALUATOR", "ADMIN"),
  problemController.getProblemById,
);

export const problemRoutes = router;