const STORAGE_PREFIX = "proofpath:";

export const STORAGE_KEYS = Object.freeze({
  PRODUCTS: "products",
  DOCUMENTS: "documents",
  CLAIMS: "claims",
  WARRANTIES: "warranties",
  SERVICES: "services",
  NOTIFICATIONS: "notifications",
  OWNERSHIP_TRANSFERS: "ownership-transfers",
  ACTIVITIES: "activities",
  PROFILE: "profile",
  SETTINGS: "settings",
});

const getStorageKey = (key) => {
  if (typeof key !== "string" || !key.trim()) {
    throw new TypeError("Storage key must be a non-empty string.");
  }

  return `${STORAGE_PREFIX}${key.trim()}`;
};

const emitStorageEvent = (key, value, operation) => {
  document.dispatchEvent(
    new CustomEvent("proofpath:storage-updated", {
      detail: {
        key,
        value,
        operation,
      },
    }),
  );
};

export const getItem = (key, fallback = null) => {
  try {
    const storageKey = getStorageKey(key);
    const storedValue = localStorage.getItem(storageKey);

    if (storedValue === null) {
      return fallback;
    }

    return JSON.parse(storedValue);
  } catch (error) {
    console.error(`ProofPath storage read failed for "${key}":`, error);
    return fallback;
  }
};

export const setItem = (key, value) => {
  try {
    const storageKey = getStorageKey(key);
    const serializedValue = JSON.stringify(value);

    if (serializedValue === undefined) {
      throw new TypeError("Value cannot be serialized to JSON.");
    }

    localStorage.setItem(storageKey, serializedValue);

    emitStorageEvent(key, value, "set");

    return true;
  } catch (error) {
    console.error(`ProofPath storage write failed for "${key}":`, error);
    return false;
  }
};

export const removeItem = (key) => {
  try {
    const storageKey = getStorageKey(key);

    localStorage.removeItem(storageKey);

    emitStorageEvent(key, null, "remove");

    return true;
  } catch (error) {
    console.error(`ProofPath storage removal failed for "${key}":`, error);
    return false;
  }
};

export const hasItem = (key) => {
  try {
    return localStorage.getItem(getStorageKey(key)) !== null;
  } catch (error) {
    console.error(`ProofPath storage check failed for "${key}":`, error);
    return false;
  }
};

export const getAllKeys = () => {
  try {
    const keys = [];

    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);

      if (key?.startsWith(STORAGE_PREFIX)) {
        keys.push(key.slice(STORAGE_PREFIX.length));
      }
    }

    return keys;
  } catch (error) {
    console.error("ProofPath storage key retrieval failed:", error);
    return [];
  }
};

export const clearNamespace = () => {
  try {
    const keys = getAllKeys();

    keys.forEach((key) => {
      localStorage.removeItem(getStorageKey(key));
    });

    emitStorageEvent("*", null, "clear");

    return true;
  } catch (error) {
    console.error("ProofPath storage cleanup failed:", error);
    return false;
  }
};

export const subscribeToStorage = (callback) => {
  if (typeof callback !== "function") {
    throw new TypeError("Storage subscriber must be a function.");
  }

  const handleStorageUpdate = (event) => {
    callback(event.detail);
  };

  const handleCrossTabUpdate = (event) => {
    if (!event.key?.startsWith(STORAGE_PREFIX)) {
      return;
    }

    const key = event.key.slice(STORAGE_PREFIX.length);

    let value = null;

    if (event.newValue !== null) {
      try {
        value = JSON.parse(event.newValue);
      } catch {
        value = null;
      }
    }

    callback({
      key,
      value,
      operation: event.newValue === null ? "remove" : "set",
    });
  };

  document.addEventListener("proofpath:storage-updated", handleStorageUpdate);

  window.addEventListener("storage", handleCrossTabUpdate);

  return () => {
    document.removeEventListener(
      "proofpath:storage-updated",
      handleStorageUpdate,
    );

    window.removeEventListener("storage", handleCrossTabUpdate);
  };
};
