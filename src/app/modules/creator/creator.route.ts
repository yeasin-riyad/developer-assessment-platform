
import { Router } from "express";

import { creatorController } from "./creator.controller.js";
import { auth } from "../../middleware/auth.js";



const router = Router();

router.get(
  "/dashboard/statistics",
  auth("CREATOR"),
  creatorController.getDashboardStatistics,
);

export const creatorRoutes = router;

