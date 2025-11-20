import { GatewayDAO } from "@models/dao/GatewayDAO";
import { Gateway as GatewayDTO } from "@models/dto/Gateway";
import { FAKE_DATA } from "../../fakeDataDAO/fakeDataDAOforGateways";
import * as gatewayController from "@controllers/gatewayController";
import * as mapperService from "@services/mapperService";
import { GatewayRepository } from "@repositories/GatewayRepository";
import { NetworkDAO } from "@models/dao/NetworkDAO";
import { NotFoundError } from "@models/errors/NotFoundError";
import { ConflictError } from "@models/errors/ConflictError";

jest.mock("@repositories/GatewayRepository");
jest.mock("@services/mapperService");

beforeEach(() => {
    jest.resetAllMocks();
});

describe("gatewayController: getAllGateways", () => {

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

        (mapperService.mapGatewayDAOToDTO as jest.Mock).mockImplementation((dao) => {
            return mockGatewaysDTO.find(dto => dto.macAddress === dao.macAddress);
        });

        const result = await gatewayController.getAllGateways(mockNetworkDAO.code);

        expect(result).toEqual(mockGatewaysDTO);
        expect(GatewayRepository).toHaveBeenCalledTimes(1);
        expect(mapperService.mapGatewayDAOToDTO).toHaveBeenCalledTimes(mockGatewaysDAO.length);

        const calls = (mapperService.mapGatewayDAOToDTO as jest.Mock).mock.calls;
        expect(calls[0][0]).toEqual(mockGatewaysDAO[0]);
        expect(calls[1][0]).toEqual(mockGatewaysDAO[1]);
        expect(calls[2][0]).toEqual(mockGatewaysDAO[2]);
    });

    it("network without gateways", async () => {

        const mockNetworkDAO: NetworkDAO = FAKE_DATA.FAKE_NETWORKS[2];

        const mockGatewaysDAO: GatewayDAO[] = [];

        const mockGatewaysDTO: GatewayDTO[] = [];

        (GatewayRepository as jest.Mock).mockImplementation(() => ({
            getAllGateways: jest.fn().mockResolvedValue(mockGatewaysDAO),
        }));

        (mapperService.mapGatewayDAOToDTO as jest.Mock).mockImplementation((dao) => {
            return mockGatewaysDTO.find(dto => dto.macAddress === dao.macAddress);
        });

        const result = await gatewayController.getAllGateways(mockNetworkDAO.code);

        expect(result).toEqual(mockGatewaysDTO);
        expect(GatewayRepository).toHaveBeenCalledTimes(1);
        expect(mapperService.mapGatewayDAOToDTO).toHaveBeenCalledTimes(mockGatewaysDAO.length);

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


describe("gatewayController: getGateway", () => {

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

        (mapperService.mapGatewayDAOToDTO as jest.Mock).mockImplementation((dao) => {
            return mockGatewayDTO;
        });

        const result = await gatewayController.getGateway(mockNetworkDAO.code, mockGatewayDAO.macAddress);

        expect(result).toEqual(mockGatewayDTO);
        expect(GatewayRepository).toHaveBeenCalledTimes(1);
        expect(mapperService.mapGatewayDAOToDTO).toHaveBeenCalledTimes(1);

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


describe("gatewayController: createGateway", () => {

    it("call sequence", async () => {

        const mockNetworkDAO: NetworkDAO = FAKE_DATA.FAKE_NETWORKS[0];

        const mockGatewayDTO: GatewayDTO = {
            macAddress: "11:22:33:44",
            name: "Test Gateway",
            description: "Description of Test Gateway"
        };

        const mockCreate = jest.fn();

        (GatewayRepository as jest.Mock).mockImplementation(() => ({
            createGateway: mockCreate
        }));

        await gatewayController.createGateway(mockNetworkDAO.code, mockGatewayDTO);

        expect(mockCreate).toHaveBeenCalledTimes(1);
        expect(mockCreate).toHaveBeenCalledWith(mockNetworkDAO.code, mockGatewayDTO);

    });

    it("NotFoundError exception propagation", async () => {

        const mockCreate = jest.fn().mockImplementation(() => {
            throw new NotFoundError("messaggio");
        });

        (GatewayRepository as jest.Mock).mockImplementation(() => ({
            createGateway: mockCreate
        }));

        const mockGatewayDTO: GatewayDTO = {
            macAddress: "11:22:33:44",
            name: "Test Gateway",
            description: "Description of Test Gateway"
        };

        await expect(
            gatewayController.createGateway("non-existent networkId", mockGatewayDTO)
        ).rejects.toThrow(NotFoundError);

    });

    it("ConflictError exception propagation", async () => {

        const mockNetworkDAO: NetworkDAO = FAKE_DATA.FAKE_NETWORKS[0];

        const mockGatewayDAO: GatewayDAO = FAKE_DATA.FAKE_GATEWAYS[0];

        const mockCreate = jest.fn().mockImplementation(() => {
            throw new ConflictError("messaggio");
        });

        (GatewayRepository as jest.Mock).mockImplementation(() => ({
            createGateway: mockCreate
        }));

        const mockGatewayDTO: GatewayDTO = {
            macAddress: mockGatewayDAO.macAddress,
        };

        if (mockGatewayDAO.name !== undefined && mockGatewayDAO.description !== null) {
            mockGatewayDTO.name = mockGatewayDAO.name;
        }

        if (mockGatewayDAO.description !== undefined && mockGatewayDAO.description !== null) {
            mockGatewayDTO.description = mockGatewayDAO.description;
        }

        await expect(
            gatewayController.createGateway(mockNetworkDAO.code, mockGatewayDTO)
        ).rejects.toThrow(ConflictError);

    });

});


describe("gatewayController: updateGateway", () => {

    it("call repository with correct arguments", async () => {

        const mockNetworkDAO: NetworkDAO = FAKE_DATA.FAKE_NETWORKS[0];

        const mockGatewayDAO: GatewayDAO = FAKE_DATA.FAKE_GATEWAYS[0];

        const mockGatewayDTO: GatewayDTO = {
            macAddress: "11:22:33:44",
            name: "Test Gateway",
            description: "Description of Test Gateway"
        };

        const mockUpdate = jest.fn();

        (GatewayRepository as jest.Mock).mockImplementation(() => ({
            updateGateway: mockUpdate
        }));

        await gatewayController.updateGateway(mockNetworkDAO.code, mockGatewayDAO.macAddress, mockGatewayDTO);

        expect(mockUpdate).toHaveBeenCalledTimes(1);
        expect(mockUpdate).toHaveBeenCalledWith(mockNetworkDAO.code, mockGatewayDAO.macAddress, mockGatewayDTO);

    });

    it("NotFoundError exception propagation", async () => {

        const mockGatewayDAO: GatewayDAO = FAKE_DATA.FAKE_GATEWAYS[0];

        const mockUpdate = jest.fn().mockImplementation(() => {
            throw new NotFoundError("messaggio");
        });

        (GatewayRepository as jest.Mock).mockImplementation(() => ({
            updateGateway: mockUpdate
        }));

        const mockGatewayDTO: GatewayDTO = {
            macAddress: "11:22:33:44",
            name: "Test Gateway",
            description: "Description of Test Gateway"
        };

        await expect(
            gatewayController.updateGateway("non-existent networkId", mockGatewayDAO.macAddress, mockGatewayDTO)
        ).rejects.toThrow(NotFoundError);

    });

    it("ConflictError exception propagation", async () => {

        const mockNetworkDAO: NetworkDAO = FAKE_DATA.FAKE_NETWORKS[0];

        const mockGateway1_DAO: GatewayDAO = FAKE_DATA.FAKE_GATEWAYS[0];
        const mockGateway2_DAO: GatewayDAO = FAKE_DATA.FAKE_GATEWAYS[0];

        const mockUpdate = jest.fn().mockImplementation(() => {
            throw new ConflictError("messaggio");
        });

        (GatewayRepository as jest.Mock).mockImplementation(() => ({
            updateGateway: mockUpdate
        }));

        const mockGateway2_DTO: GatewayDTO = {
            macAddress: mockGateway2_DAO.macAddress,
            name: "Test Gateway",
            description: "Description of Test Gateway"
        };

        await expect(
            gatewayController.updateGateway(mockNetworkDAO.code, mockGateway1_DAO.macAddress, mockGateway2_DTO)
        ).rejects.toThrow(ConflictError);

    });

});


describe("gatewayController: deleteGateway", () => {

    it("call repository with correct arguments", async () => {

        const mockNetworkDAO: NetworkDAO = FAKE_DATA.FAKE_NETWORKS[0];

        const mockGatewayDAO: GatewayDAO = FAKE_DATA.FAKE_GATEWAYS[0];

        const mockDelete = jest.fn();

        (GatewayRepository as jest.Mock).mockImplementation(() => ({
            deleteGateway: mockDelete
        }));

        await gatewayController.deleteGateway(mockNetworkDAO.code, mockGatewayDAO.macAddress);

        expect(mockDelete).toHaveBeenCalledTimes(1);
        expect(mockDelete).toHaveBeenCalledWith(mockNetworkDAO.code, mockGatewayDAO.macAddress);

    });

    it("NotFoundError exception propagation", async () => {

        const mockGatewayDAO: GatewayDAO = FAKE_DATA.FAKE_GATEWAYS[0];

        const mockDelete = jest.fn().mockImplementation(() => {
            throw new NotFoundError("messaggio");
        });

        (GatewayRepository as jest.Mock).mockImplementation(() => ({
            deleteGateway: mockDelete
        }));


        await expect(
            gatewayController.deleteGateway("non-existent networkId", mockGatewayDAO.macAddress)
        ).rejects.toThrow(NotFoundError);

    });

});