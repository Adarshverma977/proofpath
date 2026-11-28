import { renderSidebar, initializeSidebar } from "../components/sidebar.js";
import { renderHeader, initializeHeader } from "../components/header.js";

import {
  getWarranties,
  getWarrantyStats,
  getWarrantyCategories,
  WARRANTY_STATUS_LABELS,
} from "../modules/warranty.js";

import { createFileURL, revokeFileURL } from "../storage/indexedDB.js";

const icons = {
  shield: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/></svg>`,
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>`,
  calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`,
  package: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 8 9 5 9-5M3 8v9l9 5 9-5V8M12 13v9"/></svg>`,
  arrow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>`,
  filter: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 7h16M7 12h10m-7 5h4"/></svg>`,
  image: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 5v14M5 12h14"/></svg>`,
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

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};

const getRemainingDescription = (warranty) => {
  if (warranty.daysRemaining === null) {
    return "Warranty period unavailable";
  }

  if (warranty.status === "expired") {
    const days = Math.abs(warranty.daysRemaining);

    return days === 1 ? "Expired 1 day ago" : `Expired ${days} days ago`;
  }

  if (warranty.status === "upcoming") {
    const startDate = new Date(`${warranty.warrantyStartDate}T00:00:00`);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days = Math.ceil((startDate.getTime() - today.getTime()) / 86400000);

    return days === 0 ? "Starts today" : `${days} days until warranty starts`;
  }

  if (warranty.daysRemaining === 0) {
    return "Expires today";
  }

  if (warranty.daysRemaining === 1) {
    return "1 day remaining";
  }

  return `${warranty.daysRemaining} days remaining`;
};

const getProgressClass = (status) => {
  if (status === "expired") return "is-expired";
  if (status === "expiring") return "is-expiring";
  if (status === "upcoming") return "is-upcoming";

  return "is-active";
};

const renderWarrantyImage = (warranty) => {
  if (!warranty.imageId) {
    return `
      <div class="warranty-image-placeholder">
        ${icons.package}
        <span>No image</span>
      </div>
    `;
  }

  return `
    <div
      class="warranty-image-placeholder"
      data-warranty-image="${escapeHTML(warranty.id)}"
    >
      ${icons.image}
      <span>Loading image...</span>
    </div>
  `;
};

const renderWarrantyCard = (warranty) => {
  const status = warranty.status;
  const statusLabel = WARRANTY_STATUS_LABELS[status] || "Unknown";

  const progressClass = getProgressClass(status);

  return `
    <article
      class="warranty-card"
      data-warranty-id="${escapeHTML(warranty.id)}"
    >

      <div class="warranty-card-top">

        <div class="warranty-card-image">
          ${renderWarrantyImage(warranty)}
        </div>

        <span class="warranty-status-badge is-${escapeHTML(status)}">
          <span class="warranty-status-dot"></span>
          ${escapeHTML(statusLabel)}
        </span>

      </div>

      <div class="warranty-card-body">

        <span class="warranty-card-category">
          ${escapeHTML(warranty.category)}
        </span>

        <h3>${escapeHTML(warranty.productName)}</h3>

        <p class="warranty-card-model">
          ${escapeHTML(warranty.brand)} · ${escapeHTML(warranty.model)}
        </p>

        <div class="warranty-card-dates">

          <div>
            <span>Warranty started</span>
            <strong>${formatDate(warranty.warrantyStartDate)}</strong>
          </div>

          <div>
            <span>Warranty expires</span>
            <strong>${formatDate(warranty.warrantyEndDate)}</strong>
          </div>

        </div>

        <div class="warranty-progress-section">

          <div class="warranty-progress-heading">
            <span>Warranty period elapsed</span>
            <strong>${warranty.progress}%</strong>
          </div>

          <div
            class="warranty-progress-track"
            role="progressbar"
            aria-label="Warranty period elapsed"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow="${warranty.progress}"
          >
            <span
              class="warranty-progress-fill ${progressClass}"
              style="width: ${warranty.progress}%"
            ></span>
          </div>

        </div>

        <div class="warranty-card-remaining is-${escapeHTML(status)}">
          <span>${icons.clock}</span>
          <strong>${escapeHTML(getRemainingDescription(warranty))}</strong>
        </div>

        <div class="warranty-card-footer">

          <span class="warranty-card-serial">
            ${
              warranty.serialNumber
                ? `S/N: ${escapeHTML(warranty.serialNumber)}`
                : "Serial number unavailable"
            }
          </span>

          <a
            href="#/products/${encodeURIComponent(warranty.productId)}"
            class="warranty-details-link"
          >
            View details
            ${icons.arrow}
          </a>

        </div>

      </div>

    </article>
  `;
};

const renderWarrantyEmptyState = (hasFilters) => {
  if (hasFilters) {
    return `
      <div class="warranty-empty-state">
        <span class="warranty-empty-icon">${icons.search}</span>
        <h3>No matching warranties found</h3>
        <p>
          Try changing your search or selecting another warranty status.
        </p>
        <button
          type="button"
          class="btn btn-secondary"
          id="clear-warranty-filters"
        >
          Clear filters
        </button>
      </div>
    `;
  }

  return `
    <div class="warranty-empty-state">
      <span class="warranty-empty-icon">${icons.shield}</span>
      <span class="warranty-eyebrow">WARRANTY MANAGEMENT</span>
      <h3>Your warranty records will appear here.</h3>
      <p>
        Add products with warranty information to start tracking
        coverage and expiry dates.
      </p>
      <a href="#/products/new" class="btn btn-primary">
        ${icons.plus}
        Add product
      </a>
    </div>
  `;
};

const renderWarrantyContent = () => {
  return `
    <div class="warranty-page">

      <div class="warranty-breadcrumb">
        <a href="#/dashboard">Dashboard</a>
        <span>/</span>
        <span>Warranties</span>
      </div>

      <section class="warranty-heading">

        <div>
          <span class="warranty-eyebrow">COVERAGE OVERVIEW</span>
          <h1>Warranty Management</h1>
          <p>
            Monitor your product coverage, track expiry dates
            and stay informed about upcoming warranty deadlines.
          </p>
        </div>

        <a href="#/products/new" class="btn btn-primary">
          ${icons.plus}
          Add product
        </a>

      </section>

      <section class="warranty-stats" aria-label="Warranty statistics">

        <article class="warranty-stat-card">
          <span class="warranty-stat-icon">${icons.shield}</span>
          <div>
            <span>Total warranties</span>
            <strong id="warranty-total-count">—</strong>
          </div>
        </article>

        <article class="warranty-stat-card">
          <span class="warranty-stat-icon is-active">${icons.shield}</span>
          <div>
            <span>Active</span>
            <strong id="warranty-active-count">—</strong>
          </div>
        </article>

        <article class="warranty-stat-card">
          <span class="warranty-stat-icon is-expiring">${icons.clock}</span>
          <div>
            <span>Expiring soon</span>
            <strong id="warranty-expiring-count">—</strong>
          </div>
        </article>

        <article class="warranty-stat-card">
          <span class="warranty-stat-icon is-expired">${icons.calendar}</span>
          <div>
            <span>Expired</span>
            <strong id="warranty-expired-count">—</strong>
          </div>
        </article>

        <article class="warranty-stat-card">
          <span class="warranty-stat-icon is-upcoming">${icons.calendar}</span>
          <div>
            <span>Upcoming</span>
            <strong id="warranty-upcoming-count">—</strong>
          </div>
        </article>

      </section>

      <section class="warranty-toolbar">

        <div class="warranty-search">
          ${icons.search}
          <input
            type="search"
            id="warranty-search"
            placeholder="Search product, brand, model or serial number..."
            aria-label="Search warranties"
          />
        </div>

        <div class="warranty-filter-controls">

          <label class="warranty-filter-control">
            <span>${icons.filter}</span>
            <select id="warranty-status-filter" aria-label="Filter by warranty status">
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="expiring">Expiring soon</option>
              <option value="expired">Expired</option>
              <option value="upcoming">Upcoming</option>
            </select>
          </label>

          <label class="warranty-filter-control">
            <select id="warranty-category-filter" aria-label="Filter by product category">
              <option value="all">All categories</option>
              ${getWarrantyCategories()
                .map(
                  (category) =>
                    `<option value="${escapeHTML(category)}">${escapeHTML(category)}</option>`,
                )
                .join("")}
            </select>
          </label>

          <label class="warranty-filter-control warranty-sort-control">
            <select id="warranty-sort" aria-label="Sort warranties">
              <option value="expiring-first">Expiry: Soonest first</option>
              <option value="expiring-last">Expiry: Latest first</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
              <option value="recent">Recently added</option>
              <option value="oldest">Oldest first</option>
            </select>
          </label>

        </div>

      </section>

      <section class="warranty-results-header">
        <div>
          <h2>All warranties</h2>
          <p id="warranty-result-count">Loading warranties...</p>
        </div>
      </section>

      <div
        class="warranty-grid"
        id="warranty-grid"
        aria-live="polite"
      ></div>

      <div
        class="warranty-feedback"
        id="warranty-feedback"
        role="status"
        aria-live="polite"
        hidden
      ></div>

    </div>
  `;
};

const initializeWarrantyInteractions = () => {
  const grid = document.getElementById("warranty-grid");

  const searchInput = document.getElementById("warranty-search");
  const statusFilter = document.getElementById("warranty-status-filter");
  const categoryFilter = document.getElementById("warranty-category-filter");
  const sortSelect = document.getElementById("warranty-sort");

  const resultCount = document.getElementById("warranty-result-count");
  const feedback = document.getElementById("warranty-feedback");

  const totalCount = document.getElementById("warranty-total-count");
  const activeCount = document.getElementById("warranty-active-count");
  const expiringCount = document.getElementById("warranty-expiring-count");
  const expiredCount = document.getElementById("warranty-expired-count");
  const upcomingCount = document.getElementById("warranty-upcoming-count");

  const controller = new AbortController();
  const { signal } = controller;

  const imageURLs = new Map();

  let allWarranties = [];
  let renderVersion = 0;

  const releaseImageURLs = () => {
    imageURLs.forEach((fileId) => {
      revokeFileURL(fileId);
    });

    imageURLs.clear();
  };

  const updateStats = () => {
    const stats = getWarrantyStats();

    totalCount.textContent = stats.totalWithWarranty;
    activeCount.textContent = stats.active;
    expiringCount.textContent = stats.expiring;
    expiredCount.textContent = stats.expired;
    upcomingCount.textContent = stats.upcoming;
  };

  const getFilteredWarranties = () => {
    return getWarranties({
      search: searchInput.value,
      status: statusFilter.value,
      category: categoryFilter.value,
      sort: sortSelect.value,
    });
  };

  const loadWarrantyImages = async (warranties, currentVersion) => {
    await Promise.all(
      warranties.map(async (warranty) => {
        if (!warranty.imageId) return;

        try {
          const url = await createFileURL(warranty.imageId);

          if (currentVersion !== renderVersion) {
            revokeFileURL(warranty.imageId);
            return;
          }

          const placeholder = grid.querySelector(
            `[data-warranty-image="${CSS.escape(warranty.id)}"]`,
          );

          if (!placeholder) {
            revokeFileURL(warranty.imageId);
            return;
          }

          imageURLs.set(warranty.id, warranty.imageId);

          const image = document.createElement("img");

          image.src = url;
          image.alt = `${warranty.productName} product image`;
          image.className = "warranty-product-image";

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
            `Unable to load warranty image for ${warranty.productName}:`,
            error,
          );
        }
      }),
    );
  };

  const renderWarranties = async () => {
    const currentVersion = ++renderVersion;

    releaseImageURLs();

    const filteredWarranties = getFilteredWarranties();

    const hasFilters =
      searchInput.value.trim() !== "" ||
      statusFilter.value !== "all" ||
      categoryFilter.value !== "all";

    resultCount.textContent = `${filteredWarranties.length} of ${allWarranties.length} warranties`;

    if (filteredWarranties.length === 0) {
      grid.innerHTML = renderWarrantyEmptyState(hasFilters);
      return;
    }

    grid.innerHTML = filteredWarranties.map(renderWarrantyCard).join("");

    await loadWarrantyImages(filteredWarranties, currentVersion);
  };

  const showFeedback = (message, type = "success") => {
    feedback.textContent = message;
    feedback.className = `warranty-feedback is-${type}`;
    feedback.hidden = false;
  };

  const clearFilters = () => {
    searchInput.value = "";
    statusFilter.value = "all";
    categoryFilter.value = "all";
    sortSelect.value = "expiring-first";

    renderWarranties();
  };

  const refreshWarranties = async () => {
    allWarranties = getWarranties();

    updateStats();

    await renderWarranties();
  };

  searchInput.addEventListener("input", renderWarranties, { signal });

  statusFilter.addEventListener("change", renderWarranties, { signal });

  categoryFilter.addEventListener("change", renderWarranties, { signal });

  sortSelect.addEventListener("change", renderWarranties, { signal });

  grid.addEventListener(
    "click",
    (event) => {
      const clearButton = event.target.closest("#clear-warranty-filters");

      if (clearButton) {
        clearFilters();
      }
    },
    { signal },
  );

  document.addEventListener(
    "proofpath:files-updated",
    () => {
      refreshWarranties();
    },
    { signal },
  );

  refreshWarranties();

  return () => {
    controller.abort();
    renderVersion += 1;
    releaseImageURLs();
  };
};

export function renderWarrantyPage() {
  return `
    <div class="app-layout">
      ${renderSidebar()}

      <div class="app-main">
        ${renderHeader()}

        <main
          class="app-content warranty-content"
          id="app-page-content"
          tabindex="-1"
        >
          ${renderWarrantyContent()}
        </main>
      </div>
    </div>
  `;
}

export function initializeWarrantyPage() {
  const cleanupSidebar = initializeSidebar();
  const cleanupHeader = initializeHeader();
  const cleanupWarranty = initializeWarrantyInteractions();

  return () => {
    cleanupSidebar?.();
    cleanupHeader?.();
    cleanupWarranty?.();
  };
}
