import request from "supertest";
import { addReading, database } from "./database";
import { app } from "./index"; // Assuming you export the app from index.ts

describe("Data Integration API", () => {
  beforeEach(() => {
    // Clear the database before each test
    Object.keys(database).forEach((key) => delete database[key]);
  });

  describe("POST /data", () => {
    it("should store valid readings and return success", async () => {
      const response = await request(app)
        .post("/data")
        .send("1649941817 Voltage 1.34\n1649941818 Current 12.0")
        .set("Content-Type", "text/plain");

      expect(response.body.success).toBe(true);
      expect(database["1649941817-Voltage"]).toEqual({
        timestamp: 1649941817,
        name: "Voltage",
        value: 1.34,
      });
      expect(database["1649941818-Current"]).toEqual({
        timestamp: 1649941818,
        name: "Current",
        value: 12.0,
      });
    });

    it("should return failure for malformed data", async () => {
      const response = await request(app)
        .post("/data")
        .send("1649941817 Voltage\n1649941818 1.35 Voltage")
        .set("Content-Type", "text/plain");

      expect(response.body.success).toBe(false);
      expect(Object.keys(database).length).toBe(0); // Database should be empty
    });

    it("should return success but not store invalid timestamp or value", async () => {
      const response = await request(app)
        .post("/data")
        .send("abc Voltage 1.34\n1649941818 Current abc")
        .set("Content-Type", "text/plain");

      expect(response.body.success).toBe(true);
      expect(Object.keys(database).length).toBe(0); // Database should be empty
    });
  });

  describe("GET /data", () => {
    beforeEach(() => {
      // Populate the database with test data
      addReading("1649941817-Voltage", {
        timestamp: 1649941817,
        name: "Voltage",
        value: 1.34,
      });
      addReading("1649941818-Current", {
        timestamp: 1649941818,
        name: "Current",
        value: 12.0,
      });
    });

    it("should retrieve readings within the specified date range", async () => {
      const response = await request(app)
        .get("/data?from=2022-04-14&to=2022-04-15")
        .expect(200);

      expect(response.body).toEqual([
        {
          timestamp: 1649941817,
          name: "Voltage",
          value: 1.34,
        },
        {
          timestamp: 1649941818,
          name: "Current",
          value: 12.0,
        },
        {
          name: "Power",
          time: "2022-04-14T00:00:00.000Z",
          value: expect.any(Number), // We expect any number here because power is calculated
        },
      ]);
    });

    it("should return empty array if no readings are within the date range", async () => {
      const response = await request(app)
        .get("/data?from=2022-04-16&to=2022-04-17")
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it("should return average power within the specified date range", async () => {
      const response = await request(app)
        .get("/data?from=2022-04-14&to=2022-04-15")
        .expect(200);

      expect(response.body).toContainEqual({
        name: "Power",
        time: "2022-04-14T00:00:00.000Z",
        value: expect.any(Number), // Checks if it returns a number
      });
    });

    it("should return failure for invalid date range", async () => {
      const response = await request(app)
        .get("/data?from=invalid&to=invalid")
        .expect(200);

      expect(response.body.success).toBe(false);
    });
  });
});
