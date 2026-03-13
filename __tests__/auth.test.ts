import { getStoredSession, saveStoredSession, clearStoredSession, StoredSession } from "@/lib/auth";

const STORAGE_KEY = "psw-digital-frontend-session";

beforeEach(() => {
  localStorage.clear();
});

describe("getStoredSession", () => {
  it("returns null when nothing is stored", () => {
    expect(getStoredSession()).toBeNull();
  });

  it("returns the parsed session when a valid JSON is stored", () => {
    const session: StoredSession = { token: "abc123", expiration: "2026-12-31" };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));

    expect(getStoredSession()).toEqual(session);
  });

  it("returns null and removes the item when stored value is invalid JSON", () => {
    localStorage.setItem(STORAGE_KEY, "not-json");

    expect(getStoredSession()).toBeNull();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("returns session with null expiration", () => {
    const session: StoredSession = { token: "tok", expiration: null };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));

    expect(getStoredSession()).toEqual(session);
  });
});

describe("saveStoredSession", () => {
  it("stores the session as JSON in localStorage", () => {
    const session: StoredSession = { token: "xyz", expiration: "2026-06-01" };
    saveStoredSession(session);

    const stored = localStorage.getItem(STORAGE_KEY);
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored!)).toEqual(session);
  });
});

describe("clearStoredSession", () => {
  it("removes the session from localStorage", () => {
    localStorage.setItem(STORAGE_KEY, '{"token":"a","expiration":null}');
    clearStoredSession();

    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("does not throw when no session exists", () => {
    expect(() => clearStoredSession()).not.toThrow();
  });
});

