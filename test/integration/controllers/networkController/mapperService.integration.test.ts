import { NetworkDAO } from "@models/dao/NetworkDAO";
import { Network as NetworkDTO } from "@models/dto/Network";
import { FAKE_DATA } from "@test/fakeDataDAO/fakeDataDAOforNetworks"; 
import * as networkController from "@controllers/networkController";
import { NetworkRepository } from "@repositories/NetworkRepository";
import { NotFoundError } from "@models/errors/NotFoundError";

jest.mock("@repositories/NetworkRepository");

beforeEach(() => {
    jest.resetAllMocks();
});

describe("networkController: getAllNetworks + mapperService", () => {

    it("should return networks mapped in DTO", async () => {

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

        (NetworkRepository as jest.Mock).mockImplementation(() => ({
            getAllNetworks: jest.fn().mockResolvedValue(mockNetworksDAO),
        }));

        const result = await networkController.getAllNetworks();

        expect(result).toEqual(mockNetworksDTO);
        expect(NetworkRepository).toHaveBeenCalledTimes(1);

    });

});


describe("networkController: getNetwork + mapperService", () => {

    it("should return network mapped in DTO", async () => {

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
        //getNetworkByCode
        (NetworkRepository as jest.Mock).mockImplementation(() => ({
            getNetworkByCode: jest.fn().mockResolvedValue(mockNetworkDAO),
        }));

        const result = await networkController.getNetwork(mockNetworkDAO.code);

        expect(result).toEqual(mockNetworkDTO);
        expect(NetworkRepository).toHaveBeenCalledTimes(1);

    });

    it("NotFoundError exception propagation", async () => {

        const mockCreate = jest.fn().mockImplementation(() => {
            throw new NotFoundError("messaggio");
        });

        (NetworkRepository as jest.Mock).mockImplementation(() => ({
            getNetworkByCode: mockCreate
        }));

        await expect(
            networkController.getNetwork("non-existent networkId")
        ).rejects.toThrow(NotFoundError);

    });

});