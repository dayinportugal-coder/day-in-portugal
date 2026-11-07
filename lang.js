/* Day in Portugal — language switcher.
   The button shows only the active language's flag. English uses the UK flag.
   Choice is remembered in localStorage (dip-lang). On the English homepage only,
   a saved non-English choice redirects, except for bots, back/forward, and
   arrivals that came from a language-switcher click. */
(function () {
  var KEY = "dip-lang";
  var VIA = "dip-lang-link";
  var LANGS = [
    { code: "en", label: "English", flag: "/img/flags/gb.svg", btn: "Language: English" },
    { code: "es", label: "Español", flag: "/img/flags/es.svg", btn: "Idioma: español" },
    { code: "fr", label: "Français", flag: "/img/flags/fr.svg", btn: "Langue : français" },
    { code: "de", label: "Deutsch", flag: "/img/flags/de.svg", btn: "Sprache: Deutsch" },
    { code: "pt", label: "Português", flag: "/img/flags/pt.svg", btn: "Idioma: português" }
  ];

  function isBot() {
    var ua = navigator.userAgent || "";
    return /bot|crawl|spider|slurp|baidu|yandex|duckduck|facebookexternalhit|embedly|pinterest|redditbot|whatsapp|telegram|slackbot|linkedinbot|vkshare|w3c|lighthouse|pagespeed|headless|gptbot|claudebot|amazonbot|applebot|semrush|ahrefs|petalbot/i.test(ua);
  }

  function currentLang() {
    var m = (location.pathname || "/").match(/^\/(es|fr|de|pt)(?=\/|$)/);
    return m ? m[1] : "en";
  }

  function barePath() {
    var path = location.pathname || "/";
    var q = path.indexOf("?");
    if (q >= 0) path = path.slice(0, q);
    path = path.replace(/^\/(es|fr|de|pt)(?=\/|$)/, "");
    if (path === "" || path === "/index.html") return "/";
    return path;
  }

  function pageTarget(code) {
    var path = barePath();
    var tail = location.search || "";
    var hash = location.hash || "";
    if (code === "en") return (path || "/") + tail + hash;
    if (path === "/") return "/" + code + "/" + tail + hash;
    return "/" + code + path + tail + hash;
  }

  function maybeRedirect() {
    if (currentLang() !== "en") return;
    var path = location.pathname || "/";
    if (path !== "/" && path !== "/index.html") return;
    if (isBot()) return;
    try {
      var nav = performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
      if (nav && nav.type === "back_forward") return;
    } catch (e) {}
    try {
      if (sessionStorage.getItem(VIA) === "1") {
        sessionStorage.removeItem(VIA);
        return;
      }
    } catch (e) {}
    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) { return; }
    if (saved !== "es" && saved !== "fr" && saved !== "de" && saved !== "pt") return;
    location.replace("/" + saved + "/" + (location.search || "") + (location.hash || ""));
  }

  maybeRedirect();

  function make(tag, attrs) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        if (key === "text") node.textContent = attrs[key];
        else node.setAttribute(key, attrs[key]);
      });
    }
    return node;
  }

  var lang = currentLang();
  var active = LANGS.filter(function (item) { return item.code === lang; })[0] || LANGS[0];
  var open = false;
  var btn, menu;

  function close(restore) {
    if (!open) return;
    open = false;
    menu.hidden = true;
    btn.setAttribute("aria-expanded", "false");
    if (restore) btn.focus();
  }

  function openMenu() {
    open = true;
    menu.hidden = false;
    btn.setAttribute("aria-expanded", "true");
    var current = menu.querySelector('[aria-current="true"]') || menu.querySelector("a");
    if (current) current.focus();
  }

  function remember(code) {
    try { localStorage.setItem(KEY, code); } catch (e) {}
    try { sessionStorage.setItem(VIA, "1"); } catch (e) {}
  }

  function build() {
    if (document.getElementById("lang-switch")) return;
    var wrap = make("div", { id: "lang-switch", "class": "lang-switch" });
    btn = make("button", {
      type: "button",
      "class": "lang-btn",
      "aria-expanded": "false",
      "aria-haspopup": "true",
      "aria-controls": "lang-menu",
      "aria-label": active.btn
    });
    btn.appendChild(make("img", { src: active.flag, alt: "", width: "30", height: "20", "aria-hidden": "true" }));
    menu = make("ul", { id: "lang-menu", "class": "lang-menu", role: "menu", hidden: "hidden" });
    menu.hidden = true;
    LANGS.forEach(function (item) {
      var li = make("li", { role: "none" });
      var link = make("a", {
        href: pageTarget(item.code),
        role: "menuitem",
        lang: item.code === "pt" ? "pt-PT" : item.code,
        hreflang: item.code
      });
      link.appendChild(make("img", { src: item.flag, alt: "", width: "28", height: "18", "aria-hidden": "true" }));
      link.appendChild(document.createTextNode(item.label));
      if (item.code === lang) link.setAttribute("aria-current", "true");
      link.addEventListener("click", function () { remember(item.code); });
      li.appendChild(link);
      menu.appendChild(li);
    });
    wrap.appendChild(btn);
    wrap.appendChild(menu);

    btn.addEventListener("click", function (event) {
      event.stopPropagation();
      if (open) close(false);
      else openMenu();
    });
    btn.addEventListener("keydown", function (event) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        if (!open) openMenu();
      }
    });
    menu.addEventListener("keydown", function (event) {
      var links = Array.prototype.slice.call(menu.querySelectorAll("a"));
      var index = links.indexOf(document.activeElement);
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        close(true);
        return;
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        links[(index + 1 + links.length) % links.length].focus();
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        links[(index - 1 + links.length) % links.length].focus();
      } else if (event.key === "Home") {
        event.preventDefault();
        links[0].focus();
      } else if (event.key === "End") {
        event.preventDefault();
        links[links.length - 1].focus();
      }
    });
    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape" || !open) return;
      event.preventDefault();
      event.stopPropagation();
      close(true);
    }, true);
    document.addEventListener("click", function (event) {
      if (!open) return;
      if (wrap.contains(event.target)) return;
      close(false);
    });

    var header = document.querySelector("header.top .top-inner");
    if (header) {
      var ig = header.querySelector(".top-ig");
      var before = ig;
      if (ig && ig.parentElement && ig.parentElement.classList.contains("top-social")) before = ig.parentElement;
      if (before) header.insertBefore(wrap, before);
      else header.appendChild(wrap);
      return;
    }
    var banner = document.querySelector(".banner");
    if (banner) {
      banner.classList.add("has-lang");
      banner.appendChild(wrap);
      return;
    }
    wrap.classList.add("lang-switch-fixed");
    document.body.appendChild(wrap);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})();
