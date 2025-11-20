import { GatewayDAO } from "@models/dao/GatewayDAO";
import { Gateway as GatewayDTO } from "@models/dto/Gateway";
import { FAKE_DATA } from "@test/fakeDataDAO/fakeDataDAOforGateways"; 
import * as gatewayController from "@controllers/gatewayController";
import { GatewayRepository } from "@repositories/GatewayRepository";
import { NetworkDAO } from "@models/dao/NetworkDAO";
import { NotFoundError } from "@models/errors/NotFoundError";
import { ConflictError } from "@models/errors/ConflictError";
import { initializeTestDataSource, closeTestDataSource } from "@test/setup/test-datasource";
import { createFakeGateways, createFakeNetworks } from "@test/fakeDataDAO/createFakeData";

beforeEach(async () => {
    await initializeTestDataSource();
    await createFakeNetworks(FAKE_DATA.FAKE_NETWORKS);
    await createFakeGateways(FAKE_DATA.FAKE_GATEWAYS);
});

afterEach(async () => {
    await closeTestDataSource();
})


describe("gatewayController: getAllGateways + mapperService + gatewayRepository", () => {

    it("should return gateways mapped in DTO", async () => {

        const networkDAO: NetworkDAO = FAKE_DATA.FAKE_NETWORKS[0];

        const gatewaysDAO: GatewayDAO[] = [
            FAKE_DATA.FAKE_GATEWAYS[0],
            FAKE_DATA.FAKE_GATEWAYS[1],
            FAKE_DATA.FAKE_GATEWAYS[2],
        ];

        const gatewaysDTO: GatewayDTO[] = gatewaysDAO.map(gateway => {
            const dto: any = { macAddress: gateway.macAddress };

            if (gateway.name !== undefined && gateway.name !== null) {
                dto.name = gateway.name;
            }

            if (gateway.description !== undefined && gateway.description !== null) {
                dto.description = gateway.description;
            }

            return dto;
        });

        const result = await gatewayController.getAllGateways(networkDAO.code);

        expect(result).toEqual(gatewaysDTO);

    });
    
    it("network without gateways", async () => {

        const networkDAO: NetworkDAO = FAKE_DATA.FAKE_NETWORKS[2];

        const gatewaysDTO: GatewayDTO[] = [];

        const result = await gatewayController.getAllGateways(networkDAO.code);

        expect(result).toEqual(gatewaysDTO);

    });
    
    it("NotFoundError exception propagation", async () => {

        await expect(
            gatewayController.getAllGateways("non-existent networkId")
        ).rejects.toThrow(NotFoundError);

    });
    
});


describe("gatewayController: getGateway + mapperService + gatewayRepository", () => {

    it("should return gateway mapped in DTO", async () => {

        const networkDAO: NetworkDAO = FAKE_DATA.FAKE_NETWORKS[0];

        const gatewayDAO: GatewayDAO = FAKE_DATA.FAKE_GATEWAYS[0];

        const gatewayDTO: GatewayDTO = {
            macAddress: gatewayDAO.macAddress,
        };

        if (gatewayDAO.name !== undefined && gatewayDAO.name !== null) {
            gatewayDTO.name = gatewayDAO.name;
        }

        if (gatewayDAO.description !== undefined && gatewayDAO.name !== null) {
            gatewayDTO.description = gatewayDAO.description;
        }

        const result = await gatewayController.getGateway(networkDAO.code, gatewayDAO.macAddress);

        expect(result).toEqual(gatewayDTO);

    });

    it("NotFoundError exception propagation", async () => {

        await expect(
            gatewayController.getGateway("non-existent networkId", "non-existent gatewayMac")
        ).rejects.toThrow(NotFoundError);

    });

});


describe("gatewayController: createGateway + gatewayRepository", () => {

    it("call sequence", async () => {

        const networkDAO: NetworkDAO = FAKE_DATA.FAKE_NETWORKS[0];

        const gatewayDTO: GatewayDTO = {
            macAddress: "11:22:33:44",
            name: "Test Gateway",
            description: "Description of Test Gateway"
        };

        await expect(
            gatewayController.createGateway(networkDAO.code, gatewayDTO)
        ).resolves.not.toThrow();

    });
    
    it("NotFoundError exception propagation", async () => {

        const gatewayDTO: GatewayDTO = {
            macAddress: "11:22:33:44",
            name: "Test Gateway",
            description: "Description of Test Gateway"
        };

        await expect(
            gatewayController.createGateway("non-existent networkId", gatewayDTO)
        ).rejects.toThrow(NotFoundError);

    });

    it("ConflictError exception propagation", async () => {

        const networkDAO: NetworkDAO = FAKE_DATA.FAKE_NETWORKS[0];

        const gatewayDAO: GatewayDAO = FAKE_DATA.FAKE_GATEWAYS[0];

        const gatewayDTO: GatewayDTO = {
            macAddress: gatewayDAO.macAddress,
        };

        if (gatewayDAO.name !== undefined && gatewayDAO.description !== null) {
            gatewayDTO.name = gatewayDAO.name;
        }

        if (gatewayDAO.description !== undefined && gatewayDAO.description !== null) {
            gatewayDTO.description = gatewayDAO.description;
        }

        await expect(
            gatewayController.createGateway(networkDAO.code, gatewayDTO)
        ).rejects.toThrow(ConflictError);

    });
    
});


describe("gatewayController: updateGateway + gatewayRepository", () => {

    it("call repository with correct arguments", async () => {

        const networkDAO: NetworkDAO = FAKE_DATA.FAKE_NETWORKS[0];

        const gatewayDAO: GatewayDAO = FAKE_DATA.FAKE_GATEWAYS[0];

        const gatewayDTO: GatewayDTO = {
            macAddress: "11:22:33:44",
            name: "Test Gateway",
            description: "Description of Test Gateway"
        };

        await expect(
             gatewayController.updateGateway(networkDAO.code, gatewayDAO.macAddress, gatewayDTO)
        ).resolves.not.toThrow();

    });

    it("NotFoundError exception propagation", async () => {

        const gatewayDAO: GatewayDAO = FAKE_DATA.FAKE_GATEWAYS[0];

        const gatewayDTO: GatewayDTO = {
            macAddress: "11:22:33:44",
            name: "Test Gateway",
            description: "Description of Test Gateway"
        };

        await expect(
            gatewayController.updateGateway("non-existent networkId", gatewayDAO.macAddress, gatewayDTO)
        ).rejects.toThrow(NotFoundError);

    });

    it("ConflictError exception propagation", async () => {

        const networkDAO: NetworkDAO = FAKE_DATA.FAKE_NETWORKS[0];

        const gateway1_DAO: GatewayDAO = FAKE_DATA.FAKE_GATEWAYS[0];
        const gateway2_DAO: GatewayDAO = FAKE_DATA.FAKE_GATEWAYS[1];

        const gateway2_DTO: GatewayDTO = {
            macAddress: gateway2_DAO.macAddress,
            name: "Test Gateway",
            description: "Description of Test Gateway"
        };

        await expect(
            gatewayController.updateGateway(networkDAO.code, gateway1_DAO.macAddress, gateway2_DTO)
        ).rejects.toThrow(ConflictError);

    });

});


describe("gatewayController: deleteGateway + gatewayRepository", () => {

    it("call repository with correct arguments", async () => {

        const networkDAO: NetworkDAO = FAKE_DATA.FAKE_NETWORKS[0];

        const gatewayDAO: GatewayDAO = FAKE_DATA.FAKE_GATEWAYS[0];

        await expect(
            gatewayController.deleteGateway(networkDAO.code, gatewayDAO.macAddress)
        ).resolves.not.toThrow();

    });

    it("NotFoundError exception propagation", async () => {

        const gatewayDAO: GatewayDAO = FAKE_DATA.FAKE_GATEWAYS[0];

        await expect(
            gatewayController.deleteGateway("non-existent networkId", gatewayDAO.macAddress)
        ).rejects.toThrow(NotFoundError);

    });

});
