import { Router } from "express";
import { companyController } from "./company.controller.js";
import { createCompanySchema } from "./company.validation.js";
import { auth } from "../../middleware/auth.js";
import { validateRequest } from "../../middleware/validateRequest.js";

const router = Router();

router.post(
  "/",
  auth("RECRUITER"),
  validateRequest(createCompanySchema),
  companyController.createCompany,
);

router.get(
  "/me",
  auth("RECRUITER"),
  companyController.getMyCompany,
);

export const companyRoutes = router;