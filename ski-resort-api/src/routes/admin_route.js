import express from 'express';
import authToken, { requireAdmin } from '../db/authToken.js';
import { generateReport, getAllReports } from '../db/admin.js';

const router = express.Router();

const createReport = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const report = await generateReport(userId);
    res.status(201).json({ success: true, message: "Report generated.", report });
  } catch (error) {
    next(error);
  }
};

const listReports = async (req, res, next) => {
  try {
    const reports = await getAllReports();
    res.json(reports);
  } catch (error) {
    next(error);
  }
};

router.post("/reports", authToken, requireAdmin, createReport);
router.get("/reports", authToken, requireAdmin, listReports);

export default router;