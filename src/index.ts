import express, { Express } from "express";
import helmet from "helmet";
import dotenv from "dotenv";
import {
  addReading,
  getReadingInRange,
  calculateAveragePower,
} from "./database";

dotenv.config();

const PORT = process.env.PORT || 3000;
export const app: Express = express();

// Middleware setup
app.use(helmet());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

/**
 * POST /data
 * This endpoint receives data in plaintext format, parses it, and stores it in the database.
 * Each line of data should consist of a timestamp, metric name, and metric value.
 * If the data is malformed or cannot be processed, it responds with { success: false }.
 */
app.post("/data", async (req, res) => {
  const data = req.body.split("\n").map((line: string) => line.trim());
  for (const line of data) {
    const parts = line.split(" ");
    if (parts.length !== 3) {
      return res.json({ success: false });
    }

    const [timestampStr, name, valueStr] = parts;
    const timestamp = Number(timestampStr);
    const value = Number(valueStr);
    // Validate that the timestamp and value are valid numbers
    if (isNaN(timestamp) || isNaN(value)) {
      return res.json({ success: true });
    }
    // Store the reading in the database using a composite key
    addReading(`${timestamp}-${name}`, { timestamp, name, value });
  }

  return res.json({ success: true });
});

/**
 * GET /data
 * This endpoint retrieves data from the database within the specified date range.
 * It also calculates the average power for each day in the range.
 * If the date range is invalid or missing, it responds with { success: false }.
 */
app.get("/data", async (req, res) => {
  const { from, to } = req.query;

  if (!from || !to) {
    return res.json({ success: false });
  }

  const fromDate = new Date(from as string);
  const toDate = new Date(to as string);
  // Validate that the fromDate and toDate are valid dates
  if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
    return res.json({ success: false });
  }
  // Retrieve the readings and calculate the average power
  const reading = getReadingInRange(fromDate, toDate);
  const averagePower = calculateAveragePower(fromDate, toDate);

  return res.json([...reading, ...averagePower]);
});

app.listen(PORT, () => console.log(`Running on port ${PORT} ⚡`));
