/* Day in Portugal — cookie consent (vanilla JS, no dependencies).
   Travelpayouts Drive (affiliate links/recommendations) is loaded ONLY after "Accept".
   Choice stored in localStorage for 6 months. Any element with [data-consent-open] reopens the banner. */
(function () {
  var KEY = "dip-consent-v1";
  var MAX_AGE = 1000 * 60 * 60 * 24 * 182; // ~6 months, then ask again

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
    box.setAttribute("aria-label", "Cookie choice");
    box.hidden = true;
    box.innerHTML =
      '<h2>Cookies, briefly</h2>' +
      '<p>The site works without them. If you accept, we load a script from our affiliate partner Travelpayouts that can set cookies so a booking you make on GetYourGuide, Booking.com and similar sites is credited to us. Same price for you. ' +
      '<a href="/privacy">Privacy</a> · <a href="/disclosure">How we earn</a></p>' +
      '<div class="dip-actions">' +
      '<button type="button" data-choice="reject">Reject</button>' +
      '<button type="button" data-choice="accept">Accept</button>' +
      '</div>';
    box.addEventListener("click", function (e) {
      var c = e.target && e.target.getAttribute && e.target.getAttribute("data-choice");
      if (!c) return;
      save(c);
      box.hidden = true;
      if (c === "accept") loadTravelpayouts();
      else if (loaded) location.reload(); // withdrawing consent: drop the already-running script
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

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
