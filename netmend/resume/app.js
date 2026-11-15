/* Netmend Resume: local ATS keyword check + Gemini tailoring. No server. */
(function () {
  var $ = NM.$, last = null;
  NM.init({ tool: "resume", freeLimit: 1, unit: "tailored CVs", freeText: "Unlimited ATS keyword checks. 1 AI-tailored CV a day as a PDF.", proText: "Unlimited tailored CVs, cover letters, Modern template, Word export, no Netmend line. Pay once." });
  var STOP = ("a an and or the of to in on for with at by from as is are be will you your our we they this that it its their who what which our us able ability must should can may including include etc per about run own plan build lead drive help make get ensure eu remote hybrid full time part day days week weeks month plus nice have has had do does across within into over under more most other than such any all each both also new work working team role job position candidate company years year experience strong good great excellent plus based using use well looking join responsibilities requirements required preferred skills knowledge understanding de da do das dos e em para com por um uma os as o a que na no se ao sua seu experiência el la los las y en con para por una del al es son le les et des du pour avec dans sur une der die das und mit für von zu im den ein eine").split(" ");
  var STOPSET = {}; STOP.forEach(function (w) { STOPSET[w] = 1; });
  function norm(s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }
  function words(s) { return norm(s).replace(/[^a-z0-9+#./ -]/g, " ").split(/\s+/).map(function (w) { return w.replace(/^[./-]+|[./-]+$/g, ""); }).filter(function (w) { return w.length > 1 && !STOPSET[w] && !/^\d+$/.test(w); }); }
  function keywords(job) {
    var freq = {}, proper = {};
    String(job).split(/[\n,.;:()\u2022|\/!?]+|\s[-\u2013\u2014]\s/).forEach(function (seg) {
      var raw = seg.trim().split(/\s+/).filter(Boolean);
      var ws = [];
      raw.forEach(function (t, i) {
        var w = words(t)[0]; if (!w) { ws.push(null); return; }
        ws.push(w); freq[w] = (freq[w] || 0) + 1;
        if (i > 0 && /^[A-Z0-9]/.test(t)) proper[w] = 1;
        if (/^[A-Z0-9]{2,6}$/.test(t.replace(/[^A-Za-z0-9]/g, ""))) proper[w] = 1;
      });
      for (var i = 0; i < ws.length - 1; i++) {
        if (!ws[i] || !ws[i + 1]) continue;
        var bg = ws[i] + " " + ws[i + 1]; freq[bg] = (freq[bg] || 0) + 1;
        if (/^[A-Z]/.test(raw[i]) && /^[A-Z0-9]/.test(raw[i + 1])) proper[bg] = 1;
      }
    });
    var list = Object.keys(freq).filter(function (k) {
      var two = k.indexOf(" ") > 0;
      if (two) return proper[k] || freq[k] >= 2;
      return proper[k] || freq[k] >= 2 || /[+#]|\.js$|sql|api|excel|crm|seo/.test(k);
    });
    function score(k) { return freq[k] * (k.indexOf(" ") > 0 ? 2.2 : 1) + (proper[k] ? 1.5 : 0); }
    list.sort(function (x, y) { return score(y) - score(x); });
    var out = [];
    list.forEach(function (k) {
      if (out.length >= 30) return;
      if (/^\d/.test(k)) return;
      if (k.indexOf(" ") < 0 && out.some(function (o) { return o.split(" ").indexOf(k) >= 0; })) return;
      out.push(k);
    });
    return out;
  }
  function ats() {
    var cv = $("cvtext").value, job = $("jobtext").value;
    if (cv.trim().length < 80 || job.trim().length < 80) { NM.status("status", "Paste your CV and the job ad first (a few lines each at least).", "bad"); return null; }
    var cvn = " " + words(cv).join(" ") + " ";
    var ks = keywords(job), hit = [], miss = [];
    ks.forEach(function (k) { (cvn.indexOf(" " + k + " ") >= 0 ? hit : miss).push(k); });
    var score = ks.length ? Math.round(100 * hit.length / ks.length) : 0;
    var verdict = score >= 70 ? "Strong match" : score >= 45 ? "Partial match: add the missing words you really have" : "Weak match: tailor before you apply";
    $("atsout").innerHTML = '<div class="card"><div class="ats"><div class="big">' + score + '%</div><div><b>ATS keyword match</b><p class="note">' + verdict + ". Checked " + ks.length + " key terms from the ad, in this browser only.</p></div></div>" +
      '<p class="note" style="margin-top:10px">In your CV</p><div class="chips">' + hit.map(function (k) { return '<span class="hit">' + NM.esc(k) + "</span>"; }).join("") + "</div>" +
      '<p class="note">Missing (add only if true for you)</p><div class="chips">' + miss.map(function (k) { return '<span class="miss">' + NM.esc(k) + "</span>"; }).join("") + "</div></div>";
    $("atsout").hidden = false;
    return { score: score, miss: miss, hit: hit };
  }
  $("check").onclick = function () { if (ats()) NM.status("status", ""); };
  $("cvfile").onchange = function () {
    var f = this.files[0]; if (!f) return;
    if (/pdf$/i.test(f.type) || /\.pdf$/i.test(f.name)) {
      NM.status("status", "Reading the PDF in your browser…");
      f.arrayBuffer().then(function (buf) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js";
        return pdfjsLib.getDocument({ data: buf }).promise;
      }).then(function (pdf) {
        var ps = []; for (var i = 1; i <= Math.min(pdf.numPages, 6); i++) ps.push(pdf.getPage(i).then(function (p) { return p.getTextContent(); }).then(function (tc) {
          var out = "", y = null; tc.items.forEach(function (it) { var ny = it.transform[5]; if (y !== null && Math.abs(ny - y) > 2) out += "\n"; else if (out) out += " "; out += it.str; y = ny; }); return out;
        }));
        return Promise.all(ps);
      }).then(function (pages) { $("cvtext").value = pages.join("\n\n").replace(/[ \t]+\n/g, "\n"); NM.status("status", "CV loaded. If it is a scanned image PDF, paste the text instead.", "ok"); })
        .catch(function () { NM.status("status", "Could not read that PDF. Paste the text instead.", "bad"); });
    } else NM.readText(f).then(function (t) { $("cvtext").value = t; });
  };
  $("sample").onclick = function () {
    $("cvtext").value = "Alex Morgan\nMarketing Coordinator · alex.morgan@example.com · Lisbon, Portugal\n\nSUMMARY\nMarketing coordinator with 4 years in B2B software. I run newsletters, social media and small paid campaigns.\n\nEXPERIENCE\nMarketing Coordinator, Brightdesk (B2B SaaS) — 2022–present\n- Ran the monthly newsletter to 18,000 subscribers; open rate up from 24% to 31%\n- Managed LinkedIn and X accounts, planned content calendar\n- Set up Google Ads campaigns with a 2,000 EUR monthly budget\n- Wrote landing pages with the product team\n\nMarketing Assistant, Casa Verde Hotels — 2020–2022\n- Coordinated events and trade fairs\n- Updated the website in WordPress\n\nEDUCATION\nBA Communication, Universidade Nova de Lisboa, 2020\n\nSKILLS\nMailchimp, WordPress, Google Ads, Canva, Excel, English (C1), Portuguese (native)";
    $("jobtext").value = "Growth Marketing Manager (remote, EU)\nWe are a B2B SaaS company looking for a Growth Marketing Manager to own demand generation.\nResponsibilities:\n- Own email marketing and lifecycle automation in HubSpot\n- Plan and optimise paid acquisition on Google Ads and LinkedIn Ads\n- Run A/B tests on landing pages and report on conversion rate\n- Build dashboards in Google Analytics 4 and Looker Studio\n- Work with sales on lead scoring and MQL to SQL conversion\nRequirements:\n- 3+ years in B2B SaaS marketing\n- Hands-on with HubSpot, Google Ads, LinkedIn Ads, GA4\n- Strong copywriting in English; Portuguese or Spanish is a plus\n- Data-driven, comfortable with Excel and SEO basics";
    ats();
  };
  function list(a) { return (a || []).filter(Boolean); }
  function render(d) {
    var e = NM.esc, tpl = NM.isPro() ? $("tpl").value : "classic";
    var h = '<div class="cv ' + tpl + '"><h1>' + e(d.name) + "</h1>" + (d.headline ? '<p class="hl">' + e(d.headline) + "</p>" : "") + (d.contact ? '<p class="ct">' + e(d.contact) + "</p>" : "") +
      (d.summary ? "<h2>" + e(d.labels && d.labels.summary || "Summary") + "</h2><p>" + e(d.summary) + "</p>" : "") +
      (list(d.skills).length ? "<h2>" + e(d.labels && d.labels.skills || "Skills") + "</h2><p>" + list(d.skills).map(e).join(" · ") + "</p>" : "") +
      (list(d.experience).length ? "<h2>" + e(d.labels && d.labels.experience || "Experience") + "</h2>" + d.experience.map(function (x) {
        return '<div class="job"><div>' + e(x.title) + (x.company ? ", " + e(x.company) : "") + "</div><span>" + e(x.dates || "") + "</span></div><ul>" + list(x.bullets).map(function (b) { return "<li>" + e(b) + "</li>"; }).join("") + "</ul>";
      }).join("") : "") +
      (list(d.education).length ? "<h2>" + e(d.labels && d.labels.education || "Education") + "</h2>" + d.education.map(function (x) { return "<p>" + e(x) + "</p>"; }).join("") : "") +
      (list(d.extras).length ? "<h2>" + e(d.labels && d.labels.extras || "Other") + "</h2>" + d.extras.map(function (x) { return "<p>" + e(x) + "</p>"; }).join("") : "") +
      (NM.isPro() ? "" : '<p style="color:#999;font-size:10px;margin-top:24px">Tailored with Netmend Resume</p>') + "</div>";
    $("cvout").innerHTML = h;
    $("letterout").innerHTML = d.cover_letter ? '<div class="cv" style="margin-top:24px;page-break-before:always"><div class="letter">' + e(d.cover_letter) + "</div></div>" : "";
    $("cvsec").hidden = false; $("actions").hidden = false;
    $("changes").innerHTML = list(d.changes).length ? '<div class="card" style="margin-top:12px"><b>What changed (check each one)</b><ul>' + d.changes.map(function (c) { return "<li>" + e(c) + "</li>"; }).join("") + "</ul></div>" : "";
    $("changes").hidden = !list(d.changes).length;
  }
  function asText(d) {
    var t = [d.name, d.headline, d.contact, "", (d.summary || ""), "", "SKILLS", list(d.skills).join(", "), "", "EXPERIENCE"];
    list(d.experience).forEach(function (x) { t.push(x.title + (x.company ? ", " + x.company : "") + (x.dates ? " (" + x.dates + ")" : "")); list(x.bullets).forEach(function (b) { t.push("- " + b); }); t.push(""); });
    t.push("EDUCATION"); t = t.concat(list(d.education)); if (list(d.extras).length) { t.push("", "OTHER"); t = t.concat(d.extras); }
    if (d.cover_letter) t.push("", "COVER LETTER", d.cover_letter);
    return t.filter(function (x) { return x != null; }).join("\n");
  }
  $("go").onclick = function () {
    var a = ats(); if (!a) return;
    if (!NM.getKey()) return NM.status("status", NM.friendlyError("NOKEY"), "bad");
    if (!NM.canUse()) return NM.status("status", NM.limitMsg(), "bad");
    var wantLetter = $("letter").checked;
    if (wantLetter && !NM.isPro()) return NM.status("status", "Cover letters are part of Pro. Untick the box or unlock Pro below.", "bad");
    if ($("tpl").value === "modern" && !NM.isPro()) NM.status("status", "Modern template is Pro; using Classic.");
    var lang = $("lang").value;
    var sys = "You are an expert CV writer and ATS specialist. Rewrite the candidate's CV for the job ad. HARD RULES: never invent employers, job titles, dates, degrees, certifications, tools, numbers or achievements that are not in the CV. You may reorder, rephrase, merge, cut and use the ad's wording for things the CV already shows. If a missing keyword is not supported by the CV, do not add it; mention it in changes as a gap. Keep contact details exactly as in the CV (do not add any). Bullets start with a strong verb, max 2 lines, keep real numbers. One page if possible." +
      " Language: " + (lang === "Same as the job ad" ? "the language of the job ad" : lang) + "." +
      " Return JSON only: {\"name\":\"\",\"headline\":\"target title line\",\"contact\":\"contact line copied from CV\",\"summary\":\"3 lines\",\"skills\":[\"...\"],\"experience\":[{\"title\":\"\",\"company\":\"\",\"dates\":\"\",\"bullets\":[\"...\"]}],\"education\":[\"one line each\"],\"extras\":[\"languages, certifications... only if in CV\"],\"labels\":{\"summary\":\"\",\"skills\":\"\",\"experience\":\"\",\"education\":\"\",\"extras\":\"\"},\"changes\":[\"what you changed and gaps you did NOT fill\"]" + (wantLetter ? ",\"cover_letter\":\"a 200-260 word cover letter with greeting and sign-off using only facts from the CV\"" : "") + "}";
    var prompt = "JOB AD:\n" + $("jobtext").value.slice(0, 12000) + "\n\nCV:\n" + $("cvtext").value.slice(0, 15000) + "\n\nKeywords the ad uses that the CV lacks (add only if the CV supports them): " + a.miss.join(", ");
    $("go").disabled = true; NM.status("status", "Tailoring your CV… (10–30 seconds)");
    NM.gemini({ prompt: prompt, system: sys, json: true, temperature: 0.3, models: ["gemini-3.5-flash", "gemini-flash-latest", "gemini-2.5-flash", "gemini-3.5-flash-lite", "gemini-flash-lite-latest"] }).then(function (d) {
      NM.consume(); last = d; render(d);
      NM.status("status", "Done. Read every line, then download the PDF.", "ok");
      $("cvsec").scrollIntoView({ behavior: "smooth" });
    }).catch(function (e) { NM.status("status", NM.esc(NM.friendlyError(e)), "bad"); }).then(function () { $("go").disabled = false; });
  };
  $("pdf").onclick = function () { var t = document.title; document.title = NM.slug((last && last.name || "cv") + " cv"); window.print(); setTimeout(function () { document.title = t; }, 500); };
  $("copytxt").onclick = function () { if (last) NM.copy(asText(last), this); };
  $("doc").onclick = function () {
    if (!NM.isPro()) return NM.status("status", "Word export is part of Pro.", "bad");
    var html = '<html><head><meta charset="utf-8"></head><body style="font-family:Calibri,Arial,sans-serif">' + $("cvout").innerHTML + $("letterout").innerHTML + "</body></html>";
    NM.download(new Blob([html], { type: "application/msword" }), NM.slug((last && last.name || "cv") + " cv") + ".doc");
  };
})();
