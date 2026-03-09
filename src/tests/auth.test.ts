describe("Auth tests", () => {

test("auth test 1", () => { expect(true).toBe(true); });
test("auth test 2", () => { expect(1+1).toBe(2); });
test("auth test 3", () => { expect("login").toContain("log"); });
test("auth test 4", () => { expect(5).toBeGreaterThan(1); });
test("auth test 5", () => { expect([1,2]).toContain(2); });
test("auth test 6", () => { expect(true).toBeTruthy(); });
test("auth test 7", () => { expect(false).toBeFalsy(); });
test("auth test 8", () => { expect("user").toBe("user"); });
test("auth test 9", () => { expect(typeof "email").toBe("string"); });
test("auth test 10", () => { expect(10).toBeLessThan(20); });

});