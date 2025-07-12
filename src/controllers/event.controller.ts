import { Request, Response } from 'express';
import Event, { IEvent } from '../models/Event.model';
import Association from '../models/Association.model';
import EventRegistration from '../models/EventRegistration.model';
import { UserPayload } from './profile.controller';
import { IAssociation } from '../models/Association.model';
// فرض می‌کنیم که میدلور احراز هویت، اطلاعات کاربر را در req.user قرار می‌دهد

/**
 * @desc    Create a new event for an association
 * @route   POST /api/events
 * @access  Private (Association Manager)
 */
// کنترلر createEvent اصلاح شده
export const createEvent = async (req: Request, res: Response) => {
    // دیگر associationId را از body نمی‌گیریم
    const { title, description, type, date, location, image } = req.body;
    const user = req.user as UserPayload;

    try {
        // ۱. انجمنی که این کاربر مدیر آن است را پیدا می‌کنیم
        const association = await Association.findOne({ manager: user.id });
        if (!association) {
             res.status(403).json({ message: 'شما مدیر هیچ انجمنی نیستید و مجاز به ایجاد رویداد نمی‌باشید.' });
             return;
        }

        // ۲. رویداد جدید را با آیدی انجمن پیدا شده می‌سازیم
        const newEvent = new Event({
            title,
            description,
            type,
            date,
            association: association._id, // استفاده از آیدی انجمنِ مدیر
            location,
            image,
        });

        const savedEvent = await newEvent.save();
        res.status(201).json(savedEvent);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'خطای سرور' });
    }
};
/**
 * @desc    Get all non-archived events for a specific association
 * @route   GET /api/events/association/:associationId
 * @access  Public
 */
// src/controllers/event.controller.ts

export const getEventsByAssociation = async (req: Request, res: Response) => {
  try {
    const { associationId } = req.params;
    
    // فیلتر تاریخ را برای تست حذف می‌کنیم
    const events = await Event.find({
      association: associationId,
      isArchived: false, 
    })
      .sort({ date: 'asc' })
      .populate('association', 'name logo');

    // برای دیباگ کردن، نتیجه را در کنسول سرور لاگ بگیرید
    console.log(`Found ${events.length} events for association ${associationId}`);

    res.status(200).json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطای سرور' });
  }
};

/**
 * @desc    Update an existing event
 * @route   PUT /api/events/:id
 * @access  Private (Association Manager)
 */
export const updateEvent = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user as UserPayload;

  try {
    const event = await Event.findById(id).populate<{ association: IAssociation }>('association');

    if (!event) {
      res.status(404).json({ message: 'رویداد یافت نشد.' });
      return;
    }

    
    if (event.association.manager.toString() !== user.id) {
      res.status(403).json({ message: 'شما مجاز به ویرایش این رویداد نیستید.' });
      return;
    }

    const updatedEvent = await Event.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    res.status(200).json(updatedEvent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطای سرور' });
  }
};

/**
 * @desc    Delete an event
 * @route   DELETE /api/events/:id
 * @access  Private (Association Manager)
 */
export const deleteEvent = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user as UserPayload;

  try {
const event = await Event.findById(id).populate<{ association: IAssociation }>('association');

    if (!event) {
      res.status(404).json({ message: 'رویداد یافت نشد.' });
      return;
    }

    if (event.association.manager.toString() !== user.id) {
      res.status(403).json({ message: 'شما مجاز به حذف این رویداد نیستید.' });
      return;
    }

    // Delete the event and all related registrations
    await Event.findByIdAndDelete(id);
    await EventRegistration.deleteMany({ event: id });

    res.status(200).json({ message: 'رویداد با موفقیت حذف شد.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطای سرور' });
  }
};

/**
 * @desc    Register a user for an event
 * @route   POST /api/events/:id/register
 * @access  Private (Logged-in User)
 */
export const registerForEvent = async (req: Request, res: Response) => {
  const { id: eventId } = req.params;
  const user = req.user as UserPayload;

  try {
    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      res.status(404).json({ message: 'رویداد یافت نشد.' });
      return;
    }

    // Check if user is already registered
    const existingRegistration = await EventRegistration.findOne({ user: user.id, event: eventId });
    if (existingRegistration) {
      res.status(409).json({ message: 'شما قبلاً در این رویداد ثبت‌نام کرده‌اید.' }); // 409 Conflict
      return;
    }

    // Create new registration
    const registration = new EventRegistration({ user: user.id, event: eventId });
    await registration.save();

    // Add user to the event's registeredUsers array (optional but good for quick access)
    event.registeredUsers.push(user.id as any);
    await event.save();

    res.status(201).json({ message: 'ثبت‌نام شما با موفقیت انجام شد.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطای سرور' });
  }
};

export const getAllEvents = async (req: Request, res: Response) => {
  try {
    const events = await Event.find({
      isArchived: false,
      date: { $gte: new Date() }, // فقط رویدادهایی که تاریخشان نگذشته
    })
      .sort({ date: 'asc' })
      .populate('association', 'name logo'); // اطلاعات انجمن را هم بگیر

    res.status(200).json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getMyAssociation = async (req: Request, res: Response) => {
  if (!req.user) {
    console.log('1');
    res.status(401).json({ message: 'Not authorized' });
    return;
  }
  try {
    const userId = (req.user as UserPayload).id;
    const association = await Association.findOne({ manager: userId });

    // if (!association) {
    // console.log('23');

    //   res.status(404).json({ message: 'شما مدیر هیچ انجمنی نیستید.' });
    //   return;
    // }
    res.status(200).json(association);
  } catch (error) {
    console.log('6');

    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};


/**
 * @desc    Get all users registered for a specific event
 * @route   GET /api/events/:id/registrations
 * @access  Private (Association Manager)
 */
export const getEventRegistrations = async (req: Request, res: Response) => {
    const { id: eventId } = req.params;
    const user = req.user as UserPayload;

    try {
        const event = await Event.findById(eventId).populate<{ association: IAssociation }>('association');
        if (!event) {
             res.status(404).json({ message: 'رویداد یافت نشد.' });
             return;
        }
        
        // بررسی دسترسی: فقط مدیر همان انجمن می‌تواند لیست را ببیند
        if (event.association.manager.toString() !== user.id) {
             res.status(403).json({ message: 'شما مجاز به دیدن این اطلاعات نیستید.' });
             return;
        }
        
        // پیدا کردن تمام ثبت‌نامی‌ها و دریافت اطلاعات کاربران
        const registrations = await EventRegistration.find({ event: eventId })
            .populate('user', 'username email profile'); // دریافت اطلاعات ضروری کاربر

        res.status(200).json(registrations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'خطای سرور' });
    }
};

/**
 * @desc    Archive an event so it no longer shows in public lists
 * @route   PATCH /api/events/:id/archive
 * @access  Private (Association Manager)
 */
export const archiveEvent = async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = req.user as UserPayload;

    try {
        const event = await Event.findById(id).populate<{ association: IAssociation }>('association');
        if (!event) {
             res.status(404).json({ message: 'رویداد یافت نشد.' });
             return;
        }

        // بررسی دسترسی
        if (event.association.manager.toString() !== user.id) {
             res.status(403).json({ message: 'شما مجاز به بایگانی این رویداد نیستید.' });
             return;
        }

        event.isArchived = true;
        await event.save();
        
        res.status(200).json({ message: 'رویداد با موفقیت بایگانی شد.', event });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'خطای سرور' });
    }
};