/* Day in Portugal — site menu.
   This file is the only menu definition. Four entries since 15/11/2026:
   Experiences, Map (a plain link), Guides (a mega panel with one column per
   section) and About. To add a guide, add one { href, label } object to the
   right section of Guides. An empty group is not shown. */
(function () {
  var MENU = [
    {
      id: "experiencias",
      label: "Experiences",
      hub: { href: "/#experiences", label: "All experiences" },
      items: [
        { href: "/book", label: "Book in Porto" },
        { href: "/douro-day", label: "Douro day from Porto" },
        { href: "/porto-river-cruise", label: "Six bridges cruise" },
        { href: "/gaia-port-cellars", label: "Port cellars in Gaia" },
        { href: "/porto-food-tours", label: "Food and wine tours" },
        { href: "/fado-in-porto", label: "Fado in Porto" },
        { href: "/livraria-lello-tickets", label: "Livraria Lello" },
        { href: "/sintra-day-trip", label: "Sintra day trip" },
        { href: "/lisbon-book-first", label: "Book before Lisbon" },
        { href: "/douro-planner/", label: "Douro Day Planner (free app)" }
      ]
    },
    { id: "mapa", label: "Map", link: "/#map" },
    {
      id: "guias",
      label: "Guides",
      sections: [
        { id: "porto", label: "Porto", hub: { href: "/porto-guide", label: "All Porto guides" }, items: [
            { href: "/porto-3-days", label: "3 days in Porto" },
            { href: "/book", label: "Book in Porto" },
            { href: "/book-first", label: "Book before you fly" },
            { href: "/stay", label: "Where to sleep" },
            { href: "/gaia-port-cellars", label: "Port cellars in Gaia" },
            { href: "/porto-river-cruise", label: "Six bridges cruise" },
            { href: "/porto-food-tours", label: "Food and wine tours" },
            { href: "/fado-in-porto", label: "Fado in Porto" },
            { href: "/livraria-lello-tickets", label: "Livraria Lello" },
            { href: "/bring", label: "What to bring home" },
            { href: "/rent-car", label: "Car or metro" }
          ] },
        { id: "cidades", label: "Day trips", hub: { href: "/porto-day-trips", label: "Day trips from Porto" }, items: [
            { href: "/douro-day", label: "Douro Valley" },
            { href: "/braga-guimaraes-day-trip", label: "Braga and Guimarães" },
            { href: "/aveiro-day-trip", label: "Aveiro and Costa Nova" },
            { href: "/povoa-base", label: "Póvoa de Varzim and Vila do Conde" },
            { href: "/sintra-day-trip", label: "Sintra day trip" },
            { href: "/cascais-day-trip", label: "Cascais day trip" },
            { href: "/evora-day-trip", label: "Évora day trip" }
          ] },
        { id: "lisboa", label: "Lisbon", hub: { href: "/lisbon-guide", label: "All Lisbon guides" }, items: [
            { href: "/lisbon-3-days", label: "3 days in Lisbon" },
            { href: "/lisbon-where-to-stay", label: "Where to stay in Lisbon" },
            { href: "/lisbon-book-first", label: "Book before Lisbon" }
          ] },
        { id: "aeroporto", label: "Airport", hub: { href: "/airport-transfers", label: "All airport transfers" }, items: [
            { href: "/porto-airport-transfer", label: "Porto airport transfer" },
            { href: "/lisbon-airport-transfer", label: "Lisbon airport transfer" }
          ] },
        { id: "vistos", label: "Moving to Portugal", hub: { href: "/moving-to-portugal", label: "All moving guides" }, items: [
            { href: "/move-to-portugal-2026", label: "Moving to Portugal in 2026" },
            { href: "/portugal-d7-visa", label: "Portugal D7 visa" },
            { href: "/portugal-d8-digital-nomad-visa", label: "Portugal D8 digital nomad visa" },
            { href: "/d7-vs-d8-visa-portugal", label: "D7 vs D8 visa" },
            { href: "/portugal-visa-income-calculator", label: "Visa income calculator" },
            { href: "/portugal-visa-document-checklist", label: "Visa document checklist" },
            { href: "/portugal-aima-residence-permit", label: "AIMA residence permit" },
            { href: "/portugal-family-reunification", label: "Family reunification" },
            { href: "/portugal-nif-niss", label: "NIF and NISS" },
            { href: "/portugal-tax-residency-2026", label: "Tax residency and IFICI" },
            { href: "/open-a-bank-account-in-portugal", label: "Open a bank account" },
            { href: "/renting-in-portugal-as-a-foreigner", label: "Renting as a foreigner" },
            { href: "/portugal-healthcare-for-expats", label: "Healthcare for foreigners" },
            { href: "/portugal-cost-of-living-2026", label: "Cost of living 2026" },
            { href: "/lisbon-cost-of-living-2026", label: "Lisbon cost of living" },
            { href: "/porto-cost-of-living-2026", label: "Porto cost of living" },
            { href: "/moving-to-portugal-from-the-uk", label: "Moving from the UK" },
            { href: "/moving-to-portugal-from-the-usa", label: "Moving from the USA" }
          ] }
      ]
    },
    {
      id: "sobre",
      label: "About",
      items: [
        { href: "/#about", label: "About Day in Portugal" },
        { href: "/disclosure", label: "How we earn" },
        { href: "/loja.html", label: "Gifts from Portugal" },
        { href: "/demos/", label: "For businesses" },
        { href: "/credits", label: "Photo credits" },
        { href: "/privacy", label: "Privacy" },
        { href: "mailto:dayinportugal@gmail.com", label: "Contact: dayinportugal@gmail.com" }
      ]
    }
  ];

  function normPath(value) {
    var path = value || "/";
    try { path = new URL(value, location.origin).pathname; } catch (e) {}
    path = String(path).split("?")[0].split("#")[0];
    if (path.endsWith("/index.html")) path = path.slice(0, -"/index.html".length);
    else if (path.endsWith(".html")) path = path.slice(0, -5);
    if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
    if (path === "" || path === "/index") path = "/";
    return path;
  }

  var LANG = (location.pathname.match(/^\/(es|fr|de|pt)(?=\/|$)/) || [])[1] || "en";
  var I18N = window.DIP_I18N || { groups: {}, items: {}, ui: {} };

  function barePath(value) {
    var path = normPath(value);
    path = path.replace(/^\/(es|fr|de|pt)(?=\/|$)/, "");
    if (path === "") path = "/";
    return path;
  }

  function hasPage(lang, bare) {
    var all = window.DIP_PAGES;
    if (!all || !all[lang]) return true;
    if (bare.length > 1 && bare.endsWith("/")) bare = bare.slice(0, -1);
    return all[lang].indexOf(bare) >= 0 || all[lang].indexOf(bare + ".html") >= 0;
  }

  function tGroup(id, fallback) {
    var table = I18N.groups[LANG];
    return (table && table[id]) || fallback;
  }

  function tItem(href, fallback) {
    var table = I18N.items[LANG];
    if (!table) return fallback;
    if (table[href + "|" + fallback]) return table[href + "|" + fallback];
    return table[href] || fallback;
  }

  function tUi(key, fallback) {
    var table = I18N.ui[LANG];
    return (table && table[key]) || fallback;
  }

  function localizeHref(href) {
    if (LANG === "en") return href;
    var hash = "";
    var query = "";
    var path = href;
    var hi = path.indexOf("#");
    if (hi >= 0) { hash = path.slice(hi); path = path.slice(0, hi); }
    var qi = path.indexOf("?");
    if (qi >= 0) { query = path.slice(qi); path = path.slice(0, qi); }
    if (/^(https?:|mailto:)/i.test(path)) return href;
    var trailing = path.length > 1 && path.endsWith("/");
    var bare = barePath(path);
    if (!hasPage(LANG, bare === "/loja" ? "/loja.html" : bare)) return href;
    if (path === "/loja.html") return "/" + LANG + "/loja.html" + query + hash;
    if (bare === "/") return "/" + LANG + "/" + query + hash;
    return "/" + LANG + bare + (trailing ? "/" : "") + query + hash;
  }

  var here = barePath(location.pathname);
  var nav = document.getElementById("site-menu");
  var toggle = document.querySelector(".menu-toggle");
  var header = document.querySelector("header.top");
  if (!nav || !header) return;
  nav.setAttribute("aria-label", tUi("main", nav.getAttribute("aria-label") || "Main"));
  if (toggle && LANG !== "en") toggle.setAttribute("aria-label", tUi("open", "Open menu"));

  var mobileQuery = window.matchMedia("(max-width: 819px)");

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

  nav.textContent = "";

  function renderList(items, state) {
    var list = make("ul");
    items.forEach(function (item) {
      var li = make("li");
      var target = localizeHref(item.href);
      var link = make("a", { href: target, text: tItem(item.href, item.label) });
      if (LANG !== "en" && !/^(\/(es|fr|de|pt)(\/|$)|mailto:)/.test(target)) {
        link.setAttribute("hreflang", "en");
        link.appendChild(make("span", { "class": "menu-en", text: "EN" }));
      }
      if (item.href.indexOf("#") < 0 && barePath(item.href) === here) {
        link.setAttribute("aria-current", "page");
        state.current = true;
      }
      li.appendChild(link);
      list.appendChild(li);
    });
    return list;
  }

  function renderHub(hub, state) {
    var hubLink = make("a", { "class": "menu-hub", href: localizeHref(hub.href), text: tItem(hub.href, hub.label) + " \u2192" });
    if (hub.href.indexOf("#") < 0 && barePath(hub.href) === here) { hubLink.setAttribute("aria-current", "page"); state.current = true; }
    return hubLink;
  }

  MENU.forEach(function (group) {
    if (group.link) {
      var solo = make("div", { "class": "menu-group menu-solo" });
      solo.appendChild(make("a", { "class": "menu-btn menu-link", href: localizeHref(group.link), text: tGroup(group.id, group.label) }));
      nav.appendChild(solo);
      return;
    }
    var state = { current: false };
    var wrap = make("div", { "class": "menu-group" });
    var panelId = "menu-" + group.id;
    var button = make("button", {
      type: "button",
      "class": "menu-btn",
      "aria-expanded": "false",
      "aria-controls": panelId
    });
    button.appendChild(document.createTextNode(tGroup(group.id, group.label)));
    button.appendChild(make("span", { "class": "menu-caret", "aria-hidden": "true" }));

    var panel = make("div", { id: panelId, "class": "menu-panel" });
    panel.hidden = true;
    if (group.sections) {
      panel.classList.add("is-mega");
      group.sections.forEach(function (sec) {
        var items = (sec.items || []).filter(function (item) { return item && item.href && item.label; });
        var col = make("div", { "class": "menu-col" });
        col.appendChild(make("p", { "class": "menu-col-h", text: tGroup(sec.id, sec.label) }));
        if (sec.hub) col.appendChild(renderHub(sec.hub, state));
        col.appendChild(renderList(items, state));
        panel.appendChild(col);
      });
    } else {
      var items = (group.items || []).filter(function (item) { return item && item.href && item.label; });
      if (!items.length) return;
      if (items.length > 8) panel.classList.add("is-wide");
      if (group.hub) panel.appendChild(renderHub(group.hub, state));
      panel.appendChild(renderList(items, state));
    }
    if (state.current) button.classList.add("is-here");
    wrap.appendChild(button);
    wrap.appendChild(panel);
    nav.appendChild(wrap);

    button.addEventListener("click", function (event) {
      event.stopPropagation();
      var willOpen = button.getAttribute("aria-expanded") !== "true";
      closePanels(willOpen ? panel : null);
      if (willOpen) {
        panel.hidden = false;
        button.setAttribute("aria-expanded", "true");
        placePanel(panel, button);
      }
    });
  });

  function closePanels(except) {
    nav.querySelectorAll(".menu-panel").forEach(function (panel) {
      if (panel === except) return;
      panel.hidden = true;
      panel.style.left = "";
      var btn = nav.querySelector('[aria-controls="' + panel.id + '"]');
      if (btn) btn.setAttribute("aria-expanded", "false");
    });
  }

  function setMobile(open) {
    if (!toggle) return;
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? tUi("close", "Close menu") : tUi("open", "Open menu"));
    if (!open) closePanels(null);
  }

  function closeAll() {
    closePanels(null);
    if (mobileQuery.matches) setMobile(false);
  }

  function placePanel(panel, button) {
    panel.style.left = "";
    panel.style.right = "";
    if (mobileQuery.matches) return;
    var rect = button.getBoundingClientRect();
    var width = panel.getBoundingClientRect().width;
    var left = rect.left;
    if (left + width > window.innerWidth - 12) left = window.innerWidth - width - 12;
    if (left < 8) left = 8;
    var parent = panel.offsetParent ? panel.offsetParent.getBoundingClientRect().left : 0;
    panel.style.left = Math.round(left - parent) + "px";
    panel.style.right = "auto";
  }

  nav.addEventListener("click", function (event) {
    var link = event.target.closest && event.target.closest("a");
    if (!link) return;
    closeAll();
  });

  if (toggle) {
    toggle.addEventListener("click", function (event) {
      event.stopPropagation();
      if (!mobileQuery.matches) return;
      setMobile(!nav.classList.contains("is-open"));
    });
  }

  document.addEventListener("click", function (event) {
    if (header.contains(event.target)) return;
    closeAll();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    var openBtn = nav.querySelector('.menu-btn[aria-expanded="true"]');
    var mobileOpen = nav.classList.contains("is-open");
    if (!openBtn && !mobileOpen) return;
    if (openBtn) {
      closePanels(null);
      openBtn.focus();
      return;
    }
    setMobile(false);
    if (toggle) toggle.focus();
  });

  window.addEventListener("resize", function () {
    closePanels(null);
    if (!mobileQuery.matches) {
      nav.classList.remove("is-open");
      if (toggle) {
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", tUi("open", "Open menu"));
      }
    }
  });
})();
