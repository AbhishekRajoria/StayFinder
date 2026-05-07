import { Response } from "express";

interface ResponseData {
  success: boolean;
  data?: any;
  message?: string;
  statusCode?: number;
}

export const sendResponse = (
  res: Response,
  statusCode: number,
  status: "success" | "fail" | "error",
  data?: any,
  message?: string
) => {
  const response: any = {
    status,
  };

  if (data) response.data = data;
  if (message) response.message = message;

  return res.status(statusCode).json(response);
};

export const sendSuccess = (res: any, data: any = null, message: string = 'Success', statusCode: number = 200) => {
  const response: ResponseData = {
    success: true,
    data,
    message,
    statusCode,
  };
  return res.status(statusCode).json(response);
};

export const sendError = (res: any, message: string = 'Error', statusCode: number = 500) => {
  const response: ResponseData = {
    success: false,
    message,
    statusCode,
  };
  return res.status(statusCode).json(response);
}; 