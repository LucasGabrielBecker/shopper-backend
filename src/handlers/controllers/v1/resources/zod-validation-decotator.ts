import { AnyZodObject } from 'zod';
import { Request, Response, NextFunction } from 'express';

export function validateDTO(schema: AnyZodObject) {
  return function (req: Request, res: Response, next: NextFunction) {
    const errors = schema.safeParse(req.body);

    if (!errors.success) {
      return res.status(400).json({
        error_description: errors.error.errors,
        error_code: 'INVALID_DATA',
      });
    }

    next();
  };
}
