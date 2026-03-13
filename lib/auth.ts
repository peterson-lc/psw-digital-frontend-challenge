export type StoredSession = {
  token: string;
  expiration: string | null;
};

const STORAGE_KEY = "psw-digital-frontend-session";

export function getStoredSession(): StoredSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const session = window.localStorage.getItem(STORAGE_KEY);

  if (!session) {
    return null;
  }

  try {
    return JSON.parse(session) as StoredSession;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function saveStoredSession(session: StoredSession) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearStoredSession() {
  window.localStorage.removeItem(STORAGE_KEY);
}