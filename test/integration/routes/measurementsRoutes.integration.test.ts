import request from "supertest";
import { app } from "@app";
import * as authService from "@services/authService";
import * as measurementController from "@controllers/measurementController";
import { UnauthorizedError } from "@models/errors/UnauthorizedError";
import { NotFoundError } from "@models/errors/NotFoundError";
import { Measurements as MeasurementsDTO } from "@models/dto/Measurements";
import { InsufficientRightsError } from "@models/errors/InsufficientRightsError";
import { Measurement as MeasurementDTO } from "@models/dto/Measurement";
import { Stats as StatsDTO } from "@models/dto/Stats";


jest.mock("@services/authService");
jest.mock("@controllers/measurementController");

describe("MeasurementRoutes integration: get network measurements", () => {
    const token = "Bearer faketoken";
    const networkCode = "net 123";

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("get measurements: 200 OK", async () => {
        const mockResponse: MeasurementsDTO[] = [
            {
                sensorMacAddress: "71:B1:CE:01:C6:A9",
                stats: {
                    startDate: new Date("2025-02-18T15:00:00Z"),
                    endDate: new Date("2025-02-18T17:00:00Z"),
                    mean: 23.45,
                    variance: 7.56,
                    upperThreshold: 28.95,
                    lowerThreshold: 17.95
                },
                measurements: [
                    {
                        createdAt: new Date("2025-02-18T16:00:00Z"),
                        value: 21.8567,
                        isOutlier: false
                    },
                    {
                        createdAt: new Date("2025-02-18T16:05:00Z"),
                        value: 18.234,
                        isOutlier: false
                    }
                ]
            }
        ];

        (authService.processToken as jest.Mock).mockResolvedValue(undefined);
        (measurementController.getNetworkMeasurements as jest.Mock).mockResolvedValue(mockResponse);

        const response = await request(app)
            .get(`/api/v1/networks/${networkCode}/measurements`)
            .set("Authorization", token);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockResponse);
    });

    it("get measurements: 401 UnauthorizedError", async () => {
        (authService.processToken as jest.Mock).mockImplementation(() => {
            throw new UnauthorizedError("Unauthorized: Invalid token format");
        });

        const response = await request(app)
            .get(`/api/v1/networks/${networkCode}/measurements`)
            .set("Authorization", "Bearer invalid");

        expect(response.status).toBe(401);
        expect(response.body.code).toBe(401);
        expect(response.body.name).toBe("UnauthorizedError");
    });

    it("get measurements: 404 NotFoundError", async () => {
        (authService.processToken as jest.Mock).mockResolvedValue(undefined);
        (measurementController.getNetworkMeasurements as jest.Mock).mockImplementation(() => {
            throw new NotFoundError("Entity not found");
        });

        const response = await request(app)
            .get(`/api/v1/networks/${networkCode}/measurements`)
            .set("Authorization", token);

        expect(response.status).toBe(404);
        expect(response.body.code).toBe(404);
        expect(response.body.name).toBe("NotFoundError");
    });

    it("get measurements: 500 InternalServerError", async () => {
        (authService.processToken as jest.Mock).mockResolvedValue(undefined);
        (measurementController.getNetworkMeasurements as jest.Mock).mockImplementation(() => {
            throw new Error("Internal server error");
        });

        const response = await request(app)
            .get(`/api/v1/networks/${networkCode}/measurements`)
            .set("Authorization", token);

        expect(response.status).toBe(500);
        expect(response.body.code).toBe(500);
        expect(response.body.name).toBe("InternalServerError");
    });

});

describe("MeasurementRoutes integration: get network stats", () => {
    const token = "Bearer faketoken";
    const networkCode = "rete 123";

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("get stats: 200 OK", async () => {
        const mockStats: MeasurementsDTO[] = [
            {
                sensorMacAddress: "71:B1:CE:01:C6:A9",
                stats: {
                    startDate: new Date("2025-02-18T15:00:00Z"),
                    endDate: new Date("2025-02-18T17:00:00Z"),
                    mean: 23.45,
                    variance: 7.56,
                    upperThreshold: 28.95,
                    lowerThreshold: 17.95
                }
            }
        ];

        (authService.processToken as jest.Mock).mockResolvedValue(undefined);
        (measurementController.getNetworkStats as jest.Mock).mockResolvedValue(mockStats);

        const response = await request(app)
            .get(`/api/v1/networks/${networkCode}/stats`)
            .set("Authorization", token);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockStats);

    });

    it("get stats: 401 UnauthorizedError", async () => {
        (authService.processToken as jest.Mock).mockImplementation(() => {
            throw new UnauthorizedError("Unauthorized: Invalid token format");
        });

        const response = await request(app)
            .get(`/api/v1/networks/${networkCode}/stats`)
            .set("Authorization", "Bearer invalid");

        expect(response.status).toBe(401);
        expect(response.body.code).toBe(401);
        expect(response.body.name).toBe("UnauthorizedError");
    });

    it("get stats: 404 NotFoundError", async () => {
        (authService.processToken as jest.Mock).mockResolvedValue(undefined);


        (measurementController.getNetworkStats as jest.Mock).mockImplementation(() => {
            throw new NotFoundError("Entity not found");
        });

        const response = await request(app)
            .get(`/api/v1/networks/${networkCode}/stats`)
            .set("Authorization", token);

        expect(response.status).toBe(404);
        expect(response.body.code).toBe(404);
        expect(response.body.name).toBe("NotFoundError");
    });

    it("get stats: 500 InternalServerError", async () => {
        (authService.processToken as jest.Mock).mockResolvedValue(undefined);

        (measurementController.getNetworkStats as jest.Mock).mockImplementation(() => {
            throw new Error("Internal server error");
        });

        const response = await request(app)
            .get(`/api/v1/networks/${networkCode}/stats`)
            .set("Authorization", token);

        expect(response.status).toBe(500);
        expect(response.body.code).toBe(500);
        expect(response.body.name).toBe("InternalServerError");
    });
});

describe("MeasurementRoutes integration: get network outliers", () => {
    const token = "Bearer faketoken";
    const networkCode = "net-456";

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("get outliers: 200 OK with valid response", async () => {
        const mockOutliers: MeasurementsDTO[] = [
            {
                sensorMacAddress: "71:B1:CE:01:C6:A9",
                stats: {
                    startDate: new Date("2025-02-18T15:00:00Z"),
                    endDate: new Date("2025-02-18T17:00:00Z"),
                    mean: 23.45,
                    variance: 7.56,
                    upperThreshold: 28.95,
                    lowerThreshold: 17.95
                },
                measurements: [
                    {
                        createdAt: new Date("2025-02-18T15:30:00Z"),
                        value: 30.86,
                        isOutlier: true
                    },
                    {
                        createdAt: new Date("2025-02-18T16:00:00Z"),
                        value: 12.34,
                        isOutlier: true
                    }
                ]
            }
        ];

        (authService.processToken as jest.Mock).mockResolvedValue(undefined);
        (measurementController.getNetworkOutliers as jest.Mock).mockResolvedValue(mockOutliers);

        const response = await request(app)
            .get(`/api/v1/networks/${networkCode}/outliers`)
            .set("Authorization", token);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockOutliers);
    });

    it("get outliers: 401 UnauthorizedError", async () => {
        (authService.processToken as jest.Mock).mockImplementation(() => {
            throw new UnauthorizedError("Unauthorized: Invalid token format");
        });

        const response = await request(app)
            .get(`/api/v1/networks/${networkCode}/outliers`)
            .set("Authorization", "Bearer invalid");

        expect(response.status).toBe(401);
        expect(response.body.code).toBe(401);
        expect(response.body.name).toBe("UnauthorizedError");
    });


    it("get outliers: 404 NotFoundError", async () => {
        (authService.processToken as jest.Mock).mockResolvedValue(undefined);

        (measurementController.getNetworkOutliers as jest.Mock).mockImplementation(() => {
            throw new NotFoundError("Entity not found");
        });

        const response = await request(app)
            .get(`/api/v1/networks/${networkCode}/outliers`)
            .set("Authorization", token);

        expect(response.status).toBe(404);
        expect(response.body.code).toBe(404);
        expect(response.body.name).toBe("NotFoundError");
    });

    it("get outliers: 500 InternalServerError", async () => {
        (authService.processToken as jest.Mock).mockResolvedValue(undefined);

        (measurementController.getNetworkOutliers as jest.Mock).mockImplementation(() => {
            throw new Error("Internal server error");
        });

        const response = await request(app)
            .get(`/api/v1/networks/${networkCode}/outliers`)
            .set("Authorization", token);

        expect(response.status).toBe(500);
        expect(response.body.code).toBe(500);
        expect(response.body.name).toBe("InternalServerError");
    });
});

describe("MeasurementRoutes integration: post sensor measurements", () => {
    const token = "Bearer faketoken";
    const networkCode = "rete 123";
    const gatewayMac = "11:22:33:44:55:66";
    const sensorMac = "71:B1:CE:01:C6:A9";

    const endpoint = `/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}/measurements`;

    const measurements: MeasurementDTO[] = [
        {
            createdAt: new Date("2025-02-18T17:00:00+01:00"),
            value: 1.8567
        },
        {
            createdAt: new Date("2025-12-18T16:46:00+01:00"),
            value: 4.9923
        }
    ];

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("post measurements: 201 Created", async () => {
        (authService.processToken as jest.Mock).mockResolvedValue(undefined);
        (measurementController.createMeasurement as jest.Mock).mockResolvedValue(undefined);

        const response = await request(app)
            .post(endpoint)
            .set("Authorization", token)
            .send(measurements);

        expect(response.status).toBe(201);

    });

    it("post measurements: 401 UnauthorizedError", async () => {
        (authService.processToken as jest.Mock).mockImplementation(() => {
            throw new UnauthorizedError("Unauthorized: Invalid token format");
        });

        const response = await request(app)
            .post(endpoint)
            .set("Authorization", token)
            .send(measurements);

        expect(response.status).toBe(401);
        expect(response.body.code).toBe(401);
        expect(response.body.name).toBe("UnauthorizedError");
    });

    it("post measurements: 403 InsufficientRightsError", async () => {
        (authService.processToken as jest.Mock).mockImplementation(() => {
            throw new InsufficientRightsError("Forbidden: Insufficient rights");
        });

        const response = await request(app)
            .post(endpoint)
            .set("Authorization", token)
            .send(measurements);

        expect(response.status).toBe(403);
        expect(response.body.code).toBe(403);
        expect(response.body.name).toBe("InsufficientRightsError");
    });

    it("post measurements: 404 NotFoundError", async () => {
        (authService.processToken as jest.Mock).mockResolvedValue(undefined);

        (measurementController.createMeasurement as jest.Mock).mockImplementation(() => {
            throw new NotFoundError("Entity not found");
        });

        const response = await request(app)
            .post(endpoint)
            .set("Authorization", token)
            .send(measurements);

        expect(response.status).toBe(404);
        expect(response.body.code).toBe(404);
        expect(response.body.name).toBe("NotFoundError");
    });

    it("post measurements: 500 InternalServerError", async () => {
        (authService.processToken as jest.Mock).mockResolvedValue(undefined);

        (measurementController.createMeasurement as jest.Mock).mockImplementation(() => {
            throw new Error("Unexpected failure");
        });

        const response = await request(app)
            .post(endpoint)
            .set("Authorization", token)
            .send(measurements);

        expect(response.status).toBe(500);
        expect(response.body.code).toBe(500);
        expect(response.body.name).toBe("InternalServerError");
    });
});

describe("MeasurementRoutes integration: get sensor measurements", () => {
    const token = "Bearer faketoken";
    const networkCode = "net-123";
    const gatewayMac = "11:22:33:44:55:66";
    const sensorMacAddress = "71:B1:CE:01:C6:A9";

    const endpoint = `/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMacAddress}/measurements`;

    const expectedResponse: MeasurementsDTO = {
        sensorMacAddress,
        stats: {
            startDate: new Date("2025-02-18T15:00:00Z"),
            endDate: new Date("2025-02-18T17:00:00Z"),
            mean: 23.45,
            variance: 7.56,
            upperThreshold: 28.95,
            lowerThreshold: 17.95
        },
        measurements: [
            {
                createdAt: new Date("2025-02-18T15:30:00Z"),
                value: 25.86,
                isOutlier: false
            },
            {
                createdAt: new Date("2025-02-18T16:00:00Z"),
                value: 25.34,
                isOutlier: false
            }
        ]
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("get sensor measurements: 200 OK", async () => {
        (authService.processToken as jest.Mock).mockResolvedValue(undefined);
        (measurementController.getSensorMeasurements as jest.Mock).mockResolvedValue(expectedResponse);

        const response = await request(app)
            .get(endpoint)
            .set("Authorization", token)
            .query({
                startDate: "2025-02-18T16:00:00+01:00",
                endDate: "2025-02-18T18:00:00+01:00"
            });

        expect(response.status).toBe(200);
        expect(response.body.sensorMacAddress).toBe(sensorMacAddress);

    });

    it("get sensor measurements: 401 UnauthorizedError", async () => {
        (authService.processToken as jest.Mock).mockImplementation(() => {
            throw new UnauthorizedError("Unauthorized: Invalid token format");
        });

        const response = await request(app)
            .get(endpoint)
            .set("Authorization", token);

        expect(response.status).toBe(401);
        expect(response.body.code).toBe(401);
        expect(response.body.name).toBe("UnauthorizedError");
    });

    it("get sensor measurements: 404 NotFoundError", async () => {
        (authService.processToken as jest.Mock).mockResolvedValue(undefined);

        (measurementController.getSensorMeasurements as jest.Mock).mockImplementation(() => {
            throw new NotFoundError("Entity not found")
        });

        const response = await request(app)
            .get(endpoint)
            .set("Authorization", token);

        expect(response.status).toBe(404);
        expect(response.body.code).toBe(404);
        expect(response.body.name).toBe("NotFoundError");
    });

    it("get sensor measurements: 500 InternalServerError", async () => {
        (authService.processToken as jest.Mock).mockResolvedValue(undefined);

        (measurementController.getSensorMeasurements as jest.Mock).mockImplementation(() => {
            throw new Error("Unexpected error");
        });

        const response = await request(app)
            .get(endpoint)
            .set("Authorization", token);

        expect(response.status).toBe(500);
        expect(response.body.code).toBe(500);
        expect(response.body.name).toBe("InternalServerError");
    });
});

describe("MeasurementRoutes integration: get sensor stats", () => {
    const token = "Bearer faketoken";
    const networkCode = "net-123";
    const gatewayMac = "11:22:33:44:55:66";
    const sensorMac = "71:B1:CE:01:C6:A9";

    const endpoint = `/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}/stats`;

    const espectedStats: StatsDTO = {
        startDate: new Date("2025-02-18T15:00:00Z"),
        endDate: new Date("2025-02-18T17:00:00Z"),
        mean: 23.45,
        variance: 7.56,
        upperThreshold: 28.95,
        lowerThreshold: 17.95
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("get sensor stats: 200 OK", async () => {
        (authService.processToken as jest.Mock).mockResolvedValue(undefined);
        (measurementController.getSensorStats as jest.Mock).mockResolvedValue(espectedStats);

        const response = await request(app)
            .get(endpoint)
            .set("Authorization", token)
            .query({
                startDate: "2025-02-18T16:00:00+01:00",
                endDate: "2025-02-18T18:00:00+01:00"
            });

        expect(response.status).toBe(200);
        expect(response.body.mean).toBe(23.45);
    });

    it("get sensor stats: 401 UnauthorizedError", async () => {
        (authService.processToken as jest.Mock).mockImplementation(() => {
            throw new UnauthorizedError("Unauthorized: Invalid token format");
        });

        const response = await request(app)
            .get(endpoint)
            .set("Authorization", token);

        expect(response.status).toBe(401);
        expect(response.body.code).toBe(401);
        expect(response.body.name).toBe("UnauthorizedError");
    });

    it("get sensor stats: 404 NotFoundError", async () => {
        (authService.processToken as jest.Mock).mockResolvedValue(undefined);
        (measurementController.getSensorStats as jest.Mock).mockImplementation(() => {
            throw new NotFoundError("Entity not found");
        });

        const response = await request(app)
            .get(endpoint)
            .set("Authorization", token);

        expect(response.status).toBe(404);
        expect(response.body.name).toBe("NotFoundError");
    });

    it("get sensor stats: 500 InternalServerError", async () => {
        (authService.processToken as jest.Mock).mockResolvedValue(undefined);
        (measurementController.getSensorStats as jest.Mock).mockImplementation(() => {
            throw new Error("Unexpected DB error");
        });

        const response = await request(app)
            .get(endpoint)
            .set("Authorization", token);

        expect(response.status).toBe(500);
        expect(response.body.name).toBe("InternalServerError");
    });
});

describe("MeasurementRoutes integration: get outlier measurements", () => {
    const token = "Bearer faketoken";
    const networkCode = "net-123";
    const gatewayMac = "11:22:33:44:55:66";
    const sensorMacAddress = "71:B1:CE:01:C6:A9";

    const endpoint = `/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMacAddress}/outliers`;

    const expectedResponse: MeasurementsDTO = {
        sensorMacAddress,
        stats: {
            startDate: new Date("2025-02-18T15:00:00Z"),
            endDate: new Date("2025-02-18T17:00:00Z"),
            mean: 23.45,
            variance: 7.56,
            upperThreshold: 28.95,
            lowerThreshold: 17.95
        },
        measurements: [
            {
                createdAt: new Date("2025-02-18T15:30:00Z"),
                value: 30.86,
                isOutlier: true
            },
            {
                createdAt: new Date("2025-02-18T16:00:00Z"),
                value: 12.34,
                isOutlier: true
            }
        ]
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("get outliers: 200 OK", async () => {
        (authService.processToken as jest.Mock).mockResolvedValue(undefined);
        (measurementController.getSensorOutliers as jest.Mock).mockResolvedValue(expectedResponse);

        const response = await request(app)
            .get(endpoint)
            .set("Authorization", token)
            .query({
                startDate: "2025-02-18T16:00:00+01:00",
                endDate: "2025-02-18T18:00:00+01:00"
            });

        expect(response.status).toBe(200);
        expect(response.body.measurements).toHaveLength(2);
        expect(response.body.measurements.every(m => m.isOutlier)).toBe(true);
    });

    it("get outliers: 401 UnauthorizedError", async () => {
        (authService.processToken as jest.Mock).mockImplementation(() => {
            throw new UnauthorizedError("Unauthorized: Invalid token format");
        });

        const response = await request(app)
            .get(endpoint)
            .set("Authorization", token);

        expect(response.status).toBe(401);
        expect(response.body.code).toBe(401);
        expect(response.body.name).toBe("UnauthorizedError");
    });

    it("get outliers: 404 NotFoundError", async () => {
        (authService.processToken as jest.Mock).mockResolvedValue(undefined);
        (measurementController.getSensorOutliers as jest.Mock).mockImplementation(() => {
            throw new NotFoundError("Entity not found");
        });

        const response = await request(app)
            .get(endpoint)
            .set("Authorization", token);

        expect(response.status).toBe(404);
        expect(response.body.name).toBe("NotFoundError");
    });

    it("get outliers: 500 InternalServerError", async () => {
        (authService.processToken as jest.Mock).mockResolvedValue(undefined);
        (measurementController.getSensorOutliers as jest.Mock).mockImplementation(() => {
            throw new Error("Error");
        });

        const response = await request(app)
            .get(endpoint)
            .set("Authorization", token);

        expect(response.status).toBe(500);
        expect(response.body.name).toBe("InternalServerError");
    });
});