"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// ایجاد اپلیکیشن Express
const app = (0, express_1.default)();
// Middleware برای داده‌های JSON
app.use(express_1.default.json());
// مسیر اصلی
app.get('/', (req, res) => {
    res.send('سلام از TypeScript!');
});
exports.default = app;
