describe("User tests", () => {

test("user test 1", () => { expect(true).toBe(true); });
test("user test 2", () => { expect(6+6).toBe(12); });
test("user test 3", () => { expect("profile").toContain("pro"); });
test("user test 4", () => { expect(20).toBeGreaterThan(5); });
test("user test 5", () => { expect(["name","email"]).toContain("email"); });
test("user test 6", () => { expect(true).toBeTruthy(); });
test("user test 7", () => { expect(false).toBeFalsy(); });
test("user test 8", () => { expect("account").toBe("account"); });
test("user test 9", () => { expect(typeof "user").toBe("string"); });
test("user test 10", () => { expect(7).toBeLessThan(20); });
test("user test 11", () => { expect(50).toBeGreaterThan(10); });

});