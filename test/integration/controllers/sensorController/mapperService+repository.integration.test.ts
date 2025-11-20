import { GatewayDAO } from "@models/dao/GatewayDAO";
import { SensorDAO } from "@models/dao/SensorDAO";
import { Sensor as SensorDTO } from "@models/dto/Sensor";
import { FAKE_DATA } from "@test/fakeDataDAO/fakeDataDAOforSensors"; 
import * as sensorController from "@controllers/sensorController";
import { NetworkDAO } from "@models/dao/NetworkDAO";
import { NotFoundError } from "@models/errors/NotFoundError";
import { ConflictError } from "@models/errors/ConflictError";
import { initializeTestDataSource, closeTestDataSource } from "@test/setup/test-datasource";
import { createFakeSensors, createFakeGateways, createFakeNetworks } from "@test/fakeDataDAO/createFakeData";

beforeEach(async () => {
    await initializeTestDataSource();
    await createFakeNetworks(FAKE_DATA.FAKE_NETWORKS);
    await createFakeGateways(FAKE_DATA.FAKE_GATEWAYS);
    await createFakeSensors(FAKE_DATA.FAKE_SENSORS);
});

afterEach(async () => {
    await closeTestDataSource();
})


describe("sensorController: getAllSensors + mapperService + sensorRepository", () => {

    it("should return sensors mapped in DTO", async () => {

        const networkDAO: NetworkDAO = FAKE_DATA.FAKE_NETWORKS[0];

        const gatewayDAO: GatewayDAO = FAKE_DATA.FAKE_GATEWAYS[0];
        
        const sensorsDAO: SensorDAO[] = [
            FAKE_DATA.FAKE_SENSORS[0],
            FAKE_DATA.FAKE_SENSORS[1],
        ];

        const sensorsDTO: SensorDTO[] = sensorsDAO.map(sensor => {
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

        const result = await sensorController.getAllSensors(networkDAO.code, gatewayDAO.macAddress);

        expect(result).toEqual(sensorsDTO);

    });
    
    it("gateway without sensors", async () => {

        const networkDAO: NetworkDAO = FAKE_DATA.FAKE_NETWORKS[0];

        const gatewayDAO: GatewayDAO = FAKE_DATA.FAKE_GATEWAYS[2];

        const sensorsDTO: SensorDTO[] = [];

        const result = await sensorController.getAllSensors(networkDAO.code, gatewayDAO.macAddress);

        expect(result).toEqual(sensorsDTO);

    });
    
    it("NotFoundError exception propagation", async () => {

        await expect(
            sensorController.getAllSensors("non-existent networkId", "non-existent gatewayMac")
        ).rejects.toThrow(NotFoundError);

    });
    
});


describe("sensorController: getSensor + mapperService + sensorRepository", () => {

    it("should return sensor mapped in DTO", async () => {

        const networkDAO: NetworkDAO = FAKE_DATA.FAKE_NETWORKS[0];

        const gatewayDAO: GatewayDAO = FAKE_DATA.FAKE_GATEWAYS[0];

        const sensorDAO: SensorDAO = FAKE_DATA.FAKE_SENSORS[0];

        const sensorDTO: SensorDTO = {
            macAddress: sensorDAO.macAddress,
        };

        if (sensorDAO.name !== undefined && sensorDAO.name !== null) {
            sensorDTO.name = sensorDAO.name;
        }

        if (sensorDAO.description !== undefined && sensorDAO.name !== null) {
            sensorDTO.description = sensorDAO.description;
        }

        if (sensorDAO.variable !== undefined && sensorDAO.variable !== null) {
            sensorDTO.variable = sensorDAO.variable;
        }

        if (sensorDAO.unit !== undefined && sensorDAO.unit !== null) {
            sensorDTO.unit = sensorDAO.unit;
        }

        const result = await sensorController.getSensor(networkDAO.code, gatewayDAO.macAddress, sensorDAO.macAddress);

        expect(result).toEqual(sensorDTO);

    });

    it("NotFoundError exception propagation", async () => {

        await expect(
            sensorController.getSensor("non-existent networkId", "non-existent gatewayMac", "non-existent sensorMac")
        ).rejects.toThrow(NotFoundError);

    });

});


describe("sensorController: createSensor + sensorRepository", () => {

    it("call sequence", async () => {

        const networkDAO: NetworkDAO = FAKE_DATA.FAKE_NETWORKS[0];

        const gatewayDAO: GatewayDAO = FAKE_DATA.FAKE_GATEWAYS[0];

        const sensorDTO: SensorDTO = {
            macAddress: "11:22:33:44",
            name: "Test Sensor",
            description: "Description of Test Sensor",
            variable: "variable",
            unit: "C"
        };

        await expect(
            sensorController.createSensor(networkDAO.code, gatewayDAO.macAddress, sensorDTO)
        ).resolves.not.toThrow();

    });
    
    it("NotFoundError exception propagation", async () => {

        const sensorDTO: SensorDTO = {
            macAddress: "11:22:33:44",
            name: "Test Sensor",
            description: "Description of Test Sensor",
            variable: "variable",
            unit: "C"
        };

        await expect(
            sensorController.createSensor("non-existent networkId", "non-existent gatewayMac", sensorDTO)
        ).rejects.toThrow(NotFoundError);

    });

    it("ConflictError exception propagation", async () => {

        const networkDAO: NetworkDAO = FAKE_DATA.FAKE_NETWORKS[0];

        const gatewayDAO: GatewayDAO = FAKE_DATA.FAKE_GATEWAYS[0];

        const sensorDAO: SensorDAO = FAKE_DATA.FAKE_SENSORS[0];

        const sensorDTO: SensorDTO = {
            macAddress: sensorDAO.macAddress,
        };

        if (sensorDAO.name !== undefined && sensorDAO.name !== null) {
            sensorDTO.name = sensorDAO.name;
        }

        if (sensorDAO.description !== undefined && sensorDAO.name !== null) {
            sensorDTO.description = sensorDAO.description;
        }

        if (sensorDAO.variable !== undefined && sensorDAO.variable !== null) {
            sensorDTO.variable = sensorDAO.variable;
        }

        if (sensorDAO.unit !== undefined && sensorDAO.unit !== null) {
            sensorDTO.unit = sensorDAO.unit;
        }

        await expect(
            sensorController.createSensor(networkDAO.code, gatewayDAO.macAddress, sensorDTO)
        ).rejects.toThrow(ConflictError);

    });
    
});


describe("sensorController: updateSensor + sensorRepository", () => {

    it("call repository with correct arguments", async () => {

        const networkDAO: NetworkDAO = FAKE_DATA.FAKE_NETWORKS[0];

        const gatewayDAO: GatewayDAO = FAKE_DATA.FAKE_GATEWAYS[0];

        const sensorDAO: SensorDAO = FAKE_DATA.FAKE_SENSORS[0];

        const sensorDTO: SensorDTO = {
            macAddress: "11:22:33:44",
            name: "Test Sensor",
            description: "Description of Test Sensor"
        };

        await expect(
             sensorController.updateSensor(networkDAO.code, gatewayDAO.macAddress, sensorDAO.macAddress, sensorDTO)
        ).resolves.not.toThrow();

    });

    it("NotFoundError exception propagation", async () => {

        const sensorDTO: SensorDTO = {
            macAddress: "11:22:33:44",
            name: "Test Sensor",
            description: "Description of Test Sensor"
        };

        await expect(
            sensorController.updateSensor("non-existent networkId", "non-existent gatewayMac", "non-existent sensorMac", sensorDTO)
        ).rejects.toThrow(NotFoundError);

    });

    it("ConflictError exception propagation", async () => {

        const networkDAO: NetworkDAO = FAKE_DATA.FAKE_NETWORKS[0];

        const gatewayDAO: GatewayDAO = FAKE_DATA.FAKE_GATEWAYS[0];
        
        const sensor1_DAO: SensorDAO = FAKE_DATA.FAKE_SENSORS[0];
        const sensor2_DAO: SensorDAO = FAKE_DATA.FAKE_SENSORS[1];

        const sensor2_DTO: SensorDTO = {
            macAddress: sensor2_DAO.macAddress,
            name: "Test Sensor",
            description: "Description of Test Sensor"
        };

        await expect(
            sensorController.updateSensor(networkDAO.code, gatewayDAO.macAddress, sensor1_DAO.macAddress, sensor2_DTO)
        ).rejects.toThrow(ConflictError);

    });

});


describe("sensorController: deleteSensor + sensorRepository", () => {

    it("call repository with correct arguments", async () => {

        const networkDAO: NetworkDAO = FAKE_DATA.FAKE_NETWORKS[0];

        const gatewayDAO: GatewayDAO = FAKE_DATA.FAKE_GATEWAYS[0];

        const sensorDAO: SensorDAO = FAKE_DATA.FAKE_SENSORS[0];

        await expect(
            sensorController.deleteSensor(networkDAO.code, gatewayDAO.macAddress, sensorDAO.macAddress)
        ).resolves.not.toThrow();

    });

    it("NotFoundError exception propagation", async () => {

        const sensorDAO: SensorDAO = FAKE_DATA.FAKE_SENSORS[0];

        await expect(
            sensorController.deleteSensor("non-existent networkId", "non-existent gatewayMac", sensorDAO.macAddress)
        ).rejects.toThrow(NotFoundError);

    });

});
