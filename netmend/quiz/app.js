/* Netmend Quiz: source -> Gemini quiz JSON -> preview + exports (Forms Apps Script, print, CSV, Kahoot xlsx, Moodle GIFT). */
(function () {
  var $ = NM.$, FREE_MAX = 10, PRO_MAX = 50, tab = "text", quiz = null;
  NM.init({ tool: "quiz", freeLimit: 3, unit: "quizzes", freeText: "3 quizzes a day, up to 10 questions, Google Forms, CSV and print.", proText: "Unlimited quizzes, up to 50 questions, Kahoot and Moodle exports, no branding. Pay once.", onLicense: paint });
  document.querySelectorAll(".nm-tabs button").forEach(function (b) {
    b.onclick = function () {
      tab = b.getAttribute("data-tab");
      document.querySelectorAll(".nm-tabs button").forEach(function (x) { x.classList.toggle("on", x === b); });
      document.querySelectorAll(".nm-pane").forEach(function (p) { p.hidden = p.getAttribute("data-pane") !== tab; });
    };
  });
  function paint() {
    Array.prototype.forEach.call($("count").options, function (o) { var lock = !NM.isPro() && Number(o.value) > FREE_MAX; o.disabled = lock; o.textContent = o.value + (lock ? " (Pro)" : ""); });
    if (!NM.isPro() && Number($("count").value) > FREE_MAX) $("count").value = String(FREE_MAX);
  }
  paint();
  function prompt(src) {
    var n = $("count").value, ty = $("types").value;
    var types = ty === "mcq" ? "multiple choice only (4 options)" : ty === "tf" ? "true/false only" : "mostly multiple choice (4 options) with about a quarter true/false";
    return "Create a " + $("level").value + " quiz of exactly " + n + " questions, " + types + ", in " + $("lang").value + ", testing the SOURCE. " +
      "Questions must be answerable from the source (for a bare topic, use well-established facts). One correct option per question; wrong options plausible; no 'all of the above'. Options max 75 characters, questions max 120 characters when possible.\n" +
      'Return JSON only: {"title":"quiz title","questions":[{"type":"mcq","question":"","options":["","","",""],"answer":0,"explanation":"one sentence why"}]}. ' +
      'For true/false use "type":"tf","options":["True","False"]. "answer" is the 0-based index of the correct option.\n\nSOURCE: ' + src;
  }
  function source(cb) {
    if (tab === "text") { var s = ($("srctext").value || "").trim(); if (s.length < 40) return cb("Paste at least a few sentences."); return cb(null, { parts: [{ text: prompt("the text below.\n\n" + s.slice(0, 200000)) }] }); }
    if (tab === "topic") { var t = ($("topic").value || "").trim(); if (!t) return cb("Type a topic."); return cb(null, { parts: [{ text: prompt("the topic: " + t) }] }); }
    if (tab === "pdf") { var f = $("pdf").files[0]; if (!f) return cb("Choose a PDF."); if (f.size > 19 * 1024 * 1024) return cb("PDF over 19 MB."); return NM.fileToPart(f).then(function (p) { p.inlineData.mimeType = "application/pdf"; cb(null, { parts: [p, { text: prompt("the attached PDF.") }] }); }); }
    var u = ($("url").value || "").trim(); if (!/^https?:\/\//i.test(u)) return cb("Paste a full URL starting with https://");
    cb(null, { parts: [{ text: prompt("the public web page " + u + " (read it with the URL tool).") }], tools: [{ url_context: {} }] });
  }
  function clean(d) {
    var qs = (d.questions || []).filter(function (q) { return q && q.question && Array.isArray(q.options) && q.options.length >= 2; }).map(function (q) {
      var a = Number(q.answer); if (!(a >= 0 && a < q.options.length)) a = 0;
      return { type: q.options.length === 2 ? "tf" : "mcq", question: String(q.question), options: q.options.map(String), answer: a, explanation: String(q.explanation || "") };
    });
    return { title: String(d.title || "Quiz"), questions: qs.slice(0, NM.isPro() ? PRO_MAX : FREE_MAX) };
  }
  function render() {
    var L = "ABCDEFGH", h = "<h2>" + NM.esc(quiz.title) + "</h2><p class=\"note\">Name: ____________________ &nbsp; Date: __________</p>";
    quiz.questions.forEach(function (q, i) {
      h += '<div class="nm-q"><b>' + (i + 1) + ". " + NM.esc(q.question) + "</b><ol type=\"A\">" + q.options.map(function (o, j) { return '<li class="' + (j === q.answer ? "right" : "") + '">' + NM.esc(o) + "</li>"; }).join("") + "</ol>" +
        '<div class="ex noprint">Answer: ' + L[q.answer] + ". " + NM.esc(q.explanation) + "</div></div>";
    });
    h += '<div style="page-break-before:always"></div><h3>Answer key</h3><p>' + quiz.questions.map(function (q, i) { return (i + 1) + ". " + L[q.answer]; }).join(" &nbsp; ") + "</p>";
    if (!NM.isPro()) h += '<p class="note">Made with Netmend Quiz · netmend.app/quiz</p>';
    $("out").innerHTML = h; $("quiz-sec").hidden = false; $("exports").hidden = false;
  }
  function js(s) { return JSON.stringify(String(s)); }
  function formsScript() {
    var o = "// Netmend Quiz -> Google Forms. Paste into script.google.com and click Run.\nfunction createNetmendQuiz() {\n" +
      "  var form = FormApp.create(" + js(quiz.title) + ");\n  form.setIsQuiz(true);\n" +
      "  form.setDescription(" + js(NM.isPro() ? "" : "Made with Netmend Quiz (netmend.app/quiz)") + ");\n" +
      "  var q = " + JSON.stringify(quiz.questions) + ";\n" +
      "  q.forEach(function (x) {\n    var it = form.addMultipleChoiceItem();\n    it.setTitle(x.question).setPoints(1).setRequired(true)\n" +
      "      .setChoices(x.options.map(function (o, i) { return it.createChoice(o, i === x.answer); }));\n" +
      "    if (x.explanation) {\n      it.setFeedbackForCorrect(FormApp.createFeedback().setText(x.explanation).build());\n      it.setFeedbackForIncorrect(FormApp.createFeedback().setText(x.explanation).build());\n    }\n  });\n" +
      "  Logger.log('Edit: ' + form.getEditUrl());\n  Logger.log('Share with students: ' + form.getPublishedUrl());\n}\n";
    return o;
  }
  function csvCell(s) { s = String(s); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }
  function toCsv() {
    var rows = [["#", "Type", "Question", "Option A", "Option B", "Option C", "Option D", "Correct (letter)", "Correct (text)", "Explanation"]];
    quiz.questions.forEach(function (q, i) { var o = q.options.concat(["", "", "", ""]).slice(0, 4); rows.push([i + 1, q.type, q.question].concat(o, ["ABCD"[q.answer], q.options[q.answer], q.explanation])); });
    return rows.map(function (r) { return r.map(csvCell).join(","); }).join("\r\n");
  }
  function giftEsc(s) { return String(s).replace(/([~=#{}:\\])/g, "\\$1"); }
  function toGift() {
    return quiz.questions.map(function (q, i) {
      if (q.type === "tf") return "::Q" + (i + 1) + ":: " + giftEsc(q.question) + " {" + (q.answer === 0 ? "TRUE" : "FALSE") + (q.explanation ? "#" + giftEsc(q.explanation) : "") + "}";
      return "::Q" + (i + 1) + ":: " + giftEsc(q.question) + " {\n" + q.options.map(function (o, j) { return "  " + (j === q.answer ? "=" : "~") + giftEsc(o) + (j === q.answer && q.explanation ? "#" + giftEsc(q.explanation) : ""); }).join("\n") + "\n}";
    }).join("\n\n") + "\n";
  }
  function xmlEsc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function col(n) { var s = ""; n++; while (n) { var m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; }
  function xlsx(rows) {
    var z = new JSZip();
    z.file("[Content_Types].xml", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>');
    z.file("_rels/.rels", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>');
    z.file("xl/workbook.xml", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Sheet1" sheetId="1" r:id="rId1"/></sheets></workbook>');
    z.file("xl/_rels/workbook.xml.rels", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>');
    var sd = rows.map(function (r, i) {
      return '<row r="' + (i + 1) + '">' + r.map(function (v, j) {
        var ref = col(j) + (i + 1);
        return typeof v === "number" ? '<c r="' + ref + '"><v>' + v + "</v></c>" : '<c r="' + ref + '" t="inlineStr"><is><t xml:space="preserve">' + xmlEsc(v) + "</t></is></c>";
      }).join("") + "</row>";
    }).join("");
    z.file("xl/worksheets/sheet1.xml", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>' + sd + "</sheetData></worksheet>");
    return z.generateAsync({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  }
  function kahootRows() {
    var rows = [["Question - max 120 characters", "Answer 1 - max 75 characters", "Answer 2 - max 75 characters", "Answer 3 - max 75 characters", "Answer 4 - max 75 characters", "Time limit (sec) - 5, 10, 20, 30, 60, 90, 120, or 240 secs", "Correct answer(s) - choose at least one"]];
    quiz.questions.forEach(function (q) { var o = q.options.concat(["", "", "", ""]).slice(0, 4); rows.push([q.question.slice(0, 120)].concat(o.map(function (x) { return x.slice(0, 75); }), [20, q.answer + 1])); });
    return rows;
  }
  $("go").onclick = function () {
    if (!NM.getKey()) return NM.status("status", NM.friendlyError("NOKEY"), "bad");
    if (!NM.canUse()) return NM.status("status", NM.limitMsg(), "bad");
    NM.status("status", "Preparing your source…");
    source(function (err, req) {
      if (err) return NM.status("status", NM.esc(err), "bad");
      req.json = true; req.temperature = 0.4; req.onModel = function (m) { NM.status("status", "Writing questions with " + m + "…"); };
      $("go").disabled = true;
      NM.gemini(req).then(function (d) {
        var c = clean(d || {}); if (!c.questions.length) throw new Error("No questions came back. Try again with more material.");
        quiz = c; NM.consume(); render(); NM.status("status", "Done: " + c.questions.length + " questions. Review them, then export.", "ok");
      }).catch(function (e) { NM.status("status", NM.esc(NM.friendlyError(e)), "bad"); }).then(function () { $("go").disabled = false; });
    });
  };
  $("x-forms").onclick = function () { var s = formsScript(); $("forms-code").textContent = s; $("forms-help").hidden = false; NM.copy(s, this); };
  $("x-print").onclick = function () { window.print(); };
  $("x-csv").onclick = function () { NM.download(new Blob(["\ufeff" + toCsv()], { type: "text/csv" }), NM.slug(quiz.title) + ".csv"); };
  $("x-gift").onclick = function () { if (!NM.isPro()) return NM.status("status", "Moodle GIFT export is part of Pro.", "bad"); NM.download(new Blob([toGift()], { type: "text/plain" }), NM.slug(quiz.title) + ".gift.txt"); };
  $("x-kahoot").onclick = function () { if (!NM.isPro()) return NM.status("status", "Kahoot export is part of Pro. Free: Google Forms, CSV, print.", "bad"); xlsx(kahootRows()).then(function (b) { NM.download(b, NM.slug(quiz.title) + "-kahoot.xlsx"); }); };
  window.__nmQuiz = { get: function () { return quiz; }, forms: formsScript, csv: toCsv, gift: toGift, kahoot: function () { return xlsx(kahootRows()); } };
})();
