import * as measurementController from "@controllers/measurementController";
import { MeasurementRepository } from "@repositories/MeasurementRepository";
import { MeasurementDAO } from "@models/dao/MeasurementDAO";
import { FAKE_DATA } from "@test/fakeDataDAO/fakeDataDAOforMeasurements";
import { Measurement as MeasurementDTO } from "@models/dto/Measurement";
import { Stats as StatsDTO } from "@models/dto/Stats";
import { Measurements as MeasurementsDTO } from "@models/dto/Measurements";
import * as statsService from "@services/statsService";

jest.mock("@repositories/MeasurementRepository");
jest.mock("@services/statsService");

beforeEach(() => {
    jest.resetAllMocks();
});


describe("MeasurementController mapperService integration", () => {

    it("get sensor Measurements mapperService integration", async () => {

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

        const mockStats = { mean: 10, variance: 9, upperThreshold: 16, lowerThreshold: 4 } as any;

        const expectedResult: MeasurementsDTO = {
            sensorMacAddress: mockMeasurementsDAO[0].sensor.macAddress,
            measurements: expectedMeasurementWithOutliers,
            stats: mockStats
        };

        (MeasurementRepository as jest.Mock).mockImplementation(() => ({
            getSensorMeasurements: jest.fn().mockResolvedValue(mockMeasurementsDAO)
        }));

        (statsService.calculateStats as jest.Mock).mockReturnValue(mockStats);
        (statsService.calculateOutliers as jest.Mock).mockReturnValue(expectedMeasurementWithOutliers);

        const result = await measurementController.getSensorMeasurements("net", "gw", mockMeasurementsDAO[0].sensor.macAddress);
        expect(result).toEqual(expectedResult);

    });

    it("get network Measurements mapperService integration", async () => {

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

        //uguali per tutti i sensori
        const mockStats = { mean: 10, variance: 9 } as any;
        const mockStatsDTO: StatsDTO = { ...mockStats, upperThreshold: 16, lowerThreshold: 4 };

        const mockFinalMeasurementsADTO: MeasurementsDTO = {
            measurements: measurementAWithOutlierDTO,
            stats: mockStatsDTO,
            sensorMacAddress: mockMeasurementsDAO[0].sensorMacAddress
        }

        const mockFinalMeasurementsBDTO: MeasurementsDTO = {
            measurements: measurementBWithOutlierDTO,
            stats: mockStatsDTO,
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

        //mock services
        (statsService.calculateStats as jest.Mock).mockReturnValue(mockStatsDTO);
        (statsService.calculateOutliers as jest.Mock).mockReturnValueOnce(measurementAWithOutlierDTO);
        (statsService.calculateOutliers as jest.Mock).mockReturnValueOnce(measurementBWithOutlierDTO);


        const result = await measurementController.getNetworkMeasurements("net");

        expect(result).toMatchObject(mockFinalMeasurementsDTO);

    });

    it("get sensor Stats mapperService integration", async () => {
        const fakeMeasurements_len = FAKE_DATA.FAKE_MEASUREMENTS.length;
        const mockMeasurementsDAO: MeasurementDAO[] = [
            FAKE_DATA.FAKE_MEASUREMENTS[fakeMeasurements_len - 2],
            FAKE_DATA.FAKE_MEASUREMENTS[fakeMeasurements_len - 1]
        ];


        const mockStats = { mean: 10, variance: 9 } as any;
        const mockStatsDTO: StatsDTO = { ...mockStats, upperThreshold: 16, lowerThreshold: 4 };


        //mock implementation of repo
        (MeasurementRepository as jest.Mock).mockImplementation(() => ({
            getSensorMeasurements: jest.fn().mockResolvedValue(mockMeasurementsDAO),
        }));

        //mock services
        (statsService.calculateStats as jest.Mock).mockReturnValue(mockStatsDTO);

        const result = await measurementController.getSensorStats("net", "gw", "sensor");

        expect(result).toEqual(mockStatsDTO);

    });

    it("get network Stats mapperService integration", async () => {
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

        //uguali per tutti i sensori
        const mockStats = { mean: 10, variance: 9 } as any;
        const mockStatsDTO: StatsDTO = { ...mockStats, upperThreshold: 16, lowerThreshold: 4 };


        const mockFinalMeasurementsADTO: MeasurementsDTO = {
            stats: mockStatsDTO,
            sensorMacAddress: mockMeasurementsDAO[0].sensorMacAddress
        }

        const mockFinalMeasurementsBDTO: MeasurementsDTO = {
            stats: mockStatsDTO,
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

        //mock services
        (statsService.calculateStats as jest.Mock).mockReturnValue(mockStatsDTO);

        const result = await measurementController.getNetworkStats("net");

        expect(result).toMatchObject(mockFinalMeasurementsDTO);
        expect(result[0]).not.toHaveProperty("measurements")
    });

    it("get sensor Outliers mapperService integration", async () => {
        const fakeMeasurements_len = FAKE_DATA.FAKE_MEASUREMENTS.length;
        const mockMeasurementsDAO: MeasurementDAO[] = [
            FAKE_DATA.FAKE_MEASUREMENTS[fakeMeasurements_len - 2],
            FAKE_DATA.FAKE_MEASUREMENTS[fakeMeasurements_len - 1]
        ];

        const measurementDTO: MeasurementDTO[] = mockMeasurementsDAO.map(m => ({ createdAt: m.createdAt, value: m.value }));
        const measurementWithOutlierDTO: MeasurementDTO[] = measurementDTO.map(m => ({ ...m, isOutlier: true }))
        measurementWithOutlierDTO[0].isOutlier = false

        const mockStats = { mean: 10, variance: 9 } as any;
        const mockStatsDTO: StatsDTO = { ...mockStats, upperThreshold: 16, lowerThreshold: 4 };

        const mockFinalMeasurementsDTO: MeasurementsDTO = {
            measurements: measurementWithOutlierDTO.filter(m => m.isOutlier),
            stats: mockStatsDTO,
            sensorMacAddress: mockMeasurementsDAO[0].sensor.macAddress
        };

        //mock implementation of repo
        (MeasurementRepository as jest.Mock).mockImplementation(() => ({
            getSensorMeasurements: jest.fn().mockResolvedValue(mockMeasurementsDAO),
        }));

        //mock services
        (statsService.calculateStats as jest.Mock).mockReturnValue(mockStatsDTO);
        (statsService.calculateOutliers as jest.Mock).mockReturnValue(measurementWithOutlierDTO);

        const result = await measurementController.getSensorOutliers("net", "gw", mockMeasurementsDAO[0].sensor.macAddress);

        expect(result).toEqual(mockFinalMeasurementsDTO);

    });

    it("get network Outliers mapperService integration", async () => {
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
        const measurementAWithOutlierDTO: MeasurementDTO[] = measurementADTO.map(m => ({ ...m, isOutlier: true }));

        const measurementBDTO: MeasurementDTO[] = mockMeasurementsDAO[1].measurements.map(m => ({ createdAt: m.createdAt, value: m.value }));
        const measurementBWithOutlierDTO: MeasurementDTO[] = measurementBDTO.map(m => ({ ...m, isOutlier: true }));
        measurementBWithOutlierDTO[0].isOutlier = false

        //uguali per tutti i sensori
        const mockStats = { mean: 10, variance: 9 } as any;
        const mockStatsDTO: StatsDTO = { ...mockStats, upperThreshold: 16, lowerThreshold: 4 };

        const mockFinalMeasurementsADTO: MeasurementsDTO = {
            measurements: measurementAWithOutlierDTO,
            stats: mockStatsDTO,
            sensorMacAddress: mockMeasurementsDAO[0].sensorMacAddress
        }
        const mockFinalMeasurementsBWithoutOnlyOutliersDTO: MeasurementsDTO = {
            measurements: measurementBWithOutlierDTO.filter(m => m.isOutlier),
            stats: mockStatsDTO,
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

        //mock services
        (statsService.calculateStats as jest.Mock).mockReturnValue(mockStatsDTO);
        (statsService.calculateOutliers as jest.Mock).mockReturnValueOnce(measurementAWithOutlierDTO);
        (statsService.calculateOutliers as jest.Mock).mockReturnValueOnce(measurementBWithOutlierDTO);


        const result = await measurementController.getNetworkOutliers("net");

        expect(result).toMatchObject(mockFinalMeasurementsDTO);
    });

});