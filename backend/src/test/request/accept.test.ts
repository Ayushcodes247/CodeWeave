import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import { accept } from "@controllers/request/index.controller";
import acceptService from "@services/request/accept.service";
import { AppError } from "@utils/essential.util";
import { Room } from "@models/room.model";

jest.mock("@services/request/accept.service");
jest.mock("@models/room.model");

describe("Accept Request Controller (Unit Test)", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  const mockSelect = (data: any) => ({
    select: jest.fn().mockResolvedValue(data),
  });

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn(() => ({ json: jsonMock }));

    req = { body: {} };

    res = {
      status: statusMock,
    };

    next = jest.fn();

    jest.clearAllMocks();
  });

  it("should accept request successfully", async () => {
    const userId = new Types.ObjectId();
    const roomId = new Types.ObjectId();
    const requesterId = new Types.ObjectId();

    req.user = { _id: userId } as any;
    req.body = {
      roomId: roomId.toString(),
      uid: requesterId.toString(),
    };

    (Room.findById as jest.Mock).mockReturnValue(mockSelect({ owner: userId }));

    (acceptService as jest.Mock).mockResolvedValue({
      reqsReturn: {
        _id: new Types.ObjectId(),
        roomId,
        roomName: "test-room",
        uid: requesterId,
        status: "fulfilled",
      },
      message: "Request accepted successfully.",
    });

    await accept(req as Request, res as Response, next);

    expect(Room.findById).toHaveBeenCalledWith(roomId.toString());

    expect(acceptService).toHaveBeenCalledWith({
      uid: expect.any(Types.ObjectId),
      roomId: expect.any(Types.ObjectId),
    });

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      reqsReturn: expect.any(Object),
      message: "Request accepted successfully.",
    });
  });

  it("should throw error if user is missing", async () => {
    delete (req as any).user;

    await accept(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    expect(acceptService).not.toHaveBeenCalled();
  });

  it("should throw error if roomId or uid missing", async () => {
    const userId = new Types.ObjectId();

    req.user = { _id: userId } as any;
    req.body = {};

    await accept(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    expect(acceptService).not.toHaveBeenCalled();
  });

  it("should throw error if invalid ObjectId", async () => {
    const userId = new Types.ObjectId();

    req.user = { _id: userId } as any;
    req.body = {
      roomId: "invalid",
      uid: "invalid",
    };

    await accept(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    expect(acceptService).not.toHaveBeenCalled();
  });

  it("should throw error if room not found", async () => {
    const userId = new Types.ObjectId();

    req.user = { _id: userId } as any;
    req.body = {
      roomId: new Types.ObjectId().toString(),
      uid: new Types.ObjectId().toString(),
    };

    (Room.findById as jest.Mock).mockReturnValue(mockSelect(null));

    await accept(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    expect(acceptService).not.toHaveBeenCalled();
  });

  it("should throw error if user is not owner", async () => {
    const userId = new Types.ObjectId();
    const otherUser = new Types.ObjectId();

    req.user = { _id: userId } as any;
    req.body = {
      roomId: new Types.ObjectId().toString(),
      uid: new Types.ObjectId().toString(),
    };

    (Room.findById as jest.Mock).mockReturnValue(
      mockSelect({ owner: otherUser }),
    );

    await accept(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    expect(acceptService).not.toHaveBeenCalled();
  });

  it("should propagate service AppError", async () => {
    const userId = new Types.ObjectId();

    req.user = { _id: userId } as any;
    req.body = {
      roomId: new Types.ObjectId().toString(),
      uid: new Types.ObjectId().toString(),
    };

    (Room.findById as jest.Mock).mockReturnValue(mockSelect({ owner: userId }));

    (acceptService as jest.Mock).mockRejectedValue(
      new AppError("Request not found.", 404),
    );

    await accept(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
  });

  it("should handle unexpected errors", async () => {
    const userId = new Types.ObjectId();

    req.user = { _id: userId } as any;
    req.body = {
      roomId: new Types.ObjectId().toString(),
      uid: new Types.ObjectId().toString(),
    };

    (Room.findById as jest.Mock).mockReturnValue(mockSelect({ owner: userId }));

    (acceptService as jest.Mock).mockRejectedValue(
      new Error("Unexpected error"),
    );

    await accept(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it("should not call res if error occurs", async () => {
    delete (req as any).user;

    await accept(req as Request, res as Response, next);

    expect(statusMock).not.toHaveBeenCalled();
    expect(jsonMock).not.toHaveBeenCalled();
  });
});
