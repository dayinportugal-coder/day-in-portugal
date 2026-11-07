/* Booking help — rule-based, no network except the local JSON for this language.
   Lazy: the button waits for idle time; the panel and phrase list load on first open. */
(function () {
  var BUBBLE = {
    en: "Need help booking? We'll help.",
    es: "¿Necesitas ayuda para reservar? Te ayudamos.",
    fr: "Besoin d'aide pour réserver ? Nous vous aidons.",
    de: "Hilfe bei der Buchung? Wir helfen Ihnen.",
    pt: "Precisa de ajuda para reservar? Nós ajudamos."
  };

  function lang() {
    var m = (location.pathname || "/").match(/^\/(es|fr|de|pt)(?=\/|$)/);
    return m ? m[1] : "en";
  }

  function withLang(href) {
    if (!href || /^(https?:|mailto:)/i.test(href)) return href;
    var code = lang();
    if (code === "en") return href;
    if (href === "/loja.html") return "/" + code + "/loja.html";
    var trailing = href.length > 1 && href.endsWith("/");
    var path = href;
    if (path.endsWith("/index.html")) path = path.slice(0, -"/index.html".length);
    else if (path.endsWith(".html")) path = path.slice(0, -5);
    if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
    if (path === "" || path === "/") return "/" + code + "/";
    return "/" + code + path + (trailing ? "/" : "");
  }

  function norm(s) {
    return String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9+ ]/g, " ").replace(/\s+/g, " ").trim();
  }

  function sensitive(text) {
    var n = norm(text);
    if (/(?:\d[ -]?){12,}/.test(text)) return true;
    return /\b(passport|passaporte|pasaporte|passeport|reisepass|cvv|cvc|iban|nib|password|palavra passe|mot de passe|passwort|contrasena|tarjeta|carte bancaire|kreditkarte|cartao de credito|numero de cartao|social security|nif)\b/.test(n);
  }

  var code = lang();
  var data = null;
  var panelReady = false;
  var root, log, input, panel;

  function el(tag, attrs) {
    var node = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (key) {
      if (key === "text") node.textContent = attrs[key];
      else node.setAttribute(key, attrs[key]);
    });
    return node;
  }

  function addMsg(text, who, links) {
    var msg = el("div", { "class": "dip-help-msg " + who });
    msg.textContent = text;
    if (links && links.length) {
      var box = el("div", { "class": "dip-help-links" });
      links.forEach(function (link) {
        var a = el("a", { href: link.ext ? link.href : withLang(link.href), text: link.label });
        if (link.ext) {
          a.setAttribute("rel", "sponsored nofollow noopener");
          a.setAttribute("target", "_blank");
        }
        box.appendChild(a);
      });
      msg.appendChild(box);
    }
    log.appendChild(msg);
    log.scrollTop = log.scrollHeight;
  }

  function score(intent, n) {
    var padded = " " + n + " ";
    var s = 0;
    (intent.keywords || []).forEach(function (word) {
      var k = norm(word);
      if (!k) return;
      if (k.indexOf(" ") >= 0) {
        if (n.indexOf(k) >= 0) s += 2;
      } else if (padded.indexOf(" " + k + " ") >= 0) s += 1;
    });
    return s;
  }

  function reply(text, forced) {
    if (sensitive(text)) {
      addMsg(data.sensitive, "bot");
      return;
    }
    var n = norm(text);
    var best = null;
    var bestScore = 0;
    if (forced) {
      best = (data.intents || []).filter(function (item) { return item.id === forced; })[0] || null;
      bestScore = best ? 1 : 0;
    } else {
      (data.intents || []).forEach(function (intent) {
        var s = score(intent, n);
        if (s > bestScore) { bestScore = s; best = intent; }
      });
    }
    if (!best) {
      addMsg(data.fallback, "bot", data.fallbackLinks || []);
      return;
    }
    var answer = best.answer;
    if (best.price) answer = answer + " " + data.priceNote;
    addMsg(answer, "bot", best.links || []);
  }

  function ask(text, forced) {
    var shown = sensitive(text) ? "…" : text;
    addMsg(shown, "user");
    reply(text, forced);
  }

  function buildPanel() {
    if (panelReady) return;
    panelReady = true;
    panel = el("div", { "class": "dip-help-panel", role: "dialog", "aria-modal": "false", "aria-labelledby": "dip-help-title", hidden: "hidden" });
    panel.hidden = true;
    var head = el("div", { "class": "dip-help-head" });
    head.appendChild(el("strong", { id: "dip-help-title", text: data.title }));
    var x = el("button", { type: "button", "class": "dip-help-x", "aria-label": data.close, text: "×" });
    x.addEventListener("click", close);
    head.appendChild(x);
    panel.appendChild(head);
    log = el("div", { "class": "dip-help-log" });
    panel.appendChild(log);
    var quick = el("div", { "class": "dip-help-quick" });
    (data.quick || []).forEach(function (item) {
      var b = el("button", { type: "button", text: item.label });
      b.addEventListener("click", function () { ask(item.label, item.id); });
      quick.appendChild(b);
    });
    panel.appendChild(quick);
    var form = el("form", { "class": "dip-help-form" });
    input = el("input", { type: "text", maxlength: "300", "aria-label": data.placeholder, placeholder: data.placeholder, autocomplete: "off" });
    var send = el("button", { type: "submit", text: data.send });
    form.appendChild(input);
    form.appendChild(send);
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var value = input.value.trim();
      if (!value) return;
      input.value = "";
      ask(value);
    });
    panel.appendChild(form);
    panel.appendChild(el("p", { "class": "dip-help-note", text: data.note }));
    root.appendChild(panel);
    addMsg(data.intro, "bot");
    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape" || panel.hidden) return;
      event.preventDefault();
      event.stopPropagation();
      close();
    }, true);
  }

  function open() {
    ensureData(function () {
      buildPanel();
      panel.hidden = false;
      root.querySelector(".dip-help-bubble").setAttribute("aria-expanded", "true");
      if (input) input.focus();
    });
  }

  function close() {
    if (!panel) return;
    panel.hidden = true;
    var bubble = root.querySelector(".dip-help-bubble");
    bubble.setAttribute("aria-expanded", "false");
    bubble.focus();
  }

  function ensureData(done) {
    if (data) { done(); return; }
    fetch("/i18n/assistant/" + code + ".json")
      .then(function (res) { if (!res.ok) throw new Error("missing"); return res.json(); })
      .then(function (json) { data = json; done(); })
      .catch(function () {
        data = {
          title: "Booking help",
          close: "Close",
          intro: "Write to dayinportugal@gmail.com and we will point you to the right page.",
          placeholder: "Your question",
          send: "Send",
          note: "dayinportugal@gmail.com",
          sensitive: "We never ask for payment or personal documents. The only contact is dayinportugal@gmail.com.",
          priceNote: "",
          fallback: "The only contact is dayinportugal@gmail.com.",
          quick: [],
          intents: []
        };
        done();
      });
  }

  function boot() {
    if (document.getElementById("dip-help")) return;
    if (!document.getElementById("dip-help-css")) {
      var link = document.createElement("link");
      link.id = "dip-help-css";
      link.rel = "stylesheet";
      link.href = "/assistant.css";
      document.head.appendChild(link);
    }
    root = el("div", { id: "dip-help", "class": "dip-help" });
    var bubble = el("button", {
      type: "button",
      "class": "dip-help-bubble",
      "aria-expanded": "false",
      "aria-controls": "dip-help-title"
    });
    bubble.appendChild(el("span", { "class": "dip-help-mark", "aria-hidden": "true", text: "?" }));
    bubble.appendChild(el("span", { text: BUBBLE[code] || BUBBLE.en }));
    bubble.addEventListener("click", function () {
      if (panel && !panel.hidden) close();
      else open();
    });
    root.appendChild(bubble);
    document.body.appendChild(root);
  }

  var schedule = window.requestIdleCallback || function (fn) { setTimeout(fn, 300); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { schedule(boot); });
  else schedule(boot);
})();
