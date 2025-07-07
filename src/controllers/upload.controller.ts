// src/controllers/upload.controller.ts

import { Request, Response } from 'express';

// ✅ 1. Define an interface that extends the base Request and adds your custom property.
interface IUploadRequest extends Request {
  fileValidationError?: string;
}

export const uploadProfileAvatar = (req: IUploadRequest, res: Response) => {
  // ✅ 2. Use the new interface here.
  // ✅ 3. Now, TypeScript knows this property exists.
  if (req.fileValidationError) {
    res.status(400).json({ success: false, message: req.fileValidationError });
    return;
  }

  if (!req.file) {
    res.status(400).json({ success: false, message: 'No file was uploaded.' });
    return;
  }

  // Construct the public URL, ensuring forward slashes for web compatibility.
  const fileUrl = req.file.path.replace('public', '').replace(/\\/g, '/');

  res.status(200).json({
    success: true,
    message: 'Avatar uploaded successfully.',
    data: {
      url: fileUrl, // e.g., /uploads/avatars/unique-name.png
    },
  });
};
