import { NetworkDAO } from "@models/dao/NetworkDAO";
import { Network as NetworkDTO } from "@models/dto/Network";
import { FAKE_DATA } from "@test/fakeDataDAO/fakeDataDAOforNetworks"; 
import * as networkController from "@controllers/networkController";
import { NetworkRepository } from "@repositories/NetworkRepository";
import { NotFoundError } from "@models/errors/NotFoundError";
import { ConflictError } from "@models/errors/ConflictError";
import { initializeTestDataSource, closeTestDataSource } from "@test/setup/test-datasource";
import { createFakeNetworks } from "@test/fakeDataDAO/createFakeData";

beforeEach(async () => {
    await initializeTestDataSource();
    await createFakeNetworks(FAKE_DATA.FAKE_NETWORKS);
});

afterEach(async () => {
    await closeTestDataSource();
})


describe("networkController: getAllNetworks + mapperService + networkRepository", () => {

    it("should return networks mapped in DTO", async () => {

        const networksDAO: NetworkDAO[] = [
            FAKE_DATA.FAKE_NETWORKS[0],
            FAKE_DATA.FAKE_NETWORKS[1],
            FAKE_DATA.FAKE_NETWORKS[2],
        ];

        const networksDTO: NetworkDTO[] = networksDAO.map(network => {
            const dto: any = { code: network.code };

            if (network.name !== undefined && network.name !== null) {
                dto.name = network.name;
            }

            if (network.description !== undefined && network.description !== null) {
                dto.description = network.description;
            }

            return dto;
        });

        const result = await networkController.getAllNetworks();

        expect(result).toEqual(networksDTO);

    });
    
});


describe("networkController: getNetwork + mapperService + networkRepository", () => {

    it("should return network mapped in DTO", async () => {

        const networkDAO: NetworkDAO = FAKE_DATA.FAKE_NETWORKS[0];

        const networkDTO: NetworkDTO = {
            code: networkDAO.code,
        };

        if (networkDAO.name !== undefined && networkDAO.name !== null) {
            networkDTO.name = networkDAO.name;
        }

        if (networkDAO.description !== undefined && networkDAO.name !== null) {
            networkDTO.description = networkDAO.description;
        }

        const result = await networkController.getNetwork(networkDAO.code);

        expect(result).toEqual(networkDTO);

    });

    it("NotFoundError exception propagation", async () => {

        await expect(
            networkController.getNetwork("non-existent networkId")
        ).rejects.toThrow(NotFoundError);

    });

});


describe("networkController: createNetwork + gatewayRepository", () => {

    it("call sequence", async () => {

        const networkDTO: NetworkDTO = {
            code: "11:22:33:44",
            name: "Test Network",
            description: "Description of Test Network"
        };

        await expect(
            networkController.createNetwork(networkDTO)
        ).resolves.not.toThrow();

    });

    it("ConflictError exception propagation", async () => {

        const networkDAO: NetworkDAO = FAKE_DATA.FAKE_NETWORKS[0];

        const networkDTO: NetworkDTO = {
            code: networkDAO.code,
        };

        if (networkDAO.name !== undefined && networkDAO.description !== null) {
            networkDTO.name = networkDAO.name;
        }

        if (networkDAO.description !== undefined && networkDAO.description !== null) {
            networkDTO.description = networkDAO.description;
        }

        await expect(
            networkController.createNetwork(networkDTO)
        ).rejects.toThrow(ConflictError);

    });
    
});


describe("networkController: updateNetwork + networkRepository", () => {

    it("call repository with correct arguments", async () => {

        const networkDAO: NetworkDAO = FAKE_DATA.FAKE_NETWORKS[0];

        const networkDTO: NetworkDTO = {
            code: "11:22:33:44",
            name: "Test Network",
            description: "Description of Test Network"
        };

        await expect(
             networkController.updateNetwork(networkDAO.code, networkDTO)
        ).resolves.not.toThrow();

    });

    it("NotFoundError exception propagation", async () => {

        const networkDTO: NetworkDTO = {
            code: "11:22:33:44",
            name: "Test Network",
            description: "Description of Test Network"
        };

        await expect(
            networkController.updateNetwork("non-existent networkId", networkDTO)
        ).rejects.toThrow(NotFoundError);

    });

    it("ConflictError exception propagation", async () => {

        const network1_DAO: NetworkDAO = FAKE_DATA.FAKE_NETWORKS[0];
        const network2_DAO: NetworkDAO = FAKE_DATA.FAKE_NETWORKS[1];

        const network2_DTO: NetworkDTO = {
            code: network2_DAO.code,
            name: "Test Network",
            description: "Description of Test Network"
        };

        await expect(
            networkController.updateNetwork(network1_DAO.code, network2_DTO)
        ).rejects.toThrow(ConflictError);

    });

});


describe("networkController: deleteNetwork + networkRepository", () => {

    it("call repository with correct arguments", async () => {

        const networkDAO: NetworkDAO = FAKE_DATA.FAKE_NETWORKS[0];

        await expect(
            networkController.deleteNetwork(networkDAO.code)
        ).resolves.not.toThrow();

    });

    it("NotFoundError exception propagation", async () => {

        await expect(
            networkController.deleteNetwork("non-existent networkId")
        ).rejects.toThrow(NotFoundError);

    });

});
