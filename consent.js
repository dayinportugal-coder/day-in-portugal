/* Day in Portugal — cookie consent (vanilla JS, no dependencies).
   Travelpayouts Drive (affiliate links/recommendations) and Stay22 maps/booking links are loaded ONLY after "Accept".
   Choice stored in localStorage for 6 months. Any element with [data-consent-open] reopens the banner.
   window.dipConsent exposes getChoice() and onAccept(cb) so pages can hook the same consent state. */
(function () {
  var KEY = "dip-consent-v1";
  var MAX_AGE = 1000 * 60 * 60 * 24 * 182; // ~6 months, then ask again

  function pageLang() {
    var m = (location.pathname || "/").match(/^\/(es|fr|de|pt)(?=\/|$)/);
    return m ? m[1] : "en";
  }

  function langHref(path) {
    var code = pageLang();
    if (code === "en") return path;
    return "/" + code + path;
  }

  var COPY = {
    en: {
      label: "Cookie choice",
      title: "Cookies, briefly",
      body: "The site works without them. If you accept, we load a script from our affiliate partner Travelpayouts, and on some pages a map from Stay22, that can set cookies so a booking you make on GetYourGuide, Booking.com and similar sites is credited to us. Same price for you.",
      privacy: "Privacy",
      earn: "How we earn",
      reject: "Reject",
      accept: "Accept"
    },
    es: {
      label: "Elección de cookies",
      title: "Cookies, en breve",
      body: "El sitio funciona sin ellas. Si aceptas, cargamos un script de nuestro socio de afiliación Travelpayouts y, en algunas páginas, un mapa de Stay22, que pueden guardar cookies para que una reserva que hagas en GetYourGuide, Booking.com y sitios parecidos se nos atribuya. El precio para ti es el mismo.",
      privacy: "Privacidad",
      earn: "Cómo ganamos",
      reject: "Rechazar",
      accept: "Aceptar"
    },
    fr: {
      label: "Choix des cookies",
      title: "Les cookies, en bref",
      body: "Le site fonctionne sans cookies. Si vous acceptez, nous chargeons un script de notre partenaire d'affiliation Travelpayouts et, sur certaines pages, une carte Stay22, qui peuvent déposer des cookies afin qu'une réservation faite sur GetYourGuide, Booking.com et des sites similaires nous soit attribuée. Le prix reste le même pour vous.",
      privacy: "Confidentialité",
      earn: "Comment nous gagnons",
      reject: "Refuser",
      accept: "Accepter"
    },
    de: {
      label: "Cookie-Auswahl",
      title: "Cookies, kurz erklärt",
      body: "Die Seite funktioniert ohne Cookies. Wenn Sie zustimmen, laden wir ein Skript unseres Affiliate-Partners Travelpayouts und auf manchen Seiten eine Karte von Stay22. Sie können Cookies setzen, damit eine Buchung bei GetYourGuide, Booking.com und ähnlichen Seiten uns zugeordnet wird. Der Preis für Sie bleibt gleich.",
      privacy: "Datenschutz",
      earn: "So verdienen wir",
      reject: "Ablehnen",
      accept: "Akzeptieren"
    },
    pt: {
      label: "Escolha de cookies",
      title: "Cookies, em breve",
      body: "O site funciona sem cookies. Se aceitar, carregamos um script do nosso parceiro de afiliados Travelpayouts e, em algumas páginas, um mapa da Stay22, que podem guardar cookies para que uma reserva feita na GetYourGuide, no Booking.com e em sites semelhantes nos seja atribuída. O preço para si é o mesmo.",
      privacy: "Privacidade",
      earn: "Como ganhamos",
      reject: "Recusar",
      accept: "Aceitar"
    }
  };

  function read() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY) || "null");
      if (v && v.t && Date.now() - v.t < MAX_AGE) return v.choice;
    } catch (e) {}
    return null;
  }
  function save(choice) {
    try { localStorage.setItem(KEY, JSON.stringify({ choice: choice, t: Date.now() })); } catch (e) {}
  }

  var loaded = false;
  var acceptListeners = [];
  function notifyAccepted() {
    try { document.dispatchEvent(new CustomEvent("dip-consent-accepted")); } catch (e) {}
    acceptListeners.forEach(function (cb) { try { cb(); } catch (e) {} });
    acceptListeners = [];
  }
  function notifyRejected() {
    try { document.dispatchEvent(new CustomEvent("dip-consent-rejected")); } catch (e) {}
  }
  function loadTravelpayouts() {
    if (loaded) return; loaded = true;
    // Exact Travelpayouts Drive snippet from the live site (project 580652).
    (function () {
      var script = document.createElement("script");
      script.async = 1;
      script.setAttribute("data-cmp-ab", "2");
      script.src = 'https://emrldtp.cc/NTgwNjUy.js?t=580652';
      document.head.appendChild(script);
    })();
  }

  function build() {
    var box = document.createElement("div");
    box.className = "dip-consent";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-live", "polite");
    var copy = COPY[pageLang()] || COPY.en;
    box.setAttribute("aria-label", copy.label);
    box.hidden = true;
    box.innerHTML =
      '<h2>' + copy.title + '</h2>' +
      '<p>' + copy.body + ' ' +
      '<a href="' + langHref("/privacy") + '">' + copy.privacy + '</a> · <a href="' + langHref("/disclosure") + '">' + copy.earn + '</a></p>' +
      '<div class="dip-actions">' +
      '<button type="button" data-choice="reject">' + copy.reject + '</button>' +
      '<button type="button" data-choice="accept">' + copy.accept + '</button>' +
      '</div>';
    box.addEventListener("click", function (e) {
      var c = e.target && e.target.getAttribute && e.target.getAttribute("data-choice");
      if (!c) return;
      save(c);
      box.hidden = true;
      if (c === "accept") { loadTravelpayouts(); notifyAccepted(); }
      else { notifyRejected(); if (loaded) location.reload(); } // reject or withdraw: hide Stay22 now; reload drops Travelpayouts if it was running
    });
    document.body.appendChild(box);
    return box;
  }

  function init() {
    var box = build();
    var choice = read();
    if (choice === "accept") loadTravelpayouts();
    else if (choice === null) box.hidden = false;

    document.addEventListener("click", function (e) {
      var el = e.target && e.target.closest && e.target.closest("[data-consent-open]");
      if (!el) return;
      e.preventDefault();
      box.hidden = false;
      var b = box.querySelector("button"); if (b) b.focus();
    });
  }

  window.dipConsent = {
    getChoice: read,
    onAccept: function (cb) {
      if (typeof cb !== "function") return;
      if (read() === "accept") cb();
      else acceptListeners.push(cb);
    }
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
