import { SensorRepository } from "@repositories/SensorRepository";
import {
    initializeTestDataSource,
    closeTestDataSource,
    TestDataSource
} from "@test/setup/test-datasource";
import { SensorDAO } from "@models/dao/SensorDAO";
import { NotFoundError } from "@models/errors/NotFoundError";
import { ConflictError } from "@models/errors/ConflictError";
import { createFakeGateways, createFakeNetworks, createFakeSensors } from "../../fakeDataDAO/createFakeData";
import { FAKE_DATA } from "../../fakeDataDAO/fakeDataDAOforSensors";
import { FAKE_DATA as FAKE_DATA_MEAS } from "@test/fakeDataDAO/fakeDataDAOforMeasurements";

beforeEach(async () => {
    await initializeTestDataSource();
    await createFakeNetworks(FAKE_DATA_MEAS.FAKE_NETWORKS);
    await createFakeGateways(FAKE_DATA_MEAS.FAKE_GATEWAYS);
    await createFakeSensors(FAKE_DATA.FAKE_SENSORS);
});

afterEach(async () => {
    await TestDataSource.getRepository(SensorDAO).clear();
    await closeTestDataSource();
});

describe("SensorRepository: getAllSensors", () => {

    const repo = new SensorRepository();

    it("should return all sensors for a given network and gateway", async () => {

        const expectedSensors = [
            {
                id: 1,
                name: "Sensor 1",
                macAddress: "00:11:22:33:44:55",
                description: "Description for Sensor 1",
                unit: "C",
                variable: "temperature",
                measurements: undefined,
                gateway: {
                    id: 1,
                    name: "Gateway 5",
                    macAddress: "AA:BB:CC:DD:EE:FF",
                    description: "Gateway numero 5",
                    sensors: undefined,
                    network: {
                        id: 1,
                        name: "Rete 1",
                        code: "NET01",
                        description: "Rete Network 1",
                        gateways: undefined,
                    },
                },
            },
            {
                id: 2,
                name: "Sensor 2",
                macAddress: "66:77:88:99:AA:BB",
                description: "Description for Sensor 2",
                unit: "C",
                variable: "temperature",
                measurements: undefined,
                gateway: {
                    id: 1,
                    name: "Gateway 5",
                    macAddress: "AA:BB:CC:DD:EE:FF",
                    description: "Gateway numero 5",
                    sensors: undefined,
                    network: {
                        id: 1,
                        name: "Rete 1",
                        code: "NET01",
                        description: "Rete Network 1",
                        gateways: undefined,
                    },
                },
            },
        ];

        const sensors = await repo.getAllSensors("NET01", "AA:BB:CC:DD:EE:FF");

        const mappedSensors = sensors.map(sensor => ({
            ...sensor,
            gateway: {
                ...sensor.gateway,
                network: {
                    ...sensor.gateway.network,
                },
            },
        }));

        expect(mappedSensors).toEqual(expectedSensors);
        expect(mappedSensors).toHaveLength(2);
    });

    it("should return Sensors not found if no sensors are found for the given network and gateway", async () => {

        await expect(repo.getAllSensors(
            "NETTTT01",
            "AA:BB:CC:HH:EE:FF"))
            .rejects.toThrow(NotFoundError);
    });

    it("should return Sensor by macAddress", async () => {

        const network = FAKE_DATA.FAKE_NETWORKS[0];
        const gateway = FAKE_DATA.FAKE_GATEWAYS[0];

        const expectedSensors = [
            {
                id: 1,
                name: "Sensor 1",
                macAddress: "00:11:22:33:44:55",
                description: "Description for Sensor 1",
                unit: "C",
                variable: "temperature",
                measurements: undefined,
                gateway: {
                    id: 1,
                    name: "Gateway 5",
                    macAddress: "AA:BB:CC:DD:EE:FF",
                    description: "Gateway numero 5",
                    sensors: undefined,
                    network: {
                        id: 1,
                        name: "Rete 1",
                        code: "NET01",
                        description: "Rete Network 1",
                        gateways: undefined,
                    },
                },
            },

        ];

        const sensor = await repo.getSensorByMacAddress(
            network.code,
            gateway.macAddress,
            "00:11:22:33:44:55"
        );


        expect(sensor).toEqual(expectedSensors[0]);

    });

    it("should throw NotFoundError if sensor not found by macAddress", async () => {

        const network = FAKE_DATA.FAKE_NETWORKS[0];
        const gateway = FAKE_DATA.FAKE_GATEWAYS[0];

        await expect(repo.getSensorByMacAddress(
            network.code,
            gateway.macAddress,
            "00:11:22:33:44:66"
        )).rejects.toThrow(NotFoundError);

    });

});

describe("SensorRepository: createSensor", () => {

    const repo = new SensorRepository();

    it("should create a new Sensor ", async () => {

        const sensorDto = {
            macAddress: "11:22:33:44:55:66",
            name: "New Sensor",
            description: "This is a new sensor",
            variable: "humidity",
            unit: "percentage"
        };

        const network = FAKE_DATA.FAKE_NETWORKS[0];
        const gateway = FAKE_DATA.FAKE_GATEWAYS[0];

        const createdSensor = await repo.createSensor(
            network.code,
            gateway.macAddress,
            sensorDto
        );

        expect(createdSensor).toEqual({
            ...sensorDto,
            id: expect.any(Number),
            gateway: {
                id: gateway.id,
                macAddress: gateway.macAddress,
                name: gateway.name,
                description: gateway.description,
                network: {
                    id: network.id,
                    code: network.code,
                    name: network.name,
                    description: network.description
                }
            }
        });
    });

    it("should create a new Sensor with empty optional fields", async () => {

        const sensorDto = {
            macAddress: "11:22:33:44:55:66",
        };

        const network = FAKE_DATA.FAKE_NETWORKS[0];
        const gateway = FAKE_DATA.FAKE_GATEWAYS[0];

        const createdSensor = await repo.createSensor(
            network.code,
            gateway.macAddress,
            sensorDto
        );

        expect(createdSensor).toMatchObject({
            ...sensorDto,
            id: expect.any(Number),
            gateway: {
                id: gateway.id,
                macAddress: gateway.macAddress,
                name: gateway.name,
                description: gateway.description,
                network: {
                    id: network.id,
                    code: network.code,
                    name: network.name,
                    description: network.description
                }
            }
        });
    });

    it("should throw ConflictError if sensor with same macAddress already exists", async () => {

        const sensorDto = {
            macAddress: "00:11:22:33:44:55",
            name: "Duplicate Sensor",
            description: "This sensor already exists",
            variable: "temperature",
            unit: "Celsius"
        };

        const network = FAKE_DATA.FAKE_NETWORKS[0];
        const gateway = FAKE_DATA.FAKE_GATEWAYS[0];

        await expect(repo.createSensor(
            network.code,
            gateway.macAddress,
            sensorDto
        )).rejects.toThrow(ConflictError);
    });

    it("should throw NotFoundError if gateway not found", async () => {

        const sensorDto = {
            macAddress: "11:22:33:44:55:66",
            name: "New Sensor",
            description: "This is a new sensor",
            variable: "humidity",
            unit: "percentage"
        };

        await expect(repo.createSensor(
            "NET01",
            "FF:EE:DD:CC:BB:AA", // Non-existent gateway
            sensorDto
        )).rejects.toThrow(NotFoundError);
    });

});

describe("SensorRepository: updateSensor", () => {

    const repo = new SensorRepository();

    it("should update the Sensor", async () => {
        const network = FAKE_DATA.FAKE_NETWORKS[0];
        const gateway = FAKE_DATA.FAKE_GATEWAYS[0];
        const existingSensor = FAKE_DATA.FAKE_SENSORS[0];

        const updates = {
            name: "Updated Sensor Name",
            description: "Updated description",
            variable: "pressure",
            unit: "Pa",
        };

        await repo.updateSensor(
            network.code,
            gateway.macAddress,
            existingSensor.macAddress,
            updates
        );

        const updatedSensor = await repo.getSensorByMacAddress(
            network.code,
            gateway.macAddress,
            existingSensor.macAddress
        );

        expect(updatedSensor).toEqual({
            ...existingSensor,
            ...updates,
            gateway: {
                ...gateway,
                sensors: undefined,
                network: {
                    ...network,
                    gateways: undefined,
                },
            },
            measurements: undefined,
        });
    });

    it("should update the Sensor with new macAddress", async () => {
        const network = FAKE_DATA.FAKE_NETWORKS[0];
        const gateway = FAKE_DATA.FAKE_GATEWAYS[0];
        const existingSensor = FAKE_DATA.FAKE_SENSORS[0];

        const updates = {
            macAddress: "FF:CA:AC:FF:10:10"
        };

        await repo.updateSensor(
            network.code,
            gateway.macAddress,
            existingSensor.macAddress,
            updates
        );

        const updatedSensor = await repo.getSensorByMacAddress(
            network.code,
            gateway.macAddress,
            updates.macAddress
        );

        expect(updatedSensor).toEqual({
            ...existingSensor,
            ...updates,
            gateway: {
                ...gateway,
                sensors: undefined,
                network: {
                    ...network,
                    gateways: undefined,
                },
            },
            measurements: undefined,
        });
    });

    it("should throw ConflictError if macAddress is updated to an existing one", async () => {
        const network = FAKE_DATA.FAKE_NETWORKS[0];
        const gateway = FAKE_DATA.FAKE_GATEWAYS[0];
        const existingSensor = FAKE_DATA.FAKE_SENSORS[0];
        const conflictingSensor = FAKE_DATA.FAKE_SENSORS[1];

        const updates = {
            macAddress: conflictingSensor.macAddress,
        };

        await expect(
            repo.updateSensor(
                network.code,
                gateway.macAddress,
                existingSensor.macAddress,
                updates
            )
        ).rejects.toThrow(ConflictError);
    });

    it("should throw NotFoundError if the sensor does not exist", async () => {
        const network = FAKE_DATA.FAKE_NETWORKS[0];
        const gateway = FAKE_DATA.FAKE_GATEWAYS[0];

        const updates = {
            name: "Non-existent Sensor",
        };

        await expect(
            repo.updateSensor(
                network.code,
                gateway.macAddress,
                "00:00:00:00:00:00", // Non-existent macAddress
                updates
            )
        ).rejects.toThrow(NotFoundError);
    });
});

describe("SensorRepository: deleteSensor", () => {

    const repo = new SensorRepository();

    it("should delete the sensor", async () => {

        const network = FAKE_DATA.FAKE_NETWORKS[0];
        const gateway = FAKE_DATA.FAKE_GATEWAYS[0];
        const existingSensor = FAKE_DATA.FAKE_SENSORS[0];

        await repo.deleteSensor(
            network.code,
            gateway.macAddress,
            existingSensor.macAddress
        );

        await expect(repo.getSensorByMacAddress(
            network.code,
            gateway.macAddress,
            existingSensor.macAddress
        )).rejects.toThrow(NotFoundError);

    });

    it("should throw NotFoundError if the sensor does not exist", async () => {

        const network = FAKE_DATA.FAKE_NETWORKS[0];
        const gateway = FAKE_DATA.FAKE_GATEWAYS[0];

        await expect(repo.deleteSensor(
            network.code,
            gateway.macAddress,
            "00:00:00:00:00:00" // Non-existent macAddress
        )).rejects.toThrow(NotFoundError);
    });

    it("should throw NotFoundError if the gateway does not exist", async () => {

        const network = FAKE_DATA.FAKE_NETWORKS[0];

        await expect(repo.deleteSensor(
            network.code,
            "FF:EE:DD:CC:BB:AA", // Non-existent gateway
            "00:11:22:33:44:55"
        )).rejects.toThrow(NotFoundError);
    });

    it("should throw NotFoundError if the network does not exist", async () => {
        const gateway = FAKE_DATA.FAKE_GATEWAYS[0];

        await expect(repo.deleteSensor(
            "NON_EXISTENT_NETWORK",
            gateway.macAddress,
            "00:11:22:33:44:55"
        )).rejects.toThrow(NotFoundError);
    });

});