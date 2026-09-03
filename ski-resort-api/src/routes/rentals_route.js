import express from 'express';
import authToken from '../db/authToken.js';
import { createBooking, createRental, getUserRentals, getRentalById, cancelRental, isEquipmentAlreadyRented } from '../db/rentals.js';

const router = express.Router();

const bookRental = async (req, res, next) => {
  try {
    const { equipmentId, rentalDate, returnDate } = req.body;
    const userId = req.user.userId;

    if (req.user.role === "admin") {
      res.status(403).json({ success: false, message: "Admins cannot rent equipment." });
      return;
    }
    
    if (!equipmentId || !rentalDate || !returnDate) {
      res.status(400).json({ success: false, message: "equipmentId, rentalDate and returnDate are required." });
      return;
    }

    //check if here
    const alreadyRented = await isEquipmentAlreadyRented(equipmentId, rentalDate, returnDate);
    if (alreadyRented) {
      res.status(409).json({ success: false, message: "This equipment is already booked for those dates." });
      return;
    }

    const bookingId = await createBooking(userId);
    await createRental(bookingId, equipmentId, rentalDate, returnDate);

    res.status(201).json({ success: true, message: "Equipment rental booked successfully." });
  } catch (error) {
    next(error);
  }
};

const getMyRentals = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const rentals = await getUserRentals(userId);
    res.json(rentals);
  } catch (error) {
    next(error);
  }
};

const cancelMyRental = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const rental = await getRentalById(id);

    if (!rental) {
      res.status(404).json({ success: false, message: "Rental not found." });
      return;
    }

    if (rental.user_id !== userId) {
      res.status(403).json({ success: false, message: "You cannot cancel a rental that isn't yours." });
      return;
    }

    await cancelRental(rental.booking_id, rental.equipment_id);

    res.status(200).json({ success: true, message: "Rental cancelled." });
  } catch (error) {
    next(error);
  }
};

router.post("/", authToken, bookRental);
router.get("/my", authToken, getMyRentals);
router.delete("/:id", authToken, cancelMyRental);

export default router;