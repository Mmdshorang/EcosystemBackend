import express, { Application } from 'express';

// ایجاد اپلیکیشن Express
const app: Application = express();

// Middleware برای داده‌های JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// مسیر اصلی
app.get('/', (req, res) => {
  res.send('سلام از TypeScript!');
});

export default app;
