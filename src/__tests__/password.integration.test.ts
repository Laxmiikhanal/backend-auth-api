import request from "supertest";
import app from "../app";
import { UserModel } from "../models/user.model";
import crypto from "crypto";

jest.mock("../config/email", () => ({
  sendEmail: jest.fn().mockResolvedValue(true),
}));

describe("Password Reset Integration Test (10)", () => {
  const email = `reset${Date.now()}@mail.com`;
  const pass = "Test12345";

  beforeAll(async () => {
    await request(app).post("/api/auth/register").send({
      firstName: "Reset",
      lastName: "User",
      email,
      password: pass,
    });
  });

  it("1. Forgot password fails if email missing", async () => {
    const res = await request(app).post("/api/auth/forgot-password").send({});
    expect([400, 422]).toContain(res.status);
  });

  it("2. Forgot password returns 200 for non-existing email (security)", async () => {
    const res = await request(app).post("/api/auth/forgot-password").send({
      email: `no${Date.now()}@mail.com`,
    });
    expect(res.status).toBe(200);
  });

  it("3. Forgot password success for valid email", async () => {
    const res = await request(app).post("/api/auth/forgot-password").send({ email });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("4. Token fields are saved in DB after forgot password", async () => {
    await request(app).post("/api/auth/forgot-password").send({ email });

    const user = await UserModel.findOne({ email: email.toLowerCase() });
    expect(user).toBeTruthy();
    expect(user?.resetPasswordToken).toBeTruthy();
    expect(user?.resetPasswordExpires).toBeTruthy();
  });

  it("5. Reset password fails if token missing", async () => {
    const res = await request(app).post("/api/auth/reset-password").send({
      password: "NewPass123",
    });
    expect([400, 422]).toContain(res.status);
  });

  it("6. Reset password fails if password missing", async () => {
    const res = await request(app).post("/api/auth/reset-password").send({
      token: "something",
    });
    expect([400, 422]).toContain(res.status);
  });

  it("7. Reset password fails if token invalid", async () => {
    const res = await request(app).post("/api/auth/reset-password").send({
      token: "invalid_token",
      password: "NewPass123",
    });
    expect([400, 401]).toContain(res.status);
  });

  it("8. Reset password fails if token expired", async () => {
    // manually set expired token
    const raw = crypto.randomBytes(32).toString("hex");
    const hashed = crypto.createHash("sha256").update(raw).digest("hex");

    const user = await UserModel.findOne({ email: email.toLowerCase() });
    user!.resetPasswordToken = hashed as any;
    user!.resetPasswordExpires = new Date(Date.now() - 1000) as any; // expired
    await user!.save();

    const res = await request(app).post("/api/auth/reset-password").send({
      token: raw,
      password: "NewPass123",
    });

    expect([400, 401]).toContain(res.status);
  });

  it("9. Reset password success with valid token", async () => {
    // create fresh valid token
    const raw = crypto.randomBytes(32).toString("hex");
    const hashed = crypto.createHash("sha256").update(raw).digest("hex");

    const user = await UserModel.findOne({ email: email.toLowerCase() });
    user!.resetPasswordToken = hashed as any;
    user!.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000) as any;
    await user!.save();

    const res = await request(app).post("/api/auth/reset-password").send({
      token: raw,
      password: "NewPass123",
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("10. Token fields cleared after successful reset", async () => {
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    expect(user?.resetPasswordToken).toBeFalsy();
    expect(user?.resetPasswordExpires).toBeFalsy();
  });
});
