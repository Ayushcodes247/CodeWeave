import { login } from "@controllers/authentication/index.controller";
import loginService from "@services/authentication/login.service";
import sessionService from "@services/authentication/session.service";
import { AppError } from "@utils/essential.util";

jest.mock("@services/authentication/login.service");
jest.mock("@services/authentication/session.service");

describe("Login Controller (Unit Test)", () => {
  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    req = {
      body: {},
      ip: "127.0.0.1",
      get: jest.fn().mockReturnValue("jest-agent"),
      headers: {},
    };

    res = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should login user successfully", async () => {
    req.body = {
      email: "ayush@test.com",
      password: "Password@123",
    };

    (loginService as jest.Mock).mockResolvedValue({
      accessToken: "access_token",
      refreshToken: "refresh_token",
      user: {
        _id: "123",
        email: "ayush@test.com",
      },
    });

    (sessionService as jest.Mock).mockResolvedValue({
      message: "session created",
    });

    await login(req, res, next);

    expect(loginService).toHaveBeenCalledWith({
      email: req.body.email,
      password: req.body.password,
    });

    expect(sessionService).toHaveBeenCalledWith(
      expect.objectContaining({
        uid: "123",
        refreshToken: "refresh_token",
        ip: "127.0.0.1",
        agent: "jest-agent",
      }),
    );

    expect(res.cookie).toHaveBeenCalledWith(
      "auth_token",
      "refresh_token",
      expect.objectContaining({
        httpOnly: true,
        sameSite: expect.any(String),
      }),
    );

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        accessToken: "access_token",
        user: expect.any(Object),
        message: expect.stringMatching(/User logged in successfully and.*\./),
      }),
    );

    expect(next).not.toHaveBeenCalled();
  });

  it("should call next with error if email or password missing", async () => {
    req.body = { email: "test@test.com" };

    await login(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));

    expect(loginService).not.toHaveBeenCalled();
    expect(sessionService).not.toHaveBeenCalled();
    expect(res.cookie).not.toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("should fail if email or password is empty string", async () => {
    req.body = { email: "", password: "" };

    await login(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    expect(loginService).not.toHaveBeenCalled();
  });

  it("should pass error from loginService to next", async () => {
    req.body = {
      email: "ayush@test.com",
      password: "wrongpassword",
    };

    (loginService as jest.Mock).mockRejectedValue(
      new AppError("Invalid credentials", 401),
    );

    await login(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    expect(sessionService).not.toHaveBeenCalled();
  });

  it("should pass error from sessionService to next", async () => {
    req.body = {
      email: "ayush@test.com",
      password: "Password@123",
    };

    (loginService as jest.Mock).mockResolvedValue({
      accessToken: "access_token",
      refreshToken: "refresh_token",
      user: {
        _id: "123",
        email: "ayush@test.com",
      },
    });

    (sessionService as jest.Mock).mockRejectedValue(
      new AppError("Session failed", 500),
    );

    await login(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    expect(res.cookie).not.toHaveBeenCalled();
  });

  it("should use headers['user-agent'] if req.get fails", async () => {
    req.body = {
      email: "ayush@test.com",
      password: "Password@123",
    };

    req.get = jest.fn().mockReturnValue(undefined);
    req.headers["user-agent"] = "header-agent";

    (loginService as jest.Mock).mockResolvedValue({
      accessToken: "access_token",
      refreshToken: "refresh_token",
      user: {
        _id: "123",
        email: "ayush@test.com",
      },
    });

    (sessionService as jest.Mock).mockResolvedValue({
      message: "session created",
    });

    await login(req, res, next);

    expect(sessionService).toHaveBeenCalledWith(
      expect.objectContaining({
        agent: "header-agent",
      }),
    );
  });

  it("should fallback to 'unknown' if no user-agent is available", async () => {
    req.body = {
      email: "ayush@test.com",
      password: "Password@123",
    };

    req.get = jest.fn().mockReturnValue(undefined);
    req.headers["user-agent"] = undefined;

    (loginService as jest.Mock).mockResolvedValue({
      accessToken: "access_token",
      refreshToken: "refresh_token",
      user: {
        _id: "123",
        email: "ayush@test.com",
      },
    });

    (sessionService as jest.Mock).mockResolvedValue({
      message: "session created",
    });

    await login(req, res, next);

    expect(sessionService).toHaveBeenCalledWith(
      expect.objectContaining({
        agent: "unknown",
      }),
    );
  });

  it("should fallback to default IP if req.ip is undefined", async () => {
    req.body = {
      email: "ayush@test.com",
      password: "Password@123",
    };

    req.ip = undefined;

    (loginService as jest.Mock).mockResolvedValue({
      accessToken: "access_token",
      refreshToken: "refresh_token",
      user: {
        _id: "123",
        email: "ayush@test.com",
      },
    });

    (sessionService as jest.Mock).mockResolvedValue({
      message: "session created",
    });

    await login(req, res, next);

    expect(sessionService).toHaveBeenCalledWith(
      expect.objectContaining({
        ip: "0.0.0.0",
      }),
    );
  });

  it("should handle malformed loginService response", async () => {
    req.body = {
      email: "ayush@test.com",
      password: "Password@123",
    };

    (loginService as jest.Mock).mockResolvedValue({
      accessToken: "token",
      refreshToken: "token",
      user: null, 
    });

    await login(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
