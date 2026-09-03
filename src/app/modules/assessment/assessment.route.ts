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

router.post(
  "/",
  auth("RECRUITER"),
  validateRequest(createAssessmentSchema),
  assessmentController.createAssessment,
);

router.get(
  "/",
  auth("RECRUITER"),
  assessmentController.getMyAssessments,
);

router.get(
  "/:id",
  auth("RECRUITER"),
  assessmentController.getAssessmentById,
);

router.patch(
  "/:id",
  auth("RECRUITER"),
  validateRequest(updateAssessmentSchema),
  assessmentController.updateAssessment,
);

router.post(
  "/:id/problems",
  auth("RECRUITER"),
  validateRequest(addProblemSchema),
  assessmentController.addProblem,
);

router.delete(
  "/:id/problems/:problemId",
  auth("RECRUITER"),
  assessmentController.removeProblem,
);

router.patch(
  "/:id/publish",
  auth("RECRUITER"),
  assessmentController.publishAssessment,
);

router.patch(
  "/:id/unpublish",
  auth("RECRUITER"),
  assessmentController.unpublishAssessment,
);

export const assessmentRoutes = router;