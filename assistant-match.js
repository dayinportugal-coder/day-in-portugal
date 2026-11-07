/* Place-first matching for the booking assistant.
   Works in the browser (window.DIPMatch) and in Node (module.exports). */
(function (root, factory) {
  var api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.DIPMatch = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  /* Specific day-trip names before the city names, so "Sintra" beats a stray "Porto". */
  var PLACES = [
    { id: "sintra", region: "lisbon", words: ["sintra"] },
    { id: "cascais", region: "lisbon", words: ["cascais"] },
    { id: "evora", region: "lisbon", words: ["evora"] },
    { id: "douro", region: "porto", words: ["douro"] },
    { id: "aveiro", region: "porto", words: ["aveiro"] },
    { id: "braga", region: "porto", words: ["braga"] },
    { id: "guimaraes", region: "porto", words: ["guimaraes"] },
    { id: "lisbon", region: "lisbon", words: ["lisboa", "lisbon", "lisbonne", "lissabon"] },
    { id: "porto", region: "porto", words: ["oporto", "porto"] }
  ];

  var KINDS = [
    { id: "transfer", words: ["transfer", "transfert", "traslado", "aeropuerto", "aeroporto", "aeroport", "airport", "flughafen", "taxi", "kiwitaxi"] },
    { id: "stay", words: ["hotel", "hostel", "airbnb", "dormir", "alojamiento", "alojamento", "hebergement", "unterkunft", "ubernachten", "quarto", "habitacion", "chambre", "zimmer", "stay"] },
    { id: "car", words: ["mietwagen", "alquiler", "aluguer", "alugar", "voiture", "coche", "carro", "rental", "hire"] },
    { id: "practical", words: ["esim", "luggage", "equipaje", "bagagem", "gepack", "maleta", "mala", "consigne", "consigna"] },
    { id: "visa", words: ["visado", "visum", "visto", "visa"] },
    { id: "tickets", words: ["entrada", "bilhete", "billetes", "billete", "billets", "billet", "tickets", "ticket", "crucero", "cruzeiro", "croisiere", "cruise", "tour"] }
  ];

  var DAY = { sintra: 1, cascais: 1, evora: 1, douro: 1, aveiro: 1, braga: 1, guimaraes: 1 };

  function norm(s) {
    return String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9+ ]/g, " ").replace(/\s+/g, " ").trim();
  }

  function hasWord(text, word) {
    var k = norm(word);
    if (!k) return false;
    if (k.indexOf(" ") >= 0) return text.indexOf(k) >= 0;
    return (" " + text + " ").indexOf(" " + k + " ") >= 0;
  }

  function hasStem(text, stem) {
    var parts = text.split(" ");
    var i;
    for (i = 0; i < parts.length; i++) {
      if (parts[i] === stem || (stem.length >= 5 && parts[i].indexOf(stem) === 0)) return true;
    }
    return false;
  }

  function findPlace(text) {
    var i, j;
    for (i = 0; i < PLACES.length; i++) {
      for (j = 0; j < PLACES[i].words.length; j++) {
        if (hasWord(text, PLACES[i].words[j])) return PLACES[i];
      }
    }
    return null;
  }

  function findKind(text) {
    var i, j, kind, word;
    for (i = 0; i < KINDS.length; i++) {
      kind = KINDS[i];
      for (j = 0; j < kind.words.length; j++) {
        word = norm(kind.words[j]);
        if (word.length >= 5 ? hasStem(text, word) : hasWord(text, word)) return kind.id;
      }
    }
    return null;
  }

  function intentIdFor(place, kind) {
    if (!place) return null;
    if (kind === "transfer" || kind === "stay" || kind === "car" || kind === "practical" || kind === "visa") return kind;
    if (DAY[place.id]) {
      if (kind === "tickets" && place.region === "lisbon") return "tickets-lisbon";
      return "day";
    }
    if (place.id === "lisbon") return kind === "tickets" || !kind ? "tickets-lisbon" : kind;
    if (place.id === "porto") return kind === "tickets" || !kind ? "tickets-porto" : kind;
    return "day";
  }

  function linkBlob(link) {
    return norm((link.href || "") + " " + (link.label || ""));
  }

  function linkRank(link, place) {
    var blob = linkBlob(link);
    var href = String(link.href || "").toLowerCase();
    if (!place) return 1;
    if (place.id === "guimaraes" || place.id === "braga") {
      if (blob.indexOf("braga") >= 0 || blob.indexOf("guimaraes") >= 0) return 0;
    } else if (blob.indexOf(place.id) >= 0 || href.indexOf(place.id) >= 0) {
      return 0;
    }
    if (place.id === "lisbon" && (blob.indexOf("lisboa") >= 0 || blob.indexOf("lisbon") >= 0 || blob.indexOf("lissabon") >= 0 || blob.indexOf("lisbonne") >= 0)) return 0;
    if (place.id === "porto" && (blob.indexOf("porto") >= 0 || blob.indexOf("oporto") >= 0)) return 0;
    if (place.id === "evora" && blob.indexOf("evora") >= 0) return 0;
    if (place.region === "lisbon" && /lisbon|lisboa|sintra|cascais|evora|pena|jeronimos|humberto/.test(blob)) return 1;
    if (place.region === "porto" && /porto|gaia|douro|aveiro|braga|guimaraes|lello|fado|oporto/.test(blob)) return 1;
    return 2;
  }

  function orderLinks(links, place) {
    return (links || []).map(function (link, index) {
      return { link: link, index: index, rank: linkRank(link, place) };
    }).sort(function (a, b) {
      if (a.rank !== b.rank) return a.rank - b.rank;
      return a.index - b.index;
    }).map(function (item) { return item.link; });
  }

  function byId(data, id) {
    var list = (data && data.intents) || [];
    var i;
    for (i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  function score(intent, text) {
    var s = 0;
    var words = intent.keywords || [];
    var i, k;
    for (i = 0; i < words.length; i++) {
      k = norm(words[i]);
      if (!k) continue;
      if (k.indexOf(" ") >= 0) {
        if (text.indexOf(k) >= 0) s += 2;
      } else if (hasWord(text, k) || (k.length >= 6 && hasStem(text, k))) s += 1;
    }
    return s;
  }

  function keywordMatch(data, text) {
    var best = null;
    var bestScore = 0;
    var list = (data && data.intents) || [];
    var i, s;
    for (i = 0; i < list.length; i++) {
      s = score(list[i], text);
      if (s > bestScore) { bestScore = s; best = list[i]; }
    }
    return best;
  }

  function linksFor(data, intent, place) {
    var seen = {};
    var combined = [];
    function add(link) {
      if (!link) return;
      var key = link.href || link.label || "";
      if (seen[key]) return;
      seen[key] = 1;
      combined.push(link);
    }
    if (place && DAY[place.id]) {
      var day = byId(data, "day");
      if (day) (day.links || []).forEach(function (link) {
        if (linkRank(link, place) === 0) add(link);
      });
    }
    (intent.links || []).forEach(add);
    return orderLinks(combined, place);
  }

  function matchQuery(data, text, forcedId) {
    var n = norm(text);
    var intent = null;
    var place = null;
    var kind = null;
    if (forcedId) {
      intent = byId(data, forcedId);
    } else {
      place = findPlace(n);
      kind = findKind(n);
      if (place) {
        intent = byId(data, intentIdFor(place, kind)) || byId(data, "day");
      }
      if (!intent) intent = keywordMatch(data, n);
    }
    if (!intent) return null;
    if (!place && !forcedId) place = findPlace(n);
    if (!kind && !forcedId) kind = findKind(n);
    return {
      id: intent.id,
      topic: place ? place.id : intent.id,
      kind: kind,
      region: place ? place.region : null,
      answer: intent.answer,
      price: !!intent.price,
      links: linksFor(data, intent, place)
    };
  }

  return { norm: norm, matchQuery: matchQuery, findPlace: findPlace, findKind: findKind };
});
