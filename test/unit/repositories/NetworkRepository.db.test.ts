import { NetworkRepository } from "@repositories/NetworkRepository";
import {
    initializeTestDataSource,
    closeTestDataSource,
    TestDataSource
} from "@test/setup/test-datasource";
import { NetworkDAO } from "@models/dao/NetworkDAO";
import { NotFoundError } from "@models/errors/NotFoundError";
import { ConflictError } from "@models/errors/ConflictError";
import { createFakeNetworks } from "../../fakeDataDAO/createFakeData";
import { FAKE_DATA } from "../../fakeDataDAO/fakeDataDAOforNetworks";
import { Network as NetworkDTO } from "@dto/Network";




beforeEach(async () => {
    await initializeTestDataSource();
    await createFakeNetworks(FAKE_DATA.FAKE_NETWORKS);
});

afterEach(async () => {
    await TestDataSource.getRepository(NetworkDAO).clear();
    await closeTestDataSource();
});

describe("NetworkRepository: getAllNetworks", () => {

    const repo = new NetworkRepository();

    it("should return all networks", async () => {
        const expectedNetworks = [FAKE_DATA.FAKE_NETWORKS[0], FAKE_DATA.FAKE_NETWORKS[1], FAKE_DATA.FAKE_NETWORKS[2]];
        const networks = await repo.getAllNetworks();
        expect(networks).toEqual(expectedNetworks);
        expect(networks).toHaveLength(3);
    });

});

describe("NetworkRepository: getNetworkByCode", () => {

    const repo = new NetworkRepository();

    it("should return a network for a given networkId", async () => {
        const expectedNetwork = FAKE_DATA.FAKE_NETWORKS[0];
        const network = await repo.getNetworkByCode("NET01");
        expect(network).toEqual(expectedNetwork);
    });

    it("should throw an error if network not found", async () => {
        await expect(repo.getNetworkByCode("NET09")).rejects.toThrow(NotFoundError);
    });

});

describe("NetworkRepository: createNetwork", () => {

    const repo = new NetworkRepository();

    it("should create a new network", async () => {
        const network = await repo.createNetwork("NET02", "Rete 2", "Rete Network 2");
        expect(network).toMatchObject({
            code: "NET02",
            name: "Rete 2",
            description: "Rete Network 2"
        });

        const found = await repo.getNetworkByCode("NET02");
        expect(found.name).toBe("Rete 2");
    });

    it("should throw an error if network code is already in use", async () => {
        await expect(repo.createNetwork("NET01")).rejects.toThrow(ConflictError);
    });

});

describe("NetworkRepository: updateNetwork", () => {

    const repo = new NetworkRepository();

    it("should update an existing network", async () => {
        const network = await repo.updateNetwork("NET01", "NET02", "Rete 2", "Rete Network 2");
        expect(network).toMatchObject({
            code: "NET02",
            name: "Rete 2",
            description: "Rete Network 2"
        });

        const found = await repo.getNetworkByCode("NET02");
        expect(found.name).toBe("Rete 2");
    });

    it("should throw an error if network code is already in use", async () => {
        await expect(repo.updateNetwork("NET04", "NET01", "Rete 1", "Rete Network 1")).rejects.toThrow(ConflictError);
    });

    it("should throw an error if network not found", async () => {
        await expect(repo.updateNetwork("NET09", "NET01", "Rete 1", "Rete Network 1")).rejects.toThrow(NotFoundError);
    });

});

describe("NetworkRepository: deleteNetwork", () => {

    const repo = new NetworkRepository();

    it("should delete an existing network", async () => {
        const network = await repo.deleteNetwork("NET01");
        await expect(repo.getNetworkByCode("NET01")).rejects.toThrow(NotFoundError);
    });

    it("should throw an error if network not found", async () => {
        await expect(repo.deleteNetwork("NET09")).rejects.toThrow(NotFoundError);
    });

});