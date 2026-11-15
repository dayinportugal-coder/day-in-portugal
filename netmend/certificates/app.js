/* Netmend Certificates: jsPDF in the browser, no network calls except Gumroad licence verification. */
(function () {
  var $ = NM.$, FREE_MAX = 10, logo = null, sig = null;
  NM.init({ tool: "certificates", freeLimit: 5, unit: "batches", freeText: "Up to 10 certificates per batch, 5 batches a day, small Netmend line.", proText: "Unlimited names, your logo and signature, custom colour, no Netmend line. Pay once.", onLicense: paint });
  function paint() { ["logo", "sig", "accent"].forEach(function (id) { $(id).disabled = !NM.isPro(); }); }
  paint();
  function readImg(input, cb) {
    var f = input.files[0]; if (!f) return cb(null);
    var r = new FileReader(); r.onload = function () { var im = new Image(); im.onload = function () { cb({ data: r.result, w: im.width, h: im.height, fmt: /png/i.test(f.type) ? "PNG" : "JPEG" }); }; im.src = r.result; }; r.readAsDataURL(f);
  }
  $("logo").onchange = function () { readImg(this, function (i) { logo = i; }); };
  $("sig").onchange = function () { readImg(this, function (i) { sig = i; }); };
  function people() {
    return ($("names").value || "").split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean).map(function (l) {
      var i = l.indexOf(","); return i > 0 ? { name: l.slice(0, i).trim(), extra: l.slice(i + 1).trim() } : { name: l, extra: "" };
    });
  }
  function hex(h) { h = h.replace("#", ""); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
  var DESIGN = {
    classic: { bg: [253, 251, 245], ink: [40, 36, 30], accent: "#b8892d", font: "times" },
    modern: { bg: [255, 255, 255], ink: [25, 28, 36], accent: "#ff5a36", font: "helvetica" },
    minimal: { bg: [255, 255, 255], ink: [30, 30, 30], accent: "#333333", font: "helvetica" },
    navy: { bg: [16, 28, 52], ink: [240, 240, 245], accent: "#d9b45a", font: "times" }
  };
  function fill(t, p) {
    return String(t || "").replace(/\{name\}/g, p.name).replace(/\{course\}/g, $("course").value || "").replace(/\{date\}/g, $("date").value || "").replace(/\{extra\}/g, p.extra || "").replace(/\s+/g, " ").trim();
  }
  function draw(doc, p) {
    var d = DESIGN[$("design").value], W = 297, H = 210, pro = NM.isPro();
    var acc = hex(pro ? $("accent").value : d.accent), f = d.font;
    doc.setFillColor.apply(doc, d.bg); doc.rect(0, 0, W, H, "F");
    doc.setDrawColor.apply(doc, acc);
    if ($("design").value === "classic" || $("design").value === "navy") {
      doc.setLineWidth(2.2); doc.rect(10, 10, W - 20, H - 20); doc.setLineWidth(0.5); doc.rect(14, 14, W - 28, H - 28);
    } else if ($("design").value === "modern") {
      doc.setFillColor.apply(doc, acc); doc.rect(0, 0, 18, H, "F"); doc.rect(18, 0, 3, H, "F");
    } else { doc.setLineWidth(0.4); doc.line(40, 40, W - 40, 40); }
    var cx = $("design").value === "modern" ? (W + 21) / 2 : W / 2;
    if (pro && logo) { var lh = 18, lw = Math.min(60, lh * logo.w / logo.h); doc.addImage(logo.data, logo.fmt, cx - lw / 2, 22, lw, lh); }
    doc.setTextColor.apply(doc, acc); doc.setFont(f, "bold"); doc.setFontSize(30);
    doc.text(($("title").value || "Certificate").toUpperCase(), cx, 58, { align: "center", charSpace: 1 });
    doc.setTextColor.apply(doc, d.ink); doc.setFont(f, "normal"); doc.setFontSize(14);
    doc.text("This certificate is presented to", cx, 76, { align: "center" });
    doc.setFont(f, "bolditalic"); var size = 40; doc.setFontSize(size);
    while (doc.getTextWidth(p.name) > 220 && size > 18) { size -= 2; doc.setFontSize(size); }
    doc.text(p.name, cx, 98, { align: "center" });
    doc.setDrawColor.apply(doc, acc); doc.setLineWidth(0.6); doc.line(cx - 80, 104, cx + 80, 104);
    doc.setFont(f, "normal"); doc.setFontSize(15);
    var lines = doc.splitTextToSize(fill($("body").value, p), 200); doc.text(lines, cx, 118, { align: "center" });
    if (p.extra && $("body").value.indexOf("{extra}") < 0) { doc.setFont(f, "bold"); doc.text(p.extra, cx, 118 + lines.length * 7 + 2, { align: "center" }); }
    doc.setFontSize(11); doc.setFont(f, "normal");
    var y = 168;
    if ($("date").value) { doc.line(cx - 100, y, cx - 40, y); doc.text($("date").value, cx - 70, y + 6, { align: "center" }); doc.text("Date", cx - 70, y + 11, { align: "center" }); }
    if (pro && sig) { var sh = 16, sw = Math.min(60, sh * sig.w / sig.h); doc.addImage(sig.data, sig.fmt, cx + 70 - sw / 2, y - sh - 1, sw, sh); }
    if ($("signer").value) { doc.line(cx + 40, y, cx + 100, y); doc.text($("signer").value, cx + 70, y + 6, { align: "center" }); }
    if ($("issuer").value) { doc.setFont(f, "bold"); doc.setFontSize(12); doc.text($("issuer").value, cx, 150, { align: "center" }); }
    if (!pro) { doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor(150, 150, 150); doc.text("Made with Netmend Certificates · netmend.app/certificates", cx, H - 5, { align: "center" }); }
  }
  function newDoc() { return new window.jspdf.jsPDF({ orientation: "landscape", unit: "mm", format: "a4", compress: true }); }
  function list(forBatch) {
    var ps = people();
    if (!ps.length) { NM.status("status", "Paste at least one name.", "bad"); return null; }
    if (forBatch && !NM.isPro() && ps.length > FREE_MAX) { NM.status("status", "Free plan: first " + FREE_MAX + " of " + ps.length + " names. Pro has no limit.", "bad"); ps = ps.slice(0, FREE_MAX); }
    return ps;
  }
  $("preview").onclick = function () {
    var ps = list(false); if (!ps) return;
    var doc = newDoc(); draw(doc, ps[0]);
    var u = URL.createObjectURL(doc.output("blob")); $("prev").src = u; $("prev").hidden = false;
  };
  function gate() { if (!NM.canUse()) { NM.status("status", NM.limitMsg(), "bad"); return false; } return true; }
  $("pdfall").onclick = function () {
    if (!gate()) return; var ps = list(true); if (!ps) return;
    var doc = newDoc(); ps.forEach(function (p, i) { if (i) doc.addPage(); draw(doc, p); });
    doc.save("certificates-" + NM.slug($("course").value || $("title").value) + ".pdf"); NM.consume();
    if (NM.isPro() || people().length <= FREE_MAX) NM.status("status", ps.length + " certificates saved in one PDF.", "ok");
  };
  $("zip").onclick = function () {
    if (!gate()) return; var ps = list(true); if (!ps) return;
    var z = new JSZip(), seen = {};
    ps.forEach(function (p) { var doc = newDoc(); draw(doc, p); var n = NM.slug(p.name); seen[n] = (seen[n] || 0) + 1; z.file(n + (seen[n] > 1 ? "-" + seen[n] : "") + ".pdf", doc.output("arraybuffer")); });
    z.generateAsync({ type: "blob" }).then(function (b) { NM.download(b, "certificates-" + NM.slug($("course").value || $("title").value) + ".zip"); NM.consume(); NM.status("status", ps.length + " PDFs saved in a ZIP.", "ok"); });
  };
})();
