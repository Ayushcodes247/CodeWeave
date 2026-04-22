import { create } from "@controllers/rooms/index.controller";
import { AppError } from "@utils/essential.util";
import createService from "@services/rooms/createRoom.service";

jest.mock("@services/rooms/createRoom.service");

describe("Create Room Controller (Unit Test)", () => {
  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    req = {
      body: {},
      user: {
        _id: "123",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();

    jest.clearAllMocks();
  });

  it("should create room successfully", async () => {
    req.body = {
      roomName: "test-room",
      mode: "solo",
    };

    (createService as jest.Mock).mockResolvedValue({
      room: { _id: "room123", roomname: "test-room" },
      inviteCode: "abc123",
    });

    await create(req, res, next);

    expect(createService).toHaveBeenCalledWith({
      roomName: "test-room",
      mode: "solo",
      owner: "123",
    });

    expect(res.status).toHaveBeenCalledWith(201);

    const response = res.json.mock.calls[0][0];

    expect(response).toHaveProperty("success", true);
    expect(response).toHaveProperty("room");
    expect(response).toHaveProperty("inviteCode");
    expect(response).toHaveProperty("message");

    expect(response.room._id).toBe("room123");
    expect(response.inviteCode).toBe("abc123");
  });

  it("should throw error if user is not present", async () => {
    req.user = null;

    await create(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);

    const error = next.mock.calls[0][0];

    expect(error).toBeInstanceOf(AppError);
    expect(error.message).toBe("Unauthorized.");
    expect(error.statusCode).toBe(401);
  });

  it("should throw error if body is empty", async () => {
    req.body = {};

    await create(req, res, next);

    const error = next.mock.calls[0][0];

    expect(error).toBeInstanceOf(AppError);
    expect(error.message).toBe("roomName and mode are required.");
    expect(error.statusCode).toBe(400);
  });

  it("should throw error if roomName is missing", async () => {
    req.body = {
      mode: "solo",
    };

    await create(req, res, next);

    const error = next.mock.calls[0][0];

    expect(error.message).toBe("roomName and mode are required.");
  });

  it("should throw error if mode is missing", async () => {
    req.body = {
      roomName: "test-room",
    };

    await create(req, res, next);

    const error = next.mock.calls[0][0];

    expect(error.message).toBe("roomName and mode are required.");
  });

  it("should pass invalid maxMembers to service (negative case)", async () => {
    req.body = {
      roomName: "test-room",
      mode: "team",
      maxMembers: -5,
    };

    (createService as jest.Mock).mockResolvedValue({
      room: { _id: "room123", roomname: "test-room" },
      inviteCode: "abc123",
    });

    await create(req, res, next);

    expect(createService).toHaveBeenCalledWith({
      roomName: "test-room",
      mode: "team",
      owner: "123",
      maxMembers: -5,
    });
  });

  it("should pass large maxMembers to service", async () => {
    req.body = {
      roomName: "test-room",
      mode: "team",
      maxMembers: 999,
    };

    (createService as jest.Mock).mockResolvedValue({
      room: { _id: "room123", roomname: "test-room" },
      inviteCode: "abc123",
    });

    await create(req, res, next);

    expect(createService).toHaveBeenCalledWith({
      roomName: "test-room",
      mode: "team",
      owner: "123",
      maxMembers: 999,
    });
  });

  it("should pass service error to next()", async () => {
    req.body = {
      roomName: "test-room",
      mode: "solo",
    };

    const serviceError = new AppError("Service failed", 500);

    (createService as jest.Mock).mockRejectedValue(serviceError);

    await create(req, res, next);

    expect(next).toHaveBeenCalledWith(serviceError);
  });

  it("should include maxMembers if provided", async () => {
    req.body = {
      roomName: "test-room",
      mode: "team",
      maxMembers: 5,
    };

    (createService as jest.Mock).mockResolvedValue({
      room: { _id: "room123", roomname: "test-room" },
      inviteCode: "xyz789",
    });

    await create(req, res, next);

    expect(createService).toHaveBeenCalledWith({
      roomName: "test-room",
      mode: "team",
      owner: "123",
      maxMembers: 5,
    });
  });
});
