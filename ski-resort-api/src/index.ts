import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import pool from "./db/database.js";

const app = express();
const port = Number(process.env.PORT) || 5000;

app.use(express.json());

app.use(express.urlencoded({ extended: false }));

app.get("/", (_req: Request, res: Response) => {
  res.send("Ski Resort API is running");
});

// Test DB connection route
app.get("/test-db", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [rows] = await pool.query("SELECT 1 + 1 AS result");
    res.json({ status: "connected", result: (rows as any)[0].result });
  } catch (error) {
    next(error);
  }
});

// Central error handler
app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(error);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});