/* Netmend Formula: description -> spreadsheet formula, explain, fix. Runs in the browser with the user's Gemini key. */
(function () {
  var $ = NM.$, tab = "write", HIST = "netmend-formula-history";
  var SMART = ["gemini-3.5-flash", "gemini-flash-latest", "gemini-2.5-flash", "gemini-3.5-flash-lite", "gemini-flash-lite-latest"];
  NM.init({ tool: "formula", freeLimit: 5, unit: "formulas", freeText: "5 formulas, explanations or fixes a day. English function names, comma or semicolon separators.", proText: "No daily limit, localized function names (PT, ES, FR, DE, IT, NL), VBA, Apps Script, regex and SQL, saved history. Pay once.", onLicense: paintHist });
  document.querySelectorAll(".nm-tabs button").forEach(function (b) {
    b.onclick = function () {
      tab = b.getAttribute("data-tab");
      document.querySelectorAll(".nm-tabs button").forEach(function (x) { x.classList.toggle("on", x === b); });
      document.querySelectorAll(".nm-pane").forEach(function (p) { p.hidden = p.getAttribute("data-pane") !== tab; });
      $("go").textContent = tab === "write" ? "Get the formula" : tab === "explain" ? "Explain it" : "Fix it";
    };
  });
  document.querySelectorAll("[data-ex]").forEach(function (b) { b.onclick = function () { $("ask").value = b.getAttribute("data-ex"); }; });
  function hist() { try { return JSON.parse(localStorage.getItem(HIST) || "[]"); } catch (e) { return []; } }
  function paintHist() {
    var h = hist();
    $("hist-wrap").hidden = !(NM.isPro() && h.length);
    $("hist").innerHTML = h.slice(0, 50).map(function (it, i) {
      return '<div class="card" style="margin-top:8px"><p class="note">' + NM.esc(it.q) + '</p><pre><code>' + NM.esc(it.f) + '</code></pre><button class="btn ghost" type="button" data-h="' + i + '">Copy</button></div>';
    }).join("");
    document.querySelectorAll("[data-h]").forEach(function (b) { b.onclick = function () { NM.copy(hist()[+b.getAttribute("data-h")].f, b); }; });
  }
  paintHist();
  $("go").onclick = function () {
    if (!NM.getKey()) return NM.status("status", NM.friendlyError("NOKEY"), "bad");
    if (!NM.canUse()) return NM.status("status", NM.limitMsg(), "bad");
    var kind = $("kind").value, fnlang = $("fnlang").value;
    if (!NM.isPro() && kind !== "formula") return NM.status("status", "VBA, Apps Script, regex and SQL are part of Pro. Choose \"Formula\" or unlock Pro below.", "bad");
    if (!NM.isPro() && fnlang !== "English") return NM.status("status", "Localized function names are part of Pro. Free answers use English names; your separator choice still applies.", "bad");
    var app = $("appsel").value, sep = $("sep").value, cols = ($("cols").value || "").trim();
    var input, task;
    if (tab === "write") { input = ($("ask").value || "").trim(); task = "Write the " + (kind === "formula" ? "formula" : kind) + " that does this: " + input; }
    else if (tab === "explain") { input = ($("fx-explain").value || "").trim(); task = "Explain this formula clearly, step by step, for a non-expert: " + input; }
    else { input = ($("fx-fix").value || "").trim(); task = "This formula does not work" + (($("fx-err").value || "").trim() ? " (problem: " + $("fx-err").value.trim() + ")" : "") + ". Find the cause and return a corrected version: " + input; }
    if (!input) return NM.status("status", "Type something first.", "bad");
    var kindName = { formula: "spreadsheet formula", vba: "Excel VBA macro", appsscript: "Google Apps Script function", regex: "regular expression", sql: "SQL query" }[kind];
    var sys = "You are a senior spreadsheet expert. Target app: " + app + ". " +
      (kind === "formula" ? "Write formulas that work in that app and version (no XLOOKUP/LET/FILTER for Excel 2016/2019). Use \"" + sep + "\" as the argument separator" + (sep === ";" ? " and a comma as decimal separator in numbers" : "") + ". Use " + fnlang + " function names exactly as the localized app shows them. Start formulas with =." : "Output a " + kindName + ".") +
      " The user may write in any language: answer the explanation in the same language as the user's text. Never invent sheet or column names when the user gave them; when they did not, assume sensible ones and say which." +
      " Return JSON only: {\"formula\":\"the final formula or code\",\"explanation\":[\"short step\",...],\"example\":\"one-line worked example with sample values\",\"alternatives\":[{\"formula\":\"...\",\"when\":\"when to use it\"}],\"cause\":\"for fixes only: the cause in one sentence, else empty\"}";
    var prompt = task + (cols ? "\nColumns / layout: " + cols : "");
    $("go").disabled = true; NM.status("status", "Thinking…");
    NM.gemini({ prompt: prompt, system: sys, json: true, temperature: 0.1, models: SMART }).then(function (d) {
      NM.consume();
      var f = String(d.formula || "").trim();
      var h = '<div class="card" style="margin-top:12px">' + (d.cause ? '<p><b>Cause:</b> ' + NM.esc(d.cause) + '</p>' : '') +
        '<label>' + (tab === "explain" ? "Formula" : "Your " + NM.esc(kindName)) + '</label><pre><code id="fx-out">' + NM.esc(f) + '</code></pre>' +
        '<p class="nm-actions"><button class="btn" type="button" id="cp">Copy</button></p>' +
        '<h3>How it works</h3><ol>' + (d.explanation || []).map(function (s) { return "<li>" + NM.esc(s) + "</li>"; }).join("") + "</ol>" +
        (d.example ? '<p class="note"><b>Example:</b> ' + NM.esc(d.example) + "</p>" : "") +
        ((d.alternatives || []).length ? "<h3>Alternatives</h3>" + d.alternatives.map(function (a) { return "<pre><code>" + NM.esc(a.formula) + '</code></pre><p class="note">' + NM.esc(a.when) + "</p>"; }).join("") : "") +
        '<p class="note">Test on a few rows first. Made with Netmend Formula.</p></div>';
      $("out").innerHTML = h; $("out").hidden = false;
      $("cp").onclick = function () { NM.copy(f, this); };
      if (NM.isPro() && f) { var hs = hist(); hs.unshift({ q: input.slice(0, 160), f: f }); localStorage.setItem(HIST, JSON.stringify(hs.slice(0, 50))); paintHist(); }
      NM.status("status", "Done.", "ok");
    }).catch(function (e) { NM.status("status", NM.esc(NM.friendlyError(e)), "bad"); }).then(function () { $("go").disabled = false; });
  };
})();
