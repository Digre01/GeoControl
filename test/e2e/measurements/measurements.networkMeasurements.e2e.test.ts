import request from "supertest";
import { app } from "@app";
import { generateToken } from "@services/authService";
import { beforeAllE2e, afterAllE2e, TEST_USERS, TEST_NETWORKS, TEST_MEASUREMENTS, TEST_SENSORS } from "@test/e2e/lifecycle";


describe('GET /networks/{networkCode}/measurements (e2e)', () => {
  let token: string;

  beforeAll(async () => {
    await beforeAllE2e();
    token = generateToken(TEST_USERS.admin);
  });

  afterAll(async () => {
    await afterAllE2e();
  });

  it('retrieve all measurements for network NET01', async () => {
    const response = await request(app)
      .get(`/api/v1/networks/${TEST_NETWORKS.network_1.code}/measurements`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toBeInstanceOf(Array);
    expect(response.body).toHaveLength(2);

    expect(
      response.body.map((s) => s.sensorMacAddress)
    ).toEqual(
      expect.arrayContaining([TEST_SENSORS.sensor1_gate1_net1.macAddress, TEST_SENSORS.sensor2_gate1_net1.macAddress])
    );

    const sensorData = response.body.find((s) => s.sensorMacAddress == TEST_SENSORS.sensor1_gate1_net1.macAddress);

    expect(sensorData).toHaveProperty('sensorMacAddress', TEST_SENSORS.sensor1_gate1_net1.macAddress);
    expect(sensorData).toHaveProperty('measurements');
    expect(sensorData).toHaveProperty('stats');

    expect(sensorData.measurements).toHaveLength(3);

    const expectedMeasurements = [
      { value: 22.5, createdAt: "2025-05-29T10:00:00+02:00" },
      { value: 22.7, createdAt: "2025-05-29T10:05:00+02:00" },
      { value: 23.0, createdAt: "2025-05-29T10:10:00+02:00" }
    ];

    const sortedMeasurements = sensorData.measurements.sort((a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    sortedMeasurements.forEach((measurement, index) => {
      expect(measurement.value).toBeCloseTo(expectedMeasurements[index].value);
      expect(new Date(measurement.createdAt).toISOString()).toBe(
        new Date(expectedMeasurements[index].createdAt).toISOString()
      );

    });

    const expectedMean = (22.5 + 22.7 + 23.0) / 3;
    expect(sensorData.stats.mean).toBeCloseTo(expectedMean, 2);


    const variance = expectedMeasurements.reduce((sum, measurement) => {
      return sum + Math.pow(measurement.value - expectedMean, 2);
    }, 0) / expectedMeasurements.length;

    expect(sensorData.stats.variance).toBeCloseTo(variance, 2);

    const standardDeviation = Math.sqrt(variance);
    const expectedUpperThreshold = expectedMean + 2 * standardDeviation;
    const expectedLowerThreshold = expectedMean - 2 * standardDeviation;

    expect(sensorData.stats.upperThreshold).toBeCloseTo(expectedUpperThreshold, 2);
    expect(sensorData.stats.lowerThreshold).toBeCloseTo(expectedLowerThreshold, 2);


    sortedMeasurements.forEach(measurement => {
      expect(measurement.isOutlier).toBe(false);
    });
  });

  it('retrieve all measurements for network NET02 with multiple sensors', async () => {
    const response = await request(app)
      .get(`/api/v1/networks/${TEST_NETWORKS.network_2.code}/measurements`)
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

  it('filter measurements by specific sensor MAC addresses', async () => {
    const sensorMacs = [
      TEST_SENSORS.sensor1_gate1_net2.macAddress,
      TEST_SENSORS.sensor3_gate1_net2.macAddress
    ];

    const response = await request(app)
      .get(`/api/v1/networks/${TEST_NETWORKS.network_2.code}/measurements`)
      .query({ sensorMacs: sensorMacs })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toHaveLength(2);
    const returnedMacs = response.body.map(s => s.sensorMacAddress).sort();
    expect(returnedMacs).toEqual(sensorMacs.sort());
  });

  it('filter measurements by date', async () => {
    const startDate = TEST_MEASUREMENTS.meas1_sensor1_gate1_net2.createdAt.toISOString();
    const endDate = new Date(TEST_MEASUREMENTS.meas2_sensor1_gate1_net2.createdAt.getTime() + 3 * 60 * 1000).toISOString(); // +3 minuti

    const response = await request(app)
      .get(`/api/v1/networks/${TEST_NETWORKS.network_2.code}/measurements`)
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
      .get(`/api/v1/networks/${TEST_NETWORKS.network_2.code}/measurements`)
      .query({
        sensorMacs: TEST_SENSORS.sensor1_gate1_net2.macAddress,
        startDate: startDate,
        endDate: endDate
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0].sensorMacAddress).toBe(TEST_SENSORS.sensor1_gate1_net2.macAddress);

    expect(response.body[0].measurements).toHaveLength(1);
    expect(response.body[0].measurements[0].value).toBe(TEST_MEASUREMENTS.meas1_sensor1_gate1_net2.value);
  });

  it('empty array for network with no sensors', async () => {
    const response = await request(app)
      .get(`/api/v1/networks/${TEST_NETWORKS.network_3.code}/measurements`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toBeInstanceOf(Array);
    expect(response.body).toHaveLength(0);
  });

  it('no measurements array when no data matches date filter', async () => {

    const futureDate = new Date(TEST_MEASUREMENTS.meas3_sensor1_gate1_net1.createdAt.getTime() + 10 * 60 * 60 * 1000);
    const futureEndDate = new Date(futureDate.getTime() + 60 * 60 * 1000);

    const response = await request(app)
      .get(`/api/v1/networks/${TEST_NETWORKS.network_1.code}/measurements`)
      .query({
        startDate: futureDate.toISOString(),
        endDate: futureEndDate.toISOString()
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toHaveLength(2);
    expect(response.body[0]).not.toHaveProperty("measurements");
    expect(response.body[1]).not.toHaveProperty("measurements");

  });


  it('UnauthorizedError invalid token', async () => {
    const response = await request(app)
      .get(`/api/v1/networks/${TEST_NETWORKS.network_1.code}/measurements`)
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
      .get(`/api/v1/networks/${TEST_NETWORKS.network_1.code}/measurements`)
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
      .get(`/api/v1/networks/${TEST_NETWORKS.network_1.code}/measurements`)
      .query({ sensorMacs: 'FF:FF:FF:FF:FF:FF' })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toBeInstanceOf(Array);
    expect(response.body).toHaveLength(0);
  });

  /*
    it('should handle multiple identical sensor MAC addresses in query', async () => {
      const duplicatedMac = TEST_SENSORS.sensor1_gate1_net2.macAddress;
   
      const response = await request(app)
        .get(`/api/v1/networks/${TEST_NETWORKS.network_2.code}/measurements`)
        .query({ sensorMacs: [duplicatedMac, duplicatedMac] })
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
   
      expect(response.body).toHaveLength(1);
      expect(response.body[0].sensorMacAddress).toBe(duplicatedMac);
    });*/


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



