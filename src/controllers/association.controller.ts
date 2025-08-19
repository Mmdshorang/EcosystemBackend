// src/controllers/association.controller.ts

import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Association from '../models/Association.model';
import User from '../models/User.model';

/**
 * @description ایجاد یک انجمن جدید (بدون تراکنش برای محیط توسعه)
 */
export const createAssociation = async (req: Request, res: Response) => {
  const { name, description, logo, managerId } = req.body;

  if (!name || !managerId) {
    res.status(400).json({ message: 'نام انجمن و شناسه مدیر الزامی است.' });
    return;
  }
  if (!mongoose.Types.ObjectId.isValid(managerId)) {
    res.status(400).json({ message: 'شناسه مدیر معتبر نیست.' });
    return;
  }

  try {
    // ابتدا بررسی می‌کنیم که کاربر مدیر وجود دارد
    const managerUser = await User.findById(managerId);
    if (!managerUser) {
      res.status(404).json({ message: 'کاربری برای مدیریت یافت نشد.' });
      return;
    }

    // ۱. انجمن جدید را ایجاد می‌کنیم
    const newAssociation = new Association({ name, description, logo, manager: managerId });
    await newAssociation.save();

    // ۲. نقش کاربر را به 'association_manager' تغییر می‌دهیم
    await User.findByIdAndUpdate(managerId, { role: 'association_manager' });

    res.status(201).json(newAssociation);
  } catch (error: any) {
    // این یک مشکل در حالت بدون تراکنش است: اگر اینجا خطا دهد،
    // ممکن است انجمن ایجاد شده باشد اما نقش کاربر تغییر نکرده باشد.
    // این ریسک در محیط توسعه قابل قبول است.
    console.error('Error creating association:', error);
    res.status(500).json({ message: 'خطا در ایجاد انجمن: ' + error.message });
  }
};

export const updateAssociation = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, logo, managerId } = req.body;

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

    // بررسی تغییر مدیر
    if (managerId && associationToUpdate.manager.toString() !== managerId) {
      // ۱. بررسی معتبر بودن مدیر جدید
      const newManager = await User.findById(managerId);
      if (!newManager) {
        res.status(404).json({ message: 'کاربر مدیر جدید یافت نشد.' });
        return;
      }
      // ۲. تغییر نقش مدیر قبلی به 'user'
      await User.findByIdAndUpdate(associationToUpdate.manager, { role: 'user' });
      // ۳. تغییر نقش مدیر جدید به 'association_manager'
      await User.findByIdAndUpdate(managerId, { role: 'association_manager' });
    }

    // آپدیت کردن فیلدهای انجمن
    associationToUpdate.name = name || associationToUpdate.name;
    associationToUpdate.description = description || associationToUpdate.description;
    associationToUpdate.logo = logo || associationToUpdate.logo;
    if (managerId) {
      associationToUpdate.manager = managerId;
    }

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

    // ۱. نقش مدیر قبلی را به 'user' برگردان
    await User.findByIdAndUpdate(associationToDelete.manager, { role: 'user' });

    // ۲. انجمن را حذف کن
    await Association.findByIdAndDelete(id);

    // نکته: منطق حذف رویدادهای وابسته اینجا باید اضافه شود
    // await Event.deleteMany({ association: id });

    res.status(200).json({ message: 'انجمن با موفقیت حذف شد.' });
  } catch (error: any) {
    res.status(500).json({ message: 'خطا در حذف انجمن: ' + error.message });
  }
};
