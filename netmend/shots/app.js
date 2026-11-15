/* Netmend Shots: screenshot beautifier on a canvas. No network, no AI. */
(function () {
  var $ = NM.$, img = null, bg = 0, custom = null, SETS = "netmend-shots-settings";
  NM.init({ tool: "shots", freeLimit: 10, unit: "exports", freeText: "10 PNG exports a day at 1×, with a small mark in the corner.", proText: "No mark, no limit, 2× and 3× retina export, settings remembered. Pay once.", onLicense: draw });
  var BGS = [["#ff5a36", "#8b7bff"], ["#0f2027", "#2c5364"], ["#f7971e", "#ffd200"], ["#00c6ff", "#0072ff"], ["#ee9ca7", "#ffdde1"], ["#11998e", "#38ef7d"],
    ["#141e30", "#243b55"], ["#fc5c7d", "#6a82fb"], ["#232526", "#414345"], ["#e0eafc", "#cfdef3"], ["#ff9966", "#ff5e62"], ["#6fd3e0", "#8b7bff"]];
  $("bgs").innerHTML = BGS.map(function (g, i) { return '<button type="button" data-bg="' + i + '" style="background:linear-gradient(135deg,' + g[0] + "," + g[1] + ')" aria-label="Background ' + (i + 1) + '"></button>'; }).join("");
  function paintSw() { document.querySelectorAll("[data-bg]").forEach(function (b) { b.classList.toggle("on", !custom && +b.getAttribute("data-bg") === bg); }); }
  document.querySelectorAll("[data-bg]").forEach(function (b) { b.onclick = function () { bg = +b.getAttribute("data-bg"); custom = null; paintSw(); draw(); }; });
  $("custom").onclick = function () { custom = [$("c1").value, $("c2").value]; paintSw(); draw(); };
  ["c1", "c2"].forEach(function (id) { $(id).oninput = function () { custom = [$("c1").value, $("c2").value]; paintSw(); draw(); }; });
  ["size", "frame", "url", "pad", "rad", "sh", "title"].forEach(function (id) { $(id).addEventListener("input", draw); });
  function load(src) { var im = new Image(); im.onload = function () { img = im; draw(); }; im.src = src; }
  function loadFile(f) { if (!f || !/^image\//.test(f.type)) return; var r = new FileReader(); r.onload = function () { load(r.result); }; r.readAsDataURL(f); }
  $("img").onchange = function () { loadFile(this.files[0]); };
  var dz = $("drop2");
  ["dragenter", "dragover"].forEach(function (ev) { dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.add("on"); }); });
  ["dragleave", "drop"].forEach(function (ev) { dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.remove("on"); }); });
  dz.addEventListener("drop", function (e) { loadFile(e.dataTransfer.files[0]); });
  window.addEventListener("paste", function (e) { var it = [].slice.call((e.clipboardData || {}).items || []).filter(function (x) { return /^image\//.test(x.type); })[0]; if (it) loadFile(it.getAsFile()); });
  $("sample").onclick = function () { load("../assets/shots/xpw.webp"); };
  function rr(c, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  function render(canvas, scale) {
    var c = canvas.getContext("2d"), pad = +$("pad").value, rad = +$("rad").value, sh = +$("sh").value / 100;
    var frame = $("frame").value, title = ($("title").value || "").trim();
    var iw = img ? img.naturalWidth : 1280, ih = img ? img.naturalHeight : 760;
    var bar = frame === "none" ? 0 : frame === "mac" ? 36 : 44;
    var tH = title ? 90 : 0, W, H, s;
    if ($("size").value === "auto") { s = Math.min(1, 1600 / iw); W = Math.round(iw * s + pad * 2); H = Math.round(ih * s + bar + pad * 2 + tH); }
    else { var p = $("size").value.split("x"); W = +p[0]; H = +p[1]; s = Math.min((W - pad * 2) / iw, (H - pad * 2 - bar - tH) / ih); if (s <= 0) s = 0.1; }
    canvas.width = W * scale; canvas.height = H * scale; c.setTransform(scale, 0, 0, scale, 0, 0);
    var g = custom || BGS[bg], grad = c.createLinearGradient(0, 0, W, H); grad.addColorStop(0, g[0]); grad.addColorStop(1, g[1]); c.fillStyle = grad; c.fillRect(0, 0, W, H);
    var glow = c.createRadialGradient(W * 0.2, H * 0.1, 0, W * 0.2, H * 0.1, W * 0.7); glow.addColorStop(0, "rgba(255,255,255,.22)"); glow.addColorStop(1, "rgba(255,255,255,0)"); c.fillStyle = glow; c.fillRect(0, 0, W, H);
    var dw = iw * s, dh = ih * s, x = (W - dw) / 2, y = (H - tH - dh - bar) / 2 + tH;
    if (title) { c.fillStyle = "#fff"; c.textAlign = "center"; c.textBaseline = "middle"; var fs = Math.max(22, Math.min(54, W / 26)); c.font = "800 " + fs + "px Inter, system-ui, sans-serif"; c.shadowColor = "rgba(0,0,0,.25)"; c.shadowBlur = 12; c.fillText(title, W / 2, Math.max(pad * 0.5, 20) + tH / 2 - 10, W - 60); c.shadowBlur = 0; }
    c.save(); c.shadowColor = "rgba(0,0,0," + (0.55 * sh) + ")"; c.shadowBlur = 70 * sh; c.shadowOffsetY = 26 * sh;
    rr(c, x, y, dw, dh + bar, rad); c.fillStyle = frame === "browser-dark" || frame === "mac" ? "#1c1f26" : "#f3f4f6"; c.fill(); c.restore();
    c.save(); rr(c, x, y, dw, dh + bar, rad); c.clip();
    if (bar) {
      c.fillStyle = frame === "browser" ? "#e9ebef" : frame === "browser-dark" ? "#24272f" : "#2a2d35"; c.fillRect(x, y, dw, bar);
      ["#ff5f57", "#febc2e", "#28c840"].forEach(function (col, i) { c.beginPath(); c.arc(x + 20 + i * 20, y + bar / 2, 6, 0, 7); c.fillStyle = col; c.fill(); });
      if (frame !== "mac") {
        var ux = x + 90, uw = Math.min(dw - 180, 520); rr(c, ux, y + 9, uw, bar - 18, 8); c.fillStyle = frame === "browser" ? "#fff" : "#16181d"; c.fill();
        c.fillStyle = frame === "browser" ? "#555" : "#aab"; c.font = "500 13px Inter, system-ui, sans-serif"; c.textAlign = "left"; c.textBaseline = "middle"; c.fillText("🔒 " + ($("url").value || ""), ux + 12, y + bar / 2, uw - 24);
      }
    }
    if (img) { c.drawImage(img, x, y + bar, dw, dh); }
    else { c.fillStyle = "#0b0d12"; c.fillRect(x, y + bar, dw, dh); c.fillStyle = "#9aa1ad"; c.font = "600 22px Inter, system-ui, sans-serif"; c.textAlign = "center"; c.fillText("Drop, paste or choose a screenshot", x + dw / 2, y + bar + dh / 2); }
    c.restore();
    if (!NM.isPro()) { c.font = "600 13px Inter, system-ui, sans-serif"; c.textAlign = "right"; c.textBaseline = "bottom"; c.fillStyle = "rgba(255,255,255,.75)"; c.fillText("netmend shots", W - 12, H - 10); }
  }
  function draw() {
    $("padv").textContent = $("pad").value + "px"; $("radv").textContent = $("rad").value + "px"; $("shv").textContent = $("sh").value + "%";
    render($("stage"), 1);
    if (NM.isPro()) try { localStorage.setItem(SETS, JSON.stringify({ bg: bg, custom: custom, size: $("size").value, frame: $("frame").value, url: $("url").value, pad: $("pad").value, rad: $("rad").value, sh: $("sh").value })); } catch (e) {}
  }
  if (NM.isPro()) { try { var st = JSON.parse(localStorage.getItem(SETS) || "null"); if (st) { bg = st.bg || 0; custom = st.custom; ["size", "frame", "url", "pad", "rad", "sh"].forEach(function (k) { if (st[k] != null) $(k).value = st[k]; }); } } catch (e) {} }
  function exportCanvas(cb) {
    if (!img) { NM.status("status", "Add a screenshot first.", "bad"); return; }
    if (!NM.canUse()) { NM.status("status", NM.limitMsg(), "bad"); return; }
    var sc = +$("scale").value; if (sc > 1 && !NM.isPro()) { NM.status("status", "2× and 3× export are part of Pro. Exporting at 1×."); sc = 1; }
    var cv = document.createElement("canvas"); render(cv, sc); cv.toBlob(function (b) { NM.consume(); cb(b); }, "image/png");
  }
  $("dl").onclick = function () { exportCanvas(function (b) { NM.download(b, "netmend-shot-" + Date.now() + ".png"); NM.status("status", "PNG downloaded.", "ok"); }); };
  $("cp").onclick = function () {
    var btn = this;
    exportCanvas(function (b) {
      if (navigator.clipboard && window.ClipboardItem) navigator.clipboard.write([new ClipboardItem({ "image/png": b })]).then(function () { NM.status("status", "Image copied. Paste it into your post.", "ok"); }).catch(function () { NM.download(b, "netmend-shot.png"); });
      else NM.download(b, "netmend-shot.png");
    });
  };
  paintSw(); draw();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
})();
