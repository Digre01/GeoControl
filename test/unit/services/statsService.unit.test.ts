import { calculateStats, calculateOutliers } from "@services/statsService";
import { MeasurementDAO } from "@models/dao/MeasurementDAO";
import { Measurement as MeasurementDTO } from "@models/dto/Measurement";
import { FAKE_DATA } from "../../fakeDataDAO/fakeDataDAOforMeasurements";
import { parseISODateParamToUTC } from "@utils";

describe("Stats service unit", () => {


    it("calculate stats on measurements", () => {
        const measurements: MeasurementDAO[] = [
            { id: 1, createdAt: parseISODateParamToUTC("2025-01-18 15:10:00.000"), value: 10, sensor: FAKE_DATA.FAKE_SENSORS[0] },
            { id: 2, createdAt: parseISODateParamToUTC("2025-01-18 15:11:00.000"), value: 22.5, sensor: FAKE_DATA.FAKE_SENSORS[0] },
            { id: 3, createdAt: parseISODateParamToUTC("2025-01-18 16:10:00.000"), value: 23.0, sensor: FAKE_DATA.FAKE_SENSORS[0] },
            { id: 4, createdAt: parseISODateParamToUTC("2025-01-18 17:10:00.000"), value: 24.2, sensor: FAKE_DATA.FAKE_SENSORS[0] }
        ]

        const expectedMean = (10 + 22.5 + 23 + 24.2) / 4;
        const expectedVariance = (
            Math.pow(10 - expectedMean, 2) +
            Math.pow(22.5 - expectedMean, 2) +
            Math.pow(23.0 - expectedMean, 2) +
            Math.pow(24.2 - expectedMean, 2)
        ) / 4;

        const expectedUpperThreshold = expectedMean + 2 * Math.sqrt(expectedVariance);
        const expectedLowerThreshold = expectedMean - 2 * Math.sqrt(expectedVariance);

        const stats = calculateStats(measurements);

        expect(stats.mean).toBeCloseTo(expectedMean);
        expect(stats.variance).toBeCloseTo(expectedVariance);
        expect(stats.upperThreshold).toBeCloseTo(expectedUpperThreshold);
        expect(stats.lowerThreshold).toBe(expectedLowerThreshold);
        expect(stats.startDate).toBeUndefined();
        expect(stats.endDate).toBeUndefined();

    });

    it("calculate stats on no measurements", () => {
        const measurements: MeasurementDAO[] = []

        const stats = calculateStats(measurements);

        expect(stats.lowerThreshold).toBe(0);
        expect(stats.upperThreshold).toBe(0);
        expect(stats.variance).toBe(0);
        expect(stats.mean).toBe(0);
        expect(stats.startDate).toBeUndefined();
        expect(stats.endDate).toBeUndefined();

    });

    it("calculate stats with only one measurement", () => {
        const measurements: MeasurementDAO[] = [
            { id: 1, createdAt: parseISODateParamToUTC("2025-01-18 15:00:00.000"), value: 42, sensor: FAKE_DATA.FAKE_SENSORS[0] }
        ];

        const stats = calculateStats(measurements);

        expect(stats.mean).toBe(42);
        expect(stats.variance).toBe(0);
        expect(stats.upperThreshold).toBe(42);
        expect(stats.lowerThreshold).toBe(42);
        expect(stats.startDate).toBeUndefined();
        expect(stats.endDate).toBeUndefined();
    });

    it("calculate stats with Number.MAX_VALUE", () => {
        const max = Number.MAX_VALUE;
        const measurements: MeasurementDAO[] = [
            { id: 1, createdAt: parseISODateParamToUTC("2025-01-18 15:00:00.000"), value: max, sensor: FAKE_DATA.FAKE_SENSORS[0] },
            { id: 2, createdAt: parseISODateParamToUTC("2025-01-18 16:00:00.000"), value: max, sensor: FAKE_DATA.FAKE_SENSORS[0] }
        ];

        const stats = calculateStats(measurements);

        expect(stats.mean).toBeCloseTo(max);
        expect(stats.variance).toBe(0); // same values -> no variance
        expect(stats.upperThreshold).toBeCloseTo(max);
        expect(stats.lowerThreshold).toBeCloseTo(max);
    });

    it("calculate stats with Number.MIN_VALUE", () => {
        const min = Number.MIN_VALUE;
        const measurements: MeasurementDAO[] = [
            { id: 1, createdAt: parseISODateParamToUTC("2025-01-18 15:00:00.000"), value: min, sensor: FAKE_DATA.FAKE_SENSORS[0] },
            { id: 2, createdAt: parseISODateParamToUTC("2025-01-18 16:00:00.000"), value: min, sensor: FAKE_DATA.FAKE_SENSORS[0] }
        ];

        const stats = calculateStats(measurements);

        expect(stats.mean).toBeCloseTo(0);
        expect(stats.variance).toBe(0);
        expect(stats.upperThreshold).toBeCloseTo(0);
        expect(stats.lowerThreshold).toBeCloseTo(0);
    });

    it("calculate stats with Infinity values", () => {
        const measurements: MeasurementDAO[] = [
            { id: 1, createdAt: parseISODateParamToUTC("2025-01-18 15:00:00.000"), value: Infinity, sensor: FAKE_DATA.FAKE_SENSORS[0] },
            { id: 2, createdAt: parseISODateParamToUTC("2025-01-18 16:00:00.000"), value: -Infinity, sensor: FAKE_DATA.FAKE_SENSORS[0] }
        ];

        const stats = calculateStats(measurements);

        expect(stats.mean).toBeNaN();
        expect(stats.variance).toBeNaN();
        expect(stats.upperThreshold).toBeNaN();
        expect(stats.lowerThreshold).toBeNaN();
    });

    it("calculate stats with NaN value", () => {
        const measurements: MeasurementDAO[] = [
            { id: 1, createdAt: parseISODateParamToUTC("2025-01-18 15:00:00.000"), value: 100, sensor: FAKE_DATA.FAKE_SENSORS[0] },
            { id: 2, createdAt: parseISODateParamToUTC("2025-01-18 16:00:00.000"), value: NaN, sensor: FAKE_DATA.FAKE_SENSORS[0] }
        ];

        const stats = calculateStats(measurements);

        expect(stats.mean).toBeNaN();
        expect(stats.variance).toBeNaN();
        expect(stats.upperThreshold).toBeNaN();
        expect(stats.lowerThreshold).toBeNaN();
    });


    it("calculate stats with start date", () => {
        const measurements: MeasurementDAO[] = [
            { id: 1, createdAt: parseISODateParamToUTC("2025-01-18 15:00:00.000"), value: 42, sensor: FAKE_DATA.FAKE_SENSORS[0] }
        ];

        const stats = calculateStats(measurements, "2025-01-18 12:00:00.000");

        expect(stats.mean).toBe(42);
        expect(stats.variance).toBe(0);
        expect(stats.upperThreshold).toBe(42);
        expect(stats.lowerThreshold).toBe(42);
        expect(stats.startDate).toStrictEqual(parseISODateParamToUTC("2025-01-18 12:00:00.000"));
        expect(stats.endDate).toBeUndefined();
    });

    it("calculate stats with end date", () => {
        const measurements: MeasurementDAO[] = [
            { id: 1, createdAt: parseISODateParamToUTC("2025-01-18 15:00:00.000"), value: 42, sensor: FAKE_DATA.FAKE_SENSORS[0] }
        ];

        const stats = calculateStats(measurements, undefined, "2025-01-18 12:00:00.000");

        expect(stats.mean).toBe(42);
        expect(stats.variance).toBe(0);
        expect(stats.upperThreshold).toBe(42);
        expect(stats.lowerThreshold).toBe(42);
        expect(stats.startDate).toBeUndefined();
        expect(stats.endDate).toStrictEqual(parseISODateParamToUTC("2025-01-18 12:00:00.000"));
    });

    it("calculate stats with invalid date", () => {
        const measurements: MeasurementDAO[] = [
            { id: 1, createdAt: parseISODateParamToUTC("2025-01-18 15:00:00.000"), value: 42, sensor: FAKE_DATA.FAKE_SENSORS[0] }
        ];

        const stats = calculateStats(measurements, "2025asdfsa-0sd1gg00.000");

        expect(stats.mean).toBe(42);
        expect(stats.variance).toBe(0);
        expect(stats.upperThreshold).toBe(42);
        expect(stats.lowerThreshold).toBe(42);
        expect(stats.startDate).toBeUndefined();
        expect(stats.endDate).toBeUndefined();
    });

    it("calculate stats with negative values", () => {
        const measurements: MeasurementDAO[] = [
            { id: 1, createdAt: new Date(), value: -5, sensor: FAKE_DATA.FAKE_SENSORS[0] },
            { id: 2, createdAt: new Date(), value: -10, sensor: FAKE_DATA.FAKE_SENSORS[0] }
        ];

        const stats = calculateStats(measurements);
        expect(stats.mean).toBe(-7.5);
        expect(stats.variance).toBe(6.25);
    });

    it("calculate stats with duplicate values", () => {
        const measurements: MeasurementDAO[] = [
            { id: 1, createdAt: new Date(), value: 10, sensor: FAKE_DATA.FAKE_SENSORS[0] },
            { id: 2, createdAt: new Date(), value: 10, sensor: FAKE_DATA.FAKE_SENSORS[0] },
            { id: 3, createdAt: new Date(), value: 10, sensor: FAKE_DATA.FAKE_SENSORS[0] }
        ];

        const stats = calculateStats(measurements);
        expect(stats.mean).toBe(10);
        expect(stats.variance).toBe(0);
    });

    it("calculate stats with unsorted timestamps", () => {
        const measurements: MeasurementDAO[] = [
            { id: 1, createdAt: new Date("2025-01-19"), value: 30, sensor: FAKE_DATA.FAKE_SENSORS[0] },
            { id: 2, createdAt: new Date("2025-01-18"), value: 10, sensor: FAKE_DATA.FAKE_SENSORS[0] }
        ];

        const stats = calculateStats(measurements);
        expect(stats.mean).toBe(20);
    });
});

describe("calculateOutliers", () => {
    it("marks a measurement as outlier if it's above the upper threshold", () => {
        const measurements: MeasurementDTO[] = [
            { value: 2, createdAt: new Date("2025-01-01T00:00:00Z") },
            { value: 3, createdAt: new Date("2025-01-01T00:01:00Z") },
            { value: 4, createdAt: new Date("2025-01-01T00:02:00Z") },
            { value: 5, createdAt: new Date("2025-01-01T00:00:00Z") },
            { value: 6, createdAt: new Date("2025-01-01T00:01:00Z") },
            { value: 7, createdAt: new Date("2025-01-01T00:02:00Z") },
            { value: 20, createdAt: new Date("2025-01-01T00:00:00Z") }
        ];

        const stats = calculateStats(measurements as any);
        const result = calculateOutliers(stats, measurements);

        expect(result[6].isOutlier).toBe(true);
        expect(result[0].isOutlier).toBe(false);
        expect(result[1].isOutlier).toBe(false);
        expect(result[2].isOutlier).toBe(false);
        expect(result[3].isOutlier).toBe(false);
        expect(result[4].isOutlier).toBe(false);
        expect(result[5].isOutlier).toBe(false);
    });

    it("marks a measurement as outlier if it's below the lower threshold", () => {
        const measurements: MeasurementDTO[] = [
            { value: 2, createdAt: new Date("2025-01-01T00:00:00Z") },
            { value: 3, createdAt: new Date("2025-01-01T00:01:00Z") },
            { value: 4, createdAt: new Date("2025-01-01T00:02:00Z") },
            { value: 5, createdAt: new Date("2025-01-01T00:00:00Z") },
            { value: 6, createdAt: new Date("2025-01-01T00:01:00Z") },
            { value: 7, createdAt: new Date("2025-01-01T00:02:00Z") },
            { value: 20, createdAt: new Date("2025-01-01T00:00:00Z") },
            { value: -20, createdAt: new Date("2025-01-01T00:00:00Z") }
        ];

        const stats = calculateStats(measurements as any);
        const result = calculateOutliers(stats, measurements);

        expect(result[7].isOutlier).toBe(true);
        expect(result[0].isOutlier).toBe(false);
        expect(result[1].isOutlier).toBe(false);
        expect(result[2].isOutlier).toBe(false);
        expect(result[3].isOutlier).toBe(false);
        expect(result[4].isOutlier).toBe(false);
        expect(result[5].isOutlier).toBe(false);
        expect(result[6].isOutlier).toBe(false);
    });

    it("handles all inliers correctly", () => {
        const measurements: MeasurementDTO[] = [
            { value: 20, createdAt: new Date() },
            { value: 21, createdAt: new Date() },
            { value: 19, createdAt: new Date() },
        ];

        const stats = calculateStats(measurements as any);
        const result = calculateOutliers(stats, measurements);

        expect(result.every(m => m.isOutlier === false)).toBe(true);
    });

    it("handles empty input", () => {
        const stats = {
            mean: 0,
            variance: 0,
            upperThreshold: 0,
            lowerThreshold: 0,
            startDate: undefined,
            endDate: undefined,
        };

        const result = calculateOutliers(stats, []);
        expect(result).toEqual([]);
    });

    it("preserves other fields (e.g. createdAt) untouched", () => {
        const input: MeasurementDTO = {
            value: 999,
            createdAt: new Date("2025-01-01T00:00:00Z")
        };

        const stats = {
            mean: 0,
            variance: 0,
            upperThreshold: 0,
            lowerThreshold: 0,
            startDate: undefined,
            endDate: undefined,
        };

        const [result] = calculateOutliers(stats, [input]);
        expect(result.createdAt).toStrictEqual(input.createdAt);
    });
});