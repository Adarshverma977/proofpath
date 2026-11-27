import { renderSidebar, initializeSidebar } from "../components/sidebar.js";
import { renderHeader, initializeHeader } from "../components/header.js";

import {
  getProductById,
  updateProduct,
  getProductCategories,
  validateProduct,
  ProductValidationError,
} from "../modules/products.js";

import { getCurrentUser } from "../auth/sessionService.js";

import {
  saveFile,
  getFiles,
  createFileURL,
  revokeFileURL,
  deleteFile,
} from "../storage/indexedDB.js";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_INVOICE_SIZE = 10 * 1024 * 1024;

const icons = {
  arrow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>`,
  package: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 8 9 5 9-5M3 8v9l9 5 9-5V8M12 13v9"/></svg>`,
  image: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>`,
  calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></svg>`,
  shield: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/></svg>`,
  file: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M6 3h9l4 4v14H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M15 3v5h5M8 13h8M8 17h8"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 12 4 4L19 6"/></svg>`,
  close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m18 6-12 12M6 6l12 12"/></svg>`,
  upload: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 16V4m-5 5 5-5 5 5"/><path d="M4 16v4h16v-4"/></svg>`,
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

const formatFileSize = (bytes) => {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(0)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const getToday = () => {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getProductIdFromURL = () => {
  const path = window.location.hash.slice(1).split("?")[0];

  const match = path.match(/^\/products\/([^/]+)\/edit$/);

  if (!match) return null;

  try {
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
};

const renderCategoryOptions = (selectedCategory) => {
  return getProductCategories()
    .map(
      (category) => `
        <option
          value="${escapeHTML(category)}"
          ${category === selectedCategory ? "selected" : ""}
        >
          ${escapeHTML(category)}
        </option>
      `,
    )
    .join("");
};

const renderEditProductContent = () => {
  return `
    <div class="add-product-page edit-product-page">

      <div class="add-product-breadcrumb">
        <a href="#/dashboard">Dashboard</a>
        <span>/</span>
        <a href="#/products">My Products</a>
        <span>/</span>
        <span>Edit product</span>
      </div>

      <section class="add-product-heading">
        <div>
          <span class="add-product-eyebrow">PRODUCT MANAGEMENT</span>
          <h1>Edit product details</h1>
          <p>
            Update your product information, purchase details,
            warranty records and supporting documents.
          </p>
        </div>

        <a
          href="#/products"
          class="btn btn-secondary add-product-back"
          id="edit-product-back"
        >
          Cancel editing
        </a>
      </section>

      <div class="add-product-layout">

        <form
          class="add-product-form"
          id="edit-product-form"
          novalidate
        >

          <section class="add-product-section">

            <div class="add-product-section-heading">
              <span class="add-product-section-icon">
                ${icons.package}
              </span>

              <div>
                <h2>Product information</h2>
                <p>Update your product identification details.</p>
              </div>

              <span class="add-product-step">01</span>
            </div>

            <div class="add-product-fields">

              <div class="form-group">
                <label class="form-label" for="product-name">
                  Product name <span>*</span>
                </label>

                <input
                  class="form-control"
                  type="text"
                  id="product-name"
                  name="name"
                  maxlength="100"
                  required
                />

                <small class="field-error" data-error="name"></small>
              </div>

              <div class="add-product-two-columns">

                <div class="form-group">
                  <label class="form-label" for="product-brand">
                    Brand <span>*</span>
                  </label>

                  <input
                    class="form-control"
                    type="text"
                    id="product-brand"
                    name="brand"
                    maxlength="80"
                    required
                  />

                  <small class="field-error" data-error="brand"></small>
                </div>

                <div class="form-group">
                  <label class="form-label" for="product-model">
                    Model <span>*</span>
                  </label>

                  <input
                    class="form-control"
                    type="text"
                    id="product-model"
                    name="model"
                    maxlength="80"
                    required
                  />

                  <small class="field-error" data-error="model"></small>
                </div>

              </div>

              <div class="add-product-two-columns">

                <div class="form-group">
                  <label class="form-label" for="product-category">
                    Category <span>*</span>
                  </label>

                  <select
                    class="form-control"
                    id="product-category"
                    name="category"
                    required
                  >
                    <option value="">Select a category</option>
                    ${renderCategoryOptions("")}
                  </select>

                  <small class="field-error" data-error="category"></small>
                </div>

                <div class="form-group">
                  <label class="form-label" for="product-serial">
                    Serial number
                  </label>

                  <input
                    class="form-control"
                    type="text"
                    id="product-serial"
                    name="serialNumber"
                    maxlength="100"
                  />

                  <small class="field-error" data-error="serialNumber"></small>
                </div>

              </div>

              <div class="form-group">
                <label class="form-label" for="product-description">
                  Description
                  <span class="optional-label">OPTIONAL</span>
                </label>

                <textarea
                  class="form-control add-product-textarea"
                  id="product-description"
                  name="description"
                  maxlength="1000"
                  rows="4"
                ></textarea>

                <div class="add-product-character-count">
                  <span id="description-count">0</span>/1000 characters
                </div>

                <small class="field-error" data-error="description"></small>
              </div>

            </div>
          </section>

          <section class="add-product-section">

            <div class="add-product-section-heading">
              <span class="add-product-section-icon">
                ${icons.calendar}
              </span>

              <div>
                <h2>Purchase details</h2>
                <p>Update your purchase information.</p>
              </div>

              <span class="add-product-step">02</span>
            </div>

            <div class="add-product-fields">

              <div class="add-product-two-columns">

                <div class="form-group">
                  <label class="form-label" for="purchase-date">
                    Purchase date <span>*</span>
                  </label>

                  <input
                    class="form-control"
                    type="date"
                    id="purchase-date"
                    name="purchaseDate"
                    max="${getToday()}"
                    required
                  />

                  <small class="field-error" data-error="purchaseDate"></small>
                </div>

                <div class="form-group">
                  <label class="form-label" for="purchase-price">
                    Purchase price (INR) <span>*</span>
                  </label>

                  <div class="add-product-price-input">
                    <span>₹</span>

                    <input
                      class="form-control"
                      type="number"
                      id="purchase-price"
                      name="purchasePrice"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <small class="field-error" data-error="purchasePrice"></small>
                </div>

              </div>

            </div>
          </section>

          <section class="add-product-section">

            <div class="add-product-section-heading">
              <span class="add-product-section-icon">
                ${icons.shield}
              </span>

              <div>
                <h2>Warranty information</h2>
                <p>Maintain accurate warranty records.</p>
              </div>

              <span class="add-product-step">03</span>
            </div>

            <div class="add-product-fields">

              <div class="add-product-warranty-note">
                ${icons.shield}

                <p>
                  Both warranty dates must be provided together.
                  Leave both empty if warranty details are unavailable.
                </p>
              </div>

              <div class="add-product-two-columns">

                <div class="form-group">
                  <label class="form-label" for="warranty-start">
                    Warranty start date
                  </label>

                  <input
                    class="form-control"
                    type="date"
                    id="warranty-start"
                    name="warrantyStartDate"
                  />

                  <small class="field-error" data-error="warrantyStartDate"></small>
                </div>

                <div class="form-group">
                  <label class="form-label" for="warranty-end">
                    Warranty expiry date
                  </label>

                  <input
                    class="form-control"
                    type="date"
                    id="warranty-end"
                    name="warrantyEndDate"
                  />

                  <small class="field-error" data-error="warrantyEndDate"></small>
                </div>

              </div>

            </div>
          </section>

          <section class="add-product-section">

            <div class="add-product-section-heading">
              <span class="add-product-section-icon">
                ${icons.file}
              </span>

              <div>
                <h2>Product documentation</h2>
                <p>Manage your existing images and purchase proof.</p>
              </div>

              <span class="add-product-step">04</span>
            </div>

            <div class="add-product-fields">

              <div class="form-group">
                <label class="form-label">Current product image</label>

                <div
                  class="edit-product-existing-image"
                  id="existing-image-container"
                >
                  <span class="text-muted">Loading current image...</span>
                </div>

                <label class="form-label edit-product-upload-label">
                  Replace product image
                </label>

                <input
                  type="file"
                  id="product-image"
                  accept="image/jpeg,image/png,image/webp"
                  hidden
                />

                <div
                  class="add-product-upload-zone"
                  id="image-upload-zone"
                  role="button"
                  tabindex="0"
                  aria-label="Replace product image"
                >
                  <span class="add-product-upload-icon">
                    ${icons.image}
                  </span>

                  <strong>Select a replacement image</strong>
                  <p>or <span>browse files</span></p>
                  <small>JPG, PNG or WEBP · Maximum 5 MB</small>
                </div>

                <div
                  class="add-product-file-preview"
                  id="image-preview"
                  hidden
                ></div>

                <small class="field-error" data-error="image"></small>
              </div>

              <div class="form-group">
                <label class="form-label">
                  Current purchase invoice
                </label>

                <div
                  class="edit-product-existing-invoices"
                  id="existing-invoice-container"
                >
                  <span class="text-muted">Loading invoices...</span>
                </div>

                <label class="form-label edit-product-upload-label">
                  Replace purchase invoice
                </label>

                <input
                  type="file"
                  id="product-invoice"
                  accept="application/pdf,image/jpeg,image/png,image/webp"
                  hidden
                />

                <div
                  class="add-product-upload-zone add-product-invoice-zone"
                  id="invoice-upload-zone"
                  role="button"
                  tabindex="0"
                  aria-label="Replace purchase invoice"
                >
                  <span class="add-product-upload-icon">
                    ${icons.upload}
                  </span>

                  <strong>Select a replacement invoice</strong>
                  <p>or <span>browse files</span></p>
                  <small>PDF, JPG, PNG or WEBP · Maximum 10 MB</small>
                </div>

                <div
                  class="add-product-file-preview"
                  id="invoice-preview"
                  hidden
                ></div>

                <small class="field-error" data-error="invoice"></small>
              </div>

            </div>
          </section>

          <div
            class="add-product-feedback"
            id="edit-product-feedback"
            role="status"
            aria-live="polite"
            hidden
          ></div>

          <div class="add-product-form-actions">

            <a
              href="#/products"
              class="btn btn-secondary"
              id="edit-product-cancel"
            >
              Cancel
            </a>

            <button
              type="submit"
              class="btn btn-primary add-product-submit"
              id="update-product-button"
            >
              <span>Save changes</span>
              ${icons.arrow}
            </button>

          </div>

        </form>

        <aside class="add-product-sidebar">

          <div class="add-product-sidebar-card">

            <span class="add-product-sidebar-icon">
              ${icons.shield}
            </span>

            <span class="add-product-eyebrow">PRODUCT RECORDS</span>

            <h3>Keep your records accurate.</h3>

            <p>
              Updated product information helps you maintain
              reliable purchase and warranty records.
            </p>

            <div class="add-product-sidebar-divider"></div>

            <div class="add-product-benefit">
              ${icons.check}
              <span>Preserve existing product records</span>
            </div>

            <div class="add-product-benefit">
              ${icons.check}
              <span>Update warranty information</span>
            </div>

            <div class="add-product-benefit">
              ${icons.check}
              <span>Manage supporting documents</span>
            </div>

          </div>

          <div class="add-product-sidebar-tip">
            <strong>Important</strong>
            <p>
              Replacing an image or invoice will remove the
              previously stored file after your changes are saved.
            </p>
          </div>

        </aside>

      </div>
    </div>
  `;
};

const getFormData = (form) => {
  const formData = new FormData(form);

  return {
    name: formData.get("name"),
    brand: formData.get("brand"),
    model: formData.get("model"),
    category: formData.get("category"),
    serialNumber: formData.get("serialNumber"),
    purchaseDate: formData.get("purchaseDate"),
    purchasePrice: formData.get("purchasePrice"),
    warrantyStartDate: formData.get("warrantyStartDate"),
    warrantyEndDate: formData.get("warrantyEndDate"),
    description: formData.get("description"),
  };
};

const initializeEditProductInteractions = async (productId) => {
  const form = document.getElementById("edit-product-form");
  const saveButton = document.getElementById("update-product-button");
  const feedback = document.getElementById("edit-product-feedback");

  const imageInput = document.getElementById("product-image");
  const invoiceInput = document.getElementById("product-invoice");

  const imageZone = document.getElementById("image-upload-zone");
  const invoiceZone = document.getElementById("invoice-upload-zone");

  const imagePreview = document.getElementById("image-preview");
  const invoicePreview = document.getElementById("invoice-preview");

  const existingImageContainer = document.getElementById(
    "existing-image-container",
  );

  const existingInvoiceContainer = document.getElementById(
    "existing-invoice-container",
  );

  const descriptionInput = document.getElementById("product-description");
  const descriptionCount = document.getElementById("description-count");

  const controller = new AbortController();
  const { signal } = controller;

  const user = getCurrentUser();
  const product = getProductById(productId);

  let selectedImage = null;
  let selectedInvoice = null;
  let removeExistingImage = false;
  let removeExistingInvoices = false;
  let isSaving = false;

  let temporaryImageURL = null;
  let existingImageURL = null;

  const invoiceURLs = new Map();

  const cleanupURLs = () => {
    if (temporaryImageURL) {
      URL.revokeObjectURL(temporaryImageURL);
      temporaryImageURL = null;
    }

    if (existingImageURL && product?.imageId) {
      revokeFileURL(product.imageId);
      existingImageURL = null;
    }

    invoiceURLs.forEach((fileId) => revokeFileURL(fileId));
    invoiceURLs.clear();
  };

  const showFeedback = (message, type = "error") => {
    feedback.textContent = message;
    feedback.className = `add-product-feedback is-${type}`;
    feedback.hidden = false;
  };

  const clearFeedback = () => {
    feedback.hidden = true;
    feedback.textContent = "";
  };

  const clearErrors = () => {
    form.querySelectorAll("[data-error]").forEach((element) => {
      element.textContent = "";
    });

    form.querySelectorAll(".has-error").forEach((element) => {
      element.classList.remove("has-error");
    });
  };

  const showErrors = (errors) => {
    clearErrors();

    Object.entries(errors).forEach(([field, message]) => {
      const errorElement = form.querySelector(`[data-error="${field}"]`);

      if (errorElement) {
        errorElement.textContent = message;
      }

      const input = form.elements.namedItem(field);

      if (input?.classList) {
        input.classList.add("has-error");
      }
    });
  };

  const populateForm = () => {
    Object.entries({
      name: product.name,
      brand: product.brand,
      model: product.model,
      category: product.category,
      serialNumber: product.serialNumber,
      purchaseDate: product.purchaseDate,
      purchasePrice: product.purchasePrice,
      warrantyStartDate: product.warrantyStartDate,
      warrantyEndDate: product.warrantyEndDate,
      description: product.description,
    }).forEach(([field, value]) => {
      const input = form.elements.namedItem(field);

      if (input) {
        input.value = value ?? "";
      }
    });

    descriptionCount.textContent = descriptionInput.value.length;
  };

  const renderExistingImage = async () => {
    if (!product.imageId) {
      existingImageContainer.innerHTML = `
        <div class="edit-product-no-file">
          ${icons.image}
          <span>No product image currently stored.</span>
        </div>
      `;

      return;
    }

    try {
      const url = await createFileURL(product.imageId);

      if (signal.aborted) {
        revokeFileURL(product.imageId);
        return;
      }

      existingImageURL = url;

      const image = document.createElement("img");
      image.src = url;
      image.alt = `${product.name} current product image`;

      image.className = "edit-product-existing-image-preview";

      existingImageContainer.replaceChildren(image);

      const details = document.createElement("span");
      details.textContent = "Current product image";

      existingImageContainer.append(details);

      const removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.className = "edit-product-remove-existing";
      removeButton.textContent = "Remove current image";

      removeButton.addEventListener(
        "click",
        () => {
          removeExistingImage = true;
          existingImageContainer.innerHTML = `
            <div class="edit-product-no-file">
              ${icons.close}
              <span>Current image will be removed when changes are saved.</span>
            </div>
          `;
        },
        { signal },
      );

      existingImageContainer.append(removeButton);
    } catch (error) {
      console.warn("Unable to load existing product image:", error);

      existingImageContainer.textContent =
        "Unable to preview the existing image.";
    }
  };

  const renderExistingInvoices = async () => {
    const files = await getFiles({
      ownerId: user.id,
      category: "invoice",
    });

    if (signal.aborted) return;

    const invoices = files.filter((file) => file.productId === product.id);

    if (invoices.length === 0) {
      existingInvoiceContainer.innerHTML = `
        <div class="edit-product-no-file">
          ${icons.file}
          <span>No purchase invoice currently stored.</span>
        </div>
      `;

      return;
    }

    existingInvoiceContainer.innerHTML = "";

    invoices.forEach((file) => {
      const item = document.createElement("div");
      item.className = "edit-product-invoice-item";

      const details = document.createElement("div");
      details.className = "edit-product-invoice-details";

      const name = document.createElement("strong");
      name.textContent = file.name || "Purchase invoice";

      const size = document.createElement("small");
      size.textContent = formatFileSize(file.size || 0);

      details.append(name, size);

      const previewButton = document.createElement("button");
      previewButton.type = "button";
      previewButton.className = "edit-product-file-link";
      previewButton.textContent = "Preview";

      previewButton.addEventListener(
        "click",
        async () => {
          try {
            let url = invoiceURLs.get(file.id);

            if (!url) {
              url = await createFileURL(file.id);
              invoiceURLs.set(file.id, file.id);
            }

            if (!signal.aborted) {
              window.open(url, "_blank", "noopener,noreferrer");
            }
          } catch (error) {
            console.error("Unable to preview invoice:", error);
            showFeedback("Unable to open this invoice.");
          }
        },
        { signal },
      );

      item.append(details, previewButton);
      existingInvoiceContainer.append(item);
    });

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "edit-product-remove-existing";
    removeButton.textContent = "Remove existing invoice(s)";

    removeButton.addEventListener(
      "click",
      () => {
        removeExistingInvoices = true;

        existingInvoiceContainer.innerHTML = `
          <div class="edit-product-no-file">
            ${icons.close}
            <span>Existing invoice(s) will be removed when changes are saved.</span>
          </div>
        `;
      },
      { signal },
    );

    existingInvoiceContainer.append(removeButton);
  };

  const validateImageFile = (file) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      showFeedback("Please select a JPG, PNG or WEBP image.");
      return false;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      showFeedback("Product image cannot exceed 5 MB.");
      return false;
    }

    return true;
  };

  const validateInvoiceFile = (file) => {
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      showFeedback("Please select a PDF or supported image.");
      return false;
    }

    if (file.size > MAX_INVOICE_SIZE) {
      showFeedback("Invoice cannot exceed 10 MB.");
      return false;
    }

    return true;
  };

  const clearImageSelection = () => {
    selectedImage = null;
    imageInput.value = "";
    imagePreview.hidden = true;
    imagePreview.innerHTML = "";

    if (temporaryImageURL) {
      URL.revokeObjectURL(temporaryImageURL);
      temporaryImageURL = null;
    }
  };

  const clearInvoiceSelection = () => {
    selectedInvoice = null;
    invoiceInput.value = "";
    invoicePreview.hidden = true;
    invoicePreview.innerHTML = "";
  };

  const handleImageSelection = (file) => {
    if (!file) return;

    if (!validateImageFile(file)) {
      imageInput.value = "";
      return;
    }

    clearFeedback();

    selectedImage = file;

    if (temporaryImageURL) {
      URL.revokeObjectURL(temporaryImageURL);
    }

    temporaryImageURL = URL.createObjectURL(file);

    imagePreview.innerHTML = `
      <div class="add-product-image-preview">
        <img
          src="${temporaryImageURL}"
          alt="Replacement product image preview"
        />

        <div class="add-product-image-details">
          <strong>${escapeHTML(file.name)}</strong>
          <small>${formatFileSize(file.size)}</small>
        </div>

        <button
          type="button"
          class="add-product-remove-file"
          data-remove-file="image"
          aria-label="Remove selected image"
        >
          ${icons.close}
        </button>
      </div>
    `;

    imagePreview.hidden = false;
  };

  const handleInvoiceSelection = (file) => {
    if (!file) return;

    if (!validateInvoiceFile(file)) {
      invoiceInput.value = "";
      return;
    }

    clearFeedback();

    selectedInvoice = file;

    invoicePreview.innerHTML = `
      <div class="add-product-file-item">
        <span class="add-product-file-item-icon">
          ${icons.file}
        </span>

        <div class="add-product-file-details">
          <strong>${escapeHTML(file.name)}</strong>
          <small>${formatFileSize(file.size)}</small>
        </div>

        <button
          type="button"
          class="add-product-remove-file"
          data-remove-file="invoice"
          aria-label="Remove selected invoice"
        >
          ${icons.close}
        </button>
      </div>
    `;

    invoicePreview.hidden = false;
  };

  const connectUploadZone = (zone, input, handler) => {
    zone.addEventListener("click", () => input.click(), { signal });

    zone.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          input.click();
        }
      },
      { signal },
    );

    zone.addEventListener(
      "dragover",
      (event) => {
        event.preventDefault();
        zone.classList.add("is-dragging");
      },
      { signal },
    );

    zone.addEventListener(
      "dragleave",
      () => zone.classList.remove("is-dragging"),
      { signal },
    );

    zone.addEventListener(
      "drop",
      (event) => {
        event.preventDefault();
        zone.classList.remove("is-dragging");

        handler(event.dataTransfer.files[0]);
      },
      { signal },
    );

    input.addEventListener("change", () => handler(input.files[0]), { signal });
  };

  const cleanupNewFiles = async (fileIds) => {
    for (const fileId of fileIds) {
      if (!fileId) continue;

      try {
        await deleteFile(fileId);
      } catch (error) {
        console.error("Unable to clean up newly uploaded file:", error);
      }
    }
  };

  populateForm();

  await Promise.all([renderExistingImage(), renderExistingInvoices()]);

  if (signal.aborted) return () => {};

  connectUploadZone(imageZone, imageInput, handleImageSelection);
  connectUploadZone(invoiceZone, invoiceInput, handleInvoiceSelection);

  form.addEventListener(
    "click",
    (event) => {
      const removeButton = event.target.closest("[data-remove-file]");

      if (!removeButton) return;

      if (removeButton.dataset.removeFile === "image") {
        clearImageSelection();
      }

      if (removeButton.dataset.removeFile === "invoice") {
        clearInvoiceSelection();
      }
    },
    { signal },
  );

  descriptionInput.addEventListener(
    "input",
    () => {
      descriptionCount.textContent = descriptionInput.value.length;
    },
    { signal },
  );

  form.addEventListener(
    "input",
    (event) => {
      if (event.target.matches("[name]")) {
        const errorElement = form.querySelector(
          `[data-error="${event.target.name}"]`,
        );

        if (errorElement) {
          errorElement.textContent = "";
        }

        event.target.classList.remove("has-error");
      }

      clearFeedback();
    },
    { signal },
  );

  form.addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();

      if (isSaving) return;

      clearFeedback();
      clearErrors();

      const formData = getFormData(form);

      const validation = validateProduct(formData, user.id, productId);

      if (!validation.isValid) {
        showErrors(validation.errors);
        showFeedback("Please correct the highlighted fields.");

        form.querySelector(".has-error")?.focus();
        return;
      }

      isSaving = true;
      saveButton.disabled = true;
      saveButton.classList.add("is-loading");
      saveButton.querySelector("span").textContent = "Saving changes...";

      const newlySavedFiles = [];

      let updatedProduct;

      try {
        let nextImageId = product.imageId;

        if (selectedImage) {
          const savedImage = await saveFile({
            file: selectedImage,
            category: "product-image",
            ownerId: user.id,
            metadata: {
              purpose: "product-image",
            },
          });

          newlySavedFiles.push(savedImage.id);
          nextImageId = savedImage.id;
        } else if (removeExistingImage) {
          nextImageId = "";
        }

        if (selectedInvoice) {
          const savedInvoice = await saveFile({
            file: selectedInvoice,
            category: "invoice",
            ownerId: user.id,
            metadata: {
              purpose: "purchase-invoice",
              productId: product.id,
              productName: formData.name.trim(),
            },
          });

          newlySavedFiles.push(savedInvoice.id);
        }

        updatedProduct = updateProduct(productId, {
          ...formData,
          imageId: nextImageId,
        });

        const oldFileIds = new Set();

        if (product.imageId && product.imageId !== updatedProduct.imageId) {
          oldFileIds.add(product.imageId);
        }

        if (selectedInvoice || removeExistingInvoices) {
          const oldInvoices = await getFiles({
            ownerId: user.id,
            category: "invoice",
          });

          oldInvoices
            .filter((file) => file.productId === product.id)
            .forEach((file) => oldFileIds.add(file.id));
        }

        let cleanupFailed = false;

        for (const fileId of oldFileIds) {
          try {
            revokeFileURL(fileId);
            await deleteFile(fileId);
          } catch (error) {
            cleanupFailed = true;
            console.warn("Unable to remove previous file:", error);
          }
        }

        showFeedback(
          cleanupFailed
            ? "Product updated, but some old files could not be removed."
            : "Product details updated successfully.",
          cleanupFailed ? "error" : "success",
        );

        window.setTimeout(() => {
          window.location.hash = `#/products/${encodeURIComponent(updatedProduct.id)}`;
        }, 1000);
      } catch (error) {
        if (!updatedProduct) {
          await cleanupNewFiles(newlySavedFiles);
        }

        if (error instanceof ProductValidationError) {
          showErrors(error.errors);
          showFeedback("Please review the highlighted product information.");
        } else {
          console.error("Unable to update product:", error);

          showFeedback(
            error.message || "Something went wrong while updating the product.",
          );
        }
      } finally {
        isSaving = false;
        saveButton.disabled = false;
        saveButton.classList.remove("is-loading");
        saveButton.querySelector("span").textContent = "Save changes";
      }
    },
    { signal },
  );

  return () => {
    controller.abort();
    cleanupURLs();
  };
};

export function renderEditProductPage() {
  return `
    <div class="app-layout">
      ${renderSidebar()}

      <div class="app-main">
        ${renderHeader()}

        <main
          class="app-content add-product-content"
          id="app-page-content"
          tabindex="-1"
        >
          <div class="edit-product-loading">
            Loading product information...
          </div>
        </main>
      </div>
    </div>
  `;
}

export function initializeEditProductPage() {
  const cleanupSidebar = initializeSidebar();
  const cleanupHeader = initializeHeader();

  let cleanupInteractions = null;
  let cancelled = false;

  const content = document.getElementById("app-page-content");
  const productId = getProductIdFromURL();

  const showNotFound = () => {
    content.innerHTML = `
      <div class="edit-product-not-found">
        <span>${icons.package}</span>
        <h2>Product not found</h2>
        <p>
          This product does not exist or you do not have permission to edit it.
        </p>
        <a href="#/products" class="btn btn-primary">
          Back to products
        </a>
      </div>
    `;
  };

  const initialize = async () => {
    if (!productId) {
      showNotFound();
      return;
    }

    const product = getProductById(productId);

    if (!product) {
      showNotFound();
      return;
    }

    const user = getCurrentUser();

    if (!user?.id || product.userId !== user.id) {
      showNotFound();
      return;
    }

    content.innerHTML = renderEditProductContent();

    const cleanup = await initializeEditProductInteractions(productId);

    if (cancelled) {
      cleanup?.();
      return;
    }

    cleanupInteractions = cleanup;
  };

  initialize().catch((error) => {
    console.error("Unable to initialize Edit Product page:", error);

    if (!cancelled) {
      content.innerHTML = `
        <div class="edit-product-not-found">
          <h2>Unable to load product</h2>
          <p>Please refresh the page and try again.</p>
          <a href="#/products" class="btn btn-primary">
            Back to products
          </a>
        </div>
      `;
    }
  });

  return () => {
    cancelled = true;
    cleanupInteractions?.();
    cleanupSidebar?.();
    cleanupHeader?.();
  };
}
