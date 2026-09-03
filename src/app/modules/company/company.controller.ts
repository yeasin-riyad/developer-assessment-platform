import httpStatus from "http-status";

import { catchAsync } from "../../utils/catchAsync.js";
import { companyService } from "./company.service.js";

const createCompany = catchAsync(async (req, res) => {
  const company = await companyService.createCompany(
    req.user!.userId,
    req.body,
  );

  res.status(httpStatus.CREATED).json({
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Company created successfully",
    data: company,
  });
});

const getMyCompany = catchAsync(async (req, res) => {
  const company = await companyService.getMyCompany(
    req.user!.userId,
  );

  res.status(httpStatus.OK).json({
    success: true,
    statusCode: httpStatus.OK,
    message: "Company retrieved successfully",
    data: company,
  });
});

export const companyController = {
  createCompany,
  getMyCompany,
};