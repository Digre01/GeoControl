import request from "supertest";
import { app } from "@app";
import { generateToken } from "@services/authService";
import { beforeAllE2e, afterAllE2e, TEST_USERS, TEST_NETWORKS, TEST_GATEWAYS, TEST_SENSORS } from "@test/e2e/lifecycle";

let token_admin: string;
let token_operator: string;
let token_viewer: string;
let network;
let gateway;
let sensor;

beforeEach(async () => {
    await beforeAllE2e();
    token_admin = generateToken(TEST_USERS.admin);
    token_operator = generateToken(TEST_USERS.operator);
    token_viewer = generateToken(TEST_USERS.viewer);
    network = TEST_NETWORKS.network_1;
    gateway = TEST_GATEWAYS.gate1_net1;
    sensor = TEST_SENSORS.sensor1_gate1_net1;
});

afterEach(async () => {
    await afterAllE2e();
});

describe("GET /networks/{networkCode}/gateways/{gatewayMac}/sensors (e2e)", () => {

  it("get all sensors, admin token", async () => {

    const res = await request(app)
      .get(`/api/v1/networks/${network.code}/gateways/${gateway.macAddress}/sensors`)
      .set("Authorization", `Bearer ${token_admin}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);

    const macAddresses = res.body.map((s: any) => s.macAddress).sort();
    const description = res.body.map((s: any) => s.description).sort();

    expect(macAddresses).toEqual(["10:01:01:00:00:01", "10:01:01:00:00:02"]);
    expect(description).toEqual(["Sensore temp", "Sensore temp"]);
  });

  it("get all sensors, operator token", async () => {

    const res = await request(app)
      .get(`/api/v1/networks/${network.code}/gateways/${gateway.macAddress}/sensors`)
      .set("Authorization", `Bearer ${token_operator}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);

    const macAddresses = res.body.map((s: any) => s.macAddress).sort();
    const description = res.body.map((s: any) => s.description).sort();

    expect(macAddresses).toEqual(["10:01:01:00:00:01", "10:01:01:00:00:02"]);
    expect(description).toEqual(["Sensore temp", "Sensore temp"]);
  });

  it("get all sensors, viewer token", async () => {

    const res = await request(app)
      .get(`/api/v1/networks/${network.code}/gateways/${gateway.macAddress}/sensors`)
      .set("Authorization", `Bearer ${token_viewer}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);

    const macAddresses = res.body.map((s: any) => s.macAddress).sort();
    const description = res.body.map((s: any) => s.description).sort();

    expect(macAddresses).toEqual(["10:01:01:00:00:01", "10:01:01:00:00:02"]);
    expect(description).toEqual(["Sensore temp", "Sensore temp"]);
  });


  it("get all sensors - Unauthorized", async () => {
    const res = await request(app)
      .get(`/api/v1/networks/${network.code}/gateways/${gateway.macAddress}/sensors`)

    expect(res.status).toBe(401);
  });

  
  it("get all sensors, network non existent - Entity not found ", async () => {
    const res = await request(app)
      .get(`/api/v1/networks/non_existent_network/gateways/${gateway.macAddress}/sensors`)
      .set("Authorization", `Bearer ${token_viewer}`);

    expect(res.status).toBe(404);
  });


  it("get all sensors, gateway non existent - Entity not found ", async () => {
    const res = await request(app)
      .get(`/api/v1/networks/${network.code}/gateways/non_existent_gateway/sensors`)
      .set("Authorization", `Bearer ${token_viewer}`);

    expect(res.status).toBe(404);
  });

});


describe("GET /networks/{networkCode}/gateways/{gatewayMac}/sensors/{sensorMac} (e2e)", () => {

  it("get sensor, admin token", async () => {

    const res = await request(app)
      .get(`/api/v1/networks/${network.code}/gateways/${gateway.macAddress}/sensors/${sensor.macAddress}`)
      .set("Authorization", `Bearer ${token_admin}`);

    expect(res.status).toBe(200);

    const result = res.body;

    expect(result).toEqual(sensor);
  });
  
  it("get sensor, operator token", async () => {

    const res = await request(app)
      .get(`/api/v1/networks/${network.code}/gateways/${gateway.macAddress}/sensors/${sensor.macAddress}`)
      .set("Authorization", `Bearer ${token_operator}`);

    expect(res.status).toBe(200);

    const result = res.body;

    expect(result).toEqual(sensor);
  });


  it("get sensor, viewer token", async () => {

    const res = await request(app)
      .get(`/api/v1/networks/${network.code}/gateways/${gateway.macAddress}/sensors/${sensor.macAddress}`)
      .set("Authorization", `Bearer ${token_viewer}`);

    expect(res.status).toBe(200);

    const result = res.body;

    expect(result).toEqual(sensor);
  });


  it("get sensor - Unauthorized", async () => {
    const res = await request(app)
      .get(`/api/v1/networks/${network.code}/gateways/${gateway.macAddress}/sensors/${sensor.macAddress}`)

    expect(res.status).toBe(401);
  });

  
  it("get sensor, network missing - Entity not found ", async () => {
    const res = await request(app)
      .get(`/api/v1/networks/non_existent_network/gateways/${gateway.macAddress}/sensors/${sensor.macAddress}`)
      .set("Authorization", `Bearer ${token_viewer}`);

    expect(res.status).toBe(404);
  });

  
  it("get sensor, gateway missing - Entity not found ", async () => {
    const res = await request(app)
      .get(`/api/v1/networks/${network.code}/gateways/non_existent_gateway/sensors/${sensor.macAddress}`)
      .set("Authorization", `Bearer ${token_viewer}`);

    expect(res.status).toBe(404);
  });


  it("get sensor, sensor missing - Entity not found ", async () => {
    const res = await request(app)
      .get(`/api/v1/networks/${network.code}/gateways/${gateway.macAddress}/sensors/non_existent_sensor`)
      .set("Authorization", `Bearer ${token_viewer}`);

    expect(res.status).toBe(404);
  });

});



describe("POST /networks/{networkCode}/gateways/{gatewayMac}/sensors (e2e)", () => {

  it("create sensor, admin token", async () => {

    const newSensor = {
      macAddress: "11:11:11:11",
      name: "new sensor",
      description: "new sensor"
    };

    const res = await request(app)
      .post(`/api/v1/networks/${network.code}/gateways/${gateway.macAddress}/sensors`)
      .set("Authorization", `Bearer ${token_admin}`)
      .send(newSensor);

    expect(res.status).toBe(201);

    const getRes = await request(app)
        .get(`/api/v1/networks/${network.code}/gateways/${gateway.macAddress}/sensors/11:11:11:11`)
        .set("Authorization", `Bearer ${token_admin}`);
    
    expect(getRes.status).toBe(200);
    expect(getRes.body.macAddress).toBe("11:11:11:11");
    expect(getRes.body.name).toBe("new sensor");
  });
  
  it("create sensor, operator token", async () => {

    const newSensor = {
      macAddress: "11:11:11:11",
      name: "new sensor",
      description: "new sensor"
    };

    const res = await request(app)
      .post(`/api/v1/networks/${network.code}/gateways/${gateway.macAddress}/sensors`)
      .set("Authorization", `Bearer ${token_operator}`)
      .send(newSensor);

    expect(res.status).toBe(201);

    const getRes = await request(app)
        .get(`/api/v1/networks/${network.code}/gateways/${gateway.macAddress}/sensors/11:11:11:11`)
        .set("Authorization", `Bearer ${token_admin}`);
    
    expect(getRes.status).toBe(200);
    expect(getRes.body.macAddress).toBe("11:11:11:11");
    expect(getRes.body.name).toBe("new sensor");
  });


  it("create sensor, viewer token - InsufficientRightsError", async () => {

    const newSensor = {
      macAddress: "11:11:11:11",
      name: "new sensor",
      description: "new sensor"
    };

    const res = await request(app)
      .post(`/api/v1/networks/${network.code}/gateways/${gateway.macAddress}/sensors`)
      .set("Authorization", `Bearer ${token_viewer}`)
      .send(newSensor);

    expect(res.status).toBe(403);
  });


  it("create sensor - Unauthorized", async () => {

    const newSensor = {
      macAddress: "11:11:11:11",
      name: "new sensor",
      description: "new sensor"
    };

    const res = await request(app)
      .post(`/api/v1/networks/${network.code}/gateways/${gateway.macAddress}/sensors`)
      .send(newSensor);

    expect(res.status).toBe(401);
  });

  
  it("create sensor - Network not found", async () => {

    const newSensor = {
      macAddress: "11:11:11:11",
      name: "new sensor",
      description: "new sensor"
    };

    const res = await request(app)
      .post(`/api/v1/networks/non_existent_network/gateways/${gateway.macAddress}/sensors`)
      .set("Authorization", `Bearer ${token_admin}`)
      .send(newSensor);

    expect(res.status).toBe(404);
  });


  it("create sensor - Gateway not found", async () => {

    const newSensor = {
      macAddress: "11:11:11:11",
      name: "new sensor",
      description: "new sensor"
    };

    const res = await request(app)
      .post(`/api/v1/networks/${network.code}/gateways/non_existent_gateway/sensors`)
      .set("Authorization", `Bearer ${token_admin}`)
      .send(newSensor);

    expect(res.status).toBe(404);
  });


  it("create sensor - Sensor mac address already in use", async () => {

    const newSensor = {
      macAddress: sensor.macAddress,
      name: "new sensor",
      description: "new sensor"
    };

    const res = await request(app)
      .post(`/api/v1/networks/${network.code}/gateways/${gateway.macAddress}/sensors`)
      .set("Authorization", `Bearer ${token_admin}`)
      .send(newSensor);

    expect(res.status).toBe(409);
  });

});


describe("PATCH /networks/{networkCode}/gateways/{gatewayMac}/sensors/{sensorMac} (e2e)", () => {

  it("update sensor, admin token", async () => {

    const updatedSensor = {
      macAddress: "11:11:11:11",
      name: "updated sensor",
      description: "updated sensor"
    };

    const res = await request(app)
      .patch(`/api/v1/networks/${network.code}/gateways/${gateway.macAddress}/sensors/${sensor.macAddress}`)
      .set("Authorization", `Bearer ${token_admin}`)
      .send(updatedSensor);

    expect(res.status).toBe(204);

    const getRes = await request(app)
        .get(`/api/v1/networks/${network.code}/gateways/${gateway.macAddress}/sensors/11:11:11:11`)
        .set("Authorization", `Bearer ${token_admin}`);
    
    expect(getRes.status).toBe(200);
    expect(getRes.body.macAddress).toBe("11:11:11:11");
    expect(getRes.body.name).toBe("updated sensor");
  });
  
  it("update sensor, operator token", async () => {

    const updatedSensor = {
      macAddress: "11:11:11:11",
      name: "updated sensor",
      description: "updated sensor"
    };

    const res = await request(app)
      .patch(`/api/v1/networks/${network.code}/gateways/${gateway.macAddress}/sensors/${sensor.macAddress}`)
      .set("Authorization", `Bearer ${token_operator}`)
      .send(updatedSensor);

    expect(res.status).toBe(204);

    const getRes = await request(app)
        .get(`/api/v1/networks/${network.code}/gateways/${gateway.macAddress}/sensors/11:11:11:11`)
        .set("Authorization", `Bearer ${token_admin}`);
    
    expect(getRes.status).toBe(200);
    expect(getRes.body.macAddress).toBe("11:11:11:11");
    expect(getRes.body.name).toBe("updated sensor");
  });


  it("update sensor, viewer token - InsufficientRightsError", async () => {

    const updatedSensor = {
      macAddress: "11:11:11:11",
      name: "updated sensor",
      description: "updated sensor"
    };

    const res = await request(app)
      .patch(`/api/v1/networks/${network.code}/gateways/${gateway.macAddress}/sensors/${sensor.macAddress}`)
      .set("Authorization", `Bearer ${token_viewer}`)
      .send(updatedSensor);

    expect(res.status).toBe(403);
  });


  it("update sensor - Unauthorized", async () => {

    const updatedSensor = {
      macAddress: "11:11:11:11",
      name: "updated sensor",
      description: "updated sensor"
    };

    const res = await request(app)
      .patch(`/api/v1/networks/${network.code}/gateways/${gateway.macAddress}/sensors/${sensor.macAddress}`)
      .send(updatedSensor);

    expect(res.status).toBe(401);
  });

  
  it("update sensor - Network not found", async () => {

    const updatedSensor = {
      macAddress: "11:11:11:11",
      name: "updated sensor",
      description: "updated sensor"
    };

    const res = await request(app)
      .patch(`/api/v1/networks/non_existent_network/gateways/${gateway.macAddress}/sensors/${sensor.macAddress}`)
      .set("Authorization", `Bearer ${token_admin}`)
      .send(updatedSensor);

    expect(res.status).toBe(404);
  });


  it("update sensor - Gateway not found", async () => {

    const updatedSensor = {
      macAddress: "11:11:11:11",
      name: "updated sensor",
      description: "updated sensor"
    };

    const res = await request(app)
      .patch(`/api/v1/networks/${network.code}/gateways/non_existent_gateway/sensors/${sensor.macAddress}`)
      .set("Authorization", `Bearer ${token_admin}`)
      .send(updatedSensor);

    expect(res.status).toBe(404);
  });


  it("update sensor - Sensor not found", async () => {

    const updatedSensor = {
      macAddress: "11:11:11:11",
      name: "updated sensor",
      description: "updated sensor"
    };

    const res = await request(app)
      .patch(`/api/v1/networks/${network.code}/gateways/${gateway.macAddress}/sensors/non_existent_sensor`)
      .set("Authorization", `Bearer ${token_admin}`)
      .send(updatedSensor);

    expect(res.status).toBe(404);
  });

  it("update sensor - Sensor mac address already in use", async () => {

    const sensor2 = TEST_SENSORS.sensor2_gate1_net1;

    const updatedSensor = {
      macAddress: sensor.macAddress,
      name: "updated sensor",
      description: "updated sensor"
    };

    const res = await request(app)
      .patch(`/api/v1/networks/${network.code}/gateways/${gateway.macAddress}/sensors/${sensor2.macAddress}`)
      .set("Authorization", `Bearer ${token_admin}`)
      .send(updatedSensor);

    expect(res.status).toBe(409);
  });

});


describe("DELETE /networks/{networkCode}/gateways/{gatewayMac}/sensors/{sensorMac} (e2e)", () => {

  it("delete sensor, admin token", async () => {

    const res = await request(app)
      .delete(`/api/v1/networks/${network.code}/gateways/${gateway.macAddress}/sensors/${sensor.macAddress}`)
      .set("Authorization", `Bearer ${token_admin}`);

    expect(res.status).toBe(204);
  });
  
  it("delete sensor, operator token", async () => {

    const res = await request(app)
      .delete(`/api/v1/networks/${network.code}/gateways/${gateway.macAddress}/sensors/${sensor.macAddress}`)
      .set("Authorization", `Bearer ${token_operator}`);

    expect(res.status).toBe(204);
  });


  it("delete sensor, viewer token - Insufficient Rights Error", async () => {

    const res = await request(app)
      .delete(`/api/v1/networks/${network.code}/gateways/${gateway.macAddress}/sensors/${sensor.macAddress}`)
      .set("Authorization", `Bearer ${token_viewer}`);

    expect(res.status).toBe(403);
  });


  it("delete sensor - Unauthorized", async () => {
    const res = await request(app)
      .delete(`/api/v1/networks/${network.code}/gateways/${gateway.macAddress}/sensors/${sensor.macAddress}`)

    expect(res.status).toBe(401);
  });

  
  it("delete sensor, network missing - Entity not found ", async () => {
    const res = await request(app)
      .delete(`/api/v1/networks/non_existent_network/gateways/${gateway.macAddress}/sensors/${sensor.macAddress}`)
      .set("Authorization", `Bearer ${token_admin}`);

    expect(res.status).toBe(404);
  });


  it("delete sensor, gateway missing - Entity not found ", async () => {
    const res = await request(app)
      .delete(`/api/v1/networks/${network.code}/gateways/non_existent_gateway/sensors/${sensor.macAddress}`)
      .set("Authorization", `Bearer ${token_admin}`);

    expect(res.status).toBe(404);
  });


  it("delete sensor, sensor missing - Entity not found ", async () => {
    const res = await request(app)
      .delete(`/api/v1/networks/${network.code}/gateways/${gateway.macAddress}/sensors/non_existent_sensor`)
      .set("Authorization", `Bearer ${token_admin}`);

    expect(res.status).toBe(404);
  });

});