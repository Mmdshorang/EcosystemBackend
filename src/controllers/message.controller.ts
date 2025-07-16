import { Request, Response } from 'express';
import Message from '../models/Message.model';
import mongoose from 'mongoose';

interface RequestUser { id: string; }

/**
 * @desc ارسال یک پیام جدید
 */
export const sendMessage = async (req: Request, res: Response): Promise<void> => {
    const { content } = req.body;
    const receiverId = req.params.receiverId;
    const senderId = (req.user as RequestUser).id;

    try {
        const newMessage = new Message({
            sender: senderId,
            receiver: receiverId,
            content,
        });
        await newMessage.save();
        res.status(201).json(newMessage);
    } catch (error) {
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
        }).sort({ createdAt: 'asc' }); // مرتب‌سازی بر اساس زمان

        res.status(200).json(messages);
    } catch (error) {
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
                    $or: [{ sender: currentUserId }, { receiver: currentUserId }]
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $group: {
                    _id: {
                        $cond: {
                            if: { $gt: ["$sender", "$receiver"] },
                            then: { $concat: [{ $toString: "$sender" }, "-", { $toString: "$receiver" }] },
                            else: { $concat: [{ $toString: "$receiver" }, "-", { $toString: "$sender" }] }
                        }
                    },
                    lastMessage: { $first: "$$ROOT" }
                }
            },
            {
                $replaceRoot: { newRoot: "$lastMessage" }
            },
            {
                $lookup: { from: 'users', localField: 'sender', foreignField: '_id', as: 'senderDetails' }
            },
            {
                $lookup: { from: 'users', localField: 'receiver', foreignField: '_id', as: 'receiverDetails' }
            },
            {
                $unwind: '$senderDetails'
            },
            {
                $unwind: '$receiverDetails'
            }
        ]);

        res.status(200).json(conversations);
    } catch (error) {
        res.status(500).json({ message: 'خطای سرور' });
    }
};