import { openMobileSidebar } from "./sidebar.js";
import { destroySession } from "../auth/sessionService.js";

const icons = {
  menu: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
      <path d="M4 6h16M4 12h16M4 18h16"/>
    </svg>
  `,
  search: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
      <circle cx="11" cy="11" r="7"/>
      <path d="m20 20-4-4"/>
    </svg>
  `,
  bell: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/>
      <path d="M10 21h4"/>
    </svg>
  `,
  sun: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/>
    </svg>
  `,
  moon: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
      <path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z"/>
    </svg>
  `,
  chevron: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
      <path d="m7 10 5 5 5-5"/>
    </svg>
  `,
  user: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 21a8 8 0 0 1 16 0"/>
    </svg>
  `,
  settings: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.5 2.6-.2-.1a1.7 1.7 0 0 0-1.9.3l-.1.1h-3l-.1-.2a1.7 1.7 0 0 0-1.5-1.1 1.7 1.7 0 0 0-1.5 1.1l-.1.2h-3l-.1-.2a1.7 1.7 0 0 0-1.5-1.1 1.7 1.7 0 0 0-1.5 1.1l-.1.2-2.6-1.5.1-.2a1.7 1.7 0 0 0-.3-1.9l-.1-.1v-3l.2-.1a1.7 1.7 0 0 0 1.1-1.5 1.7 1.7 0 0 0-1.1-1.5l-.2-.1V7.3l.2-.1a1.7 1.7 0 0 0 1.1-1.5 1.7 1.7 0 0 0-1.1-1.5l-.2-.1 1.5-2.6.2.1a1.7 1.7 0 0 0 1.9-.3l.1-.1h3l.1.2a1.7 1.7 0 0 0 1.5 1.1 1.7 1.7 0 0 0 1.5-1.1l.1-.2h3l.1.2a1.7 1.7 0 0 0 1.5 1.1 1.7 1.7 0 0 0 1.5-1.1l.1-.2 2.6 1.5-.1.2a1.7 1.7 0 0 0 .3 1.9l.1.1v3l-.2.1a1.7 1.7 0 0 0-1.1 1.5 1.7 1.7 0 0 0 1.1 1.5l.2.1V15Z"/>
    </svg>
  `,
  logout: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
      <path d="M10 17l5-5-5-5M15 12H3"/>
      <path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7"/>
    </svg>
  `,
};

export function renderHeader() {
  return `
    <header class="app-header">

      <div class="app-header-left">

        <button
          type="button"
          class="app-header-menu"
          id="app-mobile-menu"
          aria-label="Open navigation"
          aria-controls="app-sidebar"
        >
          ${icons.menu}
        </button>

        <div class="app-header-search" role="search">
          <span class="app-header-search-icon">
            ${icons.search}
          </span>

          <input
            type="search"
            id="global-search"
            placeholder="Search products, documents..."
            aria-label="Search ProofPath"
            autocomplete="off"
          />

          <kbd>Ctrl K</kbd>
        </div>

      </div>

      <div class="app-header-actions">

        <button
          type="button"
          class="app-header-icon-button"
          id="app-theme-toggle"
          aria-label="Toggle theme"
          title="Toggle theme"
        >
          <span class="app-header-theme-icon"></span>
        </button>

        <a
          href="#/notifications"
          class="app-header-icon-button app-header-notification"
          aria-label="Notifications"
          title="Notifications"
        >
          ${icons.bell}
          <span class="app-header-notification-dot" aria-hidden="true"></span>
        </a>

        <div class="app-header-profile-wrapper">

          <button
            type="button"
            class="app-header-profile"
            id="app-profile-toggle"
            aria-expanded="false"
            aria-haspopup="true"
            aria-controls="app-profile-menu"
          >
            <span class="app-header-avatar">U</span>

            <span class="app-header-profile-info">
              <strong>My Account</strong>
              <small>Personal</small>
            </span>

            <span class="app-header-profile-chevron">
              ${icons.chevron}
            </span>
          </button>

          <div
            class="app-header-profile-menu"
            id="app-profile-menu"
            hidden
          >
            <a href="#/profile">
              ${icons.user}
              <span>My Profile</span>
            </a>

            <a href="#/settings">
              ${icons.settings}
              <span>Settings</span>
            </a>

            <div class="app-header-profile-divider"></div>

            <button type="button" id="app-logout-button">
              ${icons.logout}
              <span>Sign out</span>
            </button>
          </div>

        </div>

      </div>

    </header>
  `;
}

export function initializeHeader() {
  const mobileMenuButton = document.querySelector("#app-mobile-menu");
  const themeButton = document.querySelector("#app-theme-toggle");
  const themeIcon = document.querySelector(".app-header-theme-icon");
  const profileButton = document.querySelector("#app-profile-toggle");
  const profileMenu = document.querySelector("#app-profile-menu");
  const profileWrapper = document.querySelector(".app-header-profile-wrapper");
  const logoutButton = document.querySelector("#app-logout-button");
  const searchInput = document.querySelector("#global-search");

  if (!document.querySelector(".app-header")) {
    return;
  }

  const controller = new AbortController();
  const { signal } = controller;

  let previouslyFocusedElement = null;

  const updateThemeIcon = () => {
    if (!themeIcon) return;

    const isDark = document.documentElement.dataset.theme === "dark";

    themeIcon.innerHTML = isDark ? icons.sun : icons.moon;

    themeButton?.setAttribute(
      "aria-label",
      isDark ? "Switch to light theme" : "Switch to dark theme",
    );

    themeButton?.setAttribute(
      "title",
      isDark ? "Switch to light theme" : "Switch to dark theme",
    );
  };

  const closeProfileMenu = ({ restoreFocus = false } = {}) => {
    if (!profileMenu || !profileButton) return;

    const wasOpen = !profileMenu.hidden;

    profileMenu.hidden = true;
    profileButton.setAttribute("aria-expanded", "false");

    if (restoreFocus && wasOpen) {
      profileButton.focus();
    }

    previouslyFocusedElement = null;
  };

  const toggleProfileMenu = () => {
    if (!profileMenu || !profileButton) return;

    const isOpen = profileButton.getAttribute("aria-expanded") === "true";

    if (isOpen) {
      closeProfileMenu();
      return;
    }

    previouslyFocusedElement = document.activeElement;

    profileMenu.hidden = false;
    profileButton.setAttribute("aria-expanded", "true");
  };

  const handleDocumentClick = (event) => {
    if (!profileMenu || profileMenu.hidden) return;

    const clickedInsideProfile =
      event.target instanceof Element && profileWrapper?.contains(event.target);

    if (!clickedInsideProfile) {
      closeProfileMenu();
    }
  };

  const handleDocumentKeydown = (event) => {
    if (event.key === "Escape") {
      const profileIsOpen = profileMenu && !profileMenu.hidden;

      if (profileIsOpen) {
        event.preventDefault();
        closeProfileMenu({ restoreFocus: true });
      }
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      searchInput?.focus();
    }
  };

  const handleSearchKeydown = (event) => {
    if (event.key === "Escape" && searchInput) {
      searchInput.value = "";
      searchInput.blur();
    }
  };

  mobileMenuButton?.addEventListener("click", openMobileSidebar, { signal });

  themeButton?.addEventListener(
    "click",
    () => {
      const currentTheme = document.documentElement.dataset.theme || "light";

      const nextTheme = currentTheme === "dark" ? "light" : "dark";

      document.dispatchEvent(
        new CustomEvent("proofpath:theme-change", {
          detail: { theme: nextTheme },
        }),
      );
    },
    { signal },
  );

  profileButton?.addEventListener("click", toggleProfileMenu, { signal });

  document.addEventListener("click", handleDocumentClick, { signal });

  document.addEventListener("keydown", handleDocumentKeydown, { signal });

  document.addEventListener("proofpath:theme-updated", updateThemeIcon, {
    signal,
  });

  searchInput?.addEventListener("keydown", handleSearchKeydown, { signal });

  logoutButton?.addEventListener(
    "click",
    () => {
      destroySession();

      window.location.hash = "#/login";
    },
    { signal },
  );

  updateThemeIcon();

  return () => {
    controller.abort();
    closeProfileMenu();

    if (
      previouslyFocusedElement instanceof HTMLElement &&
      previouslyFocusedElement.isConnected
    ) {
      previouslyFocusedElement.blur();
    }
  };
}
