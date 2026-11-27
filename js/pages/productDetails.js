import { renderSidebar, initializeSidebar } from "../components/sidebar.js";
import { renderHeader, initializeHeader } from "../components/header.js";

import {
  getProductById,
  getWarrantyStatus,
  getWarrantyDaysRemaining,
  deleteProduct,
} from "../modules/products.js";

import { getCurrentUser } from "../auth/sessionService.js";

import {
  getFiles,
  createFileURL,
  revokeFileURL,
  deleteFile,
} from "../storage/indexedDB.js";

import { confirmModal } from "../components/modal.js";

const icons = {
  package: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 8 9 5 9-5M3 8v9l9 5 9-5V8M12 13v9"/></svg>`,
  shield: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/></svg>`,
  calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></svg>`,
  file: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M6 3h9l4 4v14H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M15 3v5h5M8 13h8M8 17h8"/></svg>`,
  edit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m16 4 4 4M4 20l4-.8L19 8a2.8 2.8 0 0 0-4-4L4 15l-0 5Z"/></svg>`,
  trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6"/></svg>`,
  arrow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>`,
  download: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3v12m-5-5 5 5 5-5"/><path d="M5 17v4h14v-4"/></svg>`,
  image: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m5 12 4 4L19 6"/></svg>`,
  back: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M19 12H5m7 7-7-7 7-7"/></svg>`,
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

const getProductIdFromURL = () => {
  const path = window.location.hash.slice(1).split("?")[0];
  const match = path.match(/^\/products\/([^/]+)$/);

  if (!match) return null;

  try {
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
};

const formatDate = (value) => {
  if (!value) return "Not available";

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
};

const getWarrantyProgress = (product) => {
  if (!product.warrantyStartDate || !product.warrantyEndDate) {
    return 0;
  }

  const start = new Date(`${product.warrantyStartDate}T00:00:00`).getTime();
  const end = new Date(`${product.warrantyEndDate}T00:00:00`).getTime();
  const now = new Date(
    `${new Date().toLocaleDateString("en-CA")}T00:00:00`,
  ).getTime();

  if (end <= start) return 100;

  const percentage = ((now - start) / (end - start)) * 100;

  return Math.min(100, Math.max(0, percentage));
};

const getWarrantyMessage = (product) => {
  const status = getWarrantyStatus(product);
  const remaining = getWarrantyDaysRemaining(product);

  if (status === "unknown") {
    return "Warranty details have not been added.";
  }

  if (status === "upcoming") {
    return "Your warranty period has not started yet.";
  }

  if (status === "expired") {
    return `Warranty expired ${Math.abs(remaining)} days ago.`;
  }

  if (remaining === 0) return "Your warranty expires today.";
  if (remaining === 1) return "1 day remaining on your warranty.";

  return `${remaining} days remaining on your warranty.`;
};

const renderNotFound = () => {
  return `
    <div class="product-details-not-found">
      <span class="product-details-empty-icon">
        ${icons.package}
      </span>
      <h2>Product not found</h2>
      <p>
        This product may have been removed or may not belong to your account.
      </p>
      <a href="#/products" class="btn btn-primary">
        ${icons.back}
        Back to My Products
      </a>
    </div>
  `;
};

const renderLoading = () => {
  return `
    <div class="product-details-loading">
      <div class="product-details-skeleton"></div>
      <div class="product-details-skeleton"></div>
      <div class="product-details-skeleton"></div>
    </div>
  `;
};

const renderDetailItem = (label, value, mono = false) => {
  return `
    <div class="product-details-info-item">
      <span>${label}</span>
      <strong class="${mono ? "is-mono" : ""}">${value || "Not available"}</strong>
    </div>
  `;
};

const renderProductDetails = (product) => {
  const status = getWarrantyStatus(product);
  const remaining = getWarrantyDaysRemaining(product);
  const progress = getWarrantyProgress(product);

  const warrantyEnd = product.warrantyEndDate
    ? formatDate(product.warrantyEndDate)
    : "Not available";

  return `
    <div class="product-details-page">

      <div class="product-details-breadcrumb">
        <a href="#/dashboard">Dashboard</a>
        <span>/</span>
        <a href="#/products">My Products</a>
        <span>/</span>
        <span>Product details</span>
      </div>

      <section class="product-details-heading">
        <div>
          <span class="product-details-eyebrow">PRODUCT RECORD</span>
          <h1>${escapeHTML(product.name)}</h1>
          <p>${escapeHTML(product.brand)} · ${escapeHTML(product.model)}</p>
        </div>

        <div class="product-details-actions">
          <button
            type="button"
            class="btn btn-danger"
            id="delete-detail-product"
          >
            ${icons.trash}
            Delete
          </button>

          <button
            type="button"
            class="btn btn-primary"
            id="edit-detail-product"
          >
            ${icons.edit}
            Edit product
          </button>
        </div>
      </section>

      <div class="product-details-main-grid">

        <section class="product-details-image-panel">
          <div class="product-details-image" id="product-details-image">
            <span class="product-details-image-placeholder">
              ${icons.package}
              <small>Product image</small>
            </span>
          </div>

          <div class="product-details-image-caption">
            <span>${escapeHTML(product.category)}</span>
            <span class="product-details-status is-${status}">
              <i></i>
              ${STATUS_LABELS[status]}
            </span>
          </div>
        </section>

        <section class="product-details-overview">

          <div class="product-details-panel-heading">
            <div>
              <span class="product-details-eyebrow">OVERVIEW</span>
              <h2>Product information</h2>
            </div>
            <span class="product-details-heading-icon">
              ${icons.package}
            </span>
          </div>

          <div class="product-details-info-grid">
            ${renderDetailItem("Product name", escapeHTML(product.name))}
            ${renderDetailItem("Brand", escapeHTML(product.brand))}
            ${renderDetailItem("Model", escapeHTML(product.model))}
            ${renderDetailItem("Category", escapeHTML(product.category))}
            ${renderDetailItem("Serial number", escapeHTML(product.serialNumber || "Not added"), true)}
            ${renderDetailItem("Product ID", escapeHTML(product.id), true)}
          </div>

          ${
            product.description
              ? `
                <div class="product-details-description">
                  <span>Description</span>
                  <p>${escapeHTML(product.description)}</p>
                </div>
              `
              : ""
          }

        </section>

      </div>

      <section class="product-details-warranty-panel">

        <div class="product-details-warranty-heading">
          <div class="product-details-warranty-icon">
            ${icons.shield}
          </div>

          <div>
            <span class="product-details-eyebrow">PROTECTION STATUS</span>
            <h2>Warranty information</h2>
          </div>

          <span class="product-details-status is-${status}">
            <i></i>
            ${STATUS_LABELS[status]}
          </span>
        </div>

        <div class="product-details-warranty-summary">

          <div>
            <span>Warranty start</span>
            <strong>${formatDate(product.warrantyStartDate)}</strong>
          </div>

          <div>
            <span>Warranty expiry</span>
            <strong>${warrantyEnd}</strong>
          </div>

          <div>
            <span>Remaining days</span>
            <strong>
              ${remaining === null ? "—" : status === "expired" ? "Expired" : remaining}
            </strong>
          </div>

        </div>

        <div class="product-details-progress">
          <div class="product-details-progress-heading">
            <span>Warranty period elapsed</span>
            <strong>${product.warrantyStartDate && product.warrantyEndDate ? `${Math.round(progress)}%` : "—"}</strong>
          </div>

          <div class="product-details-progress-track">
            <span class="is-${status}" style="width:${progress}%"></span>
          </div>

          <p>${getWarrantyMessage(product)}</p>
        </div>

      </section>

      <div class="product-details-bottom-grid">

        <section class="product-details-panel">

          <div class="product-details-panel-heading">
            <div>
              <span class="product-details-eyebrow">PURCHASE RECORD</span>
              <h2>Purchase details</h2>
            </div>
            <span class="product-details-heading-icon">
              ${icons.calendar}
            </span>
          </div>

          <div class="product-details-purchase-value">
            <span>Purchase price</span>
            <strong>${formatCurrency(product.purchasePrice)}</strong>
          </div>

          <div class="product-details-info-grid">
            ${renderDetailItem("Purchase date", formatDate(product.purchaseDate))}
            ${renderDetailItem("Registered on", formatDate(product.createdAt?.slice(0, 10)))}
          </div>

        </section>

        <section class="product-details-panel">

          <div class="product-details-panel-heading">
            <div>
              <span class="product-details-eyebrow">DOCUMENT VAULT</span>
              <h2>Purchase invoice</h2>
            </div>
            <span class="product-details-heading-icon">
              ${icons.file}
            </span>
          </div>

          <div id="product-invoice-container">
            <div class="product-details-document-empty">
              <span>${icons.file}</span>
              <p>Loading purchase documents...</p>
            </div>
          </div>

        </section>

      </div>

      <section class="product-details-timeline-panel">

        <div class="product-details-panel-heading">
          <div>
            <span class="product-details-eyebrow">PRODUCT HISTORY</span>
            <h2>Product timeline</h2>
          </div>
          <span class="product-details-heading-icon">
            ${icons.clock}
          </span>
        </div>

        <div class="product-details-timeline">

          <div class="product-details-timeline-item is-complete">
            <span class="product-details-timeline-marker">${icons.check}</span>
            <div>
              <strong>Product purchased</strong>
              <p>${formatDate(product.purchaseDate)}</p>
            </div>
          </div>

          <div class="product-details-timeline-item is-complete">
            <span class="product-details-timeline-marker">${icons.check}</span>
            <div>
              <strong>Added to ProofPath</strong>
              <p>${formatDate(product.createdAt?.slice(0, 10))}</p>
            </div>
          </div>

          <div class="product-details-timeline-item ${status === "upcoming" ? "" : "is-complete"}">
            <span class="product-details-timeline-marker">
              ${status === "upcoming" ? icons.clock : icons.check}
            </span>
            <div>
              <strong>Warranty started</strong>
              <p>${formatDate(product.warrantyStartDate)}</p>
            </div>
          </div>

          <div class="product-details-timeline-item ${status === "expired" ? "is-complete" : ""}">
            <span class="product-details-timeline-marker">
              ${status === "expired" ? icons.check : icons.clock}
            </span>
            <div>
              <strong>Warranty expiry</strong>
              <p>${warrantyEnd}</p>
            </div>
          </div>

        </div>

      </section>

      <div class="product-details-footer">
        <a href="#/products" class="product-details-back-link">
          ${icons.back}
          Back to My Products
        </a>

        <span>ProofPath · Every product has a story.</span>
      </div>

    </div>
  `;
};

const renderInvoice = (invoice) => {
  return `
    <div class="product-details-invoice">

      <span class="product-details-invoice-icon">
        ${icons.file}
      </span>

      <div class="product-details-invoice-info">
        <strong>${escapeHTML(invoice.name)}</strong>
        <small>${(invoice.size / (1024 * 1024)).toFixed(2)} MB</small>
      </div>

      <button
        type="button"
        class="product-details-download"
        data-download-invoice="${escapeHTML(invoice.id)}"
        aria-label="Download invoice"
      >
        ${icons.download}
      </button>

    </div>

    <div class="product-details-invoice-preview" data-invoice-preview="${escapeHTML(invoice.id)}">
      <span>${icons.file}</span>
      <p>Preparing document preview...</p>
    </div>
  `;
};

const initializeProductDetailsInteractions = () => {
  const page = document.querySelector(".product-details-page");
  const imageContainer = document.getElementById("product-details-image");
  const invoiceContainer = document.getElementById("product-invoice-container");
  const deleteButton = document.getElementById("delete-detail-product");
  const editButton = document.getElementById("edit-detail-product");

  const controller = new AbortController();
  const { signal } = controller;

  let product = null;
  let productImageURL = null;
  const invoiceURLs = new Map();

  const cleanupURLs = () => {
    if (productImageURL && product?.imageId) {
      revokeFileURL(product.imageId);
      productImageURL = null;
    }

    invoiceURLs.forEach((fileId) => {
      revokeFileURL(fileId);
    });

    invoiceURLs.clear();
  };

  const productId = getProductIdFromURL();

  try {
    if (!productId) {
      page.innerHTML = renderNotFound();
      return () => controller.abort();
    }

    product = getProductById(productId);

    if (!product) {
      page.innerHTML = renderNotFound();
      return () => controller.abort();
    }
  } catch (error) {
    console.error("Unable to load product:", error);
    page.innerHTML = renderNotFound();
    return () => controller.abort();
  }

  const loadProductImage = async () => {
    if (!product.imageId) return;

    try {
      const url = await createFileURL(product.imageId);

      if (signal.aborted) {
        revokeFileURL(product.imageId);
        return;
      }

      productImageURL = url;

      const image = document.createElement("img");

      image.src = url;
      image.alt = `${product.name} product image`;

      image.addEventListener(
        "error",
        () => {
          image.remove();

          imageContainer.innerHTML = `
          <span class="product-details-image-placeholder">
            ${icons.image}
            <small>Image unavailable</small>
          </span>
        `;
        },
        { once: true },
      );

      imageContainer.innerHTML = "";
      imageContainer.appendChild(image);
    } catch (error) {
      console.warn("Unable to load product image:", error);
    }
  };

  const loadInvoices = async () => {
    const user = getCurrentUser();

    try {
      const files = await getFiles({
        ownerId: user.id,
        category: "invoice",
      });

      if (signal.aborted) return;

      const invoices = files.filter((file) => file.productId === product.id);

      if (!invoices.length) {
        invoiceContainer.innerHTML = `
          <div class="product-details-document-empty">
            <span>${icons.file}</span>
            <p>No purchase invoice has been uploaded.</p>
          </div>
        `;
        return;
      }

      invoiceContainer.innerHTML = invoices.map(renderInvoice).join("");

      await Promise.all(
        invoices.map(async (invoice) => {
          try {
            const url = await createFileURL(invoice.id);

            if (signal.aborted) {
              revokeFileURL(invoice.id);
              return;
            }

            invoiceURLs.set(invoice.id, invoice.id);

            const preview = invoiceContainer.querySelector(
              `[data-invoice-preview="${CSS.escape(invoice.id)}"]`,
            );

            if (!preview) return;

            if (invoice.type === "application/pdf") {
              const iframe = document.createElement("iframe");

              iframe.src = url;
              iframe.title = `Preview of ${invoice.name}`;

              preview.innerHTML = "";
              preview.appendChild(iframe);
            } else if (invoice.type.startsWith("image/")) {
              const image = document.createElement("img");

              image.src = url;
              image.alt = `Preview of ${invoice.name}`;

              preview.innerHTML = "";
              preview.appendChild(image);
            } else {
              preview.textContent = "Preview is not available for this file.";
            }
          } catch (error) {
            console.warn("Unable to preview invoice:", error);
          }
        }),
      );
    } catch (error) {
      console.error("Unable to load invoices:", error);

      invoiceContainer.innerHTML = `
        <div class="product-details-document-empty">
          <p>Unable to load purchase documents.</p>
        </div>
      `;
    }
  };

  imageContainer.addEventListener("click", () => {}, { signal });

  editButton.addEventListener(
    "click",
    () => {
      window.location.hash = `#/products/${encodeURIComponent(product.id)}/edit`;
    },
    { signal },
  );

  deleteButton.addEventListener(
    "click",
    async () => {
      const confirmed = await confirmModal({
        title: "Delete this product?",
        description: `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
        confirmLabel: "Delete product",
        cancelLabel: "Keep product",
        variant: "danger",
      });

      if (!confirmed || signal.aborted) return;

      deleteButton.disabled = true;

      try {
        const deleted = deleteProduct(product.id);

        if (!deleted) {
          throw new Error("Product could not be found.");
        }

        cleanupURLs();

        const user = getCurrentUser();

        if (product.imageId) {
          const image = await getProductByIdFromFile(product.imageId, user.id);

          if (image) {
            await deleteFile(product.imageId);
          }
        }

        const invoices = await getFiles({
          ownerId: user.id,
          category: "invoice",
        });

        const relatedInvoices = invoices.filter(
          (file) => file.productId === product.id,
        );

        await Promise.all(relatedInvoices.map((file) => deleteFile(file.id)));

        window.location.hash = "#/products";
      } catch (error) {
        console.error("Product deletion failed:", error);
        deleteButton.disabled = false;
      }
    },
    { signal },
  );

  invoiceContainer.addEventListener(
    "click",
    async (event) => {
      const downloadButton = event.target.closest("[data-download-invoice]");

      if (!downloadButton) return;

      const fileId = downloadButton.dataset.downloadInvoice;
      const invoice = invoiceURLs.get(fileId);

      if (!invoice) return;

      try {
        const url = await createFileURL(fileId);

        const link = document.createElement("a");

        link.href = url;

        const file = await getFileMetadata(fileId);

        link.download = file?.name || "purchase-invoice";
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (error) {
        console.error("Invoice download failed:", error);
      }
    },
    { signal },
  );

  loadProductImage();
  loadInvoices();

  return () => {
    controller.abort();
    cleanupURLs();
  };
};

const getProductByIdFromFile = async (fileId, ownerId) => {
  const { getFile } = await import("../storage/indexedDB.js");

  const file = await getFile(fileId);

  if (!file || file.ownerId !== ownerId) return null;

  return file;
};

const getFileMetadata = async (fileId) => {
  const { getFile } = await import("../storage/indexedDB.js");
  return getFile(fileId);
};

export function renderProductDetailsPage() {
  return `
    <div class="app-layout">
      ${renderSidebar()}

      <div class="app-main">
        ${renderHeader()}

        <main
          class="app-content product-details-content"
          id="app-page-content"
          tabindex="-1"
        >
          ${renderLoading()}
        </main>
      </div>
    </div>
  `;
}

export function initializeProductDetailsPage() {
  const cleanupSidebar = initializeSidebar();
  const cleanupHeader = initializeHeader();

  const content = document.getElementById("app-page-content");

  const productId = getProductIdFromURL();

  let cleanupDetails = null;

  try {
    const product = productId ? getProductById(productId) : null;

    if (!product) {
      content.innerHTML = renderNotFound();
    } else {
      content.innerHTML = renderProductDetails(product);
      cleanupDetails = initializeProductDetailsInteractions();
    }
  } catch (error) {
    console.error(error);
    content.innerHTML = renderNotFound();
  }

  return () => {
    cleanupSidebar?.();
    cleanupHeader?.();
    cleanupDetails?.();
  };
}
