/* Netmend X Post Writer. The Gemini key and the daily counter live only in this browser. */
(function () {
  var KEY_LS = "netmend-xpw-gemini-key";
  var USE_LS = "netmend-xpw-usage";
  var DAILY_LIMIT = 3;
  var MODELS = [
    "gemini-3.5-flash-lite",
    "gemini-3.8-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash"
  ];

  var HOOKS = [
    "Question hook + numbered list of concrete rules or items. First line is a real question. Then 3 to 5 numbered points. No empty advice.",
    "Concrete-fact hook. Open with a specific number, limit or rule that is in the source material. Then one or two short lines that explain why it matters.",
    "Authority + exact setup. The authority is the user (or a source they pasted), never a famous name you invent. Shock-open + a real figure + the exact setup or steps.",
    "Numbered lessons from real work. Only if the source has a real count. Form: I did N things. K things I learned.",
    "Anatomy / numbered components. Anatomy of an X: the N key parts. A definition, then a short numbered list.",
    "Short opinion or story with a twist. One counterintuitive first line, then the correction, then a practical rule. End on a memorable line, not an engagement-bait question.",
    "Very short hook. The first line does almost all the work. One or two sentences after it, nothing else."
  ];

  var keyEl = document.getElementById("api-key");
  var showEl = document.getElementById("toggle-key");
  var saveEl = document.getElementById("save-key");
  var clearEl = document.getElementById("clear-key");
  var keyStatus = document.getElementById("key-status");
  var voiceEl = document.getElementById("voice");
  var ideaEl = document.getElementById("idea");
  var kindEl = document.getElementById("kind");
  var goEl = document.getElementById("generate");
  var statusEl = document.getElementById("status");
  var outEl = document.getElementById("out");
  var remainEl = document.getElementById("remain");

  function today() {
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function usage() {
    try {
      var u = JSON.parse(localStorage.getItem(USE_LS) || "{}");
      if (u.date !== today()) return { date: today(), count: 0 };
      return { date: u.date, count: Number(u.count) || 0 };
    } catch (e) {
      return { date: today(), count: 0 };
    }
  }
  function setUsage(u) {
    localStorage.setItem(USE_LS, JSON.stringify(u));
  }
  function remaining() {
    return Math.max(0, DAILY_LIMIT - usage().count);
  }
  function paintRemain() {
    var n = remaining();
    if (remainEl) remainEl.textContent = n === 1 ? "1 free generation left today in this browser." : n + " free generations left today in this browser.";
    if (goEl) goEl.disabled = n <= 0;
  }
  function keySaved() {
    return !!(localStorage.getItem(KEY_LS) || "").trim();
  }
  function paintKey() {
    if (keySaved()) {
      keyEl.value = "";
      keyEl.placeholder = "Key saved in this browser (paste a new one to replace it)";
      keyStatus.innerHTML = '<span class="ok">API key saved on this device only.</span> It is never sent to Netmend. We have no server for this tool.';
    } else {
      keyEl.placeholder = "Paste your Gemini API key";
      keyStatus.textContent = "No key saved yet. The free Gemini key from Google AI Studio is enough.";
    }
  }

  if (showEl) {
    showEl.addEventListener("click", function () {
      keyEl.type = keyEl.type === "password" ? "text" : "password";
      showEl.textContent = keyEl.type === "password" ? "Show" : "Hide";
    });
  }
  if (saveEl) {
    saveEl.addEventListener("click", function () {
      var v = (keyEl.value || "").trim();
      if (!v) {
        keyStatus.innerHTML = '<span class="bad">Paste a key first.</span>';
        return;
      }
      localStorage.setItem(KEY_LS, v);
      keyEl.value = "";
      paintKey();
    });
  }
  if (clearEl) {
    clearEl.addEventListener("click", function () {
      localStorage.removeItem(KEY_LS);
      keyEl.value = "";
      paintKey();
    });
  }

  function buildPrompt(voice, idea, kind) {
    var want = kind === "threads"
      ? "Write 10 short threads (2 to 4 posts each)."
      : kind === "mix"
        ? "Write 10 items: a mix of single posts and short threads (2 to 4 posts). At least 3 of each."
        : "Write 10 single posts, not threads.";
    return [
      "You are a writing assistant that drafts posts for X (Twitter) in the user's own voice.",
      "Write in English only. Do not invent facts, figures, testimonials, or results that are not in the user's material.",
      "If the user's past posts show a voice (sentence length, punctuation, slang, formality, emoji, first person), copy that voice. If they pasted no posts, use a clear, direct voice and say so in voice_notes.",
      "Hook formats to rotate through (use several, not just one). These are structures, not themes:",
      HOOKS.map(function (h, i) { return (i + 1) + ". " + h; }).join("\n"),
      "Rules: no em dashes; no filler; at most one or two hashtags, and only if the user's voice already uses them; do not tag people to ask for attention; do not add a sales link unless the user asked for one in the idea.",
      "A stranger should understand the topic from the first line, see what they get from reading, and want the next line.",
      "Single posts and every thread part must be at most 280 characters.",
      want,
      "",
      "USER'S PAST POSTS (voice sample, may be empty):",
      voice || "(none)",
      "",
      "ARTICLE OR ROUGH IDEA TO WRITE ABOUT:",
      idea,
      "",
      "Return JSON only, with this shape:",
      '{"voice_notes":"short description of the voice you used","items":[{"format":"name of the hook format","type":"post or thread","text":"the full single post, if type is post","parts":["thread part 1","thread part 2"]}]}',
      "For type=post, put the post in text and omit parts or use an empty array. For type=thread, put each post in parts (2 to 4) and omit text or leave it empty.",
      "Exactly 10 items."
    ].join("\n");
  }

  function extractJson(s) {
    if (!s) throw new Error("Empty model response.");
    var t = s.trim();
    var fence = t.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fence) t = fence[1].trim();
    var start = t.indexOf("{");
    var end = t.lastIndexOf("}");
    if (start >= 0 && end > start) t = t.slice(start, end + 1);
    return JSON.parse(t);
  }

  function callModel(model, key, prompt) {
    var url = "https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(model) + ":generateContent?key=" + encodeURIComponent(key);
    var body = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.9, responseMimeType: "application/json" }
    };
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }).then(function (res) {
      return res.text().then(function (raw) {
        var data;
        try { data = JSON.parse(raw); } catch (e) { data = null; }
        if (!res.ok) {
      var msg = (data && data.error && data.error.message) || ("HTTP " + res.status);
          var err = new Error(msg);
          err.status = res.status;
          throw err;
        }
        var text = data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts
          ? data.candidates[0].content.parts.map(function (p) { return p.text || ""; }).join("")
          : "";
        return extractJson(text);
      });
    });
  }

  function generateWithFallback(key, prompt) {
    var i = 0;
    var lastErr;
    function next() {
      if (i >= MODELS.length) throw lastErr || new Error("No Gemini model accepted the request.");
      var model = MODELS[i++];
      statusEl.textContent = "Generating with " + model + "…";
      return callModel(model, key, prompt).catch(function (err) {
        lastErr = err;
        var m = String(err.message || "");
        var retryable = err.status === 404 || err.status === 400 || /not found|unknown model|not supported/i.test(m);
        if (retryable && i < MODELS.length) return next();
        throw err;
      });
    }
    return next();
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function countChars(s) {
    return Array.from(s || "").length;
  }
  function copyText(text, btn) {
    function done() {
      var old = btn.textContent;
      btn.textContent = "Copied";
      setTimeout(function () { btn.textContent = old; }, 1200);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () {
        window.prompt("Copy this text:", text);
      });
    } else {
      window.prompt("Copy this text:", text);
    }
  }

  function render(data) {
    var items = (data && data.items) || [];
    var notes = data && data.voice_notes ? '<p class="note">' + esc(data.voice_notes) + "</p>" : "";
    var html = notes + '<div class="xpw-out">';
    items.forEach(function (it, idx) {
      var format = it.format || "Draft";
      var type = it.type === "thread" ? "thread" : "post";
      var parts = type === "thread" && it.parts && it.parts.length ? it.parts : [it.text || ""];
      html += '<article class="xpw-card" data-i="' + idx + '"><header><span class="fmt">' + (idx + 1) + " · " + esc(format) + (type === "thread" ? " · thread" : "") + '</span></header>';
      if (type === "thread") {
        html += '<div class="thread">';
        parts.forEach(function (p, n) {
          html += "<div><span class=\"chars\">Part " + (n + 1) + " · " + countChars(p) + " characters</span><pre>" + esc(p) + "</pre></div>";
        });
        html += "</div>";
      } else {
        var t = parts[0] || "";
        html += '<span class="chars">' + countChars(t) + " characters</span><pre>" + esc(t) + "</pre>";
      }
      html += '<div class="xpw-actions"><button type="button" class="btn ghost" data-copy="' + idx + '">Copy</button></div></article>';
    });
    html += "</div>";
    outEl.innerHTML = html;
    outEl.querySelectorAll("[data-copy]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var i = Number(btn.getAttribute("data-copy"));
        var it = items[i];
        var type = it.type === "thread" ? "thread" : "post";
        var text = type === "thread" && it.parts && it.parts.length ? it.parts.join("\n\n") : (it.text || (it.parts && it.parts[0]) || "");
        copyText(text, btn);
      });
    });
  }

  if (goEl) {
    goEl.addEventListener("click", function () {
      var key = (localStorage.getItem(KEY_LS) || "").trim();
      if (!key) {
        statusEl.innerHTML = '<span class="bad">Save a Gemini API key first. It stays in this browser.</span>';
        document.getElementById("setup").scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      var idea = (ideaEl.value || "").trim();
      if (!idea) {
        statusEl.innerHTML = '<span class="bad">Paste an article, notes, or a rough idea to write about.</span>';
        ideaEl.focus();
        return;
      }
      if (remaining() <= 0) {
        statusEl.innerHTML = '<span class="bad">You have used the 3 free generations for today in this browser. Come back tomorrow, or reserve the founding lifetime licence below.</span>';
        paintRemain();
        return;
      }
      var voice = (voiceEl.value || "").trim();
      var kind = kindEl.value;
      goEl.disabled = true;
      statusEl.textContent = "Generating…";
      outEl.innerHTML = "";
      var prompt = buildPrompt(voice, idea, kind);
      generateWithFallback(key, prompt).then(function (data) {
        if (!data || !data.items || !data.items.length) throw new Error("The model returned no posts. Try again, or add a few more of your old posts.");
        var u = usage();
        u.count += 1;
        setUsage(u);
        paintRemain();
        render(data);
        statusEl.innerHTML = '<span class="ok">Done.</span> Read each draft before you post. The model can still be wrong.';
      }).catch(function (err) {
        var m = String(err.message || err);
        if (/API key|api key|invalid|PERMISSION|401|403/i.test(m)) {
          m = "Google rejected the API key. Check that you copied the whole key from aistudio.google.com, and that the free Gemini API is enabled on that key.";
        } else if (/quota|resource exhausted|429/i.test(m)) {
          m = "Google's free quota for this key is used up for now. Wait and try again, or create a new key in AI Studio.";
        } else if (/Failed to fetch|NetworkError|CORS/i.test(m)) {
          m = "The browser could not reach Google's Gemini API. Check your connection, or try another network. Nothing was sent to Netmend.";
        }
        statusEl.innerHTML = '<span class="bad">' + esc(m) + "</span>";
        paintRemain();
      }).then(function () {
        if (remaining() > 0) goEl.disabled = false;
      });
    });
  }

  paintKey();
  paintRemain();
})();
