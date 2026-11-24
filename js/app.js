const app = document.getElementById("app");

const getSavedTheme = () => {
  return localStorage.getItem("proofpath-theme") || "light";
};

const setTheme = (theme) => {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("proofpath-theme", theme);
};

const icons = {
  shield: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/></svg>`,

  arrow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`,

  sun: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></svg>`,

  moon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z"/></svg>`,

  menu: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>`,

  document: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8m-8 4h8"/></svg>`,

  clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`,

  qr: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zm4 4h3v3h-3zm3-4v1m-7 4v2"/></svg>`,

  chart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-5 5"/></svg>`,

  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 4 4L19 6"/></svg>`,
};

const renderNavbar = () => `
    <header class="site-header">
        <div class="nav-container">

            <a href="#home" class="brand-logo">
                <span class="brand-symbol">${icons.shield}</span>
                <span>ProofPath<span class="brand-dot">.</span></span>
            </a>

            <nav class="main-nav" id="main-nav">
                <a href="#features" class="nav-link">Features</a>
                <a href="#how-it-works" class="nav-link">How it works</a>
                <a href="#benefits" class="nav-link">Why ProofPath</a>
                <a href="#contact" class="nav-link">Contact</a>
            </nav>

            <div class="nav-actions">
                <button class="theme-toggle" id="theme-toggle" aria-label="Toggle theme">
                    ${getSavedTheme() === "dark" ? icons.sun : icons.moon}
                </button>

                <a href="#" class="btn btn-secondary nav-login">Log in</a>
                <a href="#" class="btn btn-primary nav-cta">
                    Get started ${icons.arrow}
                </a>

                <button class="mobile-menu-btn" id="mobile-menu-btn" aria-label="Open navigation" aria-expanded="false">
                    ${icons.menu}
                </button>
            </div>

        </div>
    </header>
`;

const renderHero = () => `
    <section class="hero-section" id="home">
        <div class="hero-container">

            <div class="hero-content">

                <div class="hero-eyebrow">
                    <span class="eyebrow-dot"></span>
                    YOUR PRODUCTS, ONE TRUSTED PLACE
                </div>

                <h1>
                    Every product has a story.
                    <span>Keep its proof.</span>
                </h1>

                <p class="hero-description">
                    Your purchase documents, warranty details and service history
                    deserve a better home. Keep everything organized in one
                    simple digital space.
                </p>

                <div class="hero-actions">
                    <a href="#" class="btn btn-primary btn-lg">
                        Get started for free
                        ${icons.arrow}
                    </a>

                    <a href="#how-it-works" class="hero-secondary-link">
                        Explore how it works
                    </a>
                </div>

                <div class="hero-trust">
                    <div class="trust-icon">${icons.shield}</div>
                    <div>
                        <strong>Your records, organized.</strong>
                        <span>Designed around clarity and control.</span>
                    </div>
                </div>

            </div>

            <div class="hero-visual">

                <div class="preview-decoration decoration-one"></div>
                <div class="preview-decoration decoration-two"></div>

                <div class="dashboard-preview">

                    <div class="preview-topbar">
                        <div class="preview-brand">
                            <span class="preview-brand-icon">${icons.shield}</span>
                            <strong>ProofPath</strong>
                        </div>

                        <span class="preview-profile">AV</span>
                    </div>

                    <div class="preview-body">

                        <div class="preview-heading">
                            <div>
                                <span class="preview-greeting">MONDAY, NOVEMBER 24</span>
                                <h3>Your product space</h3>
                                <p>Everything important, in one place.</p>
                            </div>

                            <span class="preview-live">
                                <span></span> Overview
                            </span>
                        </div>

                        <div class="preview-stats">

                            <div class="preview-stat">
                                <span>Total products</span>
                                <strong>08</strong>
                                <small>Across 4 categories</small>
                            </div>

                            <div class="preview-stat">
                                <span>Active warranties</span>
                                <strong>06</strong>
                                <small>Currently protected</small>
                            </div>

                            <div class="preview-stat">
                                <span>Expiring soon</span>
                                <strong class="warning-number">02</strong>
                                <small>Within 30 days</small>
                            </div>

                        </div>

                        <div class="preview-products-heading">
                            <strong>Recent products</strong>
                            <span>View all →</span>
                        </div>

                        <div class="preview-product">

                            <div class="product-visual laptop-visual">
                                <svg viewBox="0 0 64 64" fill="none">
                                    <rect x="12" y="10" width="40" height="29" rx="3" stroke="currentColor" stroke-width="2"/>
                                    <path d="M7 45h50l-5 5H12l-5-5Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
                                    <path d="M24 45h16" stroke="currentColor" stroke-width="2"/>
                                </svg>
                            </div>

                            <div class="preview-product-info">
                                <strong>MacBook Air M2</strong>
                                <span>Apple · Electronics</span>
                            </div>

                            <span class="badge badge-active">Active</span>

                        </div>

                        <div class="preview-product">

                            <div class="product-visual phone-visual">
                                <svg viewBox="0 0 64 64" fill="none">
                                    <rect x="20" y="6" width="24" height="52" rx="5" stroke="currentColor" stroke-width="2"/>
                                    <path d="M27 11h10M30 52h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                </svg>
                            </div>

                            <div class="preview-product-info">
                                <strong>iPhone 15</strong>
                                <span>Apple · Electronics</span>
                            </div>

                            <span class="badge badge-expiring">Expiring</span>

                        </div>

                        <div class="preview-footer">
                            <span>YOUR DIGITAL PRODUCT RECORDS</span>
                            <span>PP / 2026</span>
                        </div>

                    </div>
                </div>

                <div class="floating-proof-card">
                    <div class="floating-proof-icon">${icons.shield}</div>
                    <div>
                        <strong>Proof secured</strong>
                        <span>Product record ready</span>
                    </div>
                    <span class="proof-check">${icons.check}</span>
                </div>

            </div>
        </div>
    </section>
`;

const renderTrustStrip = () => `
    <section class="trust-strip">
        <div class="trust-strip-inner">
            <span>ONE PLACE FOR YOUR</span>
            <div>${icons.document} Purchase documents</div>
            <div>${icons.shield} Warranty records</div>
            <div>${icons.clock} Service history</div>
            <div>${icons.qr} Digital identity</div>
        </div>
    </section>
`;

const renderFeatures = () => {
  const features = [
    {
      icon: icons.document,
      number: "01",
      title: "Your documents, together",
      description:
        "Keep invoices, warranty certificates and repair receipts organized in one digital vault.",
    },
    {
      icon: icons.clock,
      number: "02",
      title: "Never miss a warranty",
      description:
        "Track remaining coverage, monitor expiration dates and identify warranties that need attention.",
    },
    {
      icon: icons.shield,
      number: "03",
      title: "A history worth keeping",
      description:
        "Maintain a structured record of product purchases, repairs and maintenance activities.",
    },
    {
      icon: icons.qr,
      number: "04",
      title: "A digital identity for products",
      description:
        "Generate a unique product profile and access its shareable information through a QR code.",
    },
    {
      icon: icons.chart,
      number: "05",
      title: "Understand your ownership costs",
      description:
        "Explore purchase values, repair expenses and product lifecycle insights.",
    },
    {
      icon: icons.check,
      number: "06",
      title: "Ownership with a clear history",
      description:
        "Maintain a structured record of product ownership changes and transfer activity.",
    },
  ];

  return `
        <section class="features-section section-padding" id="features">

            <div class="section-container">

                <div class="section-heading">
                    <span class="section-eyebrow">THE PROOFPATH EXPERIENCE</span>
                    <h2>Everything your products need.<br><span>Nothing you need to chase.</span></h2>
                    <p>A more organized way to manage the things you own.</p>
                </div>

                <div class="features-grid">

                    ${features
                      .map(
                        (feature) => `
                        <article class="feature-card">

                            <div class="feature-card-top">
                                <div class="feature-icon">${feature.icon}</div>
                                <span>${feature.number}</span>
                            </div>

                            <h3>${feature.title}</h3>
                            <p>${feature.description}</p>

                            <div class="feature-line"></div>

                        </article>
                    `,
                      )
                      .join("")}

                </div>

            </div>
        </section>
    `;
};

const renderHowItWorks = () => `
    <section class="workflow-section section-padding" id="how-it-works">

        <div class="section-container">

            <div class="section-heading">
                <span class="section-eyebrow">SIMPLE BY DESIGN</span>
                <h2>Your product history.<br><span>Three simple steps.</span></h2>
                <p>Start with a product. Keep its entire story organized.</p>
            </div>

            <div class="workflow-grid">

                <article class="workflow-card">
                    <span class="workflow-number">01</span>
                    <div class="workflow-icon">${icons.document}</div>
                    <h3>Register your product</h3>
                    <p>Add product details, purchase information and relevant documents.</p>
                </article>

                <article class="workflow-card">
                    <span class="workflow-number">02</span>
                    <div class="workflow-icon">${icons.shield}</div>
                    <h3>Organize its proof</h3>
                    <p>Keep warranty details, invoices and service records connected to the product.</p>
                </article>

                <article class="workflow-card">
                    <span class="workflow-number">03</span>
                    <div class="workflow-icon">${icons.qr}</div>
                    <h3>Access its history</h3>
                    <p>Explore your digital product profile and share selected records through QR.</p>
                </article>

            </div>

        </div>
    </section>
`;

const renderBenefits = () => `
    <section class="benefits-section section-padding" id="benefits">

        <div class="section-container benefits-container">

            <div class="benefits-content">
                <span class="section-eyebrow">BUILT AROUND YOUR OWNERSHIP</span>

                <h2>
                    Keep the proof.<br>
                    <span>Know the history.</span>
                </h2>

                <p>
                    A product is more than what you purchase.
                    Its documents, warranty and service history
                    are all part of its story.
                </p>

                <div class="benefit-list">

                    <div class="benefit-item">
                        <span>${icons.check}</span>
                        <div>
                            <strong>One organized product record</strong>
                            <p>Keep important product information connected.</p>
                        </div>
                    </div>

                    <div class="benefit-item">
                        <span>${icons.check}</span>
                        <div>
                            <strong>Clear warranty visibility</strong>
                            <p>Understand what is active and what needs attention.</p>
                        </div>
                    </div>

                    <div class="benefit-item">
                        <span>${icons.check}</span>
                        <div>
                            <strong>Useful lifecycle insights</strong>
                            <p>Understand your product's repair and ownership history.</p>
                        </div>
                    </div>

                </div>

                <a href="#contact" class="btn btn-primary">
                    Discover ProofPath ${icons.arrow}
                </a>
            </div>

            <div class="benefits-visual">

                <div class="document-stack">

                    <div class="document-sheet sheet-back">
                        <span>WARRANTY CERTIFICATE</span>
                        <div class="document-lines">
                            <i></i><i></i><i></i>
                        </div>
                    </div>

                    <div class="document-sheet sheet-front">
                        <div class="document-brand">
                            ${icons.shield}
                            <span>PROOFPATH RECORD</span>
                        </div>

                        <div class="document-seal">
                            ${icons.check}
                        </div>

                        <span class="document-caption">DIGITAL PRODUCT PROFILE</span>

                        <h3>Product record</h3>

                        <div class="document-lines">
                            <i></i><i></i><i></i><i></i>
                        </div>

                        <div class="document-bottom">
                            <span>PP-2026-00842</span>
                            <span>REGISTERED RECORD</span>
                        </div>
                    </div>

                </div>

            </div>

        </div>
    </section>
`;

const renderCTA = () => `
    <section class="cta-section" id="contact">

        <div class="cta-container">

            <div class="cta-icon">${icons.shield}</div>

            <span>YOUR PRODUCT STORY STARTS HERE</span>

            <h2>Give every product<br>the record it deserves.</h2>

            <p>Bring your documents, warranty details and product history together with ProofPath.</p>

            <a href="#" class="btn btn-cta">
                Get started for free ${icons.arrow}
            </a>

            <small>One place. Every proof. Better organized.</small>

        </div>

    </section>
`;

const renderFooter = () => `
    <footer class="site-footer">

        <div class="footer-container">

            <div class="footer-main">

                <div class="footer-brand">
                    <a href="#home" class="brand-logo">
                        <span class="brand-symbol">${icons.shield}</span>
                        <span>ProofPath<span class="brand-dot">.</span></span>
                    </a>

                    <p>
                        A more thoughtful way to manage
                        your product documents, warranties
                        and ownership history.
                    </p>
                </div>

                <div class="footer-links">
                    <strong>Explore</strong>
                    <a href="#features">Features</a>
                    <a href="#how-it-works">How it works</a>
                    <a href="#benefits">Why ProofPath</a>
                </div>

                <div class="footer-links">
                    <strong>Platform</strong>
                    <a href="#">Product records</a>
                    <a href="#">Warranty tracking</a>
                    <a href="#">Digital documents</a>
                </div>

                <div class="footer-links">
                    <strong>Information</strong>
                    <a href="#contact">Contact</a>
                    <a href="#">Privacy</a>
                    <a href="#">Terms</a>
                </div>

            </div>

            <div class="footer-bottom">
                <span>© ${new Date().getFullYear()} ProofPath. All rights reserved.</span>
                <span>Every product has a story. Keep its proof.</span>
            </div>

        </div>

    </footer>
`;

const renderLandingPage = () => {
  app.innerHTML = `
        ${renderNavbar()}
        <main>
            ${renderHero()}
            ${renderTrustStrip()}
            ${renderFeatures()}
            ${renderHowItWorks()}
            ${renderBenefits()}
            ${renderCTA()}
        </main>
        ${renderFooter()}
    `;
};

const initializeInteractions = () => {
  const themeButton = document.getElementById("theme-toggle");
  const menuButton = document.getElementById("mobile-menu-btn");
  const nav = document.getElementById("main-nav");

  themeButton.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const nextTheme = currentTheme === "dark" ? "light" : "dark";

    setTheme(nextTheme);

    themeButton.innerHTML = nextTheme === "dark" ? icons.sun : icons.moon;
  });

  menuButton.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("nav-open");

    menuButton.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("nav-open");
      menuButton.setAttribute("aria-expanded", "false");
    });
  });

  const revealElements = document.querySelectorAll(
    ".trust-strip, .section-heading, .feature-card, .step-card, .benefit-content, .benefit-visual, .cta-section",
  );

  revealElements.forEach((element) => {
    element.classList.add("reveal");
  });

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px",
    },
  );

  revealElements.forEach((element) => {
    revealObserver.observe(element);
  });
};

const initializeApp = () => {
  setTheme(getSavedTheme());
  renderLandingPage();
  initializeInteractions();
};

initializeApp();
