import request from "supertest";
import { app } from "@app";
import * as authService from "@services/authService";
import * as userController from "@controllers/userController";
import { UserType } from "@models/UserType";
import { User as UserDTO } from "@dto/User";
import { UnauthorizedError } from "@models/errors/UnauthorizedError";
import { InsufficientRightsError } from "@models/errors/InsufficientRightsError";
import { NotFoundError } from "@models/errors/NotFoundError";
import { ConflictError } from "@models/errors/ConflictError";

jest.mock("@services/authService");
jest.mock("@controllers/userController");

describe("UserRoutes integration", () => {
  const token = "Bearer faketoken";

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("get all users", async () => {
    const mockUsers: UserDTO[] = [
      { username: "admin", type: UserType.Admin },
      { username: "viewer", type: UserType.Viewer }
    ];

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (userController.getAllUsers as jest.Mock).mockResolvedValue(mockUsers);

    const response = await request(app)
      .get("/api/v1/users")
      .set("Authorization", token);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockUsers);
    expect(authService.processToken).toHaveBeenCalledWith(token, [
      UserType.Admin
    ]);
    expect(userController.getAllUsers).toHaveBeenCalled();
  });

  it("get all users: 401 UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized: No token provided");
    });

    const response = await request(app)
      .get("/api/v1/users")
      .set("Authorization", "Bearer invalid");

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/Unauthorized/);
  });

  it("get all users: 403 InsufficientRightsError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new InsufficientRightsError("Forbidden: Insufficient rights");
    });

    const response = await request(app)
      .get("/api/v1/users")
      .set("Authorization", token);

    expect(response.status).toBe(403);
    expect(response.body.message).toMatch(/Insufficient rights/);
  });

  it("get all users: 500 InternalServerError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);

    (userController.getAllUsers as jest.Mock).mockImplementation(() => {
      throw new Error("Internal server error");
    });

    const response = await request(app)
      .get("/api/v1/users")
      .set("Authorization", token);

    expect(response.status).toBe(500);
    expect(response.body.message).toMatch(/Internal server error/);
  });
});


describe("getUser", () => {
  const token = "Bearer faketoken";

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("getUser", async () => {
    const mockUser: UserDTO ={ 
      username: "admin", 
      type: UserType.Admin 
    };

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (userController.getUser as jest.Mock).mockResolvedValue(mockUser);

    const response = await request(app)
      .get("/api/v1/users/admin")
      .set("Authorization", token);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockUser);
    expect(authService.processToken).toHaveBeenCalledWith(token, [
      UserType.Admin
    ]);
    expect(userController.getUser).toHaveBeenCalled();
  });

  it("get user: 401 UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized: No token provided");
    });

    const response = await request(app)
      .get("/api/v1/users/admin")
      .set("Authorization", "Bearer invalid");

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/Unauthorized/);
  });

  it("get user: 403 InsufficientRightsError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new InsufficientRightsError("Forbidden: Insufficient rights");
    });

    const response = await request(app)
      .get("/api/v1/users/admin")
      .set("Authorization", token);

    expect(response.status).toBe(403);
    expect(response.body.message).toMatch(/Insufficient rights/);
  });

  it("get user: 404 NotFoundError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (userController.getUser as jest.Mock).mockImplementation(() => {
      throw new NotFoundError("Entity not found");
    });

    const response = await request(app)
      .get("/api/v1/users/nonexistent")
      .set("Authorization", token);

    expect(response.status).toBe(404);
    expect(response.body.message).toMatch(/Entity not found/);
  });

  it("get user: 500 InternalServerError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);

    (userController.getUser as jest.Mock).mockImplementation(() => {
      throw new Error("Internal server error");
    });

    const response = await request(app)
      .get("/api/v1/users/admin")
      .set("Authorization", token);

    expect(response.status).toBe(500);
    expect(response.body.message).toMatch(/Internal server error/);
  });
});


describe("createUser", () => {
  const token = "Bearer faketoken";

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("create user", async () => {
    const newUser = {
      username: "s0123465",
      password: "FR90!5g@+ni",
      type: "admin"
    };

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (userController.createUser as jest.Mock).mockResolvedValue(undefined);

    const response = await request(app)
      .post("/api/v1/users")
      .set("Authorization", token)
      .send(newUser);

    expect(response.status).toBe(201);
    expect(authService.processToken).toHaveBeenCalledWith(token, [UserType.Admin]);
    expect(userController.createUser).toHaveBeenCalledWith(newUser);
  });

  it("create user: 400 BadRequest", async () => {
    const response = await request(app)
      .post("/api/v1/users")
      .set("Authorization", token)
      .send({
        username: "s0123465"
        // password e type mancano
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/body/);
  });

  it("create user: 401 UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized: No token provided");
    });

    const response = await request(app)
      .post("/api/v1/users")
      .set("Authorization", "Bearer invalid")
      .send({
        username: "s0123465",
        password: "FR90!5g@+ni",
        type: "admin"
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/Unauthorized/);
  });

  it("create user: 403 InsufficientRightsError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new InsufficientRightsError("Forbidden: Insufficient rights");
    });

    const response = await request(app)
      .post("/api/v1/users")
      .set("Authorization", token)
      .send({
        username: "s0123465",
        password: "FR90!5g@+ni",
        type: "admin"
      });

    expect(response.status).toBe(403);
    expect(response.body.message).toMatch(/Insufficient rights/);
  });

  it("create user: 409 ConflictError", async () => {
    const newUser = {
      username: "admin",
      password: "StrongPassword123!",
      type: "admin"
    };

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);

    (userController.createUser as jest.Mock).mockImplementation(() => {
      throw new ConflictError("Entity with code xxxxx already exists");
    });

    const response = await request(app)
      .post("/api/v1/users")
      .set("Authorization", token)
      .send(newUser);

    expect(response.status).toBe(409);
    expect(response.body.message).toMatch(/exist/);
    expect(authService.processToken).toHaveBeenCalledWith(token, [UserType.Admin]);
    expect(userController.createUser).toHaveBeenCalledWith(newUser);
  });

  it("create user: 500 InternalServerError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (userController.createUser as jest.Mock).mockImplementation(() => {
      throw new Error("Internal server error");
    });

    const response = await request(app)
      .post("/api/v1/users")
      .set("Authorization", token)
      .send({
        username: "s0123465",
        password: "FR90!5g@+ni",
        type: "admin"
      });

    expect(response.status).toBe(500);
    expect(response.body.message).toMatch(/Internal server error/);
  });

});


describe("deleteUser", () => {
  const token = "Bearer faketoken";

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("delete user", async () => {
    const usernameToDelete = "testuser";

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (userController.deleteUser as jest.Mock).mockResolvedValue(undefined);

    const response = await request(app)
      .delete("/api/v1/users/testuser")
      .set("Authorization", token);

    expect(response.status).toBe(204);
    expect(authService.processToken).toHaveBeenCalledWith(token, [UserType.Admin]);
    expect(userController.deleteUser).toHaveBeenCalledWith(usernameToDelete);
  });

  it("delete user: 401 UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized: No token provided");
    });

    const response = await request(app)
      .delete("/api/v1/users/testuser")
      .set("Authorization", "Bearer invalid");

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/Unauthorized/);
  });

  it("delete user: 403 InsufficientRightsError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new InsufficientRightsError("Forbidden: Insufficient rights");
    });

    const response = await request(app)
      .delete("/api/v1/users/testuser")
      .set("Authorization", token);

    expect(response.status).toBe(403);
    expect(response.body.message).toMatch(/Insufficient rights/);
  });      

  it("delete user: 404 NotFoundError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);

    (userController.deleteUser as jest.Mock).mockImplementation(() => {
      throw new NotFoundError("Entity not found");
    });

    const response = await request(app)
      .delete("/api/v1/users/nonexistentuser")
      .set("Authorization", token);

    expect(response.status).toBe(404);
    expect(response.body.message).toMatch(/Entity not found/);
  });

  it("delete user: 500 InternalServerError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);

    (userController.deleteUser as jest.Mock).mockImplementation(() => {
      throw new Error("Internal server error");
    });

    const response = await request(app)
      .delete("/api/v1/users/testuser")
      .set("Authorization", token);

    expect(response.status).toBe(500);
    expect(response.body.message).toMatch(/Internal server error/);
  });

});