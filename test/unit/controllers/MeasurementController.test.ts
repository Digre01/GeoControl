import * as measurementController from "@controllers/measurementController";
import { MeasurementDAO } from "@models/dao/MeasurementDAO";
import { MeasurementRepository } from "@repositories/MeasurementRepository";
import * as statsService from "@services/statsService";
import { FAKE_DATA as FAKE_DATA_MEAS } from "../../fakeDataDAO/fakeDataDAOforMeasurements";
import { Measurement as MeasurementDTO } from "@models/dto/Measurement";
import { NotFoundError } from "@models/errors/NotFoundError";
import { Stats as StatsDTO } from "@models/dto/Stats";
import { Measurements as MeasurementsDTO } from "@models/dto/Measurements";
import * as mapperService from "@services/mapperService";

// sono mockate tutte le funzioni usate nei metodi del controller.
jest.mock("@repositories/MeasurementRepository");
jest.mock("@services/mapperService");
jest.mock("@services/statsService");

beforeEach(() => {
    jest.resetAllMocks();
});

describe("create Measurement", () => {
    it("call sequence", async () => {

        const mockCreate = jest.fn();
        (MeasurementRepository as jest.Mock).mockImplementation(() => ({
            createMeasurement: mockCreate
        }));

        const networkCode = "NET123";
        const gatewayMac = "DD:BB:CC:CC:EE:FF";
        const sensorMac = "AF:10:CF:DD:1E:04";
        const measurementDto: MeasurementDTO = {
            createdAt: new Date(),
            value: 42
        };

        await measurementController.createMeasurement(networkCode, gatewayMac, sensorMac, measurementDto);

        expect(mockCreate).toHaveBeenCalledTimes(1);
        expect(mockCreate).toHaveBeenCalledWith(networkCode, gatewayMac, sensorMac, measurementDto);

    });

    it("NotFoundError exception propagation", async () => {

        const mockCreate = jest.fn().mockImplementation(() => {
            throw new NotFoundError("messaggio");
        });
        (MeasurementRepository as jest.Mock).mockImplementation(() => ({
            createMeasurement: mockCreate
        }));

        const measurementDto: MeasurementDTO = {
            createdAt: new Date(),
            value: 42
        };

        await expect(
            measurementController.createMeasurement('NET', 'GW', 'SENS', measurementDto)
        ).rejects.toThrow(NotFoundError);

    });
});


describe("get sensor Measurements", () => {
    it("call sequence and propagation of the correct measurements", async () => {
        const fakeMeasurements_len = FAKE_DATA_MEAS.FAKE_MEASUREMENTS.length;
        const mockMeasurementsDAO: MeasurementDAO[] = [
            FAKE_DATA_MEAS.FAKE_MEASUREMENTS[fakeMeasurements_len - 2],
            FAKE_DATA_MEAS.FAKE_MEASUREMENTS[fakeMeasurements_len - 1]
        ];

        const measurementDTO: MeasurementDTO[] = mockMeasurementsDAO.map(m => ({ createdAt: m.createdAt, value: m.value }));
        const measurementWithOutlierDTO: MeasurementDTO[] = measurementDTO.map(m => ({ ...m, isOutlier: false }))

        const mockStats = { mean: 10, variance: 9 } as any;
        const mockStatsDTO: StatsDTO = { ...mockStats, upperThreshold: 16, lowerThreshold: 4 };

        const mockFinalMeasurementsDTO: MeasurementsDTO = {
            measurements: measurementWithOutlierDTO,
            stats: mockStatsDTO,
            sensorMacAddress: mockMeasurementsDAO[0].sensor.macAddress
        };

        //mock implementation of repo
        (MeasurementRepository as jest.Mock).mockImplementation(() => ({
            getSensorMeasurements: jest.fn().mockResolvedValue(mockMeasurementsDAO),
        }));

        //mock services
        (statsService.calculateStats as jest.Mock).mockReturnValue(mockStatsDTO);
        (mapperService.mapStatsToDTO as jest.Mock).mockReturnValue(mockStatsDTO);
        (mapperService.mapMeasurementDAOToDTO as jest.Mock).mockImplementation((m) => ({ createdAt: m.createdAt, value: m.value }));
        (statsService.calculateOutliers as jest.Mock).mockReturnValue(measurementWithOutlierDTO);
        (mapperService.mapMeasurementsToDTO as jest.Mock).mockReturnValue(mockFinalMeasurementsDTO);

        const result = await measurementController.getSensorMeasurements("net", "gw", "sensor");

        expect(result).toBe(mockFinalMeasurementsDTO);
        expect(statsService.calculateStats).toHaveBeenCalledWith(mockMeasurementsDAO, undefined, undefined);
        expect(mapperService.mapStatsToDTO).toHaveBeenCalledWith(mockStatsDTO);
        expect(mapperService.mapMeasurementDAOToDTO).toHaveBeenCalledTimes(2);
        expect(statsService.calculateOutliers).toHaveBeenCalledWith(mockStatsDTO, measurementDTO);
        expect(mapperService.mapMeasurementsToDTO).toHaveBeenCalledWith("sensor", mockStatsDTO, measurementWithOutlierDTO);
    });

    it("sensor with no measurements", async () => {

        const mockSensorMacAddress = "sensorMAC"

        const mockMeasurementsDAO: MeasurementDAO[] = [];
        const mockFinalMeasurementsDTO: MeasurementsDTO = {
            sensorMacAddress: mockSensorMacAddress
        };

        //mock implementation of repo
        (MeasurementRepository as jest.Mock).mockImplementation(() => ({
            getSensorMeasurements: jest.fn().mockResolvedValue(mockMeasurementsDAO),
        }));

        //mock services
        (mapperService.mapMeasurementsToDTO as jest.Mock).mockReturnValue(mockFinalMeasurementsDTO);

        const result = await measurementController.getSensorMeasurements("net", "gw", "sensorMAC");

        expect(result).toBe(mockFinalMeasurementsDTO);
        expect(result).not.toHaveProperty("measurements");
        expect(result).not.toHaveProperty("stats");
    });

    it("NotFoundError exception propagation", async () => {

        const mockCreate = jest.fn().mockImplementation(() => {
            throw new NotFoundError("messaggio");
        });

        (MeasurementRepository as jest.Mock).mockImplementation(() => ({
            getSensorMeasurements: mockCreate
        }));

        await expect(
            measurementController.getSensorMeasurements("net", "gw", "sensorMAC")
        ).rejects.toThrow(NotFoundError);
    });
});

describe("get network Measurements", () => {



    it("call sequence and propagation of the correct measurements", async () => {
        const fakeMeasurements_len = FAKE_DATA_MEAS.FAKE_MEASUREMENTS.length;

        const mockMacSensorA = "macA"
        const mockMeasurementsSensorA = [
            FAKE_DATA_MEAS.FAKE_MEASUREMENTS[fakeMeasurements_len - 2],
            FAKE_DATA_MEAS.FAKE_MEASUREMENTS[fakeMeasurements_len - 1]
        ]

        const mockMacSensorB = "macB"
        const mockMeasurementsSensorB = [
            FAKE_DATA_MEAS.FAKE_MEASUREMENTS[fakeMeasurements_len - 3],
            FAKE_DATA_MEAS.FAKE_MEASUREMENTS[fakeMeasurements_len - 4]
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
        (mapperService.mapStatsToDTO as jest.Mock).mockReturnValue(mockStatsDTO);
        (mapperService.mapMeasurementDAOToDTO as jest.Mock).mockImplementation((m) => ({ createdAt: m.createdAt, value: m.value }));
        (statsService.calculateOutliers as jest.Mock).mockReturnValueOnce(measurementAWithOutlierDTO);
        (statsService.calculateOutliers as jest.Mock).mockReturnValueOnce(measurementBWithOutlierDTO);
        (mapperService.mapMeasurementsToDTO as jest.Mock).mockReturnValueOnce(mockFinalMeasurementsADTO);
        (mapperService.mapMeasurementsToDTO as jest.Mock).mockReturnValueOnce(mockFinalMeasurementsBDTO);


        const result = await measurementController.getNetworkMeasurements("net");

        expect(result).toMatchObject(mockFinalMeasurementsDTO);

        expect(statsService.calculateStats).toHaveBeenCalledWith(mockMeasurementsSensorA, undefined, undefined);
        expect(mapperService.mapStatsToDTO).toHaveBeenCalledWith(mockStatsDTO);
        expect(statsService.calculateOutliers).toHaveBeenCalledWith(mockStatsDTO, measurementBDTO);
        expect(mapperService.mapMeasurementsToDTO).toHaveBeenCalledWith("macA", mockStatsDTO, measurementAWithOutlierDTO);
    });


    it("sensor with no measurements", async () => {
        const fakeMeasurements_len = FAKE_DATA_MEAS.FAKE_MEASUREMENTS.length;

        const mockMacSensorA = "macA"
        const mockMeasurementsSensorA: MeasurementDAO[] = [
            FAKE_DATA_MEAS.FAKE_MEASUREMENTS[fakeMeasurements_len - 2],
            FAKE_DATA_MEAS.FAKE_MEASUREMENTS[fakeMeasurements_len - 1]
        ]

        const mockMacSensorB = "macB"
        const mockMeasurementsSensorB: MeasurementDAO[] = [];

        const mockMeasurementsDAO: { sensorMacAddress: string, measurements: MeasurementDAO[] }[] = [
            { sensorMacAddress: mockMacSensorA, measurements: mockMeasurementsSensorA },
            { sensorMacAddress: mockMacSensorB, measurements: mockMeasurementsSensorB }
        ];

        const measurementADTO: MeasurementDTO[] = mockMeasurementsDAO[0].measurements.map(m => ({ createdAt: m.createdAt, value: m.value }));
        const measurementAWithOutlierDTO: MeasurementDTO[] = measurementADTO.map(m => ({ ...m, isOutlier: false }));


        //uguali per tutti i sensori
        const mockStats = { mean: 10, variance: 9 } as any;
        const mockStatsDTO: StatsDTO = { ...mockStats, upperThreshold: 16, lowerThreshold: 4 };

        const mockFinalMeasurementsADTO: MeasurementsDTO = {
            measurements: measurementAWithOutlierDTO,
            stats: mockStatsDTO,
            sensorMacAddress: mockMeasurementsDAO[0].sensorMacAddress
        }

        const mockFinalMeasurementsBDTO: MeasurementsDTO = {
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
        (mapperService.mapStatsToDTO as jest.Mock).mockReturnValue(mockStatsDTO);
        (mapperService.mapMeasurementDAOToDTO as jest.Mock).mockImplementation((m) => ({ createdAt: m.createdAt, value: m.value }));
        (statsService.calculateOutliers as jest.Mock).mockReturnValueOnce(measurementAWithOutlierDTO);
        (mapperService.mapMeasurementsToDTO as jest.Mock).mockReturnValueOnce(mockFinalMeasurementsADTO);
        (mapperService.mapMeasurementsToDTO as jest.Mock).mockReturnValueOnce(mockFinalMeasurementsBDTO);


        const result = await measurementController.getNetworkMeasurements("net");

        expect(result).toMatchObject(mockFinalMeasurementsDTO);
        expect(result[1]).not.toHaveProperty("measurements")
        expect(statsService.calculateStats).toHaveBeenCalledWith(mockMeasurementsSensorA, undefined, undefined);
        expect(mapperService.mapStatsToDTO).toHaveBeenCalledWith(mockStatsDTO);
        expect(mapperService.mapMeasurementsToDTO).toHaveBeenCalledWith("macA", mockStatsDTO, measurementAWithOutlierDTO);
        expect(statsService.calculateOutliers).toHaveBeenCalledWith(mockStatsDTO, measurementADTO);
        expect(statsService.calculateOutliers).toHaveBeenCalledTimes(1);
    });

    it("NotFoundError exception propagation", async () => {

        const mockCreate = jest.fn().mockImplementation(() => {
            throw new NotFoundError("messaggio");
        });

        (MeasurementRepository as jest.Mock).mockImplementation(() => ({
            getNetworkMeasurements: mockCreate
        }));

        await expect(
            measurementController.getNetworkMeasurements("net")
        ).rejects.toThrow(NotFoundError);
    });

});


describe("get sensor Stats", () => {

    it("call sequence and propagation of the correct stats", async () => {
        const fakeMeasurements_len = FAKE_DATA_MEAS.FAKE_MEASUREMENTS.length;
        const mockMeasurementsDAO: MeasurementDAO[] = [
            FAKE_DATA_MEAS.FAKE_MEASUREMENTS[fakeMeasurements_len - 2],
            FAKE_DATA_MEAS.FAKE_MEASUREMENTS[fakeMeasurements_len - 1]
        ];


        const mockStats = { mean: 10, variance: 9 } as any;
        const mockStatsDTO: StatsDTO = { ...mockStats, upperThreshold: 16, lowerThreshold: 4 };


        //mock implementation of repo
        (MeasurementRepository as jest.Mock).mockImplementation(() => ({
            getSensorMeasurements: jest.fn().mockResolvedValue(mockMeasurementsDAO),
        }));

        //mock services
        (statsService.calculateStats as jest.Mock).mockReturnValue(mockStatsDTO);
        (mapperService.mapStatsToDTO as jest.Mock).mockReturnValue(mockStatsDTO);


        const result = await measurementController.getSensorStats("net", "gw", "sensor");

        expect(result).toBe(mockStatsDTO);
        expect(statsService.calculateStats).toHaveBeenCalledWith(mockMeasurementsDAO, undefined, undefined);
        expect(mapperService.mapStatsToDTO).toHaveBeenCalledWith(mockStatsDTO);

    });

    it("sensor with no measurements", async () => {
        const mockMeasurementsDAO: MeasurementDAO[] = [];
        const mockStatsDTO: StatsDTO = { mean: 0, variance: 0, upperThreshold: 0, lowerThreshold: 0 };

        //mock implementation of repo
        (MeasurementRepository as jest.Mock).mockImplementation(() => ({
            getSensorMeasurements: jest.fn().mockResolvedValue(mockMeasurementsDAO),
        }));

        //mock services
        (statsService.calculateStats as jest.Mock).mockReturnValue(mockStatsDTO);
        (mapperService.mapStatsToDTO as jest.Mock).mockReturnValue(mockStatsDTO);

        const result = await measurementController.getSensorStats("net", "gw", "sensorMAC");

        expect(result).toBe(mockStatsDTO);
        expect(statsService.calculateStats).toHaveBeenCalledWith(mockMeasurementsDAO, undefined, undefined);
        expect(mapperService.mapStatsToDTO).toHaveBeenCalledWith(mockStatsDTO);
    });

    it("NotFoundError exception propagation", async () => {

        const mockCreate = jest.fn().mockImplementation(() => {
            throw new NotFoundError("messaggio");
        });

        (MeasurementRepository as jest.Mock).mockImplementation(() => ({
            getSensorMeasurements: mockCreate
        }));

        await expect(
            measurementController.getSensorStats("net", "gw", "sensorMAC")
        ).rejects.toThrow(NotFoundError);
    });

});

describe("get network Stats", () => {

    it("call sequence and propagation of the correct stats", async () => {
        const fakeMeasurements_len = FAKE_DATA_MEAS.FAKE_MEASUREMENTS.length;

        const mockMacSensorA = "macA"
        const mockMeasurementsSensorA = [
            FAKE_DATA_MEAS.FAKE_MEASUREMENTS[fakeMeasurements_len - 2],
            FAKE_DATA_MEAS.FAKE_MEASUREMENTS[fakeMeasurements_len - 1]
        ]

        const mockMacSensorB = "macB"
        const mockMeasurementsSensorB = [
            FAKE_DATA_MEAS.FAKE_MEASUREMENTS[fakeMeasurements_len - 3],
            FAKE_DATA_MEAS.FAKE_MEASUREMENTS[fakeMeasurements_len - 4]
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
        (mapperService.mapStatsToDTO as jest.Mock).mockReturnValue(mockStatsDTO);
        (mapperService.mapMeasurementDAOToDTO as jest.Mock).mockImplementation((m) => ({ createdAt: m.createdAt, value: m.value }));

        (mapperService.mapMeasurementsToDTO as jest.Mock).mockReturnValueOnce(mockFinalMeasurementsADTO);
        (mapperService.mapMeasurementsToDTO as jest.Mock).mockReturnValueOnce(mockFinalMeasurementsBDTO);


        const result = await measurementController.getNetworkStats("net");

        expect(result).toMatchObject(mockFinalMeasurementsDTO);
        expect(result[0]).not.toHaveProperty("measurements")
        expect(statsService.calculateStats).toHaveBeenCalledWith(mockMeasurementsSensorA, undefined, undefined);
        expect(mapperService.mapStatsToDTO).toHaveBeenCalledWith(mockStatsDTO);

    });


    it("sensor with no measurements", async () => {
        const fakeMeasurements_len = FAKE_DATA_MEAS.FAKE_MEASUREMENTS.length;

        const mockMacSensorA = "macA"
        const mockMeasurementsSensorA: MeasurementDAO[] = [
            FAKE_DATA_MEAS.FAKE_MEASUREMENTS[fakeMeasurements_len - 2],
            FAKE_DATA_MEAS.FAKE_MEASUREMENTS[fakeMeasurements_len - 1]
        ]

        const mockMacSensorB = "macB"
        const mockMeasurementsSensorB: MeasurementDAO[] = [];

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
        (mapperService.mapStatsToDTO as jest.Mock).mockReturnValue(mockStatsDTO);
        (mapperService.mapMeasurementDAOToDTO as jest.Mock).mockImplementation((m) => ({ createdAt: m.createdAt, value: m.value }));
        (mapperService.mapMeasurementsToDTO as jest.Mock).mockReturnValueOnce(mockFinalMeasurementsADTO);
        (mapperService.mapMeasurementsToDTO as jest.Mock).mockReturnValueOnce(mockFinalMeasurementsBDTO);


        const result = await measurementController.getNetworkStats("net");

        expect(result).toMatchObject(mockFinalMeasurementsDTO);
        expect(result[0]).not.toHaveProperty("measurements");
        expect(result[1]).not.toHaveProperty("stats");
        expect(statsService.calculateStats).toHaveBeenCalledWith(mockMeasurementsSensorA, undefined, undefined);
        expect(mapperService.mapStatsToDTO).toHaveBeenCalledWith(mockStatsDTO);
        expect(mapperService.mapMeasurementsToDTO).toHaveBeenCalledWith("macA", mockStatsDTO);
        expect(mapperService.mapMeasurementsToDTO).toHaveBeenCalledWith("macB");


    });

    it("NotFoundError exception propagation", async () => {

        const mockCreate = jest.fn().mockImplementation(() => {
            throw new NotFoundError("messaggio");
        });

        (MeasurementRepository as jest.Mock).mockImplementation(() => ({
            getNetworkMeasurements: mockCreate
        }));

        await expect(
            measurementController.getNetworkStats("net")
        ).rejects.toThrow(NotFoundError);
    });
});

describe("get sensor Outliers", () => {
    it("call sequence and propagation of the correct outliers", async () => {
        const fakeMeasurements_len = FAKE_DATA_MEAS.FAKE_MEASUREMENTS.length;
        const mockMeasurementsDAO: MeasurementDAO[] = [
            FAKE_DATA_MEAS.FAKE_MEASUREMENTS[fakeMeasurements_len - 2],
            FAKE_DATA_MEAS.FAKE_MEASUREMENTS[fakeMeasurements_len - 1]
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
        (mapperService.mapStatsToDTO as jest.Mock).mockReturnValue(mockStatsDTO);
        (mapperService.mapMeasurementDAOToDTO as jest.Mock).mockImplementation((m) => ({ createdAt: m.createdAt, value: m.value }));
        (statsService.calculateOutliers as jest.Mock).mockReturnValue(measurementWithOutlierDTO);
        (mapperService.mapMeasurementsToDTO as jest.Mock).mockReturnValue(mockFinalMeasurementsDTO);

        const result = await measurementController.getSensorOutliers("net", "gw", "sensor");

        expect(result).toBe(mockFinalMeasurementsDTO);
        expect(statsService.calculateStats).toHaveBeenCalledWith(mockMeasurementsDAO, undefined, undefined);
        expect(mapperService.mapStatsToDTO).toHaveBeenCalledWith(mockStatsDTO);
        expect(mapperService.mapMeasurementDAOToDTO).toHaveBeenCalledTimes(2);
        expect(statsService.calculateOutliers).toHaveBeenCalledWith(mockStatsDTO, measurementDTO);
        expect(mapperService.mapMeasurementsToDTO).toHaveBeenCalledWith("sensor", mockStatsDTO, measurementWithOutlierDTO.filter(m => m.isOutlier));
    });

    it("sensor with no measurements", async () => {

        const mockSensorMacAddress = "sensorMAC"

        const mockMeasurementsDAO: MeasurementDAO[] = [];
        const mockFinalMeasurementsDTO: MeasurementsDTO = {
            sensorMacAddress: mockSensorMacAddress
        };

        //mock implementation of repo
        (MeasurementRepository as jest.Mock).mockImplementation(() => ({
            getSensorMeasurements: jest.fn().mockResolvedValue(mockMeasurementsDAO),
        }));

        //mock services
        (mapperService.mapMeasurementsToDTO as jest.Mock).mockReturnValue(mockFinalMeasurementsDTO);

        const result = await measurementController.getSensorOutliers("net", "gw", "sensorMAC");

        expect(result).toBe(mockFinalMeasurementsDTO);
        expect(result).not.toHaveProperty("measurements");
        expect(result).not.toHaveProperty("stats");
        expect(mapperService.mapMeasurementsToDTO).toHaveBeenCalledWith(mockSensorMacAddress);
    });

    it("NotFoundError exception propagation", async () => {

        const mockCreate = jest.fn().mockImplementation(() => {
            throw new NotFoundError("messaggio");
        });

        (MeasurementRepository as jest.Mock).mockImplementation(() => ({
            getSensorMeasurements: mockCreate
        }));

        await expect(
            measurementController.getSensorOutliers("net", "gw", "sensorMAC")
        ).rejects.toThrow(NotFoundError);
    });

});

describe("get network Outliers", () => {

    it("call sequence and propagation of the correct outliers", async () => {
        const fakeMeasurements_len = FAKE_DATA_MEAS.FAKE_MEASUREMENTS.length;

        const mockMacSensorA = "macA"
        const mockMeasurementsSensorA = [
            FAKE_DATA_MEAS.FAKE_MEASUREMENTS[fakeMeasurements_len - 2],
            FAKE_DATA_MEAS.FAKE_MEASUREMENTS[fakeMeasurements_len - 1]
        ]

        const mockMacSensorB = "macB"
        const mockMeasurementsSensorB = [
            FAKE_DATA_MEAS.FAKE_MEASUREMENTS[fakeMeasurements_len - 3],
            FAKE_DATA_MEAS.FAKE_MEASUREMENTS[fakeMeasurements_len - 4]
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

        const mockFinalMeasurementsBDTO: MeasurementsDTO = {
            measurements: measurementBWithOutlierDTO,
            stats: mockStatsDTO,
            sensorMacAddress: mockMeasurementsDAO[1].sensorMacAddress
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
        (mapperService.mapStatsToDTO as jest.Mock).mockReturnValue(mockStatsDTO);
        (mapperService.mapMeasurementDAOToDTO as jest.Mock).mockImplementation((m) => ({ createdAt: m.createdAt, value: m.value }));
        (statsService.calculateOutliers as jest.Mock).mockReturnValueOnce(measurementAWithOutlierDTO);
        (statsService.calculateOutliers as jest.Mock).mockReturnValueOnce(measurementBWithOutlierDTO);
        (mapperService.mapMeasurementsToDTO as jest.Mock).mockReturnValueOnce(mockFinalMeasurementsADTO);
        (mapperService.mapMeasurementsToDTO as jest.Mock).mockReturnValueOnce(mockFinalMeasurementsBWithoutOnlyOutliersDTO);


        const result = await measurementController.getNetworkOutliers("net");

        expect(result).toMatchObject(mockFinalMeasurementsDTO);

        expect(statsService.calculateStats).toHaveBeenCalledWith(mockMeasurementsSensorA, undefined, undefined);
        expect(mapperService.mapStatsToDTO).toHaveBeenCalledWith(mockStatsDTO);
        expect(statsService.calculateOutliers).toHaveBeenCalledWith(mockStatsDTO, measurementBDTO);
        expect(mapperService.mapMeasurementsToDTO).toHaveBeenCalledWith("macA", mockStatsDTO, measurementAWithOutlierDTO);
    });


    it("sensor with no measurements", async () => {
        const fakeMeasurements_len = FAKE_DATA_MEAS.FAKE_MEASUREMENTS.length;

        const mockMacSensorA = "macA"
        const mockMeasurementsSensorA: MeasurementDAO[] = [
            FAKE_DATA_MEAS.FAKE_MEASUREMENTS[fakeMeasurements_len - 2],
            FAKE_DATA_MEAS.FAKE_MEASUREMENTS[fakeMeasurements_len - 1]
        ]

        const mockMacSensorB = "macB"
        const mockMeasurementsSensorB: MeasurementDAO[] = [];

        const mockMeasurementsDAO: { sensorMacAddress: string, measurements: MeasurementDAO[] }[] = [
            { sensorMacAddress: mockMacSensorA, measurements: mockMeasurementsSensorA },
            { sensorMacAddress: mockMacSensorB, measurements: mockMeasurementsSensorB }
        ];

        const measurementADTO: MeasurementDTO[] = mockMeasurementsDAO[0].measurements.map(m => ({ createdAt: m.createdAt, value: m.value }));
        const measurementAWithOutlierDTO: MeasurementDTO[] = measurementADTO.map(m => ({ ...m, isOutlier: true }));


        //uguali per tutti i sensori
        const mockStats = { mean: 10, variance: 9 } as any;
        const mockStatsDTO: StatsDTO = { ...mockStats, upperThreshold: 16, lowerThreshold: 4 };

        const mockFinalMeasurementsADTO: MeasurementsDTO = {
            measurements: measurementAWithOutlierDTO,
            stats: mockStatsDTO,
            sensorMacAddress: mockMeasurementsDAO[0].sensorMacAddress
        }

        const mockFinalMeasurementsBDTO: MeasurementsDTO = {
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
        (mapperService.mapStatsToDTO as jest.Mock).mockReturnValue(mockStatsDTO);
        (mapperService.mapMeasurementDAOToDTO as jest.Mock).mockImplementation((m) => ({ createdAt: m.createdAt, value: m.value }));
        (statsService.calculateOutliers as jest.Mock).mockReturnValueOnce(measurementAWithOutlierDTO);
        (mapperService.mapMeasurementsToDTO as jest.Mock).mockReturnValueOnce(mockFinalMeasurementsADTO);
        (mapperService.mapMeasurementsToDTO as jest.Mock).mockReturnValueOnce(mockFinalMeasurementsBDTO);


        const result = await measurementController.getNetworkOutliers("net");

        expect(result).toMatchObject(mockFinalMeasurementsDTO);
        expect(result[1]).not.toHaveProperty("measurements")
        expect(statsService.calculateStats).toHaveBeenCalledWith(mockMeasurementsSensorA, undefined, undefined);
        expect(mapperService.mapStatsToDTO).toHaveBeenCalledWith(mockStatsDTO);
        expect(mapperService.mapMeasurementsToDTO).toHaveBeenCalledWith("macA", mockStatsDTO, measurementAWithOutlierDTO);
        expect(statsService.calculateOutliers).toHaveBeenCalledWith(mockStatsDTO, measurementADTO);
        expect(statsService.calculateOutliers).toHaveBeenCalledTimes(1);
    });


    it("NotFoundError exception propagation", async () => {

        const mockCreate = jest.fn().mockImplementation(() => {
            throw new NotFoundError("messaggio");
        });

        (MeasurementRepository as jest.Mock).mockImplementation(() => ({
            getNetworkMeasurements: mockCreate
        }));

        await expect(
            measurementController.getNetworkMeasurements("net")
        ).rejects.toThrow(NotFoundError);
    });

});