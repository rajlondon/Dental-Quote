import { Request, Response, NextFunction } from 'express';

/**
 * Higher-order function that wraps async route handlers to catch errors
 * and pass them to Express error handling middleware
 */
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};