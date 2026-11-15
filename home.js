/* Day in Portugal — home page: experience cards, interactive map, scroll reveal,
   sticky mobile booking bar. Data lives in /experiences.js. Works without JS:
   the HTML keeps plain links, this file only adds the interactive layer. */
(function () {
  var D = window.DIP_EXP;
  var LANG = (location.pathname.match(/^\/(es|fr|de|pt)(?=\/|$)/) || [])[1] || "en";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var doc = document;

  function el(tag, attrs, kids) {
    var n = doc.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (k === "text") n.textContent = attrs[k];
      else if (k === "html") n.innerHTML = attrs[k];
      else n.setAttribute(k, attrs[k]);
    }
    (kids || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }
  function t(obj) { return (obj && (obj[LANG] || obj.en)) || ""; }
  function guideHref(p) { return LANG === "en" ? p : "/" + LANG + p; }
  var U = D ? (D.ui[LANG] || D.ui.en) : {};
  var euro = function (n) {
    try { return new Intl.NumberFormat(LANG === "en" ? "en-GB" : LANG, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n); }
    catch (e) { return "€" + n; }
  };

  function card(item, compact) {
    var a = el("article", { "class": "xp-card" + (compact ? " is-compact" : ""), "data-group": item.group, "data-place": item.place });
    var fig = el("div", { "class": "xp-media" }, [
      el("img", { src: item.img, width: "640", height: "427", alt: "", loading: "lazy", decoding: "async" }),
      el("span", { "class": "xp-place", text: t(D.places[item.place].name) })
    ]);
    if (item.badge) fig.appendChild(el("span", { "class": "xp-badge", text: U.badge + " *" }));
    a.appendChild(fig);
    var body = el("div", { "class": "xp-body" });
    body.appendChild(el("h3", { "class": "xp-name", text: t(item.name) }));
    body.appendChild(el("p", { "class": "xp-meta", text: t(item.meta) }));
    var row = el("div", { "class": "xp-row" });
    if (item.price) row.appendChild(el("p", { "class": "xp-price", html: "<span>" + U.from + "</span> " + euro(item.price) }));
    else if (!item.href) row.appendChild(el("p", { "class": "xp-price is-free", text: U.free }));
    body.appendChild(row);
    var ctas = el("div", { "class": "xp-ctas" });
    if (item.href) {
      ctas.appendChild(el("a", { "class": "btn xp-book", href: item.href, rel: "sponsored nofollow noopener", target: "_blank", "data-exp": item.id, html: U.book + '<span class="sr-only"> ' + U.newtab + "</span>" }));
      ctas.appendChild(el("a", { "class": "xp-guide", href: guideHref(item.guide), text: U.guide }));
    } else {
      ctas.appendChild(el("a", { "class": "btn xp-book is-ghost", href: guideHref(item.guide), text: U.guide }));
    }
    body.appendChild(ctas);
    a.appendChild(body);
    return a;
  }

  /* ---------- experience grid + filters ---------- */
  var grid = doc.getElementById("xp-grid");
  if (D && grid) {
    grid.textContent = "";
    D.items.forEach(function (it) { grid.appendChild(card(it)); });
    var chips = doc.getElementById("xp-filters");
    if (chips) {
      chips.textContent = "";
      ["all", "porto", "trips", "lisbon"].forEach(function (g, i) {
        var b = el("button", { type: "button", "class": "xp-chip", "aria-pressed": i === 0 ? "true" : "false", "data-filter": g, text: U[g] });
        b.addEventListener("click", function () {
          chips.querySelectorAll(".xp-chip").forEach(function (c) { c.setAttribute("aria-pressed", c === b ? "true" : "false"); });
          grid.querySelectorAll(".xp-card").forEach(function (c) { c.hidden = !(g === "all" || c.getAttribute("data-group") === g); });
          grid.scrollLeft = 0;
        });
        chips.appendChild(b);
      });
    }
    var note = doc.getElementById("xp-note");
    if (note) note.textContent = "* " + U.badgeNote + " " + U.priceNote;
  }

  /* ---------- map ---------- */
  var map = doc.getElementById("pt-map");
  var panel = doc.getElementById("pt-panel");
  if (D && map && panel) {
    var LON0 = -10.0, LAT1 = 42.25, C = 0.7710692, SX = 185.185185, VW = 585, VH = 1000;
    var pins = el("div", { "class": "pt-pins" });
    map.appendChild(pins);
    var buttons = {};
    Object.keys(D.places).forEach(function (key) {
      var p = D.places[key];
      var list = D.items.filter(function (i) { return i.place === key; });
      if (!list.length) return;
      var lon = p.vlon || p.lon, lat = p.vlat || p.lat;
      var x = ((lon - LON0) * C * SX) / VW * 100, y = ((LAT1 - lat) * SX) / VH * 100;
      var b = el("button", {
        type: "button", "class": "pt-pin" + (p.dx < 0 ? " lbl-left" : ""), style: "left:" + x.toFixed(2) + "%;top:" + y.toFixed(2) + "%",
        "aria-pressed": "false", "aria-controls": "pt-panel", "data-place": key,
        "aria-label": t(p.name) + " — " + list.length + " " + U.here
      }, [el("span", { "class": "pt-dot", "aria-hidden": "true" }), el("span", { "class": "pt-label", "aria-hidden": "true", text: p.short || t(p.name) }), el("span", { "class": "pt-count", "aria-hidden": "true", text: String(list.length) })]);
      if (p.dy) b.style.setProperty("--ly", p.dy + "em");
      b.addEventListener("click", function () { select(key, true); });
      pins.appendChild(b);
      buttons[key] = b;
    });
    function select(key, fromUser) {
      Object.keys(buttons).forEach(function (k) { buttons[k].setAttribute("aria-pressed", k === key ? "true" : "false"); });
      var p = D.places[key];
      var list = D.items.filter(function (i) { return i.place === key; });
      panel.textContent = "";
      panel.appendChild(el("p", { "class": "kicker", text: list.length + " " + U.here }));
      panel.appendChild(el("h3", { "class": "pt-title", text: t(p.name) }));
      var wrap = el("div", { "class": "pt-cards" });
      list.forEach(function (it) { wrap.appendChild(card(it, true)); });
      panel.appendChild(wrap);
      panel.classList.remove("is-in"); void panel.offsetWidth; panel.classList.add("is-in");
      if (fromUser && window.matchMedia("(max-width: 899px)").matches) {
        panel.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      }
    }
    select("porto", false);
  }

  /* ---------- scroll reveal ---------- */
  var targets = doc.querySelectorAll("main .reveal, main .ia-topics, main .ia-popular, main .chapter-head, main .tiles > *, main .ia-grid > *, main .ia-topic-grid > *, main .split, main .move-grid > *, main .biz-grid > *, main .follow, main .xp-card, main .trust > *, main .ddp-promo");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-visible");
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    targets.forEach(function (n) {
      var r = n.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.92) return; // already on screen: no flash
      var sibs = n.parentElement ? Array.prototype.indexOf.call(n.parentElement.children, n) : 0;
      n.style.setProperty("--d", Math.min(sibs, 5) * 70 + "ms");
      n.classList.add("rv");
      io.observe(n);
    });
  }

  /* ---------- sticky booking bar (phones) ---------- */
  var bar = doc.getElementById("book-bar");
  var hero = doc.querySelector(".film-hero");
  var xp = doc.getElementById("experiences");
  if (bar && hero && "IntersectionObserver" in window) {
    var heroOut = false, xpIn = false;
    var upd = function () { bar.classList.toggle("is-on", heroOut && !xpIn); };
    new IntersectionObserver(function (e) { heroOut = !e[0].isIntersecting; upd(); }).observe(hero);
    if (xp) new IntersectionObserver(function (e) { xpIn = e[0].isIntersecting; upd(); }, { threshold: 0.15 }).observe(xp);
  }
})();
