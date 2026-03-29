import request from "supertest";
import app from "../app";

describe("Admin User Management Integration Test", () => {
  let adminToken = "";
  let createdUserId = "";

  beforeEach(async () => {
    // ✅ create an admin user first (DB is cleared after every test)
    const adminEmail = `admin${Date.now()}@mail.com`;
    const adminPassword = "Admin12345";

    await request(app).post("/api/auth/register").send({
      firstName: "Admin",
      lastName: "User",
      email: adminEmail,
      password: adminPassword,
      role: "admin",
    });

    // ✅ login admin
    const loginRes = await request(app).post("/api/auth/login").send({
      email: adminEmail,
      password: adminPassword,
    });

    expect(loginRes.status).toBe(200);
    adminToken = loginRes.body.token;
    expect(adminToken).toBeTruthy();

    // ✅ create one normal user for ID test
    const userRes = await request(app)
      .post("/api/admin/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .field("firstName", "Normal")
      .field("lastName", "User")
      .field("email", `user${Date.now()}@mail.com`)
      .field("password", "User12345")
      .field("role", "user");

    expect([200, 201]).toContain(userRes.status);
    createdUserId = userRes.body.data?._id;
    expect(createdUserId).toBeTruthy();
  });

  it("1. Get all users", async () => {
    const res = await request(app)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("2. Pagination page=1 limit=5", async () => {
    const res = await request(app)
      .get("/api/admin/users?page=1&limit=5")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeLessThanOrEqual(5);
    expect(res.body).toHaveProperty("meta");
  });

  it("3. Pagination page=2", async () => {
    const res = await request(app)
      .get("/api/admin/users?page=2&limit=5")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });

  it("4. Empty response for high page", async () => {
    const res = await request(app)
      .get("/api/admin/users?page=99&limit=5")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("5. Get user by ID", async () => {
    const res = await request(app)
      .get(`/api/admin/users/${createdUserId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data?._id).toBe(createdUserId);
  });
});
