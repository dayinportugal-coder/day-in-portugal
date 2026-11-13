"""Hub pages (/porto-guide, /lisbon-guide, /airport-transfers, /moving-to-portugal in 5 languages)
and the homepage 'browse by topic' + search blocks. Called from site_ia.py."""
import re, json, html
from pathlib import Path

HUB_SRC = {"porto": "/stay", "lisbon": "/lisbon-3-days", "airport": "/porto-airport-transfer", "moving": "/portugal-d7-visa"}

def set_meta(s, attr, key, value):
    v = html.escape(value, quote=True)
    def rep(m):
        return re.sub(r'content="[^"]*"', f'content="{v}"', m.group(0))
    return re.sub(r'<meta[^>]*%s="%s"[^>]*>' % (attr, re.escape(key)), rep, s)

def run(ia):
    R = ia.ROOT
    for c in ("porto", "lisbon", "airport", "moving"):
        hub = ia.CATS[c]["hub"]
        for lang in ia.LANGS:
            tpl = ia.fs_for(ia.lp(lang, "/douro-day")).read_text(encoding="utf-8")
            title, h1, desc = ia.HUB_TEXT[c][lang]
            t = ia.T[lang]
            s = tpl
            s = re.sub(r"<title>.*?</title>", f"<title>{html.escape(title)} | Day in Portugal</title>", s, flags=re.S)
            for attr, key, val in (("name", "description", desc), ("property", "og:title", title), ("name", "twitter:title", title),
                                   ("property", "og:description", desc), ("name", "twitter:description", desc)):
                s = set_meta(s, attr, key, val)
            s = s.replace("/douro-day\"", hub + "\"")
            s = re.sub(r'<script type="application/ld\+json">.*?</script>', "<!--LD-->", s, count=1, flags=re.S)
            s = re.sub(r'<script type="application/ld\+json">.*?</script>', "", s, flags=re.S)
            src_page = ia.fs_for(ia.lp(lang, HUB_SRC[c]))
            if not src_page.is_file(): src_page = ia.fs_for(HUB_SRC[c])
            fig = re.search(r'<figure class="guide-hero">.*?</figure>', src_page.read_text(encoding="utf-8"), re.S)
            fig = fig.group(0) if fig else ""
            pages = ia.HUB_LIST[c]
            if c == "moving":
                body = ""
                for gid, plist in ia.MOVING_GROUPS:
                    key = {"visas": "visas", "papers": "papers", "costs": "costs", "from": "frm"}[gid]
                    body += (f'<section class="ia-hubsec" aria-labelledby="h-{gid}"><h2 class="h-sub" id="h-{gid}">{html.escape(t[key])}</h2>'
                             f'<div class="ia-grid">' + "".join(ia.card(lang, p) for p in plist) + "</div></section>")
            else:
                body = '<div class="ia-grid">' + "".join(ia.card(lang, p) for p in pages) + "</div>"
            crumbs_nav = (f'<nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="{ia.lp(lang, "/")}">{html.escape(t["home"])}</a></li>'
                          f'<li aria-current="page">{html.escape(h1)}</li></ol></nav>')
            n = len(pages)
            main = (f'<main id="main" class="wrap ia-hub">\n  {fig}\n    {crumbs_nav}\n    <p class="kicker">{html.escape(t["hub_kicker"])} · {n} {html.escape(t["guides"])}</p>\n'
                    f'    <h1 class="page">{html.escape(h1)}</h1>\n    <p class="lead-muted">{html.escape(desc)}</p>\n    {body}\n  </main>')
            s = re.sub(r"<main\b.*?</main>", lambda _: main, s, count=1, flags=re.S)
            items = []
            for i, p in enumerate(pages):
                m = ia.meta(lang, p) or ia.meta("en", p)
                l = lang if ia.meta(lang, p) else "en"
                items.append({"@type": "ListItem", "position": i + 1, "url": ia.SITE + ia.lp(l, p), "name": m["title"]})
            ld = [{"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
                    {"@type": "ListItem", "position": 1, "name": t["home"], "item": ia.SITE + ia.lp(lang, "/")},
                    {"@type": "ListItem", "position": 2, "name": h1, "item": ia.SITE + ia.lp(lang, hub)}]},
                  {"@context": "https://schema.org", "@type": "CollectionPage", "name": title, "description": desc,
                   "url": ia.SITE + ia.lp(lang, hub), "mainEntity": {"@type": "ItemList", "itemListElement": items}}]
            s = s.replace("<!--LD-->", '<script type="application/ld+json">' + json.dumps(ld, ensure_ascii=False) + "</script>")
            # remove the crumbs/related markers copied from the template main (main replaced already)
            out = ia.fs_for(ia.lp(lang, hub))
            out.parent.mkdir(parents=True, exist_ok=True)
            out.write_text(s, encoding="utf-8")
    # ---- homepage blocks
    TOP = [("porto", "/porto-guide", "/img/rabelos-ribeira-from-gaia-1600.webp"),
           ("daytrips", "/porto-day-trips", "/img/douro-valley-1600.webp"),
           ("lisbon", "/lisbon-guide", "/img/lisboa/tram-28-alfama-1600.webp"),
           ("airport", "/airport-transfers", "/img/porto-airport.webp"),
           ("moving", "/moving-to-portugal", "/img/lisbon-praca-comercio.webp"),
           ("shop", "/loja.html", "/img/sardine-tins-1600.webp")]
    COUNT = {"porto": len(ia.HUB_LIST["porto"]), "daytrips": len(ia.CATS["daytrips"]["pages"]), "lisbon": len(ia.HUB_LIST["lisbon"]),
             "airport": len(ia.HUB_LIST["airport"]), "moving": len(ia.HUB_LIST["moving"])}
    for lang in ia.LANGS:
        f = ia.fs_for(ia.lp(lang, "/"))
        s = f.read_text(encoding="utf-8")
        t = ia.T[lang]
        tiles = ""
        for key, href, img in TOP:
            label = t[key] if key != "porto" else ia.HUB_TEXT["porto"][lang][1]
            hl = lang if ia.exists(lang, href) else "en"
            cnt = f'<span class="ia-count">{COUNT[key]} {html.escape(t["guides"])}</span>' if key in COUNT else ""
            tiles += (f'<a class="ia-topic" href="{ia.lp(hl, href)}"><img src="{ia.card_img(img)}" width="640" height="427" alt="" loading="lazy" decoding="async" />'
                      f'<span class="ia-topic-body"><strong>{html.escape(label)}</strong>{cnt}</span></a>')
        pop = "".join(ia.card(lang, p, tag=None) for p in ia.POPULAR)
        block = (f'<!-- ia:home --><section class="ia-topics" aria-labelledby="ia-top-h"><div class="ia-head"><div><p class="kicker">{html.escape(t["hub_kicker"])}</p>'
                 f'<h2 class="h-section" id="ia-top-h">{html.escape(t["topics"])}</h2><p class="muted">{html.escape(t["topics_lead"])}</p></div></div>'
                 f'<div class="ia-topic-grid">{tiles}</div></section>'
                 f'<section class="ia-related ia-popular" aria-labelledby="ia-pop-h"><div class="ia-head"><h2 class="h-sub" id="ia-pop-h">{html.escape(t["popular"])}</h2></div>'
                 f'<div class="ia-grid">{pop}</div></section><!-- /ia:home -->')
        s = re.sub(r"\s*<!-- ia:home -->.*?<!-- /ia:home -->", "", s, flags=re.S)
        m = re.search(r'<section[^>]*class="trust".*?</section>', s, re.S)
        s = s[:m.end()] + "\n\n    " + block + s[m.end():]
        form = (f'<!-- ia:search --><form class="ia-hero-search" role="search" action="https://duckduckgo.com/" method="get" data-ia-search>'
                f'<label class="sr-only" for="ia-q">{html.escape(t["search_label"])}</label>'
                f'<input id="ia-q" name="q" type="search" autocomplete="off" placeholder="{html.escape(t["search_ph"])}" />'
                f'<input type="hidden" name="sites" value="dayinportugal.com" />'
                f'<button type="submit">{html.escape(t["search_btn"])}</button></form><!-- /ia:search -->')
        s = re.sub(r"\s*<!-- ia:search -->.*?<!-- /ia:search -->", "", s, flags=re.S)
        s = re.sub(r"(<div class=\"cta-row\">.*?</div>)\s*(<nav class=\"paths\")", r"\1\n      \2", s, flags=re.S)
        m = re.search(r'<div class="cta-row">.*?</div>', s, re.S)
        s = s[:m.end()] + "\n      " + form + s[m.end():]
        f.write_text(s, encoding="utf-8")
