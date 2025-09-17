// src/controllers/association.controller.ts

import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Association, { IAssociationRequest } from '../models/Association.model';
import User from '../models/user.model';
import AssociationRequest from '../models/Association.model';
import { UserPayload } from './profile.controller';

/**
 * @description ایجاد یک انجمن جدید (بدون تراکنش برای محیط توسعه)
 */
export const createAssociation = async (req: Request, res: Response) => {
  const { requestId } = req.body; // ادمین شناسه درخواست رو می‌فرسته
  //  const adminId = req.user?.id;   // از JWT → باید role=admin باشه

  if (!requestId) {
    res.status(400).json({ message: 'شناسه درخواست الزامی است.' });
    return;
  }
  if (!mongoose.Types.ObjectId.isValid(requestId)) {
    res.status(400).json({ message: 'شناسه درخواست معتبر نیست.' });
    return;
  }

  try {
    // ۱. درخواست انجمن رو پیدا می‌کنیم
    const request = await AssociationRequest.findById(requestId);
    if (!request) {
      res.status(404).json({ message: 'درخواست انجمن یافت نشد.' });
      return;
    }
    if (request.status !== 'pending') {
      res.status(400).json({ message: 'این درخواست قبلاً بررسی شده است.' });
      return;
    }

    // ۲. بررسی کاربر درخواست‌دهنده
    const managerUser = await User.findById(request.requestedBy);
    if (!managerUser) {
      res.status(404).json({ message: 'کاربر درخواست‌دهنده یافت نشد.' });
      return;
    }

    // ۳. ساخت انجمن جدید
    const newAssociation = new Association({
      name: request.name,
      description: request.description,
      logo: request.logo,
      manager: request.requestedBy,
    });
    await newAssociation.save();

    // ۴. تغییر نقش کاربر به association_manager
    await User.findByIdAndUpdate(request.requestedBy, { role: 'association_manager' });

    // ۵. به‌روزرسانی وضعیت درخواست
    request.status = 'approved';
    request.adminNote = `تایید توسط ادمین `;
    await request.save();

    res.status(201).json({
      message: 'انجمن تایید و ایجاد شد.',
      association: newAssociation,
    });
  } catch (error: any) {
    console.error('Error approving association request:', error);
    res.status(500).json({ message: 'خطا در تایید انجمن: ' + error.message });
  }
};

export const createAssociationRequest = async (req: Request, res: Response) => {
  try {
    const { name, description, reason, documents, contactInfo, category } = req.body;

    const userId = (req.user as UserPayload).id; // <-- اینجوری تایپ می‌کنیم

    const newRequest: Partial<IAssociationRequest> = {
      name,
      description,
      reason,
      documents,
      contactInfo,
      category,
      requestedBy: new mongoose.Types.ObjectId(userId), // تبدیل id به ObjectId
      status: 'pending',
    };

    const associationRequest = await AssociationRequest.create(newRequest);

    res.status(201).json({ success: true, data: associationRequest });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// user submits request
export const requestAssociation = async (req: Request, res: Response) => {
  const { name, description, logo } = req.body;
  const userId = (req.user as UserPayload).id; // از توکن JWT می‌گیریم

  if (!userId) {
    res.status(401).json({ message: 'ابتدا وارد شوید.' });
    return;
  }

  try {
    const newRequest = new AssociationRequest({
      name,
      description,
      logo,
      requestedBy: userId,
    });

    await newRequest.save();
    res.status(201).json({ message: 'درخواست شما ثبت شد و در انتظار تایید ادمین است.' });
  } catch (error: any) {
    res.status(500).json({ message: 'خطا در ثبت درخواست: ' + error.message });
  }
};

export const updateAssociation = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, logo } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: 'شناسه انجمن معتبر نیست.' });
    return;
  }

  try {
    const associationToUpdate = await Association.findById(id);
    if (!associationToUpdate) {
      res.status(404).json({ message: 'انجمن برای ویرایش یافت نشد.' });
      return;
    }

    // فقط آپدیت فیلدهای انجمن (بدون تغییر منیجر)
    associationToUpdate.name = name || associationToUpdate.name;
    associationToUpdate.description = description || associationToUpdate.description;
    associationToUpdate.logo = logo || associationToUpdate.logo;

    const updatedAssociation = await associationToUpdate.save();
    res.status(200).json(updatedAssociation);
  } catch (error: any) {
    console.error('Error updating association:', error);
    res.status(500).json({ message: 'خطا در ویرایش انجمن: ' + error.message });
  }
};

/**
 * @description دریافت لیست تمام انجمن‌ها
 */
export const getAllAssociations = async (req: Request, res: Response) => {
  try {
    const associations = await Association.find().populate('manager', 'username email');
    res.status(200).json(associations);
  } catch (error) {
    res.status(500).json({ message: 'خطا در دریافت لیست انجمن‌ها' });
  }
};

/**
 * @description دریافت اطلاعات یک انجمن خاص
 */
export const getAssociationById = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: 'شناسه انجمن معتبر نیست.' });
    return;
  }
  try {
    const association = await Association.findById(id).populate('manager', 'username email');
    if (!association) {
      res.status(404).json({ message: 'انجمن یافت نشد.' });
      return;
    }
    res.status(200).json(association);
  } catch (error) {
    res.status(500).json({ message: 'خطا در دریافت اطلاعات انجمن' });
  }
};

/**
 * @description حذف یک انجمن (بدون تراکنش برای محیط توسعه)
 */
export const deleteAssociation = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: 'شناسه انجمن معتبر نیست.' });
    return;
  }

  try {
    const associationToDelete = await Association.findById(id);
    if (!associationToDelete) {
      res.status(404).json({ message: 'انجمن برای حذف یافت نشد.' });
      return;
    }

    // ۱. حذف انجمن
    await Association.findByIdAndDelete(id);

    // ۲. TODO: پاک کردن موجودیت‌های وابسته
    // مثل: رویدادها، تیم‌ها یا اعلان‌های مرتبط با انجمن
    // await Event.deleteMany({ association: id });

    res.status(200).json({ message: 'انجمن با موفقیت حذف شد.' });
  } catch (error: any) {
    console.error('Error deleting association:', error);
    res.status(500).json({ message: 'خطا در حذف انجمن: ' + error.message });
  }
};
