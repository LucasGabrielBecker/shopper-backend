import { NextFunction, Request, Response } from 'express';
interface IAuthService {
  canActivate(request: Request, response: Response, next: NextFunction): void;
}

export { IAuthService };
