import { Router } from "express";
import { problemController } from "./problem.controller.js";
import { createProblemSchema } from "./problem.validation.js";
import { auth } from "../../middleware/auth.js";
import { validateRequest } from "../../middleware/validateRequest.js";

const router = Router();

router.post(
  "/",
  auth("CREATOR", "ADMIN"),
  validateRequest(createProblemSchema),
  problemController.createProblem,
);

router.get(
  "/",
  auth("CREATOR", "RECRUITER", "EVALUATOR", "ADMIN"),
  problemController.getAllProblems,
);

router.get(
  "/:id",
  auth("CREATOR", "RECRUITER", "EVALUATOR", "ADMIN"),
  problemController.getProblemById,
);

export const problemRoutes = router;