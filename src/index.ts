import app from './app';

const PORT: number = 3000;

// راه‌اندازی سرور
app.listen(PORT, () => {
  console.log(`سرور روی پورت ${PORT} اجرا شد`);
});
