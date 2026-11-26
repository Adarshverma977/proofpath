import { renderSidebar, initializeSidebar } from "../components/sidebar.js";
import { renderHeader, initializeHeader } from "../components/header.js";

import {
  addProduct,
  getProductCategories,
  validateProduct,
  ProductValidationError,
} from "../modules/products.js";

import { getCurrentUser } from "../auth/sessionService.js";

import { saveFile, deleteFile } from "../storage/indexedDB.js";

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

const renderCategoryOptions = () => {
  return getProductCategories()
    .map((category) => `<option value="${category}">${category}</option>`)
    .join("");
};

const renderAddProductContent = () => {
  return `
    <div class="add-product-page">

      <div class="add-product-breadcrumb">
        <a href="#/dashboard">Dashboard</a>
        <span>/</span>
        <span>Add product</span>
      </div>

      <section class="add-product-heading">
        <div>
          <span class="add-product-eyebrow">PRODUCT MANAGEMENT</span>
          <h1>Add a new product</h1>
          <p>
            Keep your purchase details, warranty information and
            important documents together in one secure place.
          </p>
        </div>

        <a href="#/dashboard" class="btn btn-secondary add-product-back">
          Back to dashboard
        </a>
      </section>

      <div class="add-product-layout">

        <form class="add-product-form" id="add-product-form" novalidate>

          <section class="add-product-section">

            <div class="add-product-section-heading">
              <span class="add-product-section-icon">
                ${icons.package}
              </span>

              <div>
                <h2>Product information</h2>
                <p>Tell us about the product you purchased.</p>
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
                  placeholder="e.g. Galaxy S24 Ultra"
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
                    placeholder="e.g. Samsung"
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
                    placeholder="e.g. SM-S928B"
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
                    ${renderCategoryOptions()}
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
                    placeholder="Enter serial number"
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
                  placeholder="Add additional information about your product..."
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
                <p>Record when and how much you paid.</p>
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
                      placeholder="0.00"
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
                <p>Save the warranty period for future reference.</p>
              </div>

              <span class="add-product-step">03</span>
            </div>

            <div class="add-product-fields">

              <div class="add-product-warranty-note">
                ${icons.shield}
                <p>
                  Warranty details are optional. You can add them later
                  if they are not available right now.
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
                <p>Upload an image and keep your purchase proof handy.</p>
              </div>

              <span class="add-product-step">04</span>
            </div>

            <div class="add-product-fields">

              <div class="form-group">
                <label class="form-label">Product image</label>

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
                  aria-label="Upload product image"
                >
                  <span class="add-product-upload-icon">
                    ${icons.image}
                  </span>
                  <strong>Drop your product image here</strong>
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
                  Purchase invoice
                  <span class="optional-label">OPTIONAL</span>
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
                  aria-label="Upload purchase invoice"
                >
                  <span class="add-product-upload-icon">
                    ${icons.upload}
                  </span>
                  <strong>Upload your purchase invoice</strong>
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
            id="add-product-feedback"
            role="status"
            aria-live="polite"
            hidden
          ></div>

          <div class="add-product-form-actions">
            <a href="#/dashboard" class="btn btn-secondary">
              Cancel
            </a>

            <button
              type="submit"
              class="btn btn-primary add-product-submit"
              id="save-product-button"
            >
              <span>Save product</span>
              ${icons.arrow}
            </button>
          </div>

        </form>

        <aside class="add-product-sidebar">

          <div class="add-product-sidebar-card">
            <span class="add-product-sidebar-icon">
              ${icons.shield}
            </span>

            <span class="add-product-eyebrow">YOUR DIGITAL VAULT</span>
            <h3>Every purchase deserves proof.</h3>

            <p>
              Keep product details, warranty dates and purchase
              documents organized in one place.
            </p>

            <div class="add-product-sidebar-divider"></div>

            <div class="add-product-benefit">
              ${icons.check}
              <span>Track warranty expiry dates</span>
            </div>

            <div class="add-product-benefit">
              ${icons.check}
              <span>Store purchase documentation</span>
            </div>

            <div class="add-product-benefit">
              ${icons.check}
              <span>Maintain your ownership records</span>
            </div>
          </div>

          <div class="add-product-sidebar-tip">
            <strong>A little tip</strong>
            <p>
              Keep your serial number and invoice details accurate.
              They can help when preparing a warranty claim.
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

const initializeAddProductInteractions = () => {
  const form = document.getElementById("add-product-form");
  const saveButton = document.getElementById("save-product-button");
  const feedback = document.getElementById("add-product-feedback");

  const imageInput = document.getElementById("product-image");
  const invoiceInput = document.getElementById("product-invoice");

  const imageZone = document.getElementById("image-upload-zone");
  const invoiceZone = document.getElementById("invoice-upload-zone");

  const imagePreview = document.getElementById("image-preview");
  const invoicePreview = document.getElementById("invoice-preview");

  const descriptionInput = document.getElementById("product-description");
  const descriptionCount = document.getElementById("description-count");

  const abortController = new AbortController();
  const { signal } = abortController;

  let selectedImage = null;
  let selectedInvoice = null;
  let temporaryImageURL = null;
  let isSaving = false;

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

  const validateCurrentForm = () => {
    const result = validateProduct(getFormData(form), getCurrentUser()?.id);

    showErrors(result.errors);

    return result.isValid;
  };

  const renderFilePreview = (file, container, type) => {
    container.innerHTML = `
      <div class="add-product-file-item">
        <span class="add-product-file-item-icon">
          ${type === "image" ? icons.image : icons.file}
        </span>

        <div class="add-product-file-details">
          <strong>${file.name}</strong>
          <small>${formatFileSize(file.size)}</small>
        </div>

        <button
          type="button"
          class="add-product-remove-file"
          data-remove-file="${type}"
          aria-label="Remove ${type}"
        >
          ${icons.close}
        </button>
      </div>
    `;

    container.hidden = false;
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

  const validateImageFile = (file) => {
    if (!file) return false;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      showErrors({ image: "Please select a JPG, PNG or WEBP image." });
      return false;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      showErrors({ image: "Product image cannot exceed 5 MB." });
      return false;
    }

    return true;
  };

  const validateInvoiceFile = (file) => {
    if (!file) return false;

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      showErrors({ invoice: "Please select a PDF or supported image." });
      return false;
    }

    if (file.size > MAX_INVOICE_SIZE) {
      showErrors({ invoice: "Invoice cannot exceed 10 MB." });
      return false;
    }

    return true;
  };

  const handleImageSelection = (file) => {
    if (!validateImageFile(file)) return;

    clearErrors();

    selectedImage = file;

    if (temporaryImageURL) {
      URL.revokeObjectURL(temporaryImageURL);
    }

    temporaryImageURL = URL.createObjectURL(file);

    imagePreview.innerHTML = `
      <div class="add-product-image-preview">
        <img src="${temporaryImageURL}" alt="Selected product preview" />

        <div class="add-product-image-details">
          <strong>${file.name}</strong>
          <small>${formatFileSize(file.size)}</small>
        </div>

        <button
          type="button"
          class="add-product-remove-file"
          data-remove-file="image"
          aria-label="Remove image"
        >
          ${icons.close}
        </button>
      </div>
    `;

    imagePreview.hidden = false;
  };

  const handleInvoiceSelection = (file) => {
    if (!validateInvoiceFile(file)) return;

    selectedInvoice = file;
    clearErrors();

    renderFilePreview(file, invoicePreview, "invoice");
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

      if (!validateCurrentForm()) {
        showFeedback("Please correct the highlighted fields.");
        form.querySelector(".has-error")?.focus();
        return;
      }

      const user = getCurrentUser();

      if (!user?.id) {
        showFeedback("Your session has expired. Please log in again.");
        return;
      }

      isSaving = true;
      saveButton.disabled = true;
      saveButton.classList.add("is-loading");
      saveButton.querySelector("span").textContent = "Saving product...";

      let savedImage = null;
      let savedInvoice = null;
      let createdProduct = null;

      try {
        if (selectedImage) {
          savedImage = await saveFile({
            file: selectedImage,
            category: "product-image",
            ownerId: user.id,
            metadata: {
              purpose: "product-image",
            },
          });
        }

        createdProduct = addProduct({
          ...getFormData(form),
          imageId: savedImage?.id || "",
        });

        if (selectedInvoice) {
          savedInvoice = await saveFile({
            file: selectedInvoice,
            category: "invoice",
            ownerId: user.id,
            metadata: {
              purpose: "purchase-invoice",
              productId: createdProduct.id,
              productName: createdProduct.name,
            },
          });
        }

        showFeedback(
          "Your product has been successfully added to your vault.",
          "success",
        );

        form.reset();
        clearImageSelection();
        clearInvoiceSelection();

        descriptionCount.textContent = "0";
        clearErrors();

        window.setTimeout(() => {
          window.location.hash = "#/products";
        }, 1200);
      } catch (error) {
        if (createdProduct) {
          try {
            const { deleteProduct } = await import("../modules/products.js");
            deleteProduct(createdProduct.id);
          } catch (rollbackError) {
            console.error("Product rollback failed:", rollbackError);
          }
        }

        if (savedImage?.id) {
          try {
            await deleteFile(savedImage.id);
          } catch (rollbackError) {
            console.error("Image rollback failed:", rollbackError);
          }
        }

        if (savedInvoice?.id) {
          try {
            await deleteFile(savedInvoice.id);
          } catch (rollbackError) {
            console.error("Invoice rollback failed:", rollbackError);
          }
        }

        if (error instanceof ProductValidationError) {
          showErrors(error.errors);
          showFeedback("Please review the product information.");
        } else {
          console.error("Unable to save product:", error);
          showFeedback(
            error.message || "Something went wrong while saving your product.",
          );
        }
      } finally {
        isSaving = false;
        saveButton.disabled = false;
        saveButton.classList.remove("is-loading");
        saveButton.querySelector("span").textContent = "Save product";
      }
    },
    { signal },
  );

  return () => {
    abortController.abort();

    if (temporaryImageURL) {
      URL.revokeObjectURL(temporaryImageURL);
    }
  };
};

export function renderAddProductPage() {
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
          ${renderAddProductContent()}
        </main>
      </div>
    </div>
  `;
}

export function initializeAddProductPage() {
  const cleanupSidebar = initializeSidebar();
  const cleanupHeader = initializeHeader();
  const cleanupInteractions = initializeAddProductInteractions();

  return () => {
    cleanupSidebar?.();
    cleanupHeader?.();
    cleanupInteractions?.();
  };
}
