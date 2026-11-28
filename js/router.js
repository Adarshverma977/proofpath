import { renderLandingPage, initializeLandingInteractions } from "./app.js";

import { renderAuthPage, initializeAuthPage } from "./pages/auth.js";

import {
  renderForgotPasswordPage,
  initializeForgotPasswordPage,
} from "./pages/forgotPassword.js";

import {
  renderDashboardPage,
  initializeDashboardPage,
} from "./pages/dashboard.js";

import {
  renderProductsPage,
  initializeProductsPage,
} from "./pages/products.js";

import {
  renderAddProductPage,
  initializeAddProductPage,
} from "./pages/addProduct.js";

import {
  renderEditProductPage,
  initializeEditProductPage,
} from "./pages/editProduct.js";

import {
  renderProductDetailsPage,
  initializeProductDetailsPage,
} from "./pages/productDetails.js";

import {
  renderDocumentsPage,
  initializeDocumentsPage,
} from "./pages/documents.js";

import {
  renderWarrantyPage,
  initializeWarrantyPage,
} from "./pages/warranty.js";

import { renderClaimsPage, initializeClaimsPage } from "./pages/claims.js";

import {
  renderVerifyEmailPage,
  initializeVerifyEmailPage,
} from "./pages/verifyEmail.js";

import { isAuthenticated } from "./auth/sessionService.js";

const app = document.getElementById("app");

let previousRoute = null;
let currentPageCleanup = null;
let activePageStyles = [];
let navigationId = 0;

const authRoutes = ["/login", "/signup"];

const routes = {
  "/": {
    render: renderLandingPage,
    initialize: initializeLandingInteractions,
    access: "public",
    styles: ["./css/pages/landing.css"],
  },

  "/login": {
    render: renderAuthPage,
    initialize: initializeAuthPage,
    access: "guest",
    styles: ["./css/pages/auth.css"],
  },

  "/signup": {
    render: renderAuthPage,
    initialize: initializeAuthPage,
    access: "guest",
    styles: ["./css/pages/auth.css"],
  },

  "/forgot-password": {
    render: renderForgotPasswordPage,
    initialize: initializeForgotPasswordPage,
    access: "guest",
    styles: ["./css/pages/forgot-password.css"],
  },

  "/verify-email": {
    render: renderVerifyEmailPage,
    initialize: initializeVerifyEmailPage,
    access: "public",
    styles: ["./css/pages/verify-email.css"],
  },

  "/dashboard": {
    render: renderDashboardPage,
    initialize: initializeDashboardPage,
    access: "protected",
    styles: ["./css/pages/dashboard.css"],
  },

  "/products/new": {
    render: renderAddProductPage,
    initialize: initializeAddProductPage,
    access: "protected",
    styles: ["./css/pages/add-product.css"],
  },

  "/products": {
    render: renderProductsPage,
    initialize: initializeProductsPage,
    access: "protected",
    styles: ["./css/pages/products.css"],
  },

  "/products/:id": {
    render: renderProductDetailsPage,
    initialize: initializeProductDetailsPage,
    access: "protected",
    styles: ["./css/pages/product-details.css"],
  },

  "/products/:id/edit": {
    render: renderEditProductPage,
    initialize: initializeEditProductPage,
    access: "protected",
    styles: ["./css/pages/add-product.css", "./css/pages/edit-product.css"],
  },

  "/documents": {
    render: renderDocumentsPage,
    initialize: initializeDocumentsPage,
    access: "protected",
    styles: ["./css/pages/documents.css"],
  },

  "/warranties": {
    render: renderWarrantyPage,
    initialize: initializeWarrantyPage,
    access: "protected",
    styles: ["./css/pages/warranty.css"],
  },

  "/claims": {
    render: renderClaimsPage,
    initialize: initializeClaimsPage,
    access: "protected",
    styles: ["./css/pages/claims.css"],
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

  const path = hash.slice(1).split("?")[0];

  return path.replace(/\/+$/, "") || "/";
};

const resolveRoute = (currentRoute) => {
  if (routes[currentRoute]) {
    return routes[currentRoute];
  }

  const editProductMatch = currentRoute.match(/^\/products\/([^/]+)\/edit$/);

  if (editProductMatch) {
    return routes["/products/:id/edit"];
  }

  const productDetailsMatch = currentRoute.match(/^\/products\/([^/]+)$/);

  if (productDetailsMatch) {
    return routes["/products/:id"];
  }

  return null;
};

const loadStylesheet = (href) => {
  const existingStylesheet = document.querySelector(
    `link[data-page-stylesheet="${href}"]`,
  );

  if (existingStylesheet) {
    return Promise.resolve(existingStylesheet);
  }

  return new Promise((resolve, reject) => {
    const stylesheet = document.createElement("link");

    stylesheet.rel = "stylesheet";
    stylesheet.href = href;
    stylesheet.dataset.pageStylesheet = href;

    stylesheet.onload = () => resolve(stylesheet);

    stylesheet.onerror = () => {
      stylesheet.remove();
      reject(new Error(`Unable to load stylesheet: ${href}`));
    };

    document.head.appendChild(stylesheet);
  });
};

const loadPageStyles = async (styles = []) => {
  const loadedStyles = [];

  try {
    for (const href of styles) {
      const stylesheet = await loadStylesheet(href);
      loadedStyles.push(stylesheet);
    }

    return loadedStyles;
  } catch (error) {
    loadedStyles.forEach((stylesheet) => {
      stylesheet.remove();
    });

    throw error;
  }
};

const removeActivePageStyles = () => {
  activePageStyles.forEach((stylesheet) => {
    stylesheet.remove();
  });

  activePageStyles = [];
};

const cleanupCurrentPage = () => {
  if (typeof currentPageCleanup === "function") {
    currentPageCleanup();
  }

  currentPageCleanup = null;
};

const updateAuthMode = (currentRoute) => {
  const authScene = document.getElementById("auth-card-scene");

  if (!authScene) {
    return false;
  }

  authScene.classList.toggle("is-signup", currentRoute === "/signup");

  return true;
};

const checkRouteAccess = (route, currentRoute) => {
  const authenticated = isAuthenticated();

  if (route.access === "protected" && !authenticated) {
    window.location.hash = "#/login";
    return false;
  }

  if (route.access === "guest" && authenticated) {
    window.location.hash = "#/dashboard";
    return false;
  }

  return true;
};

const renderPlaceholderPage = (title, description) => {
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

          <a href="#/" class="btn btn-primary auth-submit">
            Back to home →
          </a>
        </div>
      </section>
    </main>
  `;
};

const renderNotFoundPage = () => {
  app.innerHTML = renderPlaceholderPage(
    "Page not found.",
    "The page you are looking for does not exist.",
  );
};

const renderRoute = async () => {
  const currentRoute = getCurrentRoute();

  if (currentRoute === null) {
    return;
  }

  const currentNavigationId = ++navigationId;

  const route = resolveRoute(currentRoute);

  if (!route) {
    cleanupCurrentPage();
    removeActivePageStyles();
    renderNotFoundPage();

    previousRoute = currentRoute;
    return;
  }

  if (!checkRouteAccess(route, currentRoute)) {
    return;
  }

  const isAuthTransition =
    authRoutes.includes(previousRoute) && authRoutes.includes(currentRoute);

  if (isAuthTransition && updateAuthMode(currentRoute)) {
    previousRoute = currentRoute;
    return;
  }

  cleanupCurrentPage();

  let nextPageStyles = [];

  try {
    nextPageStyles = await loadPageStyles(route.styles);

    if (currentNavigationId !== navigationId) {
      nextPageStyles.forEach((stylesheet) => {
        if (!activePageStyles.includes(stylesheet)) {
          stylesheet.remove();
        }
      });

      return;
    }

    removeActivePageStyles();

    activePageStyles = nextPageStyles;

    app.innerHTML = route.render();

    if (typeof route.initialize === "function") {
      const cleanup = route.initialize();

      currentPageCleanup = typeof cleanup === "function" ? cleanup : null;
    }

    previousRoute = currentRoute;

    window.scrollTo({
      top: 0,
      behavior: "auto",
    });
  } catch (error) {
    console.error("Route rendering failed:", error);

    if (currentNavigationId === navigationId) {
      cleanupCurrentPage();
      removeActivePageStyles();

      renderPlaceholderPage(
        "Something went wrong.",
        "We could not load this page. Please try again.",
      );

      previousRoute = currentRoute;
    }
  }
};

export const initializeRouter = () => {
  window.addEventListener("hashchange", renderRoute);

  if (!window.location.hash) {
    window.history.replaceState(null, "", "#/");
  }

  renderRoute();

  return () => {
    window.removeEventListener("hashchange", renderRoute);

    navigationId++;

    cleanupCurrentPage();
    removeActivePageStyles();
  };
};
