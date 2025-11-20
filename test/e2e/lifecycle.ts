import {
  initializeTestDataSource,
  closeTestDataSource
} from "@test/setup/test-datasource";
import { UserRepository } from "@repositories/UserRepository";
import { UserType } from "@models/UserType";
import { NetworkRepository } from "@repositories/NetworkRepository";
import { GatewayRepository } from "@repositories/GatewayRepository";
import { SensorRepository } from "@repositories/SensorRepository";
import { MeasurementRepository } from "@repositories/MeasurementRepository";

export const TEST_USERS = {
  admin: { username: "admin", password: "adminpass", type: UserType.Admin },
  operator: {
    username: "operator",
    password: "operatorpass",
    type: UserType.Operator
  },
  viewer: { username: "viewer", password: "viewerpass", type: UserType.Viewer }
};

export const TEST_NETWORKS = {
  network_1: { code: "NET01", name: "Rete 1", description: "Rete 1" },
  network_2: { code: "NET02", name: "Rete 2", description: "Rete 2" },
  network_3: { code: "NET03", name: "Rete 3" }
}

export const TEST_GATEWAYS = {
  gate1_net1: { macAddress: "00:11:22:33:44:01", name: "Gateway 1 Rete 1 ", description: "Gateway 1 della Rete 1", sensors: [] },
  gate2_net1: { macAddress: "00:11:22:33:44:02", name: "Gateway 2 Rete 1 " },
  gate3_net1: { macAddress: "00:11:22:33:44:03", description: "Gateway 3 della Rete 1" },
  gate1_net2: { macAddress: "66:77:88:99:AA:01", name: "Gateway 1 Rete 2", description: "Gateway 1 della Rete 2" },
  gate2_net2: { macAddress: "66:77:88:99:AA:02", name: "Gateway 2 Rete 2" }
};

export const TEST_SENSORS = {
  sensor1_gate1_net1: { macAddress: "10:01:01:00:00:01", description: "Sensore temp", variable: "temperature", unit: "°C" },
  sensor2_gate1_net1: { macAddress: "10:01:01:00:00:02", description: "Sensore temp", variable: "temperature", unit: "°C" },
  sensor1_gate1_net2: { macAddress: "10:02:01:00:00:01", description: "Sensore temp", variable: "temperature", unit: "°C" },
  sensor2_gate1_net2: { macAddress: "10:02:01:00:00:02", description: "Sensore temp", variable: "temperature", unit: "°C" },
  sensor3_gate1_net2: { macAddress: "10:02:01:00:00:03", name: "Sensore 3 - GW 1 Rete 2", description: "Sensore hum", variable: "humidity", unit: "%" },

  sensor1_gate2_net2: { macAddress: "10:02:02:00:00:01", variable: "pressure", unit: "hPa" },
};

TEST_GATEWAYS.gate1_net1.sensors.push(TEST_SENSORS.sensor1_gate1_net1);
TEST_GATEWAYS.gate1_net1.sensors.push(TEST_SENSORS.sensor2_gate1_net1);

export const TEST_MEASUREMENTS = {
  meas1_sensor1_gate1_net1: { createdAt: new Date("2025-05-29T10:00:00+02:00"), value: 22.5 },
  meas2_sensor1_gate1_net1: { createdAt: new Date("2025-05-29T10:05:00+02:00"), value: 22.7 },
  meas3_sensor1_gate1_net1: { createdAt: new Date("2025-05-29T10:10:00+02:00"), value: 23.0 },

  meas1_sensor1_gate1_net2: { createdAt: new Date("2025-05-29T12:00:00+02:00"), value: 300 },
  meas2_sensor1_gate1_net2: { createdAt: new Date("2025-05-29T12:05:00+02:00"), value: 310 },
  meas3_sensor1_gate1_net2: { createdAt: new Date("2025-05-29T12:10:00+02:00"), value: 305 },

  meas1_sensor2_gate1_net2: { createdAt: new Date("2025-05-29T12:10:00+02:00"), value: 23.1 },

};



export async function beforeAllE2e() {
  await initializeTestDataSource();

  const repo = new UserRepository();
  await repo.createUser(
    TEST_USERS.admin.username,
    TEST_USERS.admin.password,
    TEST_USERS.admin.type
  );
  await repo.createUser(
    TEST_USERS.operator.username,
    TEST_USERS.operator.password,
    TEST_USERS.operator.type
  );
  await repo.createUser(
    TEST_USERS.viewer.username,
    TEST_USERS.viewer.password,
    TEST_USERS.viewer.type
  );

  const network_repo = new NetworkRepository();
  await network_repo.createNetwork(
    TEST_NETWORKS.network_1.code,
    TEST_NETWORKS.network_1.name,
    TEST_NETWORKS.network_1.description
  );
  await network_repo.createNetwork(
    TEST_NETWORKS.network_2.code,
    TEST_NETWORKS.network_2.name,
    TEST_NETWORKS.network_2.description
  );
  await network_repo.createNetwork(
    TEST_NETWORKS.network_3.code,
    TEST_NETWORKS.network_3.name
  );

  const gatewayRepo = new GatewayRepository();
  await gatewayRepo.createGateway(TEST_NETWORKS.network_1.code, TEST_GATEWAYS.gate1_net1);
  await gatewayRepo.createGateway(TEST_NETWORKS.network_1.code, TEST_GATEWAYS.gate2_net1);
  await gatewayRepo.createGateway(TEST_NETWORKS.network_1.code, TEST_GATEWAYS.gate3_net1);
  await gatewayRepo.createGateway(TEST_NETWORKS.network_2.code, TEST_GATEWAYS.gate1_net2);
  await gatewayRepo.createGateway(TEST_NETWORKS.network_2.code, TEST_GATEWAYS.gate2_net2);

  const sensorRepo = new SensorRepository();
  await sensorRepo.createSensor(TEST_NETWORKS.network_1.code, TEST_GATEWAYS.gate1_net1.macAddress, TEST_SENSORS.sensor1_gate1_net1);
  await sensorRepo.createSensor(TEST_NETWORKS.network_1.code, TEST_GATEWAYS.gate1_net1.macAddress, TEST_SENSORS.sensor2_gate1_net1);
  await sensorRepo.createSensor(TEST_NETWORKS.network_2.code, TEST_GATEWAYS.gate1_net2.macAddress, TEST_SENSORS.sensor1_gate1_net2);
  await sensorRepo.createSensor(TEST_NETWORKS.network_2.code, TEST_GATEWAYS.gate1_net2.macAddress, TEST_SENSORS.sensor2_gate1_net2);
  await sensorRepo.createSensor(TEST_NETWORKS.network_2.code, TEST_GATEWAYS.gate1_net2.macAddress, TEST_SENSORS.sensor3_gate1_net2);
  await sensorRepo.createSensor(TEST_NETWORKS.network_2.code, TEST_GATEWAYS.gate2_net2.macAddress, TEST_SENSORS.sensor1_gate2_net2);


  const measurementRepo = new MeasurementRepository();
  await measurementRepo.createMeasurement(TEST_NETWORKS.network_1.code, TEST_GATEWAYS.gate1_net1.macAddress, TEST_SENSORS.sensor1_gate1_net1.macAddress, TEST_MEASUREMENTS.meas1_sensor1_gate1_net1);
  await measurementRepo.createMeasurement(TEST_NETWORKS.network_1.code, TEST_GATEWAYS.gate1_net1.macAddress, TEST_SENSORS.sensor1_gate1_net1.macAddress, TEST_MEASUREMENTS.meas2_sensor1_gate1_net1);
  await measurementRepo.createMeasurement(TEST_NETWORKS.network_1.code, TEST_GATEWAYS.gate1_net1.macAddress, TEST_SENSORS.sensor1_gate1_net1.macAddress, TEST_MEASUREMENTS.meas3_sensor1_gate1_net1);
  await measurementRepo.createMeasurement(TEST_NETWORKS.network_2.code, TEST_GATEWAYS.gate1_net2.macAddress, TEST_SENSORS.sensor1_gate1_net2.macAddress, TEST_MEASUREMENTS.meas1_sensor1_gate1_net2);
  await measurementRepo.createMeasurement(TEST_NETWORKS.network_2.code, TEST_GATEWAYS.gate1_net2.macAddress, TEST_SENSORS.sensor1_gate1_net2.macAddress, TEST_MEASUREMENTS.meas2_sensor1_gate1_net2);
  await measurementRepo.createMeasurement(TEST_NETWORKS.network_2.code, TEST_GATEWAYS.gate1_net2.macAddress, TEST_SENSORS.sensor1_gate1_net2.macAddress, TEST_MEASUREMENTS.meas3_sensor1_gate1_net2);
  await measurementRepo.createMeasurement(TEST_NETWORKS.network_2.code, TEST_GATEWAYS.gate1_net2.macAddress, TEST_SENSORS.sensor2_gate1_net2.macAddress, TEST_MEASUREMENTS.meas1_sensor2_gate1_net2);
}

export async function afterAllE2e() {
  await closeTestDataSource();
}
