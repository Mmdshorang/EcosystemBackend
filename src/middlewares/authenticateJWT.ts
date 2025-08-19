import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import ApiError from '../utils/ApiError';
import config from '../config/config';

interface CustomJwtPayload extends JwtPayload {
  id: string;
  role: string;
}

const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError(401, 'توکن JWT یافت نشد'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as CustomJwtPayload;

    if (!decoded.id || !decoded.role) {
      return next(new ApiError(401, 'توکن ناقص است'));
    }

    req.user = decoded; // اکنون req.user شامل id و role است

    next();
  } catch (err) {
    return next(new ApiError(401, 'توکن JWT نامعتبر است'));
  }
};

export default authenticateJWT;
