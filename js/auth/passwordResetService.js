import { getItem, setItem, removeItem } from "../storage/localStorage.js";

const RESET_STORAGE_KEY = "password-reset-verifications";

const OTP_LENGTH = 6;
const OTP_EXPIRY_MS = 5 * 60 * 1000;
const RESEND_COOLDOWN_MS = 30 * 1000;
const MAX_ATTEMPTS = 5;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeEmail = (email) => {
  return email.trim().toLowerCase();
};

const validateEmail = (email) => {
  if (typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
    throw new Error("Please enter a valid email address.");
  }

  return normalizeEmail(email);
};

const getResetRecords = () => {
  const records = getItem(RESET_STORAGE_KEY, {});

  return records && typeof records === "object" && !Array.isArray(records)
    ? records
    : {};
};

const saveResetRecord = (email, record) => {
  const records = getResetRecords();

  records[email] = record;

  const saved = setItem(RESET_STORAGE_KEY, records);

  if (!saved) {
    throw new Error("Unable to save password reset information.");
  }
};

const removeResetRecord = (email) => {
  const records = getResetRecords();

  if (!Object.prototype.hasOwnProperty.call(records, email)) {
    return;
  }

  delete records[email];

  if (Object.keys(records).length === 0) {
    removeItem(RESET_STORAGE_KEY);
    return;
  }

  const saved = setItem(RESET_STORAGE_KEY, records);

  if (!saved) {
    throw new Error("Unable to clear password reset information.");
  }
};

const generateOtp = () => {
  const randomValues = new Uint32Array(1);

  globalThis.crypto.getRandomValues(randomValues);

  const otp = randomValues[0] % 1_000_000;

  return String(otp).padStart(OTP_LENGTH, "0");
};

const createOtpRecord = () => {
  const now = Date.now();

  return {
    demoCode: generateOtp(),
    createdAt: now,
    expiresAt: now + OTP_EXPIRY_MS,
    resendAvailableAt: now + RESEND_COOLDOWN_MS,
    attempts: 0,
    maxAttempts: MAX_ATTEMPTS,
    locked: false,
    verified: false,
    verifiedAt: null,
  };
};

const getRecord = (email) => {
  return getResetRecords()[email] || null;
};

const getRemainingSeconds = (timestamp) => {
  return Math.max(0, Math.ceil((timestamp - Date.now()) / 1000));
};

const getPublicRecord = (record) => {
  if (!record) return null;

  return {
    demoCode: record.demoCode,
    createdAt: record.createdAt,
    expiresAt: record.expiresAt,
    resendAvailableAt: record.resendAvailableAt,
    attempts: record.attempts,
    maxAttempts: record.maxAttempts,
    locked: record.locked,
    verified: record.verified,
    remainingSeconds: getRemainingSeconds(record.expiresAt),
    resendCooldown: getRemainingSeconds(record.resendAvailableAt),
  };
};

export const createPasswordResetOtp = (email) => {
  const normalizedEmail = validateEmail(email);

  const existingRecord = getRecord(normalizedEmail);

  if (existingRecord) {
    if (existingRecord.verified) {
      throw new Error("This password reset OTP has already been verified.");
    }

    if (existingRecord.locked) {
      throw new Error("Too many incorrect attempts. Please try again later.");
    }

    if (Date.now() < existingRecord.expiresAt) {
      return getPublicRecord(existingRecord);
    }

    throw new Error("Your OTP has expired. Please request a new one.");
  }

  const record = createOtpRecord();

  saveResetRecord(normalizedEmail, record);

  return getPublicRecord(record);
};

export const resendPasswordResetOtp = (email) => {
  const normalizedEmail = validateEmail(email);

  const existingRecord = getRecord(normalizedEmail);

  if (!existingRecord) {
    throw new Error("No password reset request found. Please start again.");
  }

  if (existingRecord.verified) {
    throw new Error("Your OTP is already verified.");
  }

  const remainingCooldown = getRemainingSeconds(
    existingRecord.resendAvailableAt,
  );

  if (remainingCooldown > 0) {
    throw new Error(
      `Please wait ${remainingCooldown} seconds before requesting another OTP.`,
    );
  }

  const record = createOtpRecord();

  saveResetRecord(normalizedEmail, record);

  return getPublicRecord(record);
};

export const verifyPasswordResetOtp = (email, enteredOtp) => {
  const normalizedEmail = validateEmail(email);

  if (typeof enteredOtp !== "string" || !/^\d{6}$/.test(enteredOtp)) {
    throw new Error("Please enter a valid 6-digit OTP.");
  }

  const record = getRecord(normalizedEmail);

  if (!record) {
    throw new Error("No password reset request found. Please start again.");
  }

  if (record.verified) {
    return {
      success: true,
      message: "OTP has already been verified.",
    };
  }

  if (record.locked) {
    throw new Error("Too many incorrect attempts. Please try again later.");
  }

  if (Date.now() >= record.expiresAt) {
    throw new Error("Your OTP has expired. Please request a new one.");
  }

  if (enteredOtp !== record.demoCode) {
    const updatedAttempts = record.attempts + 1;
    const isLocked = updatedAttempts >= MAX_ATTEMPTS;

    const updatedRecord = {
      ...record,
      attempts: updatedAttempts,
      locked: isLocked,
    };

    saveResetRecord(normalizedEmail, updatedRecord);

    if (isLocked) {
      throw new Error(
        "Maximum attempts reached. Please request a new OTP after the cooldown.",
      );
    }

    throw new Error(
      `Incorrect OTP. ${MAX_ATTEMPTS - updatedAttempts} attempts remaining.`,
    );
  }

  const updatedRecord = {
    ...record,
    verified: true,
    verifiedAt: Date.now(),
  };

  saveResetRecord(normalizedEmail, updatedRecord);

  return {
    success: true,
    message: "OTP verified successfully.",
  };
};

export const isPasswordResetVerified = (email) => {
  const normalizedEmail = validateEmail(email);
  const record = getRecord(normalizedEmail);

  if (!record || !record.verified || record.locked) {
    return false;
  }

  return Date.now() < record.expiresAt;
};

export const getPasswordResetStatus = (email) => {
  const normalizedEmail = validateEmail(email);

  return getPublicRecord(getRecord(normalizedEmail));
};

export const clearPasswordResetOtp = (email) => {
  const normalizedEmail = validateEmail(email);

  removeResetRecord(normalizedEmail);
};
