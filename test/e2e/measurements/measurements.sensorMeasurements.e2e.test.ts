import request from "supertest";
import { app } from "@app";
import { generateToken } from "@services/authService";
import { beforeAllE2e, afterAllE2e, TEST_USERS, TEST_NETWORKS, TEST_GATEWAYS, TEST_SENSORS, TEST_MEASUREMENTS } from "@test/e2e/lifecycle";

describe('GET /networks/{networkCode}/gateways/{gatewayMac}/sensors/{sensorMac}/measurements (e2e)', () => {
    let token: string;

    beforeAll(async () => {
        await beforeAllE2e();
        token = generateToken(TEST_USERS.admin);
    });

    afterAll(async () => {
        await afterAllE2e();
    });

    it('measurements for specific sensor without date filters', async () => {
        const response = await request(app)
            .get(`/api/v1/networks/${TEST_NETWORKS.network_1.code}/gateways/${TEST_GATEWAYS.gate1_net1.macAddress}/sensors/${TEST_SENSORS.sensor1_gate1_net1.macAddress}/measurements`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(response.body).toHaveProperty('sensorMacAddress', TEST_SENSORS.sensor1_gate1_net1.macAddress);
        expect(response.body).toHaveProperty('stats');
        expect(response.body).toHaveProperty('measurements');

        expect(response.body.measurements).toHaveLength(3);

        const sortedMeasurements = response.body.measurements.sort((a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        const expectedMeasurements = [
            { value: 22.5, createdAt: "2025-05-29T10:00:00+02:00" },
            { value: 22.7, createdAt: "2025-05-29T10:05:00+02:00" },
            { value: 23.0, createdAt: "2025-05-29T10:10:00+02:00" }
        ];

        sortedMeasurements.forEach((measurement, index) => {
            expect(measurement.value).toBeCloseTo(expectedMeasurements[index].value);
            expect(new Date(measurement.createdAt).toISOString()).toBe(
                new Date(expectedMeasurements[index].createdAt).toISOString()
            );
            expect(measurement).toHaveProperty('isOutlier');
        });

        const expectedMean = (22.5 + 22.7 + 23.0) / 3;
        expect(response.body.stats.mean).toBeCloseTo(expectedMean, 2);

        const variance = expectedMeasurements.reduce((sum, measurement) => {
            return sum + Math.pow(measurement.value - expectedMean, 2);
        }, 0) / expectedMeasurements.length;

        expect(response.body.stats.variance).toBeCloseTo(variance, 2);

        const standardDeviation = Math.sqrt(variance);
        const expectedUpperThreshold = expectedMean + 2 * standardDeviation;
        const expectedLowerThreshold = expectedMean - 2 * standardDeviation;

        expect(response.body.stats.upperThreshold).toBeCloseTo(expectedUpperThreshold, 2);
        expect(response.body.stats.lowerThreshold).toBeCloseTo(expectedLowerThreshold, 2);
    });

    it('measurements with startDate filter', async () => {


        const response = await request(app)
            .get(`/api/v1/networks/${TEST_NETWORKS.network_1.code}/gateways/${TEST_GATEWAYS.gate1_net1.macAddress}/sensors/${TEST_SENSORS.sensor1_gate1_net1.macAddress}/measurements`)
            .query({ startDate: TEST_MEASUREMENTS.meas2_sensor1_gate1_net1.createdAt.toISOString() })
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(response.body.measurements).toHaveLength(2);

        response.body.measurements.forEach(measurement => {
            const measurementDate = new Date(measurement.createdAt);
            const filterDate = new Date(TEST_MEASUREMENTS.meas2_sensor1_gate1_net1.createdAt);
            expect(measurementDate >= filterDate).toBe(true);
        });
    });

    it('measurements with endDate filter', async () => {


        const response = await request(app)
            .get(`/api/v1/networks/${TEST_NETWORKS.network_1.code}/gateways/${TEST_GATEWAYS.gate1_net1.macAddress}/sensors/${TEST_SENSORS.sensor1_gate1_net1.macAddress}/measurements`)
            .query({ endDate: TEST_MEASUREMENTS.meas2_sensor1_gate1_net1.createdAt.toISOString() })
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(response.body.measurements).toHaveLength(2);

        response.body.measurements.forEach(measurement => {
            const measurementDate = new Date(measurement.createdAt);
            const filterDate = new Date(TEST_MEASUREMENTS.meas2_sensor1_gate1_net1.createdAt);
            expect(measurementDate <= filterDate).toBe(true);
        });
    });

    it('measurements with both startDate and endDate', async () => {
        const startDate = TEST_MEASUREMENTS.meas1_sensor1_gate1_net2.createdAt.toISOString();
        const endDate = TEST_MEASUREMENTS.meas2_sensor1_gate1_net2.createdAt.toISOString();

        const response = await request(app)
            .get(`/api/v1/networks/${TEST_NETWORKS.network_2.code}/gateways/${TEST_GATEWAYS.gate1_net2.macAddress}/sensors/${TEST_SENSORS.sensor1_gate1_net2.macAddress}/measurements`)
            .query({ startDate, endDate })
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(response.body.measurements).toHaveLength(2);

        response.body.measurements.forEach(measurement => {
            const measurementDate = new Date(measurement.createdAt);
            const start = new Date(TEST_MEASUREMENTS.meas1_sensor1_gate1_net2.createdAt);
            const end = new Date(TEST_MEASUREMENTS.meas2_sensor1_gate1_net2.createdAt);
            expect(measurementDate >= start && measurementDate <= end).toBe(true);
        });
    });

    it('no measurements when date range has no data', async () => {
        const futureStartDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // domani
        const futureEndDate = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(); // dopodomani

        const response = await request(app)
            .get(`/api/v1/networks/${TEST_NETWORKS.network_1.code}/gateways/${TEST_GATEWAYS.gate1_net1.macAddress}/sensors/${TEST_SENSORS.sensor1_gate1_net1.macAddress}/measurements`)
            .query({
                startDate: futureStartDate,
                endDate: futureEndDate
            })
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(response.body).not.toHaveProperty('measurements');
        expect(response.body).toHaveProperty('stats');
    });

    it('network not found - 404', async () => {
        const response = await request(app)
            .get(`/api/v1/networks/NONEXISTENT/gateways/${TEST_GATEWAYS.gate1_net1.macAddress}/sensors/${TEST_SENSORS.sensor1_gate1_net1.macAddress}/measurements`)
            .set('Authorization', `Bearer ${token}`)
            .expect(404);

        expect(response.body).toHaveProperty('code');
        expect(response.body.code).toBe(404);

        expect(response.body).toHaveProperty('name', 'NotFoundError');
    });

    it('gateway not found - 404', async () => {
        const response = await request(app)
            .get(`/api/v1/networks/${TEST_NETWORKS.network_1.code}/gateways/FF:FF:FF:FF:FF:FF/sensors/${TEST_SENSORS.sensor1_gate1_net1.macAddress}/measurements`)
            .set('Authorization', `Bearer ${token}`)
            .expect(404);

        expect(response.body).toHaveProperty('code');
        expect(response.body.code).toBe(404);
    });

    it('sensor not found - 404', async () => {
        const response = await request(app)
            .get(`/api/v1/networks/${TEST_NETWORKS.network_1.code}/gateways/${TEST_GATEWAYS.gate1_net1.macAddress}/sensors/FF:FF:FF:FF:FF:FF/measurements`)
            .set('Authorization', `Bearer ${token}`)
            .expect(404);

        expect(response.body).toHaveProperty('code');
        expect(response.body.code).toBe(404);
    });

    it('unauthorized - invalid token - 401', async () => {
        const response = await request(app)
            .get(`/api/v1/networks/${TEST_NETWORKS.network_1.code}/gateways/${TEST_GATEWAYS.gate1_net1.macAddress}/sensors/${TEST_SENSORS.sensor1_gate1_net1.macAddress}/measurements`)
            .set('Authorization', 'Bearer invalid-token')
            .expect(401);

        expect(response.body).toHaveProperty('code');
        expect(response.body.code).toBe(401);
    });

    it('unauthorized - missing token - 401', async () => {
        const response = await request(app)
            .get(`/api/v1/networks/${TEST_NETWORKS.network_1.code}/gateways/${TEST_GATEWAYS.gate1_net1.macAddress}/sensors/${TEST_SENSORS.sensor1_gate1_net1.macAddress}/measurements`)
            .expect(401);

        expect(response.body).toHaveProperty('code');
        expect(response.body.code).toBe(401);
    });

    it('bad request - invalid startDate format - 400', async () => {
        const response = await request(app)
            .get(`/api/v1/networks/${TEST_NETWORKS.network_1.code}/gateways/${TEST_GATEWAYS.gate1_net1.macAddress}/sensors/${TEST_SENSORS.sensor1_gate1_net1.macAddress}/measurements`)
            .query({ startDate: 'invalid-date-format' })
            .set('Authorization', `Bearer ${token}`)
            .expect(400);

        expect(response.body).toHaveProperty('code');
        expect(response.body.code).toBe(400);
    });

    it('bad request - invalid endDate format - 400', async () => {
        const response = await request(app)
            .get(`/api/v1/networks/${TEST_NETWORKS.network_1.code}/gateways/${TEST_GATEWAYS.gate1_net1.macAddress}/sensors/${TEST_SENSORS.sensor1_gate1_net1.macAddress}/measurements`)
            .query({ endDate: 'invalid-date-format' })
            .set('Authorization', `Bearer ${token}`)
            .expect(400);

        expect(response.body).toHaveProperty('code');
        expect(response.body.code).toBe(400);
    });

    it('correct outlier detection', async () => {
        const response = await request(app)
            .get(`/api/v1/networks/${TEST_NETWORKS.network_2.code}/gateways/${TEST_GATEWAYS.gate1_net2.macAddress}/sensors/${TEST_SENSORS.sensor1_gate1_net2.macAddress}/measurements`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        const { stats, measurements } = response.body;

        measurements.forEach(measurement => {
            const isOutsideThreshold = measurement.value > stats.upperThreshold ||
                measurement.value < stats.lowerThreshold;
            expect(measurement.isOutlier).toBe(isOutsideThreshold);
        });
    });

    it('verify stats date range in response', async () => {
        const startDate = TEST_MEASUREMENTS.meas1_sensor1_gate1_net1.createdAt.toISOString();
        const endDate = TEST_MEASUREMENTS.meas2_sensor1_gate1_net1.createdAt.toISOString();

        const response = await request(app)
            .get(`/api/v1/networks/${TEST_NETWORKS.network_1.code}/gateways/${TEST_GATEWAYS.gate1_net1.macAddress}/sensors/${TEST_SENSORS.sensor1_gate1_net1.macAddress}/measurements`)
            .query({ startDate, endDate })
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(response.body.stats).toHaveProperty('startDate');
        expect(response.body.stats).toHaveProperty('endDate');

        const statsStartDate = new Date(response.body.stats.startDate);
        const statsEndDate = new Date(response.body.stats.endDate);
        const queryStartDate = new Date(TEST_MEASUREMENTS.meas1_sensor1_gate1_net1.createdAt);
        const queryEndDate = new Date(TEST_MEASUREMENTS.meas2_sensor1_gate1_net1.createdAt);

        expect(statsStartDate.getTime()).toBe(queryStartDate.getTime());
        expect(statsEndDate.getTime()).toBe(queryEndDate.getTime());
    });
});