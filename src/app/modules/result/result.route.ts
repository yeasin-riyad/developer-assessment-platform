import {
  Router,
} from "express";

import { auth } from "../../middleware/auth.js";

import {
  resultController,
} from "./result.controller.js";


const router = Router();


/**
 * Candidate generates final result
 */
router.post(
  "/attempts/:attemptId/generate",
  auth("CANDIDATE"),
  resultController.generateResult,
);


/**
 * Candidate gets own result
 */
router.get(
  "/attempts/:attemptId",
  auth("CANDIDATE"),
  resultController.getMyResult,
);


/**
 * Recruiter gets all results
 * of an assessment
 */
router.get(
  "/assessments/:assessmentId",
  auth("RECRUITER"),
  resultController.getAssessmentResults,
);


/**
 * Recruiter gets statistics
 */
router.get(
  "/assessments/:assessmentId/statistics",
  auth("RECRUITER"),
  resultController.getAssessmentStatistics,
);


/**
 * Recruiter gets a specific result
 */
router.get(
  "/:resultId",
  auth("RECRUITER"),
  resultController.getRecruiterResultById,
);


export const resultRoutes = router;