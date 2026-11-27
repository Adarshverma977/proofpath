import { getCurrentUser } from "../auth/sessionService.js";

import {
  getFiles,
  getFile,
  deleteFile,
  createFileURL,
  revokeFileURL,
} from "../storage/indexedDB.js";

export const DOCUMENT_CATEGORIES = {
  INVOICE: "invoice",
  WARRANTY_CERTIFICATE: "warranty-certificate",
  REPAIR_RECEIPT: "repair-receipt",
};

export const DOCUMENT_CATEGORY_LABELS = {
  invoice: "Invoices",
  "warranty-certificate": "Warranty Certificates",
  "repair-receipt": "Repair Receipts",
};

const SUPPORTED_CATEGORIES = Object.values(DOCUMENT_CATEGORIES);

const getAuthenticatedUser = () => {
  const user = getCurrentUser();

  if (!user?.id) {
    throw new Error("You must be logged in to access documents.");
  }

  return user;
};

const normalizeText = (value = "") => {
  return String(value).trim().toLowerCase();
};


const getDocumentName = (document) => {
  return (
    document.name ||
    document.fileName ||
    document.metadata?.fileName ||
    document.metadata?.name ||
    "Untitled document"
  );
};

const getDocumentProductName = (document) => {
  return document.productName || document.metadata?.productName || "";
};


const isSupportedDocument = (document) => {
  return SUPPORTED_CATEGORIES.includes(document.category);
};

const isOwnedByUser = (document, userId) => {
  return document?.ownerId === userId;
};

export const getDocuments = async ({ category = "all", search = "" } = {}) => {
  const user = getAuthenticatedUser();

  const files = await getFiles({
    ownerId: user.id,
  });

  const normalizedSearch = normalizeText(search);

  return files
    .filter(isSupportedDocument)
    .filter((document) => {
      return category === "all" || document.category === category;
    })
    .filter((document) => {
      if (!normalizedSearch) {
        return true;
      }

      const searchableText = [
        getDocumentName(document),
        getDocumentProductName(document),
        document.category,
      ]
        .map(normalizeText)
        .join(" ");

      return searchableText.includes(normalizedSearch);
    })
    .sort((first, second) => {
      return new Date(second.createdAt) - new Date(first.createdAt);
    })
    .map((document) => ({
      ...document,
      displayName: getDocumentName(document),
      productName: getDocumentProductName(document),
      categoryLabel: DOCUMENT_CATEGORY_LABELS[document.category] || "Other",
    }));
};

export const getDocumentById = async (documentId) => {
  if (!documentId) {
    throw new Error("Document ID is required.");
  }

  const user = getAuthenticatedUser();
  const document = await getFile(documentId);

  if (!document || !isOwnedByUser(document, user.id)) {
    return null;
  }

  if (!isSupportedDocument(document)) {
    return null;
  }

  return {
    ...document,
    displayName: getDocumentName(document),
    productName: getDocumentProductName(document),
    categoryLabel: DOCUMENT_CATEGORY_LABELS[document.category] || "Other",
  };
};

export const getDocumentPreviewURL = async (documentId) => {
  const document = await getDocumentById(documentId);

  if (!document) {
    throw new Error("Document not found or access denied.");
  }

  return createFileURL(documentId);
};

export const revokeDocumentPreviewURL = (documentId) => {
  if (!documentId) {
    return;
  }

  revokeFileURL(documentId);
};

export const deleteDocument = async (documentId) => {
  if (!documentId) {
    throw new Error("Document ID is required.");
  }

  const document = await getDocumentById(documentId);

  if (!document) {
    throw new Error("Document not found or access denied.");
  }

  revokeFileURL(documentId);

  await deleteFile(documentId);

  return {
    success: true,
    documentId,
  };
};

export const getDocumentCategoryCounts = async () => {
  const documents = await getDocuments();

  const counts = {
    all: documents.length,
    invoice: 0,
    "warranty-certificate": 0,
    "repair-receipt": 0,
  };

  documents.forEach((document) => {
    counts[document.category]++;
  });

  return counts;
};
