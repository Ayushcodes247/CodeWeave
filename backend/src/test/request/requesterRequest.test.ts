import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import { requesterRequest } from "@controllers/request/index.controller";
import getRequesterRequestService from "@services/request/getRequesterRequest.service";
import { AppError } from "@utils/essential.util";

jest.mock("@services/request/getRequesterRequest.service");

describe("Requester Request Controller (Unit Test)", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn(() => ({ json: jsonMock }));

    req = {
      query: {},
    };

    res = {
      status: statusMock,
    };

    next = jest.fn();

    jest.clearAllMocks();
  });

  it("should fetch requester requests successfully", async () => {
    const userId = new Types.ObjectId();

    req.user = { _id: userId } as any;
    req.query = { page: "1", limit: "10" };

    (getRequesterRequestService as jest.Mock).mockResolvedValue({
      requests: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      },
      message: "Requester requests fetched successfully.",
    });

    await requesterRequest(req as Request, res as Response, next);

    expect(getRequesterRequestService).toHaveBeenCalledWith({
      _id: userId,
      page: 1,
      limit: 10,
    });

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      requests: expect.any(Array),
      pagination: expect.any(Object),
      message: "Requester requests fetched successfully.",
    });
  });

  it("should use default pagination when query is missing", async () => {
    const userId = new Types.ObjectId();

    req.user = { _id: userId } as any;

    (getRequesterRequestService as jest.Mock).mockResolvedValue({
      requests: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      },
      message: "ok",
    });

    await requesterRequest(req as Request, res as Response, next);

    expect(getRequesterRequestService).toHaveBeenCalledWith({
      _id: userId,
      page: NaN,
      limit: NaN,
    });
  });

  it("should throw error if user is missing", async () => {
    delete (req as any).user;

    await requesterRequest(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    expect(getRequesterRequestService).not.toHaveBeenCalled();
  });

  it("should handle invalid page and limit (NaN case)", async () => {
    const userId = new Types.ObjectId();

    req.user = { _id: userId } as any;
    req.query = { page: "abc", limit: "xyz" };

    (getRequesterRequestService as jest.Mock).mockResolvedValue({
      requests: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      },
      message: "ok",
    });

    await requesterRequest(req as Request, res as Response, next);

    expect(getRequesterRequestService).toHaveBeenCalledWith({
      _id: userId,
      page: NaN,
      limit: NaN,
    });
  });

  it("should propagate service AppError", async () => {
    const userId = new Types.ObjectId();

    req.user = { _id: userId } as any;

    (getRequesterRequestService as jest.Mock).mockRejectedValue(
      new AppError("Something went wrong", 400),
    );

    await requesterRequest(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
  });

  it("should handle unexpected errors", async () => {
    const userId = new Types.ObjectId();

    req.user = { _id: userId } as any;

    (getRequesterRequestService as jest.Mock).mockRejectedValue(
      new Error("Unexpected error"),
    );

    await requesterRequest(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it("should not call res if error occurs", async () => {
    delete (req as any).user;

    await requesterRequest(req as Request, res as Response, next);

    expect(statusMock).not.toHaveBeenCalled();
    expect(jsonMock).not.toHaveBeenCalled();
  });

  it("should handle edge case: empty query object", async () => {
    const userId = new Types.ObjectId();

    req.user = { _id: userId } as any;
    req.query = {};

    (getRequesterRequestService as jest.Mock).mockResolvedValue({
      requests: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      },
      message: "ok",
    });

    await requesterRequest(req as Request, res as Response, next);

    expect(getRequesterRequestService).toHaveBeenCalledWith({
      _id: userId,
      page: NaN,
      limit: NaN,
    });
  });
});
