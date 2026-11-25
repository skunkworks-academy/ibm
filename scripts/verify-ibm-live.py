#!/usr/bin/env python3
"""Verify the deployed commit, every published route and shared design assets."""

import argparse
from concurrent.futures import ThreadPoolExecutor
import json
from urllib.parse import quote
from urllib.request import Request, urlopen
from urllib.error import URLError
import time

from ibm_site_contract import ORIGIN, REVISION, THEME_FILES

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--commit", required=True)
parser.add_argument("--attempts", type=int, default=12)
parser.add_argument("--retry-delay", type=int, default=10)
args = parser.parse_args()


def fetch(route):
    url = ORIGIN + quote(route, safe="/")
    request = Request(url, headers={"User-Agent": "Skunkworks-Academy-release-verification", "Cache-Control": "no-cache"})
    with urlopen(request, timeout=20) as response:
        if response.status != 200:
            raise ValueError(f"{route}: HTTP {response.status}")
        return response.read().decode("utf-8")


def check_route(route):
    try:
        html = fetch(route)
        if 'name="ibm-theme-revision" content="' + REVISION + '"' not in html:
            return route + ": design revision not yet published"
        if 'data-ibm-site="academy"' not in html:
            return route + ": shared design contract missing"
        if html.count("academy-navigation-v11.js") != 1:
            return route + ": canonical navigation missing or duplicated"
        if route == "/db2/zbsec1/" and "Db2 for z/OS banking security, end to end" not in html:
            return route + ": expected ZBSEC1 content missing"
    except (OSError, URLError, ValueError) as error:
        return route + ": " + str(error)
    return None


failures = []
for attempt in range(1, args.attempts + 1):
    try:
        release = json.loads(fetch("/ibm-release.json"))
        if release.get("commit") != args.commit or release.get("designRevision") != REVISION:
            raise ValueError("Public release marker does not match this deployment.")
        route_manifest = json.loads(fetch("/ibm-routes.json"))
        if route_manifest.get("commit") != args.commit or route_manifest.get("designRevision") != REVISION:
            raise ValueError("Public route manifest identity does not match this deployment.")
        routes = route_manifest["routes"]
        if len(routes) != release.get("htmlDocuments") or not routes:
            raise ValueError("Public route evidence does not match the release.")
        public_routes = [item["route"] for item in routes if not item["file"].endswith("404.html")]
        with ThreadPoolExecutor(max_workers=8) as executor:
            failures = [message for message in executor.map(check_route, public_routes) if message]
        for name in THEME_FILES:
            if not fetch("/assets/" + name).strip():
                failures.append("Empty public stylesheet: " + name)
        if not failures:
            print(f"Live IBM release verified: {args.commit}, {len(public_routes)} public routes, {len(routes)} document records, design {REVISION}, shared CSS served successfully.")
            break
    except (OSError, URLError, ValueError, KeyError) as error:
        failures = [str(error)]
    print(f"Public verification {attempt}/{args.attempts}: " + "; ".join(failures[:5]))
    if attempt < args.attempts:
        time.sleep(args.retry_delay)
else:
    raise SystemExit("Public IBM release verification failed:\n" + "\n".join(failures))
