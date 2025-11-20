import * as userController from "@controllers/userController";
import { UserDAO } from "@dao/UserDAO";
import { User as UserDTO } from "@models/dto/User";
import { ConflictError } from "@models/errors/ConflictError";
import { NotFoundError } from "@models/errors/NotFoundError";
import { UserType } from "@models/UserType";
import { UserRepository } from "@repositories/UserRepository";
import { FAKE_DATA } from "@test/fakeDataDAO/fakeDataDAOforUsers";

jest.mock("@repositories/UserRepository");

describe("UserController integration", () => {

  it("get User: mapperService integration", async () => {
    const fakeUserDAO: UserDAO = {
      username: "testuser",
      password: "secret",
      type: UserType.Operator
    };

    const expectedDTO = {
      username: fakeUserDAO.username,
      type: fakeUserDAO.type
    };

    (UserRepository as jest.Mock).mockImplementation(() => ({
      getUserByUsername: jest.fn().mockResolvedValue(fakeUserDAO)
    }));

    const result = await userController.getUser("testuser");

    expect(result).toEqual({
      username: expectedDTO.username,
      type: expectedDTO.type
    });
    expect(result).not.toHaveProperty("password");
  });

  it("NotFoundError exception propagation", async () => {
  
      const mockCreate = jest.fn().mockImplementation(() => {
          throw new NotFoundError("messaggio");
      });

      (UserRepository as jest.Mock).mockImplementation(() => ({
          getUserByUsername: mockCreate
      }));

      await expect(
          userController.getUser("non-existent username")
      ).rejects.toThrow(NotFoundError);

  });

});


describe("getAllUser: mapperService integration", () => {

  it("should return users mapped in DTO", async () => {
    const mockUsersDAO: UserDAO[] = [
      FAKE_DATA.FAKE_USERS[0],
      FAKE_DATA.FAKE_USERS[1],
      FAKE_DATA.FAKE_USERS[2],
      FAKE_DATA.FAKE_USERS[3]
    ];

    const mockUsersDTO: UserDTO[] = mockUsersDAO.map(user => {

      const dto: UserDTO = { 
        username: user.username,
        type: user.type
      };

      return dto;

    });

    (UserRepository as jest.Mock).mockImplementation(() => ({
      getAllUsers: jest.fn().mockResolvedValue(mockUsersDAO)
    }));

    const result = await userController.getAllUsers();

    expect(result).toEqual(mockUsersDTO);
    expect(result).not.toHaveProperty("password");
  });


  it("no users available", async () => {
    const mockUsersDAO: UserDAO[] = [];

    const mockUsersDTO: UserDTO[] = [];

    (UserRepository as jest.Mock).mockImplementation(() => ({
      getAllUsers: jest.fn().mockResolvedValue(mockUsersDAO)
    }));

    const result = await userController.getAllUsers();

    expect(result).toEqual(mockUsersDTO);

  });

});


describe("createUser", () => {

  it("call sequence", async () => {
  
      const mockUserDTO: UserDTO = {
          username: "carmine",
          password: "prova",
          type: "viewer"
      };

      const mockCreate = jest.fn();

      (UserRepository as jest.Mock).mockImplementation(() => ({
          createUser: mockCreate
      }));

      await userController.createUser(mockUserDTO);

      expect(mockCreate).toHaveBeenCalledTimes(1);
      expect(mockCreate).toHaveBeenCalledWith(mockUserDTO.username, mockUserDTO.password, mockUserDTO.type);

  });


  it("ConflictError exception propagation", async () => {

      const mockCreate = jest.fn().mockImplementation(() => {
          throw new ConflictError("messaggio");
      });

      (UserRepository as jest.Mock).mockImplementation(() => ({
          createUser: mockCreate
      }));

      const mockUserDTO: UserDTO = {
          username: "carmine",
          password: "prova",
          type: "viewer"
      };

      await expect(
          userController.createUser(mockUserDTO)
      ).rejects.toThrow(ConflictError);

  });

});


describe("deleteUser", () => {

  it("call repository with correct arguments", async () => {
  
      const mcokUserDAO: UserDAO = FAKE_DATA.FAKE_USERS[0];

      const mockDelete = jest.fn();

      (UserRepository as jest.Mock).mockImplementation(() => ({
          deleteUser: mockDelete
      }));

      await userController.deleteUser(mcokUserDAO.username);

      expect(mockDelete).toHaveBeenCalledTimes(1);
      expect(mockDelete).toHaveBeenCalledWith(mcokUserDAO.username);

  });

  it("NotFoundError exception propagation", async () => {

      const mockDelete = jest.fn().mockImplementation(() => {
          throw new NotFoundError("messaggio");
      });

      (UserRepository as jest.Mock).mockImplementation(() => ({
          deleteUser: mockDelete
      }));


      await expect(
          userController.deleteUser("non-existent username")
      ).rejects.toThrow(NotFoundError);

  });

});