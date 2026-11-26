import {
  createOrGetVerificationOtp,
  resendVerificationOtp,
  verifyVerificationOtp,
} from "../auth/verificationService.js";

import { getUserByEmail, markEmailVerified } from "../auth/authService.js";

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

  return params.get("email")?.trim().toLowerCase() || "";
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
            <h1 id="verify-title">Verify your email address</h1>
            <p id="verify-description">
              Enter the 6-digit verification code associated with
              ${emailContent}.
            </p>
          </div>

          <div class="verify-demo-notice" id="verify-demo-notice">
            <span aria-hidden="true">ⓘ</span>
            <div>
              <strong>Development Demo OTP</strong>
              <p>
                No email has been sent. Use the code displayed below
                to complete local verification.
              </p>
              <strong class="verify-demo-code" id="verify-demo-code">
                ------
              </strong>
            </div>
          </div>

          <form class="verify-otp-form" id="verify-otp-form" novalidate>

            <div class="form-group">
              <label class="form-label" for="verify-otp-input">
                6-digit verification code
              </label>

              <input
                class="form-control verify-otp-input"
                id="verify-otp-input"
                name="otp"
                type="text"
                inputmode="numeric"
                autocomplete="one-time-code"
                maxlength="6"
                pattern="[0-9]{6}"
                placeholder="Enter 6-digit OTP"
                aria-describedby="verify-otp-error verify-otp-hint"
                required
              />

              <small id="verify-otp-hint">
                Enter all six digits shown in the demo code above.
              </small>

              <span
                class="form-error"
                id="verify-otp-error"
                role="alert"
              ></span>
            </div>

            <div class="verify-otp-meta">
              <span>Code expires in</span>
              <strong id="verify-countdown">05:00</strong>
            </div>

            <div class="auth-alert" id="verify-alert" role="alert" aria-live="polite" hidden></div>

            <button
              class="btn btn-primary btn-lg verify-primary-action"
              id="verify-submit"
              type="submit"
            >
              Verify email <span aria-hidden="true">→</span>
            </button>

            <div class="verify-resend-row">
              <span>Didn't receive a code?</span>
              <button
                class="btn btn-ghost verify-resend-button"
                id="resend-verification"
                type="button"
                disabled
              >
                Resend OTP in 30s
              </button>
            </div>

            <p
              class="verify-feedback"
              id="verify-feedback"
              role="status"
              aria-live="polite"
            ></p>

          </form>

          <div
            class="verify-invalid"
            id="verify-invalid"
            hidden
          >
            <h2>Verification unavailable</h2>
            <p id="verify-invalid-message">
              We couldn't find an account for this email address.
            </p>
            <a href="#/signup" class="btn btn-primary btn-block">
              Create an account
            </a>
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
              Your email verification is complete. You can now sign in
              to your ProofPath account.
            </p>

            <a href="#/login" class="btn btn-primary btn-block">
              Continue to login
            </a>
          </div>

          <div class="verify-footer" id="verify-footer">
            <span>Already have an account?</span>
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
  const email = getEmailFromHash();

  const form = document.querySelector("#verify-otp-form");
  const otpInput = document.querySelector("#verify-otp-input");
  const otpError = document.querySelector("#verify-otp-error");

  const demoCodeElement = document.querySelector("#verify-demo-code");
  const countdownElement = document.querySelector("#verify-countdown");

  const resendButton = document.querySelector("#resend-verification");
  const submitButton = document.querySelector("#verify-submit");

  const feedback = document.querySelector("#verify-feedback");
  const pendingActions = document.querySelector("#verify-otp-form");

  const heading = document.querySelector("#verify-heading");
  const demoNotice = document.querySelector("#verify-demo-notice");
  const footer = document.querySelector("#verify-footer");

  const invalidSection = document.querySelector("#verify-invalid");
  const invalidMessage = document.querySelector("#verify-invalid-message");

  const successSection = document.querySelector("#verify-success");

  if (!form || !otpInput || !resendButton || !submitButton || !successSection) {
    return;
  }

  const controller = new AbortController();
  const { signal } = controller;

  let expiryInterval = null;
  let resendInterval = null;
  let expiresAt = 0;
  let isVerified = false;
  let isSubmitting = false;

  const stopInterval = (interval) => {
    if (interval !== null) {
      window.clearInterval(interval);
    }
  };

  const cleanupIntervals = () => {
    stopInterval(expiryInterval);
    stopInterval(resendInterval);

    expiryInterval = null;
    resendInterval = null;
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds,
    ).padStart(2, "0")}`;
  };

  const showFeedback = (message) => {
    if (feedback) feedback.textContent = message;
  };

  const showError = (message) => {
    if (otpError) otpError.textContent = message;
  };

  const clearError = () => {
    if (otpError) otpError.textContent = "";
  };

  const showInvalidState = (message) => {
    cleanupIntervals();

    if (heading) heading.hidden = true;
    if (demoNotice) demoNotice.hidden = true;
    if (pendingActions) pendingActions.hidden = true;
    if (footer) footer.hidden = true;

    if (invalidMessage) invalidMessage.textContent = message;
    if (invalidSection) invalidSection.hidden = false;
  };

  const showSuccessState = () => {
    isVerified = true;
    cleanupIntervals();

    form.hidden = true;

    if (heading) heading.hidden = true;
    if (demoNotice) demoNotice.hidden = true;
    if (footer) footer.hidden = true;
    if (invalidSection) invalidSection.hidden = true;

    successSection.hidden = false;
    successSection.focus();
  };

  const updateCountdown = () => {
    const remaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));

    countdownElement.textContent = formatTime(remaining);

    if (remaining <= 0) {
      stopInterval(expiryInterval);
      expiryInterval = null;

      submitButton.disabled = true;
      showError("Your OTP has expired. Request a new verification code.");
      showFeedback("Your previous verification code is no longer valid.");
    }
  };

  const startExpiryCountdown = (timestamp) => {
    stopInterval(expiryInterval);

    expiresAt = timestamp;

    updateCountdown();

    expiryInterval = window.setInterval(updateCountdown, 1000);
  };

  const startResendCooldown = (seconds) => {
    stopInterval(resendInterval);

    let remaining = seconds;

    resendButton.disabled = remaining > 0;

    const updateResendButton = () => {
      if (remaining <= 0) {
        stopInterval(resendInterval);
        resendInterval = null;

        resendButton.disabled = false;
        resendButton.textContent = "Resend OTP";

        return;
      }

      resendButton.disabled = true;
      resendButton.textContent = `Resend OTP in ${remaining}s`;
    };

    updateResendButton();

    if (remaining <= 0) return;

    resendInterval = window.setInterval(() => {
      remaining -= 1;
      updateResendButton();
    }, 1000);
  };

  const loadVerification = () => {
    const user = getUserByEmail(email);

    if (!user) {
      showInvalidState(
        "No account was found for this email address. Please create an account first.",
      );

      return false;
    }

    if (user.emailVerified) {
      showInvalidState(
        "This email address has already been verified. Please sign in.",
      );

      return false;
    }

    try {
      const record = createOrGetVerificationOtp(email);

      demoCodeElement.textContent = record.demoCode;

      startExpiryCountdown(record.expiresAt);
      startResendCooldown(record.resendRemaining);

      return true;
    } catch (error) {
      showInvalidState(
        error.message || "Unable to initialize email verification.",
      );

      return false;
    }
  };

  if (!email) {
    showInvalidState(
      "No email address was provided. Please create an account first.",
    );

    return () => {
      cleanupIntervals();
      controller.abort();
    };
  }

  if (!loadVerification()) {
    return () => {
      cleanupIntervals();
      controller.abort();
    };
  }

  otpInput.addEventListener(
    "input",
    () => {
      otpInput.value = otpInput.value.replace(/\D/g, "").slice(0, 6);

      clearError();
    },
    { signal },
  );

  form.addEventListener(
    "submit",
    (event) => {
      event.preventDefault();

      if (isVerified || isSubmitting) return;

      clearError();
      showFeedback("");

      const enteredOtp = otpInput.value.trim();

      if (!/^\d{6}$/.test(enteredOtp)) {
        showError("Please enter a valid 6-digit OTP.");
        otpInput.focus();
        return;
      }

      if (Date.now() >= expiresAt) {
        showError("Your OTP has expired. Request a new verification code.");
        return;
      }

      isSubmitting = true;
      submitButton.disabled = true;
      submitButton.textContent = "Verifying...";

      try {
        const result = verifyVerificationOtp(email, enteredOtp);

        if (!result.success) {
          showError(result.message);

          if (result.reason === "locked" || result.reason === "expired") {
            submitButton.disabled =
              result.reason === "locked" || Date.now() >= expiresAt;
          } else {
            submitButton.disabled = false;
          }

          otpInput.focus();
          return;
        }

        const verifiedUser = markEmailVerified(email);

        if (!verifiedUser?.emailVerified) {
          throw new Error("Unable to update your verification status.");
        }

        showSuccessState();
      } catch (error) {
        showError(error.message || "Verification failed. Please try again.");

        submitButton.disabled = false;
      } finally {
        isSubmitting = false;

        if (!isVerified) {
          submitButton.textContent = "Verify email →";
        }
      }
    },
    { signal },
  );

  resendButton.addEventListener(
    "click",
    () => {
      if (isVerified || resendButton.disabled) return;

      clearError();
      showFeedback("");

      try {
        const record = resendVerificationOtp(email);

        demoCodeElement.textContent = record.demoCode;

        otpInput.value = "";
        submitButton.disabled = false;

        startExpiryCountdown(record.expiresAt);
        startResendCooldown(record.resendRemaining);

        showFeedback(
          "A new demo OTP has been generated. Your previous code is invalid.",
        );
      } catch (error) {
        showFeedback(
          error.message || "Unable to generate a new verification code.",
        );
      }
    },
    { signal },
  );

  return () => {
    cleanupIntervals();
    controller.abort();
  };
}
