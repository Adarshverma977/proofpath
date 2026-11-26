const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PHONE_REGEX = /^\+?[0-9\s()-]{7,20}$/;

const DATE_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;

const cleanString = (value) => {
  return typeof value === "string" ? value.trim() : "";
};

export const isRequired = (value) => {
  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return value !== null && value !== undefined;
};

export const isValidEmail = (email) => {
  return EMAIL_REGEX.test(cleanString(email));
};

export const isValidPhone = (phone) => {
  return PHONE_REGEX.test(cleanString(phone));
};

export const hasMinLength = (value, minLength) => {
  return typeof value === "string" && value.trim().length >= minLength;
};

export const hasMaxLength = (value, maxLength) => {
  return typeof value === "string" && value.trim().length <= maxLength;
};

export const isValidNumber = (value) => {
  return (
    value !== null &&
    value !== undefined &&
    value !== "" &&
    Number.isFinite(Number(value))
  );
};

export const isPositiveNumber = (value) => {
  return isValidNumber(value) && Number(value) > 0;
};

export const isNonNegativeNumber = (value) => {
  return isValidNumber(value) && Number(value) >= 0;
};

export const isValidDate = (value) => {
  if (typeof value !== "string" || !value.trim()) {
    return false;
  }

  const match = DATE_REGEX.exec(value);

  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};

export const isValidDateRange = (startDate, endDate) => {
  if (!isValidDate(startDate) || !isValidDate(endDate)) {
    return false;
  }

  return startDate <= endDate;
};

export const isValidUrl = (value) => {
  if (typeof value !== "string" || !value.trim()) {
    return false;
  }

  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

export const isValidFileType = (file, allowedTypes = []) => {
  if (!(file instanceof File) || !Array.isArray(allowedTypes)) {
    return false;
  }

  return allowedTypes.includes(file.type);
};

export const isValidFileSize = (file, maxSizeMB) => {
  if (!(file instanceof File) || !isPositiveNumber(maxSizeMB)) {
    return false;
  }

  const maxSizeBytes = Number(maxSizeMB) * 1024 * 1024;

  return file.size > 0 && file.size <= maxSizeBytes;
};

export const validateFields = (data, rules) => {
  const errors = {};

  Object.entries(rules).forEach(([field, fieldRules]) => {
    const value = data[field];

    for (const rule of fieldRules) {
      const isValid = rule.validate(value, data);

      if (!isValid) {
        errors[field] = rule.message;
        break;
      }
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
