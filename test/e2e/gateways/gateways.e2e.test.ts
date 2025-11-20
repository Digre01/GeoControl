import request from "supertest";
import { app } from "@app";
import { generateToken } from "@services/authService";
import { beforeAllE2e, afterAllE2e, TEST_USERS, TEST_NETWORKS, TEST_GATEWAYS } from "@test/e2e/lifecycle";

let token_admin: string;
let token_operator: string;
let token_viewer: string;
let network;
let gateway;

beforeEach(async () => {
    await beforeAllE2e();
    token_admin = generateToken(TEST_USERS.admin);
    token_operator = generateToken(TEST_USERS.operator);
    token_viewer = generateToken(TEST_USERS.viewer);
    network = TEST_NETWORKS.network_1;
    gateway = TEST_GATEWAYS.gate1_net1;
});

afterEach(async () => {
    await afterAllE2e();
});

describe("GET /networks/{networkCode}/gateways (e2e)", () => {

  it("get all gateways, admin token", async () => {

    const res = await request(app)
      .get(`/api/v1/networks/${network.code}/gateways`)
      .set("Authorization", `Bearer ${token_admin}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(3);

    const macAddresses = res.body.map((g: any) => g.macAddress).sort();
    const names = res.body.map((g: any) => g.name).sort();

    expect(macAddresses).toEqual(["00:11:22:33:44:01", "00:11:22:33:44:02", "00:11:22:33:44:03"]);
    expect(names).toEqual(["Gateway 1 Rete 1 ", "Gateway 2 Rete 1 ", undefined]);
  });

  it("get all gateways, operator token", async () => {

    const network = TEST_NETWORKS.network_1;

    const res = await request(app)
      .get(`/api/v1/networks/${network.code}/gateways`)
      .set("Authorization", `Bearer ${token_operator}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(3);

    const macAddresses = res.body.map((g: any) => g.macAddress).sort();
    const names = res.body.map((g: any) => g.name).sort();

    expect(macAddresses).toEqual(["00:11:22:33:44:01", "00:11:22:33:44:02", "00:11:22:33:44:03"]);
    expect(names).toEqual(["Gateway 1 Rete 1 ", "Gateway 2 Rete 1 ", undefined]);
  });

  it("get all gateways, viewer token", async () => {

    const network = TEST_NETWORKS.network_1;

    const res = await request(app)
      .get(`/api/v1/networks/${network.code}/gateways`)
      .set("Authorization", `Bearer ${token_viewer}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(3);

    const macAddresses = res.body.map((g: any) => g.macAddress).sort();
    const names = res.body.map((g: any) => g.name).sort();

    expect(macAddresses).toEqual(["00:11:22:33:44:01", "00:11:22:33:44:02", "00:11:22:33:44:03"]);
    expect(names).toEqual(["Gateway 1 Rete 1 ", "Gateway 2 Rete 1 ", undefined]);
  });


  it("get all gateways - Unauthorized", async () => {
    const res = await request(app)
      .get(`/api/v1/networks/${network.code}/gateways`)

    expect(res.status).toBe(401);
  });

  
  it("get all gateways - Entity not found ", async () => {
    const res = await request(app)
      .get(`/api/v1/networks/non_existent_network/gateways`)
      .set("Authorization", `Bearer ${token_viewer}`);

    expect(res.status).toBe(404);
  });

});


describe("GET /networks/{networkCode}/gateways/{gatewayMac} (e2e)", () => {

  it("get gateway, admin token", async () => {

    const res = await request(app)
      .get(`/api/v1/networks/${network.code}/gateways/${gateway.macAddress}`)
      .set("Authorization", `Bearer ${token_admin}`);

    expect(res.status).toBe(200);

    const result = res.body;

    expect(result).toEqual(gateway);
  });
  
  it("get gateway, operator token", async () => {

    const res = await request(app)
      .get(`/api/v1/networks/${network.code}/gateways/${gateway.macAddress}`)
      .set("Authorization", `Bearer ${token_operator}`);

    expect(res.status).toBe(200);

    const result = res.body;

    expect(result).toEqual(gateway);
  });


  it("get gateway, viewer token", async () => {

    const res = await request(app)
      .get(`/api/v1/networks/${network.code}/gateways/${gateway.macAddress}`)
      .set("Authorization", `Bearer ${token_viewer}`);

    expect(res.status).toBe(200);

    const result = res.body;

    expect(result).toEqual(gateway);
  });


  it("get gateway - Unauthorized", async () => {
    const res = await request(app)
      .get(`/api/v1/networks/${network.code}/gateways/${gateway.macAddress}`)

    expect(res.status).toBe(401);
  });

  
  it("get gateway, network missing - Entity not found ", async () => {
    const res = await request(app)
      .get(`/api/v1/networks/non_existent_network/gateways/${gateway.macAddress}`)
      .set("Authorization", `Bearer ${token_viewer}`);

    expect(res.status).toBe(404);
  });

  it("get gateway, gateway missing - Entity not found ", async () => {
    const res = await request(app)
      .get(`/api/v1/networks/${network.code}/gateways/non_existent_gateway`)
      .set("Authorization", `Bearer ${token_viewer}`);

    expect(res.status).toBe(404);
  });

});


describe("POST /networks/{networkCode}/gateways (e2e)", () => {

  it("create gateway, admin token", async () => {

    const newGateway = {
      macAddress: "11:11:11:11",
      name: "new gateway",
      description: "new gateway"
    };

    const res = await request(app)
      .post(`/api/v1/networks/${network.code}/gateways`)
      .set("Authorization", `Bearer ${token_admin}`)
      .send(newGateway);

    expect(res.status).toBe(201);

    const getRes = await request(app)
        .get(`/api/v1/networks/${network.code}/gateways/11:11:11:11`)
        .set("Authorization", `Bearer ${token_admin}`);
    
    expect(getRes.status).toBe(200);
    expect(getRes.body.macAddress).toBe("11:11:11:11");
    expect(getRes.body.name).toBe("new gateway");
  });
  
  it("create gateway, operator token", async () => {

    const newGateway = {
      macAddress: "11:11:11:11",
      name: "new gateway",
      description: "new gateway"
    };

    const res = await request(app)
      .post(`/api/v1/networks/${network.code}/gateways`)
      .set("Authorization", `Bearer ${token_operator}`)
      .send(newGateway);

    expect(res.status).toBe(201);

    const getRes = await request(app)
        .get(`/api/v1/networks/${network.code}/gateways/11:11:11:11`)
        .set("Authorization", `Bearer ${token_admin}`);
    
    expect(getRes.status).toBe(200);
    expect(getRes.body.macAddress).toBe("11:11:11:11");
    expect(getRes.body.name).toBe("new gateway");
  });


  it("create gateway, viewer token - InsufficientRightsError", async () => {

    const newGateway = {
      macAddress: "11:11:11:11",
      name: "new gateway",
      description: "new gateway"
    };

    const res = await request(app)
      .post(`/api/v1/networks/${network.code}/gateways`)
      .set("Authorization", `Bearer ${token_viewer}`)
      .send(newGateway);

    expect(res.status).toBe(403);
  });


  it("create gateway - Unauthorized", async () => {

    const newGateway = {
      macAddress: "11:11:11:11",
      name: "new gateway",
      description: "new gateway"
    };

    const res = await request(app)
      .post(`/api/v1/networks/${network.code}/gateways`)
      .send(newGateway);

    expect(res.status).toBe(401);
  });

  
  it("create gateway - Network not found", async () => {

    const newGateway = {
      macAddress: "11:11:11:11",
      name: "new gateway",
      description: "new gateway"
    };

    const res = await request(app)
      .post(`/api/v1/networks/non_existent_network/gateways`)
      .set("Authorization", `Bearer ${token_admin}`)
      .send(newGateway);

    expect(res.status).toBe(404);
  });

  it("create gateway - Gateway mac address already in use", async () => {

    const newGateway = {
      macAddress: gateway.macAddress,
      name: "new gateway",
      description: "new gateway"
    };

    const res = await request(app)
      .post(`/api/v1/networks/${network.code}/gateways`)
      .set("Authorization", `Bearer ${token_admin}`)
      .send(newGateway);

    expect(res.status).toBe(409);
  });

});


describe("PATCH /networks/{networkCode}/gateways/{gatewayMac} (e2e)", () => {

  it("update gateway, admin token", async () => {

    const updatedGateway = {
      macAddress: "11:11:11:11",
      name: "updated gateway",
      description: "updated gateway"
    };

    const res = await request(app)
      .patch(`/api/v1/networks/${network.code}/gateways/${gateway.macAddress}`)
      .set("Authorization", `Bearer ${token_admin}`)
      .send(updatedGateway);

    expect(res.status).toBe(204);

    const getRes = await request(app)
        .get(`/api/v1/networks/${network.code}/gateways/11:11:11:11`)
        .set("Authorization", `Bearer ${token_admin}`);
    
    expect(getRes.status).toBe(200);
    expect(getRes.body.macAddress).toBe("11:11:11:11");
    expect(getRes.body.name).toBe("updated gateway");
  });
  
  it("update gateway, operator token", async () => {

    const updatedGateway = {
      macAddress: "11:11:11:11",
      name: "updated gateway",
      description: "updated gateway"
    };

    const res = await request(app)
      .patch(`/api/v1/networks/${network.code}/gateways/${gateway.macAddress}`)
      .set("Authorization", `Bearer ${token_operator}`)
      .send(updatedGateway);

    expect(res.status).toBe(204);

    const getRes = await request(app)
        .get(`/api/v1/networks/${network.code}/gateways/11:11:11:11`)
        .set("Authorization", `Bearer ${token_admin}`);
    
    expect(getRes.status).toBe(200);
    expect(getRes.body.macAddress).toBe("11:11:11:11");
    expect(getRes.body.name).toBe("updated gateway");
  });


  it("update gateway, viewer token - InsufficientRightsError", async () => {

    const updatedGateway = {
      macAddress: "11:11:11:11",
      name: "updated gateway",
      description: "updated gateway"
    };

    const res = await request(app)
      .patch(`/api/v1/networks/${network.code}/gateways/${gateway.macAddress}`)
      .set("Authorization", `Bearer ${token_viewer}`)
      .send(updatedGateway);

    expect(res.status).toBe(403);
  });


  it("update gateway - Unauthorized", async () => {

    const updatedGateway = {
      macAddress: "11:11:11:11",
      name: "updated gateway",
      description: "updated gateway"
    };

    const res = await request(app)
      .patch(`/api/v1/networks/${network.code}/gateways/${gateway.macAddress}`)
      .send(updatedGateway);

    expect(res.status).toBe(401);
  });

  
  it("update gateway - Network not found", async () => {

    const updatedGateway = {
      macAddress: "11:11:11:11",
      name: "updated gateway",
      description: "updated gateway"
    };

    const res = await request(app)
      .patch(`/api/v1/networks/non_existent_network/gateways/${gateway.macAddress}`)
      .set("Authorization", `Bearer ${token_admin}`)
      .send(updatedGateway);

    expect(res.status).toBe(404);
  });

  it("update gateway - Gateway mac address already in use", async () => {

    const gateway2 = TEST_GATEWAYS.gate2_net1;

    const updatedGateway = {
      macAddress: gateway.macAddress,
      name: "updated gateway",
      description: "updated gateway"
    };

    const res = await request(app)
      .patch(`/api/v1/networks/${network.code}/gateways/${gateway2.macAddress}`)
      .set("Authorization", `Bearer ${token_admin}`)
      .send(updatedGateway);

    expect(res.status).toBe(409);
  });

});


describe("DELETE /networks/{networkCode}/gateways/{gatewayMac} (e2e)", () => {

  it("delete gateway, admin token", async () => {

    const res = await request(app)
      .delete(`/api/v1/networks/${network.code}/gateways/${gateway.macAddress}`)
      .set("Authorization", `Bearer ${token_admin}`);

    expect(res.status).toBe(204);
  });
  
  it("delete gateway, operator token", async () => {

    const res = await request(app)
      .delete(`/api/v1/networks/${network.code}/gateways/${gateway.macAddress}`)
      .set("Authorization", `Bearer ${token_operator}`);

    expect(res.status).toBe(204);
  });


  it("delete gateway, viewer token - Insufficient Rights Error", async () => {

    const res = await request(app)
      .delete(`/api/v1/networks/${network.code}/gateways/${gateway.macAddress}`)
      .set("Authorization", `Bearer ${token_viewer}`);

    expect(res.status).toBe(403);
  });


  it("delete gateway - Unauthorized", async () => {
    const res = await request(app)
      .delete(`/api/v1/networks/${network.code}/gateways/${gateway.macAddress}`)

    expect(res.status).toBe(401);
  });

  
  it("delete gateway, network missing - Entity not found ", async () => {
    const res = await request(app)
      .delete(`/api/v1/networks/non_existent_network/gateways/${gateway.macAddress}`)
      .set("Authorization", `Bearer ${token_admin}`);

    expect(res.status).toBe(404);
  });

  it("delete gateway, gateway missing - Entity not found ", async () => {
    const res = await request(app)
      .delete(`/api/v1/networks/${network.code}/gateways/non_existent_gateway`)
      .set("Authorization", `Bearer ${token_admin}`);

    expect(res.status).toBe(404);
  });

});