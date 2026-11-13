#!/usr/bin/env python3
"""Site information architecture: hubs, breadcrumbs, related guides, footer sitemap,
search index and the per-language page manifest. Idempotent: run again after adding pages.

    python3 tools/site_ia.py
"""
import json, os, re, html, glob
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
LANGS = ["en", "es", "fr", "de", "pt"]
SITE = "https://dayinportugal.com"

# ---- taxonomy (English bare paths). First list = primary category of each page.
CATS = {
  "porto":    {"hub": "/porto-guide", "img": "/img/cais-da-ribeira-1600.webp", "pages": [
      "/porto-3-days", "/book", "/book-first", "/stay", "/gaia-port-cellars", "/porto-river-cruise",
      "/porto-food-tours", "/fado-in-porto", "/livraria-lello-tickets", "/bring", "/rent-car"]},
  "daytrips": {"hub": "/porto-day-trips", "img": "/img/douro-valley-1600.webp", "pages": [
      "/douro-day", "/braga-guimaraes-day-trip", "/aveiro-day-trip", "/povoa-base",
      "/sintra-day-trip", "/cascais-day-trip", "/evora-day-trip"]},
  "lisbon":   {"hub": "/lisbon-guide", "img": "/img/lisboa/lisbon-from-sao-jorge-1600.webp", "pages": [
      "/lisbon-3-days", "/lisbon-where-to-stay", "/lisbon-book-first"]},
  "airport":  {"hub": "/airport-transfers", "img": "/img/porto-airport.webp", "pages": [
      "/porto-airport-transfer", "/lisbon-airport-transfer"]},
  "moving":   {"hub": "/moving-to-portugal", "img": "/img/lisbon-praca-comercio.webp", "pages": [
      "/move-to-portugal-2026", "/portugal-d7-visa", "/portugal-d8-digital-nomad-visa", "/d7-vs-d8-visa-portugal",
      "/portugal-visa-income-calculator", "/portugal-visa-document-checklist", "/portugal-nif-niss",
      "/portugal-aima-residence-permit", "/portugal-family-reunification", "/portugal-tax-residency-2026",
      "/open-a-bank-account-in-portugal", "/renting-in-portugal-as-a-foreigner", "/portugal-healthcare-for-expats",
      "/portugal-cost-of-living-2026", "/lisbon-cost-of-living-2026", "/porto-cost-of-living-2026",
      "/moving-to-portugal-from-the-uk", "/moving-to-portugal-from-the-usa"]},
}
# hub card lists (may include pages of other categories)
HUB_LIST = {
  "porto": CATS["porto"]["pages"] + ["/porto-airport-transfer", "/porto-day-trips", "/douro-day", "/povoa-base"],
  "daytrips": None,  # existing page, not generated
  "lisbon": CATS["lisbon"]["pages"] + ["/sintra-day-trip", "/cascais-day-trip", "/evora-day-trip", "/lisbon-airport-transfer"],
  "airport": ["/porto-airport-transfer", "/lisbon-airport-transfer", "/rent-car", "/book-first", "/lisbon-book-first"],
  "moving": CATS["moving"]["pages"],
}
MOVING_GROUPS = [
  ("visas", ["/move-to-portugal-2026", "/portugal-d7-visa", "/portugal-d8-digital-nomad-visa", "/d7-vs-d8-visa-portugal",
             "/portugal-visa-income-calculator", "/portugal-visa-document-checklist", "/portugal-aima-residence-permit",
             "/portugal-family-reunification"]),
  ("papers", ["/portugal-nif-niss", "/open-a-bank-account-in-portugal", "/portugal-tax-residency-2026",
              "/portugal-healthcare-for-expats", "/renting-in-portugal-as-a-foreigner"]),
  ("costs", ["/portugal-cost-of-living-2026", "/lisbon-cost-of-living-2026", "/porto-cost-of-living-2026"]),
  ("from", ["/moving-to-portugal-from-the-uk", "/moving-to-portugal-from-the-usa"]),
]
BUSINESS = ["/menu-qr", "/qr-avaliacoes", "/avaliacoes-google", "/cartao-de-grupo", "/ecra-tv", "/vsme-simples", "/demos/"]
POPULAR = ["/douro-day", "/braga-guimaraes-day-trip", "/porto-airport-transfer", "/gaia-port-cellars", "/lisbon-airport-transfer", "/portugal-d7-visa"]

T = {
 "en": dict(home="Home", porto="Porto", daytrips="Day trips", lisbon="Lisbon", airport="Airport transfers", moving="Moving to Portugal",
            business="For businesses", shop="Shop", about="About", related="Related guides", keep="Keep planning", all="See all",
            en_only="in English", privacy="Privacy", earn="How we earn", credits="Photo credits", cookies="Cookie settings",
            topics="Browse by topic", topics_lead="Pick a starting point. Every guide has prices checked on official or partner pages.",
            popular="Most read right now", search_ph="Search: Douro day trip, D7 visa, airport…", search_btn="Search", search_label="Search the guide",
            noresults="No guide matches yet. Try ‘Douro’, ‘visa’ or ‘airport’.", guides="guides", hub_kicker="Guides",
            visas="Visas and permits", papers="Paperwork, tax and health", costs="Cost of living", frm="By country"),
 "es": dict(home="Inicio", porto="Oporto", daytrips="Excursiones", lisbon="Lisboa", airport="Traslados del aeropuerto", moving="Mudarse a Portugal",
            business="Para negocios", shop="Tienda", about="Sobre la guía", related="Guías relacionadas", keep="Sigue planificando", all="Ver todas",
            en_only="en inglés", privacy="Privacidad", earn="Cómo ganamos dinero", credits="Créditos de fotos", cookies="Configuración de cookies",
            topics="Explora por tema", topics_lead="Elige un punto de partida. Cada guía tiene precios comprobados en páginas oficiales o de socios.",
            popular="Lo más leído ahora", search_ph="Busca: excursión al Douro, visado D7, aeropuerto…", search_btn="Buscar", search_label="Buscar en la guía",
            noresults="Ninguna guía coincide. Prueba ‘Douro’, ‘visado’ o ‘aeropuerto’.", guides="guías", hub_kicker="Guías",
            visas="Visados y permisos", papers="Trámites, impuestos y salud", costs="Coste de vida", frm="Por país"),
 "fr": dict(home="Accueil", porto="Porto", daytrips="Excursions", lisbon="Lisbonne", airport="Transferts aéroport", moving="S’installer au Portugal",
            business="Pour les entreprises", shop="Boutique", about="À propos", related="Guides liés", keep="Continuer à préparer", all="Tout voir",
            en_only="en anglais", privacy="Confidentialité", earn="Comment nous gagnons de l’argent", credits="Crédits photos", cookies="Paramètres des cookies",
            topics="Explorer par thème", topics_lead="Choisissez un point de départ. Chaque guide a des prix vérifiés sur des pages officielles ou partenaires.",
            popular="Les plus lus en ce moment", search_ph="Rechercher : vallée du Douro, visa D7, aéroport…", search_btn="Rechercher", search_label="Rechercher dans le guide",
            noresults="Aucun guide ne correspond. Essayez « Douro », « visa » ou « aéroport ».", guides="guides", hub_kicker="Guides",
            visas="Visas et titres de séjour", papers="Démarches, impôts et santé", costs="Coût de la vie", frm="Par pays"),
 "de": dict(home="Start", porto="Porto", daytrips="Tagesausflüge", lisbon="Lissabon", airport="Flughafentransfers", moving="Nach Portugal auswandern",
            business="Für Unternehmen", shop="Shop", about="Über uns", related="Passende Guides", keep="Weiter planen", all="Alle ansehen",
            en_only="auf Englisch", privacy="Datenschutz", earn="Wie wir Geld verdienen", credits="Bildnachweise", cookies="Cookie-Einstellungen",
            topics="Nach Thema stöbern", topics_lead="Wählen Sie einen Einstieg. Jeder Guide hat Preise, die auf offiziellen oder Partnerseiten geprüft sind.",
            popular="Gerade viel gelesen", search_ph="Suchen: Douro-Tagesausflug, D7-Visum, Flughafen…", search_btn="Suchen", search_label="Im Guide suchen",
            noresults="Kein Guide passt. Versuchen Sie „Douro“, „Visum“ oder „Flughafen“.", guides="Guides", hub_kicker="Guides",
            visas="Visa und Aufenthaltstitel", papers="Behörden, Steuern und Gesundheit", costs="Lebenshaltungskosten", frm="Nach Land"),
 "pt": dict(home="Início", porto="Porto", daytrips="Excursões", lisbon="Lisboa", airport="Transfers do aeroporto", moving="Mudar para Portugal",
            business="Para negócios", shop="Loja", about="Sobre", related="Guias relacionados", keep="Continue a planear", all="Ver todos",
            en_only="em inglês", privacy="Privacidade", earn="Como ganhamos dinheiro", credits="Créditos das fotos", cookies="Definições de cookies",
            topics="Explorar por tema", topics_lead="Escolha um ponto de partida. Cada guia tem preços confirmados em páginas oficiais ou de parceiros.",
            popular="Mais lidos agora", search_ph="Pesquisar: Douro, visto D7, aeroporto…", search_btn="Pesquisar", search_label="Pesquisar no guia",
            noresults="Nenhum guia corresponde. Experimente ‘Douro’, ‘visto’ ou ‘aeroporto’.", guides="guias", hub_kicker="Guias",
            visas="Vistos e autorizações", papers="Burocracia, impostos e saúde", costs="Custo de vida", frm="Por país"),
}
HUB_TEXT = {
 "porto": {
  "en": ("Porto travel guide: what to book, where to stay, what to skip", "Porto guide", "Every Porto guide in one place: 3-day itinerary, port cellars in Gaia, the six bridges cruise, fado, Livraria Lello, where to stay and the airport transfer."),
  "es": ("Guía de Oporto: qué reservar, dónde dormir y qué evitar", "Guía de Oporto", "Todas las guías de Oporto en un solo lugar: itinerario de 3 días, bodegas de Gaia, crucero de los seis puentes, fado, Livraria Lello, dónde dormir y el traslado del aeropuerto."),
  "fr": ("Guide de Porto : quoi réserver, où dormir, quoi éviter", "Guide de Porto", "Tous nos guides de Porto au même endroit : itinéraire de 3 jours, caves de Gaia, croisière des six ponts, fado, Livraria Lello, où dormir et le transfert depuis l’aéroport."),
  "de": ("Porto-Reiseführer: was buchen, wo schlafen, was auslassen", "Porto-Guide", "Alle Porto-Guides an einem Ort: 3-Tage-Route, Portweinkeller in Gaia, Sechs-Brücken-Fahrt, Fado, Livraria Lello, Unterkünfte und der Flughafentransfer."),
  "pt": ("Guia do Porto: o que reservar, onde dormir, o que evitar", "Guia do Porto", "Todos os guias do Porto num só sítio: roteiro de 3 dias, caves de Gaia, cruzeiro das seis pontes, fado, Livraria Lello, onde dormir e o transfer do aeroporto."),
 },
 "lisbon": {
  "en": ("Lisbon travel guide: 3 days, where to stay and day trips", "Lisbon guide", "Every Lisbon guide in one place: a 3-day itinerary, where to stay, what to book first, Sintra, Cascais and Évora day trips, and the airport transfer."),
  "es": ("Guía de Lisboa: 3 días, dónde dormir y excursiones", "Guía de Lisboa", "Todas las guías de Lisboa: itinerario de 3 días, dónde dormir, qué reservar antes, excursiones a Sintra, Cascais y Évora, y el traslado del aeropuerto."),
  "fr": ("Guide de Lisbonne : 3 jours, où dormir et excursions", "Guide de Lisbonne", "Tous nos guides de Lisbonne : itinéraire de 3 jours, où dormir, quoi réserver avant, excursions à Sintra, Cascais et Évora, et le transfert depuis l’aéroport."),
  "de": ("Lissabon-Reiseführer: 3 Tage, Unterkünfte und Tagesausflüge", "Lissabon-Guide", "Alle Lissabon-Guides: 3-Tage-Route, wo übernachten, was vorher buchen, Ausflüge nach Sintra, Cascais und Évora und der Flughafentransfer."),
  "pt": ("Guia de Lisboa: 3 dias, onde dormir e excursões", "Guia de Lisboa", "Todos os guias de Lisboa: roteiro de 3 dias, onde dormir, o que reservar antes, excursões a Sintra, Cascais e Évora, e o transfer do aeroporto."),
 },
 "airport": {
  "en": ("Porto and Lisbon airport transfers: metro, taxi or private driver", "Airport transfers", "How to get from Porto (OPO) and Lisbon (LIS) airports to the city: metro times and fares, taxi and Uber prices, and pre-booked private transfers with fixed prices."),
  "es": ("Traslados de los aeropuertos de Oporto y Lisboa: metro, taxi o conductor", "Traslados del aeropuerto", "Cómo llegar del aeropuerto de Oporto (OPO) y de Lisboa (LIS) a la ciudad: metro, taxi y Uber, y traslados privados con precio cerrado."),
  "fr": ("Transferts aéroport de Porto et Lisbonne : métro, taxi ou chauffeur", "Transferts aéroport", "Aller des aéroports de Porto (OPO) et Lisbonne (LIS) au centre : métro, taxi et Uber, et transferts privés à prix fixe réservés à l’avance."),
  "de": ("Flughafentransfer Porto und Lissabon: Metro, Taxi oder Fahrer", "Flughafentransfers", "Vom Flughafen Porto (OPO) und Lissabon (LIS) in die Stadt: Metro, Taxi und Uber sowie vorab gebuchte private Transfers zum Festpreis."),
  "pt": ("Transfers dos aeroportos do Porto e de Lisboa: metro, táxi ou motorista", "Transfers do aeroporto", "Como ir dos aeroportos do Porto (OPO) e de Lisboa (LIS) para o centro: metro, táxi e Uber, e transfers privados com preço fechado."),
 },
 "moving": {
  "en": ("Moving to Portugal in 2026: every visa, paperwork and cost guide", "Moving to Portugal", "All our moving-to-Portugal guides: D7 and D8 visas, the income calculator, NIF and NISS, AIMA, tax residency, banking, renting, healthcare and the cost of living, with official 2026 figures."),
  "es": ("Mudarse a Portugal en 2026: visados, trámites y costes", "Mudarse a Portugal", "Todas nuestras guías para mudarse a Portugal: visados D7 y D8, calculadora de ingresos, NIF y NISS, AIMA, residencia fiscal, banco, alquiler, sanidad y coste de vida."),
  "fr": ("S’installer au Portugal en 2026 : visas, démarches et coûts", "S’installer au Portugal", "Tous nos guides pour s’installer au Portugal : visas D7 et D8, calculateur de revenus, NIF et NISS, AIMA, résidence fiscale, banque, location, santé et coût de la vie."),
  "de": ("Nach Portugal auswandern 2026: Visa, Behörden und Kosten", "Nach Portugal auswandern", "Alle Guides zum Umzug nach Portugal: D7- und D8-Visum, Einkommensrechner, NIF und NISS, AIMA, Steuerwohnsitz, Bankkonto, Mieten, Gesundheit und Lebenshaltungskosten."),
  "pt": ("Mudar para Portugal em 2026: vistos, burocracia e custos", "Mudar para Portugal", "Todos os nossos guias para quem se muda para Portugal: vistos D7 e D8, calculadora de rendimentos, NIF e NISS, AIMA, residência fiscal, banco, arrendamento, saúde e custo de vida."),
 },
}

def lp(lang, bare):
    if lang == "en": return bare
    if bare == "/": return f"/{lang}/"
    return f"/{lang}{bare}"

def fs_for(url):
    p = ROOT / url.lstrip("/")
    if url.endswith("/"): return p / "index.html"
    if url.endswith(".html"): return p
    return Path(str(p) + ".html")

def exists(lang, bare):
    return fs_for(lp(lang, bare)).is_file()

def url_of(rel):
    u = "/" + rel
    if u.endswith("/index.html"): return u[:-10]
    return u[:-5] if not u.endswith("/loja.html") else u

def bare_of(url):
    b = re.sub(r"^/(es|fr|de|pt)(?=/|$)", "", url) or "/"
    return b

def strip_tags(s):
    return html.unescape(re.sub(r"<[^>]+>", "", s)).strip()

# ---- read metadata
LABELS = json.loads(os.popen(f"node -e \"global.window={{}};require('{ROOT}/i18n/menu-labels.js');console.log(JSON.stringify(window.DIP_I18N))\"").read())
MENU_EN = dict(re.findall(r'href:\s*"([^"]+)",\s*label:\s*"([^"]+)"', (ROOT / "menu.js").read_text()))

META = {}
def meta(lang, bare):
    key = (lang, bare)
    if key in META: return META[key]
    f = fs_for(lp(lang, bare))
    if not f.is_file(): META[key] = None; return None
    s = f.read_text(encoding="utf-8")
    s = re.sub(r"<!-- ia:(related|home|search) -->.*?<!-- /ia:\1 -->", "", s, flags=re.S)
    h1 = re.search(r"<h1[^>]*>(.*?)</h1>", s, re.S)
    d = re.search(r'<meta[^>]*name="description"[^>]*>', s)
    desc = ""
    if d:
        m = re.search(r'content="([^"]*)"', d.group(0)); desc = html.unescape(m.group(1)) if m else ""
    img = re.search(r"<main.*?<img[^>]*?src=\"(/img/[^\"]+)\"", s, re.S)
    title = strip_tags(h1.group(1)) if h1 else strip_tags(re.search(r"<title>(.*?)</title>", s, re.S).group(1).split("|")[0])
    title = title.rstrip(". ")
    short = None
    if lang == "en": short = MENU_EN.get(bare) or MENU_EN.get(bare + ".html")
    else: short = (LABELS["items"].get(lang) or {}).get(bare)
    META[key] = {"title": title, "short": short or title, "desc": desc, "img": img.group(1) if img else None}
    return META[key]

CARD_IMG = {
  "/move-to-portugal-2026": "/img/hero-ribeira-from-gaia-1600.webp",
  "/portugal-visa-income-calculator": "/img/azulejo-tile-1600.webp",
  "/portugal-visa-document-checklist": "/img/livraria-lello.webp",
  "/d7-vs-d8-visa-portugal": "/img/lisboa/largo-do-chiado-1600.webp",
  "/porto-cost-of-living-2026": "/img/porto-from-gaia-1600.webp",
  "/portugal-d8-digital-nomad-visa": "/img/lisboa/principe-real-1600.webp",
  "/portugal-family-reunification": "/img/dom-luis-bridge-jardim-do-morro-1600.webp",
  "/menu-qr": "/img/bolhao-market.webp", "/qr-avaliacoes": "/img/rua-de-cedofeita-1600.webp",
  "/avaliacoes-google": "/img/claus-porto-soap-800.webp", "/cartao-de-grupo": "/img/port-barrels-croft-1600.webp",
  "/ecra-tv": "/img/fado-porto.webp", "/vsme-simples": "/img/azulejo-tile-1600.webp", "/demos/": "/img/rua-de-cedofeita-1600.webp",
}
CARD_DIR = ROOT / "img" / "cards"
def card_img(src):
    """640px-wide WebP copy of a real site photo for cards."""
    if not src: src = "/img/cais-da-ribeira-1600.webp"
    name = Path(src).stem.replace("-1600", "").replace("-800", "") + "-640.webp"
    out = CARD_DIR / name
    if not out.exists():
        CARD_DIR.mkdir(exist_ok=True)
        big = ROOT / src.lstrip("/")
        alt = Path(str(big).replace("-800.", "-1600."))
        if alt.exists(): big = alt
        im = Image.open(big).convert("RGB")
        w, h = im.size
        tw, th = 640, 427
        r = max(tw / w, th / h)
        im = im.resize((round(w * r), round(h * r)), Image.LANCZOS)
        w, h = im.size
        im = im.crop(((w - tw) // 2, (h - th) // 2, (w - tw) // 2 + tw, (h - th) // 2 + th))
        im.save(out, "WEBP", quality=70, method=6)
    return "/img/cards/" + name

def cat_of(bare):
    for c, v in CATS.items():
        if bare in v["pages"]: return c
    if bare in BUSINESS: return "business"
    for c, v in CATS.items():
        if bare == v["hub"]: return "hub:" + c
    return None

def esc(s): return html.escape(s, quote=True)

def card(lang, bare, tag=None, alt_desc=True):
    m = meta(lang, bare); en_only = False
    if not m:
        m = meta("en", bare); en_only = True
    href = lp("en" if en_only else lang, bare)
    img_src = CARD_IMG.get(bare, m["img"])
    t = T[lang]
    desc = m["desc"]
    if len(desc) > 125: desc = desc[:122].rsplit(" ", 1)[0] + "…"
    badge = f'<span class="ia-badge">{esc(t["en_only"])}</span>' if en_only and lang != "en" else ""
    tagh = f'<span class="ia-tag">{esc(tag)}</span>' if tag else ""
    return (f'<a class="ia-card" href="{href}"{" hreflang=\"en\"" if en_only and lang != "en" else ""}>'
            f'<img src="{card_img(img_src)}" width="640" height="427" alt="" loading="lazy" decoding="async" />'
            f'<span class="ia-card-body">{tagh}<strong>{esc(m["short"] if len(m["short"]) < len(m["title"]) and len(m["short"])>12 else m["title"])}</strong>'
            f'<span class="ia-desc">{esc(desc)}</span>{badge}</span></a>')

# ---- per-page injections
def crumbs_html(lang, bare):
    t = T[lang]; c = cat_of(bare); m = meta(lang, bare)
    items = [(t["home"], lp(lang, "/"))]
    if c and not c.startswith("hub:") and c != "business":
        hub = CATS[c]["hub"]
        hl = lang if exists(lang, hub) else "en"
        items.append((t[c] if c != "porto" else HUB_TEXT["porto"][lang][1], lp(hl, hub)))
    elif c == "business":
        items.append((t["business"], lp(lang if exists(lang, "/demos/") else "en", "/demos/")))
    name = m["short"] if m else ""
    if c and c.startswith("hub:"): name = HUB_TEXT[c[4:]][lang][1] if c[4:] in HUB_TEXT else m["title"]
    aria = {"en": "Breadcrumb", "es": "Migas de pan", "fr": "Fil d’Ariane", "de": "Brotkrumen", "pt": "Percurso"}[lang]
    parts = [f'<a href="{u}">{esc(n)}</a>' for n, u in items]
    nav = f'<nav class="crumbs" aria-label="{aria}"><ol>' + "".join(f"<li>{p}</li>" for p in parts) + f'<li aria-current="page">{esc(name)}</li></ol></nav>'
    ld = [{"@type": "ListItem", "position": i + 1, "name": n, "item": SITE + u} for i, (n, u) in enumerate(items)]
    ld.append({"@type": "ListItem", "position": len(ld) + 1, "name": name, "item": SITE + lp(lang, bare)})
    return nav, ld

def related_html(lang, bare):
    c = cat_of(bare)
    if not c or c.startswith("hub:"): return ""
    t = T[lang]
    if c == "business":
        pool = [p for p in BUSINESS if p != bare and p != "/demos/"]
        hub, hubname = "/demos/", t["business"]
    else:
        pool = [p for p in CATS[c]["pages"] if p != bare]
        if c == "airport": pool += ["/rent-car", "/book-first"]
        if c == "daytrips": pool = ([p for p in pool if p in ("/sintra-day-trip", "/cascais-day-trip", "/evora-day-trip")] if bare in ("/sintra-day-trip", "/cascais-day-trip", "/evora-day-trip") else [p for p in pool if p not in ("/sintra-day-trip", "/cascais-day-trip", "/evora-day-trip")]) + ["/porto-3-days"]
        if c == "lisbon": pool += ["/sintra-day-trip", "/lisbon-airport-transfer"]
        hub, hubname = CATS[c]["hub"], (t[c] if c != "porto" else HUB_TEXT["porto"][lang][1])
    # prefer pages that exist in this language
    pool = sorted(pool, key=lambda p: 0 if exists(lang, p) else 1)[:4]
    if lang != "en" and c == "business" and not exists(lang, "/demos/"): pass
    cards = "".join(card(lang, p) for p in pool)
    hl = lang if exists(lang, hub) else "en"
    return (f'<!-- ia:related --><section class="ia-related" aria-labelledby="ia-rel-h"><div class="ia-head"><div><p class="kicker">{esc(t["keep"])}</p>'
            f'<h2 class="h-sub" id="ia-rel-h">{esc(t["related"])}</h2></div><a class="ia-all" href="{lp(hl, hub)}">{esc(t["all"])}: {esc(hubname)} →</a></div>'
            f'<div class="ia-grid">{cards}</div></section><!-- /ia:related -->')

def footer_map(lang):
    t = T[lang]
    def li(bare):
        m = meta(lang, bare); l = lang
        if not m: m = meta("en", bare); l = "en"
        if not m: return ""
        return f'<li><a href="{lp(l, bare)}">{esc(m["short"])}</a></li>'
    def col(head, hub, pages):
        hl = lang if exists(lang, hub) else "en"
        return (f'<div class="foot-col"><p class="foot-h"><a href="{lp(hl, hub)}">{esc(head)}</a></p><ul class="foot-links">'
                + "".join(li(p) for p in pages) + "</ul></div>")
    cols = [
      col(HUB_TEXT["porto"][lang][1], "/porto-guide", ["/porto-3-days", "/book", "/stay", "/gaia-port-cellars", "/porto-river-cruise", "/fado-in-porto", "/livraria-lello-tickets", "/bring"]),
      col(t["daytrips"], "/porto-day-trips", ["/douro-day", "/braga-guimaraes-day-trip", "/aveiro-day-trip", "/povoa-base", "/sintra-day-trip", "/cascais-day-trip", "/evora-day-trip"]),
      col(t["lisbon"] + " · " + t["airport"], "/lisbon-guide", ["/lisbon-3-days", "/lisbon-where-to-stay", "/lisbon-book-first", "/airport-transfers", "/porto-airport-transfer", "/lisbon-airport-transfer", "/rent-car"]),
      col(t["moving"], "/moving-to-portugal", ["/move-to-portugal-2026", "/portugal-d7-visa", "/portugal-d8-digital-nomad-visa", "/portugal-visa-income-calculator", "/portugal-nif-niss", "/portugal-tax-residency-2026", "/portugal-cost-of-living-2026"]),
      (f'<div class="foot-col"><p class="foot-h">{esc(t["about"])}</p><ul class="foot-links">'
       f'<li><a href="{lp(lang, "/loja.html") if exists(lang, "/loja.html") else "/loja.html"}">{esc(t["shop"])}</a></li>'
       f'<li><a href="{lp(lang, "/demos/") if exists(lang, "/demos/") else "/demos/"}">{esc(t["business"])}</a></li>'
       f'<li><a href="{lp(lang, "/disclosure")}">{esc(t["earn"])}</a></li><li><a href="{lp(lang, "/privacy")}">{esc(t["privacy"])}</a></li>'
       f'<li><a href="{lp(lang, "/credits")}">{esc(t["credits"])}</a></li><li><a href="mailto:dayinportugal@gmail.com">dayinportugal@gmail.com</a></li></ul></div>'),
    ]
    return '<!-- ia:footmap --><div class="foot-map">' + "".join(cols) + "</div><!-- /ia:footmap -->"

SCRIPT_TAGS = '<script src="/page-langs.js" defer></script><script src="/search.js" defer></script>'

def process(rel):
    path = ROOT / rel
    s = path.read_text(encoding="utf-8")
    orig = s
    url = url_of(rel); lang = (re.match(r"(es|fr|de|pt)/", rel) or [None, "en"])[1]; bare = bare_of(url)
    if "/demos/" in "/" + rel and not rel.endswith("demos/index.html"): return False
    if not re.search(r"menu\.js", s): return False
    # 1. manifest + search scripts, before the first of menu-labels/menu
    if "/page-langs.js" not in s:
        m = re.search(r'<script[^>]*src="/i18n/menu-labels\.js"[^>]*></script>|<script[^>]*src="/menu\.js"[^>]*></script>', s)
        s = s[:m.start()] + SCRIPT_TAGS + s[m.start():]
    # 2. breadcrumbs (only where a crumbs nav exists already)
    if bare not in ("/",) and re.search(r'<nav[^>]*class="crumbs"', s):
        nav, ld = crumbs_html(lang, bare)
        s = re.sub(r'<nav[^>]*class="crumbs"[^>]*>.*?</nav>', lambda _: nav, s, count=1, flags=re.S)
        def fix_ld(mm):
            body = mm.group(2)
            try: data = json.loads(body)
            except Exception: return mm.group(0)
            def walk(o):
                if isinstance(o, list): return [walk(x) for x in o]
                if isinstance(o, dict) and o.get("@type") == "BreadcrumbList": o["itemListElement"] = ld
                return o
            data = walk(data)
            return mm.group(1) + json.dumps(data, ensure_ascii=False) + mm.group(3)
        s = re.sub(r'(<script type="application/ld\+json">)(.*?)(</script>)', fix_ld, s, flags=re.S)
    # 3. related guides
    s = re.sub(r"<!-- ia:related -->.*?<!-- /ia:related -->\s*", "", s, flags=re.S)
    rh = related_html(lang, bare)
    if rh:
        m = re.search(r'<section class="follow"', s) or re.search(r"</main>", s)
        s = s[:m.start()] + rh + "\n    " + s[m.start():]
    # 4. footer sitemap: replace the second foot-col (guide links) or the old map
    fm = footer_map(lang)
    if "<!-- ia:footmap -->" in s:
        s = re.sub(r"<!-- ia:footmap -->.*?<!-- /ia:footmap -->", lambda _: fm, s, flags=re.S)
    else:
        s, n = re.subn(r'<div class="foot-col">\s*<p class="foot-h">[^<]*</p>\s*<ul class="foot-links">.*?</ul>\s*</div>', lambda _: fm, s, count=1, flags=re.S)
    if s != orig:
        path.write_text(s, encoding="utf-8"); return True
    return False

def manifest():
    pages = {l: [] for l in LANGS}
    for f in sorted(glob.glob(str(ROOT / "**/*.html"), recursive=True)):
        rel = os.path.relpath(f, ROOT)
        if rel.startswith(("tools/", "includes/", "node_modules/", "social/")) or rel == "404.html" or rel.endswith("/404.html"): continue
        url = url_of(rel); lang = (re.match(r"(es|fr|de|pt)/", rel) or [None, "en"])[1]
        b = bare_of(url)
        if b != "/" and b.endswith("/"): b = b[:-1]
        pages[lang].append(b)
    (ROOT / "page-langs.js").write_text("/* Generated by tools/site_ia.py: which pages exist in each language. */\nwindow.DIP_PAGES=" + json.dumps(pages, separators=(",", ":")) + ";\n", encoding="utf-8")
    return pages

def search_index(pages):
    out = []
    for lang in LANGS:
        for b in pages[lang]:
            if b.startswith("/demos/") or b in ("/privacy", "/privacidade-servicos", "/credits", "/disclosure", "/douro"): continue
            m = meta(lang, b if b != "/demos" else "/demos/")
            if not m: continue
            c = cat_of(b) or ""
            out.append({"l": lang, "u": lp(lang, b), "t": m["title"], "d": m["desc"][:160], "c": c.replace("hub:", "")})
    (ROOT / "search-index.json").write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")

if __name__ == "__main__":
    import sys
    import hubs_home  # noqa: generates hubs + homepage blocks (same folder)
    hubs_home.run(sys.modules[__name__])
    pages = manifest()
    n = 0
    for f in sorted(glob.glob(str(ROOT / "**/*.html"), recursive=True)):
        rel = os.path.relpath(f, ROOT)
        if rel.startswith(("tools/", "includes/", "social/")): continue
        if process(rel): n += 1
    search_index(pages)
    print("pages updated", n)
