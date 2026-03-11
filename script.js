const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const appState = {
  headerAbortController: null,
  revealObserver: null,
  currentPath: ""
};

const revealGroups = [
  [".hero-actions > *", 0],
  [".metrics .metric", 1],
  [".grid-3 .card", 0],
  [".signature-stage", 0],
  [".proof-card", 0],
  [".chart-placeholder", 1],
  [".featured-talk-card", 0],
  [".speaking-teaser", 0],
  [".talk-proof-card", 0],
  [".talk-card", 0],
  [".article-card", 0],
  [".contact-card", 0],
  [".button-row > *", 0]
];

const managedMetaSelectors = [
  "meta[name='description']",
  "link[rel='canonical']",
  "meta[property='og:title']",
  "meta[property='og:description']",
  "meta[property='og:url']",
  "meta[name='twitter:title']",
  "meta[name='twitter:description']"
];

function normalizePath(pathname) {
  if (!pathname) {
    return "/";
  }

  return pathname.replace(/\/index\.html$/, "/");
}

function toHistoryUrl(url) {
  const pathname = normalizePath(url.pathname);
  return `${url.origin}${pathname}${url.search}${url.hash}`;
}

function syncActiveNav() {
  const page = document.body.dataset.page;

  document.querySelectorAll("[data-nav]").forEach((link) => {
    if (link.dataset.nav === page) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function syncYear() {
  const yearNode = document.querySelector("[data-year]");
  if (yearNode) {
    yearNode.textContent = new Date().getFullYear();
  }
}

function setupHeader() {
  if (appState.headerAbortController) {
    appState.headerAbortController.abort();
  }

  const header = document.querySelector(".site-header");
  if (!header) {
    return;
  }

  const navToggle = header.querySelector(".nav-toggle");
  const navPanel = header.querySelector(".nav-group");
  const abortController = new AbortController();
  const { signal } = abortController;

  appState.headerAbortController = abortController;

  const closeMenu = () => {
    if (!navToggle || !navPanel) {
      return;
    }

    header.classList.remove("menu-open");
    navToggle.setAttribute("aria-expanded", "false");
  };

  const openMenu = () => {
    if (!navToggle || !navPanel) {
      return;
    }

    header.classList.add("menu-open");
    navToggle.setAttribute("aria-expanded", "true");
  };

  const syncHeaderState = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 10);
  };

  syncHeaderState();
  window.addEventListener("scroll", syncHeaderState, { passive: true, signal });

  if (!navToggle || !navPanel) {
    return;
  }

  navToggle.addEventListener("click", () => {
    if (header.classList.contains("menu-open")) {
      closeMenu();
    } else {
      openMenu();
    }
  }, { signal });

  navPanel.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 860) {
        closeMenu();
      }
    }, { signal });
  });

  document.addEventListener("click", (event) => {
    if (window.innerWidth > 860) {
      return;
    }

    if (!header.contains(event.target)) {
      closeMenu();
    }
  }, { signal });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  }, { signal });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 860) {
      closeMenu();
    }
  }, { signal });
}

function setupReveals() {
  if (appState.revealObserver) {
    appState.revealObserver.disconnect();
    appState.revealObserver = null;
  }

  document.querySelectorAll(".reveal").forEach((node) => {
    node.classList.remove("reveal", "is-visible");
    delete node.dataset.delay;
  });

  if (prefersReducedMotion) {
    return;
  }

  revealGroups.forEach(([selector, baseDelay]) => {
    document.querySelectorAll(selector).forEach((node, index) => {
      node.classList.add("reveal");
      node.dataset.delay = String((index + baseDelay) % 4);
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.14,
    rootMargin: "0px 0px -8% 0px"
  });

  appState.revealObserver = observer;
  document.querySelectorAll(".reveal").forEach((node) => observer.observe(node));
}

function initPage() {
  syncActiveNav();
  syncYear();
  setupHeader();
  setupReveals();
  appState.currentPath = normalizePath(window.location.pathname);
}

function updateManagedMeta(nextDocument) {
  document.title = nextDocument.title;

  managedMetaSelectors.forEach((selector) => {
    const currentNode = document.head.querySelector(selector);
    const nextNode = nextDocument.head.querySelector(selector);

    if (!currentNode || !nextNode) {
      return;
    }

    if (currentNode.tagName === "LINK") {
      currentNode.setAttribute("href", nextNode.getAttribute("href") || "");
      return;
    }

    currentNode.setAttribute("content", nextNode.getAttribute("content") || "");
  });
}

function applyDocument(nextDocument) {
  const nextShell = nextDocument.querySelector(".site-shell");
  const currentShell = document.querySelector(".site-shell");

  if (!nextShell || !currentShell || !nextDocument.body) {
    throw new Error("Unable to load page shell.");
  }

  currentShell.innerHTML = nextShell.innerHTML;
  document.body.dataset.page = nextDocument.body.dataset.page || "";
  updateManagedMeta(nextDocument);
  initPage();
}

function scrollToTarget(hash) {
  if (!hash) {
    window.scrollTo({ top: 0, left: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    return;
  }

  const target = document.querySelector(hash);
  if (target) {
    target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
  } else {
    window.scrollTo({ top: 0, left: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  }
}

async function fetchPage(url) {
  const response = await fetch(`${url.pathname}${url.search}`, {
    headers: {
      "X-Requested-With": "jaypaulson-spa"
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to load ${url.pathname}`);
  }

  const html = await response.text();
  return new DOMParser().parseFromString(html, "text/html");
}

function runSwap(update) {
  if (prefersReducedMotion || typeof document.startViewTransition !== "function") {
    update();
    return Promise.resolve();
  }

  return document.startViewTransition(update).finished;
}

async function navigateTo(url, options = {}) {
  const {
    updateHistory = true,
    preserveScroll = false
  } = options;

  const targetUrl = typeof url === "string" ? new URL(url, window.location.href) : url;
  const currentPath = normalizePath(window.location.pathname);
  const targetPath = normalizePath(targetUrl.pathname);
  const historyUrl = toHistoryUrl(targetUrl);
  const hashOnlyChange = currentPath === targetPath && window.location.search === targetUrl.search && targetUrl.hash;
  const sameDocument = currentPath === targetPath && window.location.search === targetUrl.search && !targetUrl.hash;

  if (hashOnlyChange) {
    if (updateHistory) {
      window.history.pushState({}, "", historyUrl);
    }
    scrollToTarget(targetUrl.hash);
    return;
  }

  if (sameDocument) {
    if (updateHistory && window.location.href !== historyUrl) {
      window.history.pushState({}, "", historyUrl);
    }
    return;
  }

  try {
    const nextDocument = await fetchPage(targetUrl);

    await runSwap(() => {
      applyDocument(nextDocument);
    });

    if (updateHistory) {
      window.history.pushState({}, "", historyUrl);
    }

    if (!preserveScroll) {
      scrollToTarget(targetUrl.hash);
    }
  } catch (error) {
    window.location.href = targetUrl.href;
  }
}

function isSpaEligibleLink(link, event) {
  if (!link) {
    return false;
  }

  if (event.defaultPrevented || event.button !== 0) {
    return false;
  }

  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return false;
  }

  if (link.target && link.target !== "_self") {
    return false;
  }

  if (link.hasAttribute("download")) {
    return false;
  }

  const href = link.getAttribute("href");
  if (!href || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return false;
  }

  const url = new URL(link.href, window.location.href);

  if (url.origin !== window.location.origin) {
    return false;
  }

  const extension = url.pathname.split(".").pop();
  if (url.pathname.includes(".") && extension !== "html") {
    return false;
  }

  return true;
}

document.addEventListener("click", (event) => {
  const link = event.target.closest("a");

  if (!isSpaEligibleLink(link, event)) {
    return;
  }

  const url = new URL(link.href, window.location.href);
  const currentUrl = new URL(window.location.href);

  if (url.href === currentUrl.href) {
    return;
  }

  event.preventDefault();
  navigateTo(url);
});

window.addEventListener("popstate", () => {
  navigateTo(window.location.href, {
    updateHistory: false,
    preserveScroll: false
  });
});

initPage();
