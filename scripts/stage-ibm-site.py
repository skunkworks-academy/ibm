#!/usr/bin/env python3
"""Compose all IBM routes with fresh course builds and the shared IBM design."""

import argparse
from datetime import datetime, timezone
import json
import os
from pathlib import Path
import shutil
import subprocess
from urllib.parse import quote
from xml.etree import ElementTree as ET

from ibm_site_contract import Document, ORIGIN, REVISION, apply_theme, check_site

ROOT = Path(__file__).resolve().parents[1]
COURSES = ("db2/cla96", "db2/zbsec1")
OMIT = {
    ".git", ".github", "node_modules", ".docusaurus", ".lighthouseci", "__pycache__",
    "build", "_site", "_reference-www", "scripts", "tests", "test-results", "playwright-report",
}
COURSE_SOURCE = {"docs", "src", "static", "scripts", "node_modules", "build", ".docusaurus", ".lighthouseci"}


def stage(output, use_existing_courses=False):
    output = output.resolve()
    if output == ROOT or output in ROOT.parents:
        raise SystemExit("The staging output must not replace the source checkout or its parents.")
    if not use_existing_courses:
        for course in COURSES:
            if not (ROOT / course / "build/index.html").is_file():
                raise SystemExit("Fresh course build required: " + course + "/build/index.html")
    if output.exists():
        shutil.rmtree(output)
    output.mkdir(parents=True)
    for base, dirs, files in os.walk(ROOT):
        directory = Path(base)
        relative = directory.relative_to(ROOT)
        dirs[:] = [name for name in dirs if name not in OMIT and (directory / name).resolve() != output]
        if relative.as_posix() in COURSES:
            dirs[:] = [name for name in dirs if name not in COURSE_SOURCE]
        destination = output / relative
        destination.mkdir(parents=True, exist_ok=True)
        for name in files:
            if name.startswith(".") and name != ".nojekyll":
                continue
            if name in {"package.json", "package-lock.json", "tsconfig.json", "docusaurus.config.ts", "sidebars.ts"}:
                continue
            shutil.copy2(directory / name, destination / name)
    if use_existing_courses:
        for course in COURSES:
            shutil.copytree(ROOT / course / "static", output / course, dirs_exist_ok=True)
    else:
        for course in COURSES:
            destination = output / course
            # Keep legacy .html aliases while replacing complete generated trees.
            for name in ("assets", "course", "img", "labs", "images"):
                if (destination / name).is_dir():
                    shutil.rmtree(destination / name)
            shutil.copytree(ROOT / course / "build", destination, dirs_exist_ok=True)
    (output / ".nojekyll").touch()
    for page in sorted(output.rglob("*.html")):
        relative = page.relative_to(output).as_posix()
        page.write_text(apply_theme(page.read_text(encoding="utf-8"), relative), encoding="utf-8")
    errors, routes = check_site(output)
    if errors:
        raise SystemExit("IBM stage validation failed:\n" + "\n".join(errors))
    commit = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=ROOT, text=True).strip()
    (output / "ibm-release.json").write_text(json.dumps({
        "repository": "skunkworks-academy/ibm", "commit": commit,
        "designRevision": REVISION, "htmlDocuments": len(routes),
        "builtAt": datetime.now(timezone.utc).isoformat(),
        "courseBuilds": "committed-preview" if use_existing_courses else "fresh",
    }, indent=2) + "\n")
    (output / "ibm-routes.json").write_text(json.dumps({"designRevision": REVISION, "routes": routes}, indent=2) + "\n")
    ET.register_namespace("", "http://www.sitemaps.org/schemas/sitemap/0.9")
    sitemap = ET.Element("{http://www.sitemaps.org/schemas/sitemap/0.9}urlset")
    for entry in routes:
        doc = Document((output / entry["file"]).read_text())
        if entry["file"].endswith("404.html") or any(
            item.get("name") == "robots" and "noindex" in item.get("content", "") for item in doc.matching("meta")
        ):
            continue
        canonical = next((item.get("href") for item in doc.matching("link") if item.get("rel") == "canonical"), None)
        if canonical and not canonical.startswith(ORIGIN + "/"):
            continue
        url = ET.SubElement(sitemap, "url")
        ET.SubElement(url, "loc").text = ORIGIN + quote(entry["route"], safe="/")
    ET.indent(sitemap)
    ET.ElementTree(sitemap).write(output / "sitemap.xml", encoding="utf-8", xml_declaration=True)
    (output / "robots.txt").write_text("User-agent: *\nAllow: /\nSitemap: " + ORIGIN + "/sitemap.xml\n")
    print(f"Staged and verified {len(routes)} IBM pages in {output}; design {REVISION}.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=ROOT / "_site")
    parser.add_argument("--use-existing-courses", action="store_true", help="Local preview only: use committed course output instead of fresh builds.")
    args = parser.parse_args()
    stage(args.output, args.use_existing_courses)
