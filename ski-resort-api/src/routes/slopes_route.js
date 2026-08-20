import express from 'express';
import { getAllSlopes, updateSlopeStatus, updatetWeather } from '../db/slopes.js';

const router = express.Router();

const getSlopes = async (req, res, next) => {
  try {
    const slopes = await getAllSlopes();
    res.json(slopes);
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

    await updatetWeather(id, temperature, condition);
    res.status(200).json({ success: true, message: "Weather updated." });
  } catch (error) {
    next(error);
  }
};

router.get("/", getSlopes);
router.put("/:id/status", updateStatus);
router.put("/:id/weather", updateWeather);

export default router;