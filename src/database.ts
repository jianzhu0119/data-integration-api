interface Reading {
  timestamp: number;
  name: string;
  value: number;
}

// This is a fake database which stores data in-memory while the process is running
// Feel free to change the data structure to anything else you would like
export const database: Record<string, Reading> = {};

/**
 * Store a reading in the database using the given key.
 *
 * @param {string} key - The unique key to identify the reading in the database.
 * @param {Reading} reading - The reading object containing timestamp, name, and value.
 * @returns {Reading} - The reading that was stored in the database.
 */
export const addReading = (key: string, reading: Reading): Reading => {
  database[key] = reading;
  return reading;
};

/**
 * Retrieve all readings from the database that fall within the specified date range.
 *
 * @param {Date} fromDate - The start date of the range.
 * @param {Date} toDate - The end date of the range.
 * @returns {Reading[]} - An array of readings within the given date range.
 */
export const getReadingInRange = (fromDate: Date, toDate: Date): Reading[] => {
  const readings: Reading[] = [];

  Object.values(database).forEach((reading) => {
    const readingDate = new Date(reading.timestamp * 1000);
    if (readingDate >= fromDate && readingDate <= toDate) {
      readings.push(reading);
    }
  });

  return readings;
};

/**
 * Calculate the average power for each day within the specified date range.
 * Power is calculated as the product of the average Current and average Voltage for each day.
 *
 * @param {Date} fromDate - The start date of the range.
 * @param {Date} toDate - The end date of the range.
 * @returns {Array<{ name: string; time: string; value: number }>} - An array of objects representing the average power readings.
 */
export const calculateAveragePower = (
  fromDate: Date,
  toDate: Date
): { name: string; time: string; value: number }[] => {
  // Object to accumulate current and voltage values and counts per day
  const powerCalculations: {
    [date: string]: {
      totalCurrent: number;
      totalVoltage: number;
      currentCount: number;
      voltageCount: number;
    };
  } = {};

  Object.values(database).forEach((reading) => {
    const readingDate = new Date(reading.timestamp * 1000);
    const dateKey = readingDate.toISOString().split("T")[0]; // Extracting the date part of the ISO string

    if (readingDate >= fromDate && readingDate <= toDate) {
      if (!powerCalculations[dateKey]) {
        powerCalculations[dateKey] = {
          totalCurrent: 0,
          totalVoltage: 0,
          currentCount: 0,
          voltageCount: 0,
        };
      }
      // Accumulate current and voltage values and counts
      if (reading.name === "Current") {
        powerCalculations[dateKey].totalCurrent += reading.value;
        powerCalculations[dateKey].currentCount += 1;
      } else if (reading.name === "Voltage") {
        powerCalculations[dateKey].totalVoltage += reading.value;
        powerCalculations[dateKey].voltageCount += 1;
      }
    }
  });
  // Calculate average power for each day
  return Object.entries(powerCalculations).map(
    ([date, { totalCurrent, totalVoltage, currentCount, voltageCount }]) => {
      const averageCurrent = totalCurrent / currentCount;
      const averageVoltage = totalVoltage / voltageCount;
      const averagePower = averageCurrent * averageVoltage;

      return {
        name: "Power",
        time: `${date}T00:00:00.000Z`,
        value: averagePower,
      };
    }
  );
};
