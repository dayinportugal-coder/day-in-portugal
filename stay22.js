/* Day in Portugal — Stay22 map and booking links, loaded ONLY after cookie consent.
   Uses window.dipConsent from consent.js (same localStorage key). aid is the live Stay22 id. */
(function () {
  var AID = "dayinportugal";

  function accepted() {
    return window.dipConsent && window.dipConsent.getChoice && window.dipConsent.getChoice() === "accept";
  }

  function buildIframe(slot) {
    var address = slot.getAttribute("data-stay22-address") || "";
    var campaign = slot.getAttribute("data-stay22-campaign") || "";
    var title = slot.getAttribute("data-stay22-title") || "Accommodation map";
    var params = new URLSearchParams({ aid: AID });
    if (address) params.set("address", address);
    if (campaign) params.set("campaign", campaign);
    var iframe = document.createElement("iframe");
    iframe.className = "stay22-map";
    iframe.src = "https://www.stay22.com/embed/gm?" + params.toString();
    iframe.title = title;
    iframe.setAttribute("loading", "lazy");
    iframe.setAttribute("referrerpolicy", "no-referrer-when-downgrade");
    slot.innerHTML = "";
    slot.appendChild(iframe);
  }

  function activate() {
    document.querySelectorAll(".stay22-wrap").forEach(function (wrap) {
      if (wrap.getAttribute("data-stay22-on") === "1") return;
      wrap.setAttribute("data-stay22-on", "1");
      var pending = wrap.querySelector(".stay22-pending");
      var ready = wrap.querySelector(".stay22-ready");
      if (pending) pending.hidden = true;
      if (ready) ready.hidden = false;
      var slot = wrap.querySelector("[data-stay22-map]");
      if (slot && slot.getAttribute("data-stay22-loaded") !== "1") {
        slot.setAttribute("data-stay22-loaded", "1");
        buildIframe(slot);
      }
    });
  }

  function deactivate() {
    document.querySelectorAll(".stay22-wrap").forEach(function (wrap) {
      wrap.removeAttribute("data-stay22-on");
      var pending = wrap.querySelector(".stay22-pending");
      var ready = wrap.querySelector(".stay22-ready");
      if (pending) pending.hidden = false;
      if (ready) ready.hidden = true;
      var slot = wrap.querySelector("[data-stay22-map]");
      if (slot) {
        slot.removeAttribute("data-stay22-loaded");
        slot.innerHTML = "";
      }
    });
  }

  function init() {
    if (accepted()) activate();
    else if (window.dipConsent && window.dipConsent.onAccept) window.dipConsent.onAccept(activate);
    document.addEventListener("dip-consent-accepted", activate);
    document.addEventListener("dip-consent-rejected", deactivate);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
