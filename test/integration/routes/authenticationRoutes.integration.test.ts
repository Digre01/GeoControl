import request from "supertest";
import { app } from "@app";
import * as authController from "@controllers/authController";
import { UnauthorizedError } from "@models/errors/UnauthorizedError";
import { NotFoundError } from "@models/errors/NotFoundError";

jest.mock("@controllers/authController");

describe("Auth Route", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const validCredentials = {
    username: "admin",
    password: "securePass123"
  };

  it("auth", async () => {
    const fakeToken = { token: "Bearer faketoken" };

    (authController.getToken as jest.Mock).mockResolvedValue(fakeToken);

    const response = await request(app)
      .post("/api/v1/auth")
      .send(validCredentials);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(fakeToken);
    expect(authController.getToken).toHaveBeenCalledWith(validCredentials);
  });

  it("auth: 400 BadRequest", async () => {
    const response = await request(app)
      .post("/api/v1/auth")
      .send({
        
      }); // manca la password

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/body/);
  });

  it("auth: 401 UnauthorizedError", async () => {
    (authController.getToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized: Invalid token format");
    });

    const response = await request(app)
      .post("/api/v1/auth")
      .send(validCredentials);

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/Unauthorized/);
  });

  it("auth: 404 Not Found", async () => {
    (authController.getToken as jest.Mock).mockImplementation(() => {
      throw new NotFoundError("Entity not found");
    });

    const response = await request(app)
      .post("/api/v1/auth")
      .send(validCredentials);

    expect(response.status).toBe(404);
    expect(response.body.message).toMatch(/Entity not found/);
  });

  it("auth: 500 InternalServerError", async () => {
    (authController.getToken as jest.Mock).mockImplementation(() => {
      throw new Error("Internal server error");
    });

    const response = await request(app)
      .post("/api/v1/auth")
      .send(validCredentials);

    expect(response.status).toBe(500);
    expect(response.body.message).toMatch(/Internal server error/);
  });

});