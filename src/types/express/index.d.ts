// این فایل به صورت خودکار توسط تایپ‌اسکریپت شناسایی می‌شود
declare namespace Express {
  export interface Request {
    user?: {
      id: string;
      role: string;
    };
  }
}