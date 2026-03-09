import request from "supertest";
import app from "../app";

describe("Auth Integration Test (18)", () => {
  const userEmail = `user${Date.now()}@mail.com`;
  const userPass = "Test12345";

  it("1. Register user successfully", async () => {
    const res = await request(app).post("/api/auth/register").send({
      firstName: "Test",
      lastName: "User",
      email: userEmail,
      password: userPass,
    });

    expect([200, 201]).toContain(res.status);
    expect(res.body.success).toBe(true);
  });

  it("2. Register fails with missing fields", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "x@gmail.com",
    });
    expect([400, 422]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });

  it("3. Register fails with duplicate email", async () => {
    await request(app).post("/api/auth/register").send({
      firstName: "A",
      lastName: "B",
      email: "dup@mail.com",
      password: "Test12345",
    });

    const res = await request(app).post("/api/auth/register").send({
      firstName: "A",
      lastName: "B",
      email: "dup@mail.com",
      password: "Test12345",
    });

    expect([400, 409]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });

  it("4. Login successfully", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: userEmail,
      password: userPass,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeTruthy();
    expect(res.body.data?._id).toBeTruthy();
  });

  it("5. Login fails with wrong password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: userEmail,
      password: "WrongPass",
    });
    expect([400, 401]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });

  it("6. Login fails with non-existing email", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: `nope${Date.now()}@mail.com`,
      password: "Whatever123",
    });
    expect([400, 401, 404]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });

  it("7. Login fails with missing email", async () => {
    const res = await request(app).post("/api/auth/login").send({
      password: "Test12345",
    });
    expect([400, 422]).toContain(res.status);
  });

  it("8. Login fails with missing password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: userEmail,
    });
    expect([400, 422]).toContain(res.status);
  });

  it("9. whoami fails without token", async () => {
    const res = await request(app).get("/api/auth/whoami");
    expect([401, 403]).toContain(res.status);
  });

  it("10. whoami works with token", async () => {
    const loginRes = await request(app).post("/api/auth/login").send({
      email: userEmail,
      password: userPass,
    });

    const token = loginRes.body.token;

    const res = await request(app)
      .get("/api/auth/whoami")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data?.email).toBe(userEmail);
  });

  it("11. Update user fails without token", async () => {
    const res = await request(app).put("/api/auth/anything").send({
      firstName: "New",
    });
    expect([401, 403]).toContain(res.status);
  });

  it("12. Update self works with token", async () => {
    const loginRes = await request(app).post("/api/auth/login").send({
      email: userEmail,
      password: userPass,
    });

    const token = loginRes.body.token;
    const userId = loginRes.body.data._id;

    const res = await request(app)
      .put(`/api/auth/${userId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ firstName: "UpdatedFirst" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data?.firstName).toBe("UpdatedFirst");
  });

  it("13. Update self rejects invalid id format (or returns 500)", async () => {
    const loginRes = await request(app).post("/api/auth/login").send({
      email: userEmail,
      password: userPass,
    });

    const token = loginRes.body.token;

    const res = await request(app)
      .put(`/api/auth/not-a-mongo-id`)
      .set("Authorization", `Bearer ${token}`)
      .send({ firstName: "X" });

    expect([400, 404, 500]).toContain(res.status);
  });

  it("14. Update email to new email works", async () => {
    const loginRes = await request(app).post("/api/auth/login").send({
      email: userEmail,
      password: userPass,
    });

    const token = loginRes.body.token;
    const userId = loginRes.body.data._id;

    const newEmail = `new${Date.now()}@mail.com`;

    const res = await request(app)
      .put(`/api/auth/${userId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ email: newEmail });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data?.email).toBe(newEmail.toLowerCase());
  });

  it("15. Update email to duplicate should fail", async () => {
    // create another user
    await request(app).post("/api/auth/register").send({
      firstName: "Other",
      lastName: "User",
      email: "taken@mail.com",
      password: "Test12345",
    });

    const loginRes = await request(app).post("/api/auth/login").send({
      email: userEmail,
      password: userPass,
    });

    const token = loginRes.body.token;
    const userId = loginRes.body.data._id;

    const res = await request(app)
      .put(`/api/auth/${userId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ email: "taken@mail.com" });

    expect([400, 409]).toContain(res.status);
  });

  it("16. Register trims & lowercases email", async () => {
    const emailRaw = `  Mixed${Date.now()}@Mail.Com  `;

    const res = await request(app).post("/api/auth/register").send({
      firstName: "A",
      lastName: "B",
      email: emailRaw,
      password: "Test12345",
    });

    expect([200, 201]).toContain(res.status);
    expect(res.body.success).toBe(true);

    const login = await request(app).post("/api/auth/login").send({
      email: emailRaw.trim().toLowerCase(),
      password: "Test12345",
    });

    expect(login.status).toBe(200);
  });

  it("17. Login trims & lowercases email", async () => {
    const email = `trim${Date.now()}@mail.com`;
    const pass = "Test12345";

    await request(app).post("/api/auth/register").send({
      firstName: "T",
      lastName: "T",
      email,
      password: pass,
    });

    const res = await request(app).post("/api/auth/login").send({
      email: `  ${email.toUpperCase()}  `,
      password: pass,
    });

    expect(res.status).toBe(200);
  });

  it("18. whoami fails with invalid token", async () => {
    const res = await request(app)
      .get("/api/auth/whoami")
      .set("Authorization", `Bearer invalid_token_here`);

    expect([401, 403]).toContain(res.status);
  });
});
