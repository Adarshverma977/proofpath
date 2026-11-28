import {
  getProducts,
  getWarrantyStatus,
  getWarrantyDaysRemaining,
} from "./products.js";

export const WARRANTY_STATUSES = {
  ACTIVE: "active",
  EXPIRING: "expiring",
  EXPIRED: "expired",
  UPCOMING: "upcoming",
  UNKNOWN: "unknown",
};

export const WARRANTY_STATUS_LABELS = {
  active: "Active",
  expiring: "Expiring soon",
  expired: "Expired",
  upcoming: "Upcoming",
  unknown: "No warranty",
};

const parseDate = (value) => {
  if (!value || typeof value !== "string") {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  date.setHours(0, 0, 0, 0);

  return date;
};

const getToday = () => {
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  return today;
};

const getWarrantyProgress = (product) => {
  const startDate = parseDate(product.warrantyStartDate);
  const endDate = parseDate(product.warrantyEndDate);

  if (!startDate || !endDate || endDate <= startDate) {
    return 0;
  }

  const today = getToday();

  const totalDuration = endDate.getTime() - startDate.getTime();
  const elapsedDuration = today.getTime() - startDate.getTime();

  const progress = (elapsedDuration / totalDuration) * 100;

  return Math.min(100, Math.max(0, Math.round(progress)));
};

const getWarrantyDuration = (product) => {
  const startDate = parseDate(product.warrantyStartDate);
  const endDate = parseDate(product.warrantyEndDate);

  if (!startDate || !endDate || endDate < startDate) {
    return null;
  }

  const millisecondsPerDay = 24 * 60 * 60 * 1000;

  return (
    Math.ceil((endDate.getTime() - startDate.getTime()) / millisecondsPerDay) +
    1
  );
};

const normalizeWarranty = (product) => {
  const status = getWarrantyStatus(product);
  const daysRemaining = getWarrantyDaysRemaining(product);

  return {
    id: product.id,
    productId: product.id,

    productName: product.name || "Unnamed product",
    brand: product.brand || "",
    model: product.model || "",
    category: product.category || "Other",

    serialNumber: product.serialNumber || "",

    purchaseDate: product.purchaseDate || null,
    purchasePrice: product.purchasePrice ?? null,

    warrantyStartDate: product.warrantyStartDate || null,
    warrantyEndDate: product.warrantyEndDate || null,

    status,
    statusLabel: WARRANTY_STATUS_LABELS[status] || "Unknown",

    daysRemaining: Number.isFinite(daysRemaining) ? daysRemaining : null,

    progress: getWarrantyProgress(product),

    durationDays: getWarrantyDuration(product),

    imageId: product.imageId || null,

    createdAt: product.createdAt || null,
    updatedAt: product.updatedAt || null,
  };
};

export const getWarranties = ({
  status = "all",
  search = "",
  category = "all",
  sort = "expiring-first",
} = {}) => {
  const products = getProducts();

  const normalizedSearch = String(search).trim().toLowerCase();

  let warranties = products
    .map(normalizeWarranty)
    .filter((warranty) => warranty.status !== WARRANTY_STATUSES.UNKNOWN);

  if (status !== "all") {
    warranties = warranties.filter((warranty) => warranty.status === status);
  }

  if (category !== "all") {
    warranties = warranties.filter(
      (warranty) => warranty.category === category,
    );
  }

  if (normalizedSearch) {
    warranties = warranties.filter((warranty) => {
      const searchableFields = [
        warranty.productName,
        warranty.brand,
        warranty.model,
        warranty.category,
        warranty.serialNumber,
      ];

      return searchableFields.some((value) =>
        String(value).toLowerCase().includes(normalizedSearch),
      );
    });
  }

  const sortFunctions = {
    "expiring-first": (a, b) => {
      if (a.daysRemaining === null) return 1;
      if (b.daysRemaining === null) return -1;

      return a.daysRemaining - b.daysRemaining;
    },

    "expiring-last": (a, b) => {
      if (a.daysRemaining === null) return 1;
      if (b.daysRemaining === null) return -1;

      return b.daysRemaining - a.daysRemaining;
    },

    "name-asc": (a, b) => a.productName.localeCompare(b.productName),

    "name-desc": (a, b) => b.productName.localeCompare(a.productName),

    recent: (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),

    oldest: (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
  };

  warranties.sort(sortFunctions[sort] || sortFunctions["expiring-first"]);

  return warranties;
};

export const getWarrantyById = (productId) => {
  if (!productId) {
    return null;
  }

  const products = getProducts();

  const product = products.find((item) => item.id === productId);

  if (!product) {
    return null;
  }

  if (getWarrantyStatus(product) === WARRANTY_STATUSES.UNKNOWN) {
    return null;
  }

  return normalizeWarranty(product);
};

export const getWarrantyStats = () => {
  const products = getProducts();

  const stats = {
    total: 0,
    active: 0,
    expiring: 0,
    expired: 0,
    upcoming: 0,
    unknown: 0,
  };

  products.forEach((product) => {
    const status = getWarrantyStatus(product);

    stats.total++;

    if (Object.prototype.hasOwnProperty.call(stats, status)) {
      stats[status]++;
    }
  });

  stats.totalWithWarranty =
    stats.active + stats.expiring + stats.expired + stats.upcoming;

  return stats;
};

export const getWarrantyCategories = () => {
  const products = getProducts();

  return [
    ...new Set(
      products
        .filter(
          (product) => getWarrantyStatus(product) !== WARRANTY_STATUSES.UNKNOWN,
        )
        .map((product) => product.category || "Other"),
    ),
  ].sort((a, b) => a.localeCompare(b));
};

export const getExpiringWarranties = (days = 30) => {
  const threshold = Math.max(0, Number(days) || 0);

  return getWarranties()
    .filter(
      (warranty) =>
        warranty.daysRemaining !== null &&
        warranty.daysRemaining >= 0 &&
        warranty.daysRemaining <= threshold &&
        ["active", "expiring"].includes(warranty.status),
    )
    .sort((a, b) => a.daysRemaining - b.daysRemaining);
};
