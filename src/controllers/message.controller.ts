import { Request, Response } from 'express';
import Message from '../models/Message.model';
import mongoose from 'mongoose';

interface RequestUser {
  id: string;
}

/**
 * @desc ارسال یک پیام جدید
 */
export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  const { content } = req.body;
  const receiverId = req.params.receiverId;
  const senderId = (req.user as RequestUser).id;

  try {
    // 1. ساخت سند
    const newMessage = new Message({
      sender: senderId,
      receiver: receiverId,
      content,
    });

    // 2. ذخیره سند و گرفتن Document واقعی
    const savedMessage = await newMessage.save();

    // 3. populate روی Document ذخیره‌شده
    await savedMessage.populate('sender', '_id username fullName avatar');
    await savedMessage.populate('receiver', '_id username fullName avatar');

    res.status(201).json(savedMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطای سرور' });
  }
};


/**
 * @desc دریافت تاریخچه پیام‌ها بین دو کاربر
 */
export const getMessages = async (req: Request, res: Response): Promise<void> => {
  const otherUserId = req.params.otherUserId;
  const currentUserId = (req.user as RequestUser).id;

  try {
    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId },
      ],
    })
      .sort({ createdAt: 'asc' }) // مرتب‌سازی بر اساس زمان
      .populate('sender', '_id username fullName avatar')   // اضافه شد
      .populate('receiver', '_id username fullName avatar'); // اضافه شد

    res.status(200).json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطای سرور' });
  }
};

/**
 * @desc دریافت لیست تمام گفتگوها
 */
export const getConversations = async (req: Request, res: Response): Promise<void> => {
  const currentUserId = new mongoose.Types.ObjectId((req.user as RequestUser).id);

  try {
    // با Aggregation، آخرین پیام هر گفتگو را پیدا می‌کنیم
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: currentUserId }, { receiver: currentUserId }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $gt: ['$sender', '$receiver'] },
              then: { $concat: [{ $toString: '$sender' }, '-', { $toString: '$receiver' }] },
              else: { $concat: [{ $toString: '$receiver' }, '-', { $toString: '$sender' }] },
            },
          },
          lastMessage: { $first: '$$ROOT' },
        },
      },
      {
        $replaceRoot: { newRoot: '$lastMessage' },
      },
      {
        $lookup: { from: 'users', localField: 'sender', foreignField: '_id', as: 'senderDetails' },
      },
      {
        $lookup: { from: 'users', localField: 'receiver', foreignField: '_id', as: 'receiverDetails' },
      },
      {
        $unwind: '$senderDetails',
      },
      {
        $unwind: '$receiverDetails',
      },
    ]);

    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ message: 'خطای سرور' });
  }
};

/**
 * @desc حذف کل گفتگو بین کاربر فعلی و یک کاربر دیگر
 */
export const deleteConversation = async (req: Request, res: Response): Promise<void> => {
  const otherUserId = req.params.otherUserId;
  const currentUserId = (req.user as RequestUser).id;

  try {
    // حذف همه پیام‌های بین این دو کاربر
    await Message.deleteMany({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId },
      ],
    });

    res.status(200).json({ message: 'گفتگو با موفقیت حذف شد.' });
  } catch (error) {
    res.status(500).json({ message: 'خطای سرور در حذف گفتگو' });
  }
};

export const deleteMessage = async (req: Request, res: Response): Promise<void> => {
  const messageId = req.params.messageId;
  const currentUserId = (req.user as RequestUser).id;

  try {
    const message = await Message.findById(messageId);
    if (!message) {
      res.status(404).json({ message: "پیام یافت نشد" });
      return;
    }

    // فقط فرستنده یا گیرنده می‌تونه پیام رو حذف کنه
    if (message.sender.toString() !== currentUserId && message.receiver.toString() !== currentUserId) {
      res.status(403).json({ message: "اجازه حذف این پیام را ندارید" });
      return;
    }

    await message.deleteOne();
    res.status(200).json({ message: "پیام با موفقیت حذف شد." });
  } catch (error) {
    res.status(500).json({ message: "خطای سرور در حذف پیام" });
  }
};

/**
 * @desc علامت‌گذاری پیام به عنوان خوانده شده
 */
export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  const messageId = req.params.messageId;
  const currentUserId = (req.user as RequestUser).id;

  try {
    const message = await Message.findById(messageId);
    if (!message) {
      res.status(404).json({ message: "پیام یافت نشد" });
      return;
    }

    // فقط گیرنده می‌تونه پیام رو خوانده شده کنه
    if (message.receiver.toString() !== currentUserId) {
      res.status(403).json({ message: "اجازه تغییر وضعیت این پیام را ندارید" });
      return;
    }

    message.isRead = true;
    await message.save();

    res.status(200).json({ message: "پیام به عنوان خوانده شده علامت‌گذاری شد." });
  } catch (error) {
    res.status(500).json({ message: "خطای سرور در تغییر وضعیت پیام" });
  }
};