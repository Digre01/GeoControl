import request from "supertest";
import { app } from "@app";
import { generateToken } from "@services/authService";
import { beforeAllE2e, afterAllE2e, TEST_USERS, TEST_NETWORKS, TEST_GATEWAYS, TEST_SENSORS } from "@test/e2e/lifecycle";

describe('POST /networks/{networkCode}/gateways/{gatewayMac}/sensors/{sensorMac}/measurements (e2e)', () => {
    let adminToken: string;
    let operatorToken: string;
    let viewerToken: string;

    beforeAll(async () => {
        await beforeAllE2e();
        adminToken = generateToken(TEST_USERS.admin);
        operatorToken = generateToken(TEST_USERS.operator);
        viewerToken = generateToken(TEST_USERS.viewer);
    });

    afterAll(async () => {
        await afterAllE2e();
    });

    it('create measurements successfully', async () => {
        const measurements = [
            {
                createdAt: "2025-05-30T14:00:00+02:00",
                value: 24.5
            },
            {
                createdAt: "2025-05-30T14:05:00+02:00",
                value: 24.8
            }
        ];

        await request(app)
            .post(`/api/v1/networks/${TEST_NETWORKS.network_1.code}/gateways/${TEST_GATEWAYS.gate1_net1.macAddress}/sensors/${TEST_SENSORS.sensor1_gate1_net1.macAddress}/measurements`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send(measurements)
            .expect(201);

        const getResponse = await request(app)
            .get(`/api/v1/networks/${TEST_NETWORKS.network_1.code}/gateways/${TEST_GATEWAYS.gate1_net1.macAddress}/sensors/${TEST_SENSORS.sensor1_gate1_net1.macAddress}/measurements`)
            .query({
                startDate: "2025-05-30T14:00:00+02:00",
                endDate: "2025-05-30T14:05:00+02:00"
            })
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200);

        expect(getResponse.body).toHaveProperty('measurements');
        expect(getResponse.body.measurements).toHaveLength(2);

        const sortedMeasurements = getResponse.body.measurements.sort((a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        expect(sortedMeasurements[0].value).toBeCloseTo(24.5);
        expect(sortedMeasurements[1].value).toBeCloseTo(24.8);
        expect(new Date(sortedMeasurements[0].createdAt).toISOString()).toBe(
            new Date("2025-05-30T14:00:00+02:00").toISOString()
        );
        expect(new Date(sortedMeasurements[1].createdAt).toISOString()).toBe(
            new Date("2025-05-30T14:05:00+02:00").toISOString()
        );
    });

    it('create measurements successfully with operator token', async () => {
        const measurements = [
            {
                createdAt: "2025-05-30T15:00:00+02:00",
                value: 25.2
            }
        ];

        await request(app)
            .post(`/api/v1/networks/${TEST_NETWORKS.network_1.code}/gateways/${TEST_GATEWAYS.gate1_net1.macAddress}/sensors/${TEST_SENSORS.sensor1_gate1_net1.macAddress}/measurements`)
            .set('Authorization', `Bearer ${operatorToken}`)
            .send(measurements)
            .expect(201);

        // Verify measurement was created
        const getResponse = await request(app)
            .get(`/api/v1/networks/${TEST_NETWORKS.network_1.code}/gateways/${TEST_GATEWAYS.gate1_net1.macAddress}/sensors/${TEST_SENSORS.sensor1_gate1_net1.macAddress}/measurements`)
            .query({
                startDate: "2025-05-30T15:00:00+02:00",
                endDate: "2025-05-30T15:00:00+02:00"
            })
            .set('Authorization', `Bearer ${operatorToken}`)
            .expect(200);

        expect(getResponse.body).toHaveProperty('measurements');
        expect(getResponse.body.measurements).toHaveLength(1);
        expect(getResponse.body.measurements[0].value).toBeCloseTo(25.2);
        expect(new Date(getResponse.body.measurements[0].createdAt).toISOString()).toBe(
            new Date("2025-05-30T15:00:00+02:00").toISOString()
        );
    });

    it('create single measurement successfully', async () => {
        const measurements = [
            {
                createdAt: "2025-05-30T16:00:00+02:00",
                value: 23.1
            }
        ];

        // Create measurement
        const createResponse = await request(app)
            .post(`/api/v1/networks/${TEST_NETWORKS.network_2.code}/gateways/${TEST_GATEWAYS.gate1_net2.macAddress}/sensors/${TEST_SENSORS.sensor1_gate1_net2.macAddress}/measurements`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send(measurements)
            .expect(201);

        // Verify measurement was created
        const getResponse = await request(app)
            .get(`/api/v1/networks/${TEST_NETWORKS.network_2.code}/gateways/${TEST_GATEWAYS.gate1_net2.macAddress}/sensors/${TEST_SENSORS.sensor1_gate1_net2.macAddress}/measurements`)
            .query({
                startDate: "2025-05-30T16:00:00+02:00",
                endDate: "2025-05-30T16:00:00+02:00"
            })
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200);

        expect(getResponse.body).toHaveProperty('measurements');
        expect(getResponse.body.measurements).toHaveLength(1);
        expect(getResponse.body.measurements[0].value).toBeCloseTo(23.1);
        expect(new Date(getResponse.body.measurements[0].createdAt).toISOString()).toBe(
            new Date("2025-05-30T16:00:00+02:00").toISOString()
        );
    });

    it('create multiple measurements successfully', async () => {
        const measurements = [
            {
                createdAt: "2025-05-30T17:00:00+02:00",
                value: 26.1
            },
            {
                createdAt: "2025-05-30T17:05:00+02:00",
                value: 26.3
            },
            {
                createdAt: "2025-05-30T17:10:00+02:00",
                value: 26.0
            },
            {
                createdAt: "2025-05-30T17:15:00+02:00",
                value: 25.8
            }
        ];

        await request(app)
            .post(`/api/v1/networks/${TEST_NETWORKS.network_2.code}/gateways/${TEST_GATEWAYS.gate1_net2.macAddress}/sensors/${TEST_SENSORS.sensor2_gate1_net2.macAddress}/measurements`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send(measurements)
            .expect(201);
    });

    it(' measurements with decimal values', async () => {
        const measurements = [
            {
                createdAt: "2025-05-30T18:00:00+02:00",
                value: 1.8567
            },
            {
                createdAt: "2025-05-30T18:05:00+02:00",
                value: 99.999
            }
        ];

        await request(app)
            .post(`/api/v1/networks/${TEST_NETWORKS.network_2.code}/gateways/${TEST_GATEWAYS.gate1_net2.macAddress}/sensors/${TEST_SENSORS.sensor3_gate1_net2.macAddress}/measurements`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send(measurements)
            .expect(201);
    });

    it('insufficient rights - user token - 403', async () => {
        const measurements = [
            {
                createdAt: "2025-05-30T19:00:00+02:00",
                value: 24.5
            }
        ];

        const response = await request(app)
            .post(`/api/v1/networks/${TEST_NETWORKS.network_1.code}/gateways/${TEST_GATEWAYS.gate1_net1.macAddress}/sensors/${TEST_SENSORS.sensor1_gate1_net1.macAddress}/measurements`)
            .set('Authorization', `Bearer ${viewerToken}`)
            .send(measurements)
            .expect(403);

        expect(response.body).toHaveProperty('code');
        expect(response.body.code).toBe(403);
    });

    it('network not found - 404', async () => {
        const measurements = [
            {
                createdAt: "2025-05-30T20:00:00+02:00",
                value: 24.5
            }
        ];

        const response = await request(app)
            .post(`/api/v1/networks/NONEXISTENT/gateways/${TEST_GATEWAYS.gate1_net1.macAddress}/sensors/${TEST_SENSORS.sensor1_gate1_net1.macAddress}/measurements`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send(measurements)
            .expect(404);

        expect(response.body).toHaveProperty('code');
        expect(response.body.code).toBe(404);
    });

    it('gateway not found - 404', async () => {
        const measurements = [
            {
                createdAt: "2025-05-30T21:00:00+02:00",
                value: 24.5
            }
        ];

        const response = await request(app)
            .post(`/api/v1/networks/${TEST_NETWORKS.network_1.code}/gateways/FF:FF:FF:FF:FF:FF/sensors/${TEST_SENSORS.sensor1_gate1_net1.macAddress}/measurements`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send(measurements)
            .expect(404);

        expect(response.body).toHaveProperty('code');
        expect(response.body.code).toBe(404);
    });

    it('sensor not found - 404', async () => {
        const measurements = [
            {
                createdAt: "2025-05-30T22:00:00+02:00",
                value: 24.5
            }
        ];

        const response = await request(app)
            .post(`/api/v1/networks/${TEST_NETWORKS.network_1.code}/gateways/${TEST_GATEWAYS.gate1_net1.macAddress}/sensors/FF:FF:FF:FF:FF:FF/measurements`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send(measurements)
            .expect(404);

        expect(response.body).toHaveProperty('code');
        expect(response.body.code).toBe(404);
    });

    it('unauthorized - invalid token - 401', async () => {
        const measurements = [
            {
                createdAt: "2025-05-30T23:00:00+02:00",
                value: 24.5
            }
        ];

        const response = await request(app)
            .post(`/api/v1/networks/${TEST_NETWORKS.network_1.code}/gateways/${TEST_GATEWAYS.gate1_net1.macAddress}/sensors/${TEST_SENSORS.sensor1_gate1_net1.macAddress}/measurements`)
            .set('Authorization', 'Bearer invalid-token')
            .send(measurements)
            .expect(401);

        expect(response.body).toHaveProperty('code');
        expect(response.body.code).toBe(401);
    });

    it('unauthorized - missing token - 401', async () => {
        const measurements = [
            {
                createdAt: "2025-05-30T23:30:00+02:00",
                value: 24.5
            }
        ];

        const response = await request(app)
            .post(`/api/v1/networks/${TEST_NETWORKS.network_1.code}/gateways/${TEST_GATEWAYS.gate1_net1.macAddress}/sensors/${TEST_SENSORS.sensor1_gate1_net1.macAddress}/measurements`)
            .send(measurements)
            .expect(401);

        expect(response.body).toHaveProperty('code');
        expect(response.body.code).toBe(401);
    });

    it('empty array - 201', async () => {
        const response = await request(app)
            .post(`/api/v1/networks/${TEST_NETWORKS.network_1.code}/gateways/${TEST_GATEWAYS.gate1_net1.macAddress}/sensors/${TEST_SENSORS.sensor1_gate1_net1.macAddress}/measurements`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send([])
            .expect(201);

    });

    it('bad request - missing createdAt - 400', async () => {
        const measurements = [
            {
                value: 24.5
            }
        ];

        const response = await request(app)
            .post(`/api/v1/networks/${TEST_NETWORKS.network_1.code}/gateways/${TEST_GATEWAYS.gate1_net1.macAddress}/sensors/${TEST_SENSORS.sensor1_gate1_net1.macAddress}/measurements`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send(measurements)
            .expect(400);

        expect(response.body).toHaveProperty('code');
        expect(response.body.code).toBe(400);
    });

    it('bad request - missing value - 400', async () => {
        const measurements = [
            {
                createdAt: "2025-05-30T23:45:00+02:00"
            }
        ];

        const response = await request(app)
            .post(`/api/v1/networks/${TEST_NETWORKS.network_1.code}/gateways/${TEST_GATEWAYS.gate1_net1.macAddress}/sensors/${TEST_SENSORS.sensor1_gate1_net1.macAddress}/measurements`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send(measurements)
            .expect(400);

        expect(response.body).toHaveProperty('code');
        expect(response.body.code).toBe(400);
    });

    it('bad request - invalid createdAt format - 400', async () => {
        const measurements = [
            {
                createdAt: "invalid-date-format",
                value: 24.5
            }
        ];

        const response = await request(app)
            .post(`/api/v1/networks/${TEST_NETWORKS.network_1.code}/gateways/${TEST_GATEWAYS.gate1_net1.macAddress}/sensors/${TEST_SENSORS.sensor1_gate1_net1.macAddress}/measurements`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send(measurements)
            .expect(400);

        expect(response.body).toHaveProperty('code');
        expect(response.body.code).toBe(400);
    });

    it('bad request - invalid value type - 400', async () => {
        const measurements = [
            {
                createdAt: "2025-05-30T23:50:00+02:00",
                value: "not-a-number"
            }
        ];

        const response = await request(app)
            .post(`/api/v1/networks/${TEST_NETWORKS.network_1.code}/gateways/${TEST_GATEWAYS.gate1_net1.macAddress}/sensors/${TEST_SENSORS.sensor1_gate1_net1.macAddress}/measurements`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send(measurements)
            .expect(400);

        expect(response.body).toHaveProperty('code');
        expect(response.body.code).toBe(400);
    });

    it('bad request - null value - 400', async () => {
        const measurements = [
            {
                createdAt: "2025-05-30T23:55:00+02:00",
                value: null
            }
        ];

        const response = await request(app)
            .post(`/api/v1/networks/${TEST_NETWORKS.network_1.code}/gateways/${TEST_GATEWAYS.gate1_net1.macAddress}/sensors/${TEST_SENSORS.sensor1_gate1_net1.macAddress}/measurements`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send(measurements)
            .expect(400);

        expect(response.body).toHaveProperty('code');
        expect(response.body.code).toBe(400);
    });

    it('bad request - invalid JSON - 400', async () => {
        const response = await request(app)
            .post(`/api/v1/networks/${TEST_NETWORKS.network_1.code}/gateways/${TEST_GATEWAYS.gate1_net1.macAddress}/sensors/${TEST_SENSORS.sensor1_gate1_net1.macAddress}/measurements`)
            .set('Authorization', `Bearer ${adminToken}`)
            .set('Content-Type', 'application/json')
            .send('invalid-json')
            .expect(400);

        expect(response.body).toHaveProperty('code');
        expect(response.body.code).toBe(400);
    });

    it('bad request - non-array payload - 400', async () => {
        const payload = {
            createdAt: "2025-05-30T23:58:00+02:00",
            value: 24.5
        };

        const response = await request(app)
            .post(`/api/v1/networks/${TEST_NETWORKS.network_1.code}/gateways/${TEST_GATEWAYS.gate1_net1.macAddress}/sensors/${TEST_SENSORS.sensor1_gate1_net1.macAddress}/measurements`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send(payload)
            .expect(400);

        expect(response.body).toHaveProperty('code');
        expect(response.body.code).toBe(400);
    });

    it('measurements with valid and invalid data in array - 400', async () => {
        const measurements = [
            {
                createdAt: "2025-05-30T23:59:00+02:00",
                value: 24.5
            },
            {
                createdAt: "invalid-date",
                value: 25.0
            }
        ];

        const response = await request(app)
            .post(`/api/v1/networks/${TEST_NETWORKS.network_1.code}/gateways/${TEST_GATEWAYS.gate1_net1.macAddress}/sensors/${TEST_SENSORS.sensor1_gate1_net1.macAddress}/measurements`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send(measurements)
            .expect(400);

        expect(response.body).toHaveProperty('code');
        expect(response.body.code).toBe(400);
    });
});