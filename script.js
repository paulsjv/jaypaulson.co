const page = document.body.dataset.page;

document.querySelectorAll("[data-nav]").forEach((link) => {
  if (link.dataset.nav === page) {
    link.setAttribute("aria-current", "page");
  }
});

const yearNode = document.querySelector("[data-year]");
if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

const header = document.querySelector(".site-header");
if (header) {
  const syncHeaderState = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 10);
  };

  syncHeaderState();
  window.addEventListener("scroll", syncHeaderState, { passive: true });
}

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!prefersReducedMotion) {
  const groups = [
    [".hero-actions > *", 0],
    [".metrics .metric", 1],
    [".grid-3 .card", 0],
    [".talk-card", 0],
    [".article-card", 0],
    [".contact-card", 0],
    [".button-row > *", 0]
  ];

  groups.forEach(([selector, baseDelay]) => {
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

  document.querySelectorAll(".reveal").forEach((node) => observer.observe(node));
}
