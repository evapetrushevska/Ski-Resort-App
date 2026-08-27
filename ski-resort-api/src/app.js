import express from 'express';
import cors from 'cors';
import pool from './db/database.js';
import authRouter from './routes/auth.js';
import slopesRouter from './routes/slopes_route.js';
import equipmentRouter from './routes/equipment_route.js';
import authToken from './db/authToken.js';
import passesRouter from './routes/passes_route.js';
import rentalsRouter from './routes/rentals_route.js';
import instructorsRouter from './routes/instructors_route.js';
import lessonsRouter from './routes/lessons_route.js';
import adminRouter from './routes/admin_route.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.send("Ski Resort API is running");
});

// Test DB connection route
app.get("/test-db", async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT 1 + 1 AS result");
    res.json({ status: "connected", result: rows[0].result });
  } catch (error) {
    next(error);
  }
});

// Auth routes
app.use("/auth", authRouter);

// Slope routes
app.use("/slopes", slopesRouter);

//Equipment routers
app.use("/equipment", equipmentRouter);

//Passes routes 
app.use("/passes", passesRouter);

//Rentals routes 
app.use("/rentals", rentalsRouter);

//Instructors routes
app.use("/instructors", instructorsRouter);

//Lessons routes
app.use("/lessons", lessonsRouter);

//Admin routes
app.use("/admin", adminRouter);

// Central error handler
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ success: false, message: "Internal server error" });
});


export default app;