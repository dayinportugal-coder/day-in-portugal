/* Netmend suite runtime. Static, no server, no trackers.
   Your Gemini key, usage counter and licence live only in this browser (localStorage).
   Network calls: Google Gemini API (with YOUR key) and Gumroad licence verification. */
(function () {
  var KEY_LS = "netmend-gemini-key";
  var MODELS = ["gemini-3.5-flash-lite", "gemini-flash-lite-latest", "gemini-3.5-flash", "gemini-flash-latest", "gemini-2.5-flash"];
  var REVERIFY_MS = 7 * 24 * 3600 * 1000;
  var NM = window.NM = {};
  var cfg = {};

  function $(id) { return document.getElementById(id); }
  NM.$ = $;
  NM.esc = function (s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  };
  function today() {
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function lsGet(k, def) { try { var v = localStorage.getItem(k); return v == null ? def : JSON.parse(v); } catch (e) { return def; } }
  function lsSet(k, v) { localStorage.setItem(k, JSON.stringify(v)); }

  /* ---------- key ---------- */
  NM.getKey = function () {
    return (localStorage.getItem(KEY_LS) || localStorage.getItem("netmend-xpw-gemini-key") || "").trim();
  };
  function paintKey() {
    var st = $("nm-key-status"), inp = $("nm-key-input");
    if (!st) return;
    if (NM.getKey()) {
      inp.value = ""; inp.placeholder = "Key saved in this browser (paste a new one to replace it)";
      st.innerHTML = '<span class="ok">Gemini key saved on this device only.</span> It goes only to Google, never to Netmend.';
    } else {
      inp.placeholder = "Paste your Gemini API key";
      st.textContent = "No key saved yet. A free key from Google AI Studio is enough.";
    }
  }
  function renderKeyBox(el) {
    el.className = "xpw-key nm-key";
    el.innerHTML =
      '<h3 style="margin:0 0 6px">Your Gemini API key (free)</h3>' +
      '<ol><li>Open <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">aistudio.google.com</a> and sign in with any Google account.</li>' +
      '<li>Click <b>Create API key</b>. The free tier is enough.</li>' +
      '<li>Paste it here and click Save. It is stored only in this browser and shared by all Netmend tools on this device.</li></ol>' +
      '<label for="nm-key-input">Gemini API key</label>' +
      '<input id="nm-key-input" type="password" autocomplete="off" spellcheck="false">' +
      '<p style="margin-top:12px"><button class="btn" type="button" id="nm-key-save">Save key</button> ' +
      '<button class="btn ghost" type="button" id="nm-key-show">Show</button> ' +
      '<button class="btn ghost" type="button" id="nm-key-clear">Remove key</button></p>' +
      '<p class="note" id="nm-key-status"></p>';
    $("nm-key-save").onclick = function () {
      var v = ($("nm-key-input").value || "").trim();
      if (!v) { $("nm-key-status").innerHTML = '<span class="bad">Paste a key first.</span>'; return; }
      localStorage.setItem(KEY_LS, v); paintKey();
    };
    $("nm-key-show").onclick = function () {
      var i = $("nm-key-input"); i.type = i.type === "password" ? "text" : "password";
      this.textContent = i.type === "password" ? "Show" : "Hide";
    };
    $("nm-key-clear").onclick = function () {
      localStorage.removeItem(KEY_LS); localStorage.removeItem("netmend-xpw-gemini-key"); paintKey();
    };
    paintKey();
  }

  /* ---------- usage (free tier) ---------- */
  function useKey(tool) { return "netmend-usage-" + tool; }
  NM.used = function (tool) {
    var u = lsGet(useKey(tool), {});
    return u.date === today() ? Number(u.count) || 0 : 0;
  };
  NM.remaining = function () {
    if (NM.isPro()) return Infinity;
    return Math.max(0, cfg.freeLimit - NM.used(cfg.tool));
  };
  NM.canUse = function () { return NM.remaining() > 0; };
  NM.consume = function () {
    if (NM.isPro()) return;
    lsSet(useKey(cfg.tool), { date: today(), count: NM.used(cfg.tool) + 1 });
    NM.paintRemain();
  };
  NM.paintRemain = function () {
    var el = $("nm-remain"); if (!el) return;
    if (NM.isPro()) { el.innerHTML = '<span class="ok">Pro active: no daily limit.</span>'; return; }
    var n = NM.remaining();
    el.textContent = n + " of " + cfg.freeLimit + " free " + (cfg.unit || "uses") + " left today in this browser.";
  };
  NM.limitMsg = function () {
    return "You have used the " + cfg.freeLimit + " free " + (cfg.unit || "uses") + " for today. Come back tomorrow, or unlock Pro (lifetime, one payment) below.";
  };

  /* ---------- licence (Gumroad) ---------- */
  function licKey(tool) { return "netmend-license-" + tool; }
  NM.product = function () { return (window.NM_PRODUCTS || {})[cfg.tool] || {}; };
  NM.isPro = function () { var l = lsGet(licKey(cfg.tool), null); return !!(l && l.pro); };
  NM.verifyLicense = function (key, increment) {
    var p = NM.product();
    if (!p.productId) return Promise.resolve({ valid: false, message: "Pro licences for this tool are not on sale yet. Email us and we will tell you when they open." });
    var body = new URLSearchParams({ product_id: p.productId, license_key: String(key).trim(), increment_uses_count: increment ? "true" : "false" });
    return fetch("https://api.gumroad.com/v2/licenses/verify", { method: "POST", body: body }).then(function (r) {
      return r.json().catch(function () { return {}; });
    }).then(function (d) {
      var pu = d.purchase || {};
      var valid = !!d.success && !pu.refunded && !pu.chargebacked && !pu.disputed;
      return { valid: valid, message: d.message || (valid ? "ok" : "Invalid licence key"), uses: d.uses };
    });
  };
  function paintLicense() {
    var st = $("nm-lic-status"); if (!st) return;
    var l = lsGet(licKey(cfg.tool), null);
    if (l && l.pro) st.innerHTML = '<span class="ok">Pro is active in this browser.</span> <button class="btn ghost" type="button" id="nm-lic-remove">Remove licence</button>';
    else st.textContent = (l && l.message) ? l.message : "";
    var rm = $("nm-lic-remove");
    if (rm) rm.onclick = function () { localStorage.removeItem(licKey(cfg.tool)); paintLicense(); NM.paintRemain(); if (cfg.onLicense) cfg.onLicense(false); };
  }
  function renderLicenseBox(el) {
    var p = NM.product();
    var buy = p.url
      ? '<a class="btn" id="nm-buy" href="' + NM.esc(p.url) + '" target="_blank" rel="noopener noreferrer">Get ' + NM.esc(p.name) + " · $" + p.price + " lifetime</a>"
      : '<a class="btn" id="nm-buy" href="mailto:dayinportugal@gmail.com?subject=' + encodeURIComponent((p.name || "Netmend Pro") + " - tell me when it opens") + '">Pro opens soon · $' + (p.price || 19) + " lifetime · get notified</a>";
    el.innerHTML =
      '<div class="grid nm-plans">' +
      '<div class="card"><b>Free</b><div class="price">$0</div><p>' + NM.esc(cfg.freeText || "") + "</p></div>" +
      '<div class="card"><b>Pro, lifetime</b><div class="price">$' + (p.price || 19) + ' <small>one payment</small></div><p>' + NM.esc(cfg.proText || "") + "</p></div></div>" +
      '<p style="margin-top:18px">' + buy + "</p>" +
      '<p class="note">Payment and the licence key email are handled by Gumroad, not this site. 14-day refund.</p>' +
      '<label for="nm-lic-input">Already bought? Paste your licence key</label>' +
      '<div class="nm-inline"><input id="nm-lic-input" type="text" autocomplete="off" spellcheck="false" placeholder="XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX">' +
      '<button class="btn sec" type="button" id="nm-lic-go">Activate</button></div>' +
      '<p class="note" id="nm-lic-status"></p>';
    $("nm-lic-go").onclick = function () {
      var k = ($("nm-lic-input").value || "").trim();
      var st = $("nm-lic-status");
      if (!k) { st.innerHTML = '<span class="bad">Paste the licence key from your Gumroad receipt.</span>'; return; }
      st.textContent = "Checking with Gumroad…";
      NM.verifyLicense(k, true).then(function (r) {
        if (r.valid) lsSet(licKey(cfg.tool), { key: k, pro: true, verifiedAt: Date.now() });
        else lsSet(licKey(cfg.tool), { pro: false, message: r.message });
        paintLicense(); NM.paintRemain(); if (cfg.onLicense) cfg.onLicense(r.valid);
        if (!r.valid) st.innerHTML = '<span class="bad">' + NM.esc(r.message) + "</span>";
      }).catch(function () { st.innerHTML = '<span class="bad">Could not reach Gumroad. Check your connection and try again.</span>'; });
    };
    paintLicense();
  }
  function reverify() {
    var l = lsGet(licKey(cfg.tool), null);
    if (!l || !l.pro || !l.key || Date.now() - (l.verifiedAt || 0) < REVERIFY_MS) return;
    NM.verifyLicense(l.key, false).then(function (r) {
      if (r.valid) { l.verifiedAt = Date.now(); lsSet(licKey(cfg.tool), l); }
      else { lsSet(licKey(cfg.tool), { pro: false, message: "Licence no longer valid: " + r.message }); paintLicense(); NM.paintRemain(); }
    }).catch(function () {});
  }

  /* ---------- Gemini ---------- */
  NM.extractJson = function (text) {
    var t = String(text || "").trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
    try { return JSON.parse(t); } catch (e) {}
    var a = t.indexOf("{"), b = t.lastIndexOf("}");
    if (a >= 0 && b > a) { try { return JSON.parse(t.slice(a, b + 1)); } catch (e) {} }
    var c = t.indexOf("["), d = t.lastIndexOf("]");
    if (c >= 0 && d > c) { try { return JSON.parse(t.slice(c, d + 1)); } catch (e) {} }
    throw new Error("The model's answer was not in the expected format. Please try again.");
  };
  function callModel(model, key, req) {
    var body = { contents: req.contents, generationConfig: { temperature: req.temperature == null ? 0.7 : req.temperature } };
    if (req.system) body.systemInstruction = { parts: [{ text: req.system }] };
    if (req.json && !req.tools) body.generationConfig.responseMimeType = "application/json";
    if (req.tools) body.tools = req.tools;
    return fetch("https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent", {
      method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": key }, body: JSON.stringify(body)
    }).then(function (res) {
      return res.text().then(function (raw) {
        var data = null; try { data = JSON.parse(raw); } catch (e) {}
        if (!res.ok) { var err = new Error((data && data.error && data.error.message) || ("HTTP " + res.status)); err.status = res.status; throw err; }
        var c = data && data.candidates && data.candidates[0];
        var text = c && c.content && c.content.parts ? c.content.parts.map(function (p) { return p.thought ? "" : (p.text || ""); }).join("") : "";
        if (!text) { var e2 = new Error("The model returned an empty answer" + (c && c.finishReason ? " (" + c.finishReason + ")" : "") + "."); e2.status = 500; throw e2; }
        return text;
      });
    });
  }
  /* req: {contents | prompt, parts, system, json, tools, temperature, onModel} */
  NM.gemini = function (req) {
    var key = NM.getKey();
    if (!key) return Promise.reject(new Error("NOKEY"));
    if (!req.contents) req.contents = [{ role: "user", parts: req.parts || [{ text: req.prompt }] }];
    var i = 0, lastErr;
    function next() {
      if (i >= MODELS.length) return Promise.reject(lastErr || new Error("No Gemini model accepted the request."));
      var m = MODELS[i++];
      if (req.onModel) req.onModel(m);
      return callModel(m, key, req).then(function (t) { return req.json ? NM.extractJson(t) : t; }).catch(function (err) {
        lastErr = err;
        var s = err.status, msg = String(err.message || "");
        var retry = s === 404 || s === 429 || s === 500 || s === 503 || /not found|no longer available|not supported|overloaded|expected format/i.test(msg);
        if (s === 400 && /model/i.test(msg)) retry = true;
        if (retry && i < MODELS.length) return next();
        throw err;
      });
    }
    return next();
  };
  NM.friendlyError = function (err) {
    var m = String((err && err.message) || err);
    if (m === "NOKEY") return "Save your free Gemini API key first (box above). It stays in this browser.";
    if (/API key not valid|API_KEY_INVALID|PERMISSION_DENIED|401|403/i.test(m)) return "Google rejected the API key. Copy the whole key again from aistudio.google.com.";
    if (/quota|RESOURCE_EXHAUSTED|429/i.test(m)) return "Google's free quota for your key is used up for now. Wait a minute and try again.";
    if (/Failed to fetch|NetworkError|Load failed/i.test(m)) return "The browser could not reach Google's Gemini API. Check your connection. Nothing was sent to Netmend.";
    return m;
  };
  NM.fileToPart = function (file) {
    return new Promise(function (resolve, reject) {
      var r = new FileReader();
      r.onload = function () { resolve({ inlineData: { mimeType: file.type || "application/pdf", data: String(r.result).split(",")[1] } }); };
      r.onerror = function () { reject(new Error("Could not read the file.")); };
      r.readAsDataURL(file);
    });
  };
  NM.readText = function (file) {
    return new Promise(function (resolve, reject) {
      var r = new FileReader(); r.onload = function () { resolve(String(r.result)); }; r.onerror = reject; r.readAsText(file);
    });
  };
  NM.download = function (blob, name) {
    var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  };
  NM.status = function (el, html, kind) {
    if (typeof el === "string") el = $(el);
    el.innerHTML = kind ? '<span class="' + kind + '">' + html + "</span>" : html;
  };
  NM.slug = function (s) { return String(s || "netmend").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "netmend"; };
  NM.copy = function (text, btn) {
    function done() { if (!btn) return; var o = btn.textContent; btn.textContent = "Copied"; setTimeout(function () { btn.textContent = o; }, 1200); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done).catch(function () { window.prompt("Copy:", text); });
    else window.prompt("Copy:", text);
  };

  /* opts: {tool, freeLimit, unit, freeText, proText, onLicense} */
  NM.init = function (opts) {
    cfg = opts;
    var k = $("nm-key"); if (k) renderKeyBox(k);
    var l = $("nm-license"); if (l) renderLicenseBox(l);
    NM.paintRemain(); reverify();
  };
})();
