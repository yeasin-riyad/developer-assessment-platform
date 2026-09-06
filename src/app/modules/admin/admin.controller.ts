import type { Request, Response } from "express";
import httpStatus from "http-status";

import { catchAsync } from "../../utils/catchAsync.js";
import { adminService } from "./admin.service.js";

const getAllUsers = catchAsync(
  async (req: Request, res: Response) => {
    const role = req.query.role as
      | "CANDIDATE"
      | "RECRUITER"
      | "CREATOR"
      | "EVALUATOR"
      | "ADMIN"
      | undefined;

    const isActiveQuery =
      req.query.isActive as
        | "true"
        | "false"
        | undefined;

    const search =
      req.query.search as string | undefined;

    const users =
      await adminService.getAllUsers({
        role,

        isActive:
          isActiveQuery === undefined
            ? undefined
            : isActiveQuery === "true",

        search,
      });

    res.status(httpStatus.OK).json({
      success: true,
      message: "Users retrieved successfully",
      data: users,
    });
  },
);

const getUserById = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.params.userId as string;

    const user =
      await adminService.getUserById(
        userId,
      );

    res.status(httpStatus.OK).json({
      success: true,
      message: "User retrieved successfully",
      data: user,
    });
  },
);

const updateUserRole = catchAsync(
  async (req: Request, res: Response) => {
    const adminId = req.user!.userId;
    const userId = req.params.userId as string;

    const user =
      await adminService.updateUserRole(
        adminId,
        userId,
        req.body.role,
      );

    res.status(httpStatus.OK).json({
      success: true,
      message: "User role updated successfully",
      data: user,
    });
  },
);

const updateUserStatus = catchAsync(
  async (req: Request, res: Response) => {
    const adminId = req.user!.userId;
    const userId = req.params.userId as string;

    const user =
      await adminService.updateUserStatus(
        adminId,
        userId,
        req.body.isActive,
      );

    res.status(httpStatus.OK).json({
      success: true,
      message: "User status updated successfully",
      data: user,
    });
  },
);

const deleteUser = catchAsync(
  async (req: Request, res: Response) => {
    const adminId = req.user!.userId;
    const userId = req.params.userId as string;

    await adminService.deleteUser(
      adminId,
      userId,
    );

    res.status(httpStatus.OK).json({
      success: true,
      message: "User deleted successfully",
    });
  },
);

const getAllCompanies = catchAsync(
  async (
    req: Request,
    res: Response,
  ) => {
    const status =
      req.query.status as
        | "ACTIVE"
        | "SUSPENDED"
        | undefined;

    const search =
      req.query.search as
        | string
        | undefined;

    const companies =
      await adminService.getAllCompanies({
        status,
        search,
      });

    res.status(httpStatus.OK).json({
      success: true,
      message:
        "Companies retrieved successfully",
      data: companies,
    });
  },
);

const getCompanyById = catchAsync(
  async (
    req: Request,
    res: Response,
  ) => {
    const companyId =
      req.params.companyId as string;

    const company =
      await adminService.getCompanyById(
        companyId,
      );

    res.status(httpStatus.OK).json({
      success: true,
      message:
        "Company retrieved successfully",
      data: company,
    });
  },
);

const updateCompanyStatus = catchAsync(
  async (
    req: Request,
    res: Response,
  ) => {
    const companyId =
      req.params.companyId as string;

    const company =
      await adminService.updateCompanyStatus(
        companyId,
        req.body.status,
      );

    res.status(httpStatus.OK).json({
      success: true,
      message:
        "Company status updated successfully",
      data: company,
    });
  },
);

const deleteCompany = catchAsync(
  async (
    req: Request,
    res: Response,
  ) => {
    const companyId =
      req.params.companyId as string;

    await adminService.deleteCompany(
      companyId,
    );

    res.status(httpStatus.OK).json({
      success: true,
      message:
        "Company deleted successfully",
    });
  },
);

export const adminController = {
  getAllUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  getAllCompanies,
  getCompanyById,
  updateCompanyStatus,
  deleteCompany,
};