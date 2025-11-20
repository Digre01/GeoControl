import { closeTestDataSource, initializeTestDataSource, TestDataSource } from "@test/setup/test-datasource";
import { createFakeGateways, createFakeNetworks } from "../../fakeDataDAO/createFakeData";
import { FAKE_DATA } from "../../fakeDataDAO/fakeDataDAOforGateways";
import { GatewayDAO } from "@models/dao/GatewayDAO";
import { NotFoundError } from "@models/errors/NotFoundError";
import { GatewayRepository } from "@repositories/GatewayRepository";
import { Gateway } from "@models/dto/Gateway";
import { BadRequest } from "express-openapi-validator/dist/openapi.validator";
import { ConflictError } from "@models/errors/ConflictError";


beforeEach(async () => {
    await initializeTestDataSource();
    await createFakeNetworks(FAKE_DATA.FAKE_NETWORKS);
    await createFakeGateways(FAKE_DATA.FAKE_GATEWAYS);
});

afterEach(async () => {
    await TestDataSource.getRepository(GatewayDAO).clear();
    await closeTestDataSource();
});


describe("GatewayRepository: getAllGateways", () => {

    const repo = new GatewayRepository();

    it("should return all gateways for a given networkId", async () => {

        const network = FAKE_DATA.FAKE_NETWORKS[0];
        const expectedGateways = [FAKE_DATA.FAKE_GATEWAYS[0], FAKE_DATA.FAKE_GATEWAYS[1], FAKE_DATA.FAKE_GATEWAYS[2]];

        const gateways = await repo.getAllGateways(
            network.code,
        );

        expect(gateways).toEqual(expectedGateways);
        expect(gateways).toHaveLength(3);
    });

    it("should return empty array if no gateways are found", async () => {

        const network = FAKE_DATA.FAKE_NETWORKS[2];
        const expectedGateways = network.gateways;

        const gateways = await repo.getAllGateways(
            network.code
        );

        expect(gateways).toEqual(expectedGateways);
        expect(gateways).toHaveLength(0);

    });

    it("should throw an error if network not found", async () => {

        await expect(repo.getAllGateways(
            "NET09"
        )).rejects.toThrow(NotFoundError);

    });

});

describe("GatewayRepository: getGatewayByMacAddress", () => {

    const repo = new GatewayRepository();

    it("should return the gateway if macAddress and networkId match", async () => {
        const expectedGateway = FAKE_DATA.FAKE_GATEWAYS[0];

        const result = await repo.getGatewayByMacAddress(expectedGateway.network.code, expectedGateway.macAddress);

        expect(result).toEqual(expectedGateway);
    });

    it("should throw error if the gatewayMac doesn't exist", async () => {
        const expectedGateway = FAKE_DATA.FAKE_GATEWAYS[0];

        await expect(
            repo.getGatewayByMacAddress(expectedGateway.network.code, "thisMacDoesntExists")
        ).rejects.toThrow(NotFoundError);

    });

    it("should throw error if the gateway exists but doesn't match the networkId", async () => {
        const expectedGateway = FAKE_DATA.FAKE_GATEWAYS[0];

        await expect(
            repo.getGatewayByMacAddress("thisCodeDoesntExists", expectedGateway.macAddress)
        ).rejects.toThrow(NotFoundError);

    });

});


describe("GatewayRepository: createGateway", () => {

    const repo = new GatewayRepository();

    it("should create a new gateway associated to networkId", async () => {

        const gatewayDTO: Gateway = {
            macAddress: "12:34:56:78",
            name: "Test Gateway",
            description: "Creating a Test Gateway",
        }

        const network = FAKE_DATA.FAKE_NETWORKS[0];

        const result = await repo.createGateway(network.code, gatewayDTO);

        expect(result).toMatchObject(gatewayDTO);
    });

    it("should create a new gateway having no name, associated to networkId", async () => {

        const gatewayDTO: Gateway = {
            macAddress: "12:34:56:78",
            description: "Creating a Test Gateway",
        }

        const network = FAKE_DATA.FAKE_NETWORKS[0];

        const result = await repo.createGateway(network.code, gatewayDTO);

        expect(result).toMatchObject(gatewayDTO);

    });

    it("should create a new gateway having no description, associated to networkId", async () => {

        const gatewayDTO: Gateway = {
            macAddress: "12:34:56:78",
            name: "Test Gateway",
        }

        const network = FAKE_DATA.FAKE_NETWORKS[0];

        const result = await repo.createGateway(network.code, gatewayDTO);

        expect(result).toMatchObject(gatewayDTO);

    });

    it("should throw error because the networkId doesn't exist", async () => {

        const gatewayDTO: Gateway = {
            macAddress: "12:34:56:78",
            name: "Test Gateway",
            description: "Creating a Test Gateway",
        }

        await expect(
            repo.createGateway("non-existent networkId", gatewayDTO)
        ).rejects.toThrow(NotFoundError);

    });

    it("should throw error because the gatewayMac already exists", async () => {

        const network = FAKE_DATA.FAKE_NETWORKS[0];
        const gateway = FAKE_DATA.FAKE_GATEWAYS[0];

        const gatewayDTO: Gateway = {
            macAddress: gateway.macAddress,
            name: "Test Gateway",
            description: "Creating a Test Gateway",
        }

        await expect(
            repo.createGateway(network.code, gatewayDTO)
        ).rejects.toThrow(ConflictError);

    });

});


describe("GatewayRepository: updateGateway", () => {

    const repo = new GatewayRepository();

    it("should update the gateway associated to networkId", async () => {

        const gatewayDTO: Gateway = {
            macAddress: "12:34:56:78",
            name: "Test Gateway",
            description: "Updating a Test Gateway",
        }

        const network = FAKE_DATA.FAKE_NETWORKS[0];
        const gateway = FAKE_DATA.FAKE_GATEWAYS[0];

        await repo.updateGateway(network.code, gateway.macAddress, gatewayDTO);
        const result = await repo.getGatewayByMacAddress(network.code, "12:34:56:78");

        expect(result).toMatchObject(gatewayDTO);
    });

    it("should update only macAddress and description of the gateway associated to networkId", async () => {

        const gatewayDTO: Gateway = {
            macAddress: "12:34:56:78",
            description: "Updating a Test Gateway",
        }

        const network = FAKE_DATA.FAKE_NETWORKS[0];
        const gateway = FAKE_DATA.FAKE_GATEWAYS[0];

        await repo.updateGateway(network.code, gateway.macAddress, gatewayDTO);
        const result = await repo.getGatewayByMacAddress(network.code, "12:34:56:78");

        expect(result).toMatchObject({
            macAddress: "12:34:56:78",
            name: gateway.name,
            description: "Updating a Test Gateway",
        });

    });

    it("should preserve all the informations of the gateway associated to networkId", async () => {

        const gatewayDTO: Gateway = {
        }

        const network = FAKE_DATA.FAKE_NETWORKS[0];
        const gateway = FAKE_DATA.FAKE_GATEWAYS[0];

        await repo.updateGateway(network.code, gateway.macAddress, gatewayDTO);
        const result = await repo.getGatewayByMacAddress(network.code, gateway.macAddress);

        expect(result).toMatchObject(gateway);

    });

    it("should throw error because the networkId doesn't exist", async () => {

        const gatewayDTO: Gateway = {
            macAddress: "12:34:56:78",
            name: "Test Gateway",
            description: "Creating a Test Gateway",
        }
        const gateway = FAKE_DATA.FAKE_GATEWAYS[0];

        await expect(
            repo.updateGateway("non-existent networkId", gateway.macAddress, gatewayDTO)
        ).rejects.toThrow(NotFoundError);

    });

    it("should throw error because the gatewayMac already exists", async () => {

        const network = FAKE_DATA.FAKE_NETWORKS[0];
        const gateway_1 = FAKE_DATA.FAKE_GATEWAYS[0];
        const gateway_2 = FAKE_DATA.FAKE_GATEWAYS[1];

        const gatewayDTO: Gateway = {
            macAddress: gateway_2.macAddress,
            name: "Test Gateway",
            description: "Creating a Test Gateway",
        }

        await expect(
            repo.updateGateway(network.code, gateway_1.macAddress, gatewayDTO)
        ).rejects.toThrow(ConflictError);

    });

});


describe("GatewayRepository: deleteGateway", () => {

    const repo = new GatewayRepository();

    it("should delete the gateway associated to networkId", async () => {

        const network = FAKE_DATA.FAKE_NETWORKS[0];
        const gateway = FAKE_DATA.FAKE_GATEWAYS[0];

        await repo.deleteGateway(network.code, gateway.macAddress);

        await expect(
            repo.getGatewayByMacAddress(network.code, gateway.macAddress)
        ).rejects.toThrow(NotFoundError);

    });

    it("should throw error because the networkId doesn't exist", async () => {

        const gateway = FAKE_DATA.FAKE_GATEWAYS[0];

        await expect(
            repo.deleteGateway("non-existent networkId", gateway.macAddress)
        ).rejects.toThrow(NotFoundError);

    });

    it("should throw error because the gatewayMac doesn't exists", async () => {

        const network = FAKE_DATA.FAKE_NETWORKS[0];

        await expect(
            repo.deleteGateway(network.code, "non-existing gatewayMac")
        ).rejects.toThrow(NotFoundError);

    });

});