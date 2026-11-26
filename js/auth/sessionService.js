import { getItem, setItem, removeItem } from "../storage/localStorage.js";
import { getUserById } from "./authService.js";

const SESSION_KEY = "auth-session";

const REMEMBERED_SESSION_DURATION = 7 * 24 * 60 * 60 * 1000;

const getSessionStorage = () => {
  if (typeof window === "undefined") {
    throw new Error("Browser storage is unavailable.");
  }

  return window.sessionStorage;
};

const getSessionKey = () => `proofpath:${SESSION_KEY}`;

const clearRememberedSession = () => {
  removeItem(SESSION_KEY);
};

const clearTemporarySession = () => {
  try {
    getSessionStorage().removeItem(getSessionKey());
  } catch {
    return false;
  }

  return true;
};

const saveTemporarySession = (session) => {
  try {
    getSessionStorage().setItem(getSessionKey(), JSON.stringify(session));

    return true;
  } catch {
    return false;
  }
};

const readTemporarySession = () => {
  try {
    const storedSession = getSessionStorage().getItem(getSessionKey());

    return storedSession ? JSON.parse(storedSession) : null;
  } catch {
    return null;
  }
};

const isValidSession = (session) => {
  return (
    session &&
    typeof session.userId === "string" &&
    typeof session.createdAt === "string" &&
    typeof session.expiresAt === "number" &&
    Number.isFinite(session.expiresAt) &&
    session.expiresAt > Date.now()
  );
};

export const createSession = (user, rememberMe = false) => {
  if (!user || typeof user.id !== "string" || !user.id.trim()) {
    throw new Error("A valid user is required to create a session.");
  }

  const now = Date.now();

  const session = {
    userId: user.id,
    createdAt: new Date(now).toISOString(),
    expiresAt: rememberMe
      ? now + REMEMBERED_SESSION_DURATION
      : now + REMEMBERED_SESSION_DURATION,
  };

  clearRememberedSession();
  clearTemporarySession();

  const saved = rememberMe
    ? setItem(SESSION_KEY, session)
    : saveTemporarySession(session);

  if (!saved) {
    throw new Error("Unable to create your session.");
  }

  return session;
};

export const getSession = () => {
  const rememberedSession = getItem(SESSION_KEY, null);

  const temporarySession = rememberedSession ? null : readTemporarySession();

  const session = rememberedSession || temporarySession;

  if (!isValidSession(session)) {
    if (rememberedSession) {
      clearRememberedSession();
    }

    if (temporarySession) {
      clearTemporarySession();
    }

    return null;
  }

  return session;
};

export const getCurrentUser = () => {
  const session = getSession();

  if (!session) {
    return null;
  }

  const user = getUserById(session.userId);

  if (!user) {
    destroySession();
    return null;
  }

  return user;
};

export const isAuthenticated = () => {
  return getCurrentUser() !== null;
};

export const destroySession = () => {
  clearRememberedSession();
  clearTemporarySession();

  return true;
};
