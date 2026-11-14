/* Netmend Statement → Excel. Heuristic parse is 100% local (pdf.js). Optional AI mode uses the user's Gemini key only. */
(function () {
  var $ = NM.$;
  pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js";

  var P = NMStatement;
  var state = { files: [], results: [], busy: false };

  NM.init({
    tool: "statement",
    freeLimit: 1,
    unit: "statements",
    freeText: "One statement a day, first page only, CSV or Excel export. Parsing stays in your browser.",
    proText: "Unlimited pages, batch files, and optional AI mode for messy layouts. Pay once.",
    onLicense: paintLimits
  });

  function paintLimits() {
    var ai = $("ai-mode");
    if (ai) {
      ai.disabled = !NM.isPro();
      if (!NM.isPro()) ai.checked = false;
    }
    var hint = $("ai-hint");
    if (hint) hint.hidden = NM.isPro();
    var file = $("file");
    if (file) file.multiple = NM.isPro();
    NM.paintRemain();
  }
  paintLimits();

  function setStatus(msg, kind) { NM.status("status", msg ? NM.esc(msg) : "", kind || ""); }

  function rowsToText(rows) {
    return rows.map(function (r) { return r.cells.join(" | "); }).join("\n");
  }

  function aiTransactions(text, fmt) {
    var system = "You extract bank-statement transactions from text taken from a PDF. Reply with JSON only: {\"transactions\":[{\"date\":\"\",\"description\":\"\",\"debit\":null,\"credit\":null,\"amount\":0,\"balance\":null}],\"currency\":\"\"}. Use period decimals. debit and credit are positive numbers or null. amount is signed (negative for money out). Ignore headers, footers, IBANs, page numbers and opening/closing labels unless they sit on a real transaction row. Do not invent rows. Keep the statement's date format. Reply in the same language as the descriptions.";
    return NM.gemini({ json: true, temperature: 0, system: system, prompt: "Number format hint: " + fmt + ".\n\nStatement text:\n" + text.slice(0, 24000) })
      .then(function (data) {
        var list = (data && data.transactions) || data || [];
        if (!Array.isArray(list)) list = [];
        return list.map(function (t) {
          return {
            date: t.date || "",
            description: (t.description || "").replace(/\s+/g, " ").trim(),
            debit: t.debit == null || t.debit === "" ? null : Number(t.debit),
            credit: t.credit == null || t.credit === "" ? null : Number(t.credit),
            amount: t.amount == null || t.amount === "" ? null : Number(t.amount),
            balance: t.balance == null || t.balance === "" ? null : Number(t.balance),
            page: t.page || null
          };
        }).filter(function (t) { return t.date || t.description; });
      });
  }

  async function parseFile(file, opts) {
    var buf = await file.arrayBuffer();
    var extracted = await P.extractRows(pdfjsLib, buf, { maxPages: opts.maxPages });
    var fmt = $("fmt").value;
    var tx = P.toTransactions(extracted.rows, fmt);
    var usedAi = false;
    if (opts.ai) {
      var text = rowsToText(extracted.rows);
      var aiTx = await aiTransactions(text, fmt);
      if (aiTx.length) { tx = aiTx; usedAi = true; }
    }
    tx.forEach(function (t) { t.file = file.name; });
    return {
      file: file.name,
      tx: tx,
      rows: extracted.rows,
      numPages: extracted.numPages,
      readPages: extracted.readPages,
      usedAi: usedAi,
      truncated: extracted.readPages < extracted.numPages
    };
  }

  function allTx() {
    var out = [];
    state.results.forEach(function (r) { out = out.concat(r.tx); });
    return out;
  }

  function render() {
    var tx = allTx();
    var box = $("out");
    var table = $("preview");
    var stats = $("stats");
    if (!state.results.length) { box.hidden = true; return; }
    box.hidden = false;
    var notes = state.results.map(function (r) {
      var s = r.file + ": " + r.tx.length + " transaction" + (r.tx.length === 1 ? "" : "s") + " from " + r.readPages + " of " + r.numPages + " page" + (r.numPages === 1 ? "" : "s");
      if (r.truncated) s += " (free plan reads the first page only)";
      if (r.usedAi) s += " · AI mode";
      return s;
    });
    stats.textContent = notes.join(" · ") + ". In heuristic mode the file never left this browser.";
    var data = P.tableFrom(tx, { withFile: state.results.length > 1, withPage: true, dec: $("sep").value === ";" ? "," : "." });
    table.innerHTML = "";
    data.slice(0, 301).forEach(function (row, i) {
      var tr = document.createElement("tr");
      row.forEach(function (v) {
        var c = document.createElement(i ? "td" : "th");
        c.textContent = v;
        if (i && /^-?\d/.test(String(v)) && /[.,]\d{2}$/.test(String(v))) c.style.textAlign = "right";
        tr.appendChild(c);
      });
      table.appendChild(tr);
    });
    if (tx.length > 300) {
      var extra = document.createElement("p");
      extra.className = "note";
      extra.textContent = "Preview shows the first 300 rows. The download includes every row.";
      stats.appendChild(document.createTextNode(" Preview limited to 300 rows."));
    }
    $("dl-xlsx").disabled = !tx.length;
    $("dl-csv").disabled = !tx.length;
  }

  function exportTable(kind) {
    var tx = allTx();
    if (!tx.length) return;
    var sep = $("sep").value;
    var dec = sep === ";" ? "," : ".";
    var multi = state.results.length > 1;
    var table = P.tableFrom(tx, { withFile: multi, withPage: true, dec: dec });
    var base = "statement-netmend";
    if (!multi && state.results[0]) base = "statement-" + NM.slug(state.results[0].file.replace(/\.pdf$/i, ""));
    if (kind === "csv") {
      NM.download(new Blob([P.toCsv(table, sep)], { type: "text/csv;charset=utf-8" }), base + ".csv");
      return;
    }
    if (typeof XLSX === "undefined") { setStatus("Excel library did not load. Try CSV, or reload the page.", "bad"); return; }
    var wb = XLSX.utils.book_new();
    if (multi) {
      state.results.forEach(function (r) {
        var sheet = P.tableFrom(r.tx, { withPage: true, dec: "." });
        var ws = XLSX.utils.aoa_to_sheet(sheet);
        var name = (r.file || "statement").replace(/\.pdf$/i, "").slice(0, 28) || "statement";
        XLSX.utils.book_append_sheet(wb, ws, name);
      });
    }
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(table), "Combined");
    XLSX.writeFile(wb, base + ".xlsx");
  }

  async function handleFiles(list) {
    var files = Array.prototype.slice.call(list || []).filter(function (f) { return f && /\.pdf$/i.test(f.name) || (f && f.type === "application/pdf"); });
    if (!files.length) { setStatus("Choose a PDF bank statement.", "bad"); return; }
    if (!NM.isPro() && files.length > 1) {
      files = files.slice(0, 1);
      setStatus("Free plan converts one statement at a time, first page only. Extra files were ignored. Unlock Pro for batch files.", "bad");
    } else {
      setStatus("");
    }
    if (!NM.canUse()) { setStatus(NM.limitMsg(), "bad"); return; }
    var ai = $("ai-mode").checked;
    if (ai && !NM.isPro()) { setStatus("AI mode is part of Pro.", "bad"); return; }
    if (ai && !NM.getKey()) { setStatus(NM.friendlyError("NOKEY"), "bad"); return; }
    state.busy = true;
    $("run").disabled = true;
    state.results = [];
    try {
      for (var i = 0; i < files.length; i++) {
        setStatus("Reading " + files[i].name + " in your browser…");
        var rec = await parseFile(files[i], { maxPages: NM.isPro() ? 0 : 1, ai: ai });
        if (!rec.rows.length) {
          setStatus("No text found in " + files[i].name + ". This PDF is probably a scan. Pro AI mode can try messy layouts if the pages have some text; photographed statements may still fail.", "bad");
        }
        state.results.push(rec);
      }
      var total = allTx().length;
      if (!total && state.results.some(function (r) { return r.rows.length; })) {
        setStatus("Text was found, but no transactions were detected. Try another number format, or unlock Pro and tick AI mode for messy layouts.", "bad");
      } else if (total) {
        NM.consume();
        var trunc = state.results.some(function (r) { return r.truncated; });
        setStatus(total + " transaction" + (total === 1 ? "" : "s") + " ready." + (trunc ? " Free plan stopped after page 1. Pro reads the full statement." : ""), trunc ? "bad" : "ok");
      }
      render();
    } catch (err) {
      setStatus("Could not read this PDF (" + ((err && err.message) || err) + "). If it is password-protected, open it and print to PDF first.", "bad");
    } finally {
      state.busy = false;
      $("run").disabled = false;
      paintLimits();
    }
  }

  $("file").addEventListener("change", function (e) { handleFiles(e.target.files); });
  $("run").addEventListener("click", function () { handleFiles($("file").files); });
  $("dl-csv").addEventListener("click", function () { exportTable("csv"); });
  $("dl-xlsx").addEventListener("click", function () { exportTable("xlsx"); });
  ["fmt", "sep"].forEach(function (id) {
    $(id).addEventListener("change", function () {
      if (!state.results.length) return;
      var fmt = $("fmt").value;
      state.results.forEach(function (r) {
        if (!r.usedAi) {
          r.tx = P.toTransactions(r.rows, fmt);
          r.tx.forEach(function (t) { t.file = r.file; });
        }
      });
      render();
    });
  });
  $("ai-mode").addEventListener("change", function () {
    if (this.checked && !NM.isPro()) { this.checked = false; setStatus("AI mode is part of Pro.", "bad"); }
  });

  document.querySelectorAll("[data-demo]").forEach(function (btn) {
    btn.addEventListener("click", async function () {
      var src = btn.getAttribute("data-demo");
      setStatus("Loading the sample statement…");
      try {
        var res = await fetch(src);
        var blob = await res.blob();
        var file = new File([blob], src.split("/").pop(), { type: "application/pdf" });
        handleFiles([file]);
      } catch (e) { setStatus("Could not load the sample PDF.", "bad"); }
    });
  });

  var drop = $("drop");
  ["dragenter", "dragover"].forEach(function (ev) {
    drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add("on"); });
  });
  ["dragleave", "drop"].forEach(function (ev) {
    drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove("on"); });
  });
  drop.addEventListener("drop", function (e) { handleFiles(e.dataTransfer.files); });
})();
