import { authenticateUser } from "@middlewares/authMiddleware";
import { UserType } from "@models/UserType";
import { processToken } from "@services/authService";

jest.mock("@services/authService", () => ({
  processToken: jest.fn()
}));

describe("authenticateUser", () => {
  const next = jest.fn();
  const res = {} as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should call next() when token is valid and role is allowed", async () => {
    const req: any = {
      headers: {
        authorization: "Bearer validtoken"
      }
    };

    (processToken as jest.Mock).mockResolvedValue(undefined);

    const middleware = authenticateUser([UserType.Admin]);
    await middleware(req, res, next);

    expect(processToken).toHaveBeenCalledWith("Bearer validtoken", [UserType.Admin]);
    expect(next).toHaveBeenCalledWith();
  });

  it("should call next(error) when token is invalid", async () => {
    const req: any = {
      headers: {
        authorization: "Bearer invalidtoken"
      }
    };

    const error = new Error("Invalid token");
    (processToken as jest.Mock).mockRejectedValue(error);

    const middleware = authenticateUser([UserType.Admin]);
    await middleware(req, res, next);

    expect(processToken).toHaveBeenCalledWith("Bearer invalidtoken", [UserType.Admin]);
    expect(next).toHaveBeenCalledWith(error);
  });

  it("should call processToken with empty roles array when no roles are passed", async () => {
    const req: any = {
      headers: {
        authorization: "Bearer token"
      }
    };

    (processToken as jest.Mock).mockResolvedValue(undefined);

    const middleware = authenticateUser();
    await middleware(req, res, next);

    expect(processToken).toHaveBeenCalledWith("Bearer token", []);
    expect(next).toHaveBeenCalledWith();
  });

  it("should call next(error) when no authorization header is provided", async () => {
    const req: any = {
      headers: {}
    };

    const error = new Error("Missing authorization header");
    (processToken as jest.Mock).mockRejectedValue(error);

    const middleware = authenticateUser();
    await middleware(req, res, next);

    expect(processToken).toHaveBeenCalledWith(undefined, []);
    expect(next).toHaveBeenCalledWith(error);
  });
});
