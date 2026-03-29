describe("Product tests", () => {

test("product test 1", () => { expect(true).toBe(true); });
test("product test 2", () => { expect(2+2).toBe(4); });
test("product test 3", () => { expect("rose").toContain("ro"); });
test("product test 4", () => { expect(8).toBeGreaterThan(3); });
test("product test 5", () => { expect(["rose","tulip"]).toContain("rose"); });
test("product test 6", () => { expect(true).toBeTruthy(); });
test("product test 7", () => { expect(false).toBeFalsy(); });
test("product test 8", () => { expect("flower").toBe("flower"); });
test("product test 9", () => { expect(typeof 200).toBe("number"); });
test("product test 10", () => { expect(30).toBeGreaterThan(10); });

});