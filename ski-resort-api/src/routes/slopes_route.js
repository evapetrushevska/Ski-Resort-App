import express from 'express';
import { getAllSlopes, addSlope, updateSlopeStatus, upsertWeather } from '../db/slopes.js';
import authToken, { requireAdmin } from '../db/authToken.js';

const router = express.Router();

const getSlopes = async (req, res, next) => {
  try {
    const slopes = await getAllSlopes();
    res.json(slopes);
  } catch (error) {
    next(error);
  }
};

const createSlope = async (req, res, next) => {
  try {
    const { slopeName, difficulty } = req.body;

    if (!slopeName?.trim() || !difficulty?.trim()) {
      res.status(400).json({ success: false, message: "Slope name and difficulty are required." });
      return;
    }

    await addSlope(slopeName.trim(), difficulty.trim());
    res.status(201).json({ success: true, message: "Slope added." });
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || (status !== "open" && status !== "closed")) {
      res.status(400).json({ success: false, message: "Status must be 'open' or 'closed'." });
      return;
    }

    const result = await updateSlopeStatus(id, status);

    if (result.affectedRows === 0) {
      res.status(404).json({ success: false, message: "Slope not found." });
      return;
    }

    res.status(200).json({ success: true, message: "Slope status updated." });
  } catch (error) {
    next(error);
  }
};

const updateWeather = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { temperature, condition } = req.body;

    if (temperature === undefined || !condition) {
      res.status(400).json({ success: false, message: "Temperature and condition are required." });
      return;
    }

    await upsertWeather(id, temperature, condition);
    res.status(200).json({ success: true, message: "Weather updated." });
  } catch (error) {
    next(error);
  }
};

router.get("/", getSlopes);
router.post("/", authToken, requireAdmin, createSlope);
router.put("/:id/status", authToken, requireAdmin, updateStatus);
router.put("/:id/weather", authToken, requireAdmin, updateWeather);

export default router;