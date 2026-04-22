import request from "supertest";
import express, { Request, Response, NextFunction } from "express";
import { create } from "@controllers/rooms/index.controller";
import createService from "@services/rooms/createRoom.service";
import { AppError } from "@utils/essential.util";

jest.mock("@services/rooms/createRoom.service");

const mockedCreateService = createService as jest.Mock;

const mockAuth = (req: Request, _res: Response, next: NextFunction) => {
  req.user = {
    _id: "507f1f77bcf86cd799439011",
  } as any;
  next();
};

const mockNoAuth = (_req: Request, _res: Response, next: NextFunction) => {
  next();
};

const createTestApp = (useAuth = true) => {
  const app = express();
  app.use(express.json());

  app.post(
    "/api/v1/room/create",
    useAuth ? mockAuth : mockNoAuth,
    create
  );

  app.use(
    (err: any, _req: Request, res: Response, _next: NextFunction) => {
      res.status(err.statusCode || 500).json({
        success: false,
        message: err.message,
      });
    }
  );

  return app;
};

describe("Create Room API (Integration Test)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create room successfully", async () => {
    mockedCreateService.mockResolvedValue({
      room: {
        _id: "room123",
        roomname: "test-room",
      },
      inviteCode: "abc123",
    });

    const app = createTestApp();

    const res = await request(app)
      .post("/api/v1/room/create")
      .send({
        roomName: "test-room",
        mode: "solo",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.room.roomname).toBe("test-room");
    expect(res.body.inviteCode).toBe("abc123");
  });

  it("should return 401 if user is missing", async () => {
    const app = createTestApp(false);

    const res = await request(app)
      .post("/api/v1/room/create")
      .send({
        roomName: "test-room",
        mode: "solo",
      });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/unauthorized/i);
  });

  it("should return 400 if roomName is missing", async () => {
    const app = createTestApp();

    const res = await request(app)
      .post("/api/v1/room/create")
      .send({
        mode: "solo",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/roomName/i);
  });

  it("should return 400 if mode is missing", async () => {
    const app = createTestApp();

    const res = await request(app)
      .post("/api/v1/room/create")
      .send({
        roomName: "test-room",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/mode/i);
  });

  it("should pass maxMembers correctly", async () => {
    mockedCreateService.mockResolvedValue({
      room: {
        _id: "room123",
        roomname: "test-room",
      },
      inviteCode: "abc123",
    });

    const app = createTestApp();

    await request(app)
      .post("/api/v1/room/create")
      .send({
        roomName: "test-room",
        mode: "team",
        maxMembers: 5,
      });

    expect(mockedCreateService).toHaveBeenCalledWith(
      expect.objectContaining({
        maxMembers: 5,
      })
    );
  });

  it("should handle service error", async () => {
    mockedCreateService.mockRejectedValue(
      new AppError("Room already exists", 400)
    );

    const app = createTestApp();

    const res = await request(app)
      .post("/api/v1/room/create")
      .send({
        roomName: "test-room",
        mode: "solo",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Room already exists");
  });

  it("should handle unexpected error", async () => {
    mockedCreateService.mockRejectedValue(new Error("Unexpected error"));

    const app = createTestApp();

    const res = await request(app)
      .post("/api/v1/room/create")
      .send({
        roomName: "test-room",
        mode: "solo",
      });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Unexpected error");
  });
});