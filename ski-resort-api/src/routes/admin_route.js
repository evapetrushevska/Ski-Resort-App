import express from 'express';
import authToken, { requireAdmin } from '../db/authToken.js';
import { generateReport, getAllReports, getLiveSummary } from '../db/admin.js';

const router = express.Router();

//live current totals 
const getSummary = async (req, res, next) => {
  try {
    const summary = await getLiveSummary();
    res.json(summary);
  } catch (error) {
    next(error);
  }
};

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

router.get("/summary", authToken, requireAdmin, getSummary);
router.post("/reports", authToken, requireAdmin, createReport);
router.get("/reports", authToken, requireAdmin, listReports);

export default router;