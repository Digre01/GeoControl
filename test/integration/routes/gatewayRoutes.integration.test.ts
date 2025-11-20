import request from "supertest";
import { app } from "@app";
import * as authService from "@services/authService";
import * as gatewayController from "@controllers/gatewayController";
import { UserType } from "@models/UserType";
import { Gateway as GatewayDTO } from "@dto/Gateway";
import { UnauthorizedError } from "@models/errors/UnauthorizedError";
import { InsufficientRightsError } from "@models/errors/InsufficientRightsError";
import { NotFoundError } from "@models/errors/NotFoundError";
import { ConflictError } from "@models/errors/ConflictError";
import { FAKE_DATA } from "@test/fakeDataDAO/fakeDataDAOforGateways";
import { NetworkDAO } from "@models/dao/NetworkDAO";
import { GatewayDAO } from "@models/dao/GatewayDAO";

jest.mock("@services/authService");
jest.mock("@controllers/gatewayController");

describe("GatewayRoutes integration", () => {
  const token = "Bearer faketoken";
  const network: NetworkDAO = FAKE_DATA.FAKE_NETWORKS[0];

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("get all gateways", async () => {
    const mockGatewaysDAO: GatewayDAO[] = [
        FAKE_DATA.FAKE_GATEWAYS[0],
        FAKE_DATA.FAKE_GATEWAYS[1],
        FAKE_DATA.FAKE_GATEWAYS[2],
    ];

    const mockGatewaysDTO: GatewayDTO[] = mockGatewaysDAO.map(gateway => {
        const dto: any = { macAddress: gateway.macAddress };

        if (gateway.name !== undefined && gateway.name !== null) {
            dto.name = gateway.name;
        }

        if (gateway.description !== undefined && gateway.description !== null) {
            dto.description = gateway.description;
        }

        return dto;
    });

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (gatewayController.getAllGateways as jest.Mock).mockResolvedValue(mockGatewaysDTO);

    const response = await request(app)
      .get(`/api/v1/networks/${network.code}/gateways`)
      .set("Authorization", token);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockGatewaysDTO);
    expect(authService.processToken).toHaveBeenCalledWith(token, [
      UserType.Admin,
      UserType.Operator,
      UserType.Viewer
    ]);
    expect(gatewayController.getAllGateways).toHaveBeenCalledWith(network.code);
  });

  it("get all gateways: 401 UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized: No token provided");
    });

    const response = await request(app)
      .get(`/api/v1/networks/${network.code}/gateways`)
      .set("Authorization", "Bearer invalid");

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/Unauthorized/);
  });

  it("get all gateways: 404 NotFoundError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (gatewayController.getAllGateways as jest.Mock).mockImplementation(() => {
        throw new NotFoundError("Entity not found");
    });

    const response = await request(app)
        .get(`/api/v1/networks/${network.code}/gateways`)
        .set("Authorization", token);

    expect(response.status).toBe(404);
    expect(response.body.message).toMatch(/Entity not found/);
  });

  it("get all users: 500 InternalServerError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);

    (gatewayController.getAllGateways as jest.Mock).mockImplementation(() => {
      throw new Error("Internal server error");
    });

    const response = await request(app)
      .get(`/api/v1/networks/${network.code}/gateways`)
      .set("Authorization", token);

    expect(response.status).toBe(500);
    expect(response.body.message).toMatch(/Internal server error/);
  });
});


describe("getGateway", () => {
  const token = "Bearer faketoken";
  const network: NetworkDAO = FAKE_DATA.FAKE_NETWORKS[0];

  const mockGatewayDAO: GatewayDAO = FAKE_DATA.FAKE_GATEWAYS[0];

  const mockGatewayDTO: GatewayDTO = {
    macAddress: mockGatewayDAO.macAddress,
  };

  if (mockGatewayDAO.name !== undefined && mockGatewayDAO.name !== null) {
    mockGatewayDTO.name = mockGatewayDAO.name;
  }

  if (mockGatewayDAO.description !== undefined && mockGatewayDAO.name !== null) {
    mockGatewayDTO.description = mockGatewayDAO.description;
  }

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("getGateway", async () => {

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (gatewayController.getGateway as jest.Mock).mockResolvedValue(mockGatewayDTO);

    const response = await request(app)
      .get(`/api/v1/networks/${network.code}/gateways/${mockGatewayDTO.macAddress}`)
      .set("Authorization", token);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockGatewayDTO);
    expect(authService.processToken).toHaveBeenCalledWith(token, [
      UserType.Admin,
      UserType.Operator,
      UserType.Viewer
    ]);
    expect(gatewayController.getGateway).toHaveBeenCalledWith(network.code, mockGatewayDTO.macAddress);
  });

  it("get gateway: 401 UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized: No token provided");
    });

    const response = await request(app)
      .get(`/api/v1/networks/${network.code}/gateways/${mockGatewayDTO.macAddress}`)
      .set("Authorization", "Bearer invalid");

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/Unauthorized/);
  });

  it("get gateway: 404 NotFoundError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new NotFoundError("Entity not found");
    });

    const response = await request(app)
      .get(`/api/v1/networks/${network.code}/gateways/${mockGatewayDTO.macAddress}`)
      .set("Authorization", token);

    expect(response.status).toBe(404);
    expect(response.body.message).toMatch(/Entity not found/);
  });

  it("get user: 500 InternalServerError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);

    (gatewayController.getGateway as jest.Mock).mockImplementation(() => {
      throw new Error("Internal server error");
    });

    const response = await request(app)
      .get(`/api/v1/networks/${network.code}/gateways/${mockGatewayDTO.macAddress}`)
      .set("Authorization", token);

    expect(response.status).toBe(500);
    expect(response.body.message).toMatch(/Internal server error/);
  });
});


describe("createGateway", () => {
  const token = "Bearer faketoken";
  const network: NetworkDAO = FAKE_DATA.FAKE_NETWORKS[0];

  const mockGatewayDAO: GatewayDAO = FAKE_DATA.FAKE_GATEWAYS[0];

  const mockGatewayDTO: GatewayDTO = {
    macAddress: mockGatewayDAO.macAddress,
  };

  if (mockGatewayDAO.name !== undefined && mockGatewayDAO.name !== null) {
    mockGatewayDTO.name = mockGatewayDAO.name;
  }

  if (mockGatewayDAO.description !== undefined && mockGatewayDAO.name !== null) {
    mockGatewayDTO.description = mockGatewayDAO.description;
  }

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("create gateway", async () => {
    const newGateway: GatewayDTO = {
        macAddress: "11:22:33:44",
        name: "New Gateway",
        description: "Newly created"
    };

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (gatewayController.createGateway as jest.Mock).mockResolvedValue(undefined);

    const response = await request(app)
      .post(`/api/v1/networks/${network.code}/gateways`)
      .set("Authorization", token)
      .send(newGateway);

    expect(response.status).toBe(201);
    expect(authService.processToken).toHaveBeenCalledWith(token, [
      UserType.Admin,
      UserType.Operator
    ]);
    expect(gatewayController.createGateway).toHaveBeenCalledWith(network.code, newGateway);
  });

  it("create gateway: 400 BadRequest", async () => {
    const response = await request(app)
      .post(`/api/v1/networks/${network.code}/gateways`)
      .set("Authorization", token)
      .send({
        // manca macAddress
        name: "New Gateway",
        description: "Newly created"
       });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/body/);
  });

  it("create gateway: 401 UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized: No token provided");
    });

    const response = await request(app)
      .post(`/api/v1/networks/${network.code}/gateways`)
      .set("Authorization", "Bearer invalid")
      .send({
        macAddress: "11:22:33:44",
        name: "New Gateway",
        description: "Newly created"
       });

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/Unauthorized/);
  });

  it("create gateway: 403 InsufficientRightsError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new InsufficientRightsError("Forbidden: Insufficient rights");
    });

    const response = await request(app)
      .post(`/api/v1/networks/${network.code}/gateways`)
      .set("Authorization", token)
      .send({
        macAddress: "11:22:33:44",
        name: "New Gateway",
        description: "Newly created"
       });

    expect(response.status).toBe(403);
    expect(response.body.message).toMatch(/Insufficient rights/);
  });

  it("create gateway: 404 Not Found", async () => {
    const newGateway: GatewayDTO = {
        macAddress: "11:22:33:44",
        name: "New Gateway",
        description: "Newly created"
    };

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (gatewayController.createGateway as jest.Mock).mockImplementation(() => {
        throw new NotFoundError("Network not found");
    });

    const response = await request(app)
        .post("/api/v1/networks/non_existent_network/gateways")
        .set("Authorization", "Bearer faketoken")
        .send(newGateway);

    expect(response.status).toBe(404);
    expect(response.body.message).toMatch(/not found/);
    expect(authService.processToken).toHaveBeenCalledWith(token, [
      UserType.Admin,
      UserType.Operator
    ]);
    expect(gatewayController.createGateway).toHaveBeenCalledWith("non_existent_network", newGateway);
  });

  it("create gateway: 409 ConflictError", async () => {
    const newGateway: GatewayDTO = {
        macAddress: "11:22:33:44",
        name: "New Gateway",
        description: "Newly created"
    };

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);

    (gatewayController.createGateway as jest.Mock).mockImplementation(() => {
      throw new ConflictError("Entity with code xxxxx already exists");
    });

    const response = await request(app)
      .post(`/api/v1/networks/${network.code}/gateways`)
      .set("Authorization", token)
      .send(newGateway);

    expect(response.status).toBe(409);
    expect(response.body.message).toMatch(/exist/);
    expect(authService.processToken).toHaveBeenCalledWith(token, [
      UserType.Admin,
      UserType.Operator
    ]);
    expect(gatewayController.createGateway).toHaveBeenCalledWith(network.code, newGateway);
  });

  it("create gateway: 500 InternalServerError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (gatewayController.createGateway as jest.Mock).mockImplementation(() => {
      throw new Error("Internal server error");
    });

    const response = await request(app)
      .post(`/api/v1/networks/${network.code}/gateways`)
      .set("Authorization", token)
      .send({
        macAddress: "11:22:33:44",
        name: "New Gateway",
        description: "Newly created"
       });

    expect(response.status).toBe(500);
    expect(response.body.message).toMatch(/Internal server error/);
    expect(authService.processToken).toHaveBeenCalledWith(token, [
      UserType.Admin,
      UserType.Operator
    ]);
  });

});


describe("updateGateway", () => {
  const token = "Bearer faketoken";
  const network: NetworkDAO = FAKE_DATA.FAKE_NETWORKS[0];

  const mockGatewayDAO: GatewayDAO = FAKE_DATA.FAKE_GATEWAYS[0];

  const mockGatewayDTO: GatewayDTO = {
    macAddress: mockGatewayDAO.macAddress,
  };

  if (mockGatewayDAO.name !== undefined && mockGatewayDAO.name !== null) {
    mockGatewayDTO.name = mockGatewayDAO.name;
  }

  if (mockGatewayDAO.description !== undefined && mockGatewayDAO.name !== null) {
    mockGatewayDTO.description = mockGatewayDAO.description;
  }

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("update gateway", async () => {
    const updatedGateway: GatewayDTO = {
        macAddress: "11:22:33:55",
        name: "Updated Gateway",
        description: "update"
    };

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (gatewayController.updateGateway as jest.Mock).mockResolvedValue(undefined);

    const response = await request(app)
      .patch(`/api/v1/networks/${network.code}/gateways/${mockGatewayDTO.macAddress}`)
      .set("Authorization", token)
      .send(updatedGateway);

    expect(response.status).toBe(204);
    expect(authService.processToken).toHaveBeenCalledWith(token, [
      UserType.Admin,
      UserType.Operator
    ]);
    expect(gatewayController.updateGateway).toHaveBeenCalledWith(network.code, mockGatewayDTO.macAddress, updatedGateway);
  });

  it("update gateway: 400 BadRequest", async () => {
    const response = await request(app)
      .patch(`/api/v1/networks/${network.code}/gateways/${mockGatewayDTO.macAddress}`)
      .set("Authorization", token)
      .send({
        macAddress: ""
       });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/body/);
  });

  it("update gateway: 401 UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized: No token provided");
    });

    const response = await request(app)
      .patch(`/api/v1/networks/${network.code}/gateways/${mockGatewayDTO.macAddress}`)
      .set("Authorization", "Bearer invalid")
      .send({
        macAddress: "11:22:33:55",
        name: "Updated Gateway",
        description: "update"
       });

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/Unauthorized/);
  });

  it("update gateway: 403 InsufficientRightsError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new InsufficientRightsError("Forbidden: Insufficient rights");
    });

    const response = await request(app)
      .patch(`/api/v1/networks/${network.code}/gateways/${mockGatewayDTO.macAddress}`)
      .set("Authorization", token)
      .send({
        macAddress: "11:22:33:55",
        name: "Updated Gateway",
        description: "update"
       });

    expect(response.status).toBe(403);
    expect(response.body.message).toMatch(/Insufficient rights/);
  });

  it("update gateway: 404 Not Found", async () => {
    const updatedGateway: GatewayDTO = {
        macAddress: "11:22:33:55",
        name: "Updated Gateway",
        description: "update"
    };

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (gatewayController.updateGateway as jest.Mock).mockImplementation(() => {
        throw new NotFoundError("Network not found");
    });

    const response = await request(app)
        .patch(`/api/v1/networks/${network.code}/gateways/non_existent_mac`)
        .set("Authorization", "Bearer faketoken")
        .send(updatedGateway);

    expect(response.status).toBe(404);
    expect(response.body.message).toMatch(/not found/);
    expect(authService.processToken).toHaveBeenCalledWith(token, [
      UserType.Admin,
      UserType.Operator
    ]);
    expect(gatewayController.updateGateway).toHaveBeenCalledWith(network.code, "non_existent_mac", updatedGateway);
  });

  it("update gateway: 409 ConflictError", async () => {
    const updatedGateway: GatewayDTO = {
        macAddress: "11:22:33:55",
        name: "Updated Gateway",
        description: "update"
    };

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);

    (gatewayController.updateGateway as jest.Mock).mockImplementation(() => {
      throw new ConflictError("Entity with code xxxxx already exists");
    });

    const response = await request(app)
      .patch(`/api/v1/networks/${network.code}/gateways/${mockGatewayDTO.macAddress}`)
      .set("Authorization", token)
      .send(updatedGateway);

    expect(response.status).toBe(409);
    expect(response.body.message).toMatch(/exist/);
    expect(authService.processToken).toHaveBeenCalledWith(token, [
      UserType.Admin,
      UserType.Operator
    ]);
    expect(gatewayController.updateGateway).toHaveBeenCalledWith(network.code, mockGatewayDTO.macAddress, updatedGateway);
  });

  it("update gateway: 500 InternalServerError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (gatewayController.updateGateway as jest.Mock).mockImplementation(() => {
      throw new Error("Internal server error");
    });

    const response = await request(app)
      .patch(`/api/v1/networks/${network.code}/gateways/${mockGatewayDTO.macAddress}`)
      .set("Authorization", token)
      .send({
        macAddress: "11:22:33:55",
        name: "Updated Gateway",
        description: "update"
       });

    expect(response.status).toBe(500);
    expect(response.body.message).toMatch(/Internal server error/);
    expect(authService.processToken).toHaveBeenCalledWith(token, [
      UserType.Admin,
      UserType.Operator
    ]);
  });

});


describe("deleteGateway", () => {
  const token = "Bearer faketoken";
  const network: NetworkDAO = FAKE_DATA.FAKE_NETWORKS[0];

  const mockGatewayDAO: GatewayDAO = FAKE_DATA.FAKE_GATEWAYS[0];

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("delete gateway", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (gatewayController.deleteGateway as jest.Mock).mockResolvedValue(undefined);

    const response = await request(app)
      .delete(`/api/v1/networks/${network.code}/gateways/${mockGatewayDAO.macAddress}`)
      .set("Authorization", token);

    expect(response.status).toBe(204);
    expect(authService.processToken).toHaveBeenCalledWith(token, [
        UserType.Admin,
        UserType.Operator
    ]);
    expect(gatewayController.deleteGateway).toHaveBeenCalledWith(network.code, mockGatewayDAO.macAddress);
  });

  it("delete gateway: 401 UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized: No token provided");
    });

    const response = await request(app)
      .delete(`/api/v1/networks/${network.code}/gateways/${mockGatewayDAO.macAddress}`)
      .set("Authorization", "Bearer invalid");

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/Unauthorized/);
  });

  it("delete gateway: 403 InsufficientRightsError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new InsufficientRightsError("Forbidden: Insufficient rights");
    });

    const response = await request(app)
      .delete(`/api/v1/networks/${network.code}/gateways/${mockGatewayDAO.macAddress}`)
      .set("Authorization", token);

    expect(response.status).toBe(403);
    expect(response.body.message).toMatch(/Insufficient rights/);
  });      

  it("delete gateway: 404 NotFoundError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);

    (gatewayController.deleteGateway as jest.Mock).mockImplementation(() => {
      throw new NotFoundError("Entity not found");
    });

    const response = await request(app)
      .delete(`/api/v1/networks/${network.code}/gateways/non_existent_mac`)
      .set("Authorization", token);

    expect(response.status).toBe(404);
    expect(response.body.message).toMatch(/Entity not found/);
    expect(authService.processToken).toHaveBeenCalledWith(token, [
        UserType.Admin,
        UserType.Operator
    ]);
    expect(gatewayController.deleteGateway).toHaveBeenCalledWith(network.code, "non_existent_mac");
  });

  it("delete gateway: 500 InternalServerError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);

    (gatewayController.deleteGateway as jest.Mock).mockImplementation(() => {
      throw new Error("Internal server error");
    });

    const response = await request(app)
      .delete(`/api/v1/networks/${network.code}/gateways/${mockGatewayDAO.macAddress}`)
      .set("Authorization", token);

    expect(response.status).toBe(500);
    expect(response.body.message).toMatch(/Internal server error/);
    expect(gatewayController.deleteGateway).toHaveBeenCalledWith(network.code, mockGatewayDAO.macAddress);
  });

});
