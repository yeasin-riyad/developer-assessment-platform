import { Router } from "express";

import { auth } from "../../middleware/auth.js";
import { resultController } from "./result.controller.js";

const router = Router();

// Candidate
router.post(
  "/attempts/:attemptId/generate",
  auth("CANDIDATE"),
  resultController.generateResult,
);

router.get(
  "/attempts/:attemptId",
  auth("CANDIDATE"),
  resultController.getMyResult,
);

// Recruiter
router.get(
  "/assessments/:assessmentId/statistics",
  auth("RECRUITER"),
  resultController.getAssessmentStatistics,
);

router.get(
  "/assessments/:assessmentId",
  auth("RECRUITER"),
  resultController.getAssessmentResults,
);

router.get(
  "/:resultId",
  auth("RECRUITER"),
  resultController.getRecruiterResultById,
);

export const resultRoutes = router;