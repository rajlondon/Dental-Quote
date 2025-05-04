import { Request, Response, NextFunction } from 'express';

/**
 * Utility for handling async route handlers to avoid try/catch blocks in each route
 * This wraps an async express route handler and forwards any errors to Express's error handler
 * 
 * @param fn Async function to be wrapped
 * @returns Express middleware function with error handling
 */
export const catchAsync = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Execute the function and catch any errors
    fn(req, res, next).catch(next);
  };
};