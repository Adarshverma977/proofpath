import { renderSidebar, initializeSidebar } from "../components/sidebar.js";
import { renderHeader, initializeHeader } from "../components/header.js";

import { openModal, confirmModal } from "../components/modal.js";

import {
  getDocuments,
  getDocumentCategoryCounts,
  getDocumentPreviewURL,
  revokeDocumentPreviewURL,
  deleteDocument,
} from "../modules/documents.js";

const icons = {
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>`,
  file: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8m-8 4h8"/></svg>`,
  invoice: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M6 2h12a2 2 0 0 1 2 2v18l-4-2-4 2-4-2-4 2V4a2 2 0 0 1 2-2Z"/><path d="M8 8h8M8 12h8m-8 4h5"/></svg>`,
  shield: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/></svg>`,
  repair: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M14.7 6.3a5 5 0 0 0-6.4 6.4L3 18l3 3 5.3-5.3a5 5 0 0 0 6.4-6.4L14 13l-3-3 3.7-3.7Z"/></svg>`,
  download: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>`,
  eye: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>`,
  trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6"/></svg>`,
  empty: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8m-8 4h5"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 5v14M5 12h14"/></svg>`,
};

const CATEGORY_OPTIONS = [
  { value: "all", label: "All documents", icon: icons.file },
  { value: "invoice", label: "Invoices", icon: icons.invoice },
  {
    value: "warranty-certificate",
    label: "Warranty certificates",
    icon: icons.shield,
  },
  {
    value: "repair-receipt",
    label: "Repair receipts",
    icon: icons.repair,
  },
];

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
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatFileSize = (bytes) => {
  const size = Number(bytes);

  if (!Number.isFinite(size) || size <= 0) {
    return "Size unavailable";
  }

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
};

const getFileIcon = (category) => {
  const categoryOption = CATEGORY_OPTIONS.find(
    (option) => option.value === category,
  );

  return categoryOption?.icon || icons.file;
};

const renderDocumentCard = (document) => {
  return `
    <article
      class="documents-card"
      data-document-id="${escapeHTML(document.id)}"
    >
      <div class="documents-card-top">

        <div class="documents-file-icon">
          ${getFileIcon(document.category)}
        </div>

        <span class="documents-category-badge is-${escapeHTML(document.category)}">
          ${escapeHTML(document.categoryLabel)}
        </span>

      </div>

      <div class="documents-card-content">

        <h3 title="${escapeHTML(document.displayName)}">
          ${escapeHTML(document.displayName)}
        </h3>

        <p class="documents-product-name">
          ${
            document.productName
              ? `Associated product: ${escapeHTML(document.productName)}`
              : "No associated product"
          }
        </p>

        <div class="documents-file-meta">
          <span>${formatFileSize(document.size)}</span>
          <span class="documents-meta-divider"></span>
          <span>${formatDate(document.createdAt)}</span>
        </div>

      </div>

      <div class="documents-card-actions">

        <button
          type="button"
          class="btn btn-secondary documents-preview-button"
          data-preview-document="${escapeHTML(document.id)}"
        >
          ${icons.eye}
          Preview
        </button>

        <button
          type="button"
          class="documents-icon-button"
          data-download-document="${escapeHTML(document.id)}"
          aria-label="Download ${escapeHTML(document.displayName)}"
          title="Download document"
        >
          ${icons.download}
        </button>

        <button
          type="button"
          class="documents-icon-button is-danger"
          data-delete-document="${escapeHTML(document.id)}"
          aria-label="Delete ${escapeHTML(document.displayName)}"
          title="Delete document"
        >
          ${icons.trash}
        </button>

      </div>
    </article>
  `;
};

const renderCategoryOptions = () => {
  return CATEGORY_OPTIONS.map(
    (category) => `
      <option value="${category.value}">
        ${category.label}
      </option>
    `,
  ).join("");
};

const renderDocumentsContent = () => {
  return `
    <div class="documents-page">

      <div class="documents-breadcrumb">
        <a href="#/dashboard">Dashboard</a>
        <span>/</span>
        <span>Documents Vault</span>
      </div>

      <section class="documents-heading">
        <div>
          <span class="documents-eyebrow">YOUR DIGITAL RECORDS</span>
          <h1>Documents Vault</h1>
          <p>
            Keep invoices, warranty certificates and repair records
            organized in one secure place.
          </p>
        </div>

        <a href="#/products/new" class="btn btn-primary">
          ${icons.plus}
          Add product
        </a>
      </section>

      <section class="documents-overview" aria-label="Document summary">

        <article class="documents-stat-card">
          <span class="documents-stat-icon">${icons.file}</span>
          <div>
            <span>Total documents</span>
            <strong id="documents-total-count">—</strong>
          </div>
        </article>

        <article class="documents-stat-card">
          <span class="documents-stat-icon">${icons.invoice}</span>
          <div>
            <span>Invoices</span>
            <strong id="documents-invoice-count">—</strong>
          </div>
        </article>

        <article class="documents-stat-card">
          <span class="documents-stat-icon">${icons.shield}</span>
          <div>
            <span>Warranty certificates</span>
            <strong id="documents-warranty-count">—</strong>
          </div>
        </article>

        <article class="documents-stat-card">
          <span class="documents-stat-icon">${icons.repair}</span>
          <div>
            <span>Repair receipts</span>
            <strong id="documents-repair-count">—</strong>
          </div>
        </article>

      </section>

      <section class="documents-toolbar">

        <div class="documents-search">
          ${icons.search}

          <input
            type="search"
            id="documents-search"
            placeholder="Search by document or product name..."
            aria-label="Search documents"
          />
        </div>

        <label class="documents-filter-control">
          <span>Category</span>
          <select id="documents-category-filter" aria-label="Filter documents by category">
            ${renderCategoryOptions()}
          </select>
        </label>

      </section>

      <section class="documents-results-header">
        <div>
          <h2>Your documents</h2>
          <p id="documents-result-count">Loading documents...</p>
        </div>
      </section>

      <div
        class="documents-grid"
        id="documents-grid"
        aria-live="polite"
      ></div>

      <div
        class="documents-feedback"
        id="documents-feedback"
        role="status"
        aria-live="polite"
        hidden
      ></div>

    </div>
  `;
};

const renderLoadingState = () => {
  return `
    <div class="documents-loading-state">
      <span class="documents-loader"></span>
      <p>Loading your documents...</p>
    </div>
  `;
};

const renderEmptyState = (hasFilters) => {
  if (hasFilters) {
    return `
      <div class="documents-empty-state">
        <span class="documents-empty-icon">${icons.search}</span>
        <h3>No matching documents found</h3>
        <p>
          Try another search term or select a different category.
        </p>
        <button
          type="button"
          class="btn btn-secondary"
          id="clear-document-filters"
        >
          Clear filters
        </button>
      </div>
    `;
  }

  return `
    <div class="documents-empty-state">
      <span class="documents-empty-icon">${icons.empty}</span>
      <span class="documents-eyebrow">YOUR DOCUMENT LIBRARY</span>
      <h3>Your documents will appear here.</h3>
      <p>
        Add a product with its invoice or upload documents
        when adding warranty and service records.
      </p>
      <a href="#/products/new" class="btn btn-primary">
        ${icons.plus}
        Add your first product
      </a>
    </div>
  `;
};

const getDocumentMimeType = (document) => {
  return (
    document.type || document.mimeType || document.metadata?.mimeType || ""
  );
};

const openDocumentPreview = async (document) => {
  let previewURL;

  try {
    previewURL = await getDocumentPreviewURL(document.id);

    const mimeType = getDocumentMimeType(document);
    const isPDF = mimeType === "application/pdf";
    const isImage = mimeType.startsWith("image/");

    let previewContent = "";

    if (isPDF) {
      previewContent = `
        <div class="documents-preview-frame">
          <iframe
            id="document-preview-frame"
            title="${escapeHTML(document.displayName)}"
          ></iframe>
        </div>
      `;
    } else if (isImage) {
      previewContent = `
        <div class="documents-preview-image">
          <img
            id="document-preview-image"
            alt="${escapeHTML(document.displayName)}"
          />
        </div>
      `;
    } else {
      previewContent = `
        <div class="documents-preview-unavailable">
          <span class="documents-empty-icon">${icons.file}</span>
          <h3>Preview not available</h3>
          <p>
            This file format cannot be previewed here.
            Download the document to open it.
          </p>
        </div>
      `;
    }

    previewContent += `
      <a
        class="btn btn-primary documents-preview-download"
        id="document-preview-download"
        download="${escapeHTML(document.displayName)}"
      >
        ${icons.download}
        Download document
      </a>
    `;

    const modal = openModal({
      title: "Document preview",
      description: document.displayName,
      size: "large",
      content: `
        <div class="documents-preview-content">
          ${previewContent}
        </div>
      `,
      actions: [
        {
          label: "Close",
          variant: "btn-secondary",
        },
      ],
      onClose: () => {
        revokeDocumentPreviewURL(document.id);
      },
    });

    const iframe = modal.element.querySelector("#document-preview-frame");
    const image = modal.element.querySelector("#document-preview-image");
    const downloadLink = modal.element.querySelector(
      "#document-preview-download",
    );

    if (iframe) {
      iframe.src = previewURL;
    }

    if (image) {
      image.src = previewURL;
    }

    if (downloadLink) {
      downloadLink.href = previewURL;
    }
  } catch (error) {
    if (previewURL) {
      revokeDocumentPreviewURL(document.id);
    }

    console.error("Document preview failed:", error);

    openModal({
      title: "Unable to preview document",
      description:
        error.message || "Something went wrong while opening this document.",
      size: "small",
      actions: [
        {
          label: "Close",
          variant: "btn-secondary",
        },
      ],
    });
  }
};


const downloadDocument = async (fileDocument) => {
  let url;

  try {
    url = await getDocumentPreviewURL(fileDocument.id);

    const link = window.document.createElement("a");

    link.href = url;
    link.download = fileDocument.displayName || "document";
    link.style.display = "none";

    window.document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(() => {
      revokeDocumentPreviewURL(fileDocument.id);
    }, 30000);
  } catch (error) {
    if (url) {
      revokeDocumentPreviewURL(fileDocument.id);
    }

    console.error("Document download failed:", error);

    throw error;
  }
};


const initializeDocumentsInteractions = () => {
  const grid = document.getElementById("documents-grid");
  const searchInput = document.getElementById("documents-search");
  const categoryFilter = document.getElementById("documents-category-filter");

  const resultCount = document.getElementById("documents-result-count");
  const feedback = document.getElementById("documents-feedback");

  const totalCount = document.getElementById("documents-total-count");
  const invoiceCount = document.getElementById("documents-invoice-count");
  const warrantyCount = document.getElementById("documents-warranty-count");
  const repairCount = document.getElementById("documents-repair-count");

  const controller = new AbortController();
  const { signal } = controller;

  let allDocuments = [];
  let isLoading = false;

  const showFeedback = (message, type = "success") => {
    feedback.textContent = message;
    feedback.className = `documents-feedback is-${type}`;
    feedback.hidden = false;
  };

  const updateCounts = async () => {
    const counts = await getDocumentCategoryCounts();

    totalCount.textContent = counts.all;
    invoiceCount.textContent = counts.invoice;
    warrantyCount.textContent = counts["warranty-certificate"];
    repairCount.textContent = counts["repair-receipt"];
  };

  const getFilteredDocuments = () => {
    const search = searchInput.value.trim().toLowerCase();
    const category = categoryFilter.value;

    return allDocuments.filter((document) => {
      const matchesCategory =
        category === "all" || document.category === category;

      const searchableText = [
        document.displayName,
        document.productName,
        document.categoryLabel,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = !search || searchableText.includes(search);

      return matchesCategory && matchesSearch;
    });
  };

  const renderDocuments = () => {
    const filteredDocuments = getFilteredDocuments();

    const hasFilters =
      searchInput.value.trim() !== "" || categoryFilter.value !== "all";

    resultCount.textContent = `${filteredDocuments.length} of ${allDocuments.length} ${
      allDocuments.length === 1 ? "document" : "documents"
    }`;

    if (filteredDocuments.length === 0) {
      grid.innerHTML = renderEmptyState(hasFilters);
      return;
    }

    grid.innerHTML = filteredDocuments.map(renderDocumentCard).join("");
  };

  const loadDocuments = async () => {
    if (isLoading) return;

    isLoading = true;
    grid.innerHTML = renderLoadingState();

    try {
      allDocuments = await getDocuments();

      await updateCounts();

      renderDocuments();
    } catch (error) {
      console.error("Unable to load documents:", error);

      grid.innerHTML = `
        <div class="documents-error-state">
          <h3>Unable to load documents</h3>
          <p>${escapeHTML(error.message || "Please try again.")}</p>
          <button
            type="button"
            class="btn btn-secondary"
            id="retry-documents"
          >
            Try again
          </button>
        </div>
      `;

      resultCount.textContent = "Documents could not be loaded.";
    } finally {
      isLoading = false;
    }
  };

  const clearFilters = () => {
    searchInput.value = "";
    categoryFilter.value = "all";

    renderDocuments();
  };

  searchInput.addEventListener("input", renderDocuments, { signal });

  categoryFilter.addEventListener("change", renderDocuments, { signal });

  grid.addEventListener(
    "click",
    async (event) => {
      if (event.target.closest("#clear-document-filters")) {
        clearFilters();
        return;
      }

      if (event.target.closest("#retry-documents")) {
        await loadDocuments();
        return;
      }

      const previewButton = event.target.closest("[data-preview-document]");

      const downloadButton = event.target.closest("[data-download-document]");

      const deleteButton = event.target.closest("[data-delete-document]");

      const documentId =
        previewButton?.dataset.previewDocument ||
        downloadButton?.dataset.downloadDocument ||
        deleteButton?.dataset.deleteDocument;

      if (!documentId) return;

      const selectedDocument = allDocuments.find(
        (item) => item.id === documentId,
      );

      if (!selectedDocument) return;

      if (previewButton) {
        previewButton.disabled = true;

        try {
          await openDocumentPreview(selectedDocument);
        } finally {
          previewButton.disabled = false;
        }

        return;
      }

      if (downloadButton) {
        downloadButton.disabled = true;

        try {
          await downloadDocument(selectedDocument);
          showFeedback("Document download started.");
        } catch (error) {
          showFeedback(
            error.message || "Unable to download this document.",
            "error",
          );
        } finally {
          downloadButton.disabled = false;
        }

        return;
      }

      if (deleteButton) {
        const confirmed = await confirmModal({
          title: "Delete document?",
          description: `Are you sure you want to permanently delete "${selectedDocument.displayName}"? This action cannot be undone.`,
          confirmLabel: "Delete document",
          cancelLabel: "Keep document",
          variant: "danger",
        });

        if (!confirmed) return;

        deleteButton.disabled = true;

        try {
          await deleteDocument(documentId);

          allDocuments = allDocuments.filter((item) => item.id !== documentId);

          await updateCounts();
          renderDocuments();

          showFeedback("Document deleted successfully.");
        } catch (error) {
          console.error("Document deletion failed:", error);

          showFeedback(
            error.message || "Unable to delete this document.",
            "error",
          );

          deleteButton.disabled = false;
        }
      }
    },
    { signal },
  );

  loadDocuments();

  return () => {
    controller.abort();
  };
};

export function renderDocumentsPage() {
  return `
    <div class="app-layout">
      ${renderSidebar()}

      <div class="app-main">
        ${renderHeader()}

        <main
          class="app-content documents-content"
          id="app-page-content"
          tabindex="-1"
        >
          ${renderDocumentsContent()}
        </main>
      </div>
    </div>
  `;
}

export function initializeDocumentsPage() {
  const cleanupSidebar = initializeSidebar();
  const cleanupHeader = initializeHeader();
  const cleanupDocuments = initializeDocumentsInteractions();

  return () => {
    cleanupSidebar?.();
    cleanupHeader?.();
    cleanupDocuments?.();
  };
}
