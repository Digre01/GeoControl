import { UserDAO } from "@models/dao/UserDAO";
import { User as UserDTO } from "@models/dto/User";
import { FAKE_DATA } from "@test/fakeDataDAO/fakeDataDAOforUsers"; 
import * as authController from "@controllers/authController";
import * as authService from "@services/authService";
import { UserRepository } from "@repositories/UserRepository";
import { UnauthorizedError } from "@errors/UnauthorizedError";

jest.mock("@repositories/UserRepository");

describe("authController: getToken + mapperService", () => {

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("should return a token mapped in DTO", async () => {
        
        const userDao: UserDAO = FAKE_DATA.FAKE_USERS[0];
        const userDto: UserDTO = {
            username: userDao.username,
            password: userDao.password,
            type: userDao.type
        };

        (UserRepository as jest.Mock).mockImplementation(() => {
            return {
                getUserByUsername: jest.fn().mockResolvedValue(userDao)
            };
        });

        const mockToken = "mocked.token";
        jest.spyOn(authService, "generateToken").mockReturnValue(mockToken);

        const result = await authController.getToken(userDto);

        expect(result).toEqual({ token: mockToken });
    });

    it("should throw UnauthorizedError if password is incorrect", async () => {
        
        const userDao: UserDAO = FAKE_DATA.FAKE_USERS[0];

        const userDto: UserDTO = {
            username: userDao.username,
            password: "wrong_password",
            type: userDao.type
        };

        (UserRepository as jest.Mock).mockImplementation(() => {
            return {
                getUserByUsername: jest.fn().mockResolvedValue(userDao)
            };
        });

        await expect(authController.getToken(userDto))
            .rejects
            .toThrow(UnauthorizedError);
    });

});
