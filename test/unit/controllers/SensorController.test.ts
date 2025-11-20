import * as sensorController from "@controllers/sensorController";
import { SensorRepository } from "@repositories/SensorRepository";
import { Sensor as SensorDTO } from "@dto/Sensor";
import { FAKE_DATA } from "../../fakeDataDAO/fakeDataDAOforSensors";
import * as mapperService from "@services/mapperService";
import { NotFoundError } from "@models/errors/NotFoundError";
import { ConflictError } from "@models/errors/ConflictError";

jest.mock("@repositories/SensorRepository");
jest.mock("@services/mapperService");

beforeEach(() => {
    jest.resetAllMocks();
});

describe("sensorController: getAllSensors", () => {
    it("should return sensors mapped in DTO", async () => {
        const mockSensorsDAO = FAKE_DATA.FAKE_SENSORS;
        const mockSensorsDTO = mockSensorsDAO.map(sensor => ({ macAddress: sensor.macAddress }));

        (SensorRepository as jest.Mock).mockImplementation(() => ({
            getAllSensors: jest.fn().mockResolvedValue(mockSensorsDAO),
        }));

        (mapperService.mapSensorDAOToDTO as jest.Mock).mockImplementation(dao =>
            mockSensorsDTO.find(dto => dto.macAddress === dao.macAddress)
        );

        const result = await sensorController.getAllSensors("NET01", "AA:BB:CC:DD:EE:FF");

        expect(result).toEqual(mockSensorsDTO);
        expect(SensorRepository).toHaveBeenCalledTimes(1);
        expect(mapperService.mapSensorDAOToDTO).toHaveBeenCalledTimes(mockSensorsDAO.length);
    });

    it("NotFoundError exception propagation", async () => {
        (SensorRepository as jest.Mock).mockImplementation(() => ({
            getAllSensors: jest.fn().mockImplementation(() => {
                throw new NotFoundError("Sensors not found");
            }),
        }));

        await expect(
            sensorController.getAllSensors("NET01", "AA:BB:CC:DD:EE:FF")
        ).rejects.toThrow(NotFoundError);
    });
});

describe("sensorController: getSensor", () => {
    it("should return a sensor mapped in DTO", async () => {
        const mockSensorDAO = FAKE_DATA.FAKE_SENSORS[0];
        const mockSensorDTO = { macAddress: mockSensorDAO.macAddress };

        (SensorRepository as jest.Mock).mockImplementation(() => ({
            getSensorByMacAddress: jest.fn().mockResolvedValue(mockSensorDAO),
        }));

        (mapperService.mapSensorDAOToDTO as jest.Mock).mockReturnValue(mockSensorDTO);

        const result = await sensorController.getSensor("NET01", "AA:BB:CC:DD:EE:FF", mockSensorDAO.macAddress);

        expect(result).toEqual(mockSensorDTO);
        expect(SensorRepository).toHaveBeenCalledTimes(1);
        expect(mapperService.mapSensorDAOToDTO).toHaveBeenCalledTimes(1);
    });

    it("NotFoundError exception propagation", async () => {
        (SensorRepository as jest.Mock).mockImplementation(() => ({
            getSensorByMacAddress: jest.fn().mockImplementation(() => {
                throw new NotFoundError("Sensor not found");
            }),
        }));

        await expect(
            sensorController.getSensor("NET01", "AA:BB:CC:DD:EE:FF", "00:11:22:33:44:55")
        ).rejects.toThrow(NotFoundError);
    });
});

describe("sensorController: createSensor", () => {
    it("should call repository with correct arguments", async () => {
        const mockSensorDTO: SensorDTO = {
            macAddress: "00:11:22:33:44:55",
            name: "Test Sensor",
            description: "Description of Test Sensor",
        };

        const mockCreate = jest.fn();

        (SensorRepository as jest.Mock).mockImplementation(() => ({
            createSensor: mockCreate,
        }));

        await sensorController.createSensor("NET01", "AA:BB:CC:DD:EE:FF", mockSensorDTO);

        expect(mockCreate).toHaveBeenCalledTimes(1);
        expect(mockCreate).toHaveBeenCalledWith("NET01", "AA:BB:CC:DD:EE:FF", mockSensorDTO);
    });

    it("ConflictError exception propagation", async () => {
        const mockSensorDTO: SensorDTO = {
            macAddress: "00:11:22:33:44:55",
            name: "Test Sensor",
            description: "Description of Test Sensor",
        };

        (SensorRepository as jest.Mock).mockImplementation(() => ({
            createSensor: jest.fn().mockImplementation(() => {
                throw new ConflictError("Sensor already exists");
            }),
        }));

        await expect(
            sensorController.createSensor("NET01", "AA:BB:CC:DD:EE:FF", mockSensorDTO)
        ).rejects.toThrow(ConflictError);
    });
});

describe("sensorController: updateSensor", () => {
    it("should call repository with correct arguments", async () => {
        const mockSensorDTO: SensorDTO = {
            macAddress: "00:11:22:33:44:55",
            name: "Updated Sensor",
            description: "Updated Description",
        };

        const mockUpdate = jest.fn();

        (SensorRepository as jest.Mock).mockImplementation(() => ({
            updateSensor: mockUpdate,
        }));

        await sensorController.updateSensor("NET01", "AA:BB:CC:DD:EE:FF", "00:11:22:33:44:55", mockSensorDTO);

        expect(mockUpdate).toHaveBeenCalledTimes(1);
        expect(mockUpdate).toHaveBeenCalledWith("NET01", "AA:BB:CC:DD:EE:FF", "00:11:22:33:44:55", mockSensorDTO);
    });

    it("NotFoundError exception propagation", async () => {
        const mockSensorDTO: SensorDTO = {
            macAddress: "00:11:22:33:44:55",
            name: "Updated Sensor",
            description: "Updated Description",
        };

        (SensorRepository as jest.Mock).mockImplementation(() => ({
            updateSensor: jest.fn().mockImplementation(() => {
                throw new NotFoundError("Sensor not found");
            }),
        }));

        await expect(
            sensorController.updateSensor("NET01", "AA:BB:CC:DD:EE:FF", "00:11:22:33:44:55", mockSensorDTO)
        ).rejects.toThrow(NotFoundError);
    });
});


describe("sensorController: deleteSensor", () => {
    it("should call repository with correct arguments", async () => {
        const mockDelete = jest.fn();

        (SensorRepository as jest.Mock).mockImplementation(() => ({
            deleteSensor: mockDelete,
        }));

        await sensorController.deleteSensor("NET01", "AA:BB:CC:DD:EE:FF", "00:11:22:33:44:55");

        expect(mockDelete).toHaveBeenCalledTimes(1);
        expect(mockDelete).toHaveBeenCalledWith("NET01", "AA:BB:CC:DD:EE:FF", "00:11:22:33:44:55");
    });

    it("NotFoundError exception propagation", async () => {
        (SensorRepository as jest.Mock).mockImplementation(() => ({
            deleteSensor: jest.fn().mockImplementation(() => {
                throw new NotFoundError("Sensor not found");
            }),
        }));

        await expect(
            sensorController.deleteSensor("NET01", "AA:BB:CC:DD:EE:FF", "00:11:22:33:44:55")
        ).rejects.toThrow(NotFoundError);
    });
});
