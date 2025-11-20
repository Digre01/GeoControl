import request from "supertest";
import { app } from "@app";
import { generateToken } from "@services/authService";
import { beforeAllE2e, afterAllE2e, TEST_USERS, TEST_NETWORKS, TEST_MEASUREMENTS, TEST_SENSORS } from "@test/e2e/lifecycle";

describe('GET /networks/{networkCode}/stats (e2e)', () => {
    let token: string;

    beforeAll(async () => {
        await beforeAllE2e();
        token = generateToken(TEST_USERS.admin);
    });

    afterAll(async () => {
        await afterAllE2e();
    });

    it('retrieve statistics for network NET01', async () => {
        const response = await request(app)
            .get(`/api/v1/networks/${TEST_NETWORKS.network_1.code}/stats`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(response.body).toBeInstanceOf(Array);
        expect(response.body).toHaveLength(2);

        const sensorData = response.body[0];

        expect(sensorData).toHaveProperty('sensorMacAddress', TEST_SENSORS.sensor1_gate1_net1.macAddress);
        expect(sensorData).toHaveProperty('stats');
        expect(sensorData).not.toHaveProperty('measurements');

        const expectedMean = (22.5 + 22.7 + 23.0) / 3;
        expect(sensorData.stats.mean).toBeCloseTo(expectedMean, 2);

        const expectedMeasurements = [22.5, 22.7, 23.0];
        const variance = expectedMeasurements.reduce((sum, value) => {
            return sum + Math.pow(value - expectedMean, 2);
        }, 0) / expectedMeasurements.length;

        expect(sensorData.stats.variance).toBeCloseTo(variance, 2);

        const standardDeviation = Math.sqrt(variance);
        const expectedUpperThreshold = expectedMean + 2 * standardDeviation;
        const expectedLowerThreshold = expectedMean - 2 * standardDeviation;

        expect(sensorData.stats.upperThreshold).toBeCloseTo(expectedUpperThreshold, 2);
        expect(sensorData.stats.lowerThreshold).toBeCloseTo(expectedLowerThreshold, 2);
    });

    it('retrieve statistics for network NET02 with multiple sensors', async () => {
        const response = await request(app)
            .get(`/api/v1/networks/${TEST_NETWORKS.network_2.code}/stats`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(response.body).toBeInstanceOf(Array);
        expect(response.body).toHaveLength(4); // 4 sensori nella rete NET02

        const sensorMacs = response.body.map(s => s.sensorMacAddress).sort();
        const expectedSensorMacs = [
            TEST_SENSORS.sensor1_gate1_net2.macAddress,
            TEST_SENSORS.sensor2_gate1_net2.macAddress,
            TEST_SENSORS.sensor3_gate1_net2.macAddress,
            TEST_SENSORS.sensor1_gate2_net2.macAddress
        ].sort();
        expect(sensorMacs).toEqual(expectedSensorMacs);


        response.body.forEach(sensorData => {
            expect(sensorData).toHaveProperty('sensorMacAddress');
            expect(sensorData).not.toHaveProperty('measurements');
            if (sensorData.sensorMacAddress != TEST_SENSORS.sensor3_gate1_net2.macAddress && sensorData.sensorMacAddress != TEST_SENSORS.sensor1_gate2_net2.macAddress) {
                expect(sensorData).toHaveProperty('stats');
            } else {
                expect(sensorData).not.toHaveProperty('stats');
            }


        });
    });

    it('filter statistics by sensor MAC addresses', async () => {
        const sensorMacs = [
            TEST_SENSORS.sensor1_gate1_net2.macAddress,
            TEST_SENSORS.sensor2_gate1_net2.macAddress,
        ];

        const response = await request(app)
            .get(`/api/v1/networks/${TEST_NETWORKS.network_2.code}/stats`)
            .query({ sensorMacs: sensorMacs })
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(response.body).toHaveLength(2);
        const returnedMacs = response.body.map(s => s.sensorMacAddress).sort();
        expect(returnedMacs).toEqual(sensorMacs.sort());

        response.body.forEach(sensorData => {
            expect(sensorData).toHaveProperty('stats');
            expect(sensorData).not.toHaveProperty('measurements');
        });
    });

    it('stats by date range', async () => {
        const startDate = TEST_MEASUREMENTS.meas1_sensor1_gate1_net2.createdAt.toISOString();
        const endDate = new Date(TEST_MEASUREMENTS.meas2_sensor1_gate1_net2.createdAt.getTime() + 3 * 60 * 1000).toISOString(); //+3 minuti

        const response = await request(app)
            .get(`/api/v1/networks/${TEST_NETWORKS.network_2.code}/stats`)
            .query({
                startDate: startDate,
                endDate: endDate
            })
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        const stats = response.body[0].stats;
        expect(response.body[0]).not.toHaveProperty("measurements");
        expect(stats.mean).toBeCloseTo((TEST_MEASUREMENTS.meas1_sensor1_gate1_net2.value + TEST_MEASUREMENTS.meas2_sensor1_gate1_net2.value) / 2)

    });

    it('sensor MAC filter with date range for statistics', async () => {
        const startDate = TEST_MEASUREMENTS.meas1_sensor1_gate1_net2.createdAt.toISOString();
        const endDate = new Date(TEST_MEASUREMENTS.meas1_sensor1_gate1_net2.createdAt.getTime() + 3 * 60 * 1000).toISOString(); // +3 minuti

        const response = await request(app)
            .get(`/api/v1/networks/${TEST_NETWORKS.network_2.code}/stats`)
            .query({
                sensorMacs: TEST_SENSORS.sensor1_gate1_net2.macAddress,
                startDate: startDate,
                endDate: endDate
            })
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(response.body).toHaveLength(1);
        expect(response.body[0].sensorMacAddress).toBe(TEST_SENSORS.sensor1_gate1_net2.macAddress);
        expect(response.body[0]).toHaveProperty('stats');
        expect(response.body[0]).not.toHaveProperty('measurements');

        const stats = response.body[0].stats;
        expect(stats.mean).toBe(TEST_MEASUREMENTS.meas1_sensor1_gate1_net2.value);
        expect(stats.variance).toBe(0);
    });

    it('network with no sensors', async () => {
        const response = await request(app)
            .get(`/api/v1/networks/${TEST_NETWORKS.network_3.code}/stats`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(response.body).toBeInstanceOf(Array);
        expect(response.body).toHaveLength(0);
    });

    it('no stats when no data matches date filter', async () => {
        const futureDate = new Date(TEST_MEASUREMENTS.meas3_sensor1_gate1_net1.createdAt.getTime() + 10 * 60 * 60 * 1000); //+10 ore
        const futureEndDate = new Date(futureDate.getTime() + 60 * 60 * 1000); //+1 ora

        const response = await request(app)
            .get(`/api/v1/networks/${TEST_NETWORKS.network_1.code}/stats`)
            .query({
                startDate: futureDate.toISOString(),
                endDate: futureEndDate.toISOString()
            })
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        if (response.body.length > 0) {
            response.body.forEach(sensorData => {
                expect(sensorData).not.toHaveProperty("stats");
            });
        } else {
            expect(response.body).toHaveLength(0);
        }
    });

    // Test per errori

    it('UnauthorizedError invalid token', async () => {
        const response = await request(app)
            .get(`/api/v1/networks/${TEST_NETWORKS.network_1.code}/stats`)
            .set('Authorization', 'Bearer invalid-token')
            .expect(401);

        expect(response.body).toHaveProperty('code', 401);
        expect(response.body).toHaveProperty('name', 'UnauthorizedError');
        expect(response.body).toHaveProperty('message');
    });

    it('network not found', async () => {
        const response = await request(app)
            .get('/api/v1/networks/NONEXISTENT/stats')
            .set('Authorization', `Bearer ${token}`)
            .expect(404);

        expect(response.body).toHaveProperty('code', 404);
        expect(response.body).toHaveProperty('name', 'NotFoundError');
    });

    it('invalid start date', async () => {
        const response = await request(app)
            .get(`/api/v1/networks/${TEST_NETWORKS.network_1.code}/stats`)
            .query({ startDate: 'invalid-date-format' })
            .set('Authorization', `Bearer ${token}`)
            .expect(400);

        expect(response.body).toHaveProperty('code', 400);
        expect(response.body).toHaveProperty('name', 'Bad Request');
    });

    it('invalid end date', async () => {
        const response = await request(app)
            .get(`/api/v1/networks/${TEST_NETWORKS.network_1.code}/stats`)
            .query({ endDate: 'invalid-date-format' })
            .set('Authorization', `Bearer ${token}`)
            .expect(400);

        expect(response.body).toHaveProperty('code', 400);
        expect(response.body).toHaveProperty('name', 'Bad Request');
    });

    it('non-existent sensor returns empty array', async () => {
        const response = await request(app)
            .get(`/api/v1/networks/${TEST_NETWORKS.network_1.code}/stats`)
            .query({ sensorMacs: 'FF:FF:FF:FF:FF:FF' })
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(response.body).toBeInstanceOf(Array);
        expect(response.body).toHaveLength(0);
    });

    it('verify statistics calculation accuracy for sensor with known values', async () => {
        const response = await request(app)
            .get(`/api/v1/networks/${TEST_NETWORKS.network_2.code}/stats`)
            .query({ sensorMacs: TEST_SENSORS.sensor1_gate1_net2.macAddress })
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(response.body).toHaveLength(1);
        const sensorStats = response.body[0];

        //valori per sensor1_gate1_net2: [300, 310, 305]
        const expectedValues = [300, 310, 305];
        const expectedMean = expectedValues.reduce((a, b) => a + b) / expectedValues.length;
        const expectedVariance = expectedValues.reduce((sum, val) => sum + Math.pow(val - expectedMean, 2), 0) / expectedValues.length;
        const expectedStdDev = Math.sqrt(expectedVariance);

        expect(sensorStats.stats.mean).toBeCloseTo(expectedMean, 2);
        expect(sensorStats.stats.variance).toBeCloseTo(expectedVariance, 2);
        expect(sensorStats.stats.upperThreshold).toBeCloseTo(expectedMean + 2 * expectedStdDev, 2);
        expect(sensorStats.stats.lowerThreshold).toBeCloseTo(expectedMean - 2 * expectedStdDev, 2);
    });
});