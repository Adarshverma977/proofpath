import { renderSidebar, initializeSidebar } from "../components/sidebar.js";
import { renderHeader, initializeHeader } from "../components/header.js";

import {
  getProducts,
  getProductCategories,
  getWarrantyStatus,
  getWarrantyDaysRemaining,
  deleteProduct,
} from "../modules/products.js";

import { getCurrentUser } from "../auth/sessionService.js";

import {
  createFileURL,
  revokeFileURL,
  getFiles,
  deleteFile,
} from "../storage/indexedDB.js";

const icons = {
  package: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 8 9 5 9-5M3 8v9l9 5 9-5V8M12 13v9"/></svg>`,
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 5v14M5 12h14"/></svg>`,
  filter: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 7h16M7 12h10m-7 5h4"/><circle cx="8" cy="7" r="1"/><circle cx="15" cy="12" r="1"/></svg>`,
  calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></svg>`,
  shield: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/></svg>`,
  trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6"/></svg>`,
  arrow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>`,
  close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m18 6-12 12M6 6l12 12"/></svg>`,
  image: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>`,
};

const STATUS_LABELS = {
  active: "Active",
  expiring: "Expiring soon",
  expired: "Expired",
  upcoming: "Upcoming",
  unknown: "No warranty",
};

const escapeHTML = (value = "") => {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
};

const formatDate = (value) => {
  if (!value) return "Not available";

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatCurrency = (value) => {
  if (value === null || value === undefined || value === "") {
    return "Not available";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
};

const getWarrantyDescription = (product) => {
  const status = getWarrantyStatus(product);
  const remaining = getWarrantyDaysRemaining(product);

  if (status === "unknown") return "Warranty details not added";
  if (status === "upcoming") return "Warranty has not started";
  if (status === "expired") return "Warranty period has ended";

  if (remaining === 0) return "Expires today";
  if (remaining === 1) return "1 day remaining";

  return `${remaining} days remaining`;
};

const renderProductImage = (product) => {
  if (!product.imageId) {
    return `
      <div class="products-image-placeholder">
        ${icons.package}
        <span>No image available</span>
      </div>
    `;
  }

  return `
    <div
      class="products-image-placeholder"
      data-image-placeholder="${escapeHTML(product.id)}"
    >
      ${icons.image}
      <span>Loading image...</span>
    </div>
  `;
};

const renderProductCard = (product) => {
  const status = getWarrantyStatus(product);
  const statusLabel = STATUS_LABELS[status] || "Unknown";
  const warrantyDescription = getWarrantyDescription(product);

  return `
    <article class="products-card" data-product-id="${escapeHTML(product.id)}">

      <div class="products-card-image">
        ${renderProductImage(product)}

        <span class="products-status-badge is-${status}">
          <span class="products-status-dot"></span>
          ${statusLabel}
        </span>

        <button
          type="button"
          class="products-delete-button"
          data-delete-product="${escapeHTML(product.id)}"
          aria-label="Delete ${escapeHTML(product.name)}"
          title="Delete product"
        >
          ${icons.trash}
        </button>
      </div>

      <div class="products-card-body">

        <div class="products-card-category">
          ${escapeHTML(product.category)}
        </div>

        <h3>${escapeHTML(product.name)}</h3>

        <p class="products-card-model">
          ${escapeHTML(product.brand)} · ${escapeHTML(product.model)}
        </p>

        <div class="products-card-divider"></div>

        <div class="products-card-details">

          <div>
            <span>Purchase date</span>
            <strong>${formatDate(product.purchaseDate)}</strong>
          </div>

          <div>
            <span>Purchase price</span>
            <strong>${formatCurrency(product.purchasePrice)}</strong>
          </div>

        </div>

        <div class="products-card-warranty is-${status}">
          <span class="products-card-warranty-icon">
            ${icons.shield}
          </span>

          <div>
            <strong>${warrantyDescription}</strong>
            <small>
              ${
                product.warrantyEndDate
                  ? `Expires ${formatDate(product.warrantyEndDate)}`
                  : "Add warranty details when available"
              }
            </small>
          </div>
        </div>

        <div class="products-card-footer">
          <span class="products-card-serial">
            ${
              product.serialNumber
                ? `S/N: ${escapeHTML(product.serialNumber)}`
                : "Serial number not added"
            }
          </span>

          <a
            href="#/products/${encodeURIComponent(product.id)}"
            class="products-details-link"
            aria-label="View details for ${escapeHTML(product.name)}"
          >
            View details
            ${icons.arrow}
          </a>
        </div>

      </div>
    </article>
  `;
};

const renderEmptyState = (hasFilters) => {
  if (hasFilters) {
    return `
      <div class="products-empty-state">
        <span class="products-empty-icon">${icons.search}</span>
        <h3>No matching products found</h3>
        <p>Try adjusting your search or filters to find your products.</p>
        <button type="button" class="btn btn-secondary" id="clear-product-filters">
          Clear filters
        </button>
      </div>
    `;
  }

  return `
    <div class="products-empty-state">
      <span class="products-empty-icon">${icons.package}</span>
      <span class="products-eyebrow">YOUR DIGITAL VAULT</span>
      <h3>Your product collection starts here.</h3>
      <p>
        Add your first product to organize purchase details,
        warranty information and important documents.
      </p>
      <a href="#/products/new" class="btn btn-primary">
        ${icons.plus}
        Add your first product
      </a>
    </div>
  `;
};

const renderProductsContent = () => {
  return `
    <div class="products-page">

      <div class="products-breadcrumb">
        <a href="#/dashboard">Dashboard</a>
        <span>/</span>
        <span>My Products</span>
      </div>

      <section class="products-heading">
        <div>
          <span class="products-eyebrow">YOUR COLLECTION</span>
          <h1>My Products</h1>
          <p>
            Keep track of your purchases, warranties and ownership records.
          </p>
        </div>

        <a href="#/products/new" class="btn btn-primary">
          ${icons.plus}
          Add product
        </a>
      </section>

      <section class="products-toolbar">

        <div class="products-search">
          ${icons.search}
          <input
            type="search"
            id="products-search"
            placeholder="Search by name, brand, model or serial number..."
            aria-label="Search products"
          />
          <kbd>Search</kbd>
        </div>

        <div class="products-toolbar-filters">

          <label class="products-filter-control">
            <span>${icons.filter}</span>
            <select id="products-category-filter" aria-label="Filter by category">
              <option value="all">All categories</option>
              ${getProductCategories()
                .map(
                  (category) =>
                    `<option value="${escapeHTML(category)}">${escapeHTML(category)}</option>`,
                )
                .join("")}
            </select>
          </label>

          <label class="products-filter-control">
            <span>${icons.shield}</span>
            <select id="products-warranty-filter" aria-label="Filter by warranty">
              <option value="all">All warranties</option>
              <option value="active">Active</option>
              <option value="expiring">Expiring soon</option>
              <option value="expired">Expired</option>
              <option value="upcoming">Upcoming</option>
              <option value="unknown">No warranty</option>
            </select>
          </label>

          <label class="products-filter-control products-sort-control">
            <select id="products-sort" aria-label="Sort products">
              <option value="recent">Recently added</option>
              <option value="oldest">Oldest first</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
              <option value="price-high">Price: High to low</option>
              <option value="price-low">Price: Low to high</option>
            </select>
          </label>

        </div>

      </section>

      <section class="products-results-header">
        <div>
          <h2>All products</h2>
          <p id="products-result-count">Loading your collection...</p>
        </div>
      </section>

      <div
        class="products-grid"
        id="products-grid"
        aria-live="polite"
      ></div>

      <div
        class="products-feedback"
        id="products-feedback"
        role="status"
        aria-live="polite"
        hidden
      ></div>

    </div>
  `;
};

const cleanupProductFiles = async (product) => {
  const fileIds = new Set();

  if (product.imageId) {
    fileIds.add(product.imageId);
  }

  let cleanupFailed = false;

  try {
    const user = getCurrentUser();

    if (user) {
      const files = await getFiles({ ownerId: user.id });

      const relatedFiles = files.filter(
        (file) => file.productId === product.id,
      );

      relatedFiles.forEach((file) => {
        fileIds.add(file.id);
      });
    }
  } catch (error) {
    console.warn("Unable to retrieve associated product files:", error);
    cleanupFailed = true;
  }

  for (const fileId of fileIds) {
    try {
      revokeFileURL(fileId);
      await deleteFile(fileId);
    } catch (error) {
      console.warn(`Unable to delete associated file ${fileId}:`, error);
      cleanupFailed = true;
    }
  }

  return cleanupFailed;
};

const initializeProductsInteractions = () => {
  const grid = document.getElementById("products-grid");
  const searchInput = document.getElementById("products-search");
  const categoryFilter = document.getElementById("products-category-filter");
  const warrantyFilter = document.getElementById("products-warranty-filter");
  const sortSelect = document.getElementById("products-sort");
  const resultCount = document.getElementById("products-result-count");
  const feedback = document.getElementById("products-feedback");

  const controller = new AbortController();
  const { signal } = controller;

  const imageURLs = new Map();

  let allProducts = [];
  let renderVersion = 0;

  const releaseImageURLs = () => {
    imageURLs.forEach((fileId) => {
      revokeFileURL(fileId);
    });

    imageURLs.clear();
  };

  const getFilteredProducts = () => {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const category = categoryFilter.value;
    const warrantyStatus = warrantyFilter.value;
    const sort = sortSelect.value;

    let filtered = allProducts.filter((product) => {
      const searchableFields = [
        product.name,
        product.brand,
        product.model,
        product.category,
        product.serialNumber,
        product.description,
      ];

      const matchesSearch =
        !searchTerm ||
        searchableFields.some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(searchTerm),
        );

      const matchesCategory =
        category === "all" || product.category === category;

      const matchesWarranty =
        warrantyStatus === "all" ||
        getWarrantyStatus(product) === warrantyStatus;

      return matchesSearch && matchesCategory && matchesWarranty;
    });

    const sortFunctions = {
      recent: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      oldest: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      "name-asc": (a, b) => a.name.localeCompare(b.name),
      "name-desc": (a, b) => b.name.localeCompare(a.name),
      "price-high": (a, b) =>
        Number(b.purchasePrice || 0) - Number(a.purchasePrice || 0),
      "price-low": (a, b) =>
        Number(a.purchasePrice || 0) - Number(b.purchasePrice || 0),
    };

    filtered.sort(sortFunctions[sort] || sortFunctions.recent);

    return filtered;
  };

  const loadProductImages = async (products, currentVersion) => {
    await Promise.all(
      products.map(async (product) => {
        if (!product.imageId) return;

        try {
          const url = await createFileURL(product.imageId);

          if (currentVersion !== renderVersion) {
            revokeFileURL(product.imageId);
            return;
          }

          imageURLs.set(product.id, product.imageId);

          const placeholder = grid.querySelector(
            `[data-image-placeholder="${CSS.escape(product.id)}"]`,
          );

          if (!placeholder) {
            revokeFileURL(product.imageId);
            imageURLs.delete(product.id);
            return;
          }

          const image = document.createElement("img");

          image.src = url;
          image.alt = `${product.name} product image`;
          image.className = "products-card-product-image";

          image.addEventListener(
            "error",
            () => {
              placeholder.innerHTML = `
                ${icons.package}
                <span>Image unavailable</span>
              `;

              image.replaceWith(placeholder);
            },
            { once: true },
          );

          placeholder.replaceWith(image);
        } catch (error) {
          console.warn(
            `Unable to load product image for ${product.name}:`,
            error,
          );
        }
      }),
    );
  };

  const renderProducts = async () => {
    const currentVersion = ++renderVersion;

    releaseImageURLs();

    const filteredProducts = getFilteredProducts();

    const hasFilters =
      searchInput.value.trim() !== "" ||
      categoryFilter.value !== "all" ||
      warrantyFilter.value !== "all";

    const total = allProducts.length;
    const visible = filteredProducts.length;

    resultCount.textContent = `${visible} of ${total} ${total === 1 ? "product" : "products"}`;

    if (filteredProducts.length === 0) {
      grid.innerHTML = renderEmptyState(hasFilters);
      return;
    }

    grid.innerHTML = filteredProducts.map(renderProductCard).join("");

    await loadProductImages(filteredProducts, currentVersion);
  };

  const refreshProducts = async () => {
    allProducts = getProducts();
    await renderProducts();
  };

  const clearFilters = () => {
    searchInput.value = "";
    categoryFilter.value = "all";
    warrantyFilter.value = "all";
    sortSelect.value = "recent";

    renderProducts();
  };

  const showFeedback = (message, type = "success") => {
    feedback.textContent = message;
    feedback.className = `products-feedback is-${type}`;
    feedback.hidden = false;
  };

  searchInput.addEventListener("input", () => renderProducts(), { signal });

  categoryFilter.addEventListener("change", () => renderProducts(), { signal });

  warrantyFilter.addEventListener("change", () => renderProducts(), { signal });

  sortSelect.addEventListener("change", () => renderProducts(), { signal });

  grid.addEventListener(
    "click",
    async (event) => {
      const clearButton = event.target.closest("#clear-product-filters");

      if (clearButton) {
        clearFilters();
        return;
      }

      const deleteButton = event.target.closest("[data-delete-product]");

      if (!deleteButton) return;

      const productId = deleteButton.dataset.deleteProduct;
      const product = allProducts.find((item) => item.id === productId);

      if (!product) return;

      const confirmed = window.confirm(
        `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
      );

      if (!confirmed) return;

      deleteButton.disabled = true;

      try {
        const deleted = deleteProduct(productId);

        if (!deleted) {
          throw new Error("Product could not be found.");
        }

        const cleanupFailed = await cleanupProductFiles(product);

        await refreshProducts();

        if (cleanupFailed) {
          showFeedback(
            "Product deleted, but some associated files could not be removed.",
            "error",
          );
        } else {
          showFeedback("Product and associated files deleted successfully.");
        }
      } catch (error) {
        console.error("Product deletion failed:", error);

        showFeedback(
          error.message || "Unable to delete this product.",
          "error",
        );

        deleteButton.disabled = false;
      }
    },
    { signal },
  );

  const handleFilesUpdated = (event) => {
    if (event.detail?.operation === "delete") {
      refreshProducts();
    }
  };

  document.addEventListener("proofpath:files-updated", handleFilesUpdated, {
    signal,
  });

  refreshProducts();

  return () => {
    controller.abort();
    renderVersion += 1;
    releaseImageURLs();
  };
};

export function renderProductsPage() {
  return `
    <div class="app-layout">
      ${renderSidebar()}

      <div class="app-main">
        ${renderHeader()}

        <main
          class="app-content products-content"
          id="app-page-content"
          tabindex="-1"
        >
          ${renderProductsContent()}
        </main>
      </div>
    </div>
  `;
}

export function initializeProductsPage() {
  const cleanupSidebar = initializeSidebar();
  const cleanupHeader = initializeHeader();
  const cleanupProducts = initializeProductsInteractions();

  return () => {
    cleanupSidebar?.();
    cleanupHeader?.();
    cleanupProducts?.();
  };
}
