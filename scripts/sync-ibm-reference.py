#!/usr/bin/env python3
"""Vendor the Academy IBM reference assets from a reviewed www checkout.

Usage: python3 scripts/sync-ibm-reference.py --source ../academy-www
Assets are read from the exact HEAD commit, ignoring working-tree edits. All
source reads and local adapters are validated before any destination is written.
The source commit and copied checksums are recorded for review. This command
does not fetch, commit, or publish anything.
"""

import argparse
import hashlib
import json
from pathlib import Path
import subprocess


ROOT = Path(__file__).resolve().parents[1]
FILES = [
    "assets/ibm-carbon.css",
    "assets/ibm-learning.css",
    "assets/ibm-learning.mjs",
    "assets/ibm-learning-model.mjs",
    "assets/ibm-fonts/Light.woff2",
    "assets/ibm-fonts/Regular.woff2",
    "assets/ibm-fonts/Medium.woff2",
    "assets/ibm-fonts/SemiBold.woff2",
    "assets/ibm-licenses/carbon.txt",
    "assets/ibm-licenses/plex.txt",
    "data/ibm-learning/catalogue.json",
]


def replace_once(text, old, new, message):
    if text.count(old) != 1:
        raise SystemExit(message)
    return text.replace(old, new)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, required=True)
    args = parser.parse_args()
    source = args.source.resolve()
    revision = subprocess.check_output(
        ["git", "-C", str(source), "rev-parse", "--verify", "HEAD^{commit}"], text=True
    ).strip()

    # Read the resolved commit rather than HEAD again, so a checkout change or
    # dirty source file cannot make the recorded provenance inaccurate.
    prepared = {}
    for name in FILES:
        try:
            prepared[name] = subprocess.check_output(
                ["git", "-C", str(source), "cat-file", "blob", f"{revision}:{name}"],
                stderr=subprocess.PIPE,
            )
        except subprocess.CalledProcessError as error:
            raise SystemExit(f"Cannot read reference asset from www@{revision[:12]}: {name}") from error

    model = "assets/ibm-learning-model.mjs"
    prepared[model] = replace_once(
        prepared[model].decode("utf-8"),
        "return '/course-registration/?'+p;",
        "return 'https://www.skunkworksacademy.com/course-registration/?'+p;",
        "Reference enquiry URL changed; review the cross-origin adapter.",
    ).encode("utf-8")

    runtime = "assets/ibm-learning.mjs"
    text = prepared[runtime].decode("utf-8")
    for old, new in (
        (
            "saved=[],lastTrigger=null;",
            "saved=[],lastTrigger=null,shortlistPersistenceFailed=false;",
        ),
        (
            "byId('shortlist-note').textContent=selected.length?",
            "byId('shortlist-note').textContent=shortlistPersistenceFailed?'Shortlist saved for this visit only; browser storage is unavailable.':selected.length?",
        ),
        (
            "try{localStorage.setItem('academy-ibm-shortlist',JSON.stringify(saved));}catch{byId('shortlist-note').textContent='Shortlist saved for this visit only; browser storage is unavailable.';}",
            "try{localStorage.setItem('academy-ibm-shortlist',JSON.stringify(saved));shortlistPersistenceFailed=false;}catch{shortlistPersistenceFailed=true;}",
        ),
    ):
        text = replace_once(text, old, new, "Reference shortlist changed; review the storage-failure adapter.")
    prepared[runtime] = text.encode("utf-8")

    provenance = {
        "sourceRepository": "https://github.com/skunkworks-academy/www",
        "sourceCommit": revision,
        "designReference": "https://www.skunkworksacademy.com/ibm/",
        "adaptations": {
            model: "Use the absolute Academy registration URL from the IBM subdomain.",
            runtime: "Keep the visit-only shortlist warning visible when browser storage fails.",
        },
        "sha256": {name: hashlib.sha256(data).hexdigest() for name, data in prepared.items()},
    }
    prepared["assets/ibm-reference.json"] = (json.dumps(provenance, indent=2) + "\n").encode("utf-8")

    # No upstream read or adapter can fail after destination writes begin.
    for name, data in prepared.items():
        target = ROOT / name
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(data)
    print(f"Synced {len(FILES)} IBM reference assets from www@{revision[:12]}.")


if __name__ == "__main__":
    main()
