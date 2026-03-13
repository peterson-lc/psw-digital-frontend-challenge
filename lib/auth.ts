export type StoredSession = {
  token: string;
  expiration: string | null;
};

const STORAGE_KEY = "psw-digital-frontend-session";

export function getStoredSession(): StoredSession | null {
  if (typeof globalThis === "undefined") {
    return null;
  }

  const session = globalThis.localStorage?.getItem(STORAGE_KEY);

  if (!session) {
    return null;
  }

  try {
    return JSON.parse(session) as StoredSession;
  } catch {
    globalThis.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function saveStoredSession(session: StoredSession) {
  globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearStoredSession() {
  globalThis.localStorage.removeItem(STORAGE_KEY);
}