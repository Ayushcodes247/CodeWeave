import request from "supertest";
import app from "../app";
import mongoose from "mongoose";
import { env } from "@configs/env.config";
import { User } from "@models/user.model";
import { Session } from "@models/session.model";

describe("🔐 Full Auth Flow (Integration Test)", () => {
  let agent = request.agent(app);

  const userData = {
    username: "ayush",
    email: "ayush@test.com",
    password: "Password@123",
    gender: "male",
  };

  let accessToken: string;

  beforeAll(async () => {
    await mongoose.connect(env.TEST_DB as string);
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Session.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("should register a user", async () => {
    const res = await agent.post("/api/v1/auth/register").send(userData);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    expect(res.headers["set-cookie"]).toBeDefined();

    const user = await User.findOne({ email: userData.email });
    expect(user).not.toBeNull();
  });

  it("should login user", async () => {
    await agent.post("/api/v1/auth/register").send(userData);

    const res = await agent.post("/api/v1/auth/login").send({
      email: userData.email,
      password: userData.password,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    accessToken = res.body.accessToken;

    expect(accessToken).toBeDefined();

    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("should refresh tokens", async () => {
    await agent
      .post("/api/v1/auth/register")
      .set("User-Agent", "jest-agent")
      .send(userData);

    const loginRes = await agent
      .post("/api/v1/auth/login")
      .set("User-Agent", "jest-agent")
      .send({
        email: userData.email,
        password: userData.password,
      });

    accessToken = loginRes.body.accessToken;

    const refreshRes = await agent
      .get("/api/v1/auth/refresh")
      .set("User-Agent", "jest-agent");

    expect(refreshRes.status).toBe(200);
  });

  it("should logout user", async () => {
    await agent
      .post("/api/v1/auth/register")
      .set("User-Agent", "jest-agent")
      .send(userData);

    const loginRes = await agent
      .post("/api/v1/auth/login")
      .set("User-Agent", "jest-agent")
      .send({
        email: userData.email,
        password: userData.password,
      });

    accessToken = loginRes.body.accessToken;

    const logoutRes = await agent
      .post("/api/v1/auth/logout-one")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("User-Agent", "jest-agent");

    expect(logoutRes.status).toBe(200);
  });

  it("should NOT refresh after logout", async () => {
    await agent.post("/api/v1/auth/register").send(userData);

    const loginRes = await agent.post("/api/v1/auth/login").send({
      email: userData.email,
      password: userData.password,
    });

    accessToken = loginRes.body.accessToken;

    await agent
      .post("/api/v1/auth/logout-all")
      .set("Authorization", `Bearer ${accessToken}`);

    const refreshRes = await agent.get("/api/v1/auth/refresh");

    expect(refreshRes.status).toBeGreaterThanOrEqual(401);
  });
});
