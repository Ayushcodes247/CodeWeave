import { logout } from "@controllers/authentication/index.controller";
import { Session } from "@models/session.model";
import inValidateToken from "@services/authentication/logout.service";
import { AppError } from "@utils/essential.util";

jest.mock("@services/authentication/logout.service");

describe("Logout Controller (Unit Test)", () => {
  let req: any;
  let res: any;
  let next: any;

  let mockSession: any;

  beforeEach(() => {
    req = {
      cookies: { auth_token: "refresh_token" },
      user: { _id: "123" },
      headers: {
        authorization: "Bearer access_token",
      },
      get: jest.fn().mockReturnValue("jest-agent"),
    };

    mockSession = {
      revoked: false,
      validRefreshToken: jest.fn(),
      save: jest.fn(),
    };

    res = {
      clearCookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();

    jest.clearAllMocks();
  });

  it("should logout successfully", async () => {
    (Session.findOne as jest.Mock) = jest.fn().mockResolvedValue(mockSession);
    mockSession.validRefreshToken.mockResolvedValue(true);

    await logout(req, res, next);

    expect(Session.findOne).toHaveBeenCalledWith({
      uid: "123",
      revoked: false,
      agent: "jest-agent",
    });

    expect(mockSession.validRefreshToken).toHaveBeenCalledWith("refresh_token");

    expect(mockSession.revoked).toBe(true);
    expect(mockSession.save).toHaveBeenCalled();

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
      message: "Logout successfully.",
    });

    expect(next).not.toHaveBeenCalled();
  });

  it("should fail if user is missing", async () => {
    req.user = null;

    await logout(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));

    expect(Session.findOne).not.toHaveBeenCalled();
  });

  it("should fail if refresh token is missing", async () => {
    req.cookies = {};

    await logout(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));

    expect(Session.findOne).not.toHaveBeenCalled();
  });

  it("should fail if session not found", async () => {
    (Session.findOne as jest.Mock) = jest.fn().mockResolvedValue(null);

    await logout(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
  });

  it("should fail if refresh token is invalid", async () => {
    (Session.findOne as jest.Mock) = jest.fn().mockResolvedValue(mockSession);
    mockSession.validRefreshToken.mockResolvedValue(false);

    await logout(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));

    expect(mockSession.save).not.toHaveBeenCalled();
  });

  it("should still logout even if access token is missing", async () => {
    req.headers.authorization = undefined;

    (Session.findOne as jest.Mock) = jest.fn().mockResolvedValue(mockSession);
    mockSession.validRefreshToken.mockResolvedValue(true);

    await logout(req, res, next);

    expect(inValidateToken).toHaveBeenCalledWith({
      token: "null",
    });

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("should handle undefined user-agent", async () => {
    req.get = jest.fn().mockReturnValue(undefined);

    (Session.findOne as jest.Mock) = jest.fn().mockResolvedValue(mockSession);
    mockSession.validRefreshToken.mockResolvedValue(true);

    await logout(req, res, next);

    expect(Session.findOne).toHaveBeenCalledWith({
      uid: "123",
      revoked: false,
      agent: "undefined", 
    });
  });

  it("should handle database error", async () => {
    (Session.findOne as jest.Mock) = jest.fn().mockRejectedValue(
      new Error("DB error")
    );

    await logout(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});