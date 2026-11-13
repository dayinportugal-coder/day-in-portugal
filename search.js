/* Day in Portugal: site search. Static index (/search-index.json, built by
   tools/site_ia.py), loaded on first use. No framework, no tracking. */
(function () {
  var LANG = (location.pathname.match(/^\/(es|fr|de|pt)(?=\/|$)/) || [])[1] || "en";
  var UI = {
    en: ["Search the guide", "Search: Douro day trip, D7 visa, airport…", "Close", "No guide matches yet. Try ‘Douro’, ‘visa’ or ‘airport’.", "in English"],
    es: ["Buscar en la guía", "Busca: excursión al Douro, visado D7, aeropuerto…", "Cerrar", "Ninguna guía coincide. Prueba ‘Douro’, ‘visado’ o ‘aeropuerto’.", "en inglés"],
    fr: ["Rechercher dans le guide", "Rechercher : vallée du Douro, visa D7, aéroport…", "Fermer", "Aucun guide ne correspond. Essayez « Douro », « visa » ou « aéroport ».", "en anglais"],
    de: ["Im Guide suchen", "Suchen: Douro-Tagesausflug, D7-Visum, Flughafen…", "Schließen", "Kein Guide passt. Versuchen Sie „Douro“, „Visum“ oder „Flughafen“.", "auf Englisch"],
    pt: ["Pesquisar no guia", "Pesquisar: Douro, visto D7, aeroporto…", "Fechar", "Nenhum guia corresponde. Experimente ‘Douro’, ‘visto’ ou ‘aeroporto’.", "em inglês"]
  }[LANG];
  var index = null, loading = null, dlg, input, list, lastFocus;

  function norm(s) { return (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }
  function load() {
    if (index) return Promise.resolve(index);
    if (!loading) loading = fetch("/search-index.json").then(function (r) { return r.json(); }).then(function (rows) {
      var mine = {}, out = [];
      rows.forEach(function (r) { if (r.l === LANG) { mine[r.u.replace(/^\/(es|fr|de|pt)/, "") || "/"] = 1; out.push(r); } });
      if (LANG !== "en") rows.forEach(function (r) { if (r.l === "en" && !mine[r.u]) { r.en = 1; out.push(r); } });
      out.forEach(function (r) { r.k = norm(r.t + " " + r.d + " " + r.u.replace(/[-/]/g, " ")); r.kt = norm(r.t); });
      index = out; return out;
    });
    return loading;
  }
  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text) n.textContent = text; return n; }

  function render(q) {
    list.textContent = "";
    var words = norm(q).split(/\s+/).filter(Boolean);
    if (!words.length || !index) return;
    var hits = index.map(function (r) {
      var score = 0;
      for (var i = 0; i < words.length; i++) {
        if (r.k.indexOf(words[i]) < 0) return null;
        score += r.kt.indexOf(words[i]) >= 0 ? 3 : 1;
      }
      if (r.en) score -= 0.5;
      return { r: r, s: score };
    }).filter(Boolean).sort(function (a, b) { return b.s - a.s; }).slice(0, 8);
    if (!hits.length) { list.appendChild(el("li", "ia-s-empty", UI[3])); return; }
    hits.forEach(function (h) {
      var li = el("li"), a = el("a");
      a.href = h.r.u;
      a.appendChild(el("strong", "", h.r.t));
      if (h.r.en) a.appendChild(el("span", "ia-badge", UI[4]));
      a.appendChild(el("span", "ia-s-desc", h.r.d));
      li.appendChild(a); list.appendChild(li);
    });
  }

  function build() {
    dlg = el("div", "ia-search"); dlg.hidden = true;
    dlg.setAttribute("role", "dialog"); dlg.setAttribute("aria-modal", "true"); dlg.setAttribute("aria-label", UI[0]);
    var box = el("div", "ia-search-box");
    var row = el("div", "ia-search-row");
    input = el("input"); input.type = "search"; input.placeholder = UI[1]; input.setAttribute("aria-label", UI[0]); input.autocomplete = "off";
    var close = el("button", "ia-search-close", "×"); close.type = "button"; close.setAttribute("aria-label", UI[2]);
    row.appendChild(input); row.appendChild(close);
    list = el("ul", "ia-search-results");
    box.appendChild(row); box.appendChild(list); dlg.appendChild(box);
    document.body.appendChild(dlg);
    input.addEventListener("input", function () { load().then(function () { render(input.value); }); });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { var first = list.querySelector("a"); if (first) location.href = first.href; }
    });
    close.addEventListener("click", hide);
    dlg.addEventListener("click", function (e) { if (e.target === dlg) hide(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !dlg.hidden) hide(); });
  }
  function show(q) {
    if (!dlg) build();
    lastFocus = document.activeElement;
    dlg.hidden = false; document.documentElement.classList.add("ia-noscroll");
    input.value = q || ""; input.focus();
    load().then(function () { render(input.value); });
  }
  function hide() { dlg.hidden = true; document.documentElement.classList.remove("ia-noscroll"); if (lastFocus && lastFocus.focus) lastFocus.focus(); }

  var inner = document.querySelector("header.top .top-inner");
  if (inner) {
    var btn = el("button", "top-search"); btn.type = "button"; btn.setAttribute("aria-label", UI[0]);
    btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M15.5 15.5 21 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
    var toggle = inner.querySelector(".menu-toggle");
    inner.insertBefore(btn, toggle || null);
    btn.addEventListener("click", function () { show(""); });
    btn.addEventListener("mouseenter", load, { once: true });
  }
  document.querySelectorAll("form[data-ia-search]").forEach(function (f) {
    f.addEventListener("submit", function (e) { e.preventDefault(); show(f.querySelector("input[type=search]").value); });
  });
})();
