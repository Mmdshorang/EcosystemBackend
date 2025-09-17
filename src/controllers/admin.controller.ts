import { Request, Response } from 'express';
import AssociationRequest from '../models/Association.model';
import { UserPayload } from './profile.controller';

// گرفتن همه درخواست‌ها (ادمین)
export const getAllAssociationRequests = async (req: Request, res: Response) => {
  try {
    const requests = await AssociationRequest.find()
      .populate('requestedBy', 'name email') // اطلاعات کاربر درخواست‌دهنده
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: requests });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// گرفتن درخواست‌های خود کاربر
export const getMyAssociationRequests = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as UserPayload).id;

    const requests = await AssociationRequest.find({ requestedBy: userId }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: requests });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// گرفتن یک درخواست مشخص (برای نمایش جزئیات)
export const getAssociationRequestById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const request = await AssociationRequest.findById(id).populate('requestedBy', 'name email');

    if (!request) {
      res.status(404).json({ success: false, message: 'درخواست یافت نشد' });
      return;
    }

    // اگر کاربر عادی است، فقط اجازه دسترسی به درخواست خودش را بده
    const userId = (req.user as UserPayload).id;
    const userRole = (req.user as UserPayload).role;

    if (userRole !== 'admin' && request.requestedBy._id.toString() !== userId) {
      res.status(403).json({ success: false, message: 'شما اجازه دسترسی به این درخواست را ندارید' });
      return;
    }

    res.status(200).json({ success: true, data: request });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
export const updateAssociationRequestStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      res.status(400).json({ success: false, message: 'وضعیت باید approved یا rejected باشد' });
      return;
    }
    const request = await AssociationRequest.findById(id);
    if (!request) {
      res.status(404).json({ success: false, message: 'درخواست پیدا نشد' });
      return;
    }
    request.status = status;
    request.adminNote = adminNote || '';
    await request.save();
    res.status(200).json({ success: true, data: request });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'خطا در به‌روزرسانی وضعیت درخواست' });
  }
};
