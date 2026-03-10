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
