import { Types } from "mongoose";
import getRequest from "@services/request/all.service";
import { RequestModel } from "@models/request.model";
import { AppError } from "@utils/essential.util";

jest.mock("@models/request.model");

describe("Get Requests Service (Unit Test)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch requests with pagination successfully", async () => {
    const userId = new Types.ObjectId();

    const mockRequests = [
      {
        _id: new Types.ObjectId(),
        roomId: new Types.ObjectId(),
        requesterId: new Types.ObjectId(),
        status: "pending",
        roomName: "room-1",
      },
    ];

    (RequestModel.aggregate as jest.Mock)
      .mockResolvedValueOnce(mockRequests) // first call (data)
      .mockResolvedValueOnce([{ total: 1 }]); // second call (count)

    const result = await getRequest({
      _id: userId,
      page: 1,
      limit: 10,
    });

    expect(RequestModel.aggregate).toHaveBeenCalledTimes(2);

    expect(result.requests).toEqual(mockRequests);
    expect(result.pagination).toEqual({
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    });
    expect(result.message).toBe("Requests fetched successfully.");
  });

  it("should use default pagination values", async () => {
    const userId = new Types.ObjectId();

    (RequestModel.aggregate as jest.Mock)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ total: 0 }]);

    const result = await getRequest({ _id: userId });

    expect(result.pagination.page).toBe(1);
    expect(result.pagination.limit).toBe(10);
  });

  it("should clamp limit to max (50)", async () => {
    const userId = new Types.ObjectId();

    (RequestModel.aggregate as jest.Mock)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ total: 0 }]);

    const result = await getRequest({
      _id: userId,
      limit: 100,
    });

    expect(result.pagination.limit).toBe(50);
  });

  it("should handle empty results", async () => {
    const userId = new Types.ObjectId();

    (RequestModel.aggregate as jest.Mock)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    const result = await getRequest({ _id: userId });

    expect(result.requests).toEqual([]);
    expect(result.pagination.total).toBe(0);
    expect(result.pagination.totalPages).toBe(0);
  });

  it("should throw error if data is missing", async () => {
    await expect(getRequest({} as any)).rejects.toThrow(
      new AppError("Please provide valid user data.", 400),
    );
  });

  it("should throw error if _id is missing", async () => {
    await expect(getRequest({ _id: undefined } as any)).rejects.toThrow(
      new AppError("Please provide valid user data.", 400),
    );
  });

  it("should handle unexpected aggregation error", async () => {
    const userId = new Types.ObjectId();

    (RequestModel.aggregate as jest.Mock).mockRejectedValue(
      new Error("DB error"),
    );

    await expect(getRequest({ _id: userId })).rejects.toThrow("DB error");
  });

  it("should calculate correct totalPages", async () => {
    const userId = new Types.ObjectId();

    (RequestModel.aggregate as jest.Mock)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ total: 25 }]);

    const result = await getRequest({
      _id: userId,
      limit: 10,
    });

    expect(result.pagination.totalPages).toBe(3);
  });

  it("should ensure skip calculation is correct", async () => {
    const userId = new Types.ObjectId();

    (RequestModel.aggregate as jest.Mock)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ total: 0 }]);

    await getRequest({
      _id: userId,
      page: 3,
      limit: 10,
    });

    const pipeline = (RequestModel.aggregate as jest.Mock).mock.calls[0][0];

    const skipStage = pipeline.find((stage: any) => stage.$skip !== undefined);

    expect(skipStage.$skip).toBe(20); // (3-1)*10
  });
});
