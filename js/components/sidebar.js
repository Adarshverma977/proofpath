const icons = {
  dashboard: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
      <rect x="3" y="3" width="8" height="8" rx="1.5"/>
      <rect x="13" y="3" width="8" height="5" rx="1.5"/>
      <rect x="13" y="10" width="8" height="11" rx="1.5"/>
      <rect x="3" y="13" width="8" height="8" rx="1.5"/>
    </svg>
  `,
  products: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
      <path d="m12 3 9 5-9 5-9-5 9-5Z"/>
      <path d="m3 8 9 5 9-5"/>
      <path d="M3 8v9l9 5 9-5V8"/>
      <path d="M12 13v9"/>
    </svg>
  `,
  warranties: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
      <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>
  `,
  claims: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
      <path d="M8 3h8l5 5v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3Z"/>
      <path d="M16 3v5h5M8 13h8M8 17h5"/>
    </svg>
  `,
  documents: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
      <path d="M6 3h9l4 4v14H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/>
      <path d="M15 3v5h5M8 13h8M8 17h8"/>
    </svg>
  `,
  insights: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
      <path d="M3 3v18h18"/>
      <path d="m7 14 4-4 4 3 6-7"/>
    </svg>
  `,
  notifications: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/>
      <path d="M10 21h4"/>
    </svg>
  `,
  settings: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.5 2.6-.2-.1a1.7 1.7 0 0 0-1.9.3l-.1.1h-3l-.1-.2a1.7 1.7 0 0 0-1.5-1.1 1.7 1.7 0 0 0-1.5 1.1l-.1.2h-3l-.1-.2a1.7 1.7 0 0 0-1.5-1.1 1.7 1.7 0 0 0-1.5 1.1l-.1.2-2.6-1.5.1-.2a1.7 1.7 0 0 0-.3-1.9l-.1-.1v-3l.2-.1a1.7 1.7 0 0 0 1.1-1.5 1.7 1.7 0 0 0-1.1-1.5l-.2-.1V7.3l.2-.1a1.7 1.7 0 0 0 1.1-1.5 1.7 1.7 0 0 0-1.1-1.5l-.2-.1 1.5-2.6.2.1a1.7 1.7 0 0 0 1.9-.3l.1-.1h3l.1.2a1.7 1.7 0 0 0 1.5 1.1 1.7 1.7 0 0 0 1.5-1.1l.1-.2h3l.1.2a1.7 1.7 0 0 0 1.5 1.1 1.7 1.7 0 0 0 1.5-1.1l.1-.2 2.6 1.5-.1.2a1.7 1.7 0 0 0 .3 1.9l.1.1v3l-.2.1a1.7 1.7 0 0 0-1.1 1.5 1.7 1.7 0 0 0 1.1 1.5l.2.1V15Z"/>
    </svg>
  `,
  plus: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
      <path d="M12 5v14M5 12h14"/>
    </svg>
  `,
  chevron: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
      <path d="m9 18 6-6-6-6"/>
    </svg>
  `,
  close: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
      <path d="m18 6-12 12M6 6l12 12"/>
    </svg>
  `,
};

const navigationGroups = [
  {
    label: "WORKSPACE",
    items: [
      { label: "Dashboard", path: "/dashboard", icon: "dashboard" },
      { label: "My Products", path: "/products", icon: "products" },
      { label: "Warranties", path: "/warranties", icon: "warranties" },
      { label: "Claims", path: "/claims", icon: "claims" },
    ],
  },
  {
    label: "MANAGEMENT",
    items: [
      { label: "Documents Vault", path: "/documents", icon: "documents" },
      { label: "Insights", path: "/insights", icon: "insights" },
      { label: "Notifications", path: "/notifications", icon: "notifications" },
    ],
  },
  {
    label: "PREFERENCES",
    items: [{ label: "Settings", path: "/settings", icon: "settings" }],
  },
];

let previousFocusElement = null;

const getCurrentPath = () => {
  const hash = window.location.hash;

  if (!hash || hash === "#") return "/dashboard";

  return hash.slice(1).split("?")[0].replace(/\/+$/, "") || "/";
};

const isNavigationItemActive = (itemPath, currentPath) => {
  if (itemPath === "/dashboard") {
    return currentPath === "/dashboard";
  }

  return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);
};

const renderNavigationItem = (item, currentPath) => {
  const isActive = isNavigationItemActive(item.path, currentPath);

  return `
    <a
      href="#${item.path}"
      class="app-sidebar-link ${isActive ? "is-active" : ""}"
      data-sidebar-link
      data-tooltip="${item.label}"
      ${isActive ? 'aria-current="page"' : ""}
    >
      <span class="app-sidebar-link-icon">
        ${icons[item.icon]}
      </span>

      <span class="app-sidebar-link-label">
        ${item.label}
      </span>

      <span class="app-sidebar-active-indicator"></span>
    </a>
  `;
};

export function renderSidebar() {
  const currentPath = getCurrentPath();

  return `
    <aside
      class="app-sidebar"
      id="app-sidebar"
      aria-label="Main navigation"
    >
      <div class="app-sidebar-top">

        <a
          href="#/dashboard"
          class="app-sidebar-brand"
          aria-label="ProofPath dashboard"
        >
          <span class="app-sidebar-brand-symbol">
            ${icons.warranties}
          </span>

          <span class="app-sidebar-brand-name">
            ProofPath<span>.</span>
          </span>
        </a>

        <button
          type="button"
          class="app-sidebar-close"
          id="sidebar-mobile-close"
          aria-label="Close navigation"
        >
          ${icons.close}
        </button>

        <button
          type="button"
          class="app-sidebar-collapse"
          id="sidebar-collapse"
          aria-label="Collapse sidebar"
          aria-pressed="false"
        >
          ${icons.chevron}
        </button>

      </div>

      <div class="app-sidebar-create">
        <a
          href="#/products/new"
          class="app-sidebar-create-button"
          data-sidebar-link
        >
          <span class="app-sidebar-create-icon">
            ${icons.plus}
          </span>

          <span class="app-sidebar-link-label">Add product</span>
        </a>
      </div>

      <nav
        class="app-sidebar-navigation"
        aria-label="Workspace navigation"
      >
        ${navigationGroups
          .map(
            (group) => `
              <div class="app-sidebar-group">

                <span class="app-sidebar-group-label">
                  ${group.label}
                </span>

                <div class="app-sidebar-group-items">
                  ${group.items
                    .map((item) => renderNavigationItem(item, currentPath))
                    .join("")}
                </div>

              </div>
            `,
          )
          .join("")}
      </nav>

      <div class="app-sidebar-bottom">

        <div class="app-sidebar-help">
          <span class="app-sidebar-help-icon">?</span>

          <div class="app-sidebar-help-content">
            <strong>Need help?</strong>
            <span>Explore ProofPath</span>
          </div>
        </div>

        <button
          type="button"
          class="app-sidebar-user"
          aria-label="Open account menu"
        >
          <span class="app-sidebar-avatar">U</span>

          <span class="app-sidebar-user-details">
            <strong>My Account</strong>
            <small>Personal workspace</small>
          </span>
        </button>

      </div>
    </aside>

    <button
      type="button"
      class="app-sidebar-backdrop"
      id="sidebar-backdrop"
      aria-label="Close navigation"
      tabindex="-1"
      hidden
    ></button>
  `;
}

export function initializeSidebar() {
  const sidebar = document.querySelector("#app-sidebar");
  const collapseButton = document.querySelector("#sidebar-collapse");
  const mobileCloseButton = document.querySelector("#sidebar-mobile-close");
  const backdrop = document.querySelector("#sidebar-backdrop");

  if (!sidebar || !backdrop) {
    return;
  }

  const controller = new AbortController();
  const { signal } = controller;

  const isMobile = () => window.matchMedia("(max-width: 900px)").matches;

  const getFocusableElements = () => {
    return [
      ...sidebar.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ].filter((element) => !element.hidden && !element.inert);
  };

  const closeMobileSidebar = ({ restoreFocus = false } = {}) => {
    sidebar.classList.remove("is-mobile-open");
    backdrop.hidden = true;

    document.body.classList.remove("sidebar-open");

    sidebar.inert = isMobile();

    if (restoreFocus && previousFocusElement?.isConnected) {
      previousFocusElement.focus();
    }

    previousFocusElement = null;
  };

  const openSidebar = () => {
    if (!isMobile()) return;

    previousFocusElement = document.activeElement;

    sidebar.inert = false;
    sidebar.classList.add("is-mobile-open");

    backdrop.hidden = false;

    document.body.classList.add("sidebar-open");

    mobileCloseButton?.focus();
  };

  const handleSidebarClick = (event) => {
    const link = event.target.closest("[data-sidebar-link]");

    if (!link) return;

    if (isMobile()) {
      closeMobileSidebar();
    }
  };

  const handleKeydown = (event) => {
    if (!sidebar.classList.contains("is-mobile-open")) {
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeMobileSidebar({ restoreFocus: true });
      return;
    }

    if (event.key !== "Tab") return;

    const focusableElements = getFocusableElements();

    if (focusableElements.length === 0) {
      event.preventDefault();
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
  };

  const handleResize = () => {
    if (!isMobile()) {
      closeMobileSidebar();
      sidebar.inert = false;

      sidebar.classList.remove("is-collapsed");

      collapseButton?.setAttribute("aria-pressed", "false");
      collapseButton?.setAttribute("aria-label", "Collapse sidebar");
    } else {
      sidebar.inert = !sidebar.classList.contains("is-mobile-open");
    }
  };

  collapseButton?.addEventListener(
    "click",
    () => {
      if (isMobile()) return;

      const isCollapsed = sidebar.classList.toggle("is-collapsed");

      collapseButton.setAttribute("aria-pressed", String(isCollapsed));

      collapseButton.setAttribute(
        "aria-label",
        isCollapsed ? "Expand sidebar" : "Collapse sidebar",
      );
    },
    { signal },
  );

  mobileCloseButton?.addEventListener(
    "click",
    () => closeMobileSidebar({ restoreFocus: true }),
    { signal },
  );

  backdrop.addEventListener(
    "click",
    () => closeMobileSidebar({ restoreFocus: true }),
    { signal },
  );

  sidebar.addEventListener("click", handleSidebarClick, { signal });

  document.addEventListener("keydown", handleKeydown, { signal });

  window.addEventListener("resize", handleResize, { signal });

  handleResize();

  return () => {
    controller.abort();

    closeMobileSidebar();

    sidebar.inert = false;
    sidebar.classList.remove("is-collapsed");

    if (collapseButton) {
      collapseButton.setAttribute("aria-pressed", "false");
      collapseButton.setAttribute("aria-label", "Collapse sidebar");
    }
  };
}

export function openMobileSidebar() {
  const sidebar = document.querySelector("#app-sidebar");
  const backdrop = document.querySelector("#sidebar-backdrop");
  const closeButton = document.querySelector("#sidebar-mobile-close");

  if (!sidebar || !backdrop) return;

  if (!window.matchMedia("(max-width: 900px)").matches) {
    return;
  }

  previousFocusElement = document.activeElement;

  sidebar.inert = false;
  sidebar.classList.add("is-mobile-open");

  backdrop.hidden = false;

  document.body.classList.add("sidebar-open");

  closeButton?.focus();
}
