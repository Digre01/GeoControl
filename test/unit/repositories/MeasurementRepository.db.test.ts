import { MeasurementRepository } from "@repositories/MeasurementRepository";
import {
    initializeTestDataSource,
    closeTestDataSource,
    TestDataSource
} from "@test/setup/test-datasource";
import { MeasurementDAO } from "@models/dao/MeasurementDAO";
import { NotFoundError } from "@models/errors/NotFoundError";
import { createFakeSensors, createFakeGateways, createFakeMeasurement, createFakeNetworks } from "../../fakeDataDAO/createFakeData";
import { FAKE_DATA as FAKE_DATA_MEAS } from "../../fakeDataDAO/fakeDataDAOforMeasurements";
import { Measurement as MeasurementDTO } from "@dto/Measurement";




beforeEach(async () => {
    await initializeTestDataSource();
    await createFakeNetworks(FAKE_DATA_MEAS.FAKE_NETWORKS);
    await createFakeGateways(FAKE_DATA_MEAS.FAKE_GATEWAYS);
    await createFakeSensors(FAKE_DATA_MEAS.FAKE_SENSORS);
    await createFakeMeasurement(FAKE_DATA_MEAS.FAKE_MEASUREMENTS);
});

afterEach(async () => {
    await TestDataSource.getRepository(MeasurementDAO).clear();
    await closeTestDataSource();
});

describe("MeasurementRepository: getSensorMeasurements", () => {
    const repo = new MeasurementRepository();

    it("get all sensor measurements", async () => {

        let network = FAKE_DATA_MEAS.FAKE_NETWORKS[1];
        let gateway = network.gateways[0];
        let sensor = gateway.sensors[0];

        let expectedMeasurementIds = sensor.measurements.map(m => m.id);

        let measurements = await repo.getSensorMeasurements(
            network.code,
            gateway.macAddress,
            sensor.macAddress
        );
        expect(measurements).toHaveLength(expectedMeasurementIds.length);
        expect(measurements.map(m => m.id)).toEqual(expectedMeasurementIds);
    });

    it("get sensor measurements from a non-existent sensor", async () => {

        let network = FAKE_DATA_MEAS.FAKE_NETWORKS[1];
        let gateway = network.gateways[0];

        await expect(repo.getSensorMeasurements(
            network.code,
            gateway.macAddress,
            "12:12:12:23:23:43"
        )).rejects.toThrow(NotFoundError);
    });

    it("get sensor measurements from a non-existent gateway", async () => {

        let network = FAKE_DATA_MEAS.FAKE_NETWORKS[1];
        let gateway = network.gateways[0];
        let sensor = gateway.sensors[0];

        await expect(repo.getSensorMeasurements(
            network.code,
            "12:44:BB:22:DD:00",
            sensor.macAddress
        )).rejects.toThrow(NotFoundError);
    });

    it("get sensor measurements up to an endDate", async () => {

        let network = FAKE_DATA_MEAS.FAKE_NETWORKS[1];
        let gateway = network.gateways[0];
        let sensor = gateway.sensors[0];

        let measurements = await repo.getSensorMeasurements(
            network.code,
            gateway.macAddress,
            sensor.macAddress,
            undefined,
            "2025-01-18T16:30:00Z"
        );
        expect(measurements).toHaveLength(2);
        expect(measurements.map(m => m.id)).toEqual(expect.arrayContaining([13, 14]))

    });

    it("get sensor measurements since a startDate", async () => {

        let network = FAKE_DATA_MEAS.FAKE_NETWORKS[1];
        let gateway = network.gateways[0];
        let sensor = gateway.sensors[0];

        let measurements = await repo.getSensorMeasurements(
            network.code,
            gateway.macAddress,
            sensor.macAddress,
            "2025-01-18T16:30:00Z",
            undefined
        );
        expect(measurements).toHaveLength(1);
        expect(measurements.map(m => m.id)).toContain(15)
    });

    it("get sensor measurements with invalid start date", async () => {

        let network = FAKE_DATA_MEAS.FAKE_NETWORKS[1];
        let gateway = network.gateways[0];
        let sensor = gateway.sensors[0];

        let expectedMeasurementIds = sensor.measurements.map(m => m.id);

        let measurements = await repo.getSensorMeasurements(
            network.code,
            gateway.macAddress,
            sensor.macAddress,
            "startDate"
        );
        expect(measurements).toHaveLength(expectedMeasurementIds.length);
        expect(measurements.map(m => m.id).sort()).toEqual(expectedMeasurementIds.sort());
    });

    it("get sensor measurements with end date older than start date", async () => {

        let network = FAKE_DATA_MEAS.FAKE_NETWORKS[1];
        let gateway = network.gateways[0];
        let sensor = gateway.sensors[0];

        let measurements = await repo.getSensorMeasurements(
            network.code,
            gateway.macAddress,
            sensor.macAddress,
            "2025-01-18T17:30:00Z",
            "2025-01-18T14:30:00Z"

        );
        expect(measurements).toHaveLength(0);
        expect(measurements).toEqual([]);
    });

    it("get sensor measurements with same start and end dates", async () => {

        let network = FAKE_DATA_MEAS.FAKE_NETWORKS[1];
        let gateway = network.gateways[0];
        let sensor = gateway.sensors[0];

        let measurements = await repo.getSensorMeasurements(
            network.code,
            gateway.macAddress,
            sensor.macAddress,
            "2025-01-18T16:00:00.000Z",
            "2025-01-18T16:00:00.000Z"

        );
        expect(measurements).toHaveLength(1);
        expect(measurements.map(m => m.id)).toContain(14);
    });

    it("get sensor measurements with empty date strings", async () => {

        let network = FAKE_DATA_MEAS.FAKE_NETWORKS[1];
        let gateway = network.gateways[0];
        let sensor = gateway.sensors[0];

        let expectedMeasurementIds = sensor.measurements.map(m => m.id);

        let measurements = await repo.getSensorMeasurements(
            network.code,
            gateway.macAddress,
            sensor.macAddress,
            "",
            ""
        );
        expect(measurements).toHaveLength(expectedMeasurementIds.length);
        expect(measurements.map(m => m.id).sort()).toEqual(expectedMeasurementIds.sort());
    });

});

describe("MeasurementRepository: getNetworkMeasurements", () => {
    const repo = new MeasurementRepository();

    const simplifyMeasurement = (m: MeasurementDAO) => {
        return {
            id: m.id,
            createdAt: m.createdAt.toISOString(),
            value: m.value,
        };
    }

    it("get all network measurements", async () => {

        let network = FAKE_DATA_MEAS.FAKE_NETWORKS[1];
        let expectedData = network.gateways.flatMap(g => g.sensors).map(s => ({
            sensorMacAddress: s.macAddress,
            measurements: s.measurements
        }));

        let data = await repo.getNetworkMeasurements(
            network.code,
        );

        expect(data).toHaveLength(expectedData.length);
        expect(
            data.flatMap(d => d.measurements).map(simplifyMeasurement)
        ).toEqual(
            expect.arrayContaining(expectedData.flatMap(d => d.measurements).map(simplifyMeasurement))
        );
    });


    it("get network measurements from a non-existent network", async () => {
        await expect(repo.getNetworkMeasurements(
            "network code"
        )).rejects.toThrow(NotFoundError);
    });


    it("get network measurements up to an endDate", async () => {

        let network = FAKE_DATA_MEAS.FAKE_NETWORKS[1];

        let data = await repo.getNetworkMeasurements(
            network.code,
            undefined,
            undefined,
            "2025-01-18T16:30:00Z"
        );
        expect(data).toHaveLength(3);
        expect(
            data.flatMap(d => d.measurements).map(m => m.id)
        ).toEqual(
            expect.arrayContaining([13, 14])
        );
    });


    it("get network measurements up since a startDate", async () => {

        let network = FAKE_DATA_MEAS.FAKE_NETWORKS[1];

        let data = await repo.getNetworkMeasurements(
            network.code,
            undefined,
            "2025-01-18T16:30:00Z",
            undefined
        );
        expect(data).toHaveLength(3);
        expect(
            data.flatMap(d => d.measurements).map(m => m.id)
        ).toContain(15);
    });


    it("get network measurements with invalid start date", async () => {

        let network = FAKE_DATA_MEAS.FAKE_NETWORKS[1];

        let data = await repo.getNetworkMeasurements(
            network.code,
            undefined,
            "star",
            undefined
        );
        let expectedData = network.gateways.flatMap(g => g.sensors).map(s => ({
            sensorMacAddress: s.macAddress,
            measurements: s.measurements
        }));

        expect(data).toHaveLength(expectedData.length);
        expect(
            data.flatMap(d => d.measurements).map(simplifyMeasurement)
        ).toEqual(
            expect.arrayContaining(expectedData.flatMap(d => d.measurements).map(simplifyMeasurement))
        );
    });


    it("get network measurements with end date older than start date", async () => {

        let network = FAKE_DATA_MEAS.FAKE_NETWORKS[1];

        let data = await repo.getNetworkMeasurements(
            network.code,
            undefined,
            "2025-01-18T16:30:00Z",
            "2025-01-18T15:30:00Z"
        );

        expect(data).toHaveLength(3);
        expect(
            data.flatMap(d => d.measurements).map(simplifyMeasurement)
        ).toEqual(
            []
        );
    });


    it("get network measurements with same start and end dates", async () => {

        let network = FAKE_DATA_MEAS.FAKE_NETWORKS[1];

        let data = await repo.getNetworkMeasurements(
            network.code,
            undefined,
            "2025-01-18T16:30:00Z",
            "2025-01-18T16:30:00Z"
        );

        expect(data).toHaveLength(3);
        expect(
            data.flatMap(d => d.measurements).map(simplifyMeasurement)
        ).toEqual(
            []
        );

        data = await repo.getNetworkMeasurements(
            network.code,
            undefined,
            "2025-01-18T16:00:00Z",
            "2025-01-18T16:00:00Z"
        );

        expect(data).toHaveLength(3);
        expect(
            data.flatMap(d => d.measurements).map(m => m.id)
        ).toContain(
            14
        );
    });


    it("get network measurements with empty date strings", async () => {

        let network = FAKE_DATA_MEAS.FAKE_NETWORKS[1];
        let expectedData = network.gateways.flatMap(g => g.sensors).map(s => ({
            sensorMacAddress: s.macAddress,
            measurements: s.measurements
        }));

        let data = await repo.getNetworkMeasurements(
            network.code,
            undefined,
            "",
            ""
        );

        expect(data).toHaveLength(expectedData.length);
        expect(
            data.flatMap(d => d.measurements).map(simplifyMeasurement)
        ).toEqual(
            expect.arrayContaining(expectedData.flatMap(d => d.measurements).map(simplifyMeasurement))
        );
    });

    it("get network measurements of specific sensors", async () => {

        let network = FAKE_DATA_MEAS.FAKE_NETWORKS[1];

        let data = await repo.getNetworkMeasurements(
            network.code,
            ["AF:99:CF:DD:1E:04", "AF:10:CF:DD:1E:04"]
        );

        expect(data).toHaveLength(2);
        expect(
            data.flatMap(d => d.measurements).map(m => m.id)
        ).toContain(
            15
        );

    });

    it("get network measurements of specific sensors v2", async () => {

        let network = FAKE_DATA_MEAS.FAKE_NETWORKS[1];

        let data = await repo.getNetworkMeasurements(
            network.code,
            ["AF:99:CF:DD:1E:04", "AF:10:CF:DD:1E:04", "AF:10:CF:DD:1E:05"]
        );

        expect(data).toHaveLength(3);
        expect(
            data.flatMap(d => d.measurements).map(m => m.id)
        ).toEqual(
            expect.arrayContaining([15, 16, 17])
        );

    });

    it("get network measurements with one invalid sensor", async () => {

        let network = FAKE_DATA_MEAS.FAKE_NETWORKS[1];

        let data = await repo.getNetworkMeasurements(
            network.code,
            ["AF:99:CF:DD:1E:04", "invalido", "AF:10:CF:DD:1E:05"]
        );

        expect(data).toHaveLength(2);
        expect(data.map(s => s.sensorMacAddress)).toEqual(["AF:99:CF:DD:1E:04", "AF:10:CF:DD:1E:05"]);
        expect(
            data.flatMap(d => d.measurements).map(m => m.id)
        ).toEqual(
            expect.arrayContaining([15, 16, 17])
        );

    });

    it("get network measurements with all invalid sensors", async () => {

        let network = FAKE_DATA_MEAS.FAKE_NETWORKS[1];

        let data = await repo.getNetworkMeasurements(
            network.code,
            ["invalido2", "invalido", "invaliddd"]
        );

        expect(data).toHaveLength(0);
        expect(
            data.flatMap(d => d.measurements).map(m => m.id)
        ).toEqual(
            []
        );

    });

    it("get network measurements of a sensor without measurements", async () => {

        let network = FAKE_DATA_MEAS.FAKE_NETWORKS[1];

        let data = await repo.getNetworkMeasurements(
            network.code,
            ["AF:10:CF:DD:1E:04"]
        );

        expect(data).toHaveLength(1);
        expect(data.map(s => s.sensorMacAddress)).toEqual(["AF:10:CF:DD:1E:04"]);
        expect(
            data.flatMap(d => d.measurements).map(m => m.id)
        ).toEqual(
            []
        );

    });

});

describe("MeasurementRepository: createMeasurement", () => {
    const repo = new MeasurementRepository();

    it("create measurement", async () => {

        let measurement: MeasurementDTO = {
            createdAt: new Date("2025-02-18T16:00:00Z"),
            value: 21.85,
            isOutlier: false
        }
        let network = "NET04"
        let gatewayMac = "DD:BB:AA:CC:EE:FF"
        let sensorMac = "AF:10:CF:DD:1E:04"
        let measurementDaoRes = await repo.createMeasurement(network, gatewayMac, sensorMac, measurement)

        expect(measurementDaoRes).toMatchObject({
            value: 21.85,
            isOutlier: false
        })

        let found = await repo.getSensorMeasurements(network, gatewayMac, sensorMac);

        expect(found.map(m => m.id)).toContain(measurementDaoRes.id)

    });

    it("create measurement with non-existent sensor", async () => {

        let measurement: MeasurementDTO = {
            createdAt: new Date("2025-02-18T16:00:00Z"),
            value: 21.85,
            isOutlier: false
        }
        let network = "NET04"
        let gatewayMac = "DD:BB:AA:CC:EE:FF"
        let sensorMac = "invalid"

        await expect(
            repo.createMeasurement(network, gatewayMac, sensorMac, measurement)
        ).rejects.toThrow(NotFoundError);

    });

    it("create measurement with non-existent gateway", async () => {

        let measurement: MeasurementDTO = {
            createdAt: new Date("2025-02-18T16:00:00Z"),
            value: 21.85,
            isOutlier: false
        }
        let network = "NET04"
        let gatewayMac = "not"
        let sensorMac = "AF:10:CF:DD:1E:04"

        await expect(
            repo.createMeasurement(network, gatewayMac, sensorMac, measurement)
        ).rejects.toThrow(NotFoundError);

    });

    it("create measurement with non-existent network", async () => {

        let measurement: MeasurementDTO = {
            createdAt: new Date("2025-02-18T16:00:00Z"),
            value: 21.85,
            isOutlier: false
        }
        let network = "NET1023"
        let gatewayMac = "DD:BB:AA:CC:EE:FF"
        let sensorMac = "AF:10:CF:DD:1E:04"

        await expect(
            repo.createMeasurement(network, gatewayMac, sensorMac, measurement)
        ).rejects.toThrow(NotFoundError);

    });
});