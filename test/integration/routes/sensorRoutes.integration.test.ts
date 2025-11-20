import request from "supertest";
import { app } from "@app";
import * as authService from "@services/authService";
import * as sensorController from "@controllers/sensorController";
import { UserType } from "@models/UserType";
import { Sensor as SensorDTO } from "@dto/Sensor";
import { UnauthorizedError } from "@models/errors/UnauthorizedError";
import { InsufficientRightsError } from "@models/errors/InsufficientRightsError";
import { NotFoundError } from "@models/errors/NotFoundError";
import { ConflictError } from "@models/errors/ConflictError";
import { FAKE_DATA } from "@test/fakeDataDAO/fakeDataDAOforSensors";
import { NetworkDAO } from "@models/dao/NetworkDAO";
import { GatewayDAO } from "@models/dao/GatewayDAO";
import { SensorDAO } from "@models/dao/SensorDAO";

jest.mock("@services/authService");
jest.mock("@controllers/sensorController");

describe("SensorRoutes integration", () => {
  const token = "Bearer faketoken";
  const network: NetworkDAO = FAKE_DATA.FAKE_NETWORKS[0];
  const gateway: GatewayDAO = FAKE_DATA.FAKE_GATEWAYS[0];

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("get all sensors", async () => {
    const mockSensorsDAO: SensorDAO[] = [
        FAKE_DATA.FAKE_SENSORS[0],
        FAKE_DATA.FAKE_SENSORS[1],
        FAKE_DATA.FAKE_SENSORS[2],
    ];

    const mockSensorsDTO: SensorDTO[] = mockSensorsDAO.map(sensor => {
        const dto: any = { macAddress: sensor.macAddress };

        if (sensor.name !== undefined && sensor.name !== null) {
            dto.name = sensor.name;
        }

        if (sensor.description !== undefined && sensor.description !== null) {
            dto.description = sensor.description;
        }

        return dto;
    });

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (sensorController.getAllSensors as jest.Mock).mockResolvedValue(mockSensorsDTO);

    const response = await request(app)
      .get(`/api/v1/networks/${network.code}/gateways/${gateway.macAddress}/sensors`)
      .set("Authorization", token);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockSensorsDTO);
    expect(authService.processToken).toHaveBeenCalledWith(token, [
      UserType.Admin,
      UserType.Operator,
      UserType.Viewer
    ]);
    expect(sensorController.getAllSensors).toHaveBeenCalledWith(network.code, gateway.macAddress);
  });

  it("get all sensors: 401 UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized: No token provided");
    });

    const response = await request(app)
      .get(`/api/v1/networks/${network.code}/gateways/${gateway.macAddress}/sensors`)
      .set("Authorization", "Bearer invalid");

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/Unauthorized/);
  });

  it("get all sensors: 404 NotFoundError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (sensorController.getAllSensors as jest.Mock).mockImplementation(() => {
        throw new NotFoundError("Entity not found");
    });

    const response = await request(app)
        .get(`/api/v1/networks/${network.code}/gateways/${gateway.macAddress}/sensors`)
        .set("Authorization", token);

    expect(response.status).toBe(404);
    expect(response.body.message).toMatch(/Entity not found/);
  });

  it("get all sensors: 500 InternalServerError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);

    (sensorController.getAllSensors as jest.Mock).mockImplementation(() => {
      throw new Error("Internal server error");
    });

    const response = await request(app)
      .get(`/api/v1/networks/${network.code}/gateways/${gateway.macAddress}/sensors`)
      .set("Authorization", token);

    expect(response.status).toBe(500);
    expect(response.body.message).toMatch(/Internal server error/);
  });
});

describe("getSensor", () => {
  const token = "Bearer faketoken";
  const network: NetworkDAO = FAKE_DATA.FAKE_NETWORKS[0];
  const gateway: GatewayDAO = FAKE_DATA.FAKE_GATEWAYS[0];

  const mockSensorDAO: SensorDAO = FAKE_DATA.FAKE_SENSORS[0];

  const mockSensorDTO: SensorDTO = {
    macAddress: mockSensorDAO.macAddress,
  };

  if (mockSensorDAO.name !== undefined && mockSensorDAO.name !== null) {
    mockSensorDTO.name = mockSensorDAO.name;
  }

  if (mockSensorDAO.description !== undefined && mockSensorDAO.name !== null) {
    mockSensorDTO.description = mockSensorDAO.description;
  }

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("getSensor", async () => {

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (sensorController.getSensor as jest.Mock).mockResolvedValue(mockSensorDTO);

    const response = await request(app)
      .get(`/api/v1/networks/${network.code}/gateways/${gateway.macAddress}/sensors/${mockSensorDTO.macAddress}`)
      .set("Authorization", token);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockSensorDTO);
    expect(authService.processToken).toHaveBeenCalledWith(token, [
      UserType.Admin,
      UserType.Operator,
      UserType.Viewer
    ]);
    expect(sensorController.getSensor).toHaveBeenCalledWith(network.code, gateway.macAddress, mockSensorDTO.macAddress);
  });

  it("get sensor: 401 UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized: No token provided");
    });

    const response = await request(app)
      .get(`/api/v1/networks/${network.code}/gateways/${gateway.macAddress}/sensors/${mockSensorDTO.macAddress}`)
      .set("Authorization", "Bearer invalid");

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/Unauthorized/);
  });

  it("get sensor: 404 NotFoundError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new NotFoundError("Entity not found");
    });

    const response = await request(app)
      .get(`/api/v1/networks/${network.code}/gateways/${gateway.macAddress}/sensors/${mockSensorDTO.macAddress}`)
      .set("Authorization", token);

    expect(response.status).toBe(404);
    expect(response.body.message).toMatch(/Entity not found/);
  });

  it("get sensor: 500 InternalServerError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);

    (sensorController.getSensor as jest.Mock).mockImplementation(() => {
      throw new Error("Internal server error");
    });

    const response = await request(app)
      .get(`/api/v1/networks/${network.code}/gateways/${gateway.macAddress}/sensors/${mockSensorDTO.macAddress}`)
      .set("Authorization", token);

    expect(response.status).toBe(500);
    expect(response.body.message).toMatch(/Internal server error/);
  });
});

describe("createSensor", () => {
  const token = "Bearer faketoken";
  const network: NetworkDAO = FAKE_DATA.FAKE_NETWORKS[0];
  const gateway: GatewayDAO = FAKE_DATA.FAKE_GATEWAYS[0];

  const mockSensorDAO: SensorDAO = FAKE_DATA.FAKE_SENSORS[0];

  const mockSensorDTO: SensorDTO = {
    macAddress: mockSensorDAO.macAddress,
  };

  if (mockSensorDAO.name !== undefined && mockSensorDAO.name !== null) {
    mockSensorDTO.name = mockSensorDAO.name;
  }

  if (mockSensorDAO.description !== undefined && mockSensorDAO.name !== null) {
    mockSensorDTO.description = mockSensorDAO.description;
  }

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("create sensor", async () => {
    const newSensor: SensorDTO = {
        macAddress: "11:22:33:44",
        name: "New Sensor",
        description: "Newly created"
    };

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (sensorController.createSensor as jest.Mock).mockResolvedValue(undefined);

    const response = await request(app)
      .post(`/api/v1/networks/${network.code}/gateways/${gateway.macAddress}/sensors`)
      .set("Authorization", token)
      .send(newSensor);

    expect(response.status).toBe(201);
    expect(authService.processToken).toHaveBeenCalledWith(token, [
      UserType.Admin,
      UserType.Operator
    ]);
    expect(sensorController.createSensor).toHaveBeenCalledWith(network.code, gateway.macAddress, newSensor);
  });

  it("create sensor: 400 BadRequest", async () => {
    const response = await request(app)
      .post(`/api/v1/networks/${network.code}/gateways/${gateway.macAddress}/sensors`)
      .set("Authorization", token)
      .send({
        // manca macAddress
        name: "New Sensor",
        description: "Newly created"
       });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/body/);
  });

  it("create sensor: 401 UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized: No token provided");
    });

    const response = await request(app)
      .post(`/api/v1/networks/${network.code}/gateways/${gateway.macAddress}/sensors`)
      .set("Authorization", "Bearer invalid")
      .send({
        macAddress: "11:22:33:44",
        name: "New Sensor",
        description: "Newly created"
       });

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/Unauthorized/);
  });

  it("create sensor: 403 InsufficientRightsError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new InsufficientRightsError("Forbidden: Insufficient rights");
    });

    const response = await request(app)
      .post(`/api/v1/networks/${network.code}/gateways/${gateway.macAddress}/sensors`)
      .set("Authorization", token)
      .send({
        macAddress: "11:22:33:44",
        name: "New Sensor",
        description: "Newly created"
       });

    expect(response.status).toBe(403);
    expect(response.body.message).toMatch(/Insufficient rights/);
  });

  it("create sensor: 404 Not Found", async () => {
    const newSensor: SensorDTO = {
        macAddress: "11:22:33:44",
        name: "New Sensor",
        description: "Newly created"
    };

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (sensorController.createSensor as jest.Mock).mockImplementation(() => {
        throw new NotFoundError("Network not found");
    });

    const response = await request(app)
        .post("/api/v1/networks/non_existent_network/gateways/non_existent_gateway/sensors")
        .set("Authorization", "Bearer faketoken")
        .send(newSensor);

    expect(response.status).toBe(404);
    expect(response.body.message).toMatch(/not found/);
    expect(authService.processToken).toHaveBeenCalledWith(token, [
      UserType.Admin,
      UserType.Operator
    ]);
    expect(sensorController.createSensor).toHaveBeenCalledWith("non_existent_network", "non_existent_gateway", newSensor);
  });

  it("create sensor: 409 ConflictError", async () => {
    const newSensor: SensorDTO = {
        macAddress: "11:22:33:44",
        name: "New Sensor",
        description: "Newly created"
    };

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);

    (sensorController.createSensor as jest.Mock).mockImplementation(() => {
      throw new ConflictError("Entity with code xxxxx already exists");
    });

    const response = await request(app)
      .post(`/api/v1/networks/${network.code}/gateways/${gateway.macAddress}/sensors`)
      .set("Authorization", token)
      .send(newSensor);

    expect(response.status).toBe(409);
    expect(response.body.message).toMatch(/exist/);
    expect(authService.processToken).toHaveBeenCalledWith(token, [
      UserType.Admin,
      UserType.Operator
    ]);
    expect(sensorController.createSensor).toHaveBeenCalledWith(network.code, gateway.macAddress, newSensor);
  });

  it("create sensor: 500 InternalServerError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (sensorController.createSensor as jest.Mock).mockImplementation(() => {
      throw new Error("Internal server error");
    });

    const response = await request(app)
      .post(`/api/v1/networks/${network.code}/gateways/${gateway.macAddress}/sensors`)
      .set("Authorization", token)
      .send({
        macAddress: "11:22:33:44",
        name: "New Sensor",
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

describe("updateSensor", () => {
  const token = "Bearer faketoken";
  const network: NetworkDAO = FAKE_DATA.FAKE_NETWORKS[0];
  const gateway: GatewayDAO = FAKE_DATA.FAKE_GATEWAYS[0];

  const mockSensorDAO: SensorDAO = FAKE_DATA.FAKE_SENSORS[0];

  const mockSensorDTO: SensorDTO = {
    macAddress: mockSensorDAO.macAddress,
  };

  if (mockSensorDAO.name !== undefined && mockSensorDAO.name !== null) {
    mockSensorDTO.name = mockSensorDAO.name;
  }

  if (mockSensorDAO.description !== undefined && mockSensorDAO.name !== null) {
    mockSensorDTO.description = mockSensorDAO.description;
  }

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("update sensor", async () => {
    const updatedSensor: SensorDTO = {
        macAddress: "11:22:33:55",
        name: "Updated Sensor",
        description: "update"
    };

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (sensorController.updateSensor as jest.Mock).mockResolvedValue(undefined);

    const response = await request(app)
      .patch(`/api/v1/networks/${network.code}/gateways/${gateway.macAddress}/sensors/${mockSensorDTO.macAddress}`)
      .set("Authorization", token)
      .send(updatedSensor);

    expect(response.status).toBe(204);
    expect(authService.processToken).toHaveBeenCalledWith(token, [
      UserType.Admin,
      UserType.Operator
    ]);
    expect(sensorController.updateSensor).toHaveBeenCalledWith(network.code, gateway.macAddress, mockSensorDTO.macAddress, updatedSensor);
  });

  it("update sensor: 400 BadRequest", async () => {
    const response = await request(app)
      .patch(`/api/v1/networks/${network.code}/gateways/${gateway.macAddress}/sensors/${mockSensorDTO.macAddress}`)
      .set("Authorization", token)
      .send({
        macAddress: ""
       });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/body/);
  });

  it("update sensor: 401 UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized: No token provided");
    });

    const response = await request(app)
      .patch(`/api/v1/networks/${network.code}/gateways/${gateway.macAddress}/sensors/${mockSensorDTO.macAddress}`)
      .set("Authorization", "Bearer invalid")
      .send({
        macAddress: "11:22:33:55",
        name: "Updated Sensor",
        description: "update"
       });

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/Unauthorized/);
  });

  it("update sensor: 403 InsufficientRightsError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new InsufficientRightsError("Forbidden: Insufficient rights");
    });

    const response = await request(app)
      .patch(`/api/v1/networks/${network.code}/gateways/${gateway.macAddress}/sensors/${mockSensorDTO.macAddress}`)
      .set("Authorization", token)
      .send({
        macAddress: "11:22:33:55",
        name: "Updated Sensor",
        description: "update"
       });

    expect(response.status).toBe(403);
    expect(response.body.message).toMatch(/Insufficient rights/);
  });

  it("update sensor: 404 Not Found", async () => {
    const updatedSensor: SensorDTO = {
        macAddress: "11:22:33:55",
        name: "Updated Sensor",
        description: "update"
    };

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (sensorController.updateSensor as jest.Mock).mockImplementation(() => {
        throw new NotFoundError("Sensor not found");
    });

    const response = await request(app)
        .patch(`/api/v1/networks/${network.code}/gateways/${gateway.macAddress}/sensors/non_existent_mac`)
        .set("Authorization", "Bearer faketoken")
        .send(updatedSensor);

    expect(response.status).toBe(404);
    expect(response.body.message).toMatch(/not found/);
    expect(authService.processToken).toHaveBeenCalledWith(token, [
      UserType.Admin,
      UserType.Operator
    ]);
    expect(sensorController.updateSensor).toHaveBeenCalledWith(network.code, gateway.macAddress, "non_existent_mac", updatedSensor);
  });

  it("update sensor: 409 ConflictError", async () => {
    const updatedSensor: SensorDTO = {
        macAddress: "11:22:33:55",
        name: "Updated Sensor",
        description: "update"
    };

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);

    (sensorController.updateSensor as jest.Mock).mockImplementation(() => {
      throw new ConflictError("Entity with code xxxxx already exists");
    });

    const response = await request(app)
      .patch(`/api/v1/networks/${network.code}/gateways/${gateway.macAddress}/sensors/${mockSensorDTO.macAddress}`)
      .set("Authorization", token)
      .send(updatedSensor);

    expect(response.status).toBe(409);
    expect(response.body.message).toMatch(/exist/);
    expect(authService.processToken).toHaveBeenCalledWith(token, [
      UserType.Admin,
      UserType.Operator
    ]);
    expect(sensorController.updateSensor).toHaveBeenCalledWith(network.code, gateway.macAddress, mockSensorDTO.macAddress, updatedSensor);
  });

  it("update sensor: 500 InternalServerError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (sensorController.updateSensor as jest.Mock).mockImplementation(() => {
      throw new Error("Internal server error");
    });

    const response = await request(app)
      .patch(`/api/v1/networks/${network.code}/gateways/${gateway.macAddress}/sensors/${mockSensorDTO.macAddress}`)
      .set("Authorization", token)
      .send({
        macAddress: "11:22:33:55",
        name: "Updated Sensor",
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

describe("deleteSensor", () => {
  const token = "Bearer faketoken";
  const network: NetworkDAO = FAKE_DATA.FAKE_NETWORKS[0];
  const gateway: GatewayDAO = FAKE_DATA.FAKE_GATEWAYS[0];

  const mockSensorDAO: SensorDAO = FAKE_DATA.FAKE_SENSORS[0];

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("delete sensor", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (sensorController.deleteSensor as jest.Mock).mockResolvedValue(undefined);

    const response = await request(app)
      .delete(`/api/v1/networks/${network.code}/gateways/${gateway.macAddress}/sensors/${mockSensorDAO.macAddress}`)
      .set("Authorization", token);

    expect(response.status).toBe(204);
    expect(authService.processToken).toHaveBeenCalledWith(token, [
        UserType.Admin,
        UserType.Operator
    ]);
    expect(sensorController.deleteSensor).toHaveBeenCalledWith(network.code, gateway.macAddress, mockSensorDAO.macAddress);
  });

  it("delete sensor: 401 UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized: No token provided");
    });

    const response = await request(app)
      .delete(`/api/v1/networks/${network.code}/gateways/${gateway.macAddress}/sensors/${mockSensorDAO.macAddress}`)
      .set("Authorization", "Bearer invalid");

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/Unauthorized/);
  });

  it("delete sensor: 403 InsufficientRightsError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new InsufficientRightsError("Forbidden: Insufficient rights");
    });

    const response = await request(app)
      .delete(`/api/v1/networks/${network.code}/gateways/${gateway.macAddress}/sensors/${mockSensorDAO.macAddress}`)
      .set("Authorization", token);

    expect(response.status).toBe(403);
    expect(response.body.message).toMatch(/Insufficient rights/);
  });      

  it("delete sensor: 404 NotFoundError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);

    (sensorController.deleteSensor as jest.Mock).mockImplementation(() => {
      throw new NotFoundError("Entity not found");
    });

    const response = await request(app)
      .delete(`/api/v1/networks/${network.code}/gateways/${gateway.macAddress}/sensors/non_existent_mac`)
      .set("Authorization", token);

    expect(response.status).toBe(404);
    expect(response.body.message).toMatch(/Entity not found/);
    expect(authService.processToken).toHaveBeenCalledWith(token, [
        UserType.Admin,
        UserType.Operator
    ]);
    expect(sensorController.deleteSensor).toHaveBeenCalledWith(network.code, gateway.macAddress, "non_existent_mac");
  });

  it("delete sensor: 500 InternalServerError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);

    (sensorController.deleteSensor as jest.Mock).mockImplementation(() => {
      throw new Error("Internal server error");
    });

    const response = await request(app)
      .delete(`/api/v1/networks/${network.code}/gateways/${gateway.macAddress}/sensors/${mockSensorDAO.macAddress}`)
      .set("Authorization", token);

    expect(response.status).toBe(500);
    expect(response.body.message).toMatch(/Internal server error/);
    expect(sensorController.deleteSensor).toHaveBeenCalledWith(network.code, gateway.macAddress, mockSensorDAO.macAddress);
  });

});