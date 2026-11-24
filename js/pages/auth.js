const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function renderAuthPage() {
  const isSignup = window.location.hash.startsWith("#/signup");

  return `
    <main class="auth-layout">

      <section class="auth-brand-panel">

        <div class="auth-brand-content">

          <a href="#/" class="auth-logo">
            <span class="auth-logo-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/>
                <path d="m9 12 2 2 4-4"/>
              </svg>
            </span>
            <span>ProofPath<span>.</span></span>
          </a>

          <div class="auth-brand-message">
            <span class="auth-eyebrow">YOUR PRODUCTS, ONE TRUSTED PLACE</span>

            <h1>
              Every product has a story.
              <span>Keep its proof.</span>
            </h1>

            <p>
              Bring your purchase documents, warranties and service history
              together in one thoughtful digital space.
            </p>
          </div>

          <div class="auth-illustration">

            <div class="auth-document auth-document-back">
              <span>WARRANTY RECORD</span>
              <div class="auth-document-lines">
                <i></i>
                <i></i>
                <i></i>
              </div>
            </div>

            <div class="auth-document auth-document-front">

              <div class="auth-document-heading">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
                  <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/>
                  <path d="m9 12 2 2 4-4"/>
                </svg>
                <span>PROOFPATH RECORD</span>
              </div>

              <div class="auth-document-seal">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="m5 12 4 4L19 6"/>
                </svg>
              </div>

              <span class="auth-document-caption">DIGITAL PRODUCT PROFILE</span>
              <h3>Product record</h3>

              <div class="auth-document-lines">
                <i></i>
                <i></i>
                <i></i>
              </div>

              <span class="auth-document-id">PP-2026-00842</span>

            </div>

            <div class="auth-floating-note">
              <span class="auth-floating-icon">✓</span>
              <div>
                <strong>Proof organized</strong>
                <small>Your records, together.</small>
              </div>
            </div>

          </div>

          <div class="auth-brand-footer">
            <span>ONE PLACE. EVERY PROOF. BETTER ORGANIZED.</span>
          </div>

        </div>

      </section>

      <section class="auth-form-panel">

        <div class="auth-mobile-brand">
          <a href="#/" class="auth-logo">
            <span class="auth-logo-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/>
                <path d="m9 12 2 2 4-4"/>
              </svg>
            </span>
            <span>ProofPath<span>.</span></span>
          </a>
        </div>

        <div class="auth-form-wrapper">

          <div class="auth-card-scene ${isSignup ? "is-signup" : ""}" id="auth-card-scene">

            <div class="auth-flip-card">

              <div class="auth-face auth-front">

                <div class="auth-heading">
                  <span class="auth-eyebrow">WELCOME BACK</span>
                  <h2>Good to see you again.</h2>
                  <p>Sign in to continue managing your product records.</p>
                </div>

                <form class="auth-form" id="login-form" novalidate>

                  <div class="form-group">
                    <label class="form-label" for="auth-login-email">
                      Email address
                    </label>

                    <input
                      class="form-control"
                      type="email"
                      id="auth-login-email"
                      placeholder="you@example.com"
                      autocomplete="email"
                      required
                    />

                    <span class="form-error" id="login-email-error"></span>
                  </div>

                  <div class="form-group">

                    <div class="auth-label-row">
                      <label class="form-label" for="auth-login-password">
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
                        id="auth-login-password"
                        placeholder="Enter your password"
                        autocomplete="current-password"
                        required
                      />

                      <button
                        type="button"
                        class="password-toggle"
                        data-password-toggle="auth-login-password"
                        aria-label="Show password"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      </button>
                    </div>

                    <span class="form-error" id="login-password-error"></span>

                  </div>

                  <div class="auth-options">
                    <label class="remember-option">
                      <input type="checkbox" id="auth-remember-me"/>
                      <span>Remember me</span>
                    </label>
                  </div>

                  <div class="auth-alert" id="login-alert" role="alert" hidden></div>

                  <button type="submit" class="btn btn-primary auth-submit">
                    Sign in <span>→</span>
                  </button>

                </form>

                <div class="auth-divider">
                  <span>NEW TO PROOFPATH?</span>
                </div>

                <p class="auth-switch">
                  Don't have an account?
                  <a href="#/signup" class="auth-text-link">Create an account</a>
                </p>

              </div>

              <div class="auth-face auth-back">

                <div class="auth-heading">
                  <span class="auth-eyebrow">GET STARTED</span>
                  <h2>Create your account.</h2>
                  <p>Start keeping your product history organized.</p>
                </div>

                <form class="auth-form" id="signup-form" novalidate>

                  <div class="form-group">
                    <label class="form-label" for="auth-full-name">
                      Full name
                    </label>

                    <input
                      class="form-control"
                      type="text"
                      id="auth-full-name"
                      placeholder="Enter your full name"
                      autocomplete="name"
                      required
                    />

                    <span class="form-error" id="signup-name-error"></span>
                  </div>

                  <div class="form-group">
                    <label class="form-label" for="auth-signup-email">
                      Email address
                    </label>

                    <input
                      class="form-control"
                      type="email"
                      id="auth-signup-email"
                      placeholder="you@example.com"
                      autocomplete="email"
                      required
                    />

                    <span class="form-error" id="signup-email-error"></span>
                  </div>

                  <div class="form-group">
                    <label class="form-label" for="auth-signup-password">
                      Password
                    </label>

                    <div class="password-field">
                      <input
                        class="form-control"
                        type="password"
                        id="auth-signup-password"
                        placeholder="Create a password"
                        autocomplete="new-password"
                        required
                      />

                      <button
                        type="button"
                        class="password-toggle"
                        data-password-toggle="auth-signup-password"
                        aria-label="Show password"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      </button>
                    </div>

                    <div class="password-strength" id="password-strength">
                      <div class="password-strength-track">
                        <span id="password-strength-bar"></span>
                      </div>
                      <small id="password-strength-label">Password strength</small>
                    </div>

                    <span class="form-error" id="signup-password-error"></span>
                  </div>

                  <div class="form-group">
                    <label class="form-label" for="auth-confirm-password">
                      Confirm password
                    </label>

                    <input
                      class="form-control"
                      type="password"
                      id="auth-confirm-password"
                      placeholder="Re-enter your password"
                      autocomplete="new-password"
                      required
                    />

                    <span class="form-error" id="signup-confirm-error"></span>
                  </div>

                  <label class="remember-option terms-option">
                    <input type="checkbox" id="auth-terms"/>
                    <span>
                      I agree to the
                      <a href="#/terms" class="auth-text-link">Terms of Service</a>
                      and
                      <a href="#/privacy" class="auth-text-link">Privacy Policy</a>.
                    </span>
                  </label>

                  <span class="form-error" id="signup-terms-error"></span>

                  <div class="auth-alert" id="signup-alert" role="alert" hidden></div>

                  <button type="submit" class="btn btn-primary auth-submit">
                    Create account <span>→</span>
                  </button>

                </form>

                <div class="auth-divider">
                  <span>ALREADY REGISTERED?</span>
                </div>

                <p class="auth-switch">
                  Already have an account?
                  <a href="#/login" class="auth-text-link">Sign in</a>
                </p>

              </div>

            </div>

          </div>

          <div class="auth-security">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
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

export function initializeAuthPage() {
  const loginForm = document.querySelector("#login-form");
  const signupForm = document.querySelector("#signup-form");

  if (!loginForm || !signupForm) return;

  const scene = document.querySelector("#auth-card-scene");

  const isSignup = window.location.hash.startsWith("#/signup");

  scene?.classList.toggle("is-signup", isSignup);

  document.querySelectorAll("[data-password-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const input = document.getElementById(button.dataset.passwordToggle);

      if (!input) return;

      const isPassword = input.type === "password";

      input.type = isPassword ? "text" : "password";

      button.setAttribute(
        "aria-label",
        isPassword ? "Hide password" : "Show password",
      );
    });
  });

  const clearError = (id) => {
    const error = document.getElementById(id);

    if (error) error.textContent = "";
  };

  const showAlert = (id, message) => {
    const alert = document.getElementById(id);

    if (!alert) return;

    alert.textContent = message;
    alert.hidden = false;
  };

  const clearAlert = (id) => {
    const alert = document.getElementById(id);

    if (!alert) return;

    alert.textContent = "";
    alert.hidden = true;
  };

  const passwordInput = document.querySelector("#auth-signup-password");
  const strengthBar = document.querySelector("#password-strength-bar");
  const strengthLabel = document.querySelector("#password-strength-label");

  const getPasswordStrength = (password) => {
    let score = 0;

    if (password.length >= 8) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    return score;
  };

  passwordInput.addEventListener("input", () => {
    const score = getPasswordStrength(passwordInput.value);

    const labels = [
      "Password strength",
      "Weak password",
      "Fair password",
      "Good password",
      "Strong password",
    ];

    strengthBar.style.width = `${score * 25}%`;
    strengthLabel.textContent = labels[score];

    clearError("signup-password-error");
  });

  loginForm.addEventListener("input", (event) => {
    if (event.target.id === "auth-login-email") {
      clearError("login-email-error");
    }

    if (event.target.id === "auth-login-password") {
      clearError("login-password-error");
    }

    clearAlert("login-alert");
  });

  signupForm.addEventListener("input", (event) => {
    const errorMap = {
      "auth-full-name": "signup-name-error",
      "auth-signup-email": "signup-email-error",
      "auth-signup-password": "signup-password-error",
      "auth-confirm-password": "signup-confirm-error",
    };

    const errorId = errorMap[event.target.id];

    if (errorId) clearError(errorId);

    clearAlert("signup-alert");
  });

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    clearAlert("login-alert");

    const email = document.querySelector("#auth-login-email").value.trim();
    const password = document.querySelector("#auth-login-password").value;

    let valid = true;

    if (!email) {
      showAlert("login-email-error", "Email address is required.");
      valid = false;
    } else if (!emailPattern.test(email)) {
      showAlert("login-email-error", "Enter a valid email address.");
      valid = false;
    }

    if (!password) {
      showAlert("login-password-error", "Password is required.");
      valid = false;
    }

    if (!valid) return;

    showAlert(
      "login-alert",
      "Login form validated successfully. Authentication will be connected later.",
    );
  });

  signupForm.addEventListener("submit", (event) => {
    event.preventDefault();

    clearAlert("signup-alert");

    const name = document.querySelector("#auth-full-name").value.trim();
    const email = document.querySelector("#auth-signup-email").value.trim();
    const password = passwordInput.value;
    const confirmPassword = document.querySelector(
      "#auth-confirm-password",
    ).value;
    const termsAccepted = document.querySelector("#auth-terms").checked;

    let valid = true;

    if (name.length < 2) {
      showAlert("signup-name-error", "Please enter your full name.");
      valid = false;
    }

    if (!email) {
      showAlert("signup-email-error", "Email address is required.");
      valid = false;
    } else if (!emailPattern.test(email)) {
      showAlert("signup-email-error", "Enter a valid email address.");
      valid = false;
    }

    if (password.length < 8) {
      showAlert(
        "signup-password-error",
        "Password must contain at least 8 characters.",
      );
      valid = false;
    }

    if (password !== confirmPassword) {
      showAlert("signup-confirm-error", "Passwords do not match.");
      valid = false;
    }

    if (!termsAccepted) {
      showAlert("signup-terms-error", "Please accept the terms to continue.");
      valid = false;
    }

    if (!valid) return;

    showAlert(
      "signup-alert",
      "Signup form validated successfully. Account creation will be connected later.",
    );
  });
}
