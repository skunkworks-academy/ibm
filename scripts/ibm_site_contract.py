"""Shared IBM publication contract. Uses only Python's standard library."""

from html import escape
from html.parser import HTMLParser
from pathlib import Path
import re
from urllib.parse import unquote, urljoin, urlsplit

REVISION = "2026.11.25.1"
ORIGIN = "https://ibm.skunkworksacademy.com"
ACADEMY = "https://www.skunkworksacademy.com"
THEME_FILES = ("ibm-carbon.css", "ibm-learning.css", "ibm-hubs.css", "ibm-site.css")
RUNTIME_FILES = ("skunkworks-ui.js", "skunkworks-footer.js", "academy-navigation-v11.js", "academy-page-contract.js")
LEGACY_RUNTIME_FILES = ("academy-navigation.js", "academy-navigation-loader.js")
REQUIRED_ASSETS = tuple("assets/" + name for name in THEME_FILES) + (
    "assets/ibm-learning.mjs", "assets/ibm-learning-model.mjs",
    "data/ibm-learning/catalogue.json",
    "assets/ibm-fonts/Light.woff2", "assets/ibm-fonts/Regular.woff2",
    "assets/ibm-fonts/Medium.woff2", "assets/ibm-fonts/SemiBold.woff2",
    "assets/ibm-licenses/carbon.txt", "assets/ibm-licenses/plex.txt",
)


class Document(HTMLParser):
    """Inspect documents without reserializing React-generated markup."""

    def __init__(self, source):
        super().__init__(convert_charrefs=True)
        self.tags = []
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        self.tags.append((tag, dict(attrs)))

    def matching(self, tag):
        return [attrs for name, attrs in self.tags if name == tag]


def file_name(url):
    return urlsplit(url or "").path.rsplit("/", 1)[-1]


def set_attribute(tag, name, value):
    tag = re.sub(r"\s" + re.escape(name) + r"(?=\s|=|/?>)(?:\s*=\s*(?:\"[^\"]*\"|'[^']*'|[^\s>]+))?", "", tag, flags=re.I)
    return tag[:-1] + ' ' + name + '="' + escape(value, quote=True) + '">'


def fallback_document(relative):
    """Existing shell-only stubs need usable content, not a blank screen."""
    code = relative.split("/", 1)[0].upper()
    title = "Page not found" if relative.endswith("404.html") else code + " training"
    return f'''<!doctype html>
<html lang="en-ZA"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, follow">
<title>{escape(title)} | Skunkworks Academy</title>
<meta name="description" content="Find IBM course references and discuss your training requirements with Skunkworks Academy.">
</head><body><a class="ibm-skip" href="#ibm-learning">Skip to main content</a>
<main id="ibm-learning"><section class="ibm-wrap ibm-section">
<p class="ibm-kicker">Skunkworks Academy · IBM learning</p>
<h1>{escape(title)}</h1>
<p class="ibm-lead">This page does not currently have published learning content. Explore the IBM catalogue or ask our team to confirm the appropriate training.</p>
<div class="ibm-actions"><a class="cds--btn cds--btn--primary" href="/#ibm-catalogue">Explore the catalogue</a>
<a class="cds--btn cds--btn--tertiary" href="{ACADEMY}/course-registration/?source=ibm-learning">Discuss training</a></div>
</section></main></body></html>'''


def apply_theme(source, relative):
    if not re.search(r"<!doctype\s+html|<html\b|<head\b|<body\b", source, re.I):
        # The repository has three placeholder routes containing only a shell
        # script. Preserve their URLs while providing a usable public fallback.
        remaining = re.sub(r"<script\b[^>]*>[\s\S]*?</script\s*>", "", source, flags=re.I).strip()
        if remaining:
            raise ValueError(f"Unexpected HTML fragment needs a document: {relative}")
        source = fallback_document(relative)

    def clean_script(match):
        tag = Document(match.group(0)).matching("script")[0]
        name = file_name(tag.get("src"))
        if name in RUNTIME_FILES + LEGACY_RUNTIME_FILES:
            return ""
        if any(k in tag for k in ("data-skunkworks-global-nav", "data-skunkworks-global-shell")):
            return ""
        return match.group(0)

    def clean_link(match):
        tag = Document(match.group(0)).matching("link")[0]
        if tag.get("rel") == "stylesheet" and file_name(tag.get("href")) in THEME_FILES + (
            "academy-global.css", "academy-brand-theme.css", "academy-learn.css",
        ):
            return ""
        return match.group(0)

    source = re.sub(r"<script\b[^>]*>[\s\S]*?</script\s*>", clean_script, source, flags=re.I)
    source = re.sub(r"<link\b[^>]*>", clean_link, source, flags=re.I)
    source = re.sub(r'<meta\b[^>]*name=["\']ibm-theme-revision["\'][^>]*>', "", source, flags=re.I)
    head = [
        f'<meta name="ibm-theme-revision" content="{REVISION}">',
        f'<link rel="stylesheet" href="{ACADEMY}/assets/academy-global.css?v=2026.06.24" data-skunkworks-global-style="v1">',
        f'<link rel="stylesheet" href="{ACADEMY}/assets/academy-brand-theme.css?v=2026.09.08.3&amp;rev=2026.11.05.2" data-skunkworks-brand-theme="canonical">',
    ]
    head.extend(f'<link rel="stylesheet" href="/assets/{name}?v={REVISION}" data-ibm-design="{REVISION}">' for name in THEME_FILES)
    # Load the same canonical components as the Academy page directly. The old
    # compatibility bootstrap also installs the unrelated rounded Learn theme.
    head.extend((
        f'<script defer src="{ACADEMY}/assets/skunkworks-ui.js?rev={REVISION}" data-skunkworks-ui="canonical"></script>',
        f'<script defer src="{ACADEMY}/assets/skunkworks-footer.js?rev=2026.11.20.2" data-skunkworks-global-footer="canonical"></script>',
        f'<script defer src="{ACADEMY}/assets/academy-navigation-v11.js?nav={REVISION}" data-skunkworks-global-nav="v11" data-skunkworks-react-safe="true"></script>',
        f'<script defer src="{ACADEMY}/assets/academy-page-contract.js?v=2026.11.05.2" data-skunkworks-page-contract="runtime"></script>',
    ))
    if not re.search(r"</head\s*>", source, re.I):
        raise ValueError(f"Document has no closing head: {relative}")
    source = re.sub(r"</head\s*>", "\n" + "\n".join(head) + "\n</head>", source, count=1, flags=re.I)
    if not re.search(r"<body\b", source, re.I):
        raise ValueError(f"Document has no body: {relative}")

    def body(match):
        tag = set_attribute(match.group(0), "data-ibm-site", "academy")
        tag = set_attribute(tag, "data-swa-theme-scope", "isolated")
        return set_attribute(tag, "data-swa-theme-scope-reason", "IBM content uses the canonical Academy IBM learning palette")

    source = re.sub(r"<body\b[^>]*>", body, source, count=1, flags=re.I)
    source = re.sub(r"<main\b[^>]*>", lambda m: set_attribute(m.group(0), "data-swa-contrast", "preserve"), source, flags=re.I)

    def preserve_course_header(match):
        tag = Document(match.group(0)).matching("header")[0]
        if "site" in tag.get("class", "").split():
            return set_attribute(match.group(0), "data-sk-preserve-header", "course-navigation")
        return match.group(0)

    source = re.sub(r"<header\b[^>]*>", preserve_course_header, source, flags=re.I)
    return source


def route_for(relative):
    if relative == "index.html":
        return "/"
    if relative.endswith("/index.html"):
        return "/" + relative[:-10]
    return "/" + relative


def local_target(site, relative, url):
    absolute = urlsplit(urljoin(ORIGIN + "/" + relative, url))
    if absolute.scheme not in ("http", "https") or absolute.netloc != urlsplit(ORIGIN).netloc:
        return None
    target = site / unquote(absolute.path).lstrip("/")
    if site.resolve() not in (target.resolve(), *target.resolve().parents):
        return None
    if target.is_dir():
        target /= "index.html"
    if not target.exists() and not target.suffix:
        target = target.with_suffix(".html")
    return target


def check_site(site):
    errors = []
    pages = sorted(site.rglob("*.html"))
    if not pages:
        return ["No HTML documents were staged."], []
    for name in REQUIRED_ASSETS:
        if not (site / name).is_file() or not (site / name).stat().st_size:
            errors.append("Required reference asset missing or empty: " + name)
    routes = []
    for path in pages:
        relative = path.relative_to(site).as_posix()
        source = path.read_text(encoding="utf-8")
        doc = Document(source)
        bodies = doc.matching("body")
        if len(bodies) != 1 or bodies[0].get("data-ibm-site") != "academy":
            errors.append(relative + ": missing shared IBM body contract")
        styles = [file_name(x.get("href")) for x in doc.matching("link") if x.get("rel") == "stylesheet"]
        for name in THEME_FILES:
            if styles.count(name) != 1:
                errors.append(relative + ": expected one " + name)
        if styles[-len(THEME_FILES):] != list(THEME_FILES):
            errors.append(relative + ": IBM styles must follow every page stylesheet in the shared order")
        scripts = doc.matching("script")
        for name in RUNTIME_FILES:
            matches = [x for x in scripts if file_name(x.get("src")) == name]
            if len(matches) != 1 or not matches[0].get("src", "").startswith(ACADEMY + "/assets/"):
                errors.append(relative + ": expected one canonical " + name)
        if any(file_name(x.get("src")) in LEGACY_RUNTIME_FILES for x in scripts):
            errors.append(relative + ": legacy navigation bootstrap remains")
        if "academy-learn.css" in styles:
            errors.append(relative + ": competing Learn theme remains")
        if any(x.get("data-skunkworks-react-safe") != "true" for x in scripts if file_name(x.get("src")) == "academy-navigation-v11.js"):
            errors.append(relative + ": shell must not mutate React-owned course chrome")
        if not doc.matching("title"):
            errors.append(relative + ": missing document title")
        if not any(x.get("name") == "ibm-theme-revision" and x.get("content") == REVISION for x in doc.matching("meta")):
            errors.append(relative + ": missing design revision")
        # Page resources are release-critical; navigation links are reported
        # separately to distinguish missing assets from external destinations.
        for tag, attrs in doc.tags:
            if tag not in ("script", "img", "source", "link"):
                continue
            if tag == "link" and attrs.get("rel") not in ("stylesheet", "preload", "modulepreload", "icon", "shortcut icon", "apple-touch-icon"):
                continue
            url = attrs.get("src") if tag != "link" else attrs.get("href")
            if not url:
                continue
            target = local_target(site, relative, url)
            if target is not None and not target.is_file():
                errors.append(relative + ": missing local resource " + url)
        route = route_for(relative)
        canonical = next((x.get("href") for x in doc.matching("link") if x.get("rel") == "canonical"), None)
        if canonical:
            target = local_target(site, relative, canonical)
            if target is not None and target.resolve() == path.resolve():
                # Docusaurus publishes extensionless canonical lesson URLs even
                # though the artifact stores each lesson as a .html document.
                route = unquote(urlsplit(urljoin(ORIGIN + "/" + relative, canonical)).path)
        routes.append({"file": relative, "route": route})
    return errors, routes
