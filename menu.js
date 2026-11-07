/* Day in Portugal — site menu.
   This file is the only menu definition. To add a guide, add one
   { href, label } object to the right group. An empty group is not shown.
   Lisbon lists the Lisbon guides. */
(function () {
  var MENU = [
    {
      id: "porto",
      label: "Porto",
      items: [
        { href: "/porto-3-days", label: "3 days in Porto" },
        { href: "/book", label: "Book in Porto" },
        { href: "/book-first", label: "Book before you fly" },
        { href: "/stay", label: "Where to sleep" },
        { href: "/bring", label: "What to bring home" },
        { href: "/douro-day", label: "Douro day from Porto" },
        { href: "/gaia-port-cellars", label: "Port cellars in Gaia" },
        { href: "/fado-in-porto", label: "Fado in Porto" },
        { href: "/porto-river-cruise", label: "Six bridges cruise" },
        { href: "/porto-food-tours", label: "Food and wine tours" },
        { href: "/livraria-lello-tickets", label: "Livraria Lello" },
        { href: "/porto-airport-transfer", label: "Airport transfer" },
        { href: "/rent-car", label: "Car or metro" }
      ]
    },
    {
      id: "cidades",
      label: "Day trips",
      items: [
        { href: "/porto-day-trips", label: "Day trips from Porto" },
        { href: "/douro-day", label: "Douro Valley" },
        { href: "/aveiro-day-trip", label: "Aveiro and Costa Nova" },
        { href: "/braga-guimaraes-day-trip", label: "Braga and Guimarães" },
        { href: "/povoa-base", label: "Póvoa de Varzim and Vila do Conde" }
      ]
    },
    {
      id: "vistos",
      label: "Visas and moving",
      items: [
        { href: "/portugal-d7-visa", label: "Portugal D7 visa" },
        { href: "/portugal-d8-digital-nomad-visa", label: "Portugal D8 digital nomad visa" }
      ]
    },
    {
      id: "lisboa",
      label: "Lisbon",
      items: [
        { href: "/lisbon-3-days", label: "3 days in Lisbon" },
        { href: "/sintra-day-trip", label: "Sintra day trip" },
        { href: "/cascais-day-trip", label: "Cascais day trip" },
        { href: "/evora-day-trip", label: "Évora day trip" },
        { href: "/lisbon-where-to-stay", label: "Where to stay in Lisbon" },
        { href: "/lisbon-book-first", label: "Book before Lisbon" },
        { href: "/lisbon-airport-transfer", label: "Lisbon airport transfer" }
      ]
    },
    {
      id: "loja",
      label: "Shop",
      items: [
        { href: "/loja.html", label: "Gifts from Portugal" }
      ]
    },
    {
      id: "servicos",
      label: "Services",
      items: [
        { href: "/demos/", label: "Demos" },
        { href: "/demos/31-de-janeiro/", label: "Demo: 31 de Janeiro restaurant" },
        { href: "/demos/o-poboa/", label: "Demo: Ó Poboa Guesthouse" },
        { href: "/demos/autor-guesthouse/", label: "Demo: Autor Guesthouse" },
        { href: "/demos/restaurante-exemplo/", label: "Demo: sample restaurant" },
        { href: "/demos/al-exemplo/", label: "Demo: sample guesthouse" },
        { href: "/demos/clinica-exemplo/", label: "Demo: sample clinic" },
        { href: "/demos/imobiliaria-exemplo/", label: "Demo: sample estate agency" },
        { href: "/privacidade-servicos", label: "Privacy (services)" }
      ]
    },
    {
      id: "site",
      label: "Site",
      items: [
        { href: "/", label: "Home" },
        { href: "/privacy", label: "Privacy" },
        { href: "/disclosure", label: "How we earn" },
        { href: "/credits", label: "Photo credits" }
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

  MENU.forEach(function (group) {
    var items = (group.items || []).filter(function (item) { return item && item.href && item.label; });
    if (!items.length) return;

    var wrap = make("div", { "class": "menu-group" });
    var panelId = "menu-" + group.id;
    var button = make("button", {
      type: "button",
      "class": "menu-btn",
      "aria-expanded": "false",
      "aria-controls": panelId
    });
    button.appendChild(document.createTextNode(tGroup(group.id, group.label)));
    var caret = make("span", { "class": "menu-caret", "aria-hidden": "true" });
    button.appendChild(caret);

    var panel = make("div", { id: panelId, "class": "menu-panel" });
    panel.hidden = true;
    if (items.length > 8) panel.classList.add("is-wide");
    var list = make("ul");
    var groupHasCurrent = false;
    items.forEach(function (item) {
      var li = make("li");
      var link = make("a", { href: localizeHref(item.href), text: tItem(item.href, item.label) });
      if (barePath(item.href) === here) {
        link.setAttribute("aria-current", "page");
        groupHasCurrent = true;
      }
      li.appendChild(link);
      list.appendChild(li);
    });
    if (groupHasCurrent) button.classList.add("is-here");
    panel.appendChild(list);
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
