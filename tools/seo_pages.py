#!/usr/bin/env python3
"""SEO pass on the five pages with most Search Console impressions (28/9-10/11/2026).
Facts checked 13/11/2026 on official pages: Metro do Porto prices (metrodoporto.pt/pages/287),
CP urban fares Porto 2026 and CP timetables (cp.pt), Taylor's FAQ (taylor.pt), Metro Lisboa (metrolisboa.pt, 6/11/2026).
Idempotent: blocks sit between <!-- ia:quick --> and <!-- ia:faq --> markers."""
import re, json, html
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]

GYG = 'rel="sponsored nofollow noopener" target="_blank"'
WP = "https://tp.media/r?campaign_id=627&amp;marker=784671&amp;p=8919&amp;sub_id=dayinportugal.com&amp;trs=580652&amp;u=https%3A%2F%2Fwww.welcomepickups.com%2Fporto%2Fairport-transfer%2F"
KIWI_OPO = "https://tp.media/r?campaign_id=1&amp;marker=784671&amp;p=647&amp;sub_id=dayinportugal.com&amp;trs=580652&amp;u=https%3A%2F%2Fkiwitaxi.com%2Fen%2Fportugal%2Fporto-airport"
KIWI_LIS = "https://tp.media/r?campaign_id=1&amp;marker=784671&amp;p=647&amp;sub_id=dayinportugal.com&amp;trs=580652&amp;u=https%3A%2F%2Fkiwitaxi.com%2Fen%2Fportugal%2Fhumberto-delgado-airport"
GYG_DOURO = "https://www.getyourguide.com/douro-valley-l4965/?partner_id=QYSYONP&amp;utm_medium=online_publisher"
GYG_BG = "https://www.getyourguide.com/s/?q=braga+guimaraes+day+trip+porto&amp;partner_id=QYSYONP&amp;utm_medium=online_publisher"
TQ_BG = "https://tp.media/r?campaign_id=89&amp;marker=784671&amp;p=2074&amp;sub_id=dayinportugal.com&amp;trs=580652&amp;u=https%3A%2F%2Fwww.tiqets.com%2Fen%2Fbraga-and-guimaraes-day-trips-from-porto-l212135%2F"
TQ_TAYLOR = "https://tp.media/r?campaign_id=89&amp;marker=784671&amp;p=2074&amp;sub_id=dayinportugal.com&amp;trs=580652&amp;u=https%3A%2F%2Fwww.tiqets.com%2Fen%2Ftaylor-s-port-cellars-tickets-l234867%2F"
GYG_GAIA = "https://www.getyourguide.com/s/?q=port+wine+cellar+tour+gaia&amp;partner_id=QYSYONP&amp;utm_medium=online_publisher"

PAGES = {
 "braga-guimaraes-day-trip.html": dict(
  title="Braga and Guimarães Day Trip from Porto (2026): Tour or Train",
  desc="Braga and Guimarães in one day from Porto: Bom Jesus, Braga cathedral and Guimarães castle. Guided tour, CP train (about 1 hour) or hire car, compared.",
  h1="Braga and Guimarães day trip from Porto",
  quick=("Quick answer", [
     "<strong>Both towns in one day:</strong> a guided tour from Porto, about 9 hours, Bom Jesus and Braga first, Guimarães after lunch.",
     "<strong>One town on your own:</strong> CP urban train from Porto São Bento — about 56–73 minutes to Braga, 62–83 minutes to Guimarães (CP timetables, checked 13/11/2026); a single is about €3.60 on CP’s 2026 urban fares, check cp.pt.",
     "<strong>No direct train between Braga and Guimarães</strong> — you need a bus, which is why the tour wins for both."],
     (GYG_BG, "Compare Braga &amp; Guimarães tours on GetYourGuide"), (TQ_BG, "or on Tiqets")),
  faq=[
   ("Can you do Braga and Guimarães in one day from Porto?", "Yes. A guided day trip covers Bom Jesus, Braga’s centre and Guimarães in about nine hours. By train it is realistic for one town, because the two towns are on different CP lines and you need a bus between them."),
   ("How long is the train from Porto to Braga?", "Between about 56 and 73 minutes from Porto São Bento on CP urban trains, depending on the train (CP timetable valid from 26/07/2026, checked 13/11/2026)."),
   ("How long is the train from Porto to Guimarães?", "Between about 62 and 83 minutes from Porto São Bento, most trains about 75 minutes (CP timetable, checked 13/11/2026). There is no direct train between Braga and Guimarães."),
   ("What is Bom Jesus do Monte?", "A UNESCO World Heritage sanctuary on a hill above Braga, reached by a Baroque zigzag stairway or a historic funicular."),
   ("Is Braga or Guimarães better for a day trip from Porto?", "Guimarães for the medieval centre and the castle tied to the founding of Portugal; Braga for the cathedral and the Bom Jesus stairway. If you can only pick one by train, Guimarães is smaller and easier on foot."),
   ("What does a Braga and Guimarães tour include?", "Usually transport from central Porto, a guide, Bom Jesus, Braga cathedral and Guimarães castle. Some tours include entry tickets, hotel pickup or lunch — check the tour page, because prices and inclusions vary."),
  ]),
 "douro-day.html": dict(
  title="Douro Valley Day Trip from Porto (2026): Tour, Train or Car",
  desc="Plan a Douro Valley day trip from Porto: a guided tour with tastings, lunch and a boat in Pinhão, the CP train to Régua and Pinhão (replacement bus on part of the line since 3/11/2026), or a car on the N222.",
  h1="Douro Valley day trip from Porto: tour, train or car",
  quick=("Quick answer", [
     "<strong>Easiest:</strong> a full-day Douro Valley tour from Porto, about 9–10 hours, two wineries, lunch and a short boat in Pinhão — from about €85 on partner pages (checked 24/10/2026).",
     "<strong>Cheapest:</strong> CP Douro line to Régua and Pinhão. On the timetable valid from 3/11/2026 it takes about 4 hours with a replacement bus and a change at Régua — e.g. São Bento 09:25 → Pinhão 13:27 (CP, checked 13/11/2026).",
     "<strong>Works on the line:</strong> since 3 November 2026 CP runs a replacement bus on part of Porto–Régua (announced until 24 March 2027); Régua–Pinhão–Pocinho is still by train."],
     (GYG_DOURO, "See Douro Valley day tours from Porto"), None),
  faq=[
   ("Is the six-bridges cruise the same as a Douro Valley day trip?", "No. The six-bridges cruise is a short harbour loop in Porto and Gaia. A Douro Valley day trip goes about two hours inland to Régua, Pinhão and the terraced vineyards."),
   ("What is the best way to do a Douro Valley day trip from Porto?", "For most visitors an organised day trip: pickup in Porto, two wineries with tastings, lunch and a boat in Pinhão, and nobody has to drive after the wine. The train is cheaper; a car is the most flexible but someone stays sober."),
   ("What is the cheapest Douro day trip from Porto?", "The CP train from Porto São Bento or Campanhã to Régua or Pinhão. Between 3 November 2026 and 24 March 2027 part of the line, Marco de Canaveses to Régua, runs as replacement buses, so allow extra time and check cp.pt."),
   ("How long does the train to Pinhão take?", "About four hours on the timetable valid from 3 November 2026, which includes a replacement bus and a change at Régua: for example São Bento 09:25 → Pinhão 13:27, or Campanhã 07:30 → Pinhão 11:31 (CP, checked 13/11/2026). Re-check on the day."),
   ("How long is a Douro Valley day tour?", "Organised tours from Porto leave in the morning and are back in the evening — a long day, usually 9 to 10 hours on partner listings."),
   ("When is the best time to visit the Douro Valley?", "Late September into October for the harvest — busiest and most beautiful. Spring is green and quieter; July and August are hot inland."),
  ]),
 "porto-airport-transfer.html": dict(
  title="Porto Airport Transfer to the City Centre (2026): Metro, Taxi or Driver",
  desc="Porto airport to the city centre: metro line E to Trindade in about 27 minutes for €2.30 (+€0.60 Andante card), a taxi, or a pre-booked transfer with a fixed price. Times, last metro, FAQ.",
  h1="Porto airport to the city centre: metro, taxi or transfer",
  quick=("Quick answer", [
     "<strong>Metro line E (violet):</strong> airport to Trindade in about 27 minutes, every 15 minutes 07:00–20:00, first 06:06, last 00:42. Z4 ticket <strong>€2.30</strong> plus <strong>€0.60</strong> for the rechargeable Andante card, or tap a contactless bank card at the marked validators (Metro do Porto 2026 prices).",
     "<strong>Taxi or Uber:</strong> from outside arrivals, door to door — simplest for two or three people with bags.",
     "<strong>Pre-booked private transfer:</strong> a driver with your name, a fixed price, flight tracking — the calm option late at night, with children or a group."],
     (WP, "Book a Porto airport transfer"), (KIWI_OPO, "Fixed-price cars on Kiwitaxi")),
  faq=[
   ("How do I get from Porto airport to the city centre?", "Take metro line E (violet) from the Aeroporto station to Trindade, about 27 minutes; change there for São Bento or Gaia. A taxi, Uber or a pre-booked transfer goes door to door."),
   ("How much is the metro from Porto airport?", "A Z4 single costs €2.30 in 2026, plus €0.60 for the rechargeable Andante card if you do not have one (Metro do Porto price table, in force from 1 January 2026). On line E you can also pay with a contactless bank card at marked validators."),
   ("Is a private transfer from Porto airport worth it?", "When you land late, travel with children or heavy luggage, or are three or more people splitting one fixed price. Otherwise the metro is quick and cheap."),
   ("What time is the last metro from Porto airport?", "00:42; the first one leaves at 06:06 (Metro do Porto frequencies valid from 07/09/2026, checked 13/11/2026). After that, use a taxi or a pre-booked transfer."),
   ("How often does the airport metro run?", "Every 15 minutes from 07:00 to 20:00, every day; every 20–30 minutes early morning and late evening (Metro do Porto, checked 13/11/2026)."),
   ("How do I get from Porto airport to Póvoa de Varzim or Vila do Conde?", "Take metro line E and change at Verdes to line B (red), or book a transfer straight to the door."),
  ]),
 "gaia-port-cellars.html": dict(
  title="Port Wine Cellars in Gaia (2026): Which Cellar Tour to Book",
  desc="Port wine cellars in Gaia compared: Taylor’s (€25, three ports), Fonseca (€16), Cálem, Cockburn’s, Burmester and Poças. Guided or self-paced, prices, and when to book a slot.",
  h1="Port wine cellars in Gaia: which cellar tour to book",
  quick=("Quick answer", [
     "<strong>First time, no plan:</strong> Taylor’s — self-paced audio tour in 13 languages and three ports, <strong>€25</strong> (ages 8–17 €9), open daily 10:00–18:15 (Taylor’s FAQ, checked 13/11/2026).",
     "<strong>Guided and by the river:</strong> Cálem — museum, cellar and tasting in about an hour; an evening version adds fado.",
     "<strong>Cheapest self-paced:</strong> Fonseca, €16 with three ports (children 5–14 €8). <strong>Working lodge:</strong> Cockburn’s, about 1½ hours, reservation only (official sites, checked 13/11/2026)."],
     (TQ_TAYLOR, "Book Taylor’s Port Cellars"), (GYG_GAIA, "Compare Gaia cellar tours on GetYourGuide")),
  faq=[
   ("Which port wine cellar in Gaia is best?", "For a first visit, Taylor’s (self-paced, three ports, garden view) or Cálem (guided, on the riverfront). For a quieter, smaller visit try Burmester, Fonseca or the family-run Poças."),
   ("How much does a port cellar tour cost in Gaia?", "Taylor’s costs €25 for adults with three ports and €9 for ages 8 to 17, under 8 free (Taylor’s FAQ, checked 13/11/2026). Fonseca’s standard visit is €16, children 5–14 €8 (Fonseca, checked 13/11/2026). Tastings of older ports cost more."),
   ("Do I need to book a port cellar visit in advance?", "At Cockburn’s, yes — reservation only. Elsewhere a time slot avoids waiting in summer and at weekends; Taylor’s also sells on site, subject to availability."),
   ("What are the opening hours of the port cellars?", "Taylor’s cellar 10:00–18:15 daily; Fonseca last audio-tour admission 17:45 (opens 11:00); Cockburn’s 10:00–17:00 from November to March (official sites, checked 13/11/2026). Special dates vary."),
   ("How many port cellars should I visit?", "One, maybe two. They all explain the same process, and after the second tasting they taste the same. Do one cellar, then eat."),
   ("How do I get to the cellars from Porto?", "Walk across the lower deck of the Dom Luís I bridge from Ribeira; the lodges are on the Gaia riverfront and the lanes above it. The Gaia cable car runs back up to the top of the bridge."),
  ]),
 "de/lisbon-airport-transfer.html": dict(
  title="Lissabon Flughafen Transfer (2026): Metro, Taxi oder Auto ins Zentrum",
  desc="Vom Flughafen Lissabon ins Zentrum: rote Metrolinie bis Saldanha in ca. 18 Min. für 1,92 € kontaktlos, täglich 6:30–1:00 Uhr, Taxi oder Transfer bei später Landung.",
  h1="Vom Flughafen Lissabon ins Zentrum: Metro, Taxi oder Transfer",
  quick=("Kurz gesagt", [
     "<strong>Metro, rote Linie:</strong> Aeroporto bis Saldanha etwa 18 Minuten, <strong>1,92 €</strong>; kontaktlose Bankkarte am Entwerter genügt; täglich 6:30–1:00 Uhr. Rossio ca. 25 Min., Baixa-Chiado 31, Cais do Sodré 35 (Umstieg Alameda; metrolisboa.pt, geprüft am 13.11.2026).",
     "<strong>Taxi:</strong> 20–30 Minuten, etwa 16–19 € ohne Verkehr laut Metro-Gesellschaft.",
     "<strong>Vorgebuchter Transfer:</strong> Fester Preis, Fahrer an der Ankunft — bei später Landung, mit Kindern oder viel Gepäck."],
     (KIWI_LIS, "Transfer vom Flughafen Lissabon buchen"), None),
  faq=None,  # visible FAQ exists; schema built from it
 ),
}

def set_meta(s, attr, key, value):
    v = html.escape(value, quote=True)
    return re.sub(r'<meta[^>]*%s="%s"[^>]*>' % (attr, re.escape(key)), lambda m: re.sub(r'content="[^"]*"', f'content="{v}"', m.group(0)), s)

def quick_html(q):
    head, items, cta1, cta2 = q
    c2 = f' <a href="{cta2[0]}" {GYG}>{cta2[1]}</a>' if cta2 else ""
    return ('<!-- ia:quick --><aside class="ia-quick" aria-label="' + html.escape(head) + '"><div><p class="kicker">' + html.escape(head) + "</p><ul>"
            + "".join(f"<li>{i}</li>" for i in items) + f'</ul></div><div><a class="book" href="{cta1[0]}" {GYG}>{cta1[1]}</a><p class="small" style="margin:.6rem 0 0">{c2.strip()}</p></div></aside><!-- /ia:quick -->')

def faq_html(faq, title="Frequently asked questions"):
    return ('<!-- ia:faq --><section class="ia-faq" aria-labelledby="ia-faq-h"><h2 class="h-section" id="ia-faq-h">' + title + "</h2>"
            + "".join(f"<details><summary>{html.escape(q)}</summary><p>{html.escape(a)}</p></details>" for q, a in faq) + "</section><!-- /ia:faq -->")

for rel, cfg in PAGES.items():
    f = ROOT / rel; s = f.read_text(encoding="utf-8")
    s = re.sub(r"<title>.*?</title>", f"<title>{html.escape(cfg['title'])} | Day in Portugal</title>", s, flags=re.S)
    for a, k, v in (("name", "description", cfg["desc"]), ("property", "og:description", cfg["desc"]), ("name", "twitter:description", cfg["desc"]),
                    ("property", "og:title", cfg["title"]), ("name", "twitter:title", cfg["title"])):
        s = set_meta(s, a, k, v)
    if cfg["h1"]:
        s = re.sub(r"(<h1[^>]*>).*?(</h1>)", lambda m: m.group(1) + html.escape(cfg["h1"], quote=False) + m.group(2), s, count=1, flags=re.S)
    s = re.sub(r"\s*<!-- ia:quick -->.*?<!-- /ia:quick -->", "", s, flags=re.S)
    m = re.search(r'<p class="lead-muted">.*?</p>', s, re.S)
    s = s[:m.end()] + "\n    " + quick_html(cfg["quick"]) + s[m.end():]
    s = re.sub(r"(<!-- /ia:quick -->)(?:[ \t]*\n)+", r"\1\n\n", s)
    faq = cfg["faq"]
    s = re.sub(r"\s*<!-- ia:faq -->.*?<!-- /ia:faq -->", "", s, flags=re.S)
    if faq:
        m = re.search(r"<!-- ia:related -->", s) or re.search(r'<section class="follow"', s)
        s = s[:m.start()] + faq_html(faq) + "\n    " + s[m.start():]
    else:
        # build schema from the visible h3 Q&A under "Häufige Fragen"
        sec = re.search(r"Häufige Fragen</h2>(.*?)(?:<h2|<p class=\"small|<div class=\"note|<!-- ia:)", s, re.S)
        faq = []
        if sec:
            for q, a in re.findall(r"<h3[^>]*>(.*?)</h3>\s*<p[^>]*>(.*?)</p>", sec.group(1), re.S):
                faq.append((html.unescape(re.sub("<[^>]+>", "", q)).strip(), html.unescape(re.sub("<[^>]+>", "", a)).strip()))
    ent = [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faq]
    def fix(mm):
        d = json.loads(mm.group(2)); lst = d if isinstance(d, list) else [d]
        lst = [x for x in lst if x.get("@type") != "FAQPage"]
        lst.append({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": ent})
        return mm.group(1) + json.dumps(lst, ensure_ascii=False) + mm.group(3)
    s = re.sub(r'(<script type="application/ld\+json">)(.*?)(</script>)', fix, s, count=1, flags=re.S)
    f.write_text(s, encoding="utf-8")
    print(rel, "faq", len(faq))
