import { getItem, setItem, removeItem } from "../storage/localStorage.js";

const STORAGE_KEY = "email-verifications";

const OTP_LENGTH = 6;
const OTP_EXPIRY = 5 * 60 * 1000;
const RESEND_COOLDOWN = 30 * 1000;
const MAX_ATTEMPTS = 5;

const normalizeEmail = (email) => {
  return email.trim().toLowerCase();
};

const getRecords = () => {
  const records = getItem(STORAGE_KEY, {});

  return records && typeof records === "object" && !Array.isArray(records)
    ? records
    : {};
};

const saveRecord = (email, record) => {
  const records = getRecords();

  records[email] = record;

  if (!setItem(STORAGE_KEY, records)) {
    throw new Error("Unable to save verification information.");
  }
};

const removeRecord = (email) => {
  const records = getRecords();

  delete records[email];

  if (Object.keys(records).length === 0) {
    removeItem(STORAGE_KEY);
    return;
  }

  if (!setItem(STORAGE_KEY, records)) {
    throw new Error("Unable to update verification information.");
  }
};

const generateOtp = () => {
  if (!globalThis.crypto?.getRandomValues) {
    throw new Error("Secure random number generation is unavailable.");
  }

  const randomValues = new Uint32Array(1);

  globalThis.crypto.getRandomValues(randomValues);

  return String(randomValues[0] % 1000000).padStart(OTP_LENGTH, "0");
};

const createOtpRecord = () => {
  const now = Date.now();

  return {
    demoCode: generateOtp(),
    createdAt: now,
    expiresAt: now + OTP_EXPIRY,
    resendAvailableAt: now + RESEND_COOLDOWN,
    attempts: 0,
    maxAttempts: MAX_ATTEMPTS,
    locked: false,
  };
};

const getActiveRecord = (email) => {
  const normalizedEmail = normalizeEmail(email);

  return getRecords()[normalizedEmail] || null;
};

const getRemainingSeconds = (timestamp) => {
  return Math.max(0, Math.ceil((timestamp - Date.now()) / 1000));
};

export const createOrGetVerificationOtp = (email) => {
  if (typeof email !== "string" || !email.trim()) {
    throw new Error("A valid email address is required.");
  }

  const normalizedEmail = normalizeEmail(email);
  const existingRecord = getActiveRecord(normalizedEmail);

  if (
    existingRecord &&
    existingRecord.expiresAt > Date.now()
  ) {
    return {
      ...existingRecord,
      remainingSeconds: getRemainingSeconds(existingRecord.expiresAt),
      resendRemaining: getRemainingSeconds(existingRecord.resendAvailableAt),
    };
  }

  const newRecord = createOtpRecord();

  saveRecord(normalizedEmail, newRecord);

  return {
    ...newRecord,
    remainingSeconds: OTP_EXPIRY / 1000,
    resendRemaining: RESEND_COOLDOWN / 1000,
  };
};

export const resendVerificationOtp = (email) => {
  if (typeof email !== "string" || !email.trim()) {
    throw new Error("A valid email address is required.");
  }

  const normalizedEmail = normalizeEmail(email);
  const existingRecord = getActiveRecord(normalizedEmail);

  if (existingRecord && Date.now() < existingRecord.resendAvailableAt) {
    const remaining = getRemainingSeconds(existingRecord.resendAvailableAt);

    throw new Error(
      `Please wait ${remaining} seconds before requesting another OTP.`,
    );
  }

  const newRecord = createOtpRecord();

  saveRecord(normalizedEmail, newRecord);

  return {
    ...newRecord,
    remainingSeconds: OTP_EXPIRY / 1000,
    resendRemaining: RESEND_COOLDOWN / 1000,
  };
};

export const verifyVerificationOtp = (email, enteredOtp) => {
  if (typeof email !== "string" || !email.trim()) {
    return {
      success: false,
      reason: "invalid-email",
      message: "A valid email address is required.",
    };
  }

  if (!/^\d{6}$/.test(enteredOtp)) {
    return {
      success: false,
      reason: "invalid-format",
      message: "Enter a valid 6-digit OTP.",
    };
  }

  const normalizedEmail = normalizeEmail(email);
  const record = getActiveRecord(normalizedEmail);

  if (!record) {
    return {
      success: false,
      reason: "not-found",
      message: "No active verification code found. Request a new OTP.",
    };
  }

  if (record.locked) {
    return {
      success: false,
      reason: "locked",
      message: "Maximum verification attempts reached. Request a new OTP.",
    };
  }

  if (Date.now() >= record.expiresAt) {
    removeRecord(normalizedEmail);

    return {
      success: false,
      reason: "expired",
      message: "Your OTP has expired. Request a new verification code.",
    };
  }

  if (record.demoCode !== enteredOtp) {
    record.attempts += 1;

    if (record.attempts >= MAX_ATTEMPTS) {
      record.locked = true;
    }

    saveRecord(normalizedEmail, record);

    const remainingAttempts = MAX_ATTEMPTS - record.attempts;

    return {
      success: false,
      reason: record.locked ? "locked" : "incorrect",
      remainingAttempts,
      message: record.locked
        ? "Maximum attempts reached. Request a new OTP."
        : `Incorrect OTP. ${remainingAttempts} attempts remaining.`,
    };
  }

  removeRecord(normalizedEmail);

  return {
    success: true,
    message: "Email verification completed successfully.",
  };
};

export const getVerificationCooldown = (email) => {
  if (typeof email !== "string" || !email.trim()) {
    return 0;
  }

  const record = getActiveRecord(normalizeEmail(email));

  if (!record) return 0;

  return getRemainingSeconds(record.resendAvailableAt);
};

export const clearVerificationOtp = (email) => {
  if (typeof email !== "string" || !email.trim()) {
    return false;
  }

  removeRecord(normalizeEmail(email));

  return true;
};
