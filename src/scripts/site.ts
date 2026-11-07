import "./smooth-scroll";

const toggle = document.querySelector<HTMLButtonElement>(".menu-toggle");
const nav = document.querySelector<HTMLElement>(".main-nav");
if (toggle && nav) {
  toggle.hidden = false;
  document.documentElement.classList.add("has-menu");
  const close = () => {
    toggle.setAttribute("aria-expanded", "false");
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-label", toggle.dataset.open!);
  };
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute(
      "aria-label",
      open ? toggle.dataset.close! : toggle.dataset.open!,
    );
    nav.classList.toggle("is-open", open);
  });
  nav.addEventListener("click", (event) => {
    if ((event.target as HTMLElement).closest("a")) close();
  });
  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      toggle.getAttribute("aria-expanded") === "true"
    ) {
      close();
      toggle.focus();
    }
  });
  document.addEventListener("click", (event) => {
    if (!(event.target as HTMLElement).closest(".header")) close();
  });
  nav.addEventListener("focusout", () => {
    queueMicrotask(() => {
      if (
        !nav.contains(document.activeElement) &&
        document.activeElement !== toggle
      )
        close();
    });
  });
  matchMedia("(min-width: 761px)").addEventListener("change", close);
}

// Hashes use stable section IDs in both languages, without browser storage.
const languageLinks =
  document.querySelectorAll<HTMLAnchorElement>("[data-language]");
const updateLanguage = () =>
  languageLinks.forEach((link) => {
    const url = new URL(link.href);
    url.hash = location.hash;
    link.href = url.href;
  });
updateLanguage();
window.addEventListener("hashchange", updateLanguage);

if ("IntersectionObserver" in window) {
  // Legal pages use the same progressive reveal without duplicating their markup.
  document
    .querySelectorAll<HTMLElement>(
      ".legal-body section, .legal-page > h1, .error-page",
    )
    .forEach((element) => {
      element.dataset.reveal = "";
    });
  const reveal = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          reveal.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -24px 0px" },
  );
  document
    .querySelectorAll("[data-reveal]")
    .forEach((element) => reveal.observe(element));
}

const sections = ["projects", "services", "about", "contact"]
  .map((id) => document.getElementById(id))
  .filter((section): section is HTMLElement => Boolean(section));
let scheduled = false;
const updateActive = () => {
  const availableScroll = document.documentElement.scrollHeight - innerHeight;
  const progress =
    availableScroll > 0
      ? Math.min(1, Math.max(0, scrollY / availableScroll))
      : 0;
  document.documentElement.style.setProperty(
    "--reading-progress",
    String(progress),
  );
  document
    .querySelector(".header")
    ?.classList.toggle("is-scrolled", scrollY > 20);
  const current = sections
    .filter(
      (section) =>
        section.getBoundingClientRect().top <= Math.min(innerHeight * 0.4, 240),
    )
    .at(-1);
  document
    .querySelectorAll<HTMLAnchorElement>("[data-section]")
    .forEach((link) => {
      if (link.dataset.section === current?.id)
        link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  // Keep the language switch at the section currently being read.
  languageLinks.forEach((link) => {
    const url = new URL(link.href);
    url.hash = current ? current.id : location.hash;
    link.href = url.href;
  });
  scheduled = false;
};
window.addEventListener(
  "scroll",
  () => {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(updateActive);
    }
  },
  { passive: true },
);
window.addEventListener("resize", () => {
  if (!scheduled) {
    scheduled = true;
    requestAnimationFrame(updateActive);
  }
});
updateActive();
