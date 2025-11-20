import jwt from "jsonwebtoken";
import * as auth from "@services/authService";
import { UserType } from "@models/UserType";
import { UnauthorizedError } from "@models/errors/UnauthorizedError";
import { InsufficientRightsError } from "@models/errors/InsufficientRightsError";
import { UserRepository } from "@repositories/UserRepository";
import { SECRET_KEY, TOKEN_LIFESPAN } from "@config";
import AppError from "@models/errors/AppError";



jest.mock("@repositories/UserRepository");

const mockUser = {
  username: "testuser",
  password: "testpass",
  type: UserType.Admin,
};

describe("generateToken", () => {
  it("should return a valid JWT", () => {
    const token = auth.generateToken(mockUser);
    const decoded = jwt.verify(token, SECRET_KEY);
    expect(decoded).toMatchObject(mockUser);
  });
});

describe("processToken", () => {
  const token = jwt.sign(mockUser, SECRET_KEY, { expiresIn: "1h" });
  const authHeader = `Bearer ${token}`;

  beforeEach(() => {
    (UserRepository as jest.Mock).mockClear();
    (UserRepository as any).mockImplementation(() => ({
      getUserByUsername: jest.fn().mockResolvedValue(mockUser),
    }));
  });

  it("should process token and allow user with valid role", async () => {
    await expect(auth.processToken(authHeader, [UserType.Admin])).resolves.toBeUndefined();
  });

  it("should throw InsufficientRightsError for disallowed role", async () => {
    const userWithWrongRole = { ...mockUser, type: UserType.Viewer };
    (UserRepository as any).mockImplementation(() => ({
      getUserByUsername: jest.fn().mockResolvedValue(userWithWrongRole),
    }));

    await expect(auth.processToken(authHeader, [UserType.Admin])).rejects.toThrow(
      InsufficientRightsError
    );
  });

  it("should throw UnauthorizedError for invalid token format", async () => {
    await expect(auth.processToken("InvalidToken")).rejects.toThrow(UnauthorizedError);
  });

  it("should throw UnauthorizedError if no token provided", async () => {
    await expect(auth.processToken(undefined)).rejects.toThrow(UnauthorizedError);
  });

  it("should throw UnauthorizedError if user not found", async () => {
    (UserRepository as any).mockImplementation(() => ({
      getUserByUsername: jest.fn().mockRejectedValue(new Error("User not found")),
    }));

    await expect(auth.processToken(authHeader)).rejects.toThrow(UnauthorizedError);
  });

  it("should wrap non-AppError from verifyToken as UnauthorizedError", async () => {
    const error = new Error("invalid token");

    jest.spyOn(jwt, "verify").mockImplementation(() => {
        throw error;
    });

    const token = "Bearer anytoken";

    await expect(auth.processToken(token)).rejects.toThrow(UnauthorizedError);
    await expect(auth.processToken(token)).rejects.toThrow("Unauthorized: invalid token");
});
});
