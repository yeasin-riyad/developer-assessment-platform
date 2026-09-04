import { Router } from "express";

import { auth } from "../../middleware/auth.js";
import { validateRequest } from "../../middleware/validateRequest.js";

import { attemptController } from "./attempt.controller.js";
import { saveAnswerSchema } from "./attempt.validation.js";

const router = Router();

router.get(
  "/:id",
  auth("CANDIDATE"),
  attemptController.getMyAttempt,
);

router.post(
  "/:id/start",
  auth("CANDIDATE"),
  attemptController.startAttempt,
);

router.get(
  "/:id/questions",
  auth("CANDIDATE"),
  attemptController.getAttemptQuestions,
);

router.get(
  "/:id/status",
  auth("CANDIDATE"),
  attemptController.getAttemptStatus,
);

router.patch(
  "/:id/answers",
  auth("CANDIDATE"),
  validateRequest(saveAnswerSchema),
  attemptController.saveAnswer,
);

router.post(
  "/:id/submit",
  auth("CANDIDATE"),
  attemptController.submitAttempt,
);

export const attemptRoutes = router;