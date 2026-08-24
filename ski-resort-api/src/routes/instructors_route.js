import express from 'express';
import { getAllInstructors } from '../db/instructors.js';

const router = express.Router();

const getInstructors = async (req, res, next) => {
  try {
    const instructors = await getAllInstructors();
    res.json(instructors);
  } catch (error) {
    next(error);
  }
};

router.get("/", getInstructors);

export default router;