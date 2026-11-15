/* Netmend Slides: source -> Gemini outline JSON -> preview -> .pptx (pptxgenjs). Runs in the browser. */
(function () {
  var $ = NM.$, FREE_MAX = 8, PRO_MAX = 30;
  var THEMES = {
    midnight: { bg: "0B0D12", title: "FFFFFF", text: "D6D9E0", accent: "FF5A36", soft: "1A1D26" },
    paper:    { bg: "FAF8F3", title: "1C1C1C", text: "3A3A3A", accent: "C2410C", soft: "EFEBE0" },
    ocean:    { bg: "0E2A3B", title: "FFFFFF", text: "CFE7F0", accent: "6FD3E0", soft: "16384D" },
    coral:    { bg: "FFFFFF", title: "111827", text: "374151", accent: "FF5A36", soft: "FFE8E1" },
    forest:   { bg: "F3F7F2", title: "14301F", text: "2F4A3A", accent: "2F855A", soft: "DDEBDD" }
  };
  var tab = "topic", deck = null;
  NM.init({ tool: "slides", freeLimit: 3, unit: "decks", freeText: "3 decks a day, up to 8 slides, small Netmend credit line.", proText: "Unlimited decks, up to 30 slides, no branding, custom accent colour. Pay once.", onLicense: paintPro });

  document.querySelectorAll(".nm-tabs button").forEach(function (b) {
    b.onclick = function () {
      tab = b.getAttribute("data-tab");
      document.querySelectorAll(".nm-tabs button").forEach(function (x) { x.classList.toggle("on", x === b); });
      document.querySelectorAll(".nm-pane").forEach(function (p) { p.hidden = p.getAttribute("data-pane") !== tab; });
    };
  });
  var accentWrap = document.createElement("div");
  accentWrap.innerHTML = '<label for="accent">Accent colour (Pro)</label><input id="accent" type="color" value="#ff5a36">';
  $("theme").parentNode.parentNode.appendChild(accentWrap);
  function paintPro() {
    $("accent").disabled = !NM.isPro();
    Array.prototype.forEach.call($("count").options, function (o) { o.disabled = !NM.isPro() && Number(o.value) > FREE_MAX; o.textContent = o.value + (!NM.isPro() && Number(o.value) > FREE_MAX ? " (Pro)" : ""); });
    if (!NM.isPro() && Number($("count").value) > FREE_MAX) $("count").value = String(FREE_MAX);
  }
  paintPro();

  function prompt(n, lang, extra, sourceDesc) {
    return [
      "You are an expert presentation designer. Build a slide deck of exactly " + n + " slides (not counting the title slide) from the SOURCE.",
      "Write every word in " + lang + ". Only use facts that are in the source; for a bare topic, use widely known, non-controversial facts and no invented statistics.",
      "Mix layouts so the deck is not monotonous. Allowed layouts:",
      '- "bullets": title + 3 to 5 short bullets (max 12 words each)',
      '- "two-column": title + leftTitle + left (2-4 bullets) + rightTitle + right (2-4 bullets), for comparisons/before-after',
      '- "stat": title + stat (a short number or figure from the source) + statLabel (one line) + bullets (0-2)',
      '- "quote": quote (one strong sentence from or faithful to the source) + attribution',
      '- "section": title + subtitle, a divider between parts (use at most 2)',
      "The last slide should be a clear summary or next steps slide. Each slide gets speaker notes (2-3 sentences).",
      extra ? "Audience / extra instructions: " + extra : "",
      "Return JSON only: {\"title\":\"deck title\",\"subtitle\":\"one line\",\"slides\":[{\"layout\":\"bullets\",\"title\":\"\",\"bullets\":[],\"leftTitle\":\"\",\"left\":[],\"rightTitle\":\"\",\"right\":[],\"stat\":\"\",\"statLabel\":\"\",\"quote\":\"\",\"attribution\":\"\",\"subtitle\":\"\",\"notes\":\"\"}]}",
      "",
      "SOURCE: " + sourceDesc
    ].join("\n");
  }

  function sourceParts(cb) {
    var n = Number($("count").value), lang = $("lang").value, extra = ($("extra").value || "").trim();
    if (tab === "topic") {
      var t = ($("topic").value || "").trim(); if (!t) return cb("Type a topic first.");
      return cb(null, { parts: [{ text: prompt(n, lang, extra, "a topic: " + t) }] });
    }
    if (tab === "text") {
      var s = ($("srctext").value || "").trim(); if (s.length < 40) return cb("Paste at least a few sentences of text.");
      return cb(null, { parts: [{ text: prompt(n, lang, extra, "the text below.\n\n" + s.slice(0, 200000)) }] });
    }
    if (tab === "pdf") {
      var f = $("pdf").files[0]; if (!f) return cb("Choose a PDF file first.");
      if (f.size > 19 * 1024 * 1024) return cb("That PDF is over 19 MB. Split it or compress it first.");
      return NM.fileToPart(f).then(function (p) { p.inlineData.mimeType = "application/pdf"; cb(null, { parts: [p, { text: prompt(n, lang, extra, "the attached PDF document.") }] }); }, function (e) { cb(e.message); });
    }
    var u = ($("url").value || "").trim(); if (!/^https?:\/\//i.test(u)) return cb("Paste a full URL starting with https://");
    cb(null, { parts: [{ text: prompt(n, lang, extra, "the public web page at " + u + " (read it with the URL tool).") }], tools: [{ url_context: {} }] });
  }

  function arr(a) { return Array.isArray(a) ? a.filter(Boolean).map(String) : []; }
  function render() {
    var th = theme(), h = '<div class="nm-slides">';
    var all = [{ layout: "title", title: deck.title, subtitle: deck.subtitle }].concat(deck.slides);
    all.forEach(function (s, i) {
      h += '<div class="nm-slide" style="background:#' + th.bg + ';color:#' + th.text + '"><h4 style="color:#' + (s.layout === "title" || s.layout === "section" ? th.accent : th.title) + '">' + NM.esc(s.title || (s.quote ? "“" + s.quote + "”" : "")) + "</h4>";
      if (s.subtitle) h += "<p>" + NM.esc(s.subtitle) + "</p>";
      if (s.layout === "stat") h += '<p style="font-size:26px;font-weight:800;color:#' + th.accent + ';margin:4px 0">' + NM.esc(s.stat) + "</p><p>" + NM.esc(s.statLabel) + "</p>";
      if (s.layout === "two-column") h += "<b>" + NM.esc(s.leftTitle) + "</b><ul>" + arr(s.left).map(function (b) { return "<li>" + NM.esc(b) + "</li>"; }).join("") + "</ul><b>" + NM.esc(s.rightTitle) + "</b><ul>" + arr(s.right).map(function (b) { return "<li>" + NM.esc(b) + "</li>"; }).join("") + "</ul>";
      else if (arr(s.bullets).length) h += "<ul>" + arr(s.bullets).map(function (b) { return "<li>" + NM.esc(b) + "</li>"; }).join("") + "</ul>";
      if (s.layout === "quote" && s.title) h += "<p>“" + NM.esc(s.quote) + "”</p>";
      if (s.attribution) h += "<p>— " + NM.esc(s.attribution) + "</p>";
      h += '<span class="n">' + (i + 1) + "</span></div>";
    });
    h += "</div>";
    h += '<div class="nm-actions"><button class="btn" type="button" id="dl">Download .pptx</button><button class="btn ghost" type="button" id="md">Copy outline (Markdown)</button></div>';
    $("out").innerHTML = h;
    $("dl").onclick = function () { buildPptx().catch(function (e) { NM.status("status", NM.esc(e.message), "bad"); }); };
    $("md").onclick = function () { NM.copy(toMarkdown(), this); };
  }
  function theme() {
    var t = JSON.parse(JSON.stringify(THEMES[$("theme").value] || THEMES.midnight));
    if (NM.isPro() && $("accent").value) t.accent = $("accent").value.replace("#", "").toUpperCase();
    return t;
  }
  function toMarkdown() {
    var o = "# " + deck.title + "\n" + (deck.subtitle ? "_" + deck.subtitle + "_\n" : "");
    deck.slides.forEach(function (s, i) {
      o += "\n## " + (i + 1) + ". " + (s.title || s.quote || "") + "\n";
      if (s.stat) o += "**" + s.stat + "** " + (s.statLabel || "") + "\n";
      arr(s.bullets).concat(arr(s.left), arr(s.right)).forEach(function (b) { o += "- " + b + "\n"; });
      if (s.quote && s.title) o += "> " + s.quote + "\n";
      if (s.notes) o += "\nNotes: " + s.notes + "\n";
    });
    return o;
  }

  function buildPptx() {
    var th = theme(), pro = NM.isPro();
    var p = new PptxGenJS(); p.layout = "LAYOUT_WIDE"; p.title = deck.title; p.company = "Netmend Slides";
    var F = "Calibri", W = 13.33;
    function base() {
      var s = p.addSlide(); s.background = { color: th.bg };
      if (!pro) s.addText("Made with Netmend Slides · netmend.app/slides", { x: 0.5, y: 7.05, w: 9, h: 0.3, fontSize: 9, color: th.text, transparency: 40, fontFace: F });
      return s;
    }
    function bullets(s, items, x, y, w, h, size) {
      if (!items.length) return;
      s.addText(items.map(function (b) { return { text: b, options: { bullet: { code: "25A0" }, paraSpaceAfter: 10 } }; }), { x: x, y: y, w: w, h: h, fontSize: size || 24, color: th.text, fontFace: F, valign: "top" });
    }
    var t = base();
    t.addShape(p.ShapeType.rect, { x: 0, y: 0, w: 0.25, h: 7.5, fill: { color: th.accent } });
    t.addText(deck.title || "Untitled", { x: 0.9, y: 2.2, w: 11.5, h: 1.8, fontSize: 44, bold: true, color: th.title, fontFace: F, valign: "bottom" });
    if (deck.subtitle) t.addText(deck.subtitle, { x: 0.9, y: 4.1, w: 11.5, h: 0.9, fontSize: 22, color: th.text, fontFace: F, valign: "top" });
    deck.slides.forEach(function (sl, i) {
      var s = base(), L = sl.layout;
      if (L === "section") {
        s.background = { color: th.soft };
        s.addText(sl.title || "", { x: 0.9, y: 2.6, w: 11.5, h: 1.3, fontSize: 40, bold: true, color: th.accent, fontFace: F });
        if (sl.subtitle) s.addText(sl.subtitle, { x: 0.9, y: 3.9, w: 11.5, h: 0.8, fontSize: 22, color: th.text, fontFace: F });
      } else if (L === "quote") {
        s.addText("“", { x: 0.7, y: 0.6, w: 2, h: 2, fontSize: 120, color: th.accent, fontFace: "Georgia" });
        s.addText(sl.quote || sl.title || "", { x: 1.4, y: 1.8, w: 10.5, h: 3.2, fontSize: 32, italic: true, color: th.title, fontFace: "Georgia", valign: "middle" });
        if (sl.attribution) s.addText("— " + sl.attribution, { x: 1.4, y: 5.2, w: 10.5, h: 0.6, fontSize: 18, color: th.text, fontFace: F });
      } else {
        s.addText(sl.title || "", { x: 0.6, y: 0.4, w: W - 1.2, h: 1.0, fontSize: 32, bold: true, color: th.title, fontFace: F, valign: "middle" });
        s.addShape(p.ShapeType.rect, { x: 0.6, y: 1.45, w: 1.2, h: 0.08, fill: { color: th.accent } });
        if (L === "two-column") {
          [["leftTitle", "left", 0.6], ["rightTitle", "right", 6.9]].forEach(function (c) {
            s.addShape(p.ShapeType.roundRect, { x: c[2], y: 1.9, w: 5.8, h: 4.9, fill: { color: th.soft }, rectRadius: 0.12 });
            s.addText(sl[c[0]] || "", { x: c[2] + 0.3, y: 2.05, w: 5.2, h: 0.6, fontSize: 22, bold: true, color: th.accent, fontFace: F });
            bullets(s, arr(sl[c[1]]), c[2] + 0.3, 2.75, 5.2, 3.9, 20);
          });
        } else if (L === "stat") {
          s.addText(sl.stat || "", { x: 0.6, y: 2.0, w: 6, h: 2.2, fontSize: 80, bold: true, color: th.accent, fontFace: F, valign: "middle" });
          s.addText(sl.statLabel || "", { x: 0.6, y: 4.2, w: 6, h: 1.2, fontSize: 22, color: th.text, fontFace: F, valign: "top" });
          bullets(s, arr(sl.bullets), 7.0, 2.2, 5.7, 4.2, 20);
        } else bullets(s, arr(sl.bullets), 0.6, 1.9, W - 1.2, 5.0, 24);
      }
      s.addText(String(i + 2), { x: W - 1.0, y: 7.0, w: 0.5, h: 0.35, fontSize: 10, color: th.text, align: "right", fontFace: F });
      if (sl.notes) s.addNotes(sl.notes);
    });
    if (!pro) {
      var e = base();
      e.addText("Made with Netmend Slides", { x: 0.9, y: 2.8, w: 11.5, h: 1, fontSize: 32, bold: true, color: th.title, fontFace: F });
      e.addText("Free AI decks from any PDF, text or link · netmend.app/slides", { x: 0.9, y: 3.8, w: 11.5, h: 0.7, fontSize: 18, color: th.text, fontFace: F });
    }
    return p.writeFile({ fileName: NM.slug(deck.title) + ".pptx" });
  }

  $("go").onclick = function () {
    if (!NM.getKey()) return NM.status("status", NM.friendlyError("NOKEY"), "bad");
    if (!NM.canUse()) return NM.status("status", NM.limitMsg(), "bad");
    NM.status("status", "Preparing your source…");
    sourceParts(function (err, req) {
      if (err) return NM.status("status", NM.esc(err), "bad");
      $("go").disabled = true; NM.status("status", "Reading your source and writing the deck… (10–40 s)");
      req.json = true; req.temperature = 0.6;
      req.onModel = function (m) { NM.status("status", "Writing the deck with " + m + "…"); };
      NM.gemini(req).then(function (d) {
        if (!d || !Array.isArray(d.slides) || !d.slides.length) throw new Error("No slides came back. Try again or give a longer source.");
        var max = NM.isPro() ? PRO_MAX : FREE_MAX;
        d.slides = d.slides.slice(0, Math.min(max, Number($("count").value)));
        deck = d; NM.consume(); render();
        NM.status("status", "Done: " + (d.slides.length + 1) + " slides. Check the facts, then download.", "ok");
      }).catch(function (e) { NM.status("status", NM.esc(NM.friendlyError(e)), "bad"); })
        .then(function () { $("go").disabled = false; });
    });
  };
  $("theme").onchange = function () { if (deck) render(); };
  window.__nmSlides = { getDeck: function () { return deck; }, buildPptx: function () { return buildPptx(); } };
})();
