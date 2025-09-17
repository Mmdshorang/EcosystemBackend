import { Request, Response, NextFunction } from 'express';
import { UserPayload } from '../controllers/profile.controller';


export const authorize = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ message: 'عدم دسترسی، لطفا ابتدا وارد شوید.' });
      return;
    }
 
    const userRole = (req.user as { id: string; role: string }).role;

    if (userRole === 'admin') {
      return next();
    }

    if (allowedRoles.includes(userRole)) {
      next();
    } else {
      res.status(403).json({ message: 'شما دسترسی لازم برای این عملیات را ندارید.' });
    }
  };
};