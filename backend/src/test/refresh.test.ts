import { refresh } from "@controllers/authentication/index.controller";
import { Session } from "@models/session.model";
import { User } from "@models/user.model";
import { AppError } from "@utils/essential.util";

jest.mock("@models/user.model");
jest.mock("@models/session.model");

describe("Refresh Controller (Unit Test)", () => {
  let req: any;
  let res: any;
  let next: any;

  let mockSession: any;
  let mockUser: any;

  beforeEach(() => {
    req = {
      cookies: { auth_token: "refresh_token" },
      session: null,
    };

    res = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();

    mockSession = {
      uid: "123",
      revoked: false,
      refreshToken: "hashed_old",
      validRefreshToken: jest.fn(),
      save: jest.fn(),
    };

    mockUser = {
      _id: "123",
      generateAccessToken: jest.fn().mockReturnValue("new_access"),
      generateRefreshToken: jest.fn().mockReturnValue("new_refresh"),
    };

    jest.clearAllMocks();
  });

  it("should refresh tokens successfully", async () => {
    req.session = mockSession;

    mockSession.validRefreshToken.mockResolvedValue(true);
    (User.findById as jest.Mock).mockResolvedValue(mockUser);
    (Session.hashRefreshToken as jest.Mock).mockResolvedValue("hashed_new");

    await refresh(req, res, next);

    expect(mockSession.validRefreshToken).toHaveBeenCalledWith("refresh_token");

    expect(User.findById).toHaveBeenCalledWith("123");

    expect(mockUser.generateAccessToken).toHaveBeenCalled();
    expect(mockUser.generateRefreshToken).toHaveBeenCalled();

    expect(Session.hashRefreshToken).toHaveBeenCalledWith("new_refresh");
    expect(mockSession.refreshToken).toBe("hashed_new");

    expect(mockSession.save).toHaveBeenCalled();

    expect(res.cookie).toHaveBeenCalledWith(
      "auth_token",
      "new_refresh",
      expect.objectContaining({
        httpOnly: true,
      })
    );

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      accessToken: "new_access",
      message: "Tokens refreshed successfully.",
    });

    expect(next).not.toHaveBeenCalled();
  });

  it("should fail if refresh token is missing", async () => {
    req.cookies = {};

    await refresh(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));

    expect(User.findById).not.toHaveBeenCalled();
  });

  it("should fail if session is missing", async () => {
    req.session = null;

    await refresh(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
  });

  it("should fail if session is revoked", async () => {
    req.session = { ...mockSession, revoked: true };

    await refresh(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
  });

  it("should revoke session if refresh token is invalid", async () => {
    req.session = mockSession;

    mockSession.validRefreshToken.mockResolvedValue(false);

    await refresh(req, res, next);

    expect(mockSession.revoked).toBe(true);
    expect(mockSession.save).toHaveBeenCalled();

    expect(next).toHaveBeenCalledWith(expect.any(AppError));

    expect(User.findById).not.toHaveBeenCalled();
  });

  it("should fail if user not found", async () => {
    req.session = mockSession;

    mockSession.validRefreshToken.mockResolvedValue(true);
    (User.findById as jest.Mock).mockResolvedValue(null);

    await refresh(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));

    expect(mockSession.save).not.toHaveBeenCalled();
  });

  it("should handle user DB error", async () => {
    req.session = mockSession;

    mockSession.validRefreshToken.mockResolvedValue(true);
    (User.findById as jest.Mock).mockRejectedValue(new Error("DB error"));

    await refresh(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("should handle hash refresh token failure", async () => {
    req.session = mockSession;

    mockSession.validRefreshToken.mockResolvedValue(true);
    (User.findById as jest.Mock).mockResolvedValue(mockUser);
    (Session.hashRefreshToken as jest.Mock).mockRejectedValue(
      new Error("Hash error")
    );

    await refresh(req, res, next);

    expect(next).toHaveBeenCalled();

    expect(mockSession.save).not.toHaveBeenCalled();
  });

  it("should rotate refresh token (old token should not be reused)", async () => {
    req.session = mockSession;

    mockSession.validRefreshToken.mockResolvedValue(true);
    (User.findById as jest.Mock).mockResolvedValue(mockUser);
    (Session.hashRefreshToken as jest.Mock).mockResolvedValue("hashed_new");

    await refresh(req, res, next);

    expect(mockSession.refreshToken).not.toBe("hashed_old");
  });
});