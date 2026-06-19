import { describe, it, expect } from "vitest";
import { cn, readingMinutes } from "../utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("resolves tailwind conflicts", () => {
    expect(cn("px-4", "px-2")).toBe("px-2");
  });
});

describe("readingMinutes", () => {
  it("returns 1 for short text", () => {
    expect(readingMinutes("hello world")).toBe(1);
  });

  it("calculates correct reading time at 220 wpm", () => {
    const words = Array(440).fill("word").join(" ");
    expect(readingMinutes(words)).toBe(2);
  });

  it("returns at least 1 minute", () => {
    expect(readingMinutes("")).toBe(1);
  });
});
