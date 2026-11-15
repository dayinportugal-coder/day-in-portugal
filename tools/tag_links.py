# -*- coding: utf-8 -*-
"""Adds a click tag to every partner link in the static pages, so each page shows up
separately in the partner dashboards: cmp=<tag> on GetYourGuide links, sub_id=<tag> on
Travelpayouts (tp.media) links. Tag = pg_<lang>_<page>, letters/digits/underscore only.
Skips /experiences/ (generated with their own exp_ tags). Idempotent."""
import os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
n = 0
for dp, dn, fn in os.walk(ROOT):
    rel = os.path.relpath(dp, ROOT)
    if rel.startswith(("experiences", ".git", "node_modules", "tools")): continue
    for f in fn:
        if not f.endswith(".html"): continue
        p = os.path.join(dp, f); r = os.path.relpath(p, ROOT)
        parts = r[:-5].split(os.sep)
        lang = parts[0] if parts[0] in ("pt", "es", "fr", "de") else "en"
        page = "_".join(x for x in (parts[1:] if lang != "en" else parts) if x != "index") or "home"
        tag = re.sub(r"[^a-z0-9_]", "_", ("pg_%s_%s" % (lang, page)).lower())[:60]
        s = open(p, encoding="utf-8").read(); o = s
        def fix(m):
            h = m.group(1)
            if "tp.media/r" in h:
                h = re.sub(r"sub_id=[^&\"]*", "sub_id=" + tag, h)
            elif "getyourguide.com" in h and "partner_id=" in h:
                h = re.sub(r"(&amp;|&)cmp=[^&\"]*", "", h) + "&amp;cmp=" + tag
            return 'href="' + h + '"'
        s = re.sub(r'href="(https://(?:www\.getyourguide\.com|tp\.media)/[^"]*)"', fix, s)
        if s != o:
            open(p, "w", encoding="utf-8").write(s); n += 1
print("pages tagged:", n)
