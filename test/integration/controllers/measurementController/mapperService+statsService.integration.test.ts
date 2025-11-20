import * as measurementController from "@controllers/measurementController";
import { MeasurementRepository } from "@repositories/MeasurementRepository";
import { MeasurementDAO } from "@models/dao/MeasurementDAO";
import { FAKE_DATA } from "@test/fakeDataDAO/fakeDataDAOforMeasurements";
import { Measurement as MeasurementDTO } from "@models/dto/Measurement";
import { Stats as StatsDTO } from "@models/dto/Stats";
import { Measurements as MeasurementsDTO } from "@models/dto/Measurements";
import { computeStats } from "@test/measurementsTestHelper";

jest.mock("@repositories/MeasurementRepository");

beforeEach(() => {
    jest.resetAllMocks();
});


describe("MeasurementController mapperService+statsService integration", () => {

    it("get sensor Measurements mapperService+statsService integration", async () => {

        const fakeMeasurements_len = FAKE_DATA.FAKE_MEASUREMENTS.length;
        const mockMeasurementsDAO: MeasurementDAO[] = [
            FAKE_DATA.FAKE_MEASUREMENTS[fakeMeasurements_len - 2],
            FAKE_DATA.FAKE_MEASUREMENTS[fakeMeasurements_len - 1]
        ];

        const expectedMeasurementDTO: MeasurementDTO[] = mockMeasurementsDAO.map(m => ({
            createdAt: m.createdAt,
            value: m.value
        }));

        const expectedMeasurementWithOutliers: MeasurementDTO[] = expectedMeasurementDTO.map(m => ({
            ...m,
            isOutlier: false
        }));

        const values = mockMeasurementsDAO.map(m => m.value);
        const stats = computeStats(values);
        const expectedStats: StatsDTO = { ...stats };


        const expectedResult: MeasurementsDTO = {
            sensorMacAddress: mockMeasurementsDAO[0].sensor.macAddress,
            measurements: expectedMeasurementWithOutliers,
            stats: expectedStats
        };

        (MeasurementRepository as jest.Mock).mockImplementation(() => ({
            getSensorMeasurements: jest.fn().mockResolvedValue(mockMeasurementsDAO)
        }));


        const result = await measurementController.getSensorMeasurements("net", "gw", mockMeasurementsDAO[0].sensor.macAddress);
        expect(result).toEqual(expectedResult);

    });

    it("get network Measurements mapperService+statsService integration", async () => {

        const fakeMeasurements_len = FAKE_DATA.FAKE_MEASUREMENTS.length;

        const mockMacSensorA = "macA"
        const mockMeasurementsSensorA = [
            FAKE_DATA.FAKE_MEASUREMENTS[fakeMeasurements_len - 2],
            FAKE_DATA.FAKE_MEASUREMENTS[fakeMeasurements_len - 1]
        ]

        const mockMacSensorB = "macB"
        const mockMeasurementsSensorB = [
            FAKE_DATA.FAKE_MEASUREMENTS[fakeMeasurements_len - 3],
            FAKE_DATA.FAKE_MEASUREMENTS[fakeMeasurements_len - 4]
        ];

        const mockMeasurementsDAO: { sensorMacAddress: string, measurements: MeasurementDAO[] }[] = [
            { sensorMacAddress: mockMacSensorA, measurements: mockMeasurementsSensorA },
            { sensorMacAddress: mockMacSensorB, measurements: mockMeasurementsSensorB }
        ];

        const measurementADTO: MeasurementDTO[] = mockMeasurementsDAO[0].measurements.map(m => ({ createdAt: m.createdAt, value: m.value }));
        const measurementAWithOutlierDTO: MeasurementDTO[] = measurementADTO.map(m => ({ ...m, isOutlier: false }));

        const measurementBDTO: MeasurementDTO[] = mockMeasurementsDAO[1].measurements.map(m => ({ createdAt: m.createdAt, value: m.value }));
        const measurementBWithOutlierDTO: MeasurementDTO[] = measurementBDTO.map(m => ({ ...m, isOutlier: false }));

        const statsA = computeStats(mockMeasurementsSensorA.map(m => m.value));
        const statsB = computeStats(mockMeasurementsSensorB.map(m => m.value));

        const expectedStatsA: StatsDTO = { ...statsA };
        const expectedStatsB: StatsDTO = { ...statsB };

        const mockFinalMeasurementsADTO: MeasurementsDTO = {
            measurements: measurementAWithOutlierDTO,
            stats: expectedStatsA,
            sensorMacAddress: mockMeasurementsDAO[0].sensorMacAddress
        }

        const mockFinalMeasurementsBDTO: MeasurementsDTO = {
            measurements: measurementBWithOutlierDTO,
            stats: expectedStatsB,
            sensorMacAddress: mockMeasurementsDAO[1].sensorMacAddress
        }
        const mockFinalMeasurementsDTO: MeasurementsDTO[] = [
            mockFinalMeasurementsADTO,
            mockFinalMeasurementsBDTO
        ];

        //mock implementation of repo
        (MeasurementRepository as jest.Mock).mockImplementation(() => ({
            getNetworkMeasurements: jest.fn().mockResolvedValue(mockMeasurementsDAO),
        }));


        const result = await measurementController.getNetworkMeasurements("net");

        expect(result).toMatchObject(mockFinalMeasurementsDTO);

    });

    it("get sensor Stats mapperService+statsService integration", async () => {
        const fakeMeasurements_len = FAKE_DATA.FAKE_MEASUREMENTS.length;
        const mockMeasurementsDAO: MeasurementDAO[] = [
            FAKE_DATA.FAKE_MEASUREMENTS[fakeMeasurements_len - 2],
            FAKE_DATA.FAKE_MEASUREMENTS[fakeMeasurements_len - 1]
        ];

        const values = mockMeasurementsDAO.map(m => m.value);
        const stats = computeStats(values);
        const expectedStats: StatsDTO = { ...stats };


        //mock implementation of repo
        (MeasurementRepository as jest.Mock).mockImplementation(() => ({
            getSensorMeasurements: jest.fn().mockResolvedValue(mockMeasurementsDAO),
        }));


        const result = await measurementController.getSensorStats("net", "gw", "sensor");

        expect(result).toEqual(expectedStats);

    });

    it("get network Stats mapperService+statsService integration", async () => {
        const fakeMeasurements_len = FAKE_DATA.FAKE_MEASUREMENTS.length;

        const mockMacSensorA = "macA"
        const mockMeasurementsSensorA = [
            FAKE_DATA.FAKE_MEASUREMENTS[fakeMeasurements_len - 2],
            FAKE_DATA.FAKE_MEASUREMENTS[fakeMeasurements_len - 1]
        ]

        const mockMacSensorB = "macB"
        const mockMeasurementsSensorB = [
            FAKE_DATA.FAKE_MEASUREMENTS[fakeMeasurements_len - 3],
            FAKE_DATA.FAKE_MEASUREMENTS[fakeMeasurements_len - 4]
        ];

        const mockMeasurementsDAO: { sensorMacAddress: string, measurements: MeasurementDAO[] }[] = [
            { sensorMacAddress: mockMacSensorA, measurements: mockMeasurementsSensorA },
            { sensorMacAddress: mockMacSensorB, measurements: mockMeasurementsSensorB }
        ];

        const statsA = computeStats(mockMeasurementsSensorA.map(m => m.value));
        const statsB = computeStats(mockMeasurementsSensorB.map(m => m.value));

        const expectedStatsA: StatsDTO = { ...statsA };
        const expectedStatsB: StatsDTO = { ...statsB };


        const mockFinalMeasurementsADTO: MeasurementsDTO = {
            stats: expectedStatsA,
            sensorMacAddress: mockMeasurementsDAO[0].sensorMacAddress
        }

        const mockFinalMeasurementsBDTO: MeasurementsDTO = {
            stats: expectedStatsB,
            sensorMacAddress: mockMeasurementsDAO[1].sensorMacAddress
        }
        const mockFinalMeasurementsDTO: MeasurementsDTO[] = [
            mockFinalMeasurementsADTO,
            mockFinalMeasurementsBDTO
        ];

        //mock implementation of repo
        (MeasurementRepository as jest.Mock).mockImplementation(() => ({
            getNetworkMeasurements: jest.fn().mockResolvedValue(mockMeasurementsDAO),
        }));



        const result = await measurementController.getNetworkStats("net");

        expect(result).toMatchObject(mockFinalMeasurementsDTO);
        expect(result[0]).not.toHaveProperty("measurements")
    });

    it("get sensor Outliers mapperService+statsService integration", async () => {
        const fakeMeasurements_len = FAKE_DATA.FAKE_MEASUREMENTS.length;
        const mockMeasurementsDAO: MeasurementDAO[] = [
            FAKE_DATA.FAKE_MEASUREMENTS[fakeMeasurements_len - 2],
            FAKE_DATA.FAKE_MEASUREMENTS[fakeMeasurements_len - 1]
        ];


        const values = mockMeasurementsDAO.map(m => m.value);
        const stats = computeStats(values);
        const expectedStats: StatsDTO = { ...stats };



        const mockFinalMeasurementsDTO: MeasurementsDTO = {
            stats: expectedStats,
            sensorMacAddress: mockMeasurementsDAO[0].sensor.macAddress
        };

        //mock implementation of repo
        (MeasurementRepository as jest.Mock).mockImplementation(() => ({
            getSensorMeasurements: jest.fn().mockResolvedValue(mockMeasurementsDAO),
        }));

        const result = await measurementController.getSensorOutliers("net", "gw", mockMeasurementsDAO[0].sensor.macAddress);

        expect(result).toEqual(mockFinalMeasurementsDTO);

    });

    it("get network Outliers mapperService+statsService integration", async () => {
        const fakeMeasurements_len = FAKE_DATA.FAKE_MEASUREMENTS.length;

        const mockMacSensorA = "macA"
        const mockMeasurementsSensorA = [
            FAKE_DATA.FAKE_MEASUREMENTS[fakeMeasurements_len - 2],
            FAKE_DATA.FAKE_MEASUREMENTS[fakeMeasurements_len - 1]
        ]

        const mockMacSensorB = "macB"
        const mockMeasurementsSensorB = [
            FAKE_DATA.FAKE_MEASUREMENTS[fakeMeasurements_len - 3],
            FAKE_DATA.FAKE_MEASUREMENTS[fakeMeasurements_len - 4]
        ];

        const mockMeasurementsDAO: { sensorMacAddress: string, measurements: MeasurementDAO[] }[] = [
            { sensorMacAddress: mockMacSensorA, measurements: mockMeasurementsSensorA },
            { sensorMacAddress: mockMacSensorB, measurements: mockMeasurementsSensorB }
        ];



        const statsA = computeStats(mockMeasurementsSensorA.map(m => m.value));
        const statsB = computeStats(mockMeasurementsSensorB.map(m => m.value));

        const expectedStatsA: StatsDTO = { ...statsA };
        const expectedStatsB: StatsDTO = { ...statsB };

        const mockFinalMeasurementsADTO: MeasurementsDTO = {
            stats: expectedStatsA,
            sensorMacAddress: mockMeasurementsDAO[0].sensorMacAddress
        }
        const mockFinalMeasurementsBWithoutOnlyOutliersDTO: MeasurementsDTO = {
            stats: expectedStatsB,
            sensorMacAddress: mockMeasurementsDAO[1].sensorMacAddress
        }

        const mockFinalMeasurementsDTO: MeasurementsDTO[] = [
            mockFinalMeasurementsADTO,
            mockFinalMeasurementsBWithoutOnlyOutliersDTO
        ];

        //mock implementation of repo
        (MeasurementRepository as jest.Mock).mockImplementation(() => ({
            getNetworkMeasurements: jest.fn().mockResolvedValue(mockMeasurementsDAO),
        }));

        const result = await measurementController.getNetworkOutliers("net");

        expect(result).toMatchObject(mockFinalMeasurementsDTO);
    });

});