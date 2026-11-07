#!/usr/bin/env python3
"""Check generated language pages: files, lang, hreflang, links, affiliates."""
from __future__ import annotations

import re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse

ROOT = Path(__file__).resolve().parents[1]
LANGS = ("en", "es", "fr", "de", "pt")
HTML_LANG = {"en": "en", "es": "es", "fr": "fr", "de": "de", "pt": "pt-PT"}
SITE = "dayinportugal.com"
SKIP = {".git", "tools", "includes"}


def pages():
    for path in sorted(ROOT.rglob("*.html")):
        rel = path.relative_to(ROOT)
        if any(part in SKIP or part in ("es", "fr", "de", "pt") for part in rel.parts):
            continue
        yield rel


class Grab(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.html_lang = ""
        self.hrefs = []
        self.hreflang = {}
        self.canonical = ""
        self.robots = ""
        self.text = []
        self.skip = 0

    def handle_starttag(self, tag, attrs):
        ad = dict(attrs)
        if tag == "html":
            self.html_lang = ad.get("lang", "")
        if tag in ("script", "style"):
            self.skip += 1
        if tag == "a" and ad.get("href"):
            self.hrefs.append(ad["href"])
        if tag == "link":
            rel = ad.get("rel", "")
            if "canonical" in rel:
                self.canonical = ad.get("href", "")
            if "alternate" in rel and ad.get("hreflang"):
                self.hreflang[ad["hreflang"]] = ad.get("href", "")
        if tag == "meta" and (ad.get("name") or "").lower() == "robots":
            self.robots = ad.get("content", "")

    def handle_endtag(self, tag):
        if tag in ("script", "style") and self.skip:
            self.skip -= 1

    def handle_data(self, data):
        if not self.skip:
            self.text.append(data)


def read(path: Path) -> Grab:
    grab = Grab()
    grab.feed(path.read_text(encoding="utf-8", errors="replace"))
    return grab


def file_for(url_path: str) -> Path | None:
    path = url_path.split("?")[0].split("#")[0]
    if path.startswith("http"):
        parsed = urlparse(path)
        if parsed.netloc not in (SITE, "www." + SITE, ""):
            return None
        path = parsed.path or "/"
    if not path.startswith("/"):
        return None
    rel = path[1:]
    if path == "/":
        cand = ROOT / "index.html"
        return cand if cand.is_file() else None
    if path.endswith("/"):
        cand = ROOT / rel / "index.html"
        return cand if cand.is_file() else None
    direct = ROOT / rel
    if direct.is_file():
        return direct
    html = ROOT / (rel + ".html")
    if html.is_file():
        return html
    nested = ROOT / rel / "index.html"
    if nested.is_file():
        return nested
    return None


def external_urls(path: Path) -> list[str]:
    urls = []
    for href in re.findall(r'href="([^"]+)"', path.read_text(encoding="utf-8")):
        href = unquote(href.replace("&amp;", "&"))
        if href.startswith("http") and SITE not in href and "instagram.com" not in href and "creativecommons.org" not in href and "wikimedia.org" not in href and "commons.wikimedia.org" not in href:
            urls.append(href)
    return urls


def main() -> int:
    errors = []
    warn = []
    affiliate_pairs = 0
    affiliate_mismatch = 0
    checked_links = 0
    pages_ok = 0
    for rel in pages():
        en_path = ROOT / rel
        en = read(en_path)
        en_ext = external_urls(en_path)
        en_money = re.findall(r"€\s?\d[\d.,]*|\d[\d.,]*\s?€", " ".join(en.text))
        for lang in LANGS:
            path = en_path if lang == "en" else ROOT / lang / rel
            if not path.is_file():
                errors.append(f"missing {lang}/{rel}")
                continue
            pages_ok += 1
            grab = read(path)
            if grab.html_lang != HTML_LANG[lang]:
                errors.append(f"lang {path}: {grab.html_lang!r} != {HTML_LANG[lang]}")
            for code in ("en", "es", "fr", "de", "pt", "x-default"):
                if code not in grab.hreflang:
                    errors.append(f"hreflang {code} missing on {path}")
            if grab.hreflang.get("x-default") and grab.hreflang.get("en") and grab.hreflang["x-default"] != grab.hreflang["en"]:
                errors.append(f"x-default is not English on {path}")
            if not grab.canonical:
                errors.append(f"canonical missing on {path}")
            elif lang != "en" and f"/{lang}/" not in grab.canonical and not grab.canonical.rstrip("/").endswith("/" + lang):
                errors.append(f"canonical not localized {path}: {grab.canonical}")
            raw = path.read_text(encoding="utf-8")
            if re.search(r"Morim", raw):
                errors.append(f"Morim found in {path}")
            for href in grab.hrefs:
                if href.startswith(("#", "mailto:", "tel:", "javascript:")):
                    continue
                parsed = urlparse(href)
                if parsed.scheme in ("http", "https") and SITE not in (parsed.netloc or ""):
                    continue
                target = href if href.startswith("/") or SITE in href else None
                if target is None:
                    continue
                checked_links += 1
                if file_for(target) is None and not (parsed.path or href).startswith("/img/"):
                    # assets without being html
                    asset = urlparse(target).path if "://" in target else target.split("?")[0]
                    if any(asset.startswith(p) for p in ("/img/", "/styles.css", "/consent", "/menu.js", "/lang.js", "/assistant", "/favicon", "/apple-touch", "/icon-", "/site.webmanifest", "/i18n/")):
                        continue
                    errors.append(f"broken {path} -> {href}")
            if lang != "en":
                affiliate_pairs += 1
                other = external_urls(path)
                if other != en_ext:
                    affiliate_mismatch += 1
                    if affiliate_mismatch <= 8:
                        en_set, ot_set = set(en_ext), set(other)
                        errors.append(f"affiliate mismatch {rel} {lang}: only-en {len(en_set-ot_set)} only-{lang} {len(ot_set-en_set)}")
                def amounts(chunks):
                    text = " ".join(chunks)
                    return re.findall(r"€\s?\d+(?:[.,]\d+)?", text)
                money = amounts(grab.text)
                en_amounts = amounts(en.text)
                if money != en_amounts:
                    errors.append(f"price mismatch {rel} {lang}: {money} vs {en_money}")
        # switcher targets
        for lang in LANGS:
            bare = "/" if rel.as_posix() == "index.html" else (
                "/" + rel.as_posix()[: -len("index.html")] if rel.as_posix().endswith("/index.html")
                else ("/loja.html" if rel.as_posix() == "loja.html" else "/" + rel.as_posix().replace(".html", ""))
            )
            url = bare if lang == "en" else ("/" + lang + "/" if bare == "/" else "/" + lang + bare)
            if file_for(url) is None:
                errors.append(f"switcher target missing {url}")
    print(f"pages checked (lang copies including en): {pages_ok}")
    print(f"internal links checked: {checked_links}")
    print(f"affiliate comparisons: {affiliate_pairs}, mismatches: {affiliate_mismatch}")
    print(f"errors: {len(errors)}")
    for line in errors[:80]:
        print(" -", line)
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
