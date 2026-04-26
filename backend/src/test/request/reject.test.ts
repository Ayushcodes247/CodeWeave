import { Request, Response } from "express";
import { Types } from "mongoose";
import { reject } from "@controllers/request/index.controller";
import rejectService from "@services/request/reject.service";
import { AppError } from "@utils/essential.util";
import { Room } from "@models/room.model";

jest.mock("@services/request/reject.service");
jest.mock("@models/room.model");

describe("Reject Request Controller (Unit Test)", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  const mockSelect = (data: any) => ({
    select: jest.fn().mockResolvedValue(data),
  });

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn(() => ({ json: jsonMock }));

    req = { body: {} };
    res = { status: statusMock };

    next = jest.fn();

    jest.clearAllMocks();
  });

  it("should reject request successfully", async () => {
    const userId = new Types.ObjectId();
    const roomId = new Types.ObjectId();
    const requesterId = new Types.ObjectId();

    req.user = { _id: userId } as any;
    req.body = {
      roomId: roomId.toString(),
      uid: requesterId.toString(),
    };

    (Room.findById as jest.Mock).mockReturnValue(mockSelect({ owner: userId }));

    (rejectService as jest.Mock).mockResolvedValue({
      reqsReturn: {
        _id: new Types.ObjectId(),
        roomId,
        roomName: "test-room",
        uid: requesterId,
        status: "rejected",
      },
      message: "Request rejected successfully.",
    });

    await reject(req as Request, res as Response, next);

    expect(Room.findById).toHaveBeenCalledWith(roomId.toString());

    expect(rejectService).toHaveBeenCalledWith({
      roomId: expect.any(Types.ObjectId),
      uid: expect.any(Types.ObjectId),
    });

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      reqsReturn: expect.any(Object),
      message: "Request rejected successfully.",
    });
  });

  it("should throw error if user is missing", async () => {
    delete (req as any).user;

    await reject(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    expect(rejectService).not.toHaveBeenCalled();
  });

  it("should throw error if roomId or uid missing", async () => {
    const userId = new Types.ObjectId();

    req.user = { _id: userId } as any;
    req.body = {};

    await reject(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    expect(rejectService).not.toHaveBeenCalled();
  });

  it("should throw error if invalid ObjectId", async () => {
    const userId = new Types.ObjectId();

    req.user = { _id: userId } as any;
    req.body = {
      roomId: "invalid",
      uid: "invalid",
    };

    await reject(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    expect(rejectService).not.toHaveBeenCalled();
  });

  it("should throw error if room not found", async () => {
    const userId = new Types.ObjectId();

    req.user = { _id: userId } as any;
    req.body = {
      roomId: new Types.ObjectId().toString(),
      uid: new Types.ObjectId().toString(),
    };

    (Room.findById as jest.Mock).mockReturnValue(mockSelect(null));

    await reject(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    expect(rejectService).not.toHaveBeenCalled();
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

    await reject(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    expect(rejectService).not.toHaveBeenCalled();
  });

  it("should propagate service AppError", async () => {
    const userId = new Types.ObjectId();

    req.user = { _id: userId } as any;
    req.body = {
      roomId: new Types.ObjectId().toString(),
      uid: new Types.ObjectId().toString(),
    };

    (Room.findById as jest.Mock).mockReturnValue(mockSelect({ owner: userId }));

    (rejectService as jest.Mock).mockRejectedValue(
      new AppError("Request not found.", 404),
    );

    await reject(req as Request, res as Response, next);

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

    (rejectService as jest.Mock).mockRejectedValue(
      new Error("Unexpected error"),
    );

    await reject(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it("should not call res if error occurs", async () => {
    delete (req as any).user;

    await reject(req as Request, res as Response, next);

    expect(statusMock).not.toHaveBeenCalled();
    expect(jsonMock).not.toHaveBeenCalled();
  });
});
