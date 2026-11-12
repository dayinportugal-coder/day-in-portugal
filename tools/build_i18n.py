#!/usr/bin/env python3
"""Build static /es /fr /de /pt pages from the English HTML and translation JSON.

English pages stay the source of truth. This script injects hreflang, the
language script and the assistant script into them, then writes translated
copies. Shared assets (img, css, js) are not copied.

    python3 tools/build_i18n.py
    python3 tools/build_i18n.py --allow-missing
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from urllib.parse import urlparse, urlunparse

from bs4 import BeautifulSoup, Comment, NavigableString

ROOT = Path(__file__).resolve().parents[1]
LANGS = ("es", "fr", "de", "pt")
HTML_LANG = {"en": "en", "es": "es", "fr": "fr", "de": "de", "pt": "pt-PT"}
OG_LOCALE = {"en": "en_GB", "es": "es_ES", "fr": "fr_FR", "de": "de_DE", "pt": "pt_PT"}
HREFLANG = ("en", "es", "fr", "de", "pt")
SITE = "dayinportugal.com"
META_TEXT = {
    "description",
    "og:title",
    "og:description",
    "og:image:alt",
    "twitter:title",
    "twitter:description",
}
ASSET_PREFIXES = (
    "/img/",
    "/styles.css",
    "/consent.css",
    "/consent.js",
    "/menu.js",
    "/lang.js",
    "/assistant.js",
    "/assistant-match.js",
    "/assistant.css",
    "/favicon",
    "/apple-touch-icon",
    "/icon-",
    "/site.webmanifest",
    "/robots.txt",
    "/sitemap.xml",
    "/i18n/",
)
SKIP_DIR_PARTS = {".git", "tools", "includes"}
# Portuguese-only B2B offer; do not translate or overwrite language copies.
SKIP_PAGES = {"vsme-simples.html", "avaliacoes-google.html", "menu-qr.html", "ecra-tv.html", "cartao-de-grupo.html"}
WIDGET_LANG = {"en": "en", "es": "es", "fr": "fr", "de": "en", "pt": "pt"}


def norm_key(value: str) -> str:
    value = value.replace("\u00a0", " ")
    return re.sub(r"\s+", " ", value).strip()


def translatable(value: str) -> bool:
    key = norm_key(value)
    if len(key) <= 1:
        return False
    return re.search(r"[A-Za-zÀ-ÿ]", key) is not None


def load_translations(lang: str) -> dict[str, str]:
    merged: dict[str, str] = {}
    out = ROOT / "tools" / "i18n" / "out" / lang
    if out.is_dir():
        for path in sorted(out.glob("*.json")):
            data = json.loads(path.read_text(encoding="utf-8"))
            if not isinstance(data, dict):
                raise SystemExit(f"{path} must be a JSON object")
            merged.update(data)
    shared = ROOT / "tools" / "i18n" / "shared" / f"{lang}.json"
    if shared.is_file():
        data = json.loads(shared.read_text(encoding="utf-8"))
        merged.update(data)
    return merged


def is_asset(path: str) -> bool:
    if path in ("/styles.css", "/consent.css", "/consent.js", "/menu.js", "/lang.js", "/assistant.js", "/assistant-match.js", "/assistant.css", "/site.webmanifest", "/robots.txt", "/sitemap.xml", "/favicon.ico", "/favicon.svg", "/favicon-32.png", "/apple-touch-icon.png"):
        return True
    return any(path.startswith(prefix) for prefix in ASSET_PREFIXES)


def localize_path(path: str, lang: str) -> str:
    if lang == "en" or not path.startswith("/") or is_asset(path):
        return path
    if path == "/":
        return f"/{lang}/"
    return f"/{lang}{path}"


def localize_href(href: str, lang: str) -> str:
    if not href or href.startswith(("#", "mailto:", "tel:", "javascript:")):
        return href
    parsed = urlparse(href)
    if parsed.scheme in ("http", "https"):
        host = parsed.netloc.lower().split(":")[0]
        if host not in (SITE, "www." + SITE):
            return href
        path = localize_path(parsed.path or "/", lang)
        return urlunparse(parsed._replace(scheme="https", netloc=SITE, path=path))
    if parsed.scheme or parsed.netloc:
        return href
    path = localize_path(parsed.path or "/", lang) if parsed.path.startswith("/") else href
    if not parsed.path.startswith("/"):
        return href
    return urlunparse(("", "", path, "", parsed.query, parsed.fragment))


def page_canonical(soup: BeautifulSoup, rel: Path) -> str:
    link = soup.find("link", rel=lambda value: value and "canonical" in value)
    if link and link.get("href"):
        return link["href"]
    posix = rel.as_posix()
    if posix == "index.html":
        path = "/"
    elif posix.endswith("/index.html"):
        path = "/" + posix[: -len("index.html")]
    elif posix == "loja.html":
        path = "/loja.html"
    else:
        path = "/" + posix[: -len(".html")] if posix.endswith(".html") else "/" + posix
    return f"https://{SITE}{path}"


def iter_pages():
    for path in sorted(ROOT.rglob("*.html")):
        rel = path.relative_to(ROOT)
        if any(part in SKIP_DIR_PARTS or part in LANGS for part in rel.parts):
            continue
        if rel.name in SKIP_PAGES:
            continue
        yield rel, path


def apply_strings(soup: BeautifulSoup, table: dict[str, str], missing: list[str]) -> None:
    def tr(raw: str) -> str:
        key = norm_key(raw)
        if not translatable(key):
            return raw
        if key in table:
            return table[key]
        missing.append(key)
        return raw

    for text in list(soup.find_all(string=True)):
        if isinstance(text, Comment):
            continue
        parent = text.parent
        if parent is None or not getattr(parent, "name", None) or parent.name in ("script", "style", "[document]"):
            continue
        raw = str(text)
        key = norm_key(raw)
        if not translatable(key):
            continue
        if key not in table:
            missing.append(key)
            continue
        lead = re.match(r"^\s*", raw).group(0)
        trail = re.search(r"\s*$", raw).group(0)
        text.replace_with(NavigableString(lead + table[key] + trail))

    for el in soup.find_all(True):
        if el.name in ("script", "style"):
            continue
        for attr in ("alt", "title", "aria-label", "placeholder"):
            if el.has_attr(attr) and translatable(el[attr]):
                el[attr] = tr(el[attr])
        if el.name == "meta":
            name = (el.get("name") or el.get("property") or "").lower()
            if name in META_TEXT and el.get("content") and translatable(el["content"]):
                el["content"] = tr(el["content"])


def rewrite_links(soup: BeautifulSoup, lang: str, canonical: str) -> None:
    for el in soup.find_all(href=True):
        rels = el.get("rel") or []
        if "alternate" in rels:
            continue
        if "canonical" in rels:
            el["href"] = canonical
            continue
        el["href"] = localize_href(el["href"], lang)
    for el in soup.find_all("meta"):
        if (el.get("http-equiv") or "").lower() == "refresh" and el.get("content"):
            el["content"] = re.sub(
                r"url=(\S+)",
                lambda match: "url=" + localize_href(match.group(1), lang),
                el["content"],
                count=1,
            )
        if (el.get("property") or "").lower() == "og:url":
            el["content"] = canonical
        if (el.get("property") or "").lower() == "og:locale":
            el["content"] = OG_LOCALE[lang]


def rewrite_jsonld(soup: BeautifulSoup, lang: str, table: dict[str, str], missing: list[str]) -> None:
    text_keys = {"name", "description", "headline", "text", "alternatename"}

    def tr(raw: str) -> str:
        key = norm_key(raw)
        if not translatable(key):
            return raw
        if key in table:
            return table[key]
        missing.append(key)
        return raw

    def walk(node):
        if isinstance(node, dict):
            if isinstance(node.get("inLanguage"), str):
                node["inLanguage"] = HTML_LANG[lang]
            for key, value in list(node.items()):
                if isinstance(value, str):
                    if "dayinportugal.com" in value and (key.lower() in {"url", "item", "@id", "mainentityofpage"} or value.startswith("http")):
                        if value.startswith("http"):
                            node[key] = localize_href(value, lang)
                    elif key.lower() in text_keys:
                        node[key] = tr(value)
                else:
                    walk(value)
        elif isinstance(node, list):
            for item in node:
                walk(item)

    for script in soup.find_all("script"):
        if script.get("type") != "application/ld+json" or not script.string:
            continue
        try:
            data = json.loads(script.string)
        except json.JSONDecodeError:
            continue
        walk(data)
        script.string = json.dumps(data, ensure_ascii=False, separators=(", ", ": "))


def set_language_head(soup: BeautifulSoup, lang: str, source_canonical: str) -> str:
    canonical = localize_href(source_canonical, lang)
    html = soup.find("html")
    if html is not None:
        html["lang"] = HTML_LANG[lang]
    head = soup.find("head")
    if head is None:
        return canonical
    for link in list(head.find_all("link")):
        rels = link.get("rel") or []
        if "alternate" in rels or "canonical" in rels:
            link.decompose()
    tags = []
    canonical_tag = soup.new_tag("link", rel="canonical", href=canonical)
    tags.append(canonical_tag)
    for code in HREFLANG:
        href = localize_href(source_canonical, code)
        tag = soup.new_tag("link", rel="alternate", href=href)
        tag["hreflang"] = code
        tags.append(tag)
    xdefault = soup.new_tag("link", rel="alternate", href=localize_href(source_canonical, "en"))
    xdefault["hreflang"] = "x-default"
    tags.append(xdefault)
    anchor = head.find("meta", attrs={"charset": True})
    cursor = anchor
    for tag in tags:
        if cursor is not None:
            cursor.insert_after(tag)
            cursor = tag
        else:
            head.insert(0, tag)
            cursor = tag
    menu = head.find("script", src="/menu.js")
    if not head.find("script", src="/i18n/menu-labels.js"):
        tag = soup.new_tag("script", src="/i18n/menu-labels.js")
        tag["defer"] = ""
        if menu is not None:
            menu.insert_before(tag)
        else:
            head.append(tag)
    for script_src in ("/lang.js", "/assistant-match.js", "/assistant.js"):
        if not head.find("script", src=script_src):
            tag = soup.new_tag("script", src=script_src)
            tag["defer"] = ""
            head.append(tag)
    if not head.find("link", href="/assistant.css"):
        styles = head.find("link", href="/styles.css")
        tag = soup.new_tag("link", rel="stylesheet", href="/assistant.css")
        if styles is not None:
            styles.insert_after(tag)
        else:
            head.append(tag)
    return canonical


def patch_widgets(html: str, rel: Path, lang: str) -> str:
    if rel.as_posix().startswith("demos/") and rel.name == "index.html" and rel.parent.name != "demos":
        html = html.replace(
            'lang=l; document.documentElement.lang={pt:"pt-PT",en:"en",fr:"fr",es:"es"}[l];',
            "lang=l;",
        )
        html = html.replace('setLang("en");', f'setLang("{WIDGET_LANG[lang]}");')
    if rel.as_posix() == "douro.html" and lang != "en":
        html = html.replace('"/douro-day"', f'"/{lang}/douro-day"')
        html = html.replace("url=/douro-day", f"url=/{lang}/douro-day")
    return html


def render(soup: BeautifulSoup) -> str:
    # "minimal" keeps accented characters as UTF-8. html.parser lowercases
    # SVG attribute names, so restore the ones browsers treat as case-sensitive.
    html = soup.decode(formatter="minimal")
    html = html.replace(" viewbox=", " viewBox=")
    html = html.replace(" preserveaspectratio=", " preserveAspectRatio=")
    html = re.sub(r"\sdefer=\"\"", " defer", html)
    html = re.sub(r"\n{3,}", "\n\n", html)
    if not html.startswith("<!") and not html.startswith("<html"):
        html = "<!DOCTYPE html>\n" + html
    if not html.endswith("\n"):
        html += "\n"
    return html


def build_language(lang: str, allow_missing: bool) -> int:
    table = load_translations(lang)
    missing: list[str] = []
    count = 0
    for rel, path in iter_pages():
        soup = BeautifulSoup(path.read_text(encoding="utf-8"), "html.parser")
        source_canonical = page_canonical(soup, rel)
        apply_strings(soup, table, missing)
        canonical = set_language_head(soup, lang, source_canonical)
        rewrite_links(soup, lang, canonical)
        rewrite_jsonld(soup, lang, table, missing)
        html = patch_widgets(render(soup), rel, lang)
        dest = ROOT / lang / rel
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(html, encoding="utf-8")
        count += 1
    unique_missing = list(dict.fromkeys(missing))
    report = ROOT / "tools" / "i18n" / f"missing-{lang}.txt"
    report.write_text("\n".join(unique_missing), encoding="utf-8")
    print(f"{lang}: {count} pages, {len(table)} strings, {len(unique_missing)} missing")
    if unique_missing and not allow_missing:
        print(f"  first missing: {unique_missing[0][:140]}")
        return 1
    return 0


def hreflang_block(canonical: str) -> str:
    lines = [f'<link rel="alternate" hreflang="{code}" href="{localize_href(canonical, code)}" />' for code in HREFLANG]
    lines.append(f'<link rel="alternate" hreflang="x-default" href="{localize_href(canonical, "en")}" />')
    return "\n  ".join(lines)


def prepare_english() -> None:
    """Insert head tags into the hand-written English files without reformatting them."""
    for rel, path in iter_pages():
        html = path.read_text(encoding="utf-8")
        if "<html" not in html.lower():
            continue
        soup = BeautifulSoup(html, "html.parser")
        canonical = page_canonical(soup, rel)
        if 'rel="canonical"' not in html and 'rel="canonical"' not in html.replace("'", '"'):
            html = html.replace("</head>", f'  <link rel="canonical" href="{canonical}" />\n</head>', 1)
        if 'hreflang="x-default"' not in html:
            block = hreflang_block(canonical)
            html2, n = re.subn(
                r'(<link\s+rel="canonical"\s+href="[^"]+"\s*/?>)',
                lambda match: match.group(1) + "\n  " + block,
                html,
                count=1,
            )
            html = html2 if n else html.replace("</head>", "  " + block + "\n</head>", 1)
        if "/i18n/menu-labels.js" not in html:
            needle = '<script src="/menu.js" defer></script>'
            insert = '<script src="/i18n/menu-labels.js" defer></script>\n  ' + needle
            html = html.replace(needle, insert, 1) if needle in html else html.replace(
                "</head>", '<script src="/i18n/menu-labels.js" defer></script>\n</head>', 1
            )
        if 'src="/lang.js"' not in html:
            html = html.replace(
                "</head>",
                '  <script src="/lang.js" defer></script>\n  <script src="/assistant-match.js" defer></script>\n  <script src="/assistant.js" defer></script>\n</head>',
                1,
            )
        if 'href="/assistant.css"' not in html and 'href="/styles.css"' in html:
            html = html.replace(
                '<link rel="stylesheet" href="/styles.css" />',
                '<link rel="stylesheet" href="/styles.css" />\n  <link rel="stylesheet" href="/assistant.css" />',
                1,
            )
        elif 'href="/assistant.css"' not in html:
            html = html.replace("</head>", '  <link rel="stylesheet" href="/assistant.css" />\n</head>', 1)
        html = html.replace(
            'lang=l; document.documentElement.lang={pt:"pt-PT",en:"en",fr:"fr",es:"es"}[l];',
            "lang=l;",
        )
        if not html.endswith("\n"):
            html += "\n"
        path.write_text(html, encoding="utf-8")
    print("en: head links updated")


def update_sitemap() -> None:
    path = ROOT / "sitemap.xml"
    text = path.read_text(encoding="utf-8")
    blocks = re.findall(r"<url>.*?</url>", text, flags=re.S)
    english = []
    for block in blocks:
        loc = re.search(r"<loc>(.*?)</loc>", block)
        if not loc:
            continue
        parsed = urlparse(loc.group(1))
        parts = [part for part in parsed.path.split("/") if part]
        if parts and parts[0] in LANGS:
            continue
        english.append(block)
    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]
    added = 0
    for block in english:
        lines.append("  " + re.sub(r"\s+", " ", block).strip())
        loc = re.search(r"<loc>(.*?)</loc>", block).group(1)
        for lang in LANGS:
            new = localize_href(loc, lang)
            lines.append(f"  <url><loc>{new}</loc><lastmod>2026-11-06</lastmod></url>")
            added += 1
    lines.append("</urlset>")
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"sitemap: {len(english)} english urls, {added} translations")


def main() -> int:
    allow_missing = "--allow-missing" in sys.argv
    prepare_english()
    status = 0
    for lang in LANGS:
        status = max(status, build_language(lang, allow_missing))
    update_sitemap()
    return status


if __name__ == "__main__":
    raise SystemExit(main())
