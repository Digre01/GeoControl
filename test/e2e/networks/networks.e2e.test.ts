import request from "supertest";
import { app } from "@app";
import { generateToken } from "@services/authService";
import { beforeAllE2e, afterAllE2e, TEST_USERS, TEST_NETWORKS } from "@test/e2e/lifecycle";

describe("GET /networks (e2e)", () => {
  let token: string;

  beforeAll(async () => {
    await beforeAllE2e();
    token = generateToken(TEST_USERS.admin);
  });

  afterAll(async () => {
    await afterAllE2e();
  });

  it("get all networks", async () => {
    const res = await request(app)
      .get("/api/v1/networks")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(3);

    const codes = res.body.map((n: any) => n.code).sort();
    const descriptions = res.body.map((n: any) => n.description).sort();

    expect(codes).toEqual(["NET01", "NET02", "NET03"]);
    expect(descriptions).toEqual(["Rete 1", "Rete 2"]);
  });

  it("get all networks - Unauthorized", async () => {
    const res = await request(app)
      .get("/api/v1/networks")

    expect(res.status).toBe(401);
  });
});

describe("POST /networks (e2e)", () => {
  let token: string;
  let token_viewer: string;

  beforeAll(async () => {
    await beforeAllE2e();
    token = generateToken(TEST_USERS.admin);
    token_viewer = generateToken(TEST_USERS.viewer)
  });

  afterAll(async () => {
    await afterAllE2e();
  });

  it("create network", async () => {
    const newNetwork = {
      code: "NET04",
      name: "Rete 4",
      description: "Rete 4"
    }

    const res = await request(app)
      .post("/api/v1/networks")
      .set("Authorization", `Bearer ${token}`)
      .send(newNetwork);

    expect(res.status).toBe(201);

    const getRes = await request(app)
      .get("/api/v1/networks/NET04")
      .set("Authorization", `Bearer ${token}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body.code).toBe("NET04");
    expect(getRes.body.name).toBe("Rete 4");
  });

  it("create network - Invalid input data", async () => {
    const newNetwork = {
      //code: "NET04",
      name: "Rete 4",
      description: "Rete 4"
    }

    const res = await request(app)
      .post("/api/v1/networks")
      .set("Authorization", `Bearer ${token}`)
      .send(newNetwork);

    expect(res.status).toBe(400);
  });

  it("create network - Unauthorized", async () => {
    const newNetwork = {
      code: "NET04",
      name: "Rete 4",
      description: "Rete 4"
    }

    const res = await request(app)
      .post("/api/v1/networks")
      .send(newNetwork);

    expect(res.status).toBe(401);
  });

  it("create network - Insufficient rights", async () => {
    const newNetwork = {
      code: "NET04",
      name: "Rete 4",
      description: "Rete 4"
    }

    const res = await request(app)
      .post("/api/v1/networks")
      .set("Authorization", `Bearer ${token_viewer}`)
      .send(newNetwork);

    expect(res.status).toBe(403);
  });

  it("create network - Network code already in use", async () => {
    const newNetwork = {
      code: "NET01",
      name: "Rete nuova",
      description: "Rete nuova"
    }

    const res = await request(app)
      .post("/api/v1/networks")
      .set("Authorization", `Bearer ${token}`)
      .send(newNetwork);

    expect(res.status).toBe(409);
  });

});

describe("GET /networks/{networkCode} (e2e)", () => {
  let token: string;

  beforeAll(async () => {
    await beforeAllE2e();
    token = generateToken(TEST_USERS.admin);
  });

  afterAll(async () => {
    await afterAllE2e();
  });

  it("get a specific network", async () => {
    const res = await request(app)
      .get("/api/v1/networks/NET01")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);

    expect(res.body.name).toEqual("Rete 1");
    expect(res.body.description).toEqual("Rete 1");
  });

  it("get a specific network - Unauthorized", async () => {
    const res = await request(app)
      .get("/api/v1/networks/NET01")

    expect(res.status).toBe(401);
  });

  it("get a specific network", async () => {
    const res = await request(app)
      .get("/api/v1/networks/non_existent_network")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});

describe("PATCH /networks/{networkCode} (e2e)", () => {
  let token: string;
  let token_viewer: string;

  beforeAll(async () => {
    await beforeAllE2e();
    token = generateToken(TEST_USERS.admin);
    token_viewer = generateToken(TEST_USERS.viewer)
  });

  afterAll(async () => {
    await afterAllE2e();
  });

  it("update a specific network", async () => {
    const updatedNetwork = {
      code: "NEWCODE",
      name: "Updated Name",
      description: "Updated Description"
    }

    const res = await request(app)
      .patch("/api/v1/networks/NET03")
      .set("Authorization", `Bearer ${token}`)
      .send(updatedNetwork);

    expect(res.status).toBe(204);

    const getRes = await request(app)
      .get("/api/v1/networks/NEWCODE")
      .set("Authorization", `Bearer ${token}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body.code).toBe("NEWCODE");
    expect(getRes.body.name).toBe("Updated Name");
  });

  it("update a specific network - Invalid input data", async () => {
    const updatedNetwork = {
      code: 1,
      name: "Updated Name",
      description: "Updated Description"
    }

    const res = await request(app)
      .patch("/api/v1/networks/NET01")
      .set("Authorization", `Bearer ${token}`)
      .send(updatedNetwork);

    expect(res.status).toBe(400);
  });

  it("update a specific network - Unauthorized", async () => {
    const updatedNetwork = {
      code: "NEWCODE",
      name: "Updated Name",
      description: "Updated Description"
    }

    const res = await request(app)
      .patch("/api/v1/networks/NET01")
      .send(updatedNetwork);

    expect(res.status).toBe(401);
  });

  it("update a specific network - Insufficient rights", async () => {
    const updatedNetwork = {
      code: "NEWCODE",
      name: "Updated Name",
      description: "Updated Description"
    }

    const res = await request(app)
      .patch("/api/v1/networks/NET01")
      .set("Authorization", `Bearer ${token_viewer}`)
      .send(updatedNetwork);

    expect(res.status).toBe(403);
  });

  it("update a specific network - Network not found", async () => {
    const updatedNetwork = {
      code: "NEWCODE",
      name: "Updated Name",
      description: "Updated Description"
    }

    const res = await request(app)
      .patch("/api/v1/networks/NET05")
      .set("Authorization", `Bearer ${token}`)
      .send(updatedNetwork);

    expect(res.status).toBe(404);
  });

  it("update a specific network - Network code already in use", async () => {
    const updatedNetwork = {
      code: "NET01",
      name: "Updated Name",
      description: "Updated Description"
    }

    const res = await request(app)
      .patch("/api/v1/networks/NET02")
      .set("Authorization", `Bearer ${token}`)
      .send(updatedNetwork);

    expect(res.status).toBe(409);
  });
});

describe("DELETE /networks/{networkCode} (e2e)", () => {
  let token: string;
  let token_viewer: string;

  beforeAll(async () => {
    await beforeAllE2e();
    token = generateToken(TEST_USERS.admin);
    token_viewer = generateToken(TEST_USERS.viewer)
  });

  afterAll(async () => {
    await afterAllE2e();
  });

  it("delete a specific network", async () => {
    const res = await request(app)
      .delete("/api/v1/networks/NET03")
      .set("Authorization", `Bearer ${token}`)

    expect(res.status).toBe(204);

    const getRes = await request(app)
      .get("/api/v1/networks/NET03")
      .set("Authorization", `Bearer ${token}`);

    expect(getRes.status).toBe(404);
  });

  it("delete a specific network - Unauthorized", async () => {
    const res = await request(app)
      .delete("/api/v1/networks/NET03")

    expect(res.status).toBe(401);
  });

  it("delete a specific network - Insufficient rights", async () => {
    const res = await request(app)
      .delete("/api/v1/networks/NET01")
      .set("Authorization", `Bearer ${token_viewer}`)

    expect(res.status).toBe(403);
  });

  it("delete a specific network - Network not found", async () => {
    const res = await request(app)
      .delete("/api/v1/networks/NET05")
      .set("Authorization", `Bearer ${token}`)

    expect(res.status).toBe(404);
  });



});