import { renderSidebar, initializeSidebar } from "../components/sidebar.js";
import { renderHeader, initializeHeader } from "../components/header.js";

const dashboardIcons = {
  package: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 8 9 5 9-5M3 8v9l9 5 9-5V8M12 13v9"/></svg>`,
  shield: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`,
  claims: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M8 3h8l5 5v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3Z"/><path d="M16 3v5h5M8 13h8M8 17h5"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 5v14M5 12h14"/></svg>`,
  arrow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>`,
  file: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M6 3h9l4 4v14H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M15 3v5h5M8 13h8M8 17h8"/></svg>`,
  activity: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3 12h4l3-8 4 16 3-8h4"/></svg>`,
  calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></svg>`,
};

const stats = [
  {
    label: "Total products",
    value: "12",
    detail: "Products in your vault",
    icon: "package",
    tone: "neutral",
  },
  {
    label: "Active warranties",
    value: "08",
    detail: "Currently protected",
    icon: "shield",
    tone: "success",
  },
  {
    label: "Expiring soon",
    value: "03",
    detail: "Within the next 30 days",
    icon: "clock",
    tone: "warning",
  },
  {
    label: "Open claims",
    value: "01",
    detail: "Awaiting resolution",
    icon: "claims",
    tone: "info",
  },
];

const expiringWarranties = [
  {
    name: "Samsung Galaxy S24",
    brand: "Samsung",
    category: "Smartphone",
    expiry: "Dec 08, 2026",
    remaining: "12 days left",
    progress: 92,
    status: "Expiring",
  },
  {
    name: "Sony WH-1000XM5",
    brand: "Sony",
    category: "Headphones",
    expiry: "Dec 15, 2026",
    remaining: "19 days left",
    progress: 84,
    status: "Expiring",
  },
  {
    name: "Dell Inspiron 14",
    brand: "Dell",
    category: "Laptop",
    expiry: "Dec 22, 2026",
    remaining: "26 days left",
    progress: 76,
    status: "Expiring",
  },
];

const recentActivities = [
  {
    title: "Product added",
    description: "Samsung Galaxy S24 was added to your vault.",
    time: "Today, 10:42 AM",
    icon: "package",
    tone: "success",
  },
  {
    title: "Warranty document uploaded",
    description: "Invoice document was uploaded successfully.",
    time: "Yesterday, 04:15 PM",
    icon: "file",
    tone: "info",
  },
  {
    title: "Claim status updated",
    description: "Your laptop repair claim is under review.",
    time: "Nov 23, 2026",
    icon: "claims",
    tone: "warning",
  },
];

const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";

  return "Good evening";
};

const getFormattedDate = () => {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
};

const renderStatCard = (stat) => {
  return `
    <article class="dashboard-stat-card">
      <div class="dashboard-stat-top">
        <span class="dashboard-stat-icon is-${stat.tone}">
          ${dashboardIcons[stat.icon]}
        </span>
        <span class="dashboard-stat-label">${stat.label}</span>
      </div>

      <div class="dashboard-stat-value">${stat.value}</div>
      <p class="dashboard-stat-detail">${stat.detail}</p>
    </article>
  `;
};

const renderExpiringWarranty = (item) => {
  return `
    <article class="dashboard-warranty-item">
      <div class="dashboard-warranty-main">
        <div class="dashboard-product-placeholder">
          ${dashboardIcons.package}
        </div>

        <div class="dashboard-warranty-info">
          <strong>${item.name}</strong>
          <span>${item.brand} · ${item.category}</span>
        </div>
      </div>

      <div class="dashboard-warranty-progress">
        <div class="dashboard-progress-track">
          <span style="width: ${item.progress}%"></span>
        </div>
        <small>${item.remaining}</small>
      </div>

      <div class="dashboard-warranty-expiry">
        <span class="dashboard-status-badge is-warning">${item.status}</span>
        <small>Expires ${item.expiry}</small>
      </div>
    </article>
  `;
};

const renderActivity = (activity) => {
  return `
    <article class="dashboard-activity-item">
      <span class="dashboard-activity-icon is-${activity.tone}">
        ${dashboardIcons[activity.icon]}
      </span>

      <div class="dashboard-activity-content">
        <strong>${activity.title}</strong>
        <p>${activity.description}</p>
        <small>${activity.time}</small>
      </div>
    </article>
  `;
};

const renderDashboardContent = () => {
  return `
    <div class="dashboard-page">

      <section class="dashboard-welcome">
        <div>
          <span class="dashboard-eyebrow">YOUR WORKSPACE</span>
          <h1>${getGreeting()}, welcome back.</h1>
          <p>Here's what's happening with your products and warranties.</p>
        </div>

        <div class="dashboard-welcome-actions">
          <span class="dashboard-current-date">
            ${dashboardIcons.calendar}
            ${getFormattedDate()}
          </span>

          <a href="#/products/new" class="btn btn-primary">
            ${dashboardIcons.plus}
            Add product
          </a>
        </div>
      </section>

      <section class="dashboard-stats-grid" aria-label="Overview statistics">
        ${stats.map(renderStatCard).join("")}
      </section>

      <section class="dashboard-main-grid">

        <div class="dashboard-panel dashboard-warranty-panel">
          <div class="dashboard-panel-header">
            <div>
              <span class="dashboard-section-eyebrow">ATTENTION REQUIRED</span>
              <h2>Expiring warranties</h2>
              <p>Keep track of products that need your attention.</p>
            </div>

            <a href="#/warranties" class="dashboard-text-link">
              View all
              ${dashboardIcons.arrow}
            </a>
          </div>

          <div class="dashboard-warranty-list">
            ${expiringWarranties.map(renderExpiringWarranty).join("")}
          </div>
        </div>

        <div class="dashboard-panel dashboard-quick-panel">
          <div class="dashboard-panel-header">
            <div>
              <span class="dashboard-section-eyebrow">GET STARTED</span>
              <h2>Quick actions</h2>
              <p>Manage your digital proof with ease.</p>
            </div>
          </div>

          <div class="dashboard-quick-actions">
            <a href="#/products/new" class="dashboard-quick-action">
              <span class="dashboard-quick-icon is-primary">
                ${dashboardIcons.plus}
              </span>
              <span>
                <strong>Add a product</strong>
                <small>Register a new purchase</small>
              </span>
              ${dashboardIcons.arrow}
            </a>

            <a href="#/documents" class="dashboard-quick-action">
              <span class="dashboard-quick-icon is-neutral">
                ${dashboardIcons.file}
              </span>
              <span>
                <strong>Upload a document</strong>
                <small>Store invoices and receipts</small>
              </span>
              ${dashboardIcons.arrow}
            </a>

            <a href="#/claims" class="dashboard-quick-action">
              <span class="dashboard-quick-icon is-warning">
                ${dashboardIcons.claims}
              </span>
              <span>
                <strong>Track a claim</strong>
                <small>Check your claim progress</small>
              </span>
              ${dashboardIcons.arrow}
            </a>
          </div>
        </div>

      </section>

      <section class="dashboard-bottom-grid">

        <div class="dashboard-panel dashboard-activity-panel">
          <div class="dashboard-panel-header">
            <div>
              <span class="dashboard-section-eyebrow">YOUR LATEST UPDATES</span>
              <h2>Recent activity</h2>
              <p>A timeline of what's happening in your workspace.</p>
            </div>

            <a href="#/notifications" class="dashboard-text-link">
              View updates
              ${dashboardIcons.arrow}
            </a>
          </div>

          <div class="dashboard-activity-list">
            ${recentActivities.map(renderActivity).join("")}
          </div>
        </div>

        <div class="dashboard-panel dashboard-insight-panel">
          <span class="dashboard-insight-icon">
            ${dashboardIcons.activity}
          </span>

          <span class="dashboard-section-eyebrow">WARRANTY INSIGHT</span>
          <h2>Stay ahead of expiry dates.</h2>

          <p>
            You have 3 warranties expiring within the next 30 days.
            Review your documents and prepare for service if needed.
          </p>

          <a href="#/warranties" class="btn btn-secondary">
            Review warranties
            ${dashboardIcons.arrow}
          </a>
        </div>

      </section>

      <footer class="dashboard-footer">
        <span>ProofPath Workspace</span>
        <span>Every product has a story.</span>
      </footer>

    </div>
  `;
};

export function renderDashboardPage() {
  return `
    <div class="app-layout">
      ${renderSidebar()}

      <div class="app-main">
        ${renderHeader()}

        <main
          class="app-content dashboard-content"
          id="app-page-content"
          tabindex="-1"
        >
          ${renderDashboardContent()}
        </main>
      </div>
    </div>
  `;
}

export function initializeDashboardPage() {
  const cleanupSidebar = initializeSidebar();
  const cleanupHeader = initializeHeader();

  return () => {
    cleanupSidebar?.();
    cleanupHeader?.();
  };
}
