// file: types/express.d.ts

// این اینترفیس شکل دقیق داده‌های داخل توکن شما را مشخص می‌کند
export interface JwtPayload {
  user: {
    id: string;
    role: string;
  };
}

// این بخش اصلی کار است:
// ما به تایپ‌اسکریپت می‌گوییم که به اینترفیس Request در Express
// یک پراپرتی جدید به نام user اضافه کن
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload['user'];
    }
  }
}