import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import { getRoom } from "@controllers/rooms/index.controller";
import getRoomService from "@services/rooms/getRoom.service";
import { AppError } from "@utils/essential.util";

jest.mock("@services/rooms/getRoom.service");

describe("Get Room Controller (Unit Test)", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn(() => ({ json: jsonMock }));

    req = {
      query: {},
      user: { _id: new Types.ObjectId() } as any,
    };

    res = {
      status: statusMock,
    };

    next = jest.fn();

    jest.clearAllMocks();
  });

  it("should fetch rooms successfully", async () => {
    (getRoomService as jest.Mock).mockResolvedValue({
      room: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      },
      message: "Rooms fetched successfully.",
    });

    await getRoom(req as Request, res as Response, next);

    expect(getRoomService).toHaveBeenCalledWith({
      _id: req.user!._id,
      page: 1,
      limit: 10,
    });

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      room: [],
      pagination: expect.any(Object),
      message: "Rooms fetched successfully.",
    });
  });

  it("should use provided page and limit", async () => {
    req.query = { page: "2", limit: "20" };

    (getRoomService as jest.Mock).mockResolvedValue({
      room: [],
      pagination: { total: 0, page: 2, limit: 20, totalPages: 0 },
      message: "Rooms fetched successfully.",
    });

    await getRoom(req as Request, res as Response, next);

    expect(getRoomService).toHaveBeenCalledWith({
      _id: req.user!._id,
      page: 2,
      limit: 20,
    });
  });

  it("should clamp limit to 50", async () => {
    req.query = { limit: "100" };

    (getRoomService as jest.Mock).mockResolvedValue({
      room: [],
      pagination: { total: 0, page: 1, limit: 50, totalPages: 0 },
      message: "Rooms fetched successfully.",
    });

    await getRoom(req as Request, res as Response, next);

    expect(getRoomService).toHaveBeenCalledWith({
      _id: req.user!._id,
      page: 1,
      limit: 50,
    });
  });

  it("should fallback to default pagination if invalid values", async () => {
    req.query = { page: "abc", limit: "xyz" };

    (getRoomService as jest.Mock).mockResolvedValue({
      room: [],
      pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
      message: "Rooms fetched successfully.",
    });

    await getRoom(req as Request, res as Response, next);

    expect(getRoomService).toHaveBeenCalledWith({
      _id: req.user!._id,
      page: 1,
      limit: 10,
    });
  });

  it("should fallback when page/limit are negative", async () => {
    req.query = { page: "-1", limit: "-5" };

    (getRoomService as jest.Mock).mockResolvedValue({
      room: [],
      pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
      message: "Rooms fetched successfully.",
    });

    await getRoom(req as Request, res as Response, next);

    expect(getRoomService).toHaveBeenCalledWith({
      _id: req.user!._id,
      page: 1,
      limit: 10,
    });
  });

  it("should throw error if user is missing", async () => {
    req.user = undefined as any;

    await getRoom(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    expect(getRoomService).not.toHaveBeenCalled();
  });

  it("should propagate service AppError", async () => {
    (getRoomService as jest.Mock).mockRejectedValue(
      new AppError("Something went wrong", 400),
    );

    await getRoom(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
  });

  it("should handle unexpected errors", async () => {
    (getRoomService as jest.Mock).mockRejectedValue(
      new Error("Unexpected error"),
    );

    await getRoom(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it("should not call res if error occurs", async () => {
    req.user = undefined as any;

    await getRoom(req as Request, res as Response, next);

    expect(statusMock).not.toHaveBeenCalled();
    expect(jsonMock).not.toHaveBeenCalled();
  });

  it("should handle empty query object", async () => {
    req.query = {};

    (getRoomService as jest.Mock).mockResolvedValue({
      room: [],
      pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
      message: "Rooms fetched successfully.",
    });

    await getRoom(req as Request, res as Response, next);

    expect(getRoomService).toHaveBeenCalledWith({
      _id: req.user!._id,
      page: 1,
      limit: 10,
    });
  });
});
