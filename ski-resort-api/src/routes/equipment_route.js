import express from 'express';
import { getAllEquipment, updateEquipmentStatus, createEquipment } from '../db/equipment.js';
import authToken, { requireAdmin } from '../db/authToken.js';

const router = express.Router();

const getEquipment = async (req, res, next) => {
  try {
    const equipment = await getAllEquipment();
    res.json(equipment);
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { availabilityStatus } = req.body;

    const validStatuses = ["available", "rented", "maintenance"];
    if (!availabilityStatus || !validStatuses.includes(availabilityStatus)) {
      res.status(400).json({ success: false, message: "Status must be 'available', 'rented', or 'maintenance'." });
      return;
    }

    const result = await updateEquipmentStatus(id, availabilityStatus);

    if (result.affectedRows === 0) {
      res.status(404).json({ success: false, message: "Equipment not found." });
      return;
    }

    res.status(200).json({ success: true, message: "Equipment status updated." });
  } catch (error) {
    next(error);
  }
};

const addEquipment = async (req, res, next) => {
  try {
    const { name, type } = req.body;

    if (!name?.trim() || !type?.trim()) {
      res.status(400).json({ success: false, message: "Name and type are required." });
      return;
    }

    const result = await createEquipment(name.trim(), type.trim());

    res.status(201).json({ success: true, message: "Equipment added.", equipmentId: result.insertId });
  } catch (error) {
    next(error);
  }
};

router.get("/", getEquipment);
router.put("/:id/status", authToken, requireAdmin, updateStatus);
router.post("/", authToken, requireAdmin, addEquipment);

export default router;