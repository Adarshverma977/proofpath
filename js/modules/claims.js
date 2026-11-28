import { getItem, setItem, STORAGE_KEYS } from "../storage/localStorage.js";
import { getCurrentUser } from "../auth/sessionService.js";
import { getProductById } from "./products.js";

export const CLAIM_STATUSES = Object.freeze({
  SUBMITTED: "submitted",
  UNDER_REVIEW: "under-review",
  APPROVED: "approved",
  REJECTED: "rejected",
  RESOLVED: "resolved",
});

export const CLAIM_STATUS_LABELS = Object.freeze({
  [CLAIM_STATUSES.SUBMITTED]: "Submitted",
  [CLAIM_STATUSES.UNDER_REVIEW]: "Under Review",
  [CLAIM_STATUSES.APPROVED]: "Approved",
  [CLAIM_STATUSES.REJECTED]: "Rejected",
  [CLAIM_STATUSES.RESOLVED]: "Resolved",
});

export const CLAIM_TYPES = Object.freeze([
  "Product Defect",
  "Manufacturing Defect",
  "Hardware Failure",
  "Software Issue",
  "Physical Damage",
  "Performance Issue",
  "Other",
]);

const CLAIM_TRANSITIONS = Object.freeze({
  [CLAIM_STATUSES.SUBMITTED]: [CLAIM_STATUSES.UNDER_REVIEW],
  [CLAIM_STATUSES.UNDER_REVIEW]: [
    CLAIM_STATUSES.APPROVED,
    CLAIM_STATUSES.REJECTED,
  ],
  [CLAIM_STATUSES.APPROVED]: [CLAIM_STATUSES.RESOLVED],
  [CLAIM_STATUSES.REJECTED]: [],
  [CLAIM_STATUSES.RESOLVED]: [],
});

const CLAIM_STORAGE_KEY = STORAGE_KEYS.CLAIMS;
const MAX_DOCUMENTS = 10;
const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 2000;

export class ClaimValidationError extends Error {
  constructor(errors) {
    super("Claim validation failed.");
    this.name = "ClaimValidationError";
    this.errors = errors;
  }
}

const generateId = () => {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  const bytes = crypto.getRandomValues(new Uint8Array(16));

  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
};

const normalizeString = (value) => {
  return typeof value === "string" ? value.trim() : "";
};

const generateClaimNumber = () => {
  const year = new Date().getFullYear();
  const existingNumbers = new Set(
    getStoredClaims().map((claim) => claim.claimNumber),
  );

  let claimNumber;

  do {
    const randomPart = crypto
      .getRandomValues(new Uint32Array(2))
      .reduce((result, value) => result + value.toString(36), "")
      .toUpperCase()
      .slice(0, 10);

    claimNumber = `PP-${year}-${randomPart}`;
  } while (existingNumbers.has(claimNumber));

  return claimNumber;
};

const getAuthenticatedUser = () => {
  const user = getCurrentUser();

  if (!user?.id) {
    throw new Error("You must be logged in to manage claims.");
  }

  return user;
};

const getStoredClaims = () => {
  const claims = getItem(CLAIM_STORAGE_KEY, []);

  return Array.isArray(claims) ? claims : [];
};

const saveClaims = (claims) => {
  const saved = setItem(CLAIM_STORAGE_KEY, claims);

  if (!saved) {
    throw new Error("Unable to save claims. Please try again.");
  }

  return claims;
};

const getUserClaims = (userId) => {
  return getStoredClaims().filter((claim) => claim.userId === userId);
};

const getTodayDate = () => {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const isValidDate = (value) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};

const createTimelineEntry = (status, note = "") => {
  return {
    id: generateId(),
    status,
    label: CLAIM_STATUS_LABELS[status],
    note: normalizeString(note),
    createdAt: new Date().toISOString(),
  };
};

const dispatchClaimsUpdated = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("proofpath:claims-updated"));
  }
};

const normalizeDocumentIds = (documentIds) => {
  if (!Array.isArray(documentIds)) {
    return [];
  }

  return [
    ...new Set(
      documentIds
        .filter((id) => typeof id === "string")
        .map((id) => id.trim())
        .filter(Boolean),
    ),
  ];
};

const normalizeClaimData = (data) => {
  const requestedAmount =
    data.requestedAmount === "" ||
    data.requestedAmount === null ||
    data.requestedAmount === undefined
      ? null
      : Number(data.requestedAmount);

  return {
    productId: normalizeString(data.productId),
    type: normalizeString(data.type),
    title: normalizeString(data.title),
    description: normalizeString(data.description),
    incidentDate: normalizeString(data.incidentDate),
    requestedAmount,
    documentIds: normalizeDocumentIds(data.documentIds),
  };
};

export const validateClaim = (data) => {
  const errors = {};

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return {
      isValid: false,
      errors: {
        claim: "Please provide valid claim information.",
      },
    };
  }

  if (!normalizeString(data.productId)) {
    errors.productId = "Please select a product.";
  }

  if (!normalizeString(data.type)) {
    errors.type = "Please select a claim type.";
  } else if (!CLAIM_TYPES.includes(data.type)) {
    errors.type = "Please select a valid claim type.";
  }

  if (!normalizeString(data.title)) {
    errors.title = "Claim title is required.";
  } else if (data.title.trim().length > MAX_TITLE_LENGTH) {
    errors.title = "Claim title cannot exceed 100 characters.";
  }

  if (!normalizeString(data.description)) {
    errors.description = "Claim description is required.";
  } else if (data.description.trim().length > MAX_DESCRIPTION_LENGTH) {
    errors.description = "Claim description cannot exceed 2000 characters.";
  }

  if (!data.incidentDate) {
    errors.incidentDate = "Incident date is required.";
  } else if (!isValidDate(data.incidentDate)) {
    errors.incidentDate = "Please enter a valid incident date.";
  } else if (data.incidentDate > getTodayDate()) {
    errors.incidentDate = "Incident date cannot be in the future.";
  }

  if (
    data.requestedAmount !== null &&
    data.requestedAmount !== undefined &&
    data.requestedAmount !== "" &&
    (!Number.isFinite(Number(data.requestedAmount)) ||
      Number(data.requestedAmount) < 0)
  ) {
    errors.requestedAmount =
      "Requested amount must be a valid non-negative number.";
  }

  if (data.documentIds !== undefined && !Array.isArray(data.documentIds)) {
    errors.documentIds = "Invalid supporting document references.";
  } else if (
    Array.isArray(data.documentIds) &&
    normalizeDocumentIds(data.documentIds).length !== data.documentIds.length
  ) {
    errors.documentIds = "Supporting document references are invalid.";
  } else if (
    Array.isArray(data.documentIds) &&
    data.documentIds.length > MAX_DOCUMENTS
  ) {
    errors.documentIds = `You can attach a maximum of ${MAX_DOCUMENTS} documents.`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const getClaims = ({
  status = "all",
  search = "",
  type = "all",
  sort = "recent",
} = {}) => {
  const user = getAuthenticatedUser();
  const normalizedSearch = normalizeString(search).toLowerCase();

  let claims = getUserClaims(user.id);

  if (status !== "all") {
    claims = claims.filter((claim) => claim.status === status);
  }

  if (type !== "all") {
    claims = claims.filter((claim) => claim.type === type);
  }

  if (normalizedSearch) {
    claims = claims.filter((claim) => {
      const searchableFields = [
        claim.claimNumber,
        claim.title,
        claim.description,
        claim.type,
        claim.productName,
        claim.productBrand,
        claim.productModel,
      ];

      return searchableFields.some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(normalizedSearch),
      );
    });
  }

  const sortFunctions = {
    recent: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),

    oldest: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),

    "name-asc": (a, b) => a.title.localeCompare(b.title),

    "name-desc": (a, b) => b.title.localeCompare(a.title),

    "updated-recent": (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
  };

  claims.sort(sortFunctions[sort] || sortFunctions.recent);

  return claims;
};

export const getClaimById = (claimId) => {
  if (!isValidIdentifier(claimId)) {
    return null;
  }

  const user = getAuthenticatedUser();

  return getUserClaims(user.id).find((claim) => claim.id === claimId) || null;
};

export const getClaimByNumber = (claimNumber) => {
  const normalizedNumber = normalizeString(claimNumber);

  if (!normalizedNumber) {
    return null;
  }

  const user = getAuthenticatedUser();

  return (
    getUserClaims(user.id).find(
      (claim) => claim.claimNumber === normalizedNumber,
    ) || null
  );
};

const isValidIdentifier = (value) => {
  return typeof value === "string" && value.trim().length > 0;
};

export const addClaim = (data) => {
  const user = getAuthenticatedUser();

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new TypeError("Claim data must be a valid object.");
  }

  const claimData = normalizeClaimData(data);
  const validation = validateClaim(claimData);

  if (!validation.isValid) {
    throw new ClaimValidationError(validation.errors);
  }

  const product = getProductById(claimData.productId);

  if (!product) {
    throw new Error("Selected product was not found.");
  }

  const now = new Date().toISOString();

  const claim = {
    id: generateId(),
    claimNumber: generateClaimNumber(),
    userId: user.id,

    productId: product.id,
    productName: product.name,
    productBrand: product.brand,
    productModel: product.model,
    productSerialNumber: product.serialNumber || "",

    ...claimData,

    status: CLAIM_STATUSES.SUBMITTED,

    timeline: [
      createTimelineEntry(
        CLAIM_STATUSES.SUBMITTED,
        "Claim submitted successfully.",
      ),
    ],

    resolutionNote: "",
    resolvedAt: null,

    createdAt: now,
    updatedAt: now,
  };

  const claims = getStoredClaims();

  claims.push(claim);

  saveClaims(claims);
  dispatchClaimsUpdated();

  return claim;
};

export const updateClaim = (claimId, updates) => {
  if (!isValidIdentifier(claimId)) {
    throw new TypeError("A valid claim ID is required.");
  }

  if (!updates || typeof updates !== "object" || Array.isArray(updates)) {
    throw new TypeError("Claim updates must be a valid object.");
  }

  const user = getAuthenticatedUser();
  const claims = getStoredClaims();

  const claimIndex = claims.findIndex(
    (claim) => claim.id === claimId && claim.userId === user.id,
  );

  if (claimIndex === -1) {
    throw new Error("Claim not found.");
  }

  const existingClaim = claims[claimIndex];

  if (existingClaim.status !== CLAIM_STATUSES.SUBMITTED) {
    throw new Error("Only submitted claims can be edited.");
  }

  const allowedFields = [
    "type",
    "title",
    "description",
    "incidentDate",
    "requestedAmount",
    "documentIds",
  ];

  const safeUpdates = {};

  allowedFields.forEach((field) => {
    if (Object.hasOwn(updates, field)) {
      safeUpdates[field] = updates[field];
    }
  });

  const updatedData = normalizeClaimData({
    ...existingClaim,
    ...safeUpdates,
  });

  const validation = validateClaim({
    ...updatedData,
    productId: existingClaim.productId,
  });

  if (!validation.isValid) {
    throw new ClaimValidationError(validation.errors);
  }

  const updatedClaim = {
    ...existingClaim,
    ...updatedData,
    updatedAt: new Date().toISOString(),
  };

  claims[claimIndex] = updatedClaim;

  saveClaims(claims);
  dispatchClaimsUpdated();

  return updatedClaim;
};

export const updateClaimStatus = (claimId, newStatus, note = "") => {
  if (!isValidIdentifier(claimId)) {
    throw new TypeError("A valid claim ID is required.");
  }

  if (!Object.values(CLAIM_STATUSES).includes(newStatus)) {
    throw new TypeError("Invalid claim status.");
  }

  const user = getAuthenticatedUser();
  const claims = getStoredClaims();

  const claimIndex = claims.findIndex(
    (claim) => claim.id === claimId && claim.userId === user.id,
  );

  if (claimIndex === -1) {
    throw new Error("Claim not found.");
  }

  const existingClaim = claims[claimIndex];

  if (!CLAIM_TRANSITIONS[existingClaim.status]?.includes(newStatus)) {
    throw new Error(
      `Cannot change claim status from ${existingClaim.status} to ${newStatus}.`,
    );
  }

  const now = new Date().toISOString();
  const normalizedNote = normalizeString(note);

  const updatedClaim = {
    ...existingClaim,

    status: newStatus,

    timeline: [
      ...(Array.isArray(existingClaim.timeline) ? existingClaim.timeline : []),
      createTimelineEntry(newStatus, normalizedNote),
    ],

    updatedAt: now,

    resolvedAt:
      newStatus === CLAIM_STATUSES.RESOLVED ? now : existingClaim.resolvedAt,

    resolutionNote:
      newStatus === CLAIM_STATUSES.REJECTED ||
      newStatus === CLAIM_STATUSES.RESOLVED
        ? normalizedNote
        : existingClaim.resolutionNote,
  };

  claims[claimIndex] = updatedClaim;

  saveClaims(claims);
  dispatchClaimsUpdated();

  return updatedClaim;
};

export const deleteClaim = (claimId) => {
  if (!isValidIdentifier(claimId)) {
    throw new TypeError("A valid claim ID is required.");
  }

  const user = getAuthenticatedUser();
  const claims = getStoredClaims();

  const claimIndex = claims.findIndex(
    (claim) => claim.id === claimId && claim.userId === user.id,
  );

  if (claimIndex === -1) {
    return false;
  }

  if (claims[claimIndex].status !== CLAIM_STATUSES.SUBMITTED) {
    throw new Error("Only submitted claims can be deleted.");
  }

  claims.splice(claimIndex, 1);

  saveClaims(claims);
  dispatchClaimsUpdated();

  return true;
};

export const getClaimStats = () => {
  const claims = getClaims();

  const stats = {
    total: claims.length,
    submitted: 0,
    underReview: 0,
    approved: 0,
    rejected: 0,
    resolved: 0,
  };

  claims.forEach((claim) => {
    switch (claim.status) {
      case CLAIM_STATUSES.SUBMITTED:
        stats.submitted++;
        break;

      case CLAIM_STATUSES.UNDER_REVIEW:
        stats.underReview++;
        break;

      case CLAIM_STATUSES.APPROVED:
        stats.approved++;
        break;

      case CLAIM_STATUSES.REJECTED:
        stats.rejected++;
        break;

      case CLAIM_STATUSES.RESOLVED:
        stats.resolved++;
        break;

      default:
        break;
    }
  });

  return stats;
};

export const getClaimTypes = () => {
  return [...CLAIM_TYPES];
};

export const getClaimStatuses = () => {
  return Object.values(CLAIM_STATUSES);
};

export const getClaimStatusLabel = (status) => {
  return CLAIM_STATUS_LABELS[status] || "Unknown";
};

export const canTransitionClaimStatus = (currentStatus, nextStatus) => {
  return CLAIM_TRANSITIONS[currentStatus]?.includes(nextStatus) || false;
};
