import { getUserByEmail, updateUserPassword } from "../auth/authService.js";

import {
  createPasswordResetOtp,
  resendPasswordResetOtp,
  verifyPasswordResetOtp,
  isPasswordResetVerified,
  getPasswordResetStatus,
  clearPasswordResetOtp,
} from "../auth/passwordResetService.js";

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
            <h1 id="forgot-heading">Forgot your password?</h1>
            <p id="forgot-description">
              Enter the email address associated with your account
              and we'll guide you through the recovery process.
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

          <section id="forgot-otp-section" hidden>

            <div class="forgot-step-info">
              <p>
                Demo OTP generated for
                <strong id="forgot-otp-email"></strong>
              </p>

              <div class="forgot-demo-code">
                <span>YOUR DEMO OTP</span>
                <strong id="forgot-demo-code"></strong>
              </div>

              <p class="forgot-demo-note">
                This is a frontend demonstration. No email has been sent.
              </p>
            </div>

            <form id="forgot-otp-form" novalidate>
              <div class="form-group">
                <label class="form-label" for="forgot-otp">
                  Six-digit verification code
                </label>

                <input
                  class="form-control forgot-otp-input"
                  type="text"
                  id="forgot-otp"
                  name="otp"
                  inputmode="numeric"
                  autocomplete="one-time-code"
                  maxlength="6"
                  placeholder="Enter OTP"
                  required
                  aria-describedby="forgot-otp-error"
                />

                <span
                  class="form-error"
                  id="forgot-otp-error"
                  role="alert"
                ></span>
              </div>

              <div class="forgot-otp-timers">
                <p>
                  OTP expires in
                  <strong id="forgot-expiry-timer">05:00</strong>
                </p>

                <p>
                  <button
                    type="button"
                    id="forgot-resend-button"
                    class="forgot-resend-button"
                    disabled
                  >
                    Resend OTP
                    <span id="forgot-resend-timer">(30s)</span>
                  </button>
                </p>
              </div>

              <button
                class="btn btn-primary btn-lg forgot-submit"
                type="submit"
                id="forgot-verify-button"
              >
                Verify OTP
                <span aria-hidden="true">→</span>
              </button>
            </form>
          </section>

          <section id="forgot-new-password-section" hidden>
            <form id="forgot-new-password-form" novalidate>

              <div class="form-group">
                <label class="form-label" for="forgot-new-password">
                  New password
                </label>

                <input
                  class="form-control"
                  type="password"
                  id="forgot-new-password"
                  name="newPassword"
                  placeholder="Enter new password"
                  autocomplete="new-password"
                  required
                  minlength="8"
                  aria-describedby="forgot-new-password-error"
                />

                <span
                  class="form-error"
                  id="forgot-new-password-error"
                  role="alert"
                ></span>
              </div>

              <div class="form-group">
                <label class="form-label" for="forgot-confirm-password">
                  Confirm new password
                </label>

                <input
                  class="form-control"
                  type="password"
                  id="forgot-confirm-password"
                  name="confirmPassword"
                  placeholder="Confirm new password"
                  autocomplete="new-password"
                  required
                  minlength="8"
                  aria-describedby="forgot-confirm-password-error"
                />

                <span
                  class="form-error"
                  id="forgot-confirm-password-error"
                  role="alert"
                ></span>
              </div>

              <p class="forgot-password-hint">
                Your password must contain at least 8 characters.
              </p>

              <button
                class="btn btn-primary btn-lg forgot-submit"
                type="submit"
                id="forgot-reset-button"
              >
                Update password
                <span aria-hidden="true">→</span>
              </button>

            </form>
          </section>

          <div
            class="forgot-success"
            id="forgot-success"
            role="status"
            aria-live="polite"
            hidden
          >
            <div class="forgot-success-icon" aria-hidden="true">✓</div>

            <h2>Password updated</h2>

            <p id="forgot-success-message">
              Your password has been updated successfully.
            </p>

            <a href="#/login" class="btn btn-primary btn-block">
              Continue to login
            </a>
          </div>

          <div
            class="forgot-feedback"
            id="forgot-feedback"
            role="alert"
            aria-live="polite"
            hidden
          ></div>

          <p class="auth-footer-text" id="forgot-auth-footer">
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

  const controller = new AbortController();
  const { signal } = controller;

  const emailInput = document.querySelector("#forgot-email");
  const emailError = document.querySelector("#forgot-email-error");

  const otpSection = document.querySelector("#forgot-otp-section");
  const otpForm = document.querySelector("#forgot-otp-form");
  const otpInput = document.querySelector("#forgot-otp");
  const otpError = document.querySelector("#forgot-otp-error");
  const otpEmail = document.querySelector("#forgot-otp-email");
  const demoCode = document.querySelector("#forgot-demo-code");

  const expiryTimer = document.querySelector("#forgot-expiry-timer");
  const resendTimer = document.querySelector("#forgot-resend-timer");
  const resendButton = document.querySelector("#forgot-resend-button");
  const verifyButton = document.querySelector("#forgot-verify-button");

  const newPasswordSection = document.querySelector(
    "#forgot-new-password-section",
  );
  const newPasswordForm = document.querySelector("#forgot-new-password-form");

  const newPasswordInput = document.querySelector("#forgot-new-password");

  const confirmPasswordInput = document.querySelector(
    "#forgot-confirm-password",
  );

  const newPasswordError = document.querySelector("#forgot-new-password-error");

  const confirmPasswordError = document.querySelector(
    "#forgot-confirm-password-error",
  );

  const resetButton = document.querySelector("#forgot-reset-button");

  const successSection = document.querySelector("#forgot-success");
  const successMessage = document.querySelector("#forgot-success-message");

  const heading = document.querySelector("#forgot-heading");
  const description = document.querySelector("#forgot-description");
  const authFooter = document.querySelector("#forgot-auth-footer");
  const feedback = document.querySelector("#forgot-feedback");

  let currentEmail = "";
  let expiryInterval = null;
  let resendInterval = null;
  let isSubmitting = false;
  let isVerified = false;

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const setFeedback = (message) => {
    feedback.textContent = message;
    feedback.hidden = !message;
  };

  const clearFieldError = (input, errorElement) => {
    errorElement.textContent = "";
    input.classList.remove("is-invalid");
    input.removeAttribute("aria-invalid");
  };

  const showFieldError = (input, errorElement, message) => {
    errorElement.textContent = message;
    input.classList.add("is-invalid");
    input.setAttribute("aria-invalid", "true");
  };

  const clearAllFieldErrors = () => {
    clearFieldError(emailInput, emailError);
    clearFieldError(otpInput, otpError);
    clearFieldError(newPasswordInput, newPasswordError);
    clearFieldError(confirmPasswordInput, confirmPasswordError);
  };

  const setButtonLoading = (button, loading, loadingText, normalText) => {
    button.disabled = loading;
    button.textContent = loading ? loadingText : normalText;
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds,
    ).padStart(2, "0")}`;
  };

  const stopTimers = () => {
    if (expiryInterval !== null) {
      clearInterval(expiryInterval);
      expiryInterval = null;
    }

    if (resendInterval !== null) {
      clearInterval(resendInterval);
      resendInterval = null;
    }
  };

  const startExpiryTimer = (expiresAt) => {
    if (expiryInterval !== null) {
      clearInterval(expiryInterval);
    }

    const update = () => {
      const remaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));

      expiryTimer.textContent = formatTime(remaining);

      if (remaining <= 0) {
        clearInterval(expiryInterval);
        expiryInterval = null;

        verifyButton.disabled = true;
        setFeedback("Your OTP has expired. Request a new OTP to continue.");
      }
    };

    update();

    if (Date.now() < expiresAt) {
      expiryInterval = setInterval(update, 1000);
    }
  };

  const startResendCooldown = (resendAvailableAt) => {
    if (resendInterval !== null) {
      clearInterval(resendInterval);
    }

    const update = () => {
      const remaining = Math.max(
        0,
        Math.ceil((resendAvailableAt - Date.now()) / 1000),
      );

      resendButton.disabled = remaining > 0;
      resendTimer.textContent = remaining > 0 ? `(${remaining}s)` : "";

      if (remaining <= 0) {
        clearInterval(resendInterval);
        resendInterval = null;
      }
    };

    update();

    if (Date.now() < resendAvailableAt) {
      resendInterval = setInterval(update, 1000);
    }
  };

  const displayOtpRecord = (record) => {
    demoCode.textContent = record.demoCode;
    otpInput.value = "";

    verifyButton.disabled = record.locked || record.remainingSeconds <= 0;

    startExpiryTimer(record.expiresAt);
    startResendCooldown(record.resendAvailableAt);

    setFeedback("");

    otpInput.focus();
  };

  const showOtpStep = (record) => {
    form.hidden = true;
    otpSection.hidden = false;
    newPasswordSection.hidden = true;

    heading.textContent = "Verify your email";
    description.textContent =
      "Enter the six-digit verification code to continue resetting your password.";

    otpEmail.textContent = currentEmail;

    displayOtpRecord(record);
  };

  const showPasswordStep = () => {
    stopTimers();

    otpSection.hidden = true;
    newPasswordSection.hidden = false;

    heading.textContent = "Create a new password";
    description.textContent =
      "Choose a strong password that you have not used before.";

    setFeedback("");

    newPasswordInput.focus();
  };

  const showSuccessStep = () => {
    stopTimers();

    form.hidden = true;
    otpSection.hidden = true;
    newPasswordSection.hidden = true;
    successSection.hidden = false;
    authFooter.hidden = true;

    heading.textContent = "Password reset complete";
    description.textContent = "Your account password has been updated.";

    successMessage.textContent =
      "Your new password is ready. You can now sign in using your updated credentials.";

    setFeedback("");
  };

  const showInitialStep = () => {
    stopTimers();

    form.hidden = false;
    otpSection.hidden = true;
    newPasswordSection.hidden = true;
    successSection.hidden = true;
    authFooter.hidden = false;

    heading.textContent = "Forgot your password?";
    description.textContent =
      "Enter the email address associated with your account and we'll guide you through the recovery process.";
  };

  emailInput.addEventListener(
    "input",
    () => {
      clearFieldError(emailInput, emailError);
      setFeedback("");
    },
    { signal },
  );

  emailInput.addEventListener(
    "blur",
    () => {
      const email = emailInput.value.trim();

      if (email && !isValidEmail(email)) {
        showFieldError(
          emailInput,
          emailError,
          "Please enter a valid email address.",
        );
      }
    },
    { signal },
  );

  form.addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();

      if (isSubmitting) return;

      const email = emailInput.value.trim().toLowerCase();

      clearFieldError(emailInput, emailError);
      setFeedback("");

      if (!email) {
        showFieldError(emailInput, emailError, "Email address is required.");

        emailInput.focus();
        return;
      }

      if (!isValidEmail(email)) {
        showFieldError(
          emailInput,
          emailError,
          "Please enter a valid email address.",
        );

        emailInput.focus();
        return;
      }

      isSubmitting = true;

      const submitButton = form.querySelector('button[type="submit"]');

      setButtonLoading(submitButton, true, "Processing...", "Continue →");

      try {
        const user = getUserByEmail(email);

        if (!user) {
          throw new Error("No account was found with this email address.");
        }

        currentEmail = email;

        const record = createPasswordResetOtp(email);

        showOtpStep(record);
      } catch (error) {
        showFieldError(
          emailInput,
          emailError,
          error.message || "Unable to start password recovery.",
        );
      } finally {
        isSubmitting = false;
        submitButton.disabled = false;
        submitButton.innerHTML = `
          <span class="forgot-button-text">Continue</span>
          <span class="forgot-button-arrow" aria-hidden="true">→</span>
        `;
      }
    },
    { signal },
  );

  otpInput.addEventListener(
    "input",
    () => {
      otpInput.value = otpInput.value.replace(/\D/g, "").slice(0, 6);
      clearFieldError(otpInput, otpError);
      setFeedback("");
    },
    { signal },
  );

  otpForm.addEventListener(
    "submit",
    (event) => {
      event.preventDefault();

      if (isSubmitting) return;

      clearFieldError(otpInput, otpError);
      setFeedback("");

      const enteredOtp = otpInput.value.trim();

      if (!/^\d{6}$/.test(enteredOtp)) {
        showFieldError(
          otpInput,
          otpError,
          "Please enter a valid six-digit OTP.",
        );

        otpInput.focus();
        return;
      }

      try {
        const result = verifyPasswordResetOtp(currentEmail, enteredOtp);

        if (result.success) {
          isVerified = true;
          showPasswordStep();
        }
      } catch (error) {
        showFieldError(
          otpInput,
          otpError,
          error.message || "OTP verification failed.",
        );

        const status = getPasswordResetStatus(currentEmail);

        if (status) {
          if (status.locked) {
            verifyButton.disabled = true;
            setFeedback(
              "Maximum attempts reached. Request a new OTP after the cooldown.",
            );
          } else if (status.remainingSeconds <= 0) {
            verifyButton.disabled = true;
            setFeedback("Your OTP has expired. Request a new OTP.");
          }
        }
      }
    },
    { signal },
  );

  resendButton.addEventListener(
    "click",
    () => {
      if (isSubmitting || resendButton.disabled) return;

      try {
        const record = resendPasswordResetOtp(currentEmail);

        displayOtpRecord(record);
      } catch (error) {
        setFeedback(error.message || "Unable to resend OTP.");
      }
    },
    { signal },
  );

  newPasswordInput.addEventListener(
    "input",
    () => {
      clearFieldError(newPasswordInput, newPasswordError);
      setFeedback("");
    },
    { signal },
  );

  confirmPasswordInput.addEventListener(
    "input",
    () => {
      clearFieldError(confirmPasswordInput, confirmPasswordError);
      setFeedback("");
    },
    { signal },
  );

  newPasswordForm.addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();

      if (isSubmitting) return;

      clearFieldError(newPasswordInput, newPasswordError);
      clearFieldError(confirmPasswordInput, confirmPasswordError);
      setFeedback("");

      const newPassword = newPasswordInput.value;
      const confirmPassword = confirmPasswordInput.value;

      if (newPassword.length < 8) {
        showFieldError(
          newPasswordInput,
          newPasswordError,
          "Password must contain at least 8 characters.",
        );

        newPasswordInput.focus();
        return;
      }

      if (newPassword !== confirmPassword) {
        showFieldError(
          confirmPasswordInput,
          confirmPasswordError,
          "Passwords do not match.",
        );

        confirmPasswordInput.focus();
        return;
      }

      if (!isVerified || !isPasswordResetVerified(currentEmail)) {
        setFeedback(
          "Please complete OTP verification again before updating your password.",
        );

        showInitialStep();
        return;
      }

      isSubmitting = true;

      setButtonLoading(resetButton, true, "Updating...", "Update password →");

      try {
        await updateUserPassword({
          email: currentEmail,
          newPassword,
        });

        clearPasswordResetOtp(currentEmail);

        isVerified = false;

        newPasswordForm.reset();

        showSuccessStep();
      } catch (error) {
        setFeedback(error.message || "Unable to update your password.");
      } finally {
        isSubmitting = false;

        if (!successSection.hidden) {
          resetButton.disabled = false;
        } else {
          resetButton.disabled = false;
          resetButton.textContent = "Update password →";
        }
      }
    },
    { signal },
  );

  showInitialStep();

  return () => {
    stopTimers();
    controller.abort();
  };
}
