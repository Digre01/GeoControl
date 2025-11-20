import request from "supertest";
import { app } from "@app";
import { generateToken } from "@services/authService";
import { beforeAllE2e, afterAllE2e, TEST_USERS, TEST_NETWORKS, TEST_MEASUREMENTS, TEST_SENSORS } from "@test/e2e/lifecycle";


describe('GET /networks/{networkCode}/outliers (e2e)', () => {
    let token: string;

    beforeAll(async () => {
        await beforeAllE2e();
        token = generateToken(TEST_USERS.admin);
    });

    afterAll(async () => {
        await afterAllE2e();
    });

    it('retrieve all outliers for network NET01', async () => {
        const response = await request(app)
            .get(`/api/v1/networks/${TEST_NETWORKS.network_1.code}/outliers`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(response.body).toBeInstanceOf(Array);
        expect(response.body).toHaveLength(2);

        const sensorData = response.body[0];

        console.log(response.body)
        for (let sensor of response.body) {
            expect(sensor).not.toHaveProperty('measurements');
        }
        expect(sensorData).toHaveProperty('sensorMacAddress', TEST_SENSORS.sensor1_gate1_net1.macAddress);

    });

    it('retrieve all outliers for network NET02 with multiple sensors', async () => {
        const response = await request(app)
            .get(`/api/v1/networks/${TEST_NETWORKS.network_2.code}/outliers`)
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
    });

    it('filter outliers by specific sensor MAC addresses', async () => {
        const sensorMacs = [
            TEST_SENSORS.sensor1_gate1_net2.macAddress,
            TEST_SENSORS.sensor3_gate1_net2.macAddress
        ];

        const response = await request(app)
            .get(`/api/v1/networks/${TEST_NETWORKS.network_2.code}/outliers`)
            .query({ sensorMacs: sensorMacs })
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(response.body).toHaveLength(2);
        const returnedMacs = response.body.map(s => s.sensorMacAddress).sort();
        expect(returnedMacs).toEqual(sensorMacs.sort());
    });

    it('filter outliers by date', async () => {
        const startDate = TEST_MEASUREMENTS.meas1_sensor1_gate1_net2.createdAt.toISOString();
        const endDate = new Date(TEST_MEASUREMENTS.meas2_sensor1_gate1_net2.createdAt.getTime() + 3 * 60 * 1000).toISOString(); // +3 minuti

        const response = await request(app)
            .get(`/api/v1/networks/${TEST_NETWORKS.network_2.code}/outliers`)
            .query({
                startDate: startDate,
                endDate: endDate
            })
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        response.body.forEach(sensorData => {
            sensorData.measurements?.forEach(measurement => {
                const measurementDate = new Date(measurement.createdAt);
                const start = new Date(startDate);
                const end = new Date(endDate);

                expect(measurementDate >= start && measurementDate <= end).toBe(true);
            });
        });
    });

    it('sensor MAC filter with date range', async () => {
        const startDate = TEST_MEASUREMENTS.meas1_sensor1_gate1_net2.createdAt.toISOString();
        const endDate = new Date(TEST_MEASUREMENTS.meas1_sensor1_gate1_net2.createdAt.getTime() + 3 * 60 * 1000).toISOString(); // +3 minuti

        const response = await request(app)
            .get(`/api/v1/networks/${TEST_NETWORKS.network_2.code}/outliers`)
            .query({
                sensorMacs: TEST_SENSORS.sensor1_gate1_net2.macAddress,
                startDate: startDate,
                endDate: endDate
            })
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(response.body).toHaveLength(1);
        expect(response.body[0].sensorMacAddress).toBe(TEST_SENSORS.sensor1_gate1_net2.macAddress);
    });

    it('empty array for network with no sensors', async () => {
        const response = await request(app)
            .get(`/api/v1/networks/${TEST_NETWORKS.network_3.code}/outliers`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(response.body).toBeInstanceOf(Array);
        expect(response.body).toHaveLength(0);
    });

    it('no measurements array when no data matches date filter', async () => {

        const futureDate = new Date(TEST_MEASUREMENTS.meas3_sensor1_gate1_net1.createdAt.getTime() + 10 * 60 * 60 * 1000);
        const futureEndDate = new Date(futureDate.getTime() + 60 * 60 * 1000);

        const response = await request(app)
            .get(`/api/v1/networks/${TEST_NETWORKS.network_1.code}/outliers`)
            .query({
                startDate: futureDate.toISOString(),
                endDate: futureEndDate.toISOString()
            })
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(response.body).toHaveLength(2);
        expect(response.body[0]).not.toHaveProperty("measurements");
    });


    it('UnauthorizedError invalid token', async () => {
        const response = await request(app)
            .get(`/api/v1/networks/${TEST_NETWORKS.network_1.code}/outliers`)
            .set('Authorization', 'Bearer invalid-token')
            .expect(401);

        expect(response.body).toHaveProperty('code', 401);
        expect(response.body).toHaveProperty('name', 'UnauthorizedError');
        expect(response.body).toHaveProperty('message');
    });

    it('network not found', async () => {
        const response = await request(app)
            .get('/api/v1/networks/NONEXISTENT/measurements')
            .set('Authorization', `Bearer ${token}`)
            .expect(404);

        expect(response.body).toHaveProperty('code', 404);
        expect(response.body).toHaveProperty('name', 'NotFoundError');
    });

    it('invalid start date', async () => {
        const response = await request(app)
            .get(`/api/v1/networks/${TEST_NETWORKS.network_1.code}/outliers`)
            .query({ startDate: 'invalid-date-format' })
            .set('Authorization', `Bearer ${token}`)
            .expect(400);

        expect(response.body).toHaveProperty('code', 400);
        expect(response.body).toHaveProperty('name', 'Bad Request');
    });

    it('invalid end date', async () => {
        const response = await request(app)
            .get(`/api/v1/networks/${TEST_NETWORKS.network_1.code}/measurements`)
            .query({ endDate: 'invalid-date-format' })
            .set('Authorization', `Bearer ${token}`)
            .expect(400);

        expect(response.body).toHaveProperty('code', 400);
        expect(response.body).toHaveProperty('name', 'Bad Request');
    });

    it('non-existent sensor', async () => {
        const response = await request(app)
            .get(`/api/v1/networks/${TEST_NETWORKS.network_1.code}/outliers`)
            .query({ sensorMacs: 'FF:FF:FF:FF:FF:FF' })
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(response.body).toBeInstanceOf(Array);
        expect(response.body).toHaveLength(0);
    });

    it('correct outliers', async () => {
        const response = await request(app)
            .get('/api/v1/networks/NET02/measurements')
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        response.body.forEach(sensorData => {
            const { stats, measurements } = sensorData;

            measurements?.forEach(measurement => {
                const isOutsideThreshold = measurement.value > stats.upperThreshold ||
                    measurement.value < stats.lowerThreshold;
                expect(measurement.isOutlier).toBe(isOutsideThreshold);
            });
        });
    });
});



