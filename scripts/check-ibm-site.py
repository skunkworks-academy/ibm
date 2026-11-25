#!/usr/bin/env python3
"""Fail publication when any route loses the shared IBM design or an asset."""

import argparse
import json
from pathlib import Path
from urllib.parse import urlsplit
from xml.etree import ElementTree as ET

from ibm_site_contract import ORIGIN, REVISION, check_site, local_target

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("directory", nargs="?", type=Path, default=Path("_site"))
args = parser.parse_args()
site = args.directory.resolve()
errors, routes = check_site(site)
if not (site / "CNAME").is_file() or (site / "CNAME").read_text().strip() != urlsplit(ORIGIN).netloc:
    errors.append("CNAME must preserve the IBM custom domain.")
for name in ("ibm-release.json", "ibm-routes.json", "sitemap.xml"):
    if not (site / name).is_file():
        errors.append("Missing release evidence: " + name)
if (site / "ibm-routes.json").is_file():
    recorded = json.loads((site / "ibm-routes.json").read_text())
    if recorded.get("routes") != routes or recorded.get("designRevision") != REVISION:
        errors.append("Route evidence does not cover every staged HTML document.")
if (site / "sitemap.xml").is_file():
    tree = ET.parse(site / "sitemap.xml")
    urls = [node.text for node in tree.findall(".//{*}loc")]
    if len(urls) != len(set(urls)):
        errors.append("Sitemap contains duplicate URLs.")
    for url in urls:
        target = local_target(site, "index.html", url)
        if target is None or not target.is_file():
            errors.append("Sitemap points to an unpublished route: " + str(url))
if errors:
    raise SystemExit("IBM design conformance failed:\n" + "\n".join(errors))
print(f"IBM design conformance passed for {len(routes)} pages: shared styles, canonical shell, React safety, local assets, route evidence and sitemap.")
