import {
  Router,
} from "express";




import {
  manualEvaluationSchema,
} from "./evaluation.validation.js";

import {
  evaluationController,
} from "./evaluation.controller.js";
import { auth } from "../../middleware/auth.js";
import { validateRequest } from "../../middleware/validateRequest.js";


const router = Router();


/**
 * Get all pending written submissions.
 *
 * EVALUATOR / ADMIN only
 */
router.get(
  "/pending",

  auth(
    "EVALUATOR",
    "ADMIN",
  ),

  evaluationController
    .getPendingEvaluations,
);


/**
 * Get a submission before evaluating it.
 *
 * EVALUATOR / ADMIN only
 */
router.get(
  "/submissions/:submissionId",

  auth(
    "EVALUATOR",
    "ADMIN",
  ),

  evaluationController
    .getSubmissionForEvaluation,
);


/**
 * Manually evaluate a WRITTEN submission.
 *
 * EVALUATOR / ADMIN only
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

  evaluationController
    .evaluateWritten,
);


/**
 * Get evaluation details.
 *
 * EVALUATOR / ADMIN only
 */
router.get(
  "/:submissionId",

  auth(
    "EVALUATOR",
    "ADMIN",
  ),

  evaluationController
    .getEvaluationBySubmissionId,
);


export const evaluationRoutes =
  router;