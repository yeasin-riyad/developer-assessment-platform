import { Router } from "express";

import { CandidateController } from "./candidate.controller.js";
import { auth } from "../../middleware/auth.js";

const router = Router();

router.get(
  "/",
  auth("ADMIN", "RECRUITER"),
  CandidateController.getCandidates,
);

router.get(
  "/:candidateId/activities",
  auth("ADMIN", "RECRUITER"),
  CandidateController.getCandidateActivities,
);

router.get(
  "/:candidateId/assessments",
  auth("ADMIN", "RECRUITER"),
  CandidateController.getCandidateAssessments,
);

router.get(
  "/:candidateId",
  auth("ADMIN", "RECRUITER"),
  CandidateController.getCandidateById,
);

export const candidateRoutes=router;