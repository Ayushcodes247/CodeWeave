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
      user: { _id: "123", email: "ayush@test.com" },
    });

    (sessionService as jest.Mock).mockResolvedValue({
      message: "session created",
    });

    await login(req, res, next);

    expect(loginService).toHaveBeenCalledWith(req.body);

    const cookieArgs = res.cookie.mock.calls[0];
    expect(cookieArgs[0]).toBe("auth_token");
    expect(cookieArgs[2]).toMatchObject({ httpOnly: true });

    const response = res.json.mock.calls[0][0];
    expect(response.success).toBe(true);
    expect(response.accessToken).toBe("access_token");
    expect(response.message).toContain("session created");

    expect(next).not.toHaveBeenCalled();
  });

  it("should fail if fields are missing", async () => {
    req.body = { email: "test@test.com" };

    await login(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    expect(loginService).not.toHaveBeenCalled();
  });

  it("should fail if email/password are empty strings", async () => {
    req.body = { email: "", password: "" };

    await login(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
  });

  it("should handle loginService failure", async () => {
    req.body = {
      email: "ayush@test.com",
      password: "wrong",
    };

    (loginService as jest.Mock).mockRejectedValue(
      new AppError("Invalid credentials", 401)
    );

    await login(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    expect(sessionService).not.toHaveBeenCalled();
  });

  it("should handle sessionService failure", async () => {
    req.body = {
      email: "ayush@test.com",
      password: "Password@123",
    };

    (loginService as jest.Mock).mockResolvedValue({
      accessToken: "access_token",
      refreshToken: "refresh_token",
      user: { _id: "123", email: "ayush@test.com" },
    });

    (sessionService as jest.Mock).mockRejectedValue(
      new AppError("Session failed", 500)
    );

    await login(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    expect(res.cookie).not.toHaveBeenCalled();
  });

  it("should fallback to headers user-agent", async () => {
    req.body = {
      email: "ayush@test.com",
      password: "Password@123",
    };

    req.get = jest.fn().mockReturnValue(undefined);
    req.headers["user-agent"] = "header-agent";

    (loginService as jest.Mock).mockResolvedValue({
      accessToken: "access_token",
      refreshToken: "refresh_token",
      user: { _id: "123", email: "ayush@test.com" },
    });

    (sessionService as jest.Mock).mockResolvedValue({
      message: "session created",
    });

    await login(req, res, next);

    expect(sessionService).toHaveBeenCalledWith(
      expect.objectContaining({ agent: "header-agent" })
    );
  });

  it("should handle malformed loginService response", async () => {
    req.body = {
      email: "ayush@test.com",
      password: "Password@123",
    };

    (loginService as jest.Mock).mockResolvedValue({
      accessToken: "access_token",
      refreshToken: "refresh_token",
      user: null, 
    });

    await login(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});