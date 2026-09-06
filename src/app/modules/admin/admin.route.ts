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

// ===============================
// User Management
// ===============================

router.get(
  "/users",
  auth("ADMIN"),
  adminController.getAllUsers,
);

router.get(
  "/users/:userId",
  auth("ADMIN"),
  adminController.getUserById,
);

router.patch(
  "/users/:userId/role",
  auth("ADMIN"),
  validateRequest(updateUserRoleSchema),
  adminController.updateUserRole,
);

router.patch(
  "/users/:userId/status",
  auth("ADMIN"),
  validateRequest(updateUserStatusSchema),
  adminController.updateUserStatus,
);

router.delete(
  "/users/:userId",
  auth("ADMIN"),
  adminController.deleteUser,
);

// ===============================
// Company Management
// ===============================

router.get(
  "/companies",
  auth("ADMIN"),
  adminController.getAllCompanies,
);

router.get(
  "/companies/:companyId",
  auth("ADMIN"),
  adminController.getCompanyById,
);

router.patch(
  "/companies/:companyId/status",
  auth("ADMIN"),
  validateRequest(
    updateCompanyStatusSchema,
  ),
  adminController.updateCompanyStatus,
);

router.delete(
  "/companies/:companyId",
  auth("ADMIN"),
  adminController.deleteCompany,
);

// ===============================
// Problem Management
// ===============================

router.get(
  "/problems",
  auth("ADMIN"),
  adminController.getAllProblems,
);

router.get(
  "/problems/:problemId",
  auth("ADMIN"),
  adminController.getProblemById,
);

router.delete(
  "/problems/:problemId",
  auth("ADMIN"),
  adminController.deleteProblem,
);

// ===============================
// Assessment Management
// ===============================

router.get(
  "/assessments",
  auth("ADMIN"),
  adminController.getAllAssessments,
);

router.get(
  "/assessments/:assessmentId",
  auth("ADMIN"),
  adminController.getAssessmentById,
);

router.patch(
  "/assessments/:assessmentId/close",
  auth("ADMIN"),
  adminController.closeAssessment,
);

router.get(
  "/statistics",
  auth("ADMIN"),
  adminController.getPlatformStatistics,
);
export const adminRoutes = router;