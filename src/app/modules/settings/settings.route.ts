import { Router } from "express";

import { settingsController } from "./settings.controller.js";
import { auth } from "../../middleware/auth.js";



const router = Router();

router.use(auth("ADMIN","CANDIDATE","CREATOR","RECRUITER"));

router.get("/", settingsController.getMySettings);

router.patch("/profile", settingsController.updateMyProfile);

router.patch("/password", settingsController.changeMyPassword);

export const settingsRoutes = router;