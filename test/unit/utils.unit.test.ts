import {
  findOrThrowNotFound,
  findManyOrThrowNotFound,
  throwConflictIfFound,
  parseISODateParamToUTC,
  parseStringArrayParam 
} from "@utils";
import { ConflictError } from "@models/errors/ConflictError";
import { NotFoundError } from "@models/errors/NotFoundError";

describe("utils functions", () => {

  describe("findOrThrowNotFound", () => {
    it("should return the matched item", () => {
      const result = findOrThrowNotFound([1, 2, 3], x => x === 2, "Not found");
      expect(result).toBe(2);
    });

    it("should throw NotFoundError if no match", () => {
      expect(() =>
        findOrThrowNotFound([1, 2, 3], x => x === 4, "Not found")
      ).toThrow(NotFoundError);
    });
  });

  describe("findManyOrThrowNotFound", () => {
    it("should return all matching items", () => {
      const result = findManyOrThrowNotFound([1, 2, 3, 2], x => x === 2, "None found");
      expect(result).toEqual([2, 2]);
    });

    it("should throw NotFoundError if no matches", () => {
      expect(() =>
        findManyOrThrowNotFound([1, 2, 3], x => x === 5, "Not found")
      ).toThrow(NotFoundError);
    });
  });

  describe("throwConflictIfFound", () => {
    it("should throw ConflictError if item matches", () => {
      expect(() =>
        throwConflictIfFound([1, 2, 3], x => x === 2, "Already exists")
      ).toThrow(ConflictError);
    });

    it("should do nothing if no item matches", () => {
      expect(() =>
        throwConflictIfFound([1, 2, 3], x => x === 5, "Already exists")
      ).not.toThrow();
    });
  });

  describe("parseISODateParamToUTC", () => {
    it("should return a Date object for valid ISO string", () => {
      const result = parseISODateParamToUTC("2024-05-01T12:00:00Z");
      expect(result).toBeInstanceOf(Date);
      expect(result?.toISOString()).toBe("2024-05-01T12:00:00.000Z");
    });

    it("should return undefined for an invalid date", () => {
      expect(parseISODateParamToUTC("not-a-date")).toBeUndefined();
    });

    it("should return undefined for non-string elements", () => {
      expect(parseISODateParamToUTC(1234)).toBeUndefined();
    });
  });

  describe("parseStringArrayParam", () => {
    it("should parse comma-separated string", () => {
      const result = parseStringArrayParam("mac1, mac2 ,mac3");
      expect(result).toEqual(["mac1", "mac2", "mac3"]);
    });

    it("should parse array of strings", () => {
      const result = parseStringArrayParam(["mac1", " mac2"]);
      expect(result).toEqual(["mac1", "mac2"]);
    });

    it("should filter non-valid elements", () => {
      const result = parseStringArrayParam(["mac1", " mac2", " ", "", 122]);
      expect(result).toEqual(["mac1", "mac2"]);
    });

    it("should return undefined for non-string and non-array", () => {
      expect(parseStringArrayParam(42)).toBeUndefined();
    });

    it("should filter out empty strings", () => {
      const result = parseStringArrayParam("mac1,, ,mac2");
      expect(result).toEqual(["mac1", "mac2"]);
    });
  });
});
