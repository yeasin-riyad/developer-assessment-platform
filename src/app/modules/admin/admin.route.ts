import { Router } from "express";

import { auth } from "../../middleware/auth.js";
import { validateRequest } from "../../middleware/validateRequest.js";

import {
  updateUserRoleSchema,
  updateUserStatusSchema,
  updateCompanyStatusSchema,
} from "./admin.validation.js";

import { adminController } from "./admin.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Admin
 *     description: Admin management APIs
 */

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve all users with optional role, active status, and search filters.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: query
 *         name: role
 *         required: false
 *         schema:
 *           type: string
 *           enum:
 *             - CANDIDATE
 *             - RECRUITER
 *             - CREATOR
 *             - EVALUATOR
 *             - ADMIN
 *         description: Filter users by role.
 *
 *       - in: query
 *         name: isActive
 *         required: false
 *         schema:
 *           type: string
 *           enum:
 *             - "true"
 *             - "false"
 *         description: Filter users by account status.
 *
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *         description: Search users by name or email.
 *
 *     responses:
 *       200:
 *         description: Users retrieved successfully.
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
 *                   example: Users retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                         example: Yeasin Mazumder
 *                       email:
 *                         type: string
 *                         format: email
 *                         example: yeasin@example.com
 *                       role:
 *                         type: string
 *                         enum:
 *                           - CANDIDATE
 *                           - RECRUITER
 *                           - CREATOR
 *                           - EVALUATOR
 *                           - ADMIN
 *                       isActive:
 *                         type: boolean
 *                         example: true
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                       company:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           name:
 *                             type: string
 *
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *       403:
 *         description: Admin access required.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  "/users",
  auth("ADMIN"),
  adminController.getAllUsers,
);

/**
 * @swagger
 * /admin/users/{userId}:
 *   get:
 *     summary: Get user by ID
 *     description: Retrieve detailed information about a specific user.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *
 *     responses:
 *       200:
 *         description: User retrieved successfully.
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
 *                   example: User retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                       format: email
 *                     role:
 *                       type: string
 *                       enum:
 *                         - CANDIDATE
 *                         - RECRUITER
 *                         - CREATOR
 *                         - EVALUATOR
 *                         - ADMIN
 *                     isActive:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     company:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         name:
 *                           type: string
 *                         description:
 *                           type: string
 *                           nullable: true
 *                         website:
 *                           type: string
 *                           nullable: true
 *                         logo:
 *                           type: string
 *                           nullable: true
 *                     _count:
 *                       type: object
 *                       properties:
 *                         problems:
 *                           type: integer
 *                         assessments:
 *                           type: integer
 *                         invitations:
 *                           type: integer
 *                         attempts:
 *                           type: integer
 *                         evaluations:
 *                           type: integer
 *
 *       401:
 *         description: Unauthorized.
 *
 *       403:
 *         description: Admin access required.
 *
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  "/users/:userId",
  auth("ADMIN"),
  adminController.getUserById,
);

/**
 * @swagger
 * /admin/users/{userId}/role:
 *   patch:
 *     summary: Update user role
 *     description: Change the role of a user. An admin cannot change their own role.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum:
 *                   - CANDIDATE
 *                   - RECRUITER
 *                   - CREATOR
 *                   - EVALUATOR
 *                   - ADMIN
 *                 example: CREATOR
 *
 *     responses:
 *       200:
 *         description: User role updated successfully.
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
 *                   example: User role updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                       format: email
 *                     role:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *
 *       400:
 *         description: Cannot change own role or invalid input.
 *
 *       401:
 *         description: Unauthorized.
 *
 *       403:
 *         description: Admin access required.
 *
 *       404:
 *         description: User not found.
 */
router.patch(
  "/users/:userId/role",
  auth("ADMIN"),
  validateRequest(updateUserRoleSchema),
  adminController.updateUserRole,
);

/**
 * @swagger
 * /admin/users/{userId}/status:
 *   patch:
 *     summary: Update user account status
 *     description: Activate or deactivate a user account. An admin cannot change their own account status.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isActive
 *             properties:
 *               isActive:
 *                 type: boolean
 *                 example: false
 *
 *     responses:
 *       200:
 *         description: User status updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: User status updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                       format: email
 *                     role:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *
 *       400:
 *         description: Cannot change own account status.
 *
 *       401:
 *         description: Unauthorized.
 *
 *       403:
 *         description: Admin access required.
 *
 *       404:
 *         description: User not found.
 */
router.patch(
  "/users/:userId/status",
  auth("ADMIN"),
  validateRequest(updateUserStatusSchema),
  adminController.updateUserStatus,
);

/**
 * @swagger
 * /admin/users/{userId}:
 *   delete:
 *     summary: Delete user
 *     description: Permanently delete a user. An admin cannot delete their own account.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *
 *     responses:
 *       200:
 *         description: User deleted successfully.
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
 *                   example: User deleted successfully
 *
 *       400:
 *         description: Cannot delete own account.
 *
 *       401:
 *         description: Unauthorized.
 *
 *       403:
 *         description: Admin access required.
 *
 *       404:
 *         description: User not found.
 */
router.delete(
  "/users/:userId",
  auth("ADMIN"),
  adminController.deleteUser,
);

/**
 * @swagger
 * /admin/companies:
 *   get:
 *     summary: Get all companies
 *     description: Retrieve all companies with optional status and search filters.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum:
 *             - ACTIVE
 *             - SUSPENDED
 *         description: Filter companies by status.
 *
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *         description: Search companies by name or description.
 *
 *     responses:
 *       200:
 *         description: Companies retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: Companies retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                         nullable: true
 *                       website:
 *                         type: string
 *                         nullable: true
 *                       logo:
 *                         type: string
 *                         nullable: true
 *                       status:
 *                         type: string
 *                         enum:
 *                           - ACTIVE
 *                           - SUSPENDED
 *                       recruiter:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                             format: email
 *                           isActive:
 *                             type: boolean
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *
 *       401:
 *         description: Unauthorized.
 *
 *       403:
 *         description: Admin access required.
 */
router.get(
  "/companies",
  auth("ADMIN"),
  adminController.getAllCompanies,
);

/**
 * @swagger
 * /admin/companies/{companyId}:
 *   get:
 *     summary: Get company by ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *
 *     responses:
 *       200:
 *         description: Company retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: Company retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                       nullable: true
 *                     website:
 *                       type: string
 *                       nullable: true
 *                     logo:
 *                       type: string
 *                       nullable: true
 *                     status:
 *                       type: string
 *                       enum:
 *                         - ACTIVE
 *                         - SUSPENDED
 *                     recruiter:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                           format: email
 *                         role:
 *                           type: string
 *                         isActive:
 *                           type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *
 *       401:
 *         description: Unauthorized.
 *
 *       403:
 *         description: Admin access required.
 *
 *       404:
 *         description: Company not found.
 */
router.get(
  "/companies/:companyId",
  auth("ADMIN"),
  adminController.getCompanyById,
);

/**
 * @swagger
 * /admin/companies/{companyId}/status:
 *   patch:
 *     summary: Update company status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum:
 *                   - ACTIVE
 *                   - SUSPENDED
 *                 example: SUSPENDED
 *
 *     responses:
 *       200:
 *         description: Company status updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: Company status updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                       nullable: true
 *                     website:
 *                       type: string
 *                       nullable: true
 *                     logo:
 *                       type: string
 *                       nullable: true
 *                     status:
 *                       type: string
 *                       enum:
 *                         - ACTIVE
 *                         - SUSPENDED
 *                     recruiter:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                           format: email
 *                         isActive:
 *                           type: boolean
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *
 *       401:
 *         description: Unauthorized.
 *
 *       403:
 *         description: Admin access required.
 *
 *       404:
 *         description: Company not found.
 */
router.patch(
  "/companies/:companyId/status",
  auth("ADMIN"),
  validateRequest(updateCompanyStatusSchema),
  adminController.updateCompanyStatus,
);

/**
 * @swagger
 * /admin/companies/{companyId}:
 *   delete:
 *     summary: Delete company
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *
 *     responses:
 *       200:
 *         description: Company deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: Company deleted successfully
 *
 *       401:
 *         description: Unauthorized.
 *
 *       403:
 *         description: Admin access required.
 *
 *       404:
 *         description: Company not found.
 */
router.delete(
  "/companies/:companyId",
  auth("ADMIN"),
  adminController.deleteCompany,
);

/**
 * @swagger
 * /admin/problems:
 *   get:
 *     summary: Get all problems
 *     description: Retrieve all problems with optional type, difficulty, and search filters.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: query
 *         name: type
 *         required: false
 *         schema:
 *           type: string
 *           enum:
 *             - CODING
 *             - MCQ
 *             - WRITTEN
 *
 *       - in: query
 *         name: difficulty
 *         required: false
 *         schema:
 *           type: string
 *           enum:
 *             - EASY
 *             - MEDIUM
 *             - HARD
 *
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *         description: Search by problem title or description.
 *
 *     responses:
 *       200:
 *         description: Problems retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: Problems retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       type:
 *                         type: string
 *                         enum:
 *                           - CODING
 *                           - MCQ
 *                           - WRITTEN
 *                       difficulty:
 *                         type: string
 *                         enum:
 *                           - EASY
 *                           - MEDIUM
 *                           - HARD
 *                       points:
 *                         type: integer
 *                       createdBy:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                             format: email
 *                       _count:
 *                         type: object
 *                         properties:
 *                           options:
 *                             type: integer
 *                           testCases:
 *                             type: integer
 *                           assessmentProblems:
 *                             type: integer
 *                           submissions:
 *                             type: integer
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *
 *       401:
 *         description: Unauthorized.
 *
 *       403:
 *         description: Admin access required.
 */
router.get(
  "/problems",
  auth("ADMIN"),
  adminController.getAllProblems,
);

/**
 * @swagger
 * /admin/problems/{problemId}:
 *   get:
 *     summary: Get problem by ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: problemId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *
 *     responses:
 *       200:
 *         description: Problem retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: Problem retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     type:
 *                       type: string
 *                       enum:
 *                         - CODING
 *                         - MCQ
 *                         - WRITTEN
 *                     difficulty:
 *                       type: string
 *                       enum:
 *                         - EASY
 *                         - MEDIUM
 *                         - HARD
 *                     points:
 *                       type: integer
 *                     createdBy:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                           format: email
 *                         role:
 *                           type: string
 *                         isActive:
 *                           type: boolean
 *                     options:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           text:
 *                             type: string
 *                           isCorrect:
 *                             type: boolean
 *                     testCases:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           input:
 *                             type: string
 *                           expectedOutput:
 *                             type: string
 *                           isHidden:
 *                             type: boolean
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                     assessmentProblems:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           order:
 *                             type: integer
 *                           points:
 *                             type: integer
 *                           assessment:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 format: uuid
 *                               title:
 *                                 type: string
 *                               status:
 *                                 type: string
 *                     _count:
 *                       type: object
 *                       properties:
 *                         submissions:
 *                           type: integer
 *                         attemptAnswers:
 *                           type: integer
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *
 *       401:
 *         description: Unauthorized.
 *
 *       403:
 *         description: Admin access required.
 *
 *       404:
 *         description: Problem not found.
 */
router.get(
  "/problems/:problemId",
  auth("ADMIN"),
  adminController.getProblemById,
);

/**
 * @swagger
 * /admin/problems/{problemId}:
 *   delete:
 *     summary: Delete problem
 *     description: Delete a problem if it has not been used by assessments, submissions, answers, or results.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: problemId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *
 *     responses:
 *       200:
 *         description: Problem deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: Problem deleted successfully
 *
 *       400:
 *         description: Problem cannot be deleted because it is already in use.
 *
 *       401:
 *         description: Unauthorized.
 *
 *       403:
 *         description: Admin access required.
 *
 *       404:
 *         description: Problem not found.
 */
router.delete(
  "/problems/:problemId",
  auth("ADMIN"),
  adminController.deleteProblem,
);

/**
 * @swagger
 * /admin/assessments:
 *   get:
 *     summary: Get all assessments
 *     description: Retrieve all assessments with optional status and search filters.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum:
 *             - DRAFT
 *             - PUBLISHED
 *             - ACTIVE
 *             - CLOSED
 *
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *         description: Search assessments by title or description.
 *
 *     responses:
 *       200:
 *         description: Assessments retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: Assessments retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                         nullable: true
 *                       duration:
 *                         type: integer
 *                       totalMarks:
 *                         type: integer
 *                       status:
 *                         type: string
 *                         enum:
 *                           - DRAFT
 *                           - PUBLISHED
 *                           - ACTIVE
 *                           - CLOSED
 *                       recruiter:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                             format: email
 *                           isActive:
 *                             type: boolean
 *                       _count:
 *                         type: object
 *                         properties:
 *                           problems:
 *                             type: integer
 *                           invitations:
 *                             type: integer
 *                           attempts:
 *                             type: integer
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *
 *       401:
 *         description: Unauthorized.
 *
 *       403:
 *         description: Admin access required.
 */
router.get(
  "/assessments",
  auth("ADMIN"),
  adminController.getAllAssessments,
);

/**
 * @swagger
 * /admin/assessments/{assessmentId}:
 *   get:
 *     summary: Get assessment by ID
 *     description: Retrieve complete assessment details including problems, invitations, attempts, and results.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: assessmentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *
 *     responses:
 *       200:
 *         description: Assessment retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: Assessment retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                       nullable: true
 *                     duration:
 *                       type: integer
 *                     totalMarks:
 *                       type: integer
 *                     status:
 *                       type: string
 *                       enum:
 *                         - DRAFT
 *                         - PUBLISHED
 *                         - ACTIVE
 *                         - CLOSED
 *                     recruiter:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                           format: email
 *                         role:
 *                           type: string
 *                         isActive:
 *                           type: boolean
 *                     problems:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           order:
 *                             type: integer
 *                           points:
 *                             type: integer
 *                           problem:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 format: uuid
 *                               title:
 *                                 type: string
 *                               type:
 *                                 type: string
 *                               difficulty:
 *                                 type: string
 *                               points:
 *                                 type: integer
 *                     invitations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           status:
 *                             type: string
 *                           expiresAt:
 *                             type: string
 *                             format: date-time
 *                             nullable: true
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           candidate:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 format: uuid
 *                               name:
 *                                 type: string
 *                               email:
 *                                 type: string
 *                                 format: email
 *                     attempts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           status:
 *                             type: string
 *                           startedAt:
 *                             type: string
 *                             format: date-time
 *                             nullable: true
 *                           expiresAt:
 *                             type: string
 *                             format: date-time
 *                             nullable: true
 *                           submittedAt:
 *                             type: string
 *                             format: date-time
 *                             nullable: true
 *                           score:
 *                             type: integer
 *                           candidate:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 format: uuid
 *                               name:
 *                                 type: string
 *                               email:
 *                                 type: string
 *                                 format: email
 *                           result:
 *                             type: object
 *                             nullable: true
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 format: uuid
 *                               obtainedMarks:
 *                                 type: integer
 *                               totalMarks:
 *                                 type: integer
 *                               percentage:
 *                                 type: number
 *                               status:
 *                                 type: string
 *                                 enum:
 *                                   - PASS
 *                                   - FAIL
 *                     _count:
 *                       type: object
 *                       properties:
 *                         problems:
 *                           type: integer
 *                         invitations:
 *                           type: integer
 *                         attempts:
 *                           type: integer
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *
 *       401:
 *         description: Unauthorized.
 *
 *       403:
 *         description: Admin access required.
 *
 *       404:
 *         description: Assessment not found.
 */
router.get(
  "/assessments/:assessmentId",
  auth("ADMIN"),
  adminController.getAssessmentById,
);

/**
 * @swagger
 * /admin/assessments/{assessmentId}/close:
 *   patch:
 *     summary: Close assessment
 *     description: Close a published or active assessment. Draft assessments cannot be closed.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: assessmentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *
 *     responses:
 *       200:
 *         description: Assessment closed successfully.
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
 *                   example: Assessment closed successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                       nullable: true
 *                     duration:
 *                       type: integer
 *                     totalMarks:
 *                       type: integer
 *                     status:
 *                       type: string
 *                       example: CLOSED
 *                     recruiter:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                           format: email
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *
 *       400:
 *         description: Assessment is already closed or draft assessment cannot be closed.
 *
 *       401:
 *         description: Unauthorized.
 *
 *       403:
 *         description: Admin access required.
 *
 *       404:
 *         description: Assessment not found.
 */
router.patch(
  "/assessments/:assessmentId/close",
  auth("ADMIN"),
  adminController.closeAssessment,
);

/**
 * @swagger
 * /admin/statistics:
 *   get:
 *     summary: Get platform statistics
 *     description: Retrieve overall statistics for users, companies, problems, assessments, platform activity, and results.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Platform statistics retrieved successfully.
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
 *                   example: Platform statistics retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         candidates:
 *                           type: integer
 *                         recruiters:
 *                           type: integer
 *                         creators:
 *                           type: integer
 *                         evaluators:
 *                           type: integer
 *                         admins:
 *                           type: integer
 *
 *                     companies:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         active:
 *                           type: integer
 *                         suspended:
 *                           type: integer
 *
 *                     problems:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         coding:
 *                           type: integer
 *                         mcq:
 *                           type: integer
 *                         written:
 *                           type: integer
 *
 *                     assessments:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         draft:
 *                           type: integer
 *                         published:
 *                           type: integer
 *                         active:
 *                           type: integer
 *                         closed:
 *                           type: integer
 *
 *                     activity:
 *                       type: object
 *                       properties:
 *                         totalInvitations:
 *                           type: integer
 *                         totalAttempts:
 *                           type: integer
 *                         totalSubmissions:
 *                           type: integer
 *                         totalEvaluations:
 *                           type: integer
 *
 *                     results:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         passed:
 *                           type: integer
 *                         failed:
 *                           type: integer
 *
 *       401:
 *         description: Unauthorized.
 *
 *       403:
 *         description: Admin access required.
 */
router.get(
  "/statistics",
  auth("ADMIN"),
  adminController.getPlatformStatistics,
);

export const adminRoutes = router;