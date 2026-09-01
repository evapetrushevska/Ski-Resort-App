import express from 'express';
import authToken from '../db/authToken.js';
import { createBooking, isInstructorBusy, createLesson, getUserLessons, getInstructorSchedule, getInstructorIdByUserId, getAllLessonsForAdmin, getLessonById, getLessonWithInstructor, cancelLesson, respondToLesson, } from '../db/lessons.js';

const router = express.Router();

const bookLesson = async (req, res, next) => {
  try {
    const { instructorId, slopeId, date, time, capacity } = req.body;
    const userId = req.user.userId;

    if (req.user.role === "admin" || req.user.role === "instructor") {
      res.status(403).json({ success: false, message: "Only visitors can book lessons." });
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

    res.status(201).json({ success: true, message: "Lesson requested. Waiting for instructor approval." });
  } catch (error) {
    next(error);
  }
};

// view my own lessons (visitors)
const getMyLessons = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const lessons = await getUserLessons(userId);
    res.json(lessons);
  } catch (error) {
    next(error);
  }
};

//view lessons booked with instructors 
const getMySchedule = async (req, res, next) => {
  try {
    if (req.user.role !== "instructor") {
      res.status(403).json({ success: false, message: "Only instructors can view their schedule." });
      return;
    }

    const instructorId = await getInstructorIdByUserId(req.user.userId);
    if (!instructorId) {
      res.status(404).json({ success: false, message: "Instructor profile not found." });
      return;
    }

    const schedule = await getInstructorSchedule(instructorId);
    res.json(schedule);
  } catch (error) {
    next(error);
  }
};

//view every lesson
const getAllLessons = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      res.status(403).json({ success: false, message: "Only admins can view all lessons." });
      return;
    }
    const lessons = await getAllLessonsForAdmin();
    res.json(lessons);
  } catch (error) {
    next(error);
  }
};

//accepts or declines a lesson
const respond = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (req.user.role !== "instructor") {
      res.status(403).json({ success: false, message: "Only instructors can respond to lessons." });
      return;
    }

    if (status !== "confirmed" && status !== "declined") {
      res.status(400).json({ success: false, message: "Status must be 'confirmed' or 'declined'." });
      return;
    }

    const lesson = await getLessonWithInstructor(id);
    if (!lesson) {
      res.status(404).json({ success: false, message: "Lesson not found." });
      return;
    }

    if (lesson.instructor_user_id !== req.user.userId) {
      res.status(403).json({ success: false, message: "This lesson is not assigned to you." });
      return;
    }

    await respondToLesson(lesson.booking_id, status);
    res.status(200).json({ success: true, message: `Lesson ${status}.` });
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
router.get("/instructor-schedule", authToken, getMySchedule);
router.get("/all", authToken, getAllLessons);
router.put("/:id/respond", authToken, respond);
router.delete("/:id", authToken, cancelMyLesson);

export default router;