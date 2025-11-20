import { SensorDAO } from "@models/dao/SensorDAO";
import { Sensor as SensorDTO } from "@models/dto/Sensor";
import { FAKE_DATA } from "@test/fakeDataDAO/fakeDataDAOforSensors"; 
import * as sensorController from "@controllers/sensorController";
import { SensorRepository } from "@repositories/SensorRepository";
import { GatewayRepository } from "@repositories/GatewayRepository";
import { NetworkDAO } from "@models/dao/NetworkDAO";
import { NotFoundError } from "@models/errors/NotFoundError";
import { GatewayDAO } from "@models/dao/GatewayDAO";

jest.mock("@repositories/SensorRepository");

beforeEach(() => {
    jest.resetAllMocks();
});

describe("sensorController: getAllSensors + mapperService", () => {

    it("should return sensors mapped in DTO", async () => {

        const mockNetworkDAO: NetworkDAO = FAKE_DATA.FAKE_NETWORKS[0];

        const mockGatewayDAO: GatewayDAO = FAKE_DATA.FAKE_GATEWAYS[0];

        const mockSensorsDAO: SensorDAO[] = [
            FAKE_DATA.FAKE_SENSORS[0],
            FAKE_DATA.FAKE_SENSORS[1],
        ];

        const mockSensorsDTO: SensorDTO[] = mockSensorsDAO.map(sensor => {
            const dto: any = { macAddress: sensor.macAddress };

            if (sensor.name !== undefined && sensor.name !== null) {
                dto.name = sensor.name;
            }

            if (sensor.description !== undefined && sensor.description !== null) {
                dto.description = sensor.description;
            }

            if (sensor.variable !== undefined && sensor.variable !== null) {
                dto.variable = sensor.variable;
            }

            if (sensor.unit !== undefined && sensor.unit !== null) {
                dto.unit = sensor.unit;
            }

            return dto;
        });

        (SensorRepository as jest.Mock).mockImplementation(() => ({
            getAllSensors: jest.fn().mockResolvedValue(mockSensorsDAO),
        }));

        const result = await sensorController.getAllSensors(mockNetworkDAO.code, mockGatewayDAO.macAddress);

        expect(result).toEqual(mockSensorsDTO);
        expect(SensorRepository).toHaveBeenCalledTimes(1);

    });
    
    it("gateway without sensors", async () => {

        const mockNetworkDAO: NetworkDAO = FAKE_DATA.FAKE_NETWORKS[0];

        const mockGatewayDAO: GatewayDAO = FAKE_DATA.FAKE_GATEWAYS[2];

        const mockSensorsDAO: SensorDAO[] = []

        const mockSensorsDTO: SensorDTO[] = [];

        (SensorRepository as jest.Mock).mockImplementation(() => ({
            getAllSensors: jest.fn().mockResolvedValue(mockSensorsDAO),
        }));

        const result = await sensorController.getAllSensors(mockNetworkDAO.code, mockGatewayDAO.macAddress);

        expect(result).toEqual(mockSensorsDTO);
        expect(SensorRepository).toHaveBeenCalledTimes(1);

    });
    
    it("NotFoundError exception propagation", async () => {

        const mockCreate = jest.fn().mockImplementation(() => {
            throw new NotFoundError("messaggio");
        });

        (SensorRepository as jest.Mock).mockImplementation(() => ({
            getAllSensors: mockCreate
        }));

        await expect(
            sensorController.getAllSensors("non-existent networkId", "non-existent gatewayMac")
        ).rejects.toThrow(NotFoundError);

    });
    

});


describe("sensorController: getSensor + mapperService", () => {

    it("should return gateway mapped in DTO", async () => {

        const mockNetworkDAO: NetworkDAO = FAKE_DATA.FAKE_NETWORKS[0];

        const mockGatewayDAO: GatewayDAO = FAKE_DATA.FAKE_GATEWAYS[0];

        const mockSensorDAO: SensorDAO = FAKE_DATA.FAKE_SENSORS[0];

        const mockSensorDTO: SensorDTO = {
            macAddress: mockSensorDAO.macAddress,
        };

        if (mockSensorDAO.name !== undefined && mockSensorDAO.name !== null) {
            mockSensorDTO.name = mockSensorDAO.name;
        }

        if (mockSensorDAO.description !== undefined && mockSensorDAO.name !== null) {
            mockSensorDTO.description = mockSensorDAO.description;
        }

        if (mockSensorDAO.variable !== undefined && mockSensorDAO.variable !== null) {
            mockSensorDTO.variable = mockSensorDAO.variable;
        }

        if (mockSensorDAO.unit !== undefined && mockSensorDAO.unit !== null) {
            mockSensorDTO.unit = mockSensorDAO.unit;
        }

        //getGatewayByMacAddress
        (SensorRepository as jest.Mock).mockImplementation(() => ({
            getSensorByMacAddress: jest.fn().mockResolvedValue(mockSensorDAO),
        }));

        const result = await sensorController.getSensor(mockNetworkDAO.code, mockGatewayDAO.macAddress, mockSensorDAO.macAddress);

        expect(result).toEqual(mockSensorDTO);
        expect(SensorRepository).toHaveBeenCalledTimes(1);

    });

    it("NotFoundError exception propagation", async () => {

        const mockCreate = jest.fn().mockImplementation(() => {
            throw new NotFoundError("messaggio");
        });

        (SensorRepository as jest.Mock).mockImplementation(() => ({
            getSensorByMacAddress: mockCreate
        }));

        await expect(
            sensorController.getSensor("non-existent networkId", "non-existent gatewayMac", "non-existent sensorMac")
        ).rejects.toThrow(NotFoundError);

    });

});