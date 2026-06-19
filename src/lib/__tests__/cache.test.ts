import { describe, it, expect, beforeEach, vi } from "vitest";
import { getCache, setCache, clearCache, persistCache, hydrateCache, clearStorageCache } from "../cache";

beforeEach(() => {
  clearCache();
  localStorage.clear();
});

describe("cache", () => {
  it("stores and retrieves values", () => {
    setCache("test", { foo: "bar" });
    expect(getCache("test", 5000)).toEqual({ foo: "bar" });
  });

  it("returns null for missing keys", () => {
    expect(getCache("nonexistent", 5000)).toBeNull();
  });

  it("expires entries after TTL", () => {
    vi.useFakeTimers();
    setCache("test", "value");
    vi.advanceTimersByTime(6000);
    expect(getCache("test", 5000)).toBeNull();
    vi.useRealTimers();
  });

  it("clears specific pattern", () => {
    setCache("articles-1", "a");
    setCache("articles-2", "b");
    setCache("other", "c");
    clearCache("articles");
    expect(getCache("articles-1", 5000)).toBeNull();
    expect(getCache("articles-2", 5000)).toBeNull();
    expect(getCache("other", 5000)).toBe("c");
  });

  it("clears all when no pattern", () => {
    setCache("a", 1);
    setCache("b", 2);
    clearCache();
    expect(getCache("a", 5000)).toBeNull();
    expect(getCache("b", 5000)).toBeNull();
  });

  it("persists and hydrates through localStorage", () => {
    setCache("persist-test", "saved");
    persistCache();
    clearCache();
    expect(getCache("persist-test", 5000)).toBeNull();
    hydrateCache();
    expect(getCache("persist-test", 5000)).toBe("saved");
  });

  it("handles corrupt localStorage data gracefully", () => {
    localStorage.setItem("app-cache", "not-json");
    hydrateCache();
    expect(getCache("anything", 5000)).toBeNull();
  });

  it("clearStorageCache removes localStorage entry", () => {
    persistCache();
    expect(localStorage.getItem("app-cache")).not.toBeNull();
    clearStorageCache();
    expect(localStorage.getItem("app-cache")).toBeNull();
  });
});
