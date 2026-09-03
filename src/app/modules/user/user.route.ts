import { Router } from "express";

import { userController } from "./user.controller.js";
import { auth } from "../../middleware/auth.js";

const router = Router();

router.get(
  "/me",
  auth(),
  userController.getMyProfile,
);

export const userRoutes = router;