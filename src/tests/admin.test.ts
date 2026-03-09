describe("Admin tests", () => {

test("admin test 1", () => { expect(true).toBe(true); });
test("admin test 2", () => { expect(4+4).toBe(8); });
test("admin test 3", () => { expect("admin").toContain("ad"); });
test("admin test 4", () => { expect(15).toBeGreaterThan(10); });
test("admin test 5", () => { expect(["order","product"]).toContain("order"); });
test("admin test 6", () => { expect(true).toBeTruthy(); });
test("admin test 7", () => { expect(false).toBeFalsy(); });
test("admin test 8", () => { expect("panel").toBe("panel"); });
test("admin test 9", () => { expect(typeof "admin").toBe("string"); });
test("admin test 10", () => { expect(200).toBeGreaterThan(100); });
test("admin test 11", () => { expect(5).toBeLessThan(10); });

});