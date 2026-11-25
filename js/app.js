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
    <header class="site-header editorial-header">
        <div class="nav-container">

            <a href="#/" class="brand-logo">
                <span class="brand-symbol">${icons.shield}</span>
                <span>ProofPath<span class="brand-dot">.</span></span>
            </a>

            <nav class="main-nav" id="main-nav" aria-label="Main navigation">
                <a href="#features" class="nav-link">Platform</a>
                <a href="#how-it-works" class="nav-link">How it works</a>
                <a href="#benefits" class="nav-link">Our approach</a>
                <a href="#contact" class="nav-link">Get in touch</a>
            </nav>

            <div class="nav-actions">

                <button
                    class="theme-toggle"
                    id="theme-toggle"
                    type="button"
                    aria-label="Toggle theme"
                >
                    ${getSavedTheme() === "dark" ? icons.sun : icons.moon}
                </button>

                <a href="#/login" class="btn btn-secondary nav-login">
                    Log in
                </a>

                <a href="#/signup" class="btn btn-primary nav-cta">
                    Create your archive ${icons.arrow}
                </a>

                <button
                    class="mobile-menu-btn"
                    id="mobile-menu-btn"
                    type="button"
                    aria-label="Open navigation"
                    aria-expanded="false"
                    aria-controls="main-nav"
                >
                    ${icons.menu}
                </button>

            </div>
        </div>
    </header>
`;

const renderHero = () => `
    <section class="hero-section editorial-hero" id="home">

        <div class="hero-grain"></div>

        <div class="hero-container editorial-hero-container">

            <div class="hero-content editorial-hero-content">

                <div class="hero-edition">
                    <span class="edition-line"></span>
                    <span>THE ART OF PRODUCT OWNERSHIP</span>
                    <span class="edition-number">PP — 001</span>
                </div>

                <h1>
                    What you own
                    <span>has a story.</span>
                    <span class="hero-heading-accent">Keep every detail.</span>
                </h1>

                <p class="hero-description">
                    From the moment you purchase something to every repair,
                    warranty and document that follows — give everything
                    you own a place in its story.
                </p>

                <div class="hero-actions">

                    <a href="#/signup" class="btn btn-primary btn-lg">
                        Build your product archive
                        ${icons.arrow}
                    </a>

                    <a href="#how-it-works" class="hero-secondary-link">
                        Discover the experience
                        <span class="hero-link-line"></span>
                    </a>

                </div>

                <div class="hero-bottom-note">
                    <span class="hero-note-symbol">${icons.shield}</span>

                    <div>
                        <strong>One considered space.</strong>
                        <span>Documents, warranties and product history.</span>
                    </div>
                </div>

            </div>

            <div class="hero-visual editorial-hero-visual">

                <div class="archive-index">
                    <span>YOUR PERSONAL ARCHIVE</span>
                    <span>COLLECTION / 2026</span>
                </div>

                <div class="archive-composition">

                    <div class="archive-backdrop"></div>

                    <article class="archive-document archive-invoice">

                        <div class="archive-document-top">
                            <span>01 / PURCHASE RECORD</span>
                            <span>${icons.document}</span>
                        </div>

                        <div class="invoice-brand">
                            <strong>INVOICE</strong>
                            <span>ORIGINAL PURCHASE</span>
                        </div>

                        <div class="invoice-product">

                            <div class="invoice-product-visual">
                                <svg viewBox="0 0 64 64" fill="none">
                                    <rect x="12" y="9" width="40" height="34" rx="3" stroke="currentColor" stroke-width="1.8"/>
                                    <path d="M7 49h50l-5 5H12l-5-5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
                                    <path d="M24 49h16" stroke="currentColor" stroke-width="1.8"/>
                                </svg>
                            </div>

                            <div>
                                <strong>MacBook Air</strong>
                                <span>Electronics / Laptop</span>
                            </div>

                        </div>

                        <div class="invoice-divider"></div>

                        <div class="invoice-details">
                            <span>DOCUMENT TYPE</span>
                            <strong>Purchase invoice</strong>
                            <span>RECORD STATUS</span>
                            <strong>Stored in archive</strong>
                        </div>

                        <div class="invoice-footer">
                            <span>PROOFPATH / RECORD 001</span>
                            <span>01</span>
                        </div>

                    </article>

                    <article class="archive-document archive-warranty">

                        <div class="warranty-top">
                            <span>02 / COVERAGE RECORD</span>
                            ${icons.shield}
                        </div>

                        <span class="warranty-caption">WARRANTY OVERVIEW</span>

                        <h3>Coverage,<br>made visible.</h3>

                        <div class="warranty-status">
                            <span class="warranty-status-dot"></span>
                            Active coverage
                        </div>

                        <div class="warranty-progress">
                            <span></span>
                        </div>

                        <div class="warranty-meta">
                            <span>Purchase record linked</span>
                            <span>Demo</span>
                        </div>

                    </article>

                    <article class="archive-product-card">

                        <div class="archive-product-header">
                            <span>03 / PRODUCT IDENTITY</span>
                            <span>PP—001</span>
                        </div>

                        <div class="archive-product-icon">
                            <svg viewBox="0 0 64 64" fill="none">
                                <rect x="12" y="8" width="40" height="34" rx="3" stroke="currentColor" stroke-width="1.8"/>
                                <path d="M7 48h50l-5 6H12l-5-6Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
                                <path d="M24 48h16" stroke="currentColor" stroke-width="1.8"/>
                            </svg>
                        </div>

                        <div class="archive-product-info">
                            <span>YOUR PRODUCT RECORD</span>
                            <strong>One connected history.</strong>
                        </div>

                        <div class="archive-product-footer">
                            <span>DOCUMENTS</span>
                            <span>WARRANTY</span>
                            <span>HISTORY</span>
                        </div>

                    </article>

                    <div class="archive-floating-seal">
                        <span>${icons.check}</span>

                        <div>
                            <strong>Record organized</strong>
                            <small>Illustrative preview</small>
                        </div>
                    </div>

                    <div class="archive-side-label">
                        KEEP WHAT MATTERS
                    </div>

                </div>

                <div class="archive-bottom">
                    <span>A MORE THOUGHTFUL WAY TO OWN.</span>
                    <span>EST. 2026</span>
                </div>

            </div>

        </div>

        <div class="hero-scroll-indicator">
            <span>SCROLL TO EXPLORE</span>
            <span class="scroll-indicator-line"></span>
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

            <p>
                Bring your documents, warranty details and product history
                together with ProofPath.
            </p>

            <a href="#/signup" class="btn btn-cta">
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
                    <a href="#/" class="brand-logo">
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
                    <a href="#features">Product records</a>
                    <a href="#features">Warranty tracking</a>
                    <a href="#features">Digital documents</a>
                </div>

                <div class="footer-links">
                    <strong>Information</strong>
                    <a href="#contact">Contact</a>
                    <a href="#contact">Privacy</a>
                    <a href="#contact">Terms</a>
                </div>

            </div>

            <div class="footer-bottom">
                <span>© ${new Date().getFullYear()} ProofPath. All rights reserved.</span>
                <span>Every product has a story. Keep its proof.</span>
            </div>

        </div>
    </footer>
`;

export const renderLandingPage = () => {
  return `
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

export const initializeLandingInteractions = () => {
  const themeButton = document.getElementById("theme-toggle");
  const menuButton = document.getElementById("mobile-menu-btn");
  const nav = document.getElementById("main-nav");

  if (themeButton) {
    themeButton.addEventListener("click", () => {
      const currentTheme = document.documentElement.getAttribute("data-theme");

      const nextTheme = currentTheme === "dark" ? "light" : "dark";

      setTheme(nextTheme);

      themeButton.innerHTML = nextTheme === "dark" ? icons.sun : icons.moon;

      themeButton.setAttribute(
        "aria-label",
        nextTheme === "dark" ? "Switch to light theme" : "Switch to dark theme",
      );
    });
  }

  if (menuButton && nav) {
    menuButton.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("nav-open");

      menuButton.setAttribute("aria-expanded", String(isOpen));

      menuButton.setAttribute(
        "aria-label",
        isOpen ? "Close navigation" : "Open navigation",
      );
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("nav-open");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Open navigation");
      });
    });
  }

  const revealElements = document.querySelectorAll(`
        .editorial-hero-content,
        .archive-document,
        .archive-product-card,
        .archive-floating-seal,
        .hero-scroll-indicator,
        .trust-strip,
        .section-heading,
        .feature-card,
        .workflow-card,
        .benefits-content,
        .benefits-visual,
        .cta-section
    `);

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (reducedMotion) {
    revealElements.forEach((element) => {
      element.classList.add("is-visible");
    });

    return;
  }

  if ("IntersectionObserver" in window) {
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
      element.classList.add("reveal");
      revealObserver.observe(element);
    });
  } else {
    revealElements.forEach((element) => {
      element.classList.add("is-visible");
    });
  }
};

const initializeApp = async () => {
  setTheme(getSavedTheme());

  try {
    const { initializeRouter } = await import("./router.js");

    initializeRouter();
  } catch (error) {
    console.error("Application initialization failed:", error);
  }
};

initializeApp();
