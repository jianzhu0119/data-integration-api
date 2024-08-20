import {
  addReading,
  getReadingInRange,
  calculateAveragePower,
  database,
} from "./database";

describe("Database Functions", () => {
  beforeEach(() => {
    // Clear the database before each test
    Object.keys(database).forEach((key) => delete database[key]);
  });

  describe("addReading", () => {
    it("should add a reading to the database", () => {
      const reading = { timestamp: 1649941817, name: "Voltage", value: 1.34 };
      addReading("1649941817-Voltage", reading);

      expect(database["1649941817-Voltage"]).toEqual(reading);
    });
  });

  describe("getReadingInRange", () => {
    it("should retrieve readings within a specified date range", () => {
      const reading1 = { timestamp: 1649941817, name: "Voltage", value: 1.34 };
      const reading2 = { timestamp: 1649941818, name: "Current", value: 12.0 };
      const reading3 = { timestamp: 1649941819, name: "Voltage", value: 1.35 };

      addReading("1649941817-Voltage", reading1);
      addReading("1649941818-Current", reading2);
      addReading("1649941819-Voltage", reading3);

      const fromDate = new Date("2022-04-14T00:00:00.000Z");
      const toDate = new Date("2022-04-15T00:00:00.000Z");

      const result = getReadingInRange(fromDate, toDate);

      expect(result).toEqual([reading1, reading2, reading3]);
    });

    it("should return an empty array if no readings are within the date range", () => {
      const reading = { timestamp: 1649941817, name: "Voltage", value: 1.34 };
      addReading("1649941817-Voltage", reading);

      const fromDate = new Date("2022-04-15T00:00:00.000Z");
      const toDate = new Date("2022-04-16T00:00:00.000Z");

      const result = getReadingInRange(fromDate, toDate);

      expect(result).toEqual([]);
    });
  });

  describe("calculateAveragePower", () => {
    it("should calculate average power correctly", () => {
      const reading1 = { timestamp: 1649941817, name: "Voltage", value: 1.34 };
      const reading2 = { timestamp: 1649941818, name: "Current", value: 12.0 };
      const reading3 = { timestamp: 1649941819, name: "Voltage", value: 1.35 };
      const reading4 = { timestamp: 1649941820, name: "Current", value: 14.0 };

      addReading("1649941817-Voltage", reading1);
      addReading("1649941818-Current", reading2);
      addReading("1649941819-Voltage", reading3);
      addReading("1649941820-Current", reading4);

      const fromDate = new Date("2022-04-14T00:00:00.000Z");
      const toDate = new Date("2022-04-15T00:00:00.000Z");

      const result = calculateAveragePower(fromDate, toDate);

      expect(result).toEqual([
        {
          name: "Power",
          time: "2022-04-14T00:00:00.000Z",
          value: (((1.34 + 1.35) / 2) * (12.0 + 14.0)) / 2, // Average Voltage * Average Current
        },
      ]);
    });

    it("should return an empty array if there are no current or voltage readings", () => {
      const fromDate = new Date("2022-04-14T00:00:00.000Z");
      const toDate = new Date("2022-04-15T00:00:00.000Z");

      const result = calculateAveragePower(fromDate, toDate);

      expect(result).toEqual([]);
    });
  });
});
