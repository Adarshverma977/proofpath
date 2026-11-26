import { getItem, setItem, STORAGE_KEYS } from "../storage/localStorage.js";
import { getCurrentUser } from "../auth/sessionService.js";

import {
  isRequired,
  hasMaxLength,
  isNonNegativeNumber,
  isValidDate,
  isValidDateRange,
} from "../utils/validators.js";

const EXPIRING_SOON_DAYS = 30;

const PRODUCT_CATEGORIES = Object.freeze([
  "Electronics",
  "Home Appliances",
  "Mobile & Accessories",
  "Computers & Laptops",
  "Fashion",
  "Furniture",
  "Vehicles",
  "Other",
]);

export class ProductValidationError extends Error {
  constructor(errors) {
    super("Product validation failed.");
    this.name = "ProductValidationError";
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

const getTodayDate = () => {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getDaysDifference = (startDate, endDate) => {
  const [startYear, startMonth, startDay] = startDate.split("-").map(Number);
  const [endYear, endMonth, endDay] = endDate.split("-").map(Number);

  const start = Date.UTC(startYear, startMonth - 1, startDay);
  const end = Date.UTC(endYear, endMonth - 1, endDay);

  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
};

const normalizeString = (value) => {
  return typeof value === "string" ? value.trim() : "";
};

const normalizeProductData = (data) => {
  return {
    name: normalizeString(data.name),
    brand: normalizeString(data.brand),
    model: normalizeString(data.model),
    category: normalizeString(data.category),
    serialNumber: normalizeString(data.serialNumber),
    purchaseDate: normalizeString(data.purchaseDate),
    purchasePrice:
      data.purchasePrice === "" ||
      data.purchasePrice === null ||
      data.purchasePrice === undefined
        ? ""
        : Number(data.purchasePrice),
    warrantyStartDate: normalizeString(data.warrantyStartDate),
    warrantyEndDate: normalizeString(data.warrantyEndDate),
    description: normalizeString(data.description),
    imageId: normalizeString(data.imageId) || null,
  };
};

const getAuthenticatedUser = () => {
  const user = getCurrentUser();

  if (!user?.id) {
    throw new Error("You must be logged in to manage products.");
  }

  return user;
};

const getStoredProducts = () => {
  const products = getItem(STORAGE_KEYS.PRODUCTS, []);

  if (!Array.isArray(products)) {
    return [];
  }

  return products;
};

const saveProducts = (products) => {
  const saved = setItem(STORAGE_KEYS.PRODUCTS, products);

  if (!saved) {
    throw new Error("Unable to save products. Please try again.");
  }

  return products;
};

const getUserProducts = (userId) => {
  return getStoredProducts().filter((product) => product.userId === userId);
};

const hasDuplicateSerialNumber = (
  serialNumber,
  userId,
  excludeProductId = null,
) => {
  if (!serialNumber) {
    return false;
  }

  const normalizedSerial = serialNumber.toLowerCase();

  return getUserProducts(userId).some(
    (product) =>
      product.serialNumber?.toLowerCase() === normalizedSerial &&
      product.id !== excludeProductId,
  );
};

export const validateProduct = (data, userId, excludeProductId = null) => {
  const errors = {};

  if (!isRequired(data.name)) {
    errors.name = "Product name is required.";
  } else if (!hasMaxLength(data.name, 100)) {
    errors.name = "Product name cannot exceed 100 characters.";
  }

  if (!isRequired(data.brand)) {
    errors.brand = "Brand is required.";
  } else if (!hasMaxLength(data.brand, 80)) {
    errors.brand = "Brand cannot exceed 80 characters.";
  }

  if (!isRequired(data.model)) {
    errors.model = "Model is required.";
  } else if (!hasMaxLength(data.model, 80)) {
    errors.model = "Model cannot exceed 80 characters.";
  }

  if (!isRequired(data.category)) {
    errors.category = "Category is required.";
  } else if (!PRODUCT_CATEGORIES.includes(data.category)) {
    errors.category = "Please select a valid product category.";
  }

  if (!hasMaxLength(data.serialNumber, 100)) {
    errors.serialNumber = "Serial number cannot exceed 100 characters.";
  } else if (
    hasDuplicateSerialNumber(
      normalizeString(data.serialNumber),
      userId,
      excludeProductId,
    )
  ) {
    errors.serialNumber = "This serial number already exists.";
  }

  if (!isRequired(data.purchaseDate)) {
    errors.purchaseDate = "Purchase date is required.";
  } else if (!isValidDate(data.purchaseDate)) {
    errors.purchaseDate = "Please enter a valid purchase date.";
  } else if (data.purchaseDate > getTodayDate()) {
    errors.purchaseDate = "Purchase date cannot be in the future.";
  }

  if (!isRequired(data.purchasePrice)) {
    errors.purchasePrice = "Purchase price is required.";
  } else if (!isNonNegativeNumber(data.purchasePrice)) {
    errors.purchasePrice = "Purchase price cannot be negative.";
  }

  if (data.warrantyStartDate && !isValidDate(data.warrantyStartDate)) {
    errors.warrantyStartDate = "Please enter a valid warranty start date.";
  }

  if (data.warrantyEndDate && !isValidDate(data.warrantyEndDate)) {
    errors.warrantyEndDate = "Please enter a valid warranty end date.";
  }

  if (Boolean(data.warrantyStartDate) !== Boolean(data.warrantyEndDate)) {
    errors.warrantyEndDate =
      "Both warranty start and end dates are required together.";
  } else if (
    data.warrantyStartDate &&
    data.warrantyEndDate &&
    !isValidDateRange(data.warrantyStartDate, data.warrantyEndDate)
  ) {
    errors.warrantyEndDate =
      "Warranty end date must be after or equal to its start date.";
  }

  if (
    data.warrantyStartDate &&
    data.purchaseDate &&
    isValidDate(data.warrantyStartDate) &&
    data.warrantyStartDate < data.purchaseDate
  ) {
    errors.warrantyStartDate =
      "Warranty start date cannot be before purchase date.";
  }

  if (!hasMaxLength(data.description, 1000)) {
    errors.description = "Description cannot exceed 1000 characters.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const getWarrantyStatus = (product) => {
  if (!product?.warrantyEndDate) {
    return "unknown";
  }

  const today = getTodayDate();

  if (product.warrantyStartDate && today < product.warrantyStartDate) {
    return "upcoming";
  }

  if (product.warrantyEndDate < today) {
    return "expired";
  }

  const remainingDays = getDaysDifference(today, product.warrantyEndDate);

  if (remainingDays <= EXPIRING_SOON_DAYS) {
    return "expiring";
  }

  return "active";
};

export const getWarrantyDaysRemaining = (product) => {
  if (!product?.warrantyEndDate || !isValidDate(product.warrantyEndDate)) {
    return null;
  }

  return getDaysDifference(getTodayDate(), product.warrantyEndDate);
};

export const addProduct = (data) => {
  const user = getAuthenticatedUser();

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new TypeError("Product data must be a valid object.");
  }

  const productData = normalizeProductData(data);

  const validation = validateProduct(productData, user.id);

  if (!validation.isValid) {
    throw new ProductValidationError(validation.errors);
  }

  const now = new Date().toISOString();

  const product = {
    id: generateId(),
    userId: user.id,
    ...productData,
    createdAt: now,
    updatedAt: now,
  };

  const products = getStoredProducts();

  products.push(product);

  saveProducts(products);

  return product;
};

export const getProducts = () => {
  const user = getAuthenticatedUser();

  return getUserProducts(user.id).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );
};

export const getProductById = (productId) => {
  if (!isRequired(productId)) {
    return null;
  }

  const user = getAuthenticatedUser();

  return (
    getUserProducts(user.id).find((product) => product.id === productId) || null
  );
};

export const updateProduct = (productId, updates) => {
  if (!isRequired(productId)) {
    throw new TypeError("A valid product ID is required.");
  }

  if (!updates || typeof updates !== "object" || Array.isArray(updates)) {
    throw new TypeError("Product updates must be a valid object.");
  }

  const user = getAuthenticatedUser();
  const products = getStoredProducts();

  const actualIndex = products.findIndex(
    (product) => product.id === productId && product.userId === user.id,
  );

  if (actualIndex === -1) {
    throw new Error("Product not found.");
  }

  const existingProduct = products[actualIndex];

  const allowedFields = [
    "name",
    "brand",
    "model",
    "category",
    "serialNumber",
    "purchaseDate",
    "purchasePrice",
    "warrantyStartDate",
    "warrantyEndDate",
    "description",
    "imageId",
  ];

  const safeUpdates = {};

  allowedFields.forEach((field) => {
    if (Object.hasOwn(updates, field)) {
      safeUpdates[field] = updates[field];
    }
  });

  const productData = normalizeProductData({
    ...existingProduct,
    ...safeUpdates,
  });

  const validation = validateProduct(productData, user.id, productId);

  if (!validation.isValid) {
    throw new ProductValidationError(validation.errors);
  }

  const updatedProduct = {
    ...existingProduct,
    ...productData,
    updatedAt: new Date().toISOString(),
  };

  products[actualIndex] = updatedProduct;

  saveProducts(products);

  return updatedProduct;
};

export const deleteProduct = (productId) => {
  if (!isRequired(productId)) {
    throw new TypeError("A valid product ID is required.");
  }

  const user = getAuthenticatedUser();
  const products = getStoredProducts();

  const productIndex = products.findIndex(
    (product) => product.id === productId && product.userId === user.id,
  );

  if (productIndex === -1) {
    return false;
  }

  products.splice(productIndex, 1);

  saveProducts(products);

  return true;
};

export const searchProducts = (query) => {
  const products = getProducts();

  const searchTerm = normalizeString(query).toLowerCase();

  if (!searchTerm) {
    return products;
  }

  return products.filter((product) => {
    const searchableFields = [
      product.name,
      product.brand,
      product.model,
      product.category,
      product.serialNumber,
      product.description,
    ];

    return searchableFields.some((value) =>
      value?.toLowerCase().includes(searchTerm),
    );
  });
};

export const filterProducts = ({
  category = "all",
  warrantyStatus = "all",
} = {}) => {
  let products = getProducts();

  if (category !== "all") {
    products = products.filter((product) => product.category === category);
  }

  if (warrantyStatus !== "all") {
    products = products.filter(
      (product) => getWarrantyStatus(product) === warrantyStatus,
    );
  }

  return products;
};

export const getProductStats = () => {
  const products = getProducts();

  const stats = {
    totalProducts: products.length,
    activeWarranties: 0,
    expiringSoon: 0,
    expiredWarranties: 0,
    upcomingWarranties: 0,
    unknownWarranties: 0,
    totalPurchaseValue: 0,
    categoryDistribution: {},
  };

  products.forEach((product) => {
    const warrantyStatus = getWarrantyStatus(product);

    if (warrantyStatus === "active") {
      stats.activeWarranties += 1;
    } else if (warrantyStatus === "expiring") {
      stats.expiringSoon += 1;
    } else if (warrantyStatus === "expired") {
      stats.expiredWarranties += 1;
    } else if (warrantyStatus === "upcoming") {
      stats.upcomingWarranties += 1;
    } else {
      stats.unknownWarranties += 1;
    }

    stats.totalPurchaseValue += Number(product.purchasePrice) || 0;

    stats.categoryDistribution[product.category] =
      (stats.categoryDistribution[product.category] || 0) + 1;
  });

  return stats;
};

export const getProductCategories = () => {
  return [...PRODUCT_CATEGORIES];
};
