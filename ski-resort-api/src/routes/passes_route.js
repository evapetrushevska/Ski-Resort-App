import express from 'express';
import authToken from '../db/authToken.js';
import { createBooking, createSkiPass, getUserPasses, getPassById, cancelPass } from '../db/passes.js';

const router = express.Router();

const bookPass = async (req, res, next) => {
  try {
    const { type, price, validFrom, validTo } = req.body;
    const userId = req.user.userId;

    if (!type?.trim() || !price || !validFrom || !validTo) {
      res.status(400).json({ success: false, message: "Type, price, validFrom and validTo are required." });
      return;
    }

    const bookingId = await createBooking(userId);
    await createSkiPass(bookingId, type.trim(), price, validFrom, validTo);

    res.status(201).json({ success: true, message: "Ski pass booked successfully."});
  } catch (error) {
    next(error);
  }
};

const getMyPasses = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const passes = await getUserPasses(userId);
    res.json(passes);
  } catch (error) {
    next(error);
  }
};

const cancelMyPass = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const pass = await getPassById(id);

    if (!pass) {
      res.status(404).json({ success: false, message: "Pass not found." });
      return;
    }

    if (pass.user_id !== userId) {
      res.status(403).json({ success: false, message: "You cannot cancel a pass that isn't yours."});
      return;
    }

    await cancelPass(pass.booking_id);

    res.status(200).json({ success: true, message: "Pass cancelled."});
  } catch (error) {
    next(error);
  }
};

router.post("/", authToken, bookPass);
router.get("/my", authToken, getMyPasses);
router.delete("/:id", authToken, cancelMyPass);

export default router;