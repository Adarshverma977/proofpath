let activeModal = null;
let previouslyFocusedElement = null;

const modalIcons = {
  close: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
      <path d="m18 6-12 12M6 6l12 12"/>
    </svg>
  `,
  warning: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
      <path d="M10.3 3.9 2.5 17.4A2 2 0 0 0 4.2 20h15.6a2 2 0 0 0 1.7-2.6L13.7 3.9a2 2 0 0 0-3.4 0Z"/>
      <path d="M12 9v4m0 3h.01"/>
    </svg>
  `,
};

const getFocusableElements = (modal) => {
  return [
    ...modal.querySelectorAll(`
      a[href],
      button:not([disabled]),
      input:not([disabled]),
      select:not([disabled]),
      textarea:not([disabled]),
      [tabindex]:not([tabindex="-1"])
    `),
  ].filter(
    (element) =>
      !element.hidden &&
      !element.inert &&
      element.getAttribute("aria-hidden") !== "true",
  );
};

const createModalElement = ({
  title = "",
  description = "",
  content = "",
  size = "medium",
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  variant = "default",
  actions = [],
}) => {
  const overlay = document.createElement("div");

  overlay.className = `app-modal-overlay is-${variant}`;

  overlay.innerHTML = `
    <section
      class="app-modal is-${size}"
      role="dialog"
      aria-modal="true"
      aria-labelledby="app-modal-title"
      tabindex="-1"
    >
      <header class="app-modal-header">

        <div class="app-modal-heading">
          <h2 id="app-modal-title">${title}</h2>

          ${description ? `<p>${description}</p>` : ""}
        </div>

        ${
          showCloseButton
            ? `
              <button
                type="button"
                class="app-modal-close"
                aria-label="Close dialog"
                data-modal-close
              >
                ${modalIcons.close}
              </button>
            `
            : ""
        }

      </header>

      <div class="app-modal-body">
        ${content}
      </div>

      ${
        actions.length
          ? `
            <footer class="app-modal-footer">
              ${actions
                .map(
                  (action, index) => `
                    <button
                      type="button"
                      class="btn ${action.variant || "btn-secondary"}"
                      data-modal-action="${index}"
                      ${action.disabled ? "disabled" : ""}
                    >
                      ${action.label}
                    </button>
                  `,
                )
                .join("")}
            </footer>
          `
          : ""
      }
    </section>
  `;

  return overlay;
};

export const closeModal = (result = null) => {
  if (!activeModal) return false;

  const currentModal = activeModal;

  activeModal = null;

  currentModal.controller.abort();

  currentModal.overlay.classList.remove("is-visible");

  document.body.classList.remove("modal-open");

  currentModal.overlay.remove();

  if (previouslyFocusedElement?.isConnected) {
    previouslyFocusedElement.focus();
  }

  previouslyFocusedElement = null;

  currentModal.resolve?.(result);

  return true;
};

export const openModal = ({
  title = "",
  description = "",
  content = "",
  size = "medium",
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  variant = "default",
  actions = [],
  onClose = null,
} = {}) => {
  if (activeModal) {
    closeModal();
  }

  previouslyFocusedElement = document.activeElement;

  const overlay = createModalElement({
    title,
    description,
    content,
    size,
    showCloseButton,
    closeOnBackdrop,
    closeOnEscape,
    variant,
    actions,
  });

  const modal = overlay.querySelector(".app-modal");

  const controller = new AbortController();
  const { signal } = controller;

  const modalState = {
    overlay,
    modal,
    controller,
    resolve: null,
    onClose,
  };

  activeModal = modalState;

  const handleClose = () => {
    const callback = modalState.onClose;

    closeModal();

    if (typeof callback === "function") {
      callback();
    }
  };

  overlay.addEventListener(
    "click",
    (event) => {
      if (event.target.closest("[data-modal-close]")) {
        handleClose();
        return;
      }

      if (closeOnBackdrop && event.target === overlay) {
        handleClose();
      }
    },
    { signal },
  );

  modal.addEventListener(
    "click",
    (event) => {
      const button = event.target.closest("[data-modal-action]");

      if (!button) return;

      const index = Number(button.dataset.modalAction);
      const action = actions[index];

      if (!action || action.disabled) return;

      if (typeof action.onClick === "function") {
        action.onClick({
          close: closeModal,
          modal,
        });
      }

      if (action.closeOnClick !== false) {
        handleClose();
      }
    },
    { signal },
  );

  document.addEventListener(
    "keydown",
    (event) => {
      if (activeModal !== modalState) return;

      if (event.key === "Escape" && closeOnEscape) {
        event.preventDefault();
        handleClose();
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = getFocusableElements(modal);

      if (!focusableElements.length) {
        event.preventDefault();
        modal.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    },
    { signal },
  );

  document.body.appendChild(overlay);

  document.body.classList.add("modal-open");

  requestAnimationFrame(() => {
    if (activeModal !== modalState) return;

    overlay.classList.add("is-visible");

    const focusableElements = getFocusableElements(modal);

    if (focusableElements.length) {
      focusableElements[0].focus();
    } else {
      modal.focus();
    }
  });

  return {
    close: closeModal,
    element: modal,
    overlay,
  };
};

export const confirmModal = ({
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
} = {}) => {
  return new Promise((resolve) => {
    const modalInstance = openModal({
      title,
      description,
      size: "small",
      content: `
        <div class="app-modal-confirm-icon">
          ${modalIcons.warning}
        </div>
      `,
      actions: [
        {
          label: cancelLabel,
          variant: "btn-secondary",
          onClick: () => resolve(false),
        },
        {
          label: confirmLabel,
          variant: variant === "danger" ? "btn-danger" : "btn-primary",
          onClick: () => resolve(true),
        },
      ],
      onClose: () => resolve(false),
    });

    modalInstance.promise = resolve;
  });
};
