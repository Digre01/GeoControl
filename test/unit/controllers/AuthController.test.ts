import * as authController from "@controllers/authController";
import { UserRepository } from "@repositories/UserRepository";
import * as mapperService from "@services/mapperService";
import * as authService from "@services/authService";
import { UnauthorizedError } from "@models/errors/UnauthorizedError";
import { NotFoundError } from "@models/errors/NotFoundError";
import { UserDAO } from "@models/dao/UserDAO";
import { User as UserDTO } from "@models/dto/User";

jest.mock("@repositories/UserRepository");
jest.mock("@services/mapperService");
jest.mock("@services/authService");

beforeEach(() => {
  jest.resetAllMocks();
});

describe("authController: getToken", () => {
  const mockUserDAO: UserDAO = {
    username: "admin",
    password: "password123",
    type: "admin"
  };

  const mockUserDTO: UserDTO = {
    username: "admin",
    password: "password123",
    type: "admin"
  };

  it("should return token DTO if credentials are correct", async () => {

    (UserRepository as jest.Mock).mockImplementation(() => ({
      getUserByUsername: jest.fn().mockResolvedValue(mockUserDAO)
    }));

    (mapperService.createUserDTO as jest.Mock).mockReturnValue(mockUserDTO);
    (authService.generateToken as jest.Mock).mockReturnValue("mock.token");
    (mapperService.createTokenDTO as jest.Mock).mockReturnValue({ token: "mock.token" });

    const input: UserDTO = {
      username: "admin",
      password: "password123",
      type: "admin"
    };

    const result = await authController.getToken(input);

    expect(result).toEqual({ token: "mock.token" });

    expect(UserRepository).toHaveBeenCalledTimes(1);
    expect(mapperService.createUserDTO).toHaveBeenCalledWith("admin", "admin", "password123");
    expect(authService.generateToken).toHaveBeenCalledWith(mockUserDTO);
    expect(mapperService.createTokenDTO).toHaveBeenCalledWith("mock.token");
  });

  it("should throw UnauthorizedError if password does not match", async () => {
    const wrongPasswordDTO: UserDTO = {
      username: "admin",
      password: "wrongPassword",
      type: "admin"
    };

    (UserRepository as jest.Mock).mockImplementation(() => ({
      getUserByUsername: jest.fn().mockResolvedValue(mockUserDAO)
    }));

    await expect(authController.getToken(wrongPasswordDTO)).rejects.toThrow(UnauthorizedError);
  });

  it("should throw NotFoundError if user does not exist", async () => {
    (UserRepository as jest.Mock).mockImplementation(() => ({
      getUserByUsername: jest.fn().mockImplementation(() => {
        throw new NotFoundError("User not found");
      })
    }));

    const input: UserDTO = {
      username: "non_existent",
      password: "psw",
      type: "admin"
    };

    await expect(authController.getToken(input)).rejects.toThrow(NotFoundError);
  });
});
