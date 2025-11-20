import request from "supertest";
import { app } from "@app";
import { generateToken } from "@services/authService";
import { beforeAllE2e, afterAllE2e, TEST_USERS } from "@test/e2e/lifecycle";

describe("POST /auth (e2e)", () => {

  beforeAll(async () => {
    await beforeAllE2e();
  });

  afterAll(async () => {
    await afterAllE2e();
  });

  it("Token generated successfully", async () => {
    const credentials = {
      username: "admin",
      password: "adminpass"
    };

    const res = await request(app)
      .post("/api/v1/auth")
      .send(credentials);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(typeof res.body.token).toBe("string");
  });

  it("Generate token - Invalid input data", async () => {
    const credentials = {
      //username: "admin",
      password: "adminpass"
    };

    const res = await request(app)
      .post("/api/v1/auth")
      .send(credentials);

    expect(res.status).toBe(400);
  });

  it("Generate token - Invalid password", async () => {
    const credentials = {
      username: "admin",
      password: "wrongadminpass"
    };

    const res = await request(app)
      .post("/api/v1/auth")
      .send(credentials);

    expect(res.status).toBe(401);
  });

  it("Generate token - User not found", async () => {
    const credentials = {
      username: "non_existent_user",
      password: "adminpass"
    };

    const res = await request(app)
      .post("/api/v1/auth")
      .send(credentials);

    expect(res.status).toBe(404);
  });


});