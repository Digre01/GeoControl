import request from "supertest";
import { app } from "@app";
import { generateToken } from "@services/authService";
import { beforeAllE2e, afterAllE2e, TEST_USERS } from "@test/e2e/lifecycle";

describe("GET /users (e2e)", () => {
  let token: string;
  let token_viewer: string;

  beforeAll(async () => {
    await beforeAllE2e();
    token = generateToken(TEST_USERS.admin);
    token_viewer = generateToken(TEST_USERS.viewer);
  });

  afterAll(async () => {
    await afterAllE2e();
  });

  it("get all users", async () => {
    const res = await request(app)
      .get("/api/v1/users")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(3);

    const usernames = res.body.map((u: any) => u.username).sort();
    const types = res.body.map((u: any) => u.type).sort();

    expect(usernames).toEqual(["admin", "operator", "viewer"]);
    expect(types).toEqual(["admin", "operator", "viewer"]);
  });

  it("get all users - Unauthorized", async () => {
    const res = await request(app)
      .get("/api/v1/users")

    expect(res.status).toBe(401);
  });

  it("get all users - Insufficient rights", async () => {
    const res = await request(app)
      .get("/api/v1/users")
      .set("Authorization", `Bearer ${token_viewer}`);

    expect(res.status).toBe(403);
  });

});

describe("POST /users (e2e)", () => {
  let token: string;
  let token_viewer: string;

  beforeAll(async () => {
    await beforeAllE2e();
    token = generateToken(TEST_USERS.admin);
    token_viewer = generateToken(TEST_USERS.viewer);
  });

  afterAll(async () => {
    await afterAllE2e();
  });

  it("create user", async () => {
    const newUser = {
      username: "newuser",
      type: "viewer",
      password: "password"
    };

    const res = await request(app)
      .post("/api/v1/users")
      .set("Authorization", `Bearer ${token}`)
      .send(newUser);

    expect(res.status).toBe(201);

    const getRes = await request(app)
      .get("/api/v1/users/newuser")
      .set("Authorization", `Bearer ${token}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body.username).toBe("newuser");
    expect(getRes.body.type).toBe("viewer");
  });

  it("create user - Invalid input data", async () => {
    const newUser = {
      username: "newuser",
      type: "viewer",
      //password: "password"
    };

    const res = await request(app)
      .post("/api/v1/users")
      .set("Authorization", `Bearer ${token}`)
      .send(newUser);

    expect(res.status).toBe(400);
  });

  it("create user - Unauthorized", async () => {
    const newUser = {
      username: "newuser",
      type: "viewer",
      password: "password"
    };

    const res = await request(app)
      .post("/api/v1/users")
      .send(newUser);

    expect(res.status).toBe(401);
  });

  it("create user - Insufficient rights", async () => {
    const newUser = {
      username: "newuser",
      type: "viewer",
      password: "password"
    };

    const res = await request(app)
      .post("/api/v1/users")
      .set("Authorization", `Bearer ${token_viewer}`)
      .send(newUser);

    expect(res.status).toBe(403);
  });

  it("create user - Username already in use", async () => {
    const newUser = {
      username: "viewer",
      type: "viewer",
      password: "password"
    };

    const res = await request(app)
      .post("/api/v1/users")
      .set("Authorization", `Bearer ${token}`)
      .send(newUser);

    expect(res.status).toBe(409);
  });

});

describe("GET /users/{userName} (e2e)", () => {
  let token: string;
  let token_viewer: string;

  beforeAll(async () => {
    await beforeAllE2e();
    token = generateToken(TEST_USERS.admin);
    token_viewer = generateToken(TEST_USERS.viewer);
  });

  afterAll(async () => {
    await afterAllE2e();
  });

  it("get a specific user", async () => {
    const res = await request(app)
      .get("/api/v1/users/viewer")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);

    expect(res.body.username).toEqual("viewer");
    expect(res.body.type).toEqual("viewer");
  });

  it("get a specific user - Unauthorized", async () => {
    const res = await request(app)
      .get("/api/v1/users/viewer")

    expect(res.status).toBe(401);
  });

  it("get a specific user - Insufficient rights", async () => {
    const res = await request(app)
      .get("/api/v1/users/viewer")
      .set("Authorization", `Bearer ${token_viewer}`);

    expect(res.status).toBe(403);
  });

  it("get a specific user - User not found", async () => {
    const res = await request(app)
      .get("/api/v1/users/non_existent_user")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});

describe("DELETE /users/{userName} (e2e)", () => {
  let token: string;
  let token_operator: string;

  beforeAll(async () => {
    await beforeAllE2e();
    token = generateToken(TEST_USERS.admin);
    token_operator = generateToken(TEST_USERS.operator);
  });

  afterAll(async () => {
    await afterAllE2e();
  });

  it("delete a specific user", async () => {
    const res = await request(app)
      .delete("/api/v1/users/viewer")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(204);
  });

  it("delete a specific user - Unauthorized", async () => {
    const res = await request(app)
      .delete("/api/v1/users/viewer")

    expect(res.status).toBe(401);
  });

  it("delete a specific user - Insufficient rights", async () => {
    const res = await request(app)
      .delete("/api/v1/users/viewer")
      .set("Authorization", `Bearer ${token_operator}`);

    expect(res.status).toBe(403);
  });

  it("delete a specific user - User not found", async () => {
    const res = await request(app)
      .delete("/api/v1/users/non_existent_user")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});