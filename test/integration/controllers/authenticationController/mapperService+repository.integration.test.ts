import { User as UserDTO } from "@models/dto/User";
import { UserDAO } from "@models/dao/UserDAO";
import { FAKE_DATA } from "@test/fakeDataDAO/fakeDataDAOforUsers";
import * as authController from "@controllers/authController";
import { UnauthorizedError } from "@errors/UnauthorizedError";
import { NotFoundError } from "@errors/NotFoundError";
import { initializeTestDataSource, closeTestDataSource } from "@test/setup/test-datasource";
import { createFakeUsers } from "@test/fakeDataDAO/createFakeData";
import * as authService from "@services/authService";

jest.spyOn(authService, "generateToken").mockReturnValue("mocked.token");

beforeEach(async () => {
  await initializeTestDataSource();
  await createFakeUsers(FAKE_DATA.FAKE_USERS);
});

afterEach(async () => {
  await closeTestDataSource();
});


describe("authController: getToken + mapperService + repository", () => {

  it("should return a token mapped in DTO", async () => {
    const userDAO: UserDAO = FAKE_DATA.FAKE_USERS[0];

    const userDTO: UserDTO = {
      username: userDAO.username,
      password: userDAO.password,
      type: userDAO.type,
    };

    const result = await authController.getToken(userDTO);

    expect(result).toEqual({ token: "mocked.token" });
  });

  it("should throw UnauthorizedError on wrong password", async () => {
    const userDAO: UserDAO = FAKE_DATA.FAKE_USERS[0];

    const userDTO: UserDTO = {
      username: userDAO.username,
      password: "wrong_password",
      type: userDAO.type,
    };

    await expect(authController.getToken(userDTO)).rejects.toThrow(UnauthorizedError);
  });

  it("should throw NotFoundError if user does not exist", async () => {
    const userDTO: UserDTO = {
      username: "non.existent.user",
      password: "irrelevant",
      type: "admin",
    };

    await expect(authController.getToken(userDTO)).rejects.toThrow(NotFoundError);
  });

});
