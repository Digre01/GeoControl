import * as measurementController from "@controllers/measurementController";
import { MeasurementDAO } from "@models/dao/MeasurementDAO";
import { FAKE_DATA } from "@test/fakeDataDAO/fakeDataDAOforMeasurements";
import { Measurement as MeasurementDTO } from "@models/dto/Measurement";
import { Stats as StatsDTO } from "@models/dto/Stats";
import { Measurements as MeasurementsDTO } from "@models/dto/Measurements";
import { NotFoundError } from "@models/errors/NotFoundError";
import { initializeTestDataSource, closeTestDataSource } from "@test/setup/test-datasource";
import { createFakeGateways, createFakeMeasurement, createFakeNetworks, createFakeSensors } from "@test/fakeDataDAO/createFakeData";
import { cleanMeasurementsDTO, cleanStatsIfIsNaN, computeStats } from "@test/measurementsTestHelper";


beforeEach(async () => {
    await initializeTestDataSource();
    await createFakeNetworks(FAKE_DATA.FAKE_NETWORKS);
    await createFakeGateways(FAKE_DATA.FAKE_GATEWAYS);
    await createFakeSensors(FAKE_DATA.FAKE_SENSORS);
    await createFakeMeasurement(FAKE_DATA.FAKE_MEASUREMENTS);
});

afterEach(async () => {
    await closeTestDataSource();
})



describe("MeasurementController mapperService+statsService+repository integration", () => {

    it("create Measurement mapperService+statsService+repository integration", async () => {
        let fakeNetwork = FAKE_DATA.FAKE_NETWORKS[1];
        let fakeGateway = fakeNetwork.gateways[0];
        let fakeSensor = fakeGateway.sensors[0];

        let fakeMeasurementDTO: MeasurementDTO = {
            createdAt: new Date("2025-02-18T16:00:00Z"),
            value: 234,
            isOutlier: false
        }
        await expect(
            measurementController.createMeasurement(fakeNetwork.code, fakeGateway.macAddress, fakeSensor.macAddress, fakeMeasurementDTO)
        ).resolves.toBeUndefined();

        const result = await measurementController.getSensorMeasurements(fakeNetwork.code, fakeGateway.macAddress, fakeSensor.macAddress)
        expect(result.measurements).toContainEqual(fakeMeasurementDTO);

        await expect(
            measurementController.createMeasurement(fakeNetwork.code, fakeGateway.macAddress, "notMac", fakeMeasurementDTO)
        ).rejects.toThrow(NotFoundError);
    });

    it("get sensor Measurements mapperService+statsService+repository integration", async () => {

        let fakeNetwork = FAKE_DATA.FAKE_NETWORKS[1];
        let fakeGateway = fakeNetwork.gateways[1];
        let fakeSensor = fakeGateway.sensors[1];


        const mockMeasurementsDAO: MeasurementDAO[] = fakeSensor.measurements;

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
            sensorMacAddress: fakeSensor.macAddress,
            measurements: expectedMeasurementWithOutliers,
            stats: expectedStats
        };



        const result = await measurementController.getSensorMeasurements(fakeNetwork.code, fakeGateway.macAddress, fakeSensor.macAddress);
        expect(result).toEqual(expectedResult);

        await expect(
            measurementController.getSensorMeasurements(fakeNetwork.code, fakeGateway.macAddress, "notMac")
        ).rejects.toThrow(NotFoundError);

    });


    it("get network Measurements mapperService+statsService+repository integration", async () => {

        let fakeNetwork = FAKE_DATA.FAKE_NETWORKS[1];

        let fakeGatewayA = fakeNetwork.gateways[1];
        let fakeSensorA = fakeGatewayA.sensors[1];
        const mockMeasurementsSensorA: MeasurementDAO[] = fakeSensorA.measurements;

        let fakeGatewayB = fakeNetwork.gateways[1];
        let fakeSensorB = fakeGatewayB.sensors[0];
        const mockMeasurementsSensorB: MeasurementDAO[] = fakeSensorB.measurements;

        let fakeGatewayC = fakeNetwork.gateways[0];
        let fakeSensorC = fakeGatewayC.sensors[0];
        const mockMeasurementsSensorC: MeasurementDAO[] = fakeSensorC.measurements;

        const mockMeasurementsDAO: { sensorMacAddress: string, measurements: MeasurementDAO[] }[] = [
            { sensorMacAddress: fakeSensorA.macAddress, measurements: mockMeasurementsSensorA },
            { sensorMacAddress: fakeSensorB.macAddress, measurements: mockMeasurementsSensorB },
            { sensorMacAddress: fakeSensorC.macAddress, measurements: mockMeasurementsSensorC },
        ];

        const measurementADTO: MeasurementDTO[] = mockMeasurementsDAO[0].measurements.map(m => ({ createdAt: m.createdAt, value: m.value }));
        const measurementAWithOutlierDTO: MeasurementDTO[] = measurementADTO.map(m => ({ ...m, isOutlier: false }));

        const measurementBDTO: MeasurementDTO[] = mockMeasurementsDAO[1].measurements.map(m => ({ createdAt: m.createdAt, value: m.value }));
        const measurementBWithOutlierDTO: MeasurementDTO[] = measurementBDTO.map(m => ({ ...m, isOutlier: false }));

        const measurementCDTO: MeasurementDTO[] = mockMeasurementsDAO[2].measurements.map(m => ({ createdAt: m.createdAt, value: m.value }));
        const measurementCWithOutlierDTO: MeasurementDTO[] = measurementCDTO.map(m => ({ ...m, isOutlier: false }));

        const statsA = computeStats(mockMeasurementsSensorA.map(m => m.value));
        const statsB = computeStats(mockMeasurementsSensorB.map(m => m.value));
        const statsC = computeStats(mockMeasurementsSensorC.map(m => m.value));


        const expectedStatsA: StatsDTO = { ...statsA };
        const expectedStatsB: StatsDTO = { ...statsB };
        const expectedStatsC: StatsDTO = { ...statsC };


        const mockFinalMeasurementsADTO: MeasurementsDTO = {
            measurements: measurementAWithOutlierDTO,
            stats: expectedStatsA,
            sensorMacAddress: fakeSensorA.macAddress
        }

        const mockFinalMeasurementsBDTO: MeasurementsDTO = {
            measurements: measurementBWithOutlierDTO,
            stats: expectedStatsB,
            sensorMacAddress: fakeSensorB.macAddress
        }

        const mockFinalMeasurementsCDTO: MeasurementsDTO = {
            measurements: measurementCWithOutlierDTO,
            stats: expectedStatsC,
            sensorMacAddress: fakeSensorC.macAddress
        }
        const mockFinalMeasurementsDTO: MeasurementsDTO[] = [
            mockFinalMeasurementsADTO,
            mockFinalMeasurementsBDTO,
            mockFinalMeasurementsCDTO
        ].map(cleanMeasurementsDTO);



        const result = await measurementController.getNetworkMeasurements(fakeNetwork.code);
        expect(result).toEqual(expect.arrayContaining(mockFinalMeasurementsDTO));

        await expect(
            measurementController.getNetworkMeasurements("fakeCode")
        ).rejects.toThrow(NotFoundError);
    });



    it("get sensor Stats mapperService+statsService+repository integration", async () => {
        let fakeNetwork = FAKE_DATA.FAKE_NETWORKS[1];
        let fakeGateway = fakeNetwork.gateways[1];
        let fakeSensor = fakeGateway.sensors[1];


        const mockMeasurementsDAO: MeasurementDAO[] = fakeSensor.measurements;

        const values = mockMeasurementsDAO.map(m => m.value);
        const stats = computeStats(values);
        const expectedStats: StatsDTO = { ...stats };


        const result = await measurementController.getSensorStats(fakeNetwork.code, fakeGateway.macAddress, fakeSensor.macAddress);

        expect(result).toEqual(expectedStats);

        await expect(
            measurementController.getSensorMeasurements(fakeNetwork.code, fakeGateway.macAddress, "notMac")
        ).rejects.toThrow(NotFoundError);

    });


    it("get network Stats mapperService+statsService+repository integration", async () => {
        let fakeNetwork = FAKE_DATA.FAKE_NETWORKS[1];

        let fakeGatewayA = fakeNetwork.gateways[1];
        let fakeSensorA = fakeGatewayA.sensors[1];
        const mockMeasurementsSensorA: MeasurementDAO[] = fakeSensorA.measurements;

        let fakeGatewayB = fakeNetwork.gateways[1];
        let fakeSensorB = fakeGatewayB.sensors[0];
        const mockMeasurementsSensorB: MeasurementDAO[] = fakeSensorB.measurements;

        let fakeGatewayC = fakeNetwork.gateways[0];
        let fakeSensorC = fakeGatewayC.sensors[0];
        const mockMeasurementsSensorC: MeasurementDAO[] = fakeSensorC.measurements;



        const statsA = computeStats(mockMeasurementsSensorA.map(m => m.value));
        const statsB = computeStats(mockMeasurementsSensorB.map(m => m.value));
        const statsC = computeStats(mockMeasurementsSensorC.map(m => m.value));


        const expectedStatsA: StatsDTO = { ...statsA };
        const expectedStatsB: StatsDTO = { ...statsB };
        const expectedStatsC: StatsDTO = { ...statsC };


        const mockFinalMeasurementsADTO: MeasurementsDTO = {
            stats: expectedStatsA,
            sensorMacAddress: fakeSensorA.macAddress
        }

        const mockFinalMeasurementsBDTO: MeasurementsDTO = {
            stats: expectedStatsB,
            sensorMacAddress: fakeSensorB.macAddress
        }

        const mockFinalMeasurementsCDTO: MeasurementsDTO = {
            stats: expectedStatsC,
            sensorMacAddress: fakeSensorC.macAddress
        }
        const mockFinalMeasurementsDTO: MeasurementsDTO[] = [
            mockFinalMeasurementsADTO,
            mockFinalMeasurementsBDTO,
            mockFinalMeasurementsCDTO,
        ].map(cleanStatsIfIsNaN);

        const result = await measurementController.getNetworkStats(fakeNetwork.code);
        expect(result).toEqual(expect.arrayContaining(mockFinalMeasurementsDTO));

        await expect(
            measurementController.getNetworkStats("fakeCode")
        ).rejects.toThrow(NotFoundError);
    });


    it("get sensor Outliers mapperService+statsService+repository integration", async () => {
        let fakeNetwork = FAKE_DATA.FAKE_NETWORKS[1];
        let fakeGateway = fakeNetwork.gateways[1];
        let fakeSensor = fakeGateway.sensors[1];


        const mockMeasurementsDAO: MeasurementDAO[] = fakeSensor.measurements;


        const values = mockMeasurementsDAO.map(m => m.value);
        const stats = computeStats(values);
        const expectedStats: StatsDTO = { ...stats };


        const expectedResult: MeasurementsDTO = {
            sensorMacAddress: fakeSensor.macAddress,
            stats: expectedStats
        };


        const result = await measurementController.getSensorOutliers(fakeNetwork.code, fakeGateway.macAddress, fakeSensor.macAddress);

        expect(result).toEqual(expectedResult);

    });


    it("get network Outliers mapperService+statsService+repository integration", async () => {

        let fakeNetwork = FAKE_DATA.FAKE_NETWORKS[1];

        let fakeGatewayA = fakeNetwork.gateways[1];
        let fakeSensorA = fakeGatewayA.sensors[1];
        const mockMeasurementsSensorA: MeasurementDAO[] = fakeSensorA.measurements;

        let fakeGatewayB = fakeNetwork.gateways[1];
        let fakeSensorB = fakeGatewayB.sensors[0];
        const mockMeasurementsSensorB: MeasurementDAO[] = fakeSensorB.measurements;

        let fakeGatewayC = fakeNetwork.gateways[0];
        let fakeSensorC = fakeGatewayC.sensors[0];
        const mockMeasurementsSensorC: MeasurementDAO[] = fakeSensorC.measurements;



        const statsA = computeStats(mockMeasurementsSensorA.map(m => m.value));
        const statsB = computeStats(mockMeasurementsSensorB.map(m => m.value));
        const statsC = computeStats(mockMeasurementsSensorC.map(m => m.value));


        const expectedStatsA: StatsDTO = { ...statsA };
        const expectedStatsB: StatsDTO = { ...statsB };
        const expectedStatsC: StatsDTO = { ...statsC };


        const mockFinalMeasurementsADTO: MeasurementsDTO = {
            stats: expectedStatsA,
            sensorMacAddress: fakeSensorA.macAddress
        }

        const mockFinalMeasurementsBDTO: MeasurementsDTO = {
            stats: expectedStatsB,
            sensorMacAddress: fakeSensorB.macAddress
        }

        const mockFinalMeasurementsCDTO: MeasurementsDTO = {
            stats: expectedStatsC,
            sensorMacAddress: fakeSensorC.macAddress
        }
        const mockFinalMeasurementsDTO: MeasurementsDTO[] = [
            mockFinalMeasurementsADTO,
            mockFinalMeasurementsBDTO,
            mockFinalMeasurementsCDTO,
        ].map(cleanStatsIfIsNaN);

        const result = await measurementController.getNetworkOutliers(fakeNetwork.code);

        expect(result).toEqual(expect.arrayContaining(mockFinalMeasurementsDTO));

    });

});