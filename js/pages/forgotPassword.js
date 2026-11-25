const shieldIcon = `
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.7"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/>
    <path d="m9 12 2 2 4-4"/>
  </svg>
`;

export function renderForgotPasswordPage() {
  return `
    <main class="auth-page forgot-password-page">
      <section class="auth-container">

        <div class="auth-brand">
          <a href="#/" class="brand-logo" aria-label="ProofPath home">
            <span class="brand-symbol">
              ${shieldIcon}
            </span>
            <span>ProofPath</span>
          </a>
        </div>

        <div class="auth-card forgot-card">

          <a href="#/login" class="auth-back-link">
            <span aria-hidden="true">←</span>
            Back to login
          </a>

          <div class="forgot-icon">
            ${shieldIcon}
          </div>

          <div class="auth-heading">
            <span class="auth-eyebrow">ACCOUNT RECOVERY</span>

            <h1>Forgot your password?</h1>

            <p>
              No worries. Enter the email address associated with
              your account and we'll guide you through the next step.
            </p>
          </div>

          <form id="forgot-password-form" novalidate>

            <div class="form-group">
              <label class="form-label" for="forgot-email">
                Email address
              </label>

              <input
                class="form-control"
                type="email"
                id="forgot-email"
                name="email"
                placeholder="you@example.com"
                autocomplete="email"
                required
                aria-describedby="forgot-email-error"
              />

              <span
                class="form-error"
                id="forgot-email-error"
                role="alert"
              ></span>
            </div>

            <button
              class="btn btn-primary btn-lg forgot-submit"
              type="submit"
            >
              <span class="forgot-button-text">Continue</span>
              <span class="forgot-button-arrow" aria-hidden="true">→</span>
            </button>

          </form>

          <div
            class="forgot-success"
            id="forgot-success"
            role="status"
            aria-live="polite"
            hidden
          >
            <div class="forgot-success-icon" aria-hidden="true">✓</div>

            <h2>Request received</h2>

            <p id="forgot-success-message">
              Your password reset request has been received.
            </p>

            <a href="#/login" class="btn btn-primary btn-block">
              Return to login
            </a>
          </div>

          <p class="auth-footer-text">
            Remember your password?
            <a href="#/login">Sign in</a>
          </p>

        </div>

        <p class="auth-security-note">
          <span aria-hidden="true">◇</span>
          Your account information stays private.
        </p>

      </section>
    </main>
  `;
}

export function initializeForgotPasswordPage() {
  const form = document.querySelector("#forgot-password-form");

  if (!form) return;

  const emailInput = document.querySelector("#forgot-email");
  const errorElement = document.querySelector("#forgot-email-error");
  const submitButton = form.querySelector('button[type="submit"]');
  const buttonText = form.querySelector(".forgot-button-text");

  const successSection = document.querySelector("#forgot-success");
  const successMessage = document.querySelector("#forgot-success-message");
  const authFooter = document.querySelector(
    ".forgot-password-page .auth-footer-text",
  );

  let isSubmitting = false;

  const showError = (message) => {
    errorElement.textContent = message;
    emailInput.classList.add("is-invalid");
    emailInput.setAttribute("aria-invalid", "true");
  };

  const clearError = () => {
    errorElement.textContent = "";
    emailInput.classList.remove("is-invalid");
    emailInput.removeAttribute("aria-invalid");
  };

  emailInput.addEventListener("input", clearError);

  emailInput.addEventListener("blur", () => {
    const email = emailInput.value.trim();

    if (email && !isValidEmail(email)) {
      showError("Please enter a valid email address.");
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (isSubmitting) return;

    const email = emailInput.value.trim();

    clearError();

    if (!email) {
      showError("Email address is required.");
      emailInput.focus();
      return;
    }

    if (!isValidEmail(email)) {
      showError("Please enter a valid email address.");
      emailInput.focus();
      return;
    }

    isSubmitting = true;
    submitButton.disabled = true;
    buttonText.textContent = "Processing...";

    try {
      await new Promise((resolve) => setTimeout(resolve, 900));

      successMessage.textContent =
        "Your reset request has been simulated. No email was sent because ProofPath currently runs without a backend.";

      form.hidden = true;
      successSection.hidden = false;
      authFooter.hidden = true;
    } finally {
      isSubmitting = false;
    }
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
