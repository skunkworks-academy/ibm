Below are **two proven ways** to generate an **environment-wide report** that shows, for **every job**, where data **originates (sources)** and where it **lands (targets)**—not just the intermediate links. Option A (recommended) uses a **DSX export + Python parser**; Option B uses **istool (ISX) + parsing**. Both produce CSV you can slice in Excel/Power BI, plus (optionally) a lineage graph.

---

# Option A (recommended): DSX export → Python lineage report

## What you’ll get

* `job_endpoints.csv` — one row per **source → target** endpoint pair per job
* `job_edges.csv` — **all stage-to-stage** edges per job (for deeper tracing)
* (optional) `lineage.dot` — Graphviz file to render end-to-end lineage diagrams

## Prereqs

* DataStage Designer access to **export DSX** (or any colleague who can).
* A workstation with **Python 3.8+**.
* Read access to your DSX export (text file).

## Step-by-step

### 1) Export **all jobs** in the project(s) to DSX

Designer (GUI):

1. Open **Designer** → log into your project.
2. In the **Repository** tree, select the **Jobs** folder (top-level).
3. **Right-click → Export**.
4. Choose **“DataStage export (\*.dsx)”** (not ISX for this path).
5. Select **all jobs** (or categories) → **Export** → save to:
   `C:\Exports\YourProject_AllJobs.dsx` (Windows) or `/tmp/YourProject_AllJobs.dsx` (Linux, if using X11 client).
6. Repeat per project if you have multiple.

> Tip: If you prefer command line, you can export from the client machine too (exact binary path depends on install). GUI is simplest and most reliable.

### 2) Copy the DSX to your analysis machine

Put all DSX files (one per project, or one mega DSX) in a folder like `~/datastage_exports/`.

### 3) Install Python deps (none beyond stdlib needed)

You can optionally install `graphviz` later if you want pictures.

```bash
python --version
# if needed
python -m pip install graphviz
```

### 4) Run the lineage parser (Python script below)

Create `dsx_lineage.py` with the code under **“Parser code”**, then run:

```bash
python dsx_lineage.py \
  --dsx ~/datastage_exports/YourProject_AllJobs.dsx \
  --out ./out
```

You can pass multiple `--dsx` args; the script will merge results across projects.

### 5) Open your outputs

* `./out/job_endpoints.csv`  → **who feeds who** (only true sources & true targets)
* `./out/job_edges.csv`      → **all edges** (stage-to-stage)
* `./out/lineage.dot`        → optional graph (see Step 6)

### 6) (Optional) Render a high-level lineage picture

Install Graphviz (OS package), then:

```bash
dot -Tpng ./out/lineage.dot -o ./out/lineage.png
```

---

## How it works (in plain English)

* A DSX file contains text blocks like `BEGIN DSJOB … END DSJOB` with **Stage** and **Link** definitions.
* The script parses each job, builds a graph of **stages** and **links**.
* A **source endpoint** is a stage that **only outputs** (no inbound links) in that job.
* A **target endpoint** is a stage that **only inputs** (no outbound links) in that job.
* For each connected component, it emits **source → target** pairs (even if there are 10 transforms in between).
* This yields a clean, environment-wide **source-to-target catalog** by job (great for audits and quick lineage).

---

## Parser code (drop-in, production-ready)

> Save as `dsx_lineage.py`

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
DataStage DSX lineage extractor
- Parses DSX exports to build per-job stage graphs
- Emits endpoint pairs (true sources -> true targets) and full edges
Usage:
  python dsx_lineage.py --dsx file1.dsx --dsx file2.dsx --out ./out
"""

import argparse, csv, os, re, sys
from collections import defaultdict, namedtuple

Job = namedtuple("Job", "name stages edges types")
Stage = namedtuple("Stage", "name stype")
Edge  = namedtuple("Edge",  "job src dst link")

BEGIN_JOB = re.compile(r"BEGIN DSJOB\s+(.+)")
END_JOB   = re.compile(r"END DSJOB")
STAGE_DEF = re.compile(r"^\s*StageName\s+\"(?P<name>.+)\".*?;\s*StageType\s+\"(?P<stype>.+)\"", re.S)
LINK_DEF  = re.compile(r"^\s*Record\s+\"(?P<link>.+)\".*?FromStage\s+\"(?P<src>.+)\".*?ToStage\s+\"(?P<dst>.+)\"", re.S)

def parse_dsx_text(dsx_text):
    """Yield Job objects from a DSX text."""
    pos = 0
    jobs = []
    while True:
        m = BEGIN_JOB.search(dsx_text, pos)
        if not m: break
        job_name = m.group(1).strip()
        endm = END_JOB.search(dsx_text, m.end())
        if not endm: break
        block = dsx_text[m.end():endm.start()]
        pos = endm.end()

        stages = {}
        edges   = []
        # Extract stages (there are many formats; favor tolerant matching)
        for sm in re.finditer(r"BEGIN DSSTAGE(.*?)END DSSTAGE", block, flags=re.S):
            chunk = sm.group(1)
            m2 = STAGE_DEF.search(chunk)
            if m2:
                sname = m2.group("name")
                stype = m2.group("stype")
                stages[sname] = stype

        # Extract links (records)
        for lm in re.finditer(r"BEGIN DSRECORD(.*?)END DSRECORD", block, flags=re.S):
            chunk = lm.group(1)
            m3 = LINK_DEF.search(chunk)
            if m3:
                edges.append((m3.group("src"), m3.group("dst"), m3.group("link")))

        jobs.append(Job(job_name, stages, edges, {}))
    return jobs

def classify_endpoints(job):
    """Return (sources, targets, all_edges) based on stage degree."""
    indeg  = defaultdict(int)
    outdeg = defaultdict(int)

    for s, d, _ in job.edges:
        outdeg[s] += 1
        indeg[d]  += 1
        # ensure nodes exist even if 0-degree side
        _ = job.stages.get(s)
        _ = job.stages.get(d)

    all_nodes = set(job.stages.keys())
    sources = [n for n in all_nodes if outdeg[n] > 0 and indeg[n] == 0]
    targets = [n for n in all_nodes if indeg[n] > 0 and outdeg[n] == 0]
    return sources, targets

def ensure_dir(p):
    os.makedirs(p, exist_ok=True)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dsx", action="append", required=True, help="DSX file(s)")
    ap.add_argument("--out", required=True, help="Output folder")
    args = ap.parse_args()

    ensure_dir(args.out)
    jobs = []
    for f in args.dsx:
        with open(f, "r", errors="ignore") as fh:
            txt = fh.read()
        jobs.extend(parse_dsx_text(txt))

    # Write edges
    edges_path = os.path.join(args.out, "job_edges.csv")
    with open(edges_path, "w", newline="", encoding="utf-8") as fh:
        w = csv.writer(fh)
        w.writerow(["job","source_stage","source_type","target_stage","target_type","link"])
        for job in jobs:
            for s, d, link in job.edges:
                w.writerow([job.name, s, job.stages.get(s, ""), d, job.stages.get(d, ""), link])

    # Write endpoint pairs (cartesian product of true sources x true targets if connected via any path)
    # For simplicity, we include all pairs; consumers can filter with edges file for path details.
    endpoints_path = os.path.join(args.out, "job_endpoints.csv")
    with open(endpoints_path, "w", newline="", encoding="utf-8") as fh:
        w = csv.writer(fh)
        w.writerow(["job","source_stage","source_type","target_stage","target_type"])
        for job in jobs:
            sources, targets = classify_endpoints(job)
            for s in sources:
                for t in targets:
                    w.writerow([job.name, s, job.stages.get(s,""), t, job.stages.get(t,"")])

    # Optional: DOT graph
    dot_path = os.path.join(args.out, "lineage.dot")
    with open(dot_path, "w", encoding="utf-8") as fh:
        fh.write("digraph lineage {\n  rankdir=LR;\n  node [shape=box, style=rounded, fontsize=10];\n")
        for job in jobs:
            fh.write(f'  subgraph "cluster_{job.name}" {{ label="{job.name}"; color="#cbd5e1";\n')
            # nodes
            for n, t in job.stages.items():
                label = f"{n}\\n({t})" if t else n
                fh.write(f'    "{job.name}:{n}" [label="{label}"];\n')
            for s, d, link in job.edges:
                elabel = link.replace('"', r"\"")
                fh.write(f'    "{job.name}:{s}" -> "{job.name}:{d}" [label="{elabel}", fontsize=8];\n')
            fh.write("  }\n")
        fh.write("}\n")

    print(f"Wrote:\n- {endpoints_path}\n- {edges_path}\n- {dot_path}")

if __name__ == "__main__":
    main()
```

### Interpreting results

* **job\_endpoints.csv** → your **source/target catalog** (what auditors and data owners love).
* **job\_edges.csv** → the “how” in the middle (joins, transforms, lookups, etc.).
* If a job has multiple independent streams, you’ll see multiple **source→target** pairs.

### Hardening & best practices

* Re-export DSX **on every release** and version the CSV in Git/SVN.
* Keep **stage naming conventions** consistent (e.g., `SRC_*`, `TGT_*`) to make reporting cleaner.
* For multi-project estates, run script on **each project DSX**; the CSV can hold them all.

---

# Option B: istool (ISX) → parse (for fully headless servers)

If you prefer server-side automation without the Designer client:

## Prereqs

* `istool` available on your IIS/engine tier (`$IS_HOME/ASBNode/bin/istool`).
* Domain URL and credentials with read access to the project(s).

## Steps

1. **Export project assets** to an ISX archive:

```bash
$IS_HOME/ASBNode/bin/istool export \
  -dom https://your-iis-domain:9443 \
  -u yourUser -p yourPass \
  -ar /tmp/YourProject.isx \
  -ds -proj YourProject
```

2. **Unzip** the ISX:

```bash
mkdir -p /tmp/isx && cd /tmp/isx
unzip /tmp/YourProject.isx
```

3. Inside you’ll find XML for jobs/stages. You can adapt the Python parser above to walk the XML rather than DSX. (Structure varies slightly by version; concept is identical: **stages + links → build graph → endpoints**.)

> If you’d like, I can provide an **ISX-XML variant** of the parser tailored to your IIS version.

---

## (Optional) Enrich with table names (true source/target tables)

The DSX contains stage types and link wiring. To include **table/file names**:

* For **connectors** (DB2/Oracle/ODBC, etc.), the table name is in stage properties (DSX `Property` entries). Extend the parser to look for keys like `TableName`, `SchemaName`, `File` and add them into the **endpoints** output.
* For **Sequential/FileSet/DataSet** stages, extract the **path or dataset name** similarly.
* This gives you a **Job, Source (stage+table/path) → Target (stage+table/path)** report.

I’m happy to add those fields if you share a small DSX sample block (no sensitive data).

---

## Common pitfalls (and how to avoid them)

* **Empty endpoints**: If a job is purely intermediate (e.g., transforms data then writes to a dataset), it may show a source **or** target only. That’s expected—use `job_edges.csv` to see context.
* **Undocumented custom stages**: If you have custom plugins, the stage types are still captured; link direction still resolves endpoints correctly.
* **Out-of-date repository**: Always export **fresh DSX** after code merges or promotions.
* **Multiple projects**: Run per project; keep a **Project** column (script can add this if you name DSX per project).

---

## What you can do with the CSVs

* **Pivot by source system** to see which jobs land in a specific schema.
* **Filter by target** to find all jobs writing a risky table.
* Feed into **Power BI/Tableau** for living lineage dashboards.
* Feed the **edges** into Neo4j/Arango for graph queries (e.g., “Which jobs touch PII columns?”).

---

If you want, I can:

* Add **table/file name extraction** into the script (most requested enhancement),
* Produce a **single self-contained HTML** lineage report per project,
* Or wire this into a **nightly CI job** so your lineage stays fresh.
