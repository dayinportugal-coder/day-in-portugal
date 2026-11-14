/* Netmend Sheets AI browser playground: same prompts as the Apps Script functions, batched in one call. */
(function () {
  var $ = NM.$, FREE_ROWS = 20;
  NM.init({ tool: "sheets-ai", freeLimit: 3, unit: "runs", freeText: "NETMEND_AI and NETMEND_TRANSLATE, 50 AI cells a day in your sheet; 3 test runs a day here.", proText: "All 6 functions, no daily cap, Fill selected cells, 200 rows per run here. Pay once." });
  var PH = { ai: "e.g. Reply politely to this review in one sentence", translate: "e.g. Spanish", extract: "e.g. email address", classify: "e.g. Praise, Complaint, Question", sentiment: "(nothing needed)" };
  $("fn").onchange = function () { $("arg").placeholder = PH[$("fn").value]; };
  function instr(fn, arg) {
    if (fn === "ai") return arg || "Improve this text";
    if (fn === "translate") return "Translate into " + (arg || "English") + ", keeping tone";
    if (fn === "extract") return "Extract the " + (arg || "key fact") + "; if not present, return an empty string";
    if (fn === "classify") return "Classify into exactly one of: " + (arg || "Positive, Negative") + "; return the category name only";
    return "Return one word: Positive, Neutral or Negative";
  }
  $("go").onclick = function () {
    var fn = $("fn").value;
    if (!NM.isPro() && ["extract", "classify", "sentiment"].indexOf(fn) >= 0) {
      // allow trying Pro functions in the playground, but tell the user
      NM.status("status", "Preview of a Pro function (in your sheet it needs Pro)…");
    }
    if (!NM.getKey()) return NM.status("status", NM.friendlyError("NOKEY"), "bad");
    if (!NM.canUse()) return NM.status("status", NM.limitMsg(), "bad");
    var rows = ($("rows").value || "").split(/\r?\n/).map(function (s) { return s.trim(); }).filter(Boolean);
    if (!rows.length) return NM.status("status", "Paste at least one value.", "bad");
    var max = NM.isPro() ? 200 : FREE_ROWS;
    if (rows.length > max) { rows = rows.slice(0, max); }
    var p = "You act as a spreadsheet AI function applied to each input separately. Task: " + instr(fn, ($("arg").value || "").trim()) +
      ".\nAnswers must be concise, plain text, no markdown, no preamble.\nReturn JSON only: {\"results\":[\"answer for input 1\", ...]} with exactly " + rows.length + " items, same order.\n\nINPUTS:\n" +
      rows.map(function (r, i) { return (i + 1) + ". " + r; }).join("\n");
    $("go").disabled = true; NM.status("status", "Running " + rows.length + " rows…");
    NM.gemini({ prompt: p, json: true, temperature: 0.3 }).then(function (d) {
      var res = (d && d.results) || [];
      NM.consume();
      var h = '<div class="scroll"><table><tr><th>#</th><th>A (input)</th><th>B: =NETMEND_' + fn.toUpperCase() + '(A)</th></tr>';
      rows.forEach(function (r, i) { h += "<tr><td>" + (i + 2) + "</td><td>" + NM.esc(r) + "</td><td>" + NM.esc(res[i] == null ? "" : res[i]) + "</td></tr>"; });
      h += '</table></div><p class="nm-actions"><button class="btn ghost" type="button" id="cp">Copy column B</button></p>';
      $("out").innerHTML = h;
      $("cp").onclick = function () { NM.copy(rows.map(function (_, i) { return String(res[i] == null ? "" : res[i]).replace(/\s+/g, " "); }).join("\n"), this); };
      NM.status("status", "Done. In your sheet this is one formula dragged down.", "ok");
    }).catch(function (e) { NM.status("status", NM.esc(NM.friendlyError(e)), "bad"); }).then(function () { $("go").disabled = false; });
  };
  $("copycode").onclick = function () {
    var b = this;
    fetch("Netmend.gs").then(function (r) { return r.text(); }).then(function (t) { NM.copy(t, b); });
  };
})();
