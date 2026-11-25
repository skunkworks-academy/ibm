#!/usr/bin/env python3
"""Vendor the Academy IBM reference assets from a reviewed www checkout.

Usage: python3 scripts/sync-ibm-reference.py --source ../academy-www
The source commit and copied checksums are recorded for review. This command
does not fetch, commit, or publish anything.
"""

import argparse
import hashlib
import json
from pathlib import Path
import shutil
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


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, required=True)
    args = parser.parse_args()
    source = args.source.resolve()
    revision = subprocess.check_output(
        ["git", "-C", str(source), "rev-parse", "HEAD"], text=True
    ).strip()
    missing = [name for name in FILES if not (source / name).is_file()]
    if missing:
        raise SystemExit("Missing reference assets: " + ", ".join(missing))

    digests = {}
    for name in FILES:
        target = ROOT / name
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source / name, target)
        if name == "assets/ibm-learning-model.mjs":
            text = target.read_text()
            old = "return '/course-registration/?'+p;"
            if text.count(old) != 1:
                raise SystemExit("Reference enquiry URL changed; review the cross-origin adapter.")
            target.write_text(text.replace(old, "return 'https://www.skunkworksacademy.com/course-registration/?'+p;"))
        digests[name] = hashlib.sha256(target.read_bytes()).hexdigest()

    provenance = {
        "sourceRepository": "https://github.com/skunkworks-academy/www",
        "sourceCommit": revision,
        "designReference": "https://www.skunkworksacademy.com/ibm/",
        "adaptations": {
            "assets/ibm-learning-model.mjs": "Use the absolute Academy registration URL from the IBM subdomain."
        },
        "sha256": digests,
    }
    (ROOT / "assets/ibm-reference.json").write_text(json.dumps(provenance, indent=2) + "\n")
    print(f"Synced {len(FILES)} IBM reference assets from www@{revision[:12]}.")


if __name__ == "__main__":
    main()
