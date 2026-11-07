#!/usr/bin/env node
/* At least five queries per language. Place names outrank generic ticket words. */
var fs = require("fs");
var path = require("path");
var match = require("../assistant-match.js").matchQuery;

var cases = {
  en: [
    { q: "I want tickets for Sintra", topic: "sintra", id: "tickets-lisbon", link: "sintra" },
    { q: "Cascais day trip", topic: "cascais", id: "day", link: "cascais" },
    { q: "Douro valley cruise", topic: "douro", id: "day", link: "douro" },
    { q: "airport transfer in Lisbon", topic: "lisbon", id: "transfer", link: "lisbon" },
    { q: "where to stay in Porto", topic: "porto", id: "stay", link: "/stay" },
    { q: "Évora by train", topic: "evora", id: "day", link: "evora" }
  ],
  es: [
    { q: "Quiero entradas para Sintra", topic: "sintra", id: "tickets-lisbon", link: "sintra" },
    { q: "Excursión a Cascais", topic: "cascais", id: "day", link: "cascais" },
    { q: "Quiero ver el Douro", topic: "douro", id: "day", link: "douro" },
    { q: "Traslado del aeropuerto en Lisboa", topic: "lisbon", id: "transfer", link: "lisbon" },
    { q: "Dónde dormir en Oporto", topic: "porto", id: "stay", link: "/stay" },
    { q: "entradas en Braga", topic: "braga", id: "day", link: "braga" }
  ],
  fr: [
    { q: "Je veux des billets pour Sintra", topic: "sintra", id: "tickets-lisbon", link: "sintra" },
    { q: "Excursion à Cascais", topic: "cascais", id: "day", link: "cascais" },
    { q: "Croisière dans la vallée du Douro", topic: "douro", id: "day", link: "douro" },
    { q: "Transfert aéroport à Lisbonne", topic: "lisbon", id: "transfer", link: "lisbon" },
    { q: "Où dormir à Porto", topic: "porto", id: "stay", link: "/stay" },
    { q: "billets pour Évora", topic: "evora", id: "tickets-lisbon", link: "evora" }
  ],
  de: [
    { q: "Tickets für Sintra", topic: "sintra", id: "tickets-lisbon", link: "sintra" },
    { q: "Tagesausflug nach Cascais", topic: "cascais", id: "day", link: "cascais" },
    { q: "Eine Fahrt ins Douro-Tal", topic: "douro", id: "day", link: "douro" },
    { q: "Flughafentransfer Lissabon", topic: "lisbon", id: "transfer", link: "lisbon" },
    { q: "Unterkunft in Porto", topic: "porto", id: "stay", link: "/stay" },
    { q: "Aveiro Tagesausflug", topic: "aveiro", id: "day", link: "aveiro" }
  ],
  pt: [
    { q: "Quero bilhetes para Sintra", topic: "sintra", id: "tickets-lisbon", link: "sintra" },
    { q: "Excursão a Cascais", topic: "cascais", id: "day", link: "cascais" },
    { q: "Quero ir ao Douro", topic: "douro", id: "day", link: "douro" },
    { q: "Transfer do aeroporto em Lisboa", topic: "lisbon", id: "transfer", link: "lisbon" },
    { q: "Onde dormir no Porto", topic: "porto", id: "stay", link: "/stay" },
    { q: "bilhetes para Guimarães", topic: "guimaraes", id: "day", link: "braga" }
  ]
};

var failed = 0;
var passed = 0;
Object.keys(cases).forEach(function (lang) {
  var data = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "i18n", "assistant", lang + ".json"), "utf8"));
  cases[lang].forEach(function (item) {
    var hit = match(data, item.q, null);
    var blob = hit ? ((hit.links[0] && (hit.links[0].href + " " + hit.links[0].label)) || "") : "";
    var ok = hit && hit.topic === item.topic && hit.id === item.id && hit.id !== "tickets-porto" || (item.id === "tickets-porto");
    if (item.id !== "tickets-porto" && hit && hit.id === "tickets-porto" && item.topic !== "porto") ok = false;
    if (!hit || hit.topic !== item.topic || hit.id !== item.id || blob.toLowerCase().indexOf(item.link) < 0) {
      failed++;
      console.log("FAIL", lang, JSON.stringify(item.q), "got", hit && { id: hit.id, topic: hit.topic, first: blob.slice(0, 80) });
    } else {
      passed++;
      console.log("ok  ", lang, item.topic, item.id);
    }
  });
});
console.log(passed + " passed, " + failed + " failed");
process.exit(failed ? 1 : 0);
