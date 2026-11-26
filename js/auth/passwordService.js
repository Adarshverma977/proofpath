const PBKDF2_ITERATIONS = 600000;
const HASH_ALGORITHM = "SHA-256";
const DERIVED_KEY_LENGTH = 256;
const SALT_LENGTH = 16;

const getCrypto = () => {
  if (!globalThis.crypto?.subtle) {
    throw new Error(
      "Web Crypto API is unavailable. Run ProofPath using localhost or HTTPS.",
    );
  }

  return globalThis.crypto;
};

const generateSalt = () => {
  const salt = new Uint8Array(SALT_LENGTH);
  getCrypto().getRandomValues(salt);

  return salt;
};

const bufferToHex = (buffer) => {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

const hexToBuffer = (hex) => {
  if (
    typeof hex !== "string" ||
    hex.length === 0 ||
    hex.length % 2 !== 0 ||
    !/^[0-9a-f]+$/i.test(hex)
  ) {
    throw new Error("Invalid hexadecimal value.");
  }

  return Uint8Array.from(hex.match(/.{2}/g), (byte) => parseInt(byte, 16));
};

const derivePasswordHash = async (password, salt) => {
  const crypto = getCrypto();
  const encoder = new TextEncoder();

  const passwordKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  return crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: HASH_ALGORITHM,
    },
    passwordKey,
    DERIVED_KEY_LENGTH,
  );
};

export const hashPassword = async (password) => {
  if (typeof password !== "string" || password.length < 8) {
    throw new Error("Password must contain at least 8 characters.");
  }

  const salt = generateSalt();

  const derivedHash = await derivePasswordHash(password, salt);

  return {
    algorithm: "PBKDF2",
    hashAlgorithm: HASH_ALGORITHM,
    iterations: PBKDF2_ITERATIONS,
    salt: bufferToHex(salt),
    hash: bufferToHex(derivedHash),
  };
};

export const verifyPassword = async (password, storedPassword) => {
  if (typeof password !== "string" || !storedPassword) {
    return false;
  }

  try {
    if (
      storedPassword.algorithm !== "PBKDF2" ||
      storedPassword.hashAlgorithm !== HASH_ALGORITHM ||
      storedPassword.iterations !== PBKDF2_ITERATIONS ||
      typeof storedPassword.salt !== "string" ||
      typeof storedPassword.hash !== "string"
    ) {
      return false;
    }

    const salt = hexToBuffer(storedPassword.salt);
    const expectedHash = hexToBuffer(storedPassword.hash);

    if (
      salt.length !== SALT_LENGTH ||
      expectedHash.length !== DERIVED_KEY_LENGTH / 8
    ) {
      return false;
    }

    const derivedHash = await derivePasswordHash(password, salt);
    const actualHash = new Uint8Array(derivedHash);

    if (actualHash.length !== expectedHash.length) {
      return false;
    }

    let difference = 0;

    for (let index = 0; index < actualHash.length; index++) {
      difference |= actualHash[index] ^ expectedHash[index];
    }

    return difference === 0;
  } catch {
    return false;
  }
};
