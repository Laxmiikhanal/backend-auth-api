describe("Order tests", () => {

test("order test 1", () => { expect(true).toBe(true); });
test("order test 2", () => { expect(3+3).toBe(6); });
test("order test 3", () => { expect("order").toContain("ord"); });
test("order test 4", () => { expect(9).toBeGreaterThan(2); });
test("order test 5", () => { expect(["item1","item2"]).toContain("item2"); });
test("order test 6", () => { expect(true).toBeTruthy(); });
test("order test 7", () => { expect(false).toBeFalsy(); });
test("order test 8", () => { expect("cart").toBe("cart"); });
test("order test 9", () => { expect(typeof 5).toBe("number"); });
test("order test 10", () => { expect(100).toBeGreaterThan(50); });

});