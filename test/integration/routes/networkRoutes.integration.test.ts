import request from "supertest";
import { app } from "@app";
import * as authService from "@services/authService";
import * as networkController from "@controllers/networkController";
import { UserType } from "@models/UserType";
import { Network as NetworkDTO } from "@dto/Network";
import { UnauthorizedError } from "@models/errors/UnauthorizedError";
import { InsufficientRightsError } from "@models/errors/InsufficientRightsError";
import { NotFoundError } from "@models/errors/NotFoundError";
import { ConflictError } from "@models/errors/ConflictError";
import { FAKE_DATA } from "@test/fakeDataDAO/fakeDataDAOforNetworks";
import { NetworkDAO } from "@models/dao/NetworkDAO";

jest.mock("@services/authService");
jest.mock("@controllers/networkController");

describe("NetworkRoutes integration", () => {
  const token = "Bearer faketoken";

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("get all networks", async () => {
    const mockNetworksDAO: NetworkDAO[] = [
        FAKE_DATA.FAKE_NETWORKS[0],
        FAKE_DATA.FAKE_NETWORKS[1],
        FAKE_DATA.FAKE_NETWORKS[2],
    ];

    const mockNetworksDTO: NetworkDTO[] = mockNetworksDAO.map(network => {
        const dto: any = { code: network.code };

        if (network.name !== undefined && network.name !== null) {
            dto.name = network.name;
        }

        if (network.description !== undefined && network.description !== null) {
            dto.description = network.description;
        }

        return dto;
    });

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (networkController.getAllNetworks as jest.Mock).mockResolvedValue(mockNetworksDTO);

    const response = await request(app)
      .get(`/api/v1/networks`)
      .set("Authorization", token);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockNetworksDTO);
    expect(authService.processToken).toHaveBeenCalledWith(token, [
      UserType.Operator,
      UserType.Viewer,
      UserType.Admin
    ]);
    expect(networkController.getAllNetworks).toHaveBeenCalledWith();
  });

  it("get all networks: 401 UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized: No token provided");
    });

    const response = await request(app)
      .get(`/api/v1/networks`)
      .set("Authorization", "Bearer invalid");

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/Unauthorized/);
  });

  it("get all networks: 500 InternalServerError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);

    (networkController.getAllNetworks as jest.Mock).mockImplementation(() => {
      throw new Error("Internal server error");
    });

    const response = await request(app)
      .get(`/api/v1/networks`)
      .set("Authorization", token);

    expect(response.status).toBe(500);
    expect(response.body.message).toMatch(/Internal server error/);
  });
});


describe("getNetwork", () => {
  const token = "Bearer faketoken";

  const mockNetworkDAO: NetworkDAO = FAKE_DATA.FAKE_NETWORKS[0];

  const mockNetworkDTO: NetworkDTO = {
    code: mockNetworkDAO.code,
  };

  if (mockNetworkDAO.name !== undefined && mockNetworkDAO.name !== null) {
    mockNetworkDTO.name = mockNetworkDAO.name;
  }

  if (mockNetworkDAO.description !== undefined && mockNetworkDAO.name !== null) {
    mockNetworkDTO.description = mockNetworkDAO.description;
  }

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("getNetwork", async () => {

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (networkController.getNetwork as jest.Mock).mockResolvedValue(mockNetworkDTO);

    const response = await request(app)
      .get(`/api/v1/networks/${mockNetworkDTO.code}`)
      .set("Authorization", token);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockNetworkDTO);
    expect(authService.processToken).toHaveBeenCalledWith(token, [
      UserType.Operator,
      UserType.Viewer,
      UserType.Admin
    ]);
    expect(networkController.getNetwork).toHaveBeenCalledWith(mockNetworkDTO.code);
  });

  it("get network: 401 UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized: No token provided");
    });

    const response = await request(app)
      .get(`/api/v1/networks/${mockNetworkDTO.code}`)
      .set("Authorization", "Bearer invalid");

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/Unauthorized/);
  });

  it("get network: 404 NotFoundError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new NotFoundError("Entity not found");
    });

    const response = await request(app)
      .get(`/api/v1/networks/${mockNetworkDTO.code}`)
      .set("Authorization", token);

    expect(response.status).toBe(404);
    expect(response.body.message).toMatch(/Entity not found/);
  });

  it("get network: 500 InternalServerError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);

    (networkController.getNetwork as jest.Mock).mockImplementation(() => {
      throw new Error("Internal server error");
    });

    const response = await request(app)
      .get(`/api/v1/networks/${mockNetworkDTO.code}`)
      .set("Authorization", token);

    expect(response.status).toBe(500);
    expect(response.body.message).toMatch(/Internal server error/);
  });
});


describe("createNetwork", () => {
  const token = "Bearer faketoken";

  const mockNetworkDAO: NetworkDAO = FAKE_DATA.FAKE_NETWORKS[0];

  const mockNetworkDTO: NetworkDTO = {
    code: mockNetworkDAO.code,
  };

  if (mockNetworkDAO.name !== undefined && mockNetworkDAO.name !== null) {
    mockNetworkDTO.name = mockNetworkDAO.name;
  }

  if (mockNetworkDAO.description !== undefined && mockNetworkDAO.name !== null) {
    mockNetworkDTO.description = mockNetworkDAO.description;
  }

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("create network", async () => {
    const newNetwork: NetworkDTO = {
        code: "11:22:33:44",
        name: "New Network",
        description: "Newly created"
    };

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (networkController.createNetwork as jest.Mock).mockResolvedValue(undefined);

    const response = await request(app)
      .post(`/api/v1/networks`)
      .set("Authorization", token)
      .send(newNetwork);

    expect(response.status).toBe(201);
    expect(authService.processToken).toHaveBeenCalledWith(token, [
        UserType.Operator,
        UserType.Admin
    ]);
    expect(networkController.createNetwork).toHaveBeenCalledWith(newNetwork);
  });

  it("create network: 400 BadRequest", async () => {
    const response = await request(app)
      .post(`/api/v1/networks`)
      .set("Authorization", token)
      .send({
        // manca code
        name: "New Network",
        description: "Newly created"
       });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/body/);
  });

  it("create network: 401 UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized: No token provided");
    });

    const response = await request(app)
      .post(`/api/v1/networks`)
      .set("Authorization", "Bearer invalid")
      .send({
        code: "11:22:33:44",
        name: "New Network",
        description: "Newly created"
       });

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/Unauthorized/);
  });

  it("create network: 403 InsufficientRightsError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new InsufficientRightsError("Forbidden: Insufficient rights");
    });

    const response = await request(app)
      .post(`/api/v1/networks`)
      .set("Authorization", token)
      .send({
        code: "11:22:33:44",
        name: "New Network",
        description: "Newly created"
       });

    expect(response.status).toBe(403);
    expect(response.body.message).toMatch(/Insufficient rights/);
  });

  it("create network: 409 ConflictError", async () => {
    const newNetwork: NetworkDTO = {
        code: "11:22:33:44",
        name: "New Network",
        description: "Newly created"
    };

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);

    (networkController.createNetwork as jest.Mock).mockImplementation(() => {
      throw new ConflictError("Entity with code xxxxx already exists");
    });

    const response = await request(app)
      .post(`/api/v1/networks`)
      .set("Authorization", token)
      .send(newNetwork);

    expect(response.status).toBe(409);
    expect(response.body.message).toMatch(/exist/);
    expect(authService.processToken).toHaveBeenCalledWith(token, [
      UserType.Operator,
      UserType.Admin,
    ]);
    expect(networkController.createNetwork).toHaveBeenCalledWith(newNetwork);
  });

  it("create network: 500 InternalServerError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (networkController.createNetwork as jest.Mock).mockImplementation(() => {
      throw new Error("Internal server error");
    });

    const response = await request(app)
      .post(`/api/v1/networks`)
      .set("Authorization", token)
      .send({
        code: "11:22:33:44",
        name: "New Network",
        description: "Newly created"
       });

    expect(response.status).toBe(500);
    expect(response.body.message).toMatch(/Internal server error/);
    expect(authService.processToken).toHaveBeenCalledWith(token, [
      UserType.Operator,
      UserType.Admin,
    ]);
  });

});


describe("updateNetwork", () => {
  const token = "Bearer faketoken";

  const mockNetworkDAO: NetworkDAO = FAKE_DATA.FAKE_NETWORKS[0];

  const mockNetworkDTO: NetworkDTO = {
    code: mockNetworkDAO.code,
  };

  if (mockNetworkDAO.name !== undefined && mockNetworkDAO.name !== null) {
    mockNetworkDTO.name = mockNetworkDAO.name;
  }

  if (mockNetworkDAO.description !== undefined && mockNetworkDAO.name !== null) {
    mockNetworkDTO.description = mockNetworkDAO.description;
  }

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("update network", async () => {
    const updatedNetwork: NetworkDTO = {
        code: "11:22:33:55",
        name: "Updated Network",
        description: "update"
    };

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (networkController.updateNetwork as jest.Mock).mockResolvedValue(undefined);

    const response = await request(app)
      .patch(`/api/v1/networks/${mockNetworkDTO.code}`)
      .set("Authorization", token)
      .send(updatedNetwork);

    expect(response.status).toBe(204);
    expect(authService.processToken).toHaveBeenCalledWith(token, [
        UserType.Operator,
        UserType.Admin,
    ]);
    expect(networkController.updateNetwork).toHaveBeenCalledWith(mockNetworkDTO.code, updatedNetwork);
  });

  it("update network: 400 BadRequest", async () => {
    const response = await request(app)
      .patch(`/api/v1/networks/${mockNetworkDTO.code}}`)
      .set("Authorization", token)
      .send({
        code: ""
       });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/body/);
  });

  it("update network: 401 UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized: No token provided");
    });

    const response = await request(app)
      .patch(`/api/v1/networks/${mockNetworkDTO.code}`)
      .set("Authorization", "Bearer invalid")
      .send({
        code: "11:22:33:55",
        name: "Updated Network",
        description: "update"
       });

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/Unauthorized/);
  });

  it("update network: 403 InsufficientRightsError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new InsufficientRightsError("Forbidden: Insufficient rights");
    });

    const response = await request(app)
      .patch(`/api/v1/networks/${mockNetworkDTO.code}`)
      .set("Authorization", token)
      .send({
        code: "11:22:33:55",
        name: "Updated Network",
        description: "update"
       });

    expect(response.status).toBe(403);
    expect(response.body.message).toMatch(/Insufficient rights/);
  });

  it("update network: 404 Not Found", async () => {
    const updatedNetwork: NetworkDTO = {
        code: "11:22:33:55",
        name: "Updated Network",
        description: "update"
    };

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (networkController.updateNetwork as jest.Mock).mockImplementation(() => {
        throw new NotFoundError("Network not found");
    });

    const response = await request(app)
        .patch(`/api/v1/networks/non_existent_code`)
        .set("Authorization", "Bearer faketoken")
        .send(updatedNetwork);

    expect(response.status).toBe(404);
    expect(response.body.message).toMatch(/not found/);
    expect(authService.processToken).toHaveBeenCalledWith(token, [
        UserType.Operator,
        UserType.Admin,
    ]);
    expect(networkController.updateNetwork).toHaveBeenCalledWith("non_existent_code", updatedNetwork);
  });

  it("update network: 409 ConflictError", async () => {
    const updatedNetwork: NetworkDTO = {
        code: "11:22:33:55",
        name: "Updated Network",
        description: "update"
    };

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);

    (networkController.updateNetwork as jest.Mock).mockImplementation(() => {
      throw new ConflictError("Entity with code xxxxx already exists");
    });

    const response = await request(app)
      .patch(`/api/v1/networks/${mockNetworkDTO.code}`)
      .set("Authorization", token)
      .send(updatedNetwork);

    expect(response.status).toBe(409);
    expect(response.body.message).toMatch(/exist/);
    expect(authService.processToken).toHaveBeenCalledWith(token, [
        UserType.Operator,
        UserType.Admin,
    ]);
    expect(networkController.updateNetwork).toHaveBeenCalledWith(mockNetworkDTO.code, updatedNetwork);
  });

  it("update network: 500 InternalServerError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (networkController.updateNetwork as jest.Mock).mockImplementation(() => {
      throw new Error("Internal server error");
    });

    const response = await request(app)
      .patch(`/api/v1/networks/${mockNetworkDTO.code}`)
      .set("Authorization", token)
      .send({
        code: "11:22:33:55",
        name: "Updated Network",
        description: "update"
       });

    expect(response.status).toBe(500);
    expect(response.body.message).toMatch(/Internal server error/);
    expect(authService.processToken).toHaveBeenCalledWith(token, [
        UserType.Operator,
        UserType.Admin,
    ]);
  });

});


describe("deleteNetwork", () => {
  const token = "Bearer faketoken";

  const mockNetworkDAO: NetworkDAO = FAKE_DATA.FAKE_NETWORKS[0];

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("delete network", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (networkController.deleteNetwork as jest.Mock).mockResolvedValue(undefined);

    const response = await request(app)
      .delete(`/api/v1/networks/${mockNetworkDAO.code}`)
      .set("Authorization", token);

    expect(response.status).toBe(204);
    expect(authService.processToken).toHaveBeenCalledWith(token, [
        UserType.Operator,
        UserType.Admin,
    ]);
    expect(networkController.deleteNetwork).toHaveBeenCalledWith(mockNetworkDAO.code);
  });

  it("delete network: 401 UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized: No token provided");
    });

    const response = await request(app)
      .delete(`/api/v1/networks/${mockNetworkDAO.code}`)
      .set("Authorization", "Bearer invalid");

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/Unauthorized/);
  });

  it("delete network: 403 InsufficientRightsError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new InsufficientRightsError("Forbidden: Insufficient rights");
    });

    const response = await request(app)
      .delete(`/api/v1/networks/${mockNetworkDAO.code}`)
      .set("Authorization", token);

    expect(response.status).toBe(403);
    expect(response.body.message).toMatch(/Insufficient rights/);
  });      

  it("delete network: 404 NotFoundError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);

    (networkController.deleteNetwork as jest.Mock).mockImplementation(() => {
      throw new NotFoundError("Entity not found");
    });

    const response = await request(app)
      .delete(`/api/v1/networks/non_existent_code`)
      .set("Authorization", token);

    expect(response.status).toBe(404);
    expect(response.body.message).toMatch(/Entity not found/);
    expect(authService.processToken).toHaveBeenCalledWith(token, [
        UserType.Operator,
        UserType.Admin,
    ]);
    expect(networkController.deleteNetwork).toHaveBeenCalledWith("non_existent_code");
  });

  it("delete network: 500 InternalServerError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);

    (networkController.deleteNetwork as jest.Mock).mockImplementation(() => {
      throw new Error("Internal server error");
    });

    const response = await request(app)
      .delete(`/api/v1/networks/${mockNetworkDAO.code}`)
      .set("Authorization", token);

    expect(response.status).toBe(500);
    expect(response.body.message).toMatch(/Internal server error/);
    expect(networkController.deleteNetwork).toHaveBeenCalledWith(mockNetworkDAO.code);
  });

});