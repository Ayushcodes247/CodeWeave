import { profile } from "@controllers/authentication/index.controller";
import { AppError } from "@utils/essential.util";

describe("Profile Controller (Unit Test)", () => {
  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    req = {
      user: null,
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return user profile successfully", async () => {
    req.user = {
      _id: "123",
      email: "ayush@test.com",
    };

    await profile(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      user: req.user,
      message: "Profile fetched successfully.",
    });

    expect(next).not.toHaveBeenCalled();
  });

  it("should still respond even if user is undefined", async () => {
    req.user = undefined;

    await profile(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      user: undefined,
      message: "Profile fetched successfully.",
    });
  });

  it("should handle null user gracefully", async () => {
    req.user = null;

    await profile(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      user: null,
      message: "Profile fetched successfully.",
    });
  });

  it("should handle malformed user object", async () => {
    req.user = "invalid_user";

    await profile(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      user: "invalid_user",
      message: "Profile fetched successfully.",
    });
  });

  it("should not call next or modify response unexpectedly", async () => {
    req.user = { _id: "123" };

    await profile(req, res, next);

    expect(next).not.toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledTimes(1);
  });

  it("should always return consistent response structure", async () => {
    req.user = { _id: "123" };

    await profile(req, res, next);

    const response = res.json.mock.calls[0][0];

    expect(response).toHaveProperty("success");
    expect(response).toHaveProperty("user");
    expect(response).toHaveProperty("message");

    expect(typeof response.success).toBe("boolean");
    expect(typeof response.message).toBe("string");
  });

  it("should not crash if req.user is not present at all", async () => {
    req = {}; 

    await profile(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(next).not.toHaveBeenCalled();
  });
});