import { logoutAll } from "@controllers/authentication/index.controller";
import { Session } from "@models/session.model";
import inValidateToken from "@services/authentication/logout.service";
import { AppError } from "@utils/essential.util";

jest.mock("@services/authentication/logout.service");

describe("LogoutAll Controller (Unit Test)", () => {
  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    req = {
      user: { _id: "123" },
      headers: {
        authorization: "Bearer access_token",
      },
    };

    res = {
      clearCookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();

    jest.clearAllMocks();
  });

  it("should logout user from all devices successfully", async () => {
    (Session.updateMany as jest.Mock) = jest.fn().mockResolvedValue({
      matchedCount: 2,
      modifiedCount: 2,
    });

    await logoutAll(req, res, next);

    expect(Session.updateMany).toHaveBeenCalledWith(
      { uid: "123", revoked: false },
      { $set: { revoked: true } }
    );

    expect(res.clearCookie).toHaveBeenCalledWith(
      "auth_token",
      expect.objectContaining({
        httpOnly: true,
      })
    );

    expect(inValidateToken).toHaveBeenCalledWith({
      token: "access_token",
    });

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Logged out from all devices.",
    });

    expect(next).not.toHaveBeenCalled();
  });

  it("should fail if user is missing", async () => {
    req.user = null;

    await logoutAll(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));

    expect(Session.updateMany).not.toHaveBeenCalled();
  });

  it("should fail if no active sessions found", async () => {
    (Session.updateMany as jest.Mock) = jest.fn().mockResolvedValue({
      matchedCount: 0,
      modifiedCount: 0,
    });

    await logoutAll(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));

    expect(res.clearCookie).not.toHaveBeenCalled();
  });

  it("should logout even if access token is missing", async () => {
    req.headers.authorization = undefined;

    (Session.updateMany as jest.Mock) = jest.fn().mockResolvedValue({
      matchedCount: 1,
      modifiedCount: 1,
    });

    await logoutAll(req, res, next);

    expect(inValidateToken).not.toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("should ignore malformed authorization header", async () => {
    req.headers.authorization = "InvalidTokenFormat";

    (Session.updateMany as jest.Mock) = jest.fn().mockResolvedValue({
      matchedCount: 1,
      modifiedCount: 1,
    });

    await logoutAll(req, res, next);

    expect(inValidateToken).not.toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("should handle database error", async () => {
    (Session.updateMany as jest.Mock) = jest.fn().mockRejectedValue(
      new Error("DB error")
    );

    await logoutAll(req, res, next);

    expect(next).toHaveBeenCalled();

    expect(res.clearCookie).not.toHaveBeenCalled();
  });

  it("should only revoke sessions for current user", async () => {
    (Session.updateMany as jest.Mock) = jest.fn().mockResolvedValue({
      matchedCount: 3,
      modifiedCount: 3,
    });

    await logoutAll(req, res, next);

    expect(Session.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        uid: "123",
      }),
      expect.any(Object)
    );
  });

  it("should be idempotent when called multiple times", async () => {
    (Session.updateMany as jest.Mock) = jest.fn().mockResolvedValue({
      matchedCount: 0,
      modifiedCount: 0,
    });

    await logoutAll(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
  });
});