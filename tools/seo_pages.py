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
  title="Braga and Guimarães day trip from Porto (2026): tour, train and prices",
  desc="Braga and Guimarães day trip from Porto: guided tours of about 9 hours with Bom Jesus, Braga cathedral and Guimarães castle, or the €3.60 CP train to one town. Times, prices, FAQ.",
  h1="Braga and Guimarães day trip from Porto: Bom Jesus in the morning, the castle after lunch.",
  quick=("Quick answer", [
     "<strong>Both towns in one day:</strong> a guided tour from Porto, about 9 hours, Bom Jesus and Braga first, Guimarães after lunch.",
     "<strong>One town on your own:</strong> CP urban train from São Bento, about 1 hour to Braga and a little more to Guimarães, <strong>€3.60</strong> single (CP 2026 fares).",
     "<strong>No direct train between Braga and Guimarães</strong> — you need a bus, which is why the tour wins for both."],
     (GYG_BG, "Compare Braga &amp; Guimarães tours on GetYourGuide"), (TQ_BG, "or on Tiqets")),
  faq=[
   ("Can you do Braga and Guimarães in one day from Porto?", "Yes. A guided day trip covers Bom Jesus, Braga’s centre and Guimarães in about nine hours. By train it is realistic for one town, because the two towns are on different CP lines and you need a bus between them."),
   ("How long is the train from Porto to Braga or Guimarães?", "About an hour to Braga and roughly an hour and a quarter to Guimarães on CP urban trains from Porto São Bento or Campanhã. A single costs €3.60 on CP’s 2026 fare table. Check the timetable on cp.pt before you go."),
   ("Is Braga or Guimarães better for a day trip from Porto?", "Guimarães for the medieval centre and the castle tied to the founding of Portugal; Braga for the cathedral and the Bom Jesus stairway. If you can only pick one by train, Guimarães is smaller and easier on foot."),
   ("What does a Braga and Guimarães tour include?", "Usually transport from central Porto, a guide, Bom Jesus, Braga cathedral and Guimarães castle. Some tours include entry tickets, hotel pickup or lunch — check the tour page, because prices and inclusions vary."),
  ]),
 "douro-day.html": dict(
  title="Douro Valley day trip from Porto (2026): best tours from €85, train or car",
  desc="Douro Valley day trip from Porto: full-day tours from €85 with wineries, lunch and a boat in Pinhão, the CP train to Régua or Pinhão (buses on part of the line until 24 March 2027), or a car on the N222.",
  h1=None,
  quick=("Quick answer", [
     "<strong>Easiest:</strong> a full-day Douro Valley tour from Porto, about 9–10 hours, two wineries, lunch and a short boat in Pinhão — from about €85 on partner pages (checked 24/10/2026).",
     "<strong>Cheapest:</strong> CP train from Porto São Bento to Régua or Pinhão, about 2 to 2½ hours.",
     "<strong>Winter works:</strong> from 3 November 2026 to 24 March 2027 CP runs replacement buses between Marco de Canaveses and Régua; the river section Régua–Pinhão–Pocinho stays on rails (CP timetable valid from 3/11/2026)."],
     (GYG_DOURO, "See Douro Valley day tours from Porto"), None),
  faq=[
   ("Is the six-bridges cruise the same as a Douro Valley day trip?", "No. The six-bridges cruise is a short harbour loop in Porto and Gaia. A Douro Valley day trip goes about two hours inland to Régua, Pinhão and the terraced vineyards."),
   ("What is the best way to do a Douro Valley day trip from Porto?", "For most visitors an organised day trip: pickup in Porto, two wineries with tastings, lunch and a boat in Pinhão, and nobody has to drive after the wine. The train is cheaper; a car is the most flexible but someone stays sober."),
   ("What is the cheapest Douro day trip from Porto?", "The CP train from Porto São Bento or Campanhã to Régua or Pinhão. Between 3 November 2026 and 24 March 2027 part of the line, Marco de Canaveses to Régua, runs as replacement buses, so allow extra time and check cp.pt."),
   ("How long is a Douro Valley day trip?", "Organised tours take about 9 to 10 hours from Porto. By train Pinhão is roughly two and a half hours each way, so leave early."),
   ("When is the best time to visit the Douro Valley?", "Late September into October for the harvest — busiest and most beautiful. Spring is green and quieter; July and August are hot inland."),
  ]),
 "porto-airport-transfer.html": dict(
  title="Porto airport transfer to the city centre (2026): metro €2.30, taxi or driver",
  desc="Porto airport transfers compared: metro line E to Trindade in about 30 minutes for €2.30 (+€0.60 card), taxi or Uber at arrivals, or a pre-booked private transfer with a fixed price. When each makes sense.",
  h1="Porto airport transfer to the city centre: metro, taxi or private driver.",
  quick=("Quick answer", [
     "<strong>Metro line E (violet):</strong> airport to Trindade in about half an hour. Z4 ticket <strong>€2.30</strong> plus <strong>€0.60</strong> for the rechargeable Andante card, or tap a contactless bank card at the marked validators (Metro do Porto 2026 prices).",
     "<strong>Taxi or Uber:</strong> from outside arrivals, door to door — simplest for two or three people with bags.",
     "<strong>Pre-booked private transfer:</strong> a driver with your name, a fixed price, flight tracking — the calm option late at night, with children or a group."],
     (WP, "Book a Porto airport transfer"), (KIWI_OPO, "Fixed-price cars on Kiwitaxi")),
  faq=[
   ("How do I get from Porto airport to the city centre?", "Take metro line E (violet) from the station next to arrivals to Trindade, about 30 minutes; change there for São Bento or Gaia. A taxi, Uber or a pre-booked transfer goes door to door."),
   ("How much is the metro from Porto airport?", "A Z4 single costs €2.30 in 2026, plus €0.60 for the rechargeable Andante card if you do not have one (Metro do Porto price table, in force from 1 January 2026). On line E you can also pay with a contactless bank card at marked validators."),
   ("Is a private transfer from Porto airport worth it?", "When you land late, travel with children or heavy luggage, or are three or more people splitting one fixed price. Otherwise the metro is quick and cheap."),
   ("Does the Porto metro run all night?", "No. It runs from early morning until after midnight, not around the clock. If you land very late, check the Metro do Porto timetable or book a transfer."),
   ("How do I get from Porto airport to Póvoa de Varzim or Vila do Conde?", "Take metro line E and change at Verdes to line B (red), or book a transfer straight to the door."),
  ]),
 "gaia-port-cellars.html": dict(
  title="Port wine cellars in Gaia (2026): which tour to book, prices and tips",
  desc="Which port wine cellar to visit in Vila Nova de Gaia: Taylor’s (€25 with three ports), Cálem, Cockburn’s, Fonseca, Burmester or Poças. What each tour is like, prices, and where to book a timed slot.",
  h1="Port wine cellars in Gaia: one is enough. Pick the right one.",
  quick=("Quick answer", [
     "<strong>First time, no plan:</strong> Taylor’s — self-paced audio tour in 13 languages and three ports, <strong>€25</strong> (ages 8–17 €9), open daily 10:00–18:15 (Taylor’s FAQ, checked 13/11/2026).",
     "<strong>Guided and by the river:</strong> Cálem — museum, cellar and tasting in about an hour; an evening version adds fado.",
     "<strong>Book a time in summer</strong>: walk-ins wait. Most riverfront lodges charge roughly €20–25 for a visit with tasting."],
     (TQ_TAYLOR, "Book Taylor’s Port Cellars"), (GYG_GAIA, "Compare Gaia cellar tours on GetYourGuide")),
  faq=[
   ("Which port wine cellar in Gaia is best?", "For a first visit, Taylor’s (self-paced, three ports, garden view) or Cálem (guided, on the riverfront). For a quieter, smaller visit try Burmester, Fonseca or the family-run Poças."),
   ("How much does a port cellar tour cost in Gaia?", "Taylor’s costs €25 for adults with three ports and €9 for ages 8 to 17, under 8 free (Taylor’s FAQ, checked 13/11/2026). Most riverfront lodges charge roughly €20–25; tastings of older ports cost more."),
   ("Do I need to book a port cellar visit in advance?", "In summer and at weekends, yes — book a time slot. Taylor’s sells tickets on site subject to availability, but walk-ins can wait."),
   ("How many port cellars should I visit?", "One, maybe two. They all explain the same process, and after the second tasting they taste the same. Do one cellar, then eat."),
   ("How do I get to the cellars from Porto?", "Walk across the lower deck of the Dom Luís I bridge from Ribeira; the lodges are on the Gaia riverfront and the lanes above it. The Gaia cable car runs back up to the top of the bridge."),
  ]),
 "de/lisbon-airport-transfer.html": dict(
  title="Lissabon Flughafen Transfer ins Zentrum (2026): Metro 1,92 €, Taxi oder Fahrer",
  desc="Flughafen Lissabon (LIS) ins Zentrum: Metro der roten Linie nach Saldanha in 18 Minuten für 1,92 €, Taxi für 16–19 € ohne Verkehr oder ein vorgebuchter Transfer zum Festpreis. Wann was passt.",
  h1="Lissabon Flughafen Transfer: mit Metro, Taxi oder Fahrer ins Zentrum.",
  quick=("Kurz gesagt", [
     "<strong>Metro, rote Linie:</strong> Aeroporto bis Saldanha etwa 18 Minuten, <strong>1,92 €</strong>; kontaktlose Bankkarte am Entwerter genügt (metrolisboa.pt, geprüft am 6. November 2026).",
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
