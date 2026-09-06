import { Router } from "express";

import { auth } from "../../middleware/auth.js";
import { validateRequest } from "../../middleware/validateRequest.js";

import {
  updateUserRoleSchema,
  updateUserStatusSchema,
} from "./admin.validation.js";

import { adminController } from "./admin.controller.js";

const router = Router();

router.get(
  "/users",
  auth("ADMIN"),
  adminController.getAllUsers,
);

router.get(
  "/users/:userId",
  auth("ADMIN"),
  adminController.getUserById,
);

router.patch(
  "/users/:userId/role",
  auth("ADMIN"),
  validateRequest(updateUserRoleSchema),
  adminController.updateUserRole,
);

router.patch(
  "/users/:userId/status",
  auth("ADMIN"),
  validateRequest(updateUserStatusSchema),
  adminController.updateUserStatus,
);

router.delete(
  "/users/:userId",
  auth("ADMIN"),
  adminController.deleteUser,
);

export const adminRoutes = router;