import * as networkController from "@controllers/networkController";
import { NetworkDAO } from "@models/dao/NetworkDAO";
import { NetworkRepository } from "@repositories/NetworkRepository";
import { FAKE_DATA } from "../../fakeDataDAO/fakeDataDAOforNetworks";
import { Network as NetworkDTO } from "@models/dto/Network";
import { NotFoundError } from "@models/errors/NotFoundError";
import { ConflictError } from "@models/errors/ConflictError";
import * as mapperService from "@services/mapperService";

// sono mockate tutte le funzioni usate nei metodi del controller.
jest.mock("@repositories/NetworkRepository");
jest.mock("@services/mapperService");

beforeEach(() => {
    jest.resetAllMocks();
});

describe("create Network", () => {
    it("call sequence", async () => {

        const mockCreate = jest.fn();
        (NetworkRepository as jest.Mock).mockImplementation(() => ({
            createNetwork: mockCreate
        }));

        const networkDto: NetworkDTO = {
            code: "NET01",
            name: "Rete 1",
            description: "Rete Network 1"
        };

        await networkController.createNetwork(networkDto);

        expect(mockCreate).toHaveBeenCalledTimes(1);
        expect(mockCreate).toHaveBeenCalledWith("NET01", "Rete 1", "Rete Network 1");

    });

    it("ConflictError exception propagation", async () => {

        const mockCreate = jest.fn().mockImplementation(() => {
            throw new ConflictError("messaggio");
        });
        (NetworkRepository as jest.Mock).mockImplementation(() => ({
            createNetwork: mockCreate
        }));

        const networkDto: NetworkDTO = {
            code: "NET01",
            name: "Rete 1",
            description: "Rete Network 1"
        };

        await expect(
            networkController.createNetwork(networkDto)
        ).rejects.toThrow(ConflictError);

    });
});

describe("get all networks", () => {
    it("call sequence and propagation of the correct networks", async () => {
        const mockNetworksDAO: NetworkDAO[] = [
            FAKE_DATA.FAKE_NETWORKS[0],
            FAKE_DATA.FAKE_NETWORKS[1]
        ];

        const mockNetworksDTO: NetworkDTO[] = mockNetworksDAO.map(n => ({
            code: n.code,
            name: n.name,
            description: n.description
        }));

        (NetworkRepository as jest.Mock).mockImplementation(() => ({
            getAllNetworks: jest.fn().mockResolvedValue(mockNetworksDAO),
        }));

        (mapperService.mapNetworkDAOToDTO as jest.Mock).mockImplementation((dao) => {
            return mockNetworksDTO.find(dto => dto.code === dao.code);
        });

        const result = await networkController.getAllNetworks();

        expect(result).toEqual(mockNetworksDTO);
        expect(NetworkRepository).toHaveBeenCalledTimes(1);
        expect(mapperService.mapNetworkDAOToDTO).toHaveBeenCalledTimes(mockNetworksDAO.length);

        const calls = (mapperService.mapNetworkDAOToDTO as jest.Mock).mock.calls;
        expect(calls[0][0]).toEqual(mockNetworksDAO[0]);
        expect(calls[1][0]).toEqual(mockNetworksDAO[1]);
    });
});

describe("get network by code", () => {
    it("call sequence and propagation of the correct network", async () => {
        const mockNetworkDAO = FAKE_DATA.FAKE_NETWORKS[0];
        const mockNetworkDTO: NetworkDTO = {
            code: mockNetworkDAO.code,
            name: mockNetworkDAO.name,
            description: mockNetworkDAO.description,
        };

        (NetworkRepository as jest.Mock).mockImplementation(() => ({
            getNetworkByCode: jest.fn().mockResolvedValue(mockNetworkDAO),
        }));

        (mapperService.mapNetworkDAOToDTO as jest.Mock).mockReturnValue(mockNetworkDTO);

        const result = await networkController.getNetwork(mockNetworkDAO.code);

        expect(result).toEqual(mockNetworkDTO);
        expect(NetworkRepository).toHaveBeenCalledTimes(1);
        expect(mapperService.mapNetworkDAOToDTO).toHaveBeenCalledWith(mockNetworkDAO);
    });

    it("NotFoundError propagation if network is not found", async () => {
        (NetworkRepository as jest.Mock).mockImplementation(() => ({
            getNetworkByCode: jest.fn().mockImplementation(() => {
                throw new NotFoundError("Network not found");
            }),
        }));

        const code = "NET02";

        await expect(networkController.getNetwork(code)).rejects.toThrow(NotFoundError);
    });

});

describe("deleteNetwork", () => {
    it("call repository with correct code", async () => {
        const mockDelete = jest.fn();
        (NetworkRepository as jest.Mock).mockImplementation(() => ({
            deleteNetwork: mockDelete
        }));

        const code = "NET01";

        await networkController.deleteNetwork(code);

        expect(NetworkRepository).toHaveBeenCalledTimes(1);
        expect(mockDelete).toHaveBeenCalledTimes(1);
        expect(mockDelete).toHaveBeenCalledWith(code);
    });

    it("NotFoundError propagation from repository", async () => {
        const mockDelete = jest.fn().mockImplementation(() => {
            throw new NotFoundError("Network not found");
        });

        (NetworkRepository as jest.Mock).mockImplementation(() => ({
            deleteNetwork: mockDelete
        }));

        const code = "NET02";

        await expect(networkController.deleteNetwork(code)).rejects.toThrow(NotFoundError);
    });
});

describe("updateNetwork", () => {
    it("call repository with correct arguments", async () => {
        const mockUpdate = jest.fn();
        (NetworkRepository as jest.Mock).mockImplementation(() => ({
            updateNetwork: mockUpdate
        }));

        const codeToUpdate = "NET01";
        const networkDto: NetworkDTO = {
            code: "NET01",
            name: "New name",
            description: "New description"
        };

        await networkController.updateNetwork(codeToUpdate, networkDto);

        expect(NetworkRepository).toHaveBeenCalledTimes(1);
        expect(mockUpdate).toHaveBeenCalledTimes(1);
        expect(mockUpdate).toHaveBeenCalledWith(
            codeToUpdate,
            networkDto.code,
            networkDto.name,
            networkDto.description
        );
    });

    it("ConflictError propagation from repository", async () => {
        const mockUpdate = jest.fn().mockImplementation(() => {
            throw new ConflictError("Code already used");
        });

        (NetworkRepository as jest.Mock).mockImplementation(() => ({
            updateNetwork: mockUpdate
        }));

        const codeToUpdate = "NET01";
        const networkDto: NetworkDTO = {
            code: "NET02",
            name: "Name",
            description: "Description"
        };

        await expect(
            networkController.updateNetwork(codeToUpdate, networkDto)
        ).rejects.toThrow(ConflictError);
    });

    it("NotFoundError propagation from repository", async () => {
        const mockUpdate = jest.fn().mockImplementation(() => {
            throw new NotFoundError("Network not found");
        });

        (NetworkRepository as jest.Mock).mockImplementation(() => ({
            updateNetwork: mockUpdate
        }));

        const codeToUpdate = "NET02";
        const networkDto: NetworkDTO = {
            code: "NET02",
            name: "Name",
            description: "Description"
        };

        await expect(
            networkController.updateNetwork(codeToUpdate, networkDto)
        ).rejects.toThrow(NotFoundError);
    });
});
