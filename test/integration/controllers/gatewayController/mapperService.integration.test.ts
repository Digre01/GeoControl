import { GatewayDAO } from "@models/dao/GatewayDAO";
import { Gateway as GatewayDTO } from "@models/dto/Gateway";
import { FAKE_DATA } from "@test/fakeDataDAO/fakeDataDAOforGateways"; 
import * as gatewayController from "@controllers/gatewayController";
import { GatewayRepository } from "@repositories/GatewayRepository";
import { NetworkDAO } from "@models/dao/NetworkDAO";
import { NotFoundError } from "@models/errors/NotFoundError";

jest.mock("@repositories/GatewayRepository");

beforeEach(() => {
    jest.resetAllMocks();
});

describe("gatewayController: getAllGateways + mapperService", () => {

    it("should return gateways mapped in DTO", async () => {

        const mockNetworkDAO: NetworkDAO = FAKE_DATA.FAKE_NETWORKS[0];

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

        (GatewayRepository as jest.Mock).mockImplementation(() => ({
            getAllGateways: jest.fn().mockResolvedValue(mockGatewaysDAO),
        }));

        const result = await gatewayController.getAllGateways(mockNetworkDAO.code);

        expect(result).toEqual(mockGatewaysDTO);
        expect(GatewayRepository).toHaveBeenCalledTimes(1);

    });
    
    it("network without gateways", async () => {

        const mockNetworkDAO: NetworkDAO = FAKE_DATA.FAKE_NETWORKS[2];

        const mockGatewaysDAO: GatewayDAO[] = [];

        const mockGatewaysDTO: GatewayDTO[] = [];

        (GatewayRepository as jest.Mock).mockImplementation(() => ({
            getAllGateways: jest.fn().mockResolvedValue(mockGatewaysDAO),
        }));

        const result = await gatewayController.getAllGateways(mockNetworkDAO.code);

        expect(result).toEqual(mockGatewaysDTO);
        expect(GatewayRepository).toHaveBeenCalledTimes(1);

    });
    
    it("NotFoundError exception propagation", async () => {

        const mockCreate = jest.fn().mockImplementation(() => {
            throw new NotFoundError("messaggio");
        });

        (GatewayRepository as jest.Mock).mockImplementation(() => ({
            getAllGateways: mockCreate
        }));

        await expect(
            gatewayController.getAllGateways("non-existent networkId")
        ).rejects.toThrow(NotFoundError);

    });
    

});


describe("gatewayController: getGateway + mapperService", () => {

    it("should return gateway mapped in DTO", async () => {

        const mockNetworkDAO: NetworkDAO = FAKE_DATA.FAKE_NETWORKS[0];

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
        //getGatewayByMacAddress
        (GatewayRepository as jest.Mock).mockImplementation(() => ({
            getGatewayByMacAddress: jest.fn().mockResolvedValue(mockGatewayDAO),
        }));

        const result = await gatewayController.getGateway(mockNetworkDAO.code, mockGatewayDAO.macAddress);

        expect(result).toEqual(mockGatewayDTO);
        expect(GatewayRepository).toHaveBeenCalledTimes(1);

    });

    it("NotFoundError exception propagation", async () => {

        const mockCreate = jest.fn().mockImplementation(() => {
            throw new NotFoundError("messaggio");
        });

        (GatewayRepository as jest.Mock).mockImplementation(() => ({
            getGatewayByMacAddress: mockCreate
        }));

        await expect(
            gatewayController.getGateway("non-existent networkId", "non-existent gatewayMac")
        ).rejects.toThrow(NotFoundError);

    });

});