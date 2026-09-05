import { Router } from "express";

import {
  createSubmissionSchema,
} from "./submission.validation.js";

import {
  submissionController,
} from "./submission.controller.js";

import { auth } from "../../middleware/auth.js";
import { validateRequest } from "../../middleware/validateRequest.js";

const router = Router();

router.post(
  "/attempts/:attemptId",
  auth("CANDIDATE"),
  validateRequest(createSubmissionSchema),
  submissionController.createSubmission,
);

router.get(
  "/my",
  auth("CANDIDATE"),
  submissionController.getMySubmissions,
);

router.get(
  "/:submissionId",
  auth("CANDIDATE"),
  submissionController.getSubmissionById,
);

export const submissionRoutes = router;