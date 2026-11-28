import { renderSidebar, initializeSidebar } from "../components/sidebar.js";
import { renderHeader, initializeHeader } from "../components/header.js";

import {
  addClaim,
  getClaims,
  getClaimStats,
  getClaimTypes,
  getClaimStatuses,
  getClaimStatusLabel,
  getClaimById,
  updateClaim,
  updateClaimStatus,
  deleteClaim,
  canTransitionClaimStatus,
  CLAIM_STATUSES,
} from "../modules/claims.js";

import { getProducts } from "../modules/products.js";
import { getCurrentUser } from "../auth/sessionService.js";

import {
  saveFile,
  getFile,
  createFileURL,
  revokeFileURL,
  deleteFile,
} from "../storage/indexedDB.js";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_DOCUMENTS = 10;

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

const getCurrentUserId = () => {
  return getCurrentUser()?.id || null;
};

const getLocalDateString = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatDate = (value) => {
  if (!value) return "Not available";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatDateTime = (value) => {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const formatCurrency = (value) => {
  if (value === null || value === undefined || value === "") {
    return "Not specified";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
};

const getStatusClass = (status) => {
  return `is-${String(status || "unknown").replace(/[^a-z0-9-]/g, "")}`;
};

const getStatusIcon = (status) => {
  const icons = {
    submitted: "send",
    "under-review": "clock",
    approved: "check-circle",
    rejected: "x-circle",
    resolved: "shield-check",
  };

  return icons[status] || "circle-help";
};

const icon = (name, size = 18) => {
  const paths = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    "check-circle": '<circle cx="12" cy="12" r="10"/><path d="m8 12 3 3 5-6"/>',
    "x-circle": '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6m0-6 6 6"/>',
    "shield-check":
      '<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z"/><path d="m9 12 2 2 4-4"/>',
    "circle-help":
      '<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
    send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
    package:
      '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/>',
    calendar:
      '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    upload:
      '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5M12 3v12"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2m-9 0 1 14h8l1-14M10 11v5m4-5v5"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L9 17l-4 1 1-4Z"/>',
    arrow: '<path d="M5 12h14m-7-7 7 7-7 7"/>',
    close: '<path d="m18 6-12 12M6 6l12 12"/>',
    paperclip:
      '<path d="m21.4 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.82-2.83l8.49-8.48"/>',
  };

  return `
    <svg
      width="${size}"
      height="${size}"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      ${paths[name] || paths.file}
    </svg>
  `;
};

const renderStatCard = (label, value, iconName, modifier) => {
  return `
    <article class="claim-stat-card">
      <div class="claim-stat-icon ${modifier}">
        ${icon(iconName, 21)}
      </div>
      <div>
        <span>${label}</span>
        <strong>${value}</strong>
      </div>
    </article>
  `;
};

const renderClaimCard = (claim) => {
  const statusLabel = getClaimStatusLabel(claim.status);

  return `
    <article class="claim-card" data-claim-id="${escapeHTML(claim.id)}">
      <div class="claim-card-top">
        <div class="claim-card-identity">
          <span class="claim-number">${escapeHTML(claim.claimNumber)}</span>
          <span class="claim-status-badge ${getStatusClass(claim.status)}">
            <span class="claim-status-dot"></span>
            ${escapeHTML(statusLabel)}
          </span>
        </div>
        <span class="claim-card-date">${formatDate(claim.createdAt?.slice(0, 10))}</span>
      </div>

      <div class="claim-card-main">
        <div class="claim-product-icon">
          ${icon("package", 24)}
        </div>

        <div class="claim-card-info">
          <h3>${escapeHTML(claim.title)}</h3>
          <p>${escapeHTML(claim.productName || "Unknown product")}</p>
          <span>${escapeHTML(claim.productBrand || "")} ${escapeHTML(claim.productModel || "")}</span>
        </div>
      </div>

      <div class="claim-card-meta">
        <div>
          <span>Claim type</span>
          <strong>${escapeHTML(claim.type)}</strong>
        </div>
        <div>
          <span>Requested amount</span>
          <strong>${formatCurrency(claim.requestedAmount)}</strong>
        </div>
      </div>

      <div class="claim-card-footer">
        <span class="claim-attachment-count">
          ${icon("paperclip", 14)}
          ${(claim.documentIds || []).length} attachments
        </span>

        <button
          class="claim-details-button"
          type="button"
          data-action="details"
          data-id="${escapeHTML(claim.id)}"
        >
          View details
          ${icon("arrow", 15)}
        </button>
      </div>
    </article>
  `;
};

const renderEmptyState = (hasFilters) => {
  return `
    <div class="claim-empty-state">
      <div class="claim-empty-icon">
        ${icon("file", 28)}
      </div>

      <h3>${hasFilters ? "No matching claims" : "No claims yet"}</h3>

      <p>
        ${
          hasFilters
            ? "Try changing your search or filters to find the claim you're looking for."
            : "When you experience a product issue, create a warranty claim to keep track of the process."
        }
      </p>

      ${
        hasFilters
          ? `<button type="button" class="btn btn-secondary" data-action="clear-filters">Clear filters</button>`
          : `<button type="button" class="btn btn-primary" data-action="open-create">${icon("plus", 16)} Create your first claim</button>`
      }
    </div>
  `;
};

const renderTimeline = (timeline = []) => {
  if (!timeline.length) {
    return `<p class="claim-no-timeline">No status history available.</p>`;
  }

  return `
    <div class="claim-timeline">
      ${timeline
        .map(
          (entry) => `
            <div class="claim-timeline-item ${getStatusClass(entry.status)}">
              <div class="claim-timeline-marker">
                ${icon(getStatusIcon(entry.status), 16)}
              </div>

              <div class="claim-timeline-content">
                <strong>${escapeHTML(entry.label || getClaimStatusLabel(entry.status))}</strong>
                <time>${formatDateTime(entry.createdAt)}</time>
                ${entry.note ? `<p>${escapeHTML(entry.note)}</p>` : ""}
              </div>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
};

const renderClaimDetails = (claim) => {
  if (!claim) return "";

  const canEdit = claim.status === CLAIM_STATUSES.SUBMITTED;

  const transitions = [
    [CLAIM_STATUSES.SUBMITTED, CLAIM_STATUSES.UNDER_REVIEW, "Start review"],
    [CLAIM_STATUSES.UNDER_REVIEW, CLAIM_STATUSES.APPROVED, "Approve claim"],
    [CLAIM_STATUSES.UNDER_REVIEW, CLAIM_STATUSES.REJECTED, "Reject claim"],
    [CLAIM_STATUSES.APPROVED, CLAIM_STATUSES.RESOLVED, "Mark resolved"],
  ];

  const actions = transitions
    .filter(([current]) => current === claim.status)
    .map(
      ([, next, label]) => `
        <button
          class="btn ${next === CLAIM_STATUSES.REJECTED ? "btn-danger" : "btn-primary"}"
          type="button"
          data-action="change-status"
          data-status="${next}"
          data-id="${escapeHTML(claim.id)}"
        >
          ${escapeHTML(label)}
        </button>
      `,
    )
    .join("");

  return `
    <div class="claim-detail-overlay" data-action="close-details">
      <section
        class="claim-detail-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="claim-detail-title"
      >
        <div class="claim-detail-header">
          <div>
            <span class="claim-number">${escapeHTML(claim.claimNumber)}</span>
            <h2 id="claim-detail-title">Claim details</h2>
          </div>

          <button class="claim-icon-button" type="button" data-action="close-details" aria-label="Close details">
            ${icon("close", 19)}
          </button>
        </div>

        <div class="claim-detail-body">
          <div class="claim-detail-summary">
            <span class="claim-status-badge ${getStatusClass(claim.status)}">
              <span class="claim-status-dot"></span>
              ${escapeHTML(getClaimStatusLabel(claim.status))}
            </span>

            <h3>${escapeHTML(claim.title)}</h3>
            <p>${escapeHTML(claim.productName)}</p>
          </div>

          <div class="claim-detail-section">
            <h3>Claim information</h3>

            <div class="claim-detail-grid">
              <div><span>Claim type</span><strong>${escapeHTML(claim.type)}</strong></div>
              <div><span>Incident date</span><strong>${formatDate(claim.incidentDate)}</strong></div>
              <div><span>Submitted on</span><strong>${formatDate(claim.createdAt?.slice(0, 10))}</strong></div>
              <div><span>Requested amount</span><strong>${formatCurrency(claim.requestedAmount)}</strong></div>
              <div><span>Brand</span><strong>${escapeHTML(claim.productBrand)}</strong></div>
              <div><span>Model</span><strong>${escapeHTML(claim.productModel)}</strong></div>
            </div>
          </div>

          <div class="claim-detail-section">
            <h3>Issue description</h3>
            <p class="claim-detail-description">${escapeHTML(claim.description)}</p>
          </div>

          <div class="claim-detail-section">
            <h3>Supporting documents</h3>
            <div class="claim-detail-documents" data-document-list="${escapeHTML(claim.id)}">
              <span>${(claim.documentIds || []).length} document(s) attached</span>
            </div>
          </div>

          <div class="claim-detail-section">
            <h3>Claim timeline</h3>
            ${renderTimeline(claim.timeline)}
          </div>

          ${
            claim.resolutionNote
              ? `
                <div class="claim-resolution-note">
                  <strong>Resolution note</strong>
                  <p>${escapeHTML(claim.resolutionNote)}</p>
                </div>
              `
              : ""
          }
        </div>

        <div class="claim-detail-actions">
          ${
            canEdit
              ? `
                <button class="btn btn-secondary" type="button" data-action="edit-claim" data-id="${escapeHTML(claim.id)}">
                  ${icon("edit", 16)} Edit
                </button>

                <button class="btn btn-danger" type="button" data-action="delete-claim" data-id="${escapeHTML(claim.id)}">
                  ${icon("trash", 16)} Delete
                </button>
              `
              : ""
          }

          ${actions}
        </div>
      </section>
    </div>
  `;
};

const renderClaimForm = () => {
  return `
    <div class="claim-form-overlay" id="claim-form-overlay" hidden>
      <section
        class="claim-form-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="claim-form-title"
      >
        <div class="claim-form-header">
          <div>
            <span class="claim-eyebrow">WARRANTY SUPPORT</span>
            <h2 id="claim-form-title">Create a claim</h2>
            <p>Provide the details of your product issue.</p>
          </div>

          <button type="button" class="claim-icon-button" data-action="close-form" aria-label="Close form">
            ${icon("close", 19)}
          </button>
        </div>

        <form id="claim-form" novalidate>
          <input type="hidden" name="claimId" value="">

          <div class="claim-form-grid">
            <div class="claim-form-field full-width">
              <label for="claim-product">Select product <span>*</span></label>
              <select id="claim-product" name="productId" required>
                <option value="">Choose a registered product</option>
                ${getProducts()
                  .map(
                    (product) => `
                      <option value="${escapeHTML(product.id)}">
                        ${escapeHTML(product.name)} – ${escapeHTML(product.brand)}
                      </option>
                    `,
                  )
                  .join("")}
              </select>
              <small class="claim-field-error" data-error="productId"></small>
            </div>

            <div class="claim-form-field">
              <label for="claim-type">Claim type <span>*</span></label>
              <select id="claim-type" name="type" required>
                <option value="">Select issue type</option>
                ${getClaimTypes()
                  .map(
                    (type) => `
                      <option value="${escapeHTML(type)}">${escapeHTML(type)}</option>
                    `,
                  )
                  .join("")}
              </select>
              <small class="claim-field-error" data-error="type"></small>
            </div>

            <div class="claim-form-field">
              <label for="claim-incident-date">Incident date <span>*</span></label>
              <input
                id="claim-incident-date"
                type="date"
                name="incidentDate"
                max="${getLocalDateString()}"
                required
              >
              <small class="claim-field-error" data-error="incidentDate"></small>
            </div>

            <div class="claim-form-field full-width">
              <label for="claim-title">Claim title <span>*</span></label>
              <input
                id="claim-title"
                type="text"
                name="title"
                maxlength="100"
                placeholder="Briefly describe the issue"
                required
              >
              <small class="claim-field-error" data-error="title"></small>
            </div>

            <div class="claim-form-field full-width">
              <label for="claim-description">Issue description <span>*</span></label>
              <textarea
                id="claim-description"
                name="description"
                rows="5"
                maxlength="2000"
                placeholder="Explain what happened, when it started and what you have experienced..."
                required
              ></textarea>
              <small class="claim-field-error" data-error="description"></small>
            </div>

            <div class="claim-form-field full-width">
              <label for="claim-amount">Requested amount <span class="optional-label">(Optional)</span></label>
              <input
                id="claim-amount"
                type="number"
                name="requestedAmount"
                min="0"
                step="0.01"
                placeholder="Enter amount in INR"
              >
              <small class="claim-field-error" data-error="requestedAmount"></small>
            </div>

            <div class="claim-form-field full-width">
              <label for="claim-documents">Supporting documents <span class="optional-label">(Optional, up to 10)</span></label>

              <label class="claim-upload-zone" for="claim-documents">
                ${icon("upload", 25)}
                <strong>Choose supporting files</strong>
                <span>PDF, JPG, PNG or other documents · Maximum 10 MB each</span>
                <input
                  id="claim-documents"
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                >
              </label>

              <div class="claim-selected-files" id="claim-selected-files"></div>
              <small class="claim-field-error" data-error="documentIds"></small>
            </div>
          </div>

          <div class="claim-form-footer">
            <button class="btn btn-secondary" type="button" data-action="close-form">Cancel</button>
            <button class="btn btn-primary" type="submit" id="claim-submit-button">
              ${icon("send", 16)}
              Submit claim
            </button>
          </div>
        </form>
      </section>
    </div>
  `;
};

const renderClaimsContent = () => {
  const stats = getClaimStats();

  return `
    <div class="claims-page">
      <div class="claims-breadcrumb">
        <a href="#/dashboard">Dashboard</a>
        <span>/</span>
        <span>Claims</span>
      </div>

      <div class="claims-heading">
        <div>
          <span class="claim-eyebrow">WARRANTY MANAGEMENT</span>
          <h1>Claims management</h1>
          <p>Submit and track product warranty claims from one place.</p>
        </div>

        <button class="btn btn-primary" type="button" data-action="open-create">
          ${icon("plus", 17)}
          Create claim
        </button>
      </div>

      <section class="claim-stats" aria-label="Claim statistics">
        ${renderStatCard("Total claims", stats.total, "file", "is-total")}
        ${renderStatCard("Submitted", stats.submitted, "send", "is-submitted")}
        ${renderStatCard("Under review", stats.underReview, "clock", "is-review")}
        ${renderStatCard("Approved", stats.approved, "check-circle", "is-approved")}
        ${renderStatCard("Rejected", stats.rejected, "x-circle", "is-rejected")}
      </section>

      <section class="claims-toolbar">
        <label class="claims-search">
          ${icon("search", 18)}
          <input
            type="search"
            id="claims-search"
            placeholder="Search by claim number, product or title..."
            aria-label="Search claims"
          >
        </label>

        <div class="claims-filters">
          <select id="claims-status-filter" aria-label="Filter by status">
            <option value="all">All statuses</option>
            ${getClaimStatuses()
              .map(
                (status) => `
                  <option value="${status}">${escapeHTML(getClaimStatusLabel(status))}</option>
                `,
              )
              .join("")}
          </select>

          <select id="claims-type-filter" aria-label="Filter by claim type">
            <option value="all">All claim types</option>
            ${getClaimTypes()
              .map(
                (type) => `
                  <option value="${escapeHTML(type)}">${escapeHTML(type)}</option>
                `,
              )
              .join("")}
          </select>

          <select id="claims-sort" aria-label="Sort claims">
            <option value="recent">Most recent</option>
            <option value="oldest">Oldest first</option>
            <option value="updated-recent">Recently updated</option>
            <option value="name-asc">Title A–Z</option>
            <option value="name-desc">Title Z–A</option>
          </select>
        </div>
      </section>

      <div class="claims-results-header">
        <div>
          <h2>Your claims</h2>
          <p id="claims-result-count">${stats.total} claims</p>
        </div>
      </div>

      <section class="claims-grid" id="claims-grid" aria-live="polite"></section>

      <div id="claim-detail-root"></div>
      ${renderClaimForm()}
      <div class="claims-feedback" id="claims-feedback" aria-live="polite"></div>
    </div>
  `;
};

const renderFeedback = (message, type = "success") => {
  const feedback = document.getElementById("claims-feedback");

  if (!feedback) return;

  feedback.innerHTML = `
    <div class="claim-feedback-message is-${type}">
      ${escapeHTML(message)}
    </div>
  `;

  window.clearTimeout(feedback._timeout);

  feedback._timeout = window.setTimeout(() => {
    feedback.innerHTML = "";
  }, 4000);
};

const initializeClaimsInteractions = () => {
  const root = document.getElementById("app-page-content");

  if (!root) return () => {};

  const controller = new AbortController();
  const { signal } = controller;

  const grid = root.querySelector("#claims-grid");
  const searchInput = root.querySelector("#claims-search");
  const statusFilter = root.querySelector("#claims-status-filter");
  const typeFilter = root.querySelector("#claims-type-filter");
  const sortSelect = root.querySelector("#claims-sort");
  const formOverlay = root.querySelector("#claim-form-overlay");
  const form = root.querySelector("#claim-form");
  const fileInput = root.querySelector("#claim-documents");
  const selectedFiles = root.querySelector("#claim-selected-files");
  const detailRoot = root.querySelector("#claim-detail-root");

  let selectedClaimFiles = [];
  let selectedClaim = null;
  let isSubmitting = false;
  let lastFocusedElement = null;

  const renderClaims = () => {
    const claims = getClaims({
      search: searchInput.value,
      status: statusFilter.value,
      type: typeFilter.value,
      sort: sortSelect.value,
    });

    root.querySelector("#claims-result-count").textContent =
      `${claims.length} ${claims.length === 1 ? "claim" : "claims"}`;

    if (!claims.length) {
      const hasFilters =
        Boolean(searchInput.value.trim()) ||
        statusFilter.value !== "all" ||
        typeFilter.value !== "all";

      grid.innerHTML = renderEmptyState(hasFilters);
      return;
    }

    grid.innerHTML = claims.map(renderClaimCard).join("");
  };

  const refreshStats = () => {
    const stats = getClaimStats();

    const updatedValues = [
      stats.total,
      stats.submitted,
      stats.underReview,
      stats.approved,
      stats.rejected,
    ];

    root
      .querySelectorAll(".claim-stat-card strong")
      .forEach((element, index) => {
        element.textContent = updatedValues[index] ?? 0;
      });
  };

  const refreshPage = () => {
    refreshStats();
    renderClaims();
  };

  const openForm = (claim = null) => {
    lastFocusedElement = document.activeElement;
    selectedClaim = claim;

    form.reset();
    selectedClaimFiles = [];

    form.querySelector('[name="claimId"]').value = claim?.id || "";

    const productSelect = form.querySelector('[name="productId"]');

    if (claim) {
      productSelect.value = claim.productId;
      productSelect.disabled = true;

      form.querySelector('[name="type"]').value = claim.type;
      form.querySelector('[name="title"]').value = claim.title;
      form.querySelector('[name="description"]').value = claim.description;
      form.querySelector('[name="incidentDate"]').value = claim.incidentDate;
      form.querySelector('[name="requestedAmount"]').value =
        claim.requestedAmount ?? "";

      form.querySelector("#claim-form-title").textContent = "Edit claim";
      form.querySelector("#claim-submit-button").innerHTML =
        `${icon("check", 16)} Save changes`;
    } else {
      productSelect.disabled = false;

      form.querySelector("#claim-form-title").textContent = "Create a claim";
      form.querySelector("#claim-submit-button").innerHTML =
        `${icon("send", 16)} Submit claim`;
    }

    root.querySelectorAll(".claim-field-error").forEach((element) => {
      element.textContent = "";
    });

    selectedFiles.innerHTML = "";

    formOverlay.hidden = false;
    document.body.classList.add("claim-modal-open");

    productSelect.focus();
  };

  const closeForm = () => {
    formOverlay.hidden = true;
    document.body.classList.remove("claim-modal-open");

    form.reset();
    selectedClaimFiles = [];
    selectedClaim = null;

    if (lastFocusedElement?.isConnected) {
      lastFocusedElement.focus();
    }
  };

  const closeDetails = () => {
    detailRoot.innerHTML = "";
    document.body.classList.remove("claim-modal-open");
  };

  const renderSelectedFiles = () => {
    selectedFiles.innerHTML = selectedClaimFiles
      .map(
        (file, index) => `
          <div class="claim-selected-file">
            ${icon("file", 16)}
            <span>${escapeHTML(file.name)}</span>
            <button
              type="button"
              data-action="remove-file"
              data-index="${index}"
              aria-label="Remove ${escapeHTML(file.name)}"
            >
              ${icon("close", 15)}
            </button>
          </div>
        `,
      )
      .join("");
  };

  const getFileExtension = (fileName) => {
    return fileName.split(".").pop()?.toLowerCase() || "";
  };

  const validateSelectedFiles = (files) => {
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const allowedExtensions = [
      "pdf",
      "jpg",
      "jpeg",
      "png",
      "webp",
      "doc",
      "docx",
    ];

    for (const file of files) {
      const extension = getFileExtension(file.name);

      if (
        !allowedTypes.includes(file.type) &&
        !allowedExtensions.includes(extension)
      ) {
        throw new Error(`${file.name}: Unsupported file type.`);
      }

      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`${file.name}: File size cannot exceed 10 MB.`);
      }

      if (file.size === 0) {
        throw new Error(`${file.name}: Empty files cannot be uploaded.`);
      }
    }
  };

  const showFormErrors = (errors) => {
    root.querySelectorAll(".claim-field-error").forEach((element) => {
      element.textContent = "";
    });

    Object.entries(errors).forEach(([field, message]) => {
      const errorElement = root.querySelector(`[data-error="${field}"]`);

      if (errorElement) {
        errorElement.textContent = message;
      }
    });
  };

  const saveClaimEvidence = async (files, claim, product) => {
    const uploadedFileIds = [];
    const ownerId = getCurrentUserId();

    if (!ownerId) {
      throw new Error("Your session has expired. Please log in again.");
    }

    try {
      for (const file of files) {
        const savedFile = await saveFile({
          file,
          category: "claim-evidence",
          ownerId,
          metadata: {
            purpose: "claim-evidence",
            claimId: claim.id,
            claimNumber: claim.claimNumber,
            productId: product.id,
            productName: product.name,
          },
        });

        uploadedFileIds.push(savedFile.id);
      }

      return uploadedFileIds;
    } catch (error) {
      await Promise.all(
        uploadedFileIds.map((id) => deleteFile(id).catch(() => false)),
      );

      throw error;
    }
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) return;

    const isEditing = Boolean(selectedClaim);
    const claimBeingEdited = selectedClaim;

    const formData = new FormData(form);

    const data = {
      productId: formData.get("productId"),
      type: formData.get("type"),
      title: String(formData.get("title") || "").trim(),
      description: String(formData.get("description") || "").trim(),
      incidentDate: formData.get("incidentDate"),
      requestedAmount: formData.get("requestedAmount"),
      documentIds: claimBeingEdited?.documentIds || [],
    };

    const requestedAmount = String(data.requestedAmount || "").trim();

    data.requestedAmount =
      requestedAmount === "" ? null : Number(requestedAmount);

    const basicErrors = {};

    if (!data.productId) {
      basicErrors.productId = "Please select a product.";
    }

    if (!data.type) {
      basicErrors.type = "Please select a claim type.";
    }

    if (!data.title) {
      basicErrors.title = "Claim title is required.";
    }

    if (!data.description) {
      basicErrors.description = "Description is required.";
    }

    if (!data.incidentDate) {
      basicErrors.incidentDate = "Incident date is required.";
    } else if (data.incidentDate > getLocalDateString()) {
      basicErrors.incidentDate = "Incident date cannot be in the future.";
    }

    if (
      data.requestedAmount !== null &&
      (!Number.isFinite(data.requestedAmount) || data.requestedAmount < 0)
    ) {
      basicErrors.requestedAmount = "Enter a valid non-negative amount.";
    }

    if (selectedClaimFiles.length + data.documentIds.length > MAX_DOCUMENTS) {
      basicErrors.documentIds = "You can attach a maximum of 10 documents.";
    }

    showFormErrors(basicErrors);

    if (Object.keys(basicErrors).length) return;

    const product = getProducts().find((item) => item.id === data.productId);

    if (!product) {
      showFormErrors({
        productId: "Selected product could not be found.",
      });
      return;
    }

    isSubmitting = true;

    const submitButton = form.querySelector("#claim-submit-button");

    submitButton.disabled = true;
    submitButton.textContent = isEditing ? "Saving..." : "Submitting...";

    let createdClaimId = null;
    let uploadedFileIds = [];

    try {
      if (isEditing) {
        uploadedFileIds = await saveClaimEvidence(
          selectedClaimFiles,
          claimBeingEdited,
          product,
        );

        const updatedDocumentIds = [
          ...(claimBeingEdited.documentIds || []),
          ...uploadedFileIds,
        ];

        updateClaim(claimBeingEdited.id, {
          ...data,
          documentIds: updatedDocumentIds,
        });

        renderFeedback("Claim updated successfully.");
      } else {
        const createdClaim = addClaim({
          ...data,
          documentIds: [],
        });

        createdClaimId = createdClaim.id;

        uploadedFileIds = await saveClaimEvidence(
          selectedClaimFiles,
          createdClaim,
          product,
        );

        if (uploadedFileIds.length) {
          updateClaim(createdClaim.id, {
            documentIds: uploadedFileIds,
          });
        }

        renderFeedback("Your claim has been submitted successfully.");
      }

      closeForm();
      closeDetails();
      refreshPage();
    } catch (error) {
      await Promise.all(
        uploadedFileIds.map((id) => deleteFile(id).catch(() => false)),
      );

      if (createdClaimId) {
        try {
          deleteClaim(createdClaimId);
        } catch (rollbackError) {
          console.error("Claim rollback failed:", rollbackError);
        }
      }

      console.error("Claim submission failed:", error);

      if (error.errors) {
        showFormErrors(error.errors);
      } else {
        renderFeedback(
          error.message || "Unable to save the claim. Please try again.",
          "error",
        );
      }
    } finally {
      isSubmitting = false;
      submitButton.disabled = false;

      if (formOverlay.hidden) {
        submitButton.innerHTML = `${icon("send", 16)} Submit claim`;
      } else {
        submitButton.innerHTML = isEditing
          ? `${icon("check", 16)} Save changes`
          : `${icon("send", 16)} Submit claim`;
      }
    }
  };

  const openDetails = async (claimId) => {
    const claim = getClaimById(claimId);

    if (!claim) {
      renderFeedback("Claim could not be found.", "error");
      return;
    }

    detailRoot.innerHTML = renderClaimDetails(claim);
    document.body.classList.add("claim-modal-open");

    const documentContainer = detailRoot.querySelector(
      `[data-document-list="${CSS.escape(claim.id)}"]`,
    );

    if (!documentContainer || !claim.documentIds?.length) return;

    documentContainer.innerHTML = "";

    const ownerId = getCurrentUserId();

    for (const fileId of claim.documentIds) {
      try {
        const file = await getFile(fileId);

        if (!file) continue;

        const belongsToUser = file.ownerId === ownerId;
        const isClaimEvidence = file.category === "claim-evidence";
        const belongsToClaim = !file.claimId || file.claimId === claim.id;
        const belongsToProduct =
          !file.productId || file.productId === claim.productId;

        if (
          !belongsToUser ||
          !isClaimEvidence ||
          !belongsToClaim ||
          !belongsToProduct
        ) {
          continue;
        }

        if (!detailRoot.contains(documentContainer)) return;

        const item = document.createElement("div");
        item.className = "claim-document-item";

        const name = document.createElement("span");
        name.textContent = file.name || "Supporting document";

        const download = document.createElement("button");
        download.type = "button";
        download.textContent = "Download";

        download.addEventListener(
          "click",
          async () => {
            try {
              const latestFile = await getFile(fileId);

              if (
                !latestFile ||
                latestFile.ownerId !== ownerId ||
                latestFile.category !== "claim-evidence"
              ) {
                throw new Error("Document is not available.");
              }

              const url = await createFileURL(fileId);
              const link = document.createElement("a");

              link.href = url;
              link.download = latestFile.name || "claim-document";
              link.style.display = "none";

              document.body.appendChild(link);
              link.click();
              link.remove();

              window.setTimeout(() => {
                revokeFileURL(fileId);
              }, 30000);
            } catch (error) {
              console.error("Claim document download failed:", error);
              renderFeedback("Unable to download this document.", "error");
            }
          },
          { signal },
        );

        item.append(name, download);
        documentContainer.appendChild(item);
      } catch (error) {
        console.error("Unable to load claim document:", error);
      }
    }

    if (!documentContainer.children.length) {
      documentContainer.textContent = "No accessible supporting documents.";
    }
  };

  const handleStatusChange = (claimId, status) => {
    const claim = getClaimById(claimId);

    if (!claim || !canTransitionClaimStatus(claim.status, status)) {
      renderFeedback("This status change is not allowed.", "error");
      return;
    }

    const note = window.prompt(
      "Add a note for this status update (optional):",
      "",
    );

    if (note === null) return;

    try {
      updateClaimStatus(claimId, status, note);

      renderFeedback(`Claim status updated to ${getClaimStatusLabel(status)}.`);

      refreshPage();
      openDetails(claimId);
    } catch (error) {
      renderFeedback(error.message, "error");
    }
  };

  const handleDeleteClaim = async (claimId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this submitted claim?",
    );

    if (!confirmed) return;

    try {
      const claim = getClaimById(claimId);

      if (!claim) return;

      deleteClaim(claimId);

      closeDetails();
      refreshPage();
      renderFeedback("Claim deleted successfully.");

      const cleanupResults = await Promise.allSettled(
        (claim.documentIds || []).map((id) => deleteFile(id)),
      );

      const failedCleanup = cleanupResults.some(
        (result) => result.status === "rejected",
      );

      if (failedCleanup) {
        console.error("Some claim evidence files could not be deleted.");
      }
    } catch (error) {
      renderFeedback(error.message, "error");
    }
  };

  const handleEditClaim = (claimId) => {
    const claim = getClaimById(claimId);

    if (!claim || claim.status !== CLAIM_STATUSES.SUBMITTED) {
      renderFeedback("Only submitted claims can be edited.", "error");
      return;
    }

    closeDetails();
    openForm(claim);
  };

  const handleAction = (event) => {
    const button = event.target.closest("[data-action]");

    if (!button || !root.contains(button)) return;

    const { action, id, status, index } = button.dataset;

    switch (action) {
      case "open-create":
        openForm();
        break;

      case "close-form":
        if (!isSubmitting) closeForm();
        break;

      case "close-details":
        if (
          event.target === button ||
          button.classList.contains("claim-icon-button")
        ) {
          closeDetails();
        }
        break;

      case "details":
        openDetails(id);
        break;

      case "change-status":
        handleStatusChange(id, status);
        break;

      case "delete-claim":
        handleDeleteClaim(id);
        break;

      case "edit-claim":
        handleEditClaim(id);
        break;

      case "clear-filters":
        searchInput.value = "";
        statusFilter.value = "all";
        typeFilter.value = "all";
        sortSelect.value = "recent";
        renderClaims();
        break;

      case "remove-file":
        if (!isSubmitting) {
          selectedClaimFiles.splice(Number(index), 1);
          renderSelectedFiles();
        }
        break;

      default:
        break;
    }
  };

  [searchInput, statusFilter, typeFilter, sortSelect].forEach((element) => {
    element.addEventListener("input", renderClaims, { signal });
    element.addEventListener("change", renderClaims, { signal });
  });

  root.addEventListener("click", handleAction, { signal });
  form.addEventListener("submit", handleFormSubmit, { signal });

  formOverlay.addEventListener(
    "click",
    (event) => {
      if (event.target === formOverlay && !isSubmitting) {
        closeForm();
      }
    },
    { signal },
  );

  fileInput.addEventListener(
    "change",
    () => {
      const incomingFiles = Array.from(fileInput.files || []);

      try {
        validateSelectedFiles(incomingFiles);

        const combined = [...selectedClaimFiles, ...incomingFiles];
        const existingDocumentCount = selectedClaim?.documentIds?.length || 0;

        if (combined.length + existingDocumentCount > MAX_DOCUMENTS) {
          throw new Error("You can attach a maximum of 10 documents.");
        }

        selectedClaimFiles = combined;
        renderSelectedFiles();

        root.querySelector('[data-error="documentIds"]').textContent = "";
      } catch (error) {
        renderFeedback(error.message, "error");
      }

      fileInput.value = "";
    },
    { signal },
  );

  document.addEventListener(
    "keydown",
    (event) => {
      if (event.key !== "Escape") return;

      if (!formOverlay.hidden && !isSubmitting) {
        closeForm();
      } else if (detailRoot.innerHTML) {
        closeDetails();
      }
    },
    { signal },
  );

  window.addEventListener("proofpath:claims-updated", refreshPage, { signal });

  refreshPage();

  return () => {
    controller.abort();
    closeDetails();

    if (!formOverlay.hidden) {
      formOverlay.hidden = true;
    }

    document.body.classList.remove("claim-modal-open");
  };
};

export const renderClaimsPage = () => {
  return `
    <div class="app-shell">
      ${renderSidebar()}

      <div class="app-main">
        ${renderHeader()}

        <main class="app-content claims-content" id="app-page-content">
          ${renderClaimsContent()}
        </main>
      </div>
    </div>
  `;
};

export const initializeClaimsPage = () => {
  initializeSidebar();
  initializeHeader();

  const cleanupClaims = initializeClaimsInteractions();

  return () => {
    cleanupClaims();
  };
};
