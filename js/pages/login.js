export function renderLoginPage() {
  return `
    <main class="auth-page">
      <section class="auth-container">

        <div class="auth-brand">
          <a href="#/" class="brand-logo" aria-label="ProofPath home">
            <span class="brand-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/>
                <path d="m9 12 2 2 4-4"/>
              </svg>
            </span>
            <span>ProofPath<span class="brand-period">.</span></span>
          </a>
        </div>

        <div class="auth-card">

          <div class="auth-heading">
            <span class="auth-eyebrow">WELCOME BACK</span>
            <h1>Good to see you again.</h1>
            <p>Sign in to continue managing your product records.</p>
          </div>

          <form class="auth-form" id="login-form" novalidate>

            <div class="form-group">
              <label class="form-label" for="login-email">
                Email address
              </label>

              <input
                class="form-control"
                type="email"
                id="login-email"
                name="email"
                placeholder="you@example.com"
                autocomplete="email"
                aria-describedby="email-error"
                required
              />

              <span class="form-error" id="email-error" aria-live="polite"></span>
            </div>

            <div class="form-group">

              <div class="auth-label-row">
                <label class="form-label" for="login-password">
                  Password
                </label>

                <a href="#/forgot-password" class="auth-text-link">
                  Forgot password?
                </a>
              </div>

              <div class="password-field">

                <input
                  class="form-control"
                  type="password"
                  id="login-password"
                  name="password"
                  placeholder="Enter your password"
                  autocomplete="current-password"
                  aria-describedby="password-error"
                  required
                />

                <button
                  type="button"
                  class="password-toggle"
                  id="password-toggle"
                  aria-label="Show password"
                  aria-pressed="false"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>

              </div>

              <span class="form-error" id="password-error" aria-live="polite"></span>

            </div>

            <div class="auth-options">
              <label class="remember-option">
                <input
                  type="checkbox"
                  id="remember-me"
                  name="remember"
                />
                <span>Remember me</span>
              </label>
            </div>

            <div
              class="auth-alert"
              id="login-alert"
              role="alert"
              aria-live="polite"
              hidden
            ></div>

            <button type="submit" class="btn btn-primary auth-submit">
              <span>Sign in</span>
              <span aria-hidden="true">→</span>
            </button>

          </form>

          <div class="auth-divider">
            <span>NEW TO PROOFPATH?</span>
          </div>

          <p class="auth-switch">
            Don't have an account?
            <a href="#/signup" class="auth-text-link">
              Create an account
            </a>
          </p>

          <div class="auth-security">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/>
              <path d="m9 12 2 2 4-4"/>
            </svg>

            <span>Your product records deserve a trusted home.</span>
          </div>

        </div>

        <p class="auth-footer">
          © ${new Date().getFullYear()} ProofPath. All rights reserved.
        </p>

      </section>
    </main>
  `;
}

export function initializeLoginPage() {
  const form = document.querySelector("#login-form");

  if (!form) return;

  const emailInput = document.querySelector("#login-email");
  const passwordInput = document.querySelector("#login-password");
  const passwordToggle = document.querySelector("#password-toggle");
  const rememberCheckbox = document.querySelector("#remember-me");

  const emailError = document.querySelector("#email-error");
  const passwordError = document.querySelector("#password-error");
  const alertBox = document.querySelector("#login-alert");

  if (
    !emailInput ||
    !passwordInput ||
    !passwordToggle ||
    !rememberCheckbox ||
    !emailError ||
    !passwordError ||
    !alertBox
  ) {
    return;
  }

  const clearAlert = () => {
    alertBox.textContent = "";
    alertBox.hidden = true;
  };

  const clearEmailError = () => {
    emailError.textContent = "";
    emailInput.removeAttribute("aria-invalid");
  };

  const clearPasswordError = () => {
    passwordError.textContent = "";
    passwordInput.removeAttribute("aria-invalid");
  };

  passwordToggle.addEventListener("click", () => {
    const isPassword = passwordInput.type === "password";

    passwordInput.type = isPassword ? "text" : "password";

    passwordToggle.setAttribute(
      "aria-label",
      isPassword ? "Hide password" : "Show password",
    );

    passwordToggle.setAttribute("aria-pressed", String(isPassword));
  });

  emailInput.addEventListener("input", () => {
    clearEmailError();
    clearAlert();
  });

  passwordInput.addEventListener("input", () => {
    clearPasswordError();
    clearAlert();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    clearEmailError();
    clearPasswordError();
    clearAlert();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    let isValid = true;

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      emailError.textContent = "Email address is required.";
      emailInput.setAttribute("aria-invalid", "true");
      isValid = false;
    } else if (!emailPattern.test(email)) {
      emailError.textContent = "Please enter a valid email address.";
      emailInput.setAttribute("aria-invalid", "true");
      isValid = false;
    }

    if (!password) {
      passwordError.textContent = "Password is required.";
      passwordInput.setAttribute("aria-invalid", "true");
      isValid = false;
    }

    if (!isValid) {
      const firstInvalidField = form.querySelector('[aria-invalid="true"]');
      firstInvalidField?.focus();
      return;
    }

    const rememberMe = rememberCheckbox.checked;

    alertBox.textContent =
      "Login interface validated successfully. Authentication will be connected in a later step.";

    alertBox.hidden = false;

    console.log("Login form validated:", {
      email,
      rememberMe,
    });
  });
}
