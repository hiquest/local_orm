const { validations: v } = require("../index");

describe("Validations",() => {
  describe("requireBoolean", () => {
    it("should work correctly", () => {
      const testBool = (val) => {
        [err, valid] = v.requireBoolean(val);
        return valid;
      }
      expect(testBool(true)).toBe(true);
      expect(testBool(false)).toBe(true);
      expect(testBool(1)).toBe(false);
      expect(testBool({})).toBe(false);
      expect(testBool([])).toBe(false);
      expect(testBool("str")).toBe(false);
      expect(testBool(null)).toBe(false);
      expect(testBool(undefined)).toBe(false);
    });
  });

  describe("requireInteger", () => {
    it("should work correctly", () => {
      const test = (val) => {
        [err, valid] = v.requireInteger(val);
        return valid;
      }
      expect(test(true)).toBe(false);
      expect(test(false)).toBe(false);
      expect(test(1)).toBe(true);
      expect(test(-1)).toBe(true);
      expect(test({})).toBe(false);
      expect(test([])).toBe(false);
      expect(test("str")).toBe(false);
      expect(test(null)).toBe(false);
      expect(test(undefined)).toBe(false);
    });
  });

  describe("requireString", () => {
    it("should work correctly", () => {
      const test = (val) => {
        [err, valid] = v.requireString(val);
        return valid;
      }
      expect(test(true)).toBe(false);
      expect(test(false)).toBe(false);
      expect(test(1)).toBe(false);
      expect(test(-1)).toBe(false);
      expect(test({})).toBe(false);
      expect(test([])).toBe(false);
      expect(test("str")).toBe(true);
      expect(test("")).toBe(true);
      expect(test(null)).toBe(false);
      expect(test(undefined)).toBe(false);
    });
  });

  describe("present", () => {
    it("should work correctly", () => {
      let [err, valid] = v.present("");
      expect(valid).toBe(false);
      [err, valid] = v.present("hello");
      expect(valid).toBe(true);
      [err, valid] = v.present(1);
      expect(valid).toBe(true);
      [err, valid] = v.present(null);
      expect(valid).toBe(false);
    });
  });

  describe("min", () => {
    it("should work correctly", () => {
      const min5 = v.min(5);
      let [err, valid] = min5(0);
      expect(valid).toBe(false);
      [err, valid] = min5(10);
      expect(valid).toBe(true);
      [err, valid] = min5(5);
      expect(valid).toBe(true);
    });
  });

  describe("max", () => {
    it("should work correctly", () => {
      const max5 = v.max(5);
      let [err, valid] = max5(0);
      expect(valid).toBe(true);
      [err, valid] = max5(10);
      expect(valid).toBe(false);
      [err, valid] = max5(5);
      expect(valid).toBe(true);
    });
  });

  describe("maxLength", () => {
    it("should work correctly", () => {
      const max10 = v.maxLength(10);
      let [err, valid] = max10("hello");
      expect(valid).toBe(true);
      expect(err).toBeFalsy();

      [err, valid] = max10("this is a too long string");
      expect(valid).toBe(false);
      expect(err).toBeTruthy();

      [err, valid] = max10("0123456789");
      expect(valid).toBe(true);
      expect(err).toBeFalsy();

      [err, valid] = max10(123);
      expect(valid).toBe(false);
    });
  });

  describe("minLength", () => {
    it("should work correctly", () => {
      const min10 = v.minLength(10);
      let [err, valid] = min10("hello");
      expect(valid).toBe(false);
      expect(err).toBeTruthy();

      [err, valid] = min10("this is a too long string");
      expect(valid).toBe(true);

      [err, valid] = min10("0123456789");
      expect(valid).toBe(true);

      [err, valid] = min10(123);
      expect(valid).toBe(false);
    });
  });
});

describe("Composite or validation", () => {
  it("should work correctly", () => {
    outerRange = v.or(v.minLength(10), v.maxLength(4));

    let [err, valid] = outerRange("hello");
    expect(valid).toBe(false);
    expect(err).toBeTruthy();

    [err, valid] = outerRange("this is a too long string");
    expect(valid).toBe(true);
  });
});

describe("#run", () => {
  it("should work correctly", () => {
    const validations = [v.requireString, v.maxLength(10)];

    let [errors, valid] = v.run(4, validations);
    expect(valid).toBe(false);
    expect(errors.length).toBe(2);

    [errors, valid] = v.run("this is a too long string", validations);
    expect(valid).toBe(false);
    expect(errors.length).toBe(1);

    [errors, valid] = v.run("pass", validations);
    expect(errors.length).toBe(0);
  });
});
