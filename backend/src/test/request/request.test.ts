import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import { requests } from "@controllers/request/index.controller";
import requestService from "@services/request/request.service";
import { AppError } from "@utils/essential.util";

jest.mock("@services/request/request.service");

describe("Request Controller (Unit Test)", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn(() => ({ json: jsonMock }));

    req = {
      body: {},
    } as Partial<Request>;

    res = {
      status: statusMock,
    };

    next = jest.fn();

    jest.clearAllMocks();
  });

  it("should create request successfully", async () => {
    const userId = new Types.ObjectId();
    const roomId = new Types.ObjectId().toString();

    (req as any).user = { _id: userId };

    req.body = {
      roomId,
      inviteCode: "abcdef123456",
    };

    (requestService as jest.Mock).mockResolvedValue({
      requestData: {
        _id: new Types.ObjectId(),
        roomId,
        roomName: "test-room",
        status: "pending",
      },
      message: "Request created successfully.",
    });

    await requests(req as Request, res as Response, next);

    expect(requestService).toHaveBeenCalledWith({
      uid: userId.toString(),
      roomId,
      inviteCode: "abcdef123456",
    });

    expect(statusMock).toHaveBeenCalledWith(201);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      requestData: expect.any(Object),
      message: "Request created successfully.",
    });
  });

  it("should throw error if user is missing", async () => {
    // user not set at all

    await requests(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    expect(requestService).not.toHaveBeenCalled();
  });

  it("should pass undefined fields to service (validation handled there)", async () => {
    const userId = new Types.ObjectId();

    (req as any).user = { _id: userId };
    req.body = {};

    (requestService as jest.Mock).mockRejectedValue(
      new AppError("Please provide valid room data.", 400),
    );

    await requests(req as Request, res as Response, next);

    expect(requestService).toHaveBeenCalledWith({
      uid: userId.toString(),
      roomId: undefined,
      inviteCode: undefined,
    });

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
  });

  it("should propagate service AppError", async () => {
    const userId = new Types.ObjectId();
    const roomId = new Types.ObjectId().toString();

    (req as any).user = { _id: userId };

    req.body = {
      roomId,
      inviteCode: "abcdef123456",
    };

    (requestService as jest.Mock).mockRejectedValue(
      new AppError("invalid inviteCode", 401),
    );

    await requests(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
  });

  it("should handle unexpected errors", async () => {
    const userId = new Types.ObjectId();
    const roomId = new Types.ObjectId().toString();

    (req as any).user = { _id: userId };

    req.body = {
      roomId,
      inviteCode: "abcdef123456",
    };

    (requestService as jest.Mock).mockRejectedValue(
      new Error("Unexpected error"),
    );

    await requests(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it("should not call res if error occurs", async () => {
    await requests(req as Request, res as Response, next);

    expect(statusMock).not.toHaveBeenCalled();
    expect(jsonMock).not.toHaveBeenCalled();
  });

  it("should handle edge case: empty inviteCode", async () => {
    const userId = new Types.ObjectId();
    const roomId = new Types.ObjectId().toString();

    (req as any).user = { _id: userId };

    req.body = {
      roomId,
      inviteCode: "",
    };

    (requestService as jest.Mock).mockRejectedValue(
      new AppError("invalid inviteCode", 401),
    );

    await requests(req as Request, res as Response, next);

    expect(requestService).toHaveBeenCalledWith({
      uid: userId.toString(),
      roomId,
      inviteCode: "",
    });

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
  });
});
