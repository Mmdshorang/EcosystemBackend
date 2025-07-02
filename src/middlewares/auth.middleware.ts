// file: middleware/auth.middleware.ts

import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

// Export this interface so it can be used in your type definition file


export const auth = (req: Request, res: Response, next: NextFunction): void => {
  // 1. Get token from the 'Authorization' header
  const authHeader = req.header('Authorization');

  // 2. Check if it's a valid Bearer token
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'عدم دسترسی، توکن نامعتبر است' });
    return;
  }

  try {
    // 3. Extract the token value
    const tokenValue = authHeader.split(' ')[1];

    // 4. Verify the token
    const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET as string) as JwtPayload;
    
    // 5. Attach user payload to the request object
    req.user = decoded.user; // This line now works because of the .d.ts file

    // 6. Proceed to the next middleware or controller
    next();
  } catch (err) {
    // If token is not valid, send an error
    res.status(401).json({ success: false, message: 'توکن معتبر نیست' });
  }
};