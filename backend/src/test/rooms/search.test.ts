import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import { search } from "@controllers/rooms/index.controller";
import searchService from "@services/rooms/search.service";
import { AppError } from "@utils/essential.util";

jest.mock("@services/rooms/search.service");

describe("Search Room Controller (Unit Test)", () => {
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
    };

    res = {
      status: statusMock,
    };

    next = jest.fn();

    jest.clearAllMocks();
  });

  it("should search room successfully", async () => {
    const roomId = new Types.ObjectId().toString();

    req.body = { roomId };

    (searchService as jest.Mock).mockResolvedValue({
      room: {
        _id: roomId,
        roomName: "test-room",
        ownerName: "Ayush",
        ownerId: new Types.ObjectId(),
        mode: "solo",
        lastActivatedAt: new Date(),
        createdAt: new Date(),
      },
      message: "room searched successfully.",
    });

    await search(req as Request, res as Response, next as NextFunction);

    expect(searchService).toHaveBeenCalledWith(roomId);
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      room: expect.any(Object),
      message: "room searched successfully.",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should throw error if roomId is missing", async () => {
    req.body = {};

    await search(req as Request, res as Response, next as NextFunction);

    expect(next).toHaveBeenCalledWith(
      new AppError("Invalid room id.", 400),
    );
    expect(searchService).not.toHaveBeenCalled();
  });

  it("should throw error if roomId is invalid", async () => {
    req.body = { roomId: "invalid-id" };

    await search(req as Request, res as Response, next as NextFunction);

    expect(next).toHaveBeenCalledWith(new AppError("Invalid room id.", 400));
    expect(searchService).not.toHaveBeenCalled();
  });

  it("should propagate service error", async () => {
    const roomId = new Types.ObjectId().toString();

    req.body = { roomId };

    (searchService as jest.Mock).mockRejectedValue(
      new AppError("room not found.", 404),
    );

    await search(req as Request, res as Response, next as NextFunction);

    expect(searchService).toHaveBeenCalledWith(roomId);
    expect(next).toHaveBeenCalledWith(new AppError("room not found.", 404));
  });

  it("should handle unexpected errors", async () => {
    const roomId = new Types.ObjectId().toString();

    req.body = { roomId };

    (searchService as jest.Mock).mockRejectedValue(
      new Error("Unexpected error"),
    );

    await search(req as Request, res as Response, next as NextFunction);

    expect(searchService).toHaveBeenCalledWith(roomId);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it("should not call res if error is thrown before service", async () => {
    req.body = {};

    await search(req as Request, res as Response, next as NextFunction);

    expect(statusMock).not.toHaveBeenCalled();
    expect(jsonMock).not.toHaveBeenCalled();
  });

  it("should handle edge case: empty string roomId", async () => {
    req.body = { roomId: "" };

    await search(req as Request, res as Response, next as NextFunction);

    expect(next).toHaveBeenCalledWith(new AppError("Invalid room id.", 400));
    expect(searchService).not.toHaveBeenCalled();
  });
});
