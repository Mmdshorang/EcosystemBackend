// src/types/express.d.ts

// ۱. شکل دقیق داده‌های کاربر خود را تعریف می‌کنیم
interface CustomUserPayload {
  id: string;
  role: string;
}

// ۲. به صورت سراسری، ماژول Express را گسترش می‌دهیم
declare global {
  namespace Express {
    // ۳. به TypeScript می‌گوییم که اینترفیس User (که توسط Passport استفاده می‌شود)
    // تمام پراپرتی‌های CustomUserPayload ما را هم دارد.
    // این کار به جای بازنویسی، تایپ‌ها را با هم "ادغام" می‌کند.
    export interface User extends CustomUserPayload {}

    // ۴. تایید می‌کنیم که req.user از نوع User آپدیت شده ما است.
    export interface Request {
      user?: User;
    }
  }
}