/* Netmend X Reach Checker. Local checks run in this browser with no key.
   Gemini analysis uses the visitor's key, stored only in localStorage. */
(function (root) {
  var KEY_LS = "netmend-xrc-gemini-key";
  var KEY_FALLBACK = "netmend-xpw-gemini-key";
  var USE_LS = "netmend-xrc-usage";
  var DAILY_LIMIT = 3;
  var MODELS = [
    "gemini-3.5-flash-lite",
    "gemini-3.8-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash"
  ];

  var FILLERS = [
    /^\s*so[,.\s]+/i,
    /^\s*just\s+(wanted|a\s+quick|sharing|posted|dropping)/i,
    /^\s*i\s+(just\s+)?(wanted\s+to\s+(share|post|say)|thought\s+i(?:'d| would))/i,
    /^\s*quick\s+(post|update|thread|share)/i,
    /^\s*(?:a\s+)?thread\s*(?:on|about|:)/i,
    /^\s*let\s+me\s+(share|tell|introduce)/i,
    /^\s*(?:i(?:'m| am)|we(?:'re| are))\s+(excited|thrilled|happy)\s+to\s+(announce|share)/i,
    /^\s*happy\s+to\s+announce/i,
    /^\s*check\s+(this|out|my)\b/i,
    /^\s*i\s+just\s+(posted|published|dropped)\b/i
  ];

  var BAIT = [
    /\b(?:like|rt|retweet|repost|share|follow)\s+(?:if|and|for)\b/i,
    /\b(?:drop a|smash the|hit follow|link in (?:my )?bio)\b/i,
    /\b(?:comment\s+(?:yes|no|below|if)|say yes if)\b/i,
    /\bdm me\b/i,
    /\bagree\s*\?\s*$/i
  ];

  function countChars(s) {
    return Array.from(s || "").length;
  }

  function firstLine(text) {
    var t = String(text || "").replace(/^\s+/, "");
    if (!t) return "";
    var nl = t.split(/\n/)[0].trim();
    if (nl && (t.indexOf("\n") !== -1 || nl.length <= 200)) return nl;
    var sent = t.match(/^[\s\S]{1,200}?(?:[.!?…]|$)/);
    return (sent ? sent[0] : t.slice(0, 140)).trim();
  }

  function urlsOf(text) {
    var out = [];
    var re = /\bhttps?:\/\/[^\s<>)"']+/gi;
    var m;
    while ((m = re.exec(text))) out.push(m[0].replace(/[.,;:!?)]+$/, ""));
    re = /(?:^|\s)(www\.[^\s<>)"']+)/gi;
    while ((m = re.exec(text))) out.push(m[1].replace(/[.,;:!?)]+$/, ""));
    return out;
  }

  function hashtagsOf(text) {
    var out = [];
    var re = /(^|[\s(])#([^\s#]+)/g;
    var m;
    while ((m = re.exec(text))) out.push(m[2]);
    return out;
  }

  function mentionsOf(text) {
    var out = [];
    var re = /(^|[^a-zA-Z0-9_])@([a-zA-Z0-9_]{1,15})\b/g;
    var m;
    while ((m = re.exec(text))) out.push(m[2]);
    return out;
  }

  function countEmoji(s) {
    try {
      var m = String(s || "").match(/\p{Extended_Pictographic}/gu);
      return m ? m.length : 0;
    } catch (e) {
      return 0;
    }
  }

  function letterCaseRatio(s) {
    var letters = String(s || "").match(/[A-Za-zÀ-ÿ]/g) || [];
    if (letters.length < 20) return 0;
    var upper = letters.filter(function (ch) { return ch === ch.toUpperCase() && ch !== ch.toLowerCase(); }).length;
    return upper / letters.length;
  }

  function hourFromFields(when, zone) {
    if (!when) return null;
    var m = String(when).match(/T(\d{2})/);
    if (!m) return null;
    return { hour: Number(m[1]), zone: zone || "the timezone you chose" };
  }

  function analyze(text, opts) {
    opts = opts || {};
    var raw = String(text || "");
    var trimmed = raw.trim();
    var checks = [];
    var n = countChars(trimmed);
    var line = firstLine(trimmed);
    var urls = urlsOf(trimmed);
    var tags = hashtagsOf(trimmed);
    var ments = mentionsOf(trimmed);
    var emojis = countEmoji(trimmed);
    var hasBreak = /\n/.test(trimmed);

    function add(id, status, title, detail, weight) {
      checks.push({ id: id, status: status, title: title, detail: detail, weight: weight });
    }

    if (!trimmed) {
      add("length", "fail", "No text", "Paste the post you published, or a draft, before running the check.", 40);
    } else if (n < 40) {
      add("length", "warn", "Very short", "This is " + n + " characters. A short line can work if the hook is sharp, but there is little here for someone to reply to or share.", 8);
    } else if (n > 280 && n <= 600) {
      add("length", "warn", "Longer than 280 characters", "This is " + n + " characters. A standard account cannot post this as one tweet. On Premium, long posts can work, but a wall of text often loses people before the point.", 7);
    } else if (n > 600) {
      add("length", "fail", "Very long post", "This is " + n + " characters. Even where long posts are allowed, this is hard to finish. Cut it, or split it into a short hook plus a thread.", 14);
    } else {
      add("length", "pass", "Length is in a usable range", n + " characters, within the classic 280-character post. Length alone will not decide reach.", 0);
    }

    if (trimmed) {
      var startsUrl = /^(?:https?:\/\/|www\.)/i.test(line);
      var startsTag = /^#/.test(line);
      var startsAt = /^@/.test(line);
      var onlyEmoji = line && countEmoji(line) > 0 && countChars(line.replace(/\p{Extended_Pictographic}/gu, "").replace(/\s/g, "")) === 0;
      var fillerHit = FILLERS.some(function (re) { return re.test(line); });
      if (!line) {
        add("hook", "fail", "No first line", "The first line is empty. On X, that line is the post: if it does not stand alone, most people never read the rest.", 16);
      } else if (startsUrl) {
        add("hook", "fail", "The first line is a link", "Opening with a URL gives people nothing to read before they are sent away. Put the point first and leave the link for a reply.", 16);
      } else if (startsTag) {
        add("hook", "fail", "The first line starts with a hashtag", "A hashtag is a weak opening. Lead with a sentence a stranger can understand.", 14);
      } else if (startsAt) {
        add("hook", "warn", "The first line starts with @", "Posts that begin with an @ are often treated as replies, which usually reach fewer people than a standalone post. Put the name later, or mention them in a reply.", 12);
      } else if (onlyEmoji) {
        add("hook", "fail", "The first line is only emoji", "There is no sentence for a stranger to hold onto. Write a first line that states the point.", 14);
      } else if (fillerHit) {
        add("hook", "fail", "The hook is throat-clearing", "The first line starts with filler (“just wanted to share”, “quick thread”, “check this out”). That line is the post. Say the actual point first.", 14);
      } else if (countChars(line) < 20) {
        add("hook", "warn", "The first line is very thin", "“" + line + "” is short and may not stand alone. A stranger should understand the topic from this line alone.", 7);
      } else if (!hasBreak && n > 200) {
        add("hook", "warn", "No break after the hook", "This is one block of text, so the first line never gets a chance to land on its own. Put a line break after the opening sentence.", 7);
      } else {
        add("hook", "pass", "The first line can stand alone", "The opening is a real sentence, not a link, a tag, or filler. That is the part most people will actually see.", 0);
      }
    }

    if (trimmed) {
      if (urls.length >= 2) {
        add("links", "fail", "More than one external link", "There are " + urls.length + " links in the post. Links in the main post often get less distribution than the same text with the link in a reply you write yourself.", 14);
      } else if (urls.length === 1) {
        add("links", "warn", "External link in the post", "There is a link in the main post (“" + urls[0] + "”). A common pattern that keeps more of the distribution: post the text, then add the link in your first reply.", 10);
      } else {
        add("links", "pass", "No external link in the post", "Nothing here sends the reader off X in the main post. If you need a link, it is usually safer in a reply.", 0);
      }
    }

    if (trimmed) {
      if (tags.length >= 3) {
        add("hashtags", "fail", "Too many hashtags", "There are " + tags.length + " hashtags. On X, a stack of tags often looks like spam and can hurt distribution. One is usually enough; zero is fine.", 12);
      } else if (tags.length === 2) {
        add("hashtags", "warn", "Two hashtags", "Two hashtags is already a lot for a single X post. If they are not doing real work, drop them.", 6);
      } else if (tags.length === 1) {
        add("hashtags", "pass", "At most one hashtag", "One hashtag, which is within a sensible range. Many posts do better with none.", 0);
      } else {
        add("hashtags", "pass", "No hashtags", "Fine. Hashtags are optional on X and are not required for reach.", 0);
      }
    }

    if (trimmed) {
      var issues = [];
      if (/\u2014/.test(trimmed)) issues.push("an em dash (—), which is a common AI tell and is worth replacing with a comma, a colon, or a full stop");
      if (letterCaseRatio(trimmed) >= 0.6) issues.push("a high share of capital letters, which reads as shouting");
      if (!hasBreak && n > 180 && n <= 280) issues.push("no line break in a long post, so it lands as a wall of text");
      if (/[!?]{3,}/.test(trimmed)) issues.push("repeated question or exclamation marks");
      if (emojis >= 5) issues.push(emojis + " emoji, which starts to look noisy rather than useful");
      if (issues.length >= 2) {
        add("formatting", "fail", "Formatting gets in the way", "This post has " + issues.join("; ") + ". Clean that up before you worry about anything else.", 12);
      } else if (issues.length === 1) {
        add("formatting", "warn", "Formatting issue", "This post has " + issues[0] + ".", 6);
      } else {
        add("formatting", "pass", "Formatting is clean", "No wall of text, no all-caps, no emoji pile, no repeated punctuation. The layout is not standing in the way.", 0);
      }
    }

    if (trimmed) {
      var baitHit = BAIT.some(function (re) { return re.test(trimmed); });
      var softAsk = /\b(?:what do you think|thoughts\s*\?|agree\s*\?)\s*$/i.test(trimmed);
      if (baitHit) {
        add("cta", "fail", "Engagement-bait CTA", "The text asks for likes, follows, comments on cue, or a “link in bio”. That kind of call to action is easy to recognise and often gets less distribution, not more.", 14);
      } else if (softAsk) {
        add("cta", "warn", "A generic closing question", "“What do you think?” and “Thoughts?” are overused closers. A specific question about a fact in the post is easier to answer.", 6);
      } else if (/\?/.test(trimmed)) {
        add("cta", "pass", "A real question is in the post", "There is a question in the text, and it is not a like-if-you-agree cue. That gives people something concrete to reply to.", 0);
      } else {
        add("cta", "warn", "Nothing obvious to reply to", "The post does not ask a real question and does not leave a clear point of disagreement. Reach is not only replies, but a post with no handle for a response is easier to scroll past.", 5);
      }
    }

    if (trimmed) {
      if (ments.length >= 6) {
        add("mentions", "fail", "A long list of mentions", "There are " + ments.length + " @mentions. A tag list is easy to ignore and can make the post look like a mass ping.", 12);
      } else if (ments.length >= 3) {
        add("mentions", "warn", "Several @mentions", "There are " + ments.length + " mentions. Mention people you are actually talking to, not a list you hope will share the post.", 6);
      } else if (/^@/.test(trimmed)) {
        add("mentions", "warn", "Starts as a mention", "Because the post starts with @, it may be treated as a reply, with a smaller audience than a standalone post.", 10);
      } else {
        add("mentions", "pass", "Mentions are under control", ments.length ? ("There " + (ments.length === 1 ? "is 1 mention" : "are " + ments.length + " mentions") + ", which is a reasonable number.") : "No @mentions, so this will not be read as a reply or a tag list.", 0);
      }
    }

    var when = hourFromFields(opts.when, opts.timezone);
    if (when) {
      var h = when.hour;
      var z = when.zone;
      if (h >= 0 && h < 6) {
        add("timing", "warn", "Posted in a quiet window", "You said this went out at " + String(h).padStart(2, "0") + ":00–" + String(h).padStart(2, "0") + ":59 in " + z + ". That is a quiet stretch for many audiences. This is not a prediction, and the exact weights are not public; it is only a reason to try a window when your replies usually arrive.", 7);
      } else if (h >= 22 || h < 8) {
        add("timing", "warn", "Posted at the edge of the day", "You said this went out around " + String(h).padStart(2, "0") + ":00 in " + z + ". Early morning and late night can be thin. If your usual replies come later, test that window next time.", 5);
      } else {
        add("timing", "pass", "Posted in a daytime window", "You said this went out around " + String(h).padStart(2, "0") + ":00 in " + z + ". That is inside an ordinary daytime span. Timing is only one factor, and it is not a guarantee of reach.", 0);
      }
    } else {
      add("timing", "warn", "No post time given", "Timing can matter because the first hour of replies is often used as a signal. Add an approximate time and timezone above if you want this check. We do not see your X analytics.", 0);
    }

    var media = opts.media || "unknown";
    if (media === "none") {
      add("media", "warn", "Text only", "You marked this as a text-only post. That can be fine. For a product, a screenshot, or a before/after, an image often helps the post stop the scroll. This tool cannot see media, so this is only what you told it.", 4);
    } else if (media === "image" || media === "video" || media === "poll") {
      add("media", "pass", "You added media", "You marked this post as having " + media + ". This tool only reads the text, so it cannot score the image, video or poll itself.", 0);
    } else {
      add("media", "pass", "Media not checked", "This tool only reads the text you paste. If the post had an image, a video or a poll, that is outside this checklist.", 0);
    }

    var score = 100;
    checks.forEach(function (c) {
      if (c.status === "fail") score -= (c.weight || 14);
      else if (c.status === "warn" && c.weight) score -= c.weight;
    });
    score = Math.max(0, Math.min(100, Math.round(score)));
    var band = score >= 80 ? "Solid" : score >= 55 ? "Mixed" : "Weak";
    var summary = band === "Solid"
      ? "The text does not show the usual reach problems. That is not a promise of impressions."
      : band === "Mixed"
        ? "The text has some of the usual reach problems. Fix the warnings below, then edit before you post again."
        : "The text has several of the usual reach problems. The items marked Fail are the ones to fix first.";

    return {
      score: score,
      band: band,
      summary: summary,
      chars: n,
      checks: checks,
      hook: line,
      urls: urls,
      hashtags: tags,
      mentions: ments
    };
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { analyze: analyze, countChars: countChars, firstLine: firstLine, urlsOf: urlsOf, hashtagsOf: hashtagsOf };
  }

  if (typeof document === "undefined") return;

  var keyEl = document.getElementById("api-key");
  var showEl = document.getElementById("toggle-key");
  var saveEl = document.getElementById("save-key");
  var clearEl = document.getElementById("clear-key");
  var keyStatus = document.getElementById("key-status");
  var postEl = document.getElementById("post");
  var whenEl = document.getElementById("when");
  var zoneEl = document.getElementById("timezone");
  var mediaEl = document.getElementById("media");
  var checkEl = document.getElementById("check");
  var rewriteEl = document.getElementById("rewrite");
  var statusEl = document.getElementById("status");
  var outEl = document.getElementById("out");
  var remainEl = document.getElementById("remain");

  var lastReport = null;

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
    var local = "Local checks are free and unlimited in this browser.";
    var ai = n === 1
      ? "1 free AI diagnosis and rewrite left today."
      : n + " free AI diagnoses and rewrites left today.";
    if (remainEl) remainEl.textContent = local + " " + ai;
    if (rewriteEl) rewriteEl.disabled = n <= 0;
  }
  function getKey() {
    return (localStorage.getItem(KEY_LS) || localStorage.getItem(KEY_FALLBACK) || "").trim();
  }
  function keySaved() {
    return !!getKey();
  }
  function paintKey() {
    if (!keyEl || !keyStatus) return;
    if (keySaved()) {
      keyEl.value = "";
      keyEl.placeholder = "Key saved in this browser (paste a new one to replace it)";
      var reused = !localStorage.getItem(KEY_LS) && localStorage.getItem(KEY_FALLBACK);
      keyStatus.innerHTML = reused
        ? '<span class="ok">API key reused from X Post Writer, on this device only.</span> It is never sent to Netmend. We have no server for this tool.'
        : '<span class="ok">API key saved on this device only.</span> It is never sent to Netmend. We have no server for this tool.';
    } else {
      keyEl.placeholder = "Paste your Gemini API key";
      keyStatus.textContent = "No key saved yet. You can still run the local checks. A free Gemini key from Google AI Studio is enough for the rewrite.";
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

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
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

  function collectOpts() {
    return {
      when: whenEl ? whenEl.value : "",
      timezone: zoneEl ? zoneEl.value : "",
      media: mediaEl ? mediaEl.value : "unknown"
    };
  }

  function meterSvg(score) {
    var r = 36;
    var c = 2 * Math.PI * r;
    var color = score >= 80 ? "#1b7a3d" : score >= 55 ? "#8a5a00" : "#b3261e";
    var dash = (score / 100) * c;
    return '<svg class="xrc-meter" viewBox="0 0 92 92" aria-hidden="true">' +
      '<circle cx="46" cy="46" r="' + r + '" fill="none" stroke="#e6e2d8" stroke-width="8"/>' +
      '<circle cx="46" cy="46" r="' + r + '" fill="none" stroke="' + color + '" stroke-width="8" ' +
      'stroke-linecap="round" transform="rotate(-90 46 46)" stroke-dasharray="' + dash.toFixed(1) + " " + c.toFixed(1) + '"/>' +
      "</svg>";
  }

  function renderLocal(report, extraHtml) {
    var html = '<div class="xrc-score">' + meterSvg(report.score) +
      '<div><div class="num">' + report.score + " / 100</div>" +
      '<div class="tagline">' + esc(report.band) + "</div>" +
      '<p class="lbl">' + esc(report.summary) + " This is a checklist of common problems in the text, not a prediction of impressions and not the official X algorithm.</p></div></div>";
    html += '<div class="xrc-checks">';
    report.checks.forEach(function (c) {
      var sev = c.status === "fail" ? "Fail" : c.status === "warn" ? "Check" : "Pass";
      html += '<article class="xrc-check"><span class="sev ' + c.status + '">' + sev + "</span><div><h3>" +
        esc(c.title) + "</h3><p>" + esc(c.detail) + "</p></div></article>";
    });
    html += "</div>";
    if (extraHtml) html += extraHtml;
    outEl.innerHTML = html;
  }

  function renderRewrites(data) {
    var items = (data && data.rewrites) || [];
    var html = "";
    if (data && data.summary) {
      html += '<p class="note">' + esc(data.summary) + "</p>";
    }
    if (data && data.notes) {
      html += '<p class="note">' + esc(data.notes) + "</p>";
    }
    html += '<div class="xpw-out xrc-rewrites">';
    items.forEach(function (it, idx) {
      var label = it.label || ("Rewrite " + (idx + 1));
      var text = it.text || "";
      html += '<article class="xpw-card"><header><span class="fmt">' + (idx + 1) + " · " + esc(label) +
        '</span></header><span class="chars">' + countChars(text) + " characters</span><pre>" + esc(text) +
        '</pre><div class="xpw-actions"><button type="button" class="btn ghost" data-copy="' + idx +
        '">Copy</button></div></article>';
    });
    html += "</div>";
    return { html: html, items: items };
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
      generationConfig: { temperature: 0.7, responseMimeType: "application/json" }
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
      statusEl.textContent = "Rewriting with " + model + "…";
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

  function buildPrompt(post, report, opts) {
    var findings = report.checks.map(function (c) {
      return "- [" + c.status + "] " + c.title + ": " + c.detail;
    }).join("\n");
    return [
      "You are a writing assistant that explains why an X (Twitter) post may have had weak reach, then rewrites it.",
      "Be honest: nobody outside X knows the exact ranking weights. Do not invent impression numbers, follower counts, or “this will go viral”. Do not claim official algorithm knowledge.",
      "Write in the same language as the original post. If the post is in English, write in English. Keep the author's facts; do not invent figures, testimonials, or results.",
      "No em dashes. At most one hashtag, and only if the original used hashtags usefully. Do not add a link unless the original had one, and if it did, prefer a version that moves the link out of the main post (mention that the link can go in a reply).",
      "Each rewrite must be at most 280 characters, unless the original was a long Premium post and the user clearly needed the length; even then prefer a tight version under 280 plus an optional second, slightly longer variant.",
      "Use the local checklist as a starting point, but you may add a short observation if it is clearly about the text (for example a buried lede).",
      "",
      "ORIGINAL POST:",
      post,
      "",
      "OPTIONAL CONTEXT:",
      "Post time: " + (opts.when || "not given") + " (" + (opts.timezone || "n/a") + ")",
      "Media as marked by the user: " + (opts.media || "unknown"),
      "Local checklist score: " + report.score + " / 100 (" + report.band + ")",
      "Local findings:",
      findings,
      "",
      "Return JSON only, with this shape:",
      '{"summary":"2-4 sentence diagnosis, honest about uncertainty","notes":"short list of what you changed and why","rewrites":[{"label":"short name of the approach","text":"full rewritten post"}]}',
      "Write exactly 3 rewrites, each with a different approach (for example: tighter hook, fact first, question first). Do not include hashtag stacks, engagement bait, or a sales close the author did not already use."
    ].join("\n");
  }

  function runLocal() {
    var post = (postEl.value || "").trim();
    if (!post) {
      statusEl.innerHTML = '<span class="bad">Paste the post first.</span>';
      postEl.focus();
      lastReport = null;
      outEl.innerHTML = "";
      return null;
    }
    var opts = collectOpts();
    var report = analyze(post, opts);
    lastReport = { post: post, opts: opts, report: report };
    renderLocal(report);
    statusEl.innerHTML = '<span class="ok">Local check done.</span> ' + report.chars + " characters. The AI rewrite is optional and uses your Gemini key.";
    return lastReport;
  }

  if (checkEl) {
    checkEl.addEventListener("click", function () {
      runLocal();
    });
  }

  if (rewriteEl) {
    rewriteEl.addEventListener("click", function () {
      var ctx = runLocal();
      if (!ctx) return;
      var key = getKey();
      if (!key) {
        statusEl.innerHTML = '<span class="bad">Save a Gemini API key first to get the diagnosis and rewrite. The local checklist above does not need a key.</span>';
        document.getElementById("setup").scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      if (remaining() <= 0) {
        statusEl.innerHTML = '<span class="bad">You have used the 3 free AI rewrites for today in this browser. Local checks stay unlimited. Come back tomorrow, or reserve the founding lifetime licence below.</span>';
        paintRemain();
        return;
      }
      rewriteEl.disabled = true;
      if (checkEl) checkEl.disabled = true;
      statusEl.textContent = "Asking Gemini for a diagnosis and rewrite…";
      var prompt = buildPrompt(ctx.post, ctx.report, ctx.opts);
      generateWithFallback(key, prompt).then(function (data) {
        if (!data || !data.rewrites || !data.rewrites.length) throw new Error("The model returned no rewrites. Try again.");
        var u = usage();
        u.count += 1;
        setUsage(u);
        paintRemain();
        var block = renderRewrites(data);
        renderLocal(ctx.report, block.html);
        outEl.querySelectorAll("[data-copy]").forEach(function (btn) {
          btn.addEventListener("click", function () {
            var i = Number(btn.getAttribute("data-copy"));
            var it = block.items[i];
            copyText((it && it.text) || "", btn);
          });
        });
        statusEl.innerHTML = '<span class="ok">Done.</span> Read the diagnosis and edit a rewrite before you post it. The model can still be wrong.';
      }).catch(function (err) {
        var m = String(err.message || err);
        if (/API key|api key|invalid|PERMISSION|401|403/i.test(m)) {
          m = "Google rejected the API key. Check that you copied the whole key from aistudio.google.com, and that the free Gemini API is enabled on that key.";
        } else if (/quota|resource exhausted|429/i.test(m)) {
          m = "Google's free quota for this key is used up for now. Wait and try again, or create a new key in AI Studio. The local checklist is still available.";
        } else if (/Failed to fetch|NetworkError|CORS/i.test(m)) {
          m = "The browser could not reach Google's Gemini API. Check your connection, or try another network. Nothing was sent to Netmend.";
        }
        statusEl.innerHTML = '<span class="bad">' + esc(m) + "</span>";
        paintRemain();
      }).then(function () {
        if (checkEl) checkEl.disabled = false;
        if (remaining() > 0) rewriteEl.disabled = false;
      });
    });
  }

  paintKey();
  paintRemain();

  root.NetmendReach = { analyze: analyze, countChars: countChars };
})(typeof window !== "undefined" ? window : this);
