import { getItem, setItem } from "../storage/localStorage.js";
import { hashPassword, verifyPassword } from "./passwordService.js";

const USERS_STORAGE_KEY = "users";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getUsers = () => {
  const users = getItem(USERS_STORAGE_KEY, []);

  return Array.isArray(users) ? users : [];
};

const normalizeEmail = (email) => {
  return email.trim().toLowerCase();
};

const createPublicUser = (user) => {
  if (!user) return null;

  const { passwordHash, ...publicUser } = user;

  return publicUser;
};

const findUserByEmail = (email) => {
  const normalizedEmail = normalizeEmail(email);

  return getUsers().find((user) => user.email === normalizedEmail);
};

export const getUserByEmail = (email) => {
  if (typeof email !== "string" || !email.trim()) {
    return null;
  }

  return createPublicUser(findUserByEmail(email));
};

export const getUserById = (userId) => {
  if (typeof userId !== "string" || !userId.trim()) {
    return null;
  }

  const user = getUsers().find((item) => item.id === userId);

  return createPublicUser(user);
};

export const registerUser = async ({ fullName, email, password }) => {
  if (typeof fullName !== "string" || !fullName.trim()) {
    throw new Error("Full name is required.");
  }

  if (typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
    throw new Error("Please enter a valid email address.");
  }

  if (typeof password !== "string" || password.length < 8) {
    throw new Error("Password must contain at least 8 characters.");
  }

  const normalizedEmail = normalizeEmail(email);

  const existingUser = findUserByEmail(normalizedEmail);

  if (existingUser) {
    throw new Error("An account with this email already exists.");
  }

  const passwordHash = await hashPassword(password);

  const newUser = {
    id: globalThis.crypto.randomUUID(),
    fullName: fullName.trim(),
    email: normalizedEmail,
    passwordHash,
    emailVerified: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const users = getUsers();

  users.push(newUser);

  const saved = setItem(USERS_STORAGE_KEY, users);

  if (!saved) {
    throw new Error("Unable to save your account. Please try again.");
  }

  return createPublicUser(newUser);
};

export const loginUser = async ({ email, password }) => {
  if (
    typeof email !== "string" ||
    !email.trim() ||
    typeof password !== "string" ||
    !password
  ) {
    throw new Error("Email and password are required.");
  }

  const user = findUserByEmail(email);

  if (!user) {
    throw new Error("Invalid email or password.");
  }

  const isPasswordValid = await verifyPassword(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new Error("Invalid email or password.");
  }

  return createPublicUser(user);
};

export const markEmailVerified = (email) => {
  if (typeof email !== "string" || !email.trim()) {
    throw new Error("A valid email address is required.");
  }

  const normalizedEmail = normalizeEmail(email);
  const users = getUsers();

  const userIndex = users.findIndex((user) => user.email === normalizedEmail);

  if (userIndex === -1) {
    throw new Error("Account not found.");
  }

  users[userIndex] = {
    ...users[userIndex],
    emailVerified: true,
    updatedAt: new Date().toISOString(),
  };

  const saved = setItem(USERS_STORAGE_KEY, users);

  if (!saved) {
    throw new Error("Unable to update email verification status.");
  }

  return createPublicUser(users[userIndex]);
};
