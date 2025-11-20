import request from "supertest";
import { app } from "@app";
import { generateToken } from "@services/authService";
import { beforeAllE2e, afterAllE2e, TEST_USERS, TEST_NETWORKS, TEST_GATEWAYS, TEST_SENSORS, TEST_MEASUREMENTS } from "@test/e2e/lifecycle";

describe('GET /networks/{networkCode}/gateways/{gatewayMac}/sensors/{sensorMac}/stats (e2e)', () => {
    let token: string;

    beforeAll(async () => {
        await beforeAllE2e();
        token = generateToken(TEST_USERS.admin);
    });

    afterAll(async () => {
        await afterAllE2e();
    });

    it('stats for sensor without date filters', async () => {
        const response = await request(app)
            .get(`/api/v1/networks/${TEST_NETWORKS.network_1.code}/gateways/${TEST_GATEWAYS.gate1_net1.macAddress}/sensors/${TEST_SENSORS.sensor1_gate1_net1.macAddress}/stats`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);


        const expectedValues = [22.5, 22.7, 23.0];
        const expectedMean = expectedValues.reduce((sum, val) => sum + val, 0) / expectedValues.length;

        expect(response.body.mean).toBeCloseTo(expectedMean, 2);

        const variance = expectedValues.reduce((sum, val) => {
            return sum + Math.pow(val - expectedMean, 2);
        }, 0) / expectedValues.length;

        expect(response.body.variance).toBeCloseTo(variance, 2);

        const standardDeviation = Math.sqrt(variance);
        const expectedUpperThreshold = expectedMean + 2 * standardDeviation;
        const expectedLowerThreshold = expectedMean - 2 * standardDeviation;

        expect(response.body.upperThreshold).toBeCloseTo(expectedUpperThreshold, 2);
        expect(response.body.lowerThreshold).toBeCloseTo(expectedLowerThreshold, 2);
    });

    it('stats with startDate', async () => {
        const startDate = TEST_MEASUREMENTS.meas2_sensor1_gate1_net1.createdAt.toISOString();

        const response = await request(app)
            .get(`/api/v1/networks/${TEST_NETWORKS.network_1.code}/gateways/${TEST_GATEWAYS.gate1_net1.macAddress}/sensors/${TEST_SENSORS.sensor1_gate1_net1.macAddress}/stats`)
            .query({ startDate })
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        //stats solo sulle ultime due misurazioni (22.7 e 23.0)
        const expectedValues = [22.7, 23.0];
        const expectedMean = expectedValues.reduce((sum, val) => sum + val, 0) / expectedValues.length;

        expect(response.body.mean).toBeCloseTo(expectedMean, 2);

        const statsStartDate = new Date(response.body.startDate);
        const queryStartDate = new Date(TEST_MEASUREMENTS.meas2_sensor1_gate1_net1.createdAt);
        expect(statsStartDate.getTime()).toBe(queryStartDate.getTime());
    });

    it('stats with endDate', async () => {
        const endDate = TEST_MEASUREMENTS.meas2_sensor1_gate1_net1.createdAt.toISOString();

        const response = await request(app)
            .get(`/api/v1/networks/${TEST_NETWORKS.network_1.code}/gateways/${TEST_GATEWAYS.gate1_net1.macAddress}/sensors/${TEST_SENSORS.sensor1_gate1_net1.macAddress}/stats`)
            .query({ endDate })
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        //stats solo sulle prime due misurazioni (22.5 e 22.7)
        const expectedValues = [22.5, 22.7];
        const expectedMean = expectedValues.reduce((sum, val) => sum + val, 0) / expectedValues.length;

        expect(response.body.mean).toBeCloseTo(expectedMean, 2);

        const statsEndDate = new Date(response.body.endDate);
        const queryEndDate = new Date(TEST_MEASUREMENTS.meas2_sensor1_gate1_net1.createdAt);
        expect(statsEndDate.getTime()).toBe(queryEndDate.getTime());
    });

    it('stats with both startDate and endDate', async () => {
        const startDate = TEST_MEASUREMENTS.meas1_sensor1_gate1_net2.createdAt.toISOString();
        const endDate = TEST_MEASUREMENTS.meas2_sensor1_gate1_net2.createdAt.toISOString();

        const response = await request(app)
            .get(`/api/v1/networks/${TEST_NETWORKS.network_2.code}/gateways/${TEST_GATEWAYS.gate1_net2.macAddress}/sensors/${TEST_SENSORS.sensor1_gate1_net2.macAddress}/stats`)
            .query({ startDate, endDate })
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        //sstats su entrambe le misurazioni nel range (300 e 310)
        const expectedValues = [300, 310];
        const expectedMean = expectedValues.reduce((sum, val) => sum + val, 0) / expectedValues.length;

        expect(response.body.mean).toBeCloseTo(expectedMean, 2);

        const statsStartDate = new Date(response.body.startDate);
        const statsEndDate = new Date(response.body.endDate);
        const queryStartDate = new Date(TEST_MEASUREMENTS.meas1_sensor1_gate1_net2.createdAt);
        const queryEndDate = new Date(TEST_MEASUREMENTS.meas2_sensor1_gate1_net2.createdAt);

        expect(statsStartDate.getTime()).toBe(queryStartDate.getTime());
        expect(statsEndDate.getTime()).toBe(queryEndDate.getTime());
    });

    it('stats for sensor with one measurement', async () => {
        const response = await request(app)
            .get(`/api/v1/networks/${TEST_NETWORKS.network_2.code}/gateways/${TEST_GATEWAYS.gate1_net2.macAddress}/sensors/${TEST_SENSORS.sensor2_gate1_net2.macAddress}/stats`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(response.body.mean).toBeCloseTo(23.1, 2);
        expect(response.body.variance).toBe(0); //solo una misurazione, varianza = 0
        expect(response.body.upperThreshold).toBeCloseTo(23.1, 2);
        expect(response.body.lowerThreshold).toBeCloseTo(23.1, 2);
    });

    it('no stats when date range has no data', async () => {
        const futureStartDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // domani
        const futureEndDate = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(); // dopodomani

        const response = await request(app)
            .get(`/api/v1/networks/${TEST_NETWORKS.network_1.code}/gateways/${TEST_GATEWAYS.gate1_net1.macAddress}/sensors/${TEST_SENSORS.sensor1_gate1_net1.macAddress}/stats`)
            .query({
                startDate: futureStartDate,
                endDate: futureEndDate
            })
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(response.body).toHaveProperty('startDate');
        expect(response.body).toHaveProperty('endDate');
        expect(response.body).not.toHaveProperty('stats');

        const statsStartDate = new Date(response.body.startDate);
        const statsEndDate = new Date(response.body.endDate);
        const queryStartDate = new Date(futureStartDate);
        const queryEndDate = new Date(futureEndDate);

        expect(statsStartDate.getTime()).toBe(queryStartDate.getTime());
        expect(statsEndDate.getTime()).toBe(queryEndDate.getTime());
    });

    it('stats with multiple different values', async () => {
        const response = await request(app)
            .get(`/api/v1/networks/${TEST_NETWORKS.network_2.code}/gateways/${TEST_GATEWAYS.gate1_net2.macAddress}/sensors/${TEST_SENSORS.sensor1_gate1_net2.macAddress}/stats`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        const expectedValues = [300, 310, 305];
        const expectedMean = expectedValues.reduce((sum, val) => sum + val, 0) / expectedValues.length;

        expect(response.body.mean).toBeCloseTo(expectedMean, 2);

        const variance = expectedValues.reduce((sum, val) => {
            return sum + Math.pow(val - expectedMean, 2);
        }, 0) / expectedValues.length;

        expect(response.body.variance).toBeCloseTo(variance, 2);

        const standardDeviation = Math.sqrt(variance);
        expect(response.body.upperThreshold).toBeCloseTo(expectedMean + 2 * standardDeviation, 2);
        expect(response.body.lowerThreshold).toBeCloseTo(expectedMean - 2 * standardDeviation, 2);
    });

    it('network not found - 404', async () => {
        const response = await request(app)
            .get(`/api/v1/networks/NONEXISTENT/gateways/${TEST_GATEWAYS.gate1_net1.macAddress}/sensors/${TEST_SENSORS.sensor1_gate1_net1.macAddress}/stats`)
            .set('Authorization', `Bearer ${token}`)
            .expect(404);

        expect(response.body).toHaveProperty('code');
        expect(response.body.code).toBe(404);
    });

    it('gateway not found - 404', async () => {
        const response = await request(app)
            .get(`/api/v1/networks/${TEST_NETWORKS.network_1.code}/gateways/FF:FF:FF:FF:FF:FF/sensors/${TEST_SENSORS.sensor1_gate1_net1.macAddress}/stats`)
            .set('Authorization', `Bearer ${token}`)
            .expect(404);

        expect(response.body).toHaveProperty('code');
        expect(response.body.code).toBe(404);
    });

    it('sensor not found - 404', async () => {
        const response = await request(app)
            .get(`/api/v1/networks/${TEST_NETWORKS.network_1.code}/gateways/${TEST_GATEWAYS.gate1_net1.macAddress}/sensors/FF:FF:FF:FF:FF:FF/stats`)
            .set('Authorization', `Bearer ${token}`)
            .expect(404);

        expect(response.body).toHaveProperty('code');
        expect(response.body.code).toBe(404);
    });

    it('unauthorized - invalid token - 401', async () => {
        const response = await request(app)
            .get(`/api/v1/networks/${TEST_NETWORKS.network_1.code}/gateways/${TEST_GATEWAYS.gate1_net1.macAddress}/sensors/${TEST_SENSORS.sensor1_gate1_net1.macAddress}/stats`)
            .set('Authorization', 'Bearer invalid-token')
            .expect(401);

        expect(response.body).toHaveProperty('code');
        expect(response.body.code).toBe(401);
    });

    it('unauthorized - missing token - 401', async () => {
        const response = await request(app)
            .get(`/api/v1/networks/${TEST_NETWORKS.network_1.code}/gateways/${TEST_GATEWAYS.gate1_net1.macAddress}/sensors/${TEST_SENSORS.sensor1_gate1_net1.macAddress}/stats`)
            .expect(401);

        expect(response.body).toHaveProperty('code');
        expect(response.body.code).toBe(401);
    });

    it('bad request - invalid startDate format - 400', async () => {
        const response = await request(app)
            .get(`/api/v1/networks/${TEST_NETWORKS.network_1.code}/gateways/${TEST_GATEWAYS.gate1_net1.macAddress}/sensors/${TEST_SENSORS.sensor1_gate1_net1.macAddress}/stats`)
            .query({ startDate: 'invalid-date-format' })
            .set('Authorization', `Bearer ${token}`)
            .expect(400);

        expect(response.body).toHaveProperty('code');
        expect(response.body.code).toBe(400);
    });

    it('bad request - invalid endDate format - 400', async () => {
        const response = await request(app)
            .get(`/api/v1/networks/${TEST_NETWORKS.network_1.code}/gateways/${TEST_GATEWAYS.gate1_net1.macAddress}/sensors/${TEST_SENSORS.sensor1_gate1_net1.macAddress}/stats`)
            .query({ endDate: 'invalid-date-format' })
            .set('Authorization', `Bearer ${token}`)
            .expect(400);

        expect(response.body).toHaveProperty('code');
        expect(response.body.code).toBe(400);
    });


});