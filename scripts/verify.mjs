import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, stat, readdir } from "node:fs/promises";
import { resolve, sep, extname } from "node:path";
import { once } from "node:events";
import { Window } from "happy-dom";

const directory = resolve(process.env.VERIFY_DIR || "dist");
const base =
  `/${(process.env.BASE_PATH || "").replace(/^\/+|\/+$/g, "")}`.replace(
    /\/$/,
    "",
  );
const site = process.env.SITE_URL || "https://dere-prime.github.io";
const htmlFiles = [];
async function collect(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const absolute = resolve(dir, entry.name);
    if (entry.isDirectory()) await collect(absolute);
    else if (entry.name.endsWith(".html")) htmlFiles.push(absolute);
  }
}
await collect(directory);
assert.equal(htmlFiles.length, 10, "Ten real static HTML pages");

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "application/javascript",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};
const server = createServer(async (request, response) => {
  const pathname = decodeURIComponent(
    new URL(request.url, "http://localhost").pathname,
  );
  if (base && !pathname.startsWith(`${base}/`)) {
    response.writeHead(404).end();
    return;
  }
  const relative = pathname.slice(base.length).replace(/^\//, "");
  let file = resolve(directory, relative || "index.html");
  if (!file.startsWith(`${directory}${sep}`) && file !== directory) {
    response.writeHead(403).end();
    return;
  }
  try {
    if ((await stat(file)).isDirectory()) file = resolve(file, "index.html");
    const body = await readFile(file);
    response
      .writeHead(200, {
        "Content-Type": types[extname(file)] || "application/octet-stream",
      })
      .end(body);
  } catch {
    response
      .writeHead(404, { "Content-Type": "text/html; charset=utf-8" })
      .end(await readFile(resolve(directory, "404.html")));
  }
});
server.listen(0, "127.0.0.1");
await once(server, "listening");
const origin = `http://127.0.0.1:${server.address().port}`;
const checkedResources = new Set();
const doms = [];
let assertions = 0;
function check(condition, message) {
  assert.ok(condition, message);
  assertions++;
}

async function resource(url) {
  if (checkedResources.has(url.href)) return;
  check(url.origin === origin, `Resource served locally: ${url.href}`);
  const response = await fetch(url);
  check(response.status === 200, `Resource returns 200: ${url.pathname}`);
  check(
    !response.headers.has("set-cookie"),
    `No cookie set by static response: ${url.pathname}`,
  );
  checkedResources.add(url.href);
  if (url.pathname.endsWith(".css")) {
    const css = await response.text();
    for (const match of css.matchAll(/url\(["']?([^\s)'";]+)["']?\)/g)) {
      if (!match[1].startsWith("data:")) await resource(new URL(match[1], url));
    }
  }
}

try {
  for (const file of htmlFiles) {
    const relative = file.slice(directory.length + 1).replaceAll("\\", "/");
    const route = `${base}/${relative.replace(/index\.html$/, "")}`;
    const url = new URL(route, origin);
    const response = await fetch(url);
    check(response.status === 200, `Direct page request: ${route}`);
    const html = await response.text();
    const window = new Window({
      url: url.href,
      settings: {
        disableCSSFileLoading: true,
        disableJavaScriptEvaluation: true,
        disableJavaScriptFileLoading: true,
      },
    });
    window.document.write(html);
    doms.push(window);
    const doc = window.document;
    const lang = relative.startsWith("en/") ? "en" : "es";
    check(doc.documentElement.lang === lang, `Language: ${route}`);
    check(
      doc.querySelectorAll("h1").length === 1,
      `Single page heading: ${route}`,
    );
    check(
      doc.querySelector("title")?.textContent.includes("Dere Prime"),
      `Page title: ${route}`,
    );
    check(
      Boolean(doc.querySelector('meta[name="description"]')?.content),
      `Description: ${route}`,
    );
    check(
      Boolean(doc.querySelector('a.skip-link[href="#main"]')),
      `Skip link: ${route}`,
    );
    check(doc.querySelector("main")?.id === "main", `Main landmark: ${route}`);
    check(
      doc.querySelector('link[rel="canonical"]').href ===
        new URL(route, site).href,
      `Canonical: ${route}`,
    );
    check(
      doc.querySelectorAll('link[rel="alternate"][hreflang]').length === 3,
      `Hreflang: ${route}`,
    );
    check(
      doc.querySelectorAll("form,iframe,video,embed,object").length === 0,
      `No forms or third-party embeds: ${route}`,
    );
    for (const link of doc.querySelectorAll('a[href^="mailto:"]')) {
      check(
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(link.getAttribute("href").slice(7)),
        `Contact links require a real configured address: ${route}`,
      );
    }
    check(
      !doc.querySelector('a[href="mailto:"]'),
      `No empty contact link: ${route}`,
    );
    const ids = [...doc.querySelectorAll("[id]")].map((element) => element.id);
    check(ids.length === new Set(ids).size, `Unique IDs: ${route}`);

    for (const element of doc.querySelectorAll("a[href]")) {
      const target = new URL(element.getAttribute("href"), url);
      check(
        Boolean(
          element.getAttribute("aria-label") || element.textContent.trim(),
        ),
        `Accessible link name: ${route}`,
      );
      if (target.origin === origin) {
        check(
          !base || target.pathname.startsWith(`${base}/`),
          `Link uses base: ${target.pathname}`,
        );
        const linkResponse = await fetch(target);
        check(linkResponse.status === 200, `Internal link: ${target.pathname}`);
        if (target.hash) {
          const linked = new Window({
            settings: {
              disableCSSFileLoading: true,
              disableJavaScriptEvaluation: true,
              disableJavaScriptFileLoading: true,
            },
          });
          linked.document.write(await linkResponse.text());
          check(
            Boolean(
              linked.document.getElementById(
                decodeURIComponent(target.hash.slice(1)),
              ),
            ),
            `Anchor exists: ${target.href}`,
          );
          await linked.happyDOM.close();
        }
      }
    }
    for (const element of doc.querySelectorAll(
      'script[src],link[rel="stylesheet"],link[rel="icon"],img[src]',
    )) {
      const attribute = element.tagName === "LINK" ? "href" : "src";
      await resource(new URL(element.getAttribute(attribute), url));
    }
    for (const image of doc.querySelectorAll("img")) {
      check(
        image.width > 0 && image.height > 0,
        `Reserved image dimensions: ${route}`,
      );
      check(Boolean(image.alt), `Image alternative: ${route}`);
      for (const variant of (image.getAttribute("srcset") || "")
        .split(",")
        .filter(Boolean))
        await resource(new URL(variant.trim().split(/\s+/)[0], url));
    }
    if (relative === "index.html" || relative === "en/index.html") {
      const projects = [...doc.querySelectorAll(".project-link")];
      const expected = [
        "https://www.santysgeneralconstruction.com/",
        "https://nigalletasnichocolates.com/",
        "https://head.a-car-america-llc.pages.dev/",
      ];
      check(projects.length === 3, `Three projects: ${route}`);
      projects.forEach((link, i) =>
        check(
          link.href === expected[i],
          `Exact project URL ${i + 1}: ${route}`,
        ),
      );
      check(
        projects[2].textContent.includes(
          lang === "es" ? "Vista previa temporal" : "Temporary preview",
        ),
        `Temporary preview labeled: ${route}`,
      );
      check(
        doc.querySelector(".hero-art img").loading === "eager",
        `Hero loads eagerly: ${route}`,
      );
      check(
        [...doc.querySelectorAll(".project img")].every(
          (image) => image.loading === "lazy",
        ),
        `Projects load lazily: ${route}`,
      );
      check(
        doc.querySelector('#contact a[href="mailto:dere.prime@gmail.com"]'),
        `Official work email: ${route}`,
      );
      check(
        doc.querySelector(
          '#contact a[href="https://discord.com/users/1392025706510286869"]',
        ),
        `Exact Discord profile and ID: ${route}`,
      );
      check(
        doc.querySelector('#contact a[href="https://github.com/dere-prime"]'),
        `GitHub profile: ${route}`,
      );
      check(
        doc.querySelector('[data-section="contact"]'),
        `Contact appears in navigation: ${route}`,
      );
    }
  }

  const missing = await fetch(`${origin}${base}/missing/deep/path/`);
  check(
    missing.status === 404,
    "Actual 404 response for unknown nested routes",
  );
  check(
    (await missing.text()).includes("English homepage"),
    "404 has a path to English",
  );

  const rootHtml = await (await fetch(`${origin}${base}/`)).text();
  const cssSources = [];
  for (const file of await readdir(resolve(directory, "_astro"))) {
    if (file.endsWith(".css"))
      cssSources.push(
        await readFile(resolve(directory, "_astro", file), "utf8"),
      );
  }
  const css = cssSources.join("\n");
  check(
    !css.includes("prefers-reduced-motion"),
    "Animations remain enabled regardless of browser motion preference",
  );
  check(
    css.includes(":focus-visible"),
    "Visible keyboard focus styles present",
  );
  check(
    css.includes("520px") && css.includes("760px"),
    "Mobile breakpoints present",
  );
  check(css.includes("object-fit:contain"), "Complete logos use contain");

  // DOM interaction tests exercise the actual production script, without claiming browser rendering.
  for (const reduced of [false, true]) {
    for (const lang of ["es", "en"]) {
      const pageHtml =
        lang === "es"
          ? rootHtml
          : await (await fetch(`${origin}${base}/en/`)).text();
      const window = new Window({
        url: `${origin}${base}/${lang === "en" ? "en/" : ""}`,
        width: 360,
        height: 800,
        settings: {
          disableCSSFileLoading: true,
          disableJavaScriptEvaluation: true,
          disableJavaScriptFileLoading: true,
        },
      });
      doms.push(window);
      window.document.write(pageHtml);
      const doc = window.document;
      Object.defineProperty(doc.documentElement, "scrollHeight", {
        value: 2000,
        configurable: true,
      });
      let observed = [];
      let stopped = [];
      let revealCallback;
      window.matchMedia = (query) => ({
        matches: query.includes("reduced-motion") ? reduced : false,
        addEventListener() {},
        removeEventListener() {},
      });
      window.IntersectionObserver = class {
        constructor(callback) {
          revealCallback = callback;
        }
        observe(target) {
          observed.push(target);
        }
        unobserve(target) {
          stopped.push(target);
        }
      };
      ["projects", "services", "about", "contact"].forEach((id, index) => {
        doc.getElementById(id).getBoundingClientRect = () => ({
          top: 1000 + index * 1000,
        });
      });
      const scriptElement = doc.querySelector('script[type="module"]');
      const script = scriptElement.src
        ? await (await fetch(scriptElement.src)).text()
        : scriptElement.textContent;
      check(
        !/localStorage|sessionStorage|document\.cookie|serviceWorker|sendBeacon|https?:\/\//.test(
          script,
        ),
        "No tracking, storage or remote calls in client bundle",
      );
      check(
        script.length < 40000,
        "Client bundle including scroll smoothing stays below 40 kB",
      );
      // Evaluation is deliberate and restricted to this locally built application bundle.
      window.happyDOM.settings.enableJavaScriptEvaluation = true;
      // Happy DOM's VM global proxy lacks the real browser's Window identity.
      // Lenis uses that identity to choose viewport dimensions over element dimensions.
      const vmWindow = window.eval("window");
      window.Window = class {
        static [Symbol.hasInstance](candidate) {
          return candidate === vmWindow || candidate === window;
        }
      };
      window.eval(script);
      check(
        doc.documentElement.classList.contains("lenis"),
        "Smooth scrolling initializes with either motion preference",
      );
      const toggle = doc.querySelector(".menu-toggle");
      const nav = doc.querySelector(".main-nav");
      check(
        !toggle.hidden && toggle.getAttribute("aria-expanded") === "false",
        `Menu initialized: ${lang}, reduced=${reduced}`,
      );
      toggle.click();
      check(
        toggle.getAttribute("aria-expanded") === "true" &&
          nav.classList.contains("is-open"),
        "Menu opens",
      );
      doc.dispatchEvent(
        new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      );
      check(
        toggle.getAttribute("aria-expanded") === "false" &&
          doc.activeElement === toggle,
        "Escape closes menu and returns focus",
      );
      toggle.click();
      doc.querySelector("main").click();
      check(
        toggle.getAttribute("aria-expanded") === "false",
        "Outside click closes menu",
      );
      toggle.click();
      nav.querySelector("a").click();
      check(
        toggle.getAttribute("aria-expanded") === "false",
        "Section link closes menu",
      );
      window.location.hash = "#services";
      window.dispatchEvent(new window.HashChangeEvent("hashchange"));
      const languageLink = doc.querySelector("[data-language]");
      check(
        new URL(languageLink.href).hash === "#services",
        "Language switch preserves section",
      );
      check(
        new URL(languageLink.href).pathname ===
          `${base}/${lang === "es" ? "en/" : ""}`,
        "Language switch uses equivalent URL and base",
      );
      check(
        observed.length === doc.querySelectorAll("[data-reveal]").length &&
          observed.length > 3,
        `Section animations remain enabled: reduced=${reduced}`,
      );
      check(
        observed.filter((element) => element.classList.contains("project"))
          .length === 3,
        "All three project cards still animate",
      );
      revealCallback([{ isIntersecting: false, target: observed[0] }]);
      check(
        !observed[0].classList.contains("revealed") && stopped.length === 0,
        "Entrances wait until the section reaches the viewport",
      );
      revealCallback(
        observed.map((target) => ({ isIntersecting: true, target })),
      );
      check(
        observed.every((element) => element.classList.contains("revealed")) &&
          stopped.length === observed.length,
        "Reveal activates and unobserves to run only once",
      );
      Object.defineProperty(doc.documentElement, "scrollHeight", {
        value: 2000,
        configurable: true,
      });
      // Stop the anchor animation before testing the independently scheduled header.
      window.dispatchEvent(new window.PageTransitionEvent("pagehide"));
      window.scrollTo(0, 200);
      window.dispatchEvent(new window.Event("scroll"));
      await new Promise((resolveFrame) =>
        window.requestAnimationFrame(resolveFrame),
      );
      check(
        doc.querySelector(".header").classList.contains("is-scrolled"),
        "Header responds to scrolling",
      );
      const progress = Number(
        doc.documentElement.style.getPropertyValue("--reading-progress"),
      );
      check(
        progress > 0 && progress <= 1,
        "Reading progress follows the scroll position",
      );
      check(doc.cookie === "", "No cookies created by client script");
      check(
        window.localStorage.length === 0 && window.sessionStorage.length === 0,
        "No browser storage written",
      );
      window.dispatchEvent(new window.PageTransitionEvent("pagehide"));
      check(
        !doc.documentElement.classList.contains("lenis"),
        "Smoothing releases events when leaving the page",
      );
      // Drive animation frames explicitly to check interpolation, not timer timing.
      window.scrollTo(0, 100);
      const nativeCancel = window.cancelAnimationFrame.bind(window);
      const frames = new Map();
      let frameId = 100000;
      let time = 0;
      window.requestAnimationFrame = (callback) => {
        frames.set(++frameId, callback);
        return frameId;
      };
      window.cancelAnimationFrame = (id) => {
        if (!frames.delete(id)) nativeCancel(id);
      };
      const advance = (count = 1) => {
        for (let i = 0; i < count; i++) {
          time += 1000 / 60;
          const pending = [...frames.values()];
          frames.clear();
          pending.forEach((callback) => callback(time));
        }
      };
      const restored = new window.Event("pageshow");
      Object.defineProperty(restored, "persisted", { value: true });
      window.dispatchEvent(restored);
      check(
        doc.documentElement.classList.contains("lenis"),
        "Smoothing recovers after back/forward cache restoration",
      );
      const wheel = new window.WheelEvent("wheel", {
        deltaY: 300,
        bubbles: true,
        cancelable: true,
      });
      doc.body.dispatchEvent(wheel);
      check(
        wheel.defaultPrevented && window.scrollY === 100,
        "Wheel input waits for animation instead of jumping immediately",
      );
      advance(4);
      check(
        window.scrollY > 100 && window.scrollY < 370,
        "Wheel scroll interpolates toward its target",
      );
      doc.body.dispatchEvent(
        new window.WheelEvent("wheel", {
          deltaY: 300,
          bubbles: true,
          cancelable: true,
        }),
      );
      advance(120);
      check(
        Math.abs(window.scrollY - 640) <= 1,
        "Repeated wheel input accumulates and settles at the intended distance",
      );
      const zoom = new window.WheelEvent("wheel", {
        deltaY: 200,
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      });
      Object.defineProperty(zoom, "ctrlKey", { value: true });
      doc.body.dispatchEvent(zoom);
      check(!zoom.defaultPrevented, "Browser zoom gestures remain native");
      const touch = (type, y, fingers = 1) => {
        const event = new window.Event(type, {
          bubbles: true,
          cancelable: true,
        });
        const points = Array.from({ length: fingers }, () => ({
          clientX: 100,
          clientY: y,
        }));
        Object.defineProperties(event, {
          targetTouches: { value: points },
          touches: { value: points },
        });
        doc.body.dispatchEvent(event);
        return event;
      };
      touch("touchstart", 300);
      const move = touch("touchmove", 200);
      advance(2);
      const releasedAt = window.scrollY;
      touch("touchend", 200);
      advance(3);
      check(
        move.defaultPrevented &&
          releasedAt > 640 &&
          window.scrollY > releasedAt &&
          window.scrollY < 1200,
        "Touch release continues with interpolated inertia",
      );
      advance(120);
      check(
        window.scrollY <= 1200 && window.scrollY >= 0,
        "Touch inertia stays within document bounds",
      );
      touch("touchstart", 200, 2);
      const pinch = touch("touchmove", 150, 2);
      check(
        !pinch.defaultPrevented,
        "Multi-finger touch gestures remain native",
      );
      window.dispatchEvent(new window.PageTransitionEvent("pagehide"));
    }
  }
  console.log(
    `PASS ${base || "/"} — ${htmlFiles.length} pages, ${checkedResources.size} local resources, ${assertions} HTTP/DOM checks.`,
  );
} finally {
  await Promise.all(doms.map((window) => window.happyDOM.close()));
  await new Promise((resolveClose, reject) =>
    server.close((error) => (error ? reject(error) : resolveClose())),
  );
}
