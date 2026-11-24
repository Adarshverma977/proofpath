import { renderLandingPage, initializeLandingInteractions } from "./app.js";
import { renderAuthPage, initializeAuthPage } from "./pages/auth.js";

const app = document.getElementById("app");

let previousRoute = null;

const authRoutes = ["/login", "/signup"];

const renderPlaceholderPage = (title, description, link) => {
  return `
        <main class="auth-page">
            <section class="auth-container">

                <div class="auth-brand">
                    <a href="#/" class="brand-logo">
                        <span class="brand-period">ProofPath.</span>
                    </a>
                </div>

                <div class="auth-card">

                    <div class="auth-heading">
                        <span class="auth-eyebrow">PROOFPATH</span>
                        <h1>${title}</h1>
                        <p>${description}</p>
                    </div>

                    <a href="${link}" class="btn btn-primary auth-submit">
                        Back to login →
                    </a>

                </div>

            </section>
        </main>
    `;
};

const routes = {
  "/": {
    render: renderLandingPage,
    initialize: initializeLandingInteractions,
  },

  "/login": {
    render: renderAuthPage,
    initialize: initializeAuthPage,
  },

  "/signup": {
    render: renderAuthPage,
    initialize: initializeAuthPage,
  },

  "/forgot-password": {
    render: () =>
      renderPlaceholderPage(
        "Reset your password.",
        "The password recovery experience is coming next.",
        "#/login",
      ),
  },

  "/verify-email": {
    render: () =>
      renderPlaceholderPage(
        "Verify your email.",
        "The email verification experience is coming next.",
        "#/login",
      ),
  },
};

const getCurrentRoute = () => {
  const hash = window.location.hash;

  if (!hash || hash === "#") {
    return "/";
  }

  if (!hash.startsWith("#/")) {
    return null;
  }

  return hash.slice(1).split("?")[0];
};

const updateAuthMode = (currentRoute) => {
  const authScene = document.getElementById("auth-card-scene");

  if (!authScene) {
    return false;
  }

  authScene.classList.toggle("is-signup", currentRoute === "/signup");

  return true;
};

const renderNotFoundPage = () => {
  app.innerHTML = renderPlaceholderPage(
    "Page not found.",
    "The page you are looking for does not exist.",
    "#/",
  );
};

const renderRoute = () => {
  const currentRoute = getCurrentRoute();

  if (currentRoute === null) {
    return;
  }

  const route = routes[currentRoute];

  if (!route) {
    renderNotFoundPage();
    previousRoute = currentRoute;
    return;
  }

  const isAuthTransition =
    authRoutes.includes(previousRoute) && authRoutes.includes(currentRoute);

  if (isAuthTransition && updateAuthMode(currentRoute)) {
    previousRoute = currentRoute;
    return;
  }

  app.innerHTML = route.render();

  if (route.initialize) {
    route.initialize();
  }

  previousRoute = currentRoute;

  window.scrollTo({
    top: 0,
    behavior: "auto",
  });
};

export const initializeRouter = () => {
  window.addEventListener("hashchange", renderRoute);

  if (!window.location.hash) {
    window.history.replaceState(null, "", "#/");
  }

  renderRoute();
};
