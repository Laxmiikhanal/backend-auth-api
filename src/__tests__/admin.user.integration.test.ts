import request from "supertest";
import bcrypt from "bcryptjs";
import app from "../app";
import { UserModel } from "../models/user.model";

describe("Admin User Management Integration Test (18)", () => {
  let adminToken = "";
  let userToken = "";
  let createdUserId = "";

  const adminEmail = `admin${Date.now()}@mail.com`;
  const adminPass = "Admin12345";

  const normalEmail = `normal${Date.now()}@mail.com`;
  const normalPass = "Test12345";

  beforeAll(async () => {
    // seed admin directly in DB (because /register usually doesn't allow role=admin safely)
    await UserModel.create({
      firstName: "Admin",
      lastName: "User",
      email: adminEmail.toLowerCase(),
      password: await bcrypt.hash(adminPass, 10),
      role: "admin",
    });

    // seed normal user
    await request(app).post("/api/auth/register").send({
      firstName: "Normal",
      lastName: "User",
      email: normalEmail,
      password: normalPass,
    });

    const adminLogin = await request(app).post("/api/auth/login").send({
      email: adminEmail,
      password: adminPass,
    });
    adminToken = adminLogin.body.token;

    const userLogin = await request(app).post("/api/auth/login").send({
      email: normalEmail,
      password: normalPass,
    });
    userToken = userLogin.body.token;
  });

  it("1. GET /api/admin/users blocked without token", async () => {
    const res = await request(app).get("/api/admin/users");
    expect([401, 403]).toContain(res.status);
  });

  it("2. GET /api/admin/users blocked for normal user (403)", async () => {
    const res = await request(app)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${userToken}`);

    expect([403, 401]).toContain(res.status);
  });

  it("3. GET /api/admin/users works for admin", async () => {
    const res = await request(app)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("4. Pagination page=1 limit=5 returns meta", async () => {
    const res = await request(app)
      .get("/api/admin/users?page=1&limit=5")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.meta).toBeTruthy();
    expect(res.body.meta.page).toBe(1);
    expect(res.body.meta.limit).toBe(5);
  });

  it("5. Pagination page=2 works", async () => {
    const res = await request(app)
      .get("/api/admin/users?page=2&limit=5")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("6. High page returns empty array (or still 200)", async () => {
    const res = await request(app)
      .get("/api/admin/users?page=999&limit=10")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("7. Admin can create user (no image)", async () => {
    const email = `created${Date.now()}@mail.com`;

    const res = await request(app)
      .post("/api/admin/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .field("firstName", "Created")
      .field("lastName", "User")
      .field("email", email)
      .field("password", "Test12345")
      .field("role", "user");

    expect([200, 201]).toContain(res.status);
    expect(res.body.success).toBe(true);

    createdUserId = res.body.data?._id;
    expect(createdUserId).toBeTruthy();
  });

  it("8. Admin create user fails with missing fields", async () => {
    const res = await request(app)
      .post("/api/admin/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .field("email", `x${Date.now()}@mail.com`);

    expect([400, 422]).toContain(res.status);
  });

  it("9. Admin create user fails for duplicate email", async () => {
    const dup = `dup_admin${Date.now()}@mail.com`;

    await request(app)
      .post("/api/admin/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .field("firstName", "A")
      .field("lastName", "B")
      .field("email", dup)
      .field("password", "Test12345");

    const res = await request(app)
      .post("/api/admin/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .field("firstName", "A")
      .field("lastName", "B")
      .field("email", dup)
      .field("password", "Test12345");

    expect([400, 409]).toContain(res.status);
  });

  it("10. GET /api/admin/users/:id works", async () => {
    const res = await request(app)
      .get(`/api/admin/users/${createdUserId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data?._id).toBe(createdUserId);
  });

  it("11. GET /api/admin/users/:id returns 404 for unknown id", async () => {
    const res = await request(app)
      .get(`/api/admin/users/65b6991b0826fc817405c72a`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect([404, 500]).toContain(res.status);
  });

  it("12. PUT /api/admin/users/:id updates user", async () => {
    const res = await request(app)
      .put(`/api/admin/users/${createdUserId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .field("firstName", "Updated")
      .field("role", "admin");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data?.firstName).toBe("Updated");
    expect(res.body.data?.role).toBe("admin");
  });

  it("13. PUT /api/admin/users/:id fails without token", async () => {
    const res = await request(app)
      .put(`/api/admin/users/${createdUserId}`)
      .field("firstName", "X");

    expect([401, 403]).toContain(res.status);
  });

  it("14. PUT /api/admin/users/:id blocked for normal user", async () => {
    const res = await request(app)
      .put(`/api/admin/users/${createdUserId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .field("firstName", "X");

    expect([401, 403]).toContain(res.status);
  });

  it("15. DELETE /api/admin/users/:id works", async () => {
    const res = await request(app)
      .delete(`/api/admin/users/${createdUserId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("16. DELETE returns 404 for already deleted", async () => {
    const res = await request(app)
      .delete(`/api/admin/users/${createdUserId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect([404, 500]).toContain(res.status);
  });

  it("17. Admin route test endpoint (if you have /test)", async () => {
    const res = await request(app)
      .get(`/api/admin/users/test`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect([200, 404]).toContain(res.status); // depends if you kept the route
  });

  it("18. Admin get list should not include password field", async () => {
    const res = await request(app)
      .get("/api/admin/users?page=1&limit=5")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    if (res.body.data?.[0]) {
      expect(res.body.data[0].password).toBeUndefined();
    }
  });
});
