import { errorHandler } from "@middlewares/errorMiddleware";
import { ErrorDTO } from "@dto/ErrorDTO";
import { createAppError } from "@services/errorService";

jest.mock("@services/errorService", () => ({
  createAppError: jest.fn()
}));

describe("errorMiddleware", () => {
  const mockReq = {} as any;
  const mockNext = jest.fn();

  let mockRes: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  it("should convert the error and send response with proper status and body", () => {
    const fakeError = new Error("Something went wrong");

    const mockErrorDTO: ErrorDTO = {
      code: 400,
      name: "BadRequest",
      message: "Invalid input"
    };

    (createAppError as jest.Mock).mockReturnValue(mockErrorDTO);

    errorHandler(fakeError, mockReq, mockRes, mockNext);

    expect(createAppError).toHaveBeenCalledWith(fakeError);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      code: 400,
      name: "BadRequest",
      message: "Invalid input"
    });
  });
});
