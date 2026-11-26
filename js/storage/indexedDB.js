const DB_NAME = "ProofPathDB";
const DB_VERSION = 1;
const STORE_NAME = "files";

let databasePromise = null;

const objectURLs = new Map();

const generateId = () => {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `file_${Date.now()}_${Math.random().toString(36).slice(2)}`;
};

const requestToPromise = (request) => {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error || new Error("IndexedDB request failed."));
  });
};

const transactionToPromise = (transaction) => {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();

    transaction.onerror = () => {
      reject(transaction.error || new Error("IndexedDB transaction failed."));
    };

    transaction.onabort = () => {
      reject(
        transaction.error || new Error("IndexedDB transaction was aborted."),
      );
    };
  });
};

const emitFileEvent = (operation, fileId, record = null) => {
  document.dispatchEvent(
    new CustomEvent("proofpath:files-updated", {
      detail: {
        operation,
        fileId,
        record,
      },
    }),
  );
};

export const openDatabase = () => {
  if (!("indexedDB" in window)) {
    return Promise.reject(
      new Error("IndexedDB is not supported in this browser."),
    );
  }

  if (databasePromise) {
    return databasePromise;
  }

  databasePromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      let fileStore;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        fileStore = db.createObjectStore(STORE_NAME, {
          keyPath: "id",
        });
      } else {
        fileStore = event.target.transaction.objectStore(STORE_NAME);
      }

      if (!fileStore.indexNames.contains("ownerId")) {
        fileStore.createIndex("ownerId", "ownerId", {
          unique: false,
        });
      }

      if (!fileStore.indexNames.contains("category")) {
        fileStore.createIndex("category", "category", {
          unique: false,
        });
      }

      if (!fileStore.indexNames.contains("createdAt")) {
        fileStore.createIndex("createdAt", "createdAt", {
          unique: false,
        });
      }
    };

    request.onsuccess = () => {
      const db = request.result;

      db.onversionchange = () => {
        db.close();
        databasePromise = null;
      };

      resolve(db);
    };

    request.onerror = () => {
      databasePromise = null;

      reject(request.error || new Error("Unable to open ProofPath database."));
    };

    request.onblocked = () => {
      console.warn(
        "ProofPath database upgrade is blocked by another open connection.",
      );
    };
  });

  return databasePromise;
};

export const saveFile = async ({
  file,
  category,
  ownerId = null,
  metadata = {},
}) => {
  if (!(file instanceof Blob)) {
    throw new TypeError("A valid File or Blob is required.");
  }

  if (typeof category !== "string" || !category.trim()) {
    throw new TypeError("A valid file category is required.");
  }

  const db = await openDatabase();

  const id = generateId();
  const now = new Date().toISOString();

  const record = {
    ...metadata,
    id,
    name: file.name || metadata.name || "Untitled document",
    type: file.type || "application/octet-stream",
    size: file.size,
    category: category.trim(),
    ownerId,
    blob: file,
    createdAt: now,
    updatedAt: now,
  };

  const transaction = db.transaction(STORE_NAME, "readwrite");
  const completion = transactionToPromise(transaction);

  const request = transaction.objectStore(STORE_NAME).add(record);

  try {
    await Promise.all([requestToPromise(request), completion]);

    emitFileEvent("save", id, {
      id,
      name: record.name,
      type: record.type,
      size: record.size,
      category: record.category,
      ownerId: record.ownerId,
      createdAt: record.createdAt,
    });

    return {
      id,
      name: record.name,
      type: record.type,
      size: record.size,
      category: record.category,
      ownerId: record.ownerId,
      createdAt: record.createdAt,
    };
  } catch (error) {
    if (error.name === "QuotaExceededError") {
      throw new Error(
        "Browser storage quota exceeded. Free up some storage and try again.",
      );
    }

    throw error;
  }
};

export const getFile = async (fileId) => {
  if (!fileId) {
    throw new TypeError("A file ID is required.");
  }

  const db = await openDatabase();

  const transaction = db.transaction(STORE_NAME, "readonly");
  const completion = transactionToPromise(transaction);

  const request = transaction.objectStore(STORE_NAME).get(fileId);

  const [record] = await Promise.all([requestToPromise(request), completion]);

  return record || null;
};

export const getFiles = async ({ ownerId, category } = {}) => {
  const db = await openDatabase();

  const transaction = db.transaction(STORE_NAME, "readonly");
  const completion = transactionToPromise(transaction);

  const store = transaction.objectStore(STORE_NAME);

  let request;

  if (ownerId !== undefined && ownerId !== null) {
    request = store.index("ownerId").getAll(ownerId);
  } else if (category) {
    request = store.index("category").getAll(category);
  } else {
    request = store.getAll();
  }

  const [records] = await Promise.all([requestToPromise(request), completion]);

  return records
    .filter((record) => {
      const matchesOwner =
        ownerId === undefined || ownerId === null || record.ownerId === ownerId;

      const matchesCategory = !category || record.category === category;

      return matchesOwner && matchesCategory;
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(({ blob, ...metadata }) => metadata);
};

export const deleteFile = async (fileId) => {
  if (!fileId) {
    throw new TypeError("A file ID is required.");
  }

  const db = await openDatabase();

  const transaction = db.transaction(STORE_NAME, "readwrite");
  const completion = transactionToPromise(transaction);

  const request = transaction.objectStore(STORE_NAME).delete(fileId);

  await Promise.all([requestToPromise(request), completion]);

  revokeFileURL(fileId);

  emitFileEvent("delete", fileId);

  return true;
};

export const createFileURL = async (fileId) => {
  if (!fileId) {
    throw new TypeError("A file ID is required.");
  }

  const existingURL = objectURLs.get(fileId);

  if (existingURL) {
    return existingURL;
  }

  const record = await getFile(fileId);

  if (!record) {
    throw new Error("Requested file was not found.");
  }

  const url = URL.createObjectURL(record.blob);

  objectURLs.set(fileId, url);

  return url;
};

export const revokeFileURL = (fileId) => {
  const url = objectURLs.get(fileId);

  if (!url) return false;

  URL.revokeObjectURL(url);
  objectURLs.delete(fileId);

  return true;
};

export const revokeAllFileURLs = () => {
  objectURLs.forEach((url) => {
    URL.revokeObjectURL(url);
  });

  objectURLs.clear();
};

export const getStorageEstimate = async () => {
  if (!navigator.storage?.estimate) {
    return null;
  }

  try {
    const estimate = await navigator.storage.estimate();

    return {
      usage: estimate.usage ?? 0,
      quota: estimate.quota ?? 0,
      usageInMB: Number(((estimate.usage ?? 0) / (1024 * 1024)).toFixed(2)),
      quotaInMB: Number(((estimate.quota ?? 0) / (1024 * 1024)).toFixed(2)),
    };
  } catch (error) {
    console.error("Unable to estimate browser storage:", error);
    return null;
  }
};

export const closeDatabase = async () => {
  if (!databasePromise) return;

  try {
    const db = await databasePromise;
    db.close();
  } finally {
    databasePromise = null;
    revokeAllFileURLs();
  }
};
