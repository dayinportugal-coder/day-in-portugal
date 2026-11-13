/* Douro Day Planner — vanilla JS, works offline (see sw.js). Data: planner-data.js */
(function () {
  "use strict";
  var D = window.DDP_DATA;
  if (!D) return;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var KEY_SAVED = "ddp-saved-v1", KEY_LAST = "ddp-last-v1";
  var GYG = "partner_id=QYSYONP&utm_medium=online_publisher&cmp=douro-planner";

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function gyg(u) { return u + (u.indexOf("?") >= 0 ? "&" : "?") + GYG; }
  function eur(n) { var r = Math.round(n * 100) / 100; return "€" + (r % 1 ? r.toFixed(2) : String(r)); }
  function iso(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function parse(s) { var p = String(s || "").split("-"); var d = new Date(+p[0], +p[1] - 1, +p[2]); return isNaN(d) ? null : d; }
  function nice(d) { return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }); }
  function short(d) { return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }); }
  function mins(a, b) { var x = a.split(":"), y = b.split(":"); return (+y[0] * 60 + +y[1]) - (+x[0] * 60 + +x[1]); }
  function dur(m) { var h = Math.floor(m / 60), r = m % 60; return h + " h" + (r ? " " + String(r).padStart(2, "0") : ""); }
  function link(href, text, cls, sponsored) {
    return '<a ' + (cls ? 'class="' + cls + '" ' : "") + 'href="' + esc(href) + '" target="_blank" rel="' + (sponsored ? "sponsored nofollow noopener" : "noopener") + '">' + text + "</a>";
  }
  function src(key) { var s = D.sources[key]; return link(s.url, esc(s.label)); }
  var checked = parse(D.checked);
  var checkedTxt = checked.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  /* ---------- state ---------- */
  var today = new Date(); today.setHours(0, 0, 0, 0);
  var tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  var state = { d: iso(tomorrow), n: 2, p: "wine" };
  try { var last = JSON.parse(localStorage.getItem(KEY_LAST) || "null"); if (last) state = Object.assign(state, last); } catch (e) {}
  var qs = new URLSearchParams(location.search);
  if (qs.get("d")) state.d = qs.get("d");
  if (qs.get("n")) state.n = +qs.get("n");
  if (qs.get("p")) state.p = qs.get("p") === "scenery" ? "scenery" : "wine";
  if (!parse(state.d) || parse(state.d) < today) state.d = iso(tomorrow);
  state.n = Math.min(12, Math.max(1, state.n | 0 || 2));

  var fDate = $("#ddp-date"), fOut = $("#ddp-people"), app = $("#ddp-results");
  fDate.min = iso(today);
  fDate.value = state.d;
  fOut.value = state.n;
  var pr = document.querySelector('input[name="ddp-pref"][value="' + state.p + '"]'); if (pr) pr.checked = true;

  function persist() {
    try { localStorage.setItem(KEY_LAST, JSON.stringify(state)); } catch (e) {}
    var u = new URL(location.href); u.searchParams.set("d", state.d); u.searchParams.set("n", state.n); u.searchParams.set("p", state.p);
    history.replaceState(null, "", u.pathname + u.search + u.hash);
  }

  /* ---------- logic ---------- */
  function phase(d) {
    var s = iso(d);
    if (s < D.closure.from) return "before";
    if (s <= D.closure.to) return "closure";
    return "after";
  }
  function specialDay(d) { var md = iso(d).slice(5); return ["12-24", "12-25", "12-31", "01-01"].indexOf(md) >= 0; }
  function best(n, p) { if (p === "wine") return "tour"; return n >= 3 ? "car" : "train"; }

  function placeStatus(pl, d) {
    var md = iso(d).slice(5), m = d.getMonth() + 1, r = pl.rule;
    if ((r.closed || []).indexOf(md) >= 0) return { open: false, text: "Closed on this date" };
    if (r.all) return { open: true, text: r.all.text };
    if (r.winter && r.winter.months.indexOf(m) >= 0) return { open: true, text: r.winter.text };
    if (r.summer && r.summer.months.indexOf(m) >= 0) return { open: true, text: r.summer.text };
    return { open: true, text: "See the official page" };
  }

  function tl(legs) {
    return '<ol class="ddp-tl">' + legs.map(function (l) {
      return '<li class="' + l.mode + '"><span class="t">' + l.dep + "</span> " + esc(l.from) + " → <span class=\"t\">" + l.arr + "</span> " + esc(l.to) +
        "<small>" + (l.mode === "bus" ? "🚌 " : "🚆 ") + esc(l.note) + "</small></li>";
    }).join("") + "</ol>";
  }

  function trainCard(d, n, isBest) {
    var ph = phase(d), T = D.train, html, facts, cost = T.fare.pinhaoFromCampanha * 2 * n;
    var fareNote = d.getFullYear() > 2026 ? " (2026 fare; 2027 fares may differ)" : "";
    if (ph === "closure") {
      var o = T.out[0], b = T.back[0];
      var stay = mins(o.legs[2].arr, b.legs[0].dep);
      facts = [["Door to door", "≈ 4 h each way"], ["In Pinhão", dur(stay)], ["Fare, return", eur(cost) + (n > 1 ? " for " + n : "")], ["Changes", "2 each way"]];
      html = '<p class="ddp-sub">Out — ' + esc(o.label) + "</p>" + tl(o.legs) +
        '<p class="ddp-sub">Back — ' + esc(b.label) + "</p>" + tl(b.legs) +
        '<details><summary>Other times</summary><p class="ddp-sub">Out — ' + esc(T.out[1].label) + "</p>" + tl(T.out[1].legs) +
        '<p class="ddp-sub">Back — ' + esc(T.back[1].label) + "</p>" + tl(T.back[1].legs) + "</details>" +
        '<p class="ddp-src">The 4-minute bus link at Régua (17:41 → 17:45) is tight: CP says connections are only guaranteed when services run normally, and bus times are indicative. No bikes, scooters or wheelchairs on the replacement buses.</p>';
    } else {
      facts = [["Trains", "Expected back"], ["From", "25 Mar 2027"], ["Fare, return", eur(cost) + (n > 1 ? " for " + n : "")], ["Times", "Check CP"]];
      html = '<p class="verdict">Infraestruturas de Portugal plans to reopen the Marco–Régua section on <b>25 March 2027</b>. CP has not published that timetable yet, so we do not show times for this date.</p>' +
        "<p>" + link(D.sources.cpHome.url, "Check train times on cp.pt →") + "</p>";
    }
    if (specialDay(d)) html += '<p class="ddp-src"><b>Holiday:</b> services can change around Christmas and New Year. Check cp.pt before you go.</p>';
    return card({
      id: "train", best: isBest, img: "/img/cards/sao-bento-station-640.webp", alt: "Azulejo hall of São Bento station in Porto", mode: "Train + bus",
      title: "Train + replacement bus", verdict: "Cheapest. Train to Caíde, CP bus to Régua, then the riverside train to Pinhão.",
      facts: facts, body: html + '<p class="ddp-src">Times: ' + src("cpTimetable") + ", read " + checkedTxt + ". Fare: " + src("cpFares") + fareNote + ". Works: " + src("ipNotice") + ".</p>",
      cta: link(D.sources.cpHome.url, "Buy tickets on cp.pt", "book") + '<span class="alt">Then add a boat in Pinhão ↓</span>'
    });
  }

  function carCard(d, n, isBest) {
    var C = D.car, cars = Math.ceil(n / 5), tolls = C.tollEachWay * 2 * cars;
    var facts = [["Drive", "≈ " + dur(C.minutes) + " each way"], ["Distance", "≈ " + C.km + " km"], ["Tolls, return", eur(tolls) + (cars > 1 ? " (" + cars + " cars)" : "")], ["Per person", eur(tolls / n) + " + car"]];
    var body = '<p class="verdict">Most freedom: stop at viewpoints and drive the N222 along the river. Someone has to stay sober after the tastings.</p>' +
      '<p class="ddp-src">Drive time without traffic: ' + src("osrm") + ", " + checkedTxt + "; allow about 2 h. Tolls: " + esc(C.tollNote) + " " + src("imtTolls") + " · " + src("law37") + ". " + esc(C.rentalTollFee) + " " + src("hertz") + ". Fuel and rental not included.</p>";
    return card({
      id: "car", best: isBest, img: "/img/cards/douro-valley-640.webp", alt: "Terraced vineyards above the Douro river", mode: "Car",
      title: "Hire car", verdict: "", facts: facts, body: body,
      cta: link(C.hire, "Compare car hire in Porto", "book", true) + link(C.maps, "Open the route in Google Maps", "alt")
    });
  }

  function tourCard(d, n, p, isBest) {
    var list = D.tours[p], t = list[0], t2 = list[1];
    var facts = [["Length", t.hours], ["Rating", "★ " + t.rating + " (" + t.reviews + ")"], ["From", '<span class="ddp-price">' + eur(t.price) + (t.was ? "<s>" + eur(t.was) + "</s>" : "") + "</span> pp"], ["For " + n, "≈ " + eur(t.price * n)]];
    var body = '<p class="verdict">' + (p === "wine" ? "Best if wine is the point: tastings, lunch and a boat, and nobody drives." : "Easiest: pickup in Porto, viewpoints, a boat in Pinhão, back in the evening.") + "</p>" +
      "<p><b>" + esc(t.title) + "</b> · " + esc(t.tag) + "</p>" +
      '<p class="alt">Or: ' + link(gyg(t2.url), esc(t2.title) + " — from " + eur(t2.price), "", true) + " · " + t2.hours + " · ★ " + t2.rating + "</p>" +
      '<p class="ddp-src">Prices as shown on GetYourGuide on ' + checkedTxt + "; they change with the date. The tour runs by road, so the rail works do not affect it. Free cancellation terms are on the tour page.</p>";
    return card({
      id: "tour", best: isBest, img: "/img/rabelos-gaia-dom-luis-800.webp", alt: "Rabelo boats on the Douro by the Dom Luís I bridge", mode: "Guided day",
      title: "Guided day tour", verdict: "", facts: facts, body: body,
      cta: link(gyg(t.url), "Check " + short(d) + " on GetYourGuide", "book", true) + link(D.tours.tiqets, "Compare day trips on Tiqets", "alt", true)
    });
  }

  function card(o) {
    return '<article class="ddp-card' + (o.best ? " is-best" : "") + '" id="opt-' + o.id + '">' +
      '<div class="ph"><img src="' + o.img + '" alt="' + esc(o.alt) + '" width="640" height="427" loading="lazy" decoding="async">' +
      (o.best ? '<span class="badge">Best for you</span>' : "") + '<span class="mode">' + o.mode + "</span></div>" +
      '<div class="bd"><h3>' + o.title + "</h3>" + (o.verdict ? '<p class="verdict">' + o.verdict + "</p>" : "") +
      '<dl class="ddp-facts">' + o.facts.map(function (f) { return "<div><dt>" + f[0] + "</dt><dd>" + f[1] + "</dd></div>"; }).join("") + "</dl>" +
      o.body + '<div class="cta">' + o.cta + '<button type="button" class="ddp-btn ghost-dark" data-save="' + o.id + '">☆ Save this plan</button></div></div></article>';
  }

  function render() {
    var d = parse(state.d), n = state.n, p = state.p, b = best(n, p);
    var ph = phase(d);
    var alert = ph === "closure"
      ? '<div class="ddp-alert" role="note"><span class="ic">!</span><div><b>Rail works on your date.</b> No trains between Marco de Canaveses and Régua from 3 Nov 2026 to 24 Mar 2027; CP runs replacement buses. Régua–Pinhão is still by train. ' + src("ipNotice") + ".</div></div>"
      : '<div class="ddp-alert is-ok" role="note"><span class="ic">i</span><div><b>After the works.</b> Trains are planned to run again from 25 Mar 2027. ' + src("ipNotice") + ".</div></div>";
    var cards = [trainCard(d, n, b === "train"), carCard(d, n, b === "car"), tourCard(d, n, p, b === "tour")];
    var places = D.places.map(function (pl) {
      var st = placeStatus(pl, d);
      return '<div class="ddp-place"><span class="kicker">' + esc(pl.kind) + " · " + esc(pl.where) + "</span><h3>" + esc(pl.name) + '</h3><span class="ddp-status' + (st.open ? "" : " closed") + '">' + (st.open ? "Open " + short(d) : "Closed " + short(d)) + "</span><span>" + esc(st.text) + ". " + esc(pl.note) + "</span>" +
        '<span class="ddp-src">Hours from ' + link(pl.book, esc(pl.source)) + ", checked " + checkedTxt + ".</span></div>";
    }).join("");
    var boats = D.boats.map(function (bt) {
      return '<a class="ddp-boat" href="' + esc(gyg(bt.url)) + '" target="_blank" rel="sponsored nofollow noopener"><b>' + esc(bt.title) + "</b><span>" + bt.hours + " · ★ " + bt.rating + " (" + bt.reviews + ") · from " + eur(bt.price) + (bt.was ? " (was " + eur(bt.was) + ")" : "") + "</span><span>Check " + short(d) + " on GetYourGuide →</span></a>";
    }).join("");
    app.innerHTML = alert +
      '<div class="ddp-summary"><h2>Your Douro day: ' + esc(nice(d)) + "</h2><p>" + n + (n === 1 ? " person" : " people") + " · " + (p === "wine" ? "wine first" : "scenery first") + "</p></div>" +
      '<div class="ddp-cards">' + cards.join("") + "</div>" +
      '<section class="ddp-sec" aria-labelledby="ddp-open-h"><p class="kicker">Open in Pinhão on ' + esc(short(d)) + '</p><h2 class="h-section" id="ddp-open-h">Quintas and boats</h2>' +
      '<p class="lead-muted">Only places whose own website lists the hours. Book the tasting before you travel.</p><div class="ddp-open">' + places + "</div>" +
      '<h3 style="margin:1.4rem 0 .2rem">Boat trips from Pinhão</h3><p class="ddp-src">Prices as shown on GetYourGuide on ' + checkedTxt + '. The partner page shows whether the boat runs on your date.</p><div class="ddp-boats">' + boats + "</div>" +
      '<p style="margin-top:1rem">Want to wake up in the valley? ' + link(D.stay22, "See places to stay in Pinhão", "", true) + ".</p></section>";
  }

  /* ---------- saved days (localStorage, offline) ---------- */
  function loadSaved() { try { return JSON.parse(localStorage.getItem(KEY_SAVED) || "[]"); } catch (e) { return []; } }
  function storeSaved(a) { try { localStorage.setItem(KEY_SAVED, JSON.stringify(a)); return true; } catch (e) { return false; } }
  var NAMES = { train: "Train + bus", car: "Hire car", tour: "Guided tour" };
  function planText(s) {
    var d = parse(s.d), T = D.train;
    if (s.choice === "train" && phase(d) === "closure") {
      return T.out[0].legs.concat(T.back[0].legs).map(function (l) { return l.dep + " " + l.from + " → " + l.arr + " " + l.to; }).join(" · ");
    }
    if (s.choice === "tour") return D.tours[s.p][0].title;
    if (s.choice === "car") return "Porto → Pinhão by car, ≈ " + dur(D.car.minutes) + " each way";
    return "Check cp.pt for times";
  }
  function renderSaved() {
    var list = loadSaved(), ul = $("#ddp-saved");
    if (!list.length) { ul.innerHTML = "<li>No saved days yet. Tap “Save this plan” on a card.</li>"; return; }
    ul.innerHTML = list.map(function (s, i) {
      return "<li><span><b>" + esc(short(parse(s.d))) + " · " + NAMES[s.choice] + "</b> · " + s.n + (s.n === 1 ? " person" : " people") + "<br><small>" + esc(planText(s)) + '</small></span><span style="display:flex;gap:.3rem;flex-wrap:wrap"><button type="button" data-open="' + i + '">Open</button><button type="button" data-del="' + i + '">Delete</button></span></li>';
    }).join("");
  }
  function toast(t) { var el = $("#ddp-toast"); el.textContent = t; el.classList.add("on"); clearTimeout(toast.t); toast.t = setTimeout(function () { el.classList.remove("on"); }, 2400); }

  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-save],[data-open],[data-del],[data-step]");
    if (!t) return;
    if (t.hasAttribute("data-step")) { state.n = Math.min(12, Math.max(1, state.n + (+t.getAttribute("data-step")))); fOut.value = state.n; update(); return; }
    var list = loadSaved();
    if (t.hasAttribute("data-save")) {
      list = list.filter(function (s) { return !(s.d === state.d && s.choice === t.getAttribute("data-save")); });
      list.unshift({ d: state.d, n: state.n, p: state.p, choice: t.getAttribute("data-save"), at: Date.now() });
      storeSaved(list.slice(0, 20)); renderSaved(); toast("Saved on this phone — works offline"); return;
    }
    var i = +(t.getAttribute("data-open") || t.getAttribute("data-del"));
    if (t.hasAttribute("data-del")) { list.splice(i, 1); storeSaved(list); renderSaved(); return; }
    var s = list[i]; if (!s) return;
    state.d = parse(s.d) < today ? iso(tomorrow) : s.d; state.n = s.n; state.p = s.p;
    fDate.value = state.d; fOut.value = state.n; var r = document.querySelector('input[name="ddp-pref"][value="' + state.p + '"]'); if (r) r.checked = true;
    update(); var c = document.getElementById("opt-" + s.choice); if (c) c.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  fDate.addEventListener("change", function () { if (parse(fDate.value)) { state.d = fDate.value; update(); } });
  document.querySelectorAll('input[name="ddp-pref"]').forEach(function (r) { r.addEventListener("change", function () { state.p = r.value; update(); }); });
  $("#ddp-print").addEventListener("click", function () { window.print(); });

  function update() { persist(); render(); }

  /* ---------- install + offline ---------- */
  var deferred = null, ib = $("#ddp-install");
  window.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); deferred = e; ib.hidden = false; });
  ib.addEventListener("click", function () { if (!deferred) return; deferred.prompt(); deferred.userChoice.finally(function () { deferred = null; ib.hidden = true; }); });
  if (/iphone|ipad|ipod/i.test(navigator.userAgent) && !navigator.standalone) { var h = $("#ddp-ios"); if (h) h.hidden = false; }
  function net() { $("#ddp-offline").classList.toggle("on", !navigator.onLine); }
  window.addEventListener("online", net); window.addEventListener("offline", net); net();
  if ("serviceWorker" in navigator) { window.addEventListener("load", function () { navigator.serviceWorker.register("/douro-planner/sw.js", { scope: "/douro-planner/" }).catch(function () {}); }); }

  update(); renderSaved();
})();
