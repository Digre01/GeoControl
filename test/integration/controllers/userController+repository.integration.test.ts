import * as userController from "@controllers/userController";
import { UserDAO } from "@dao/UserDAO";
import { User as UserDTO } from "@models/dto/User";
import { ConflictError } from "@models/errors/ConflictError";
import { NotFoundError } from "@models/errors/NotFoundError";
import { createFakeUsers } from "@test/fakeDataDAO/createFakeData";
import { FAKE_DATA } from "@test/fakeDataDAO/fakeDataDAOforUsers";
import { closeTestDataSource, initializeTestDataSource } from "@test/setup/test-datasource";

beforeEach(async () => {
    await initializeTestDataSource();
    await createFakeUsers(FAKE_DATA.FAKE_USERS);
});

afterEach(async () => {
    await closeTestDataSource();
})

describe("UserController integration", () => {

  it("get User: mapperService integration", async () => {
    const fakeUserDAO: UserDAO = FAKE_DATA.FAKE_USERS[0];

    const expectedDTO = {
      username: fakeUserDAO.username,
      type: fakeUserDAO.type
    };

    const result = await userController.getUser("nicolo");

    expect(result).toEqual(expectedDTO);
    expect(result).not.toHaveProperty("password");
  });

  it("NotFoundError exception propagation", async () => {

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

    const result = await userController.getAllUsers();

    expect(result).toEqual(mockUsersDTO);
    expect(result).not.toHaveProperty("password");
  });


});


describe("createUser", () => {

  it("call sequence", async () => {
  
    const mockUserDTO: UserDTO = {
          username: "carmine",
          password: "prova",
          type: "viewer"
    };

    await expect(
        userController.createUser(mockUserDTO)
    ).resolves.not.toThrow();

  });


  it("ConflictError exception propagation", async () => {

      const mockUserDAO: UserDAO = FAKE_DATA.FAKE_USERS[0];

      const mockUserDTO: UserDTO = {
        username: mockUserDAO.username,
        password: mockUserDAO.password,
        type: mockUserDAO.type
      }

      await expect(
          userController.createUser(mockUserDTO)
      ).rejects.toThrow(ConflictError);

  });

});


describe("deleteUser", () => {

  it("call repository with correct arguments", async () => {
  
    const mcokUserDAO: UserDAO = FAKE_DATA.FAKE_USERS[0];

    await expect(
        userController.deleteUser(mcokUserDAO.username)
    ).resolves.not.toThrow();

  });

  it("NotFoundError exception propagation", async () => {

      await expect(
          userController.deleteUser("non-existent username")
      ).rejects.toThrow(NotFoundError);

  });

});