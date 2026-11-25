const shieldIcon = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
    stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"
    aria-hidden="true">
    <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/>
    <path d="m9 12 2 2 4-4"/>
  </svg>
`;

const mailIcon = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
    stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"
    aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="2"/>
    <path d="m3 7 9 6 9-6"/>
  </svg>
`;

const getEmailFromHash = () => {
  const query = window.location.hash.split("?")[1] || "";
  const params = new URLSearchParams(query);

  return params.get("email")?.trim() || "";
};

const escapeHTML = (value) => {
  return value.replace(/[&<>"']/g, (character) => {
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

export function renderVerifyEmailPage() {
  const email = getEmailFromHash();
  const safeEmail = escapeHTML(email);

  const emailContent = safeEmail
    ? `<strong class="verify-email-address">${safeEmail}</strong>`
    : `<strong class="verify-email-address">your registered email address</strong>`;

  return `
    <main class="auth-page verify-email-page">
      <section class="auth-container">

        <div class="auth-brand">
          <a href="#/" class="brand-logo" aria-label="ProofPath home">
            <span class="brand-symbol">${shieldIcon}</span>
            <span>ProofPath</span>
          </a>
        </div>

        <div class="auth-card verify-card">

          <div class="verify-icon" aria-hidden="true">
            ${mailIcon}
          </div>

          <div class="auth-heading verify-heading" id="verify-heading">
            <span class="auth-eyebrow">EMAIL VERIFICATION</span>
            <h1 id="verify-title">Check your inbox</h1>
            <p id="verify-description">
              We've prepared a verification request for
              ${emailContent}. Complete the verification step to continue.
            </p>
          </div>

          <div class="verify-demo-notice" id="verify-demo-notice">
            <span aria-hidden="true">ⓘ</span>
            <p>
              Demo mode: ProofPath is currently frontend-only.
              No verification email has been sent.
            </p>
          </div>

          <div class="verify-actions" id="verify-pending-actions">

            <button
              class="btn btn-primary btn-lg verify-primary-action"
              id="simulate-verification"
              type="button"
            >
              Simulate email verification
              <span aria-hidden="true">→</span>
            </button>

            <button
              class="btn btn-secondary verify-resend-button"
              id="resend-verification"
              type="button"
            >
              Resend verification email
            </button>

            <p
              class="verify-feedback"
              id="verify-feedback"
              role="status"
              aria-live="polite"
            ></p>

          </div>

          <div
            class="verify-success"
            id="verify-success"
            tabindex="-1"
            hidden
          >
            <div class="verify-success-icon" aria-hidden="true">✓</div>

            <h2>Email verified</h2>

            <p>
              Your demo verification is complete. You can now continue
              to the ProofPath login screen.
            </p>

            <a href="#/login" class="btn btn-primary btn-block">
              Continue to login
            </a>
          </div>

          <div class="verify-footer" id="verify-footer">
            <span>Already verified?</span>
            <a href="#/login">Sign in</a>
          </div>

        </div>

        <p class="auth-security-note">
          <span aria-hidden="true">◇</span>
          Your account information stays private.
        </p>

      </section>
    </main>
  `;
}

export function initializeVerifyEmailPage() {
  const resendButton = document.querySelector("#resend-verification");
  const simulateButton = document.querySelector("#simulate-verification");

  const feedback = document.querySelector("#verify-feedback");
  const pendingActions = document.querySelector("#verify-pending-actions");
  const successSection = document.querySelector("#verify-success");

  const heading = document.querySelector("#verify-heading");
  const demoNotice = document.querySelector("#verify-demo-notice");
  const footer = document.querySelector("#verify-footer");

  if (!resendButton || !simulateButton || !successSection) return;

  let remainingSeconds = 0;
  let cooldownInterval = null;
  let isVerified = false;

  const stopCooldown = () => {
    if (cooldownInterval !== null) {
      window.clearInterval(cooldownInterval);
      cooldownInterval = null;
    }

    remainingSeconds = 0;
  };

  const startCooldown = () => {
    remainingSeconds = 30;

    resendButton.disabled = true;
    resendButton.textContent = `Resend available in ${remainingSeconds}s`;

    stopCooldown();

    remainingSeconds = 30;

    cooldownInterval = window.setInterval(() => {
      remainingSeconds -= 1;

      if (remainingSeconds <= 0) {
        stopCooldown();

        resendButton.disabled = false;
        resendButton.textContent = "Resend verification email";

        feedback.textContent = "You can request another demo resend.";

        return;
      }

      resendButton.textContent = `Resend available in ${remainingSeconds}s`;
    }, 1000);
  };

  resendButton.addEventListener("click", () => {
    if (resendButton.disabled || isVerified) return;

    feedback.textContent = "Demo resend request recorded. No email was sent.";

    startCooldown();
  });

  simulateButton.addEventListener("click", () => {
    if (isVerified) return;

    isVerified = true;

    stopCooldown();

    resendButton.disabled = true;
    simulateButton.disabled = true;

    heading.hidden = true;
    demoNotice.hidden = true;
    pendingActions.hidden = true;
    footer.hidden = true;

    successSection.hidden = false;
    successSection.focus();
  });

  window.addEventListener("hashchange", stopCooldown, { once: true });
}
