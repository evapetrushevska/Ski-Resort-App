import express from 'express';
import authToken from '../db/authToken.js';
import { createBooking, isInstructorBusy, createLesson, getUserLessons, getLessonById, cancelLesson, } from '../db/lessons.js';

const router = express.Router();

const bookLesson = async (req, res, next) => {
  try {
    const { instructorId, slopeId, date, time, capacity } = req.body;
    const userId = req.user.userId;

    if (req.user.role === "admin") {
      res.status(403).json({ success: false, message: "Admins cannot book lessons." });
      return;
    }

    if (!instructorId || !slopeId || !date || !time) {
      res.status(400).json({ success: false, message: "instructorId, slopeId, date and time are required." });
      return;
    }
    const busy = await isInstructorBusy(instructorId, date, time);
    if (busy) {
      res.status(409).json({ success: false, message: "This instructor is already booked at that date and time." });
      return;
    }
    const bookingId = await createBooking(userId);
    await createLesson(bookingId, instructorId, slopeId, date, time, capacity || 1);
    res.status(201).json({ success: true, message: "Lesson booked successfully." });
  } catch (error) {
    next(error);
  }
};

const getMyLessons = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const lessons = await getUserLessons(userId);
    res.json(lessons);
  } catch (error) {
    next(error);
  }
};

const cancelMyLesson = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const lesson = await getLessonById(id);
    if (!lesson) {
      res.status(404).json({ success: false, message: "Lesson not found." });
      return;
    }
    if (lesson.user_id !== userId) {
      res.status(403).json({ success: false, message: "You cannot cancel a lesson that isn't yours." });
      return;
    }
    await cancelLesson(lesson.booking_id);
    res.status(200).json({ success: true, message: "Lesson cancelled." });
  } catch (error) {
    next(error);
  }
};

router.post("/", authToken, bookLesson);
router.get("/my", authToken, getMyLessons);
router.delete("/:id", authToken, cancelMyLesson);

export default router;