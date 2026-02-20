window.CLA96G_DATA = window.CLA96G_DATA || {};
window.CLA96G_DATA['part4'] = {
  "id": "part4",
  "title": "Part 4: Performance and Tuning Optimization",
  "units": [
    {
      "id": "p4u1",
      "title": "Unit 1: Statistics and Query Optimization",
      "summary": "Optimizer behavior, statistics profiles, and validating plan changes safely.",
      "topics": [
        "Selectivity and cardinality estimation",
        "Distribution statistics for skew",
        "Statistics profiles for consistent collection",
        "Validating plan changes"
      ],
      "takeaways": [
        "After big data change: RUNSTATS → validate EXPLAIN → adjust indexes.",
        "Use profiles to standardize stats collection.",
        "Always compare plans with baselines and similar parameter values."
      ],
      "risks": [
        "Stats drift causes unpredictable plan changes.",
        "Over-collecting high-cost stats can inflate maintenance overhead.",
        "Tuning without evidence shifts bottlenecks."
      ],
      "questions": [
        {
          "id": "p4u1_q1",
          "prompt": "Scenario: A query regression appears right after a major data load. The SQL didn't change. Most likely cause?",
          "options": [
            {
              "text": "Statistics changed or became stale; optimizer chose a different plan. Refresh stats and validate with EXPLAIN.",
              "correct": true,
              "explain": "Bulk data changes commonly invalidate cardinality estimates. Refreshing statistics and verifying access plans is a primary tuning step."
            },
            {
              "text": "HADR stopped replicating",
              "correct": false,
              "explain": ""
            },
            {
              "text": "The table definition corrupted",
              "correct": false,
              "explain": ""
            }
          ],
          "difficulty": "E",
          "tags": [
            "optimizer",
            "stats"
          ]
        },
        {
          "id": "p4u1_q2",
          "prompt": "Why do distribution (frequency) statistics matter?",
          "options": [
            {
              "text": "They help the optimizer model skew and estimate predicate selectivity more accurately",
              "correct": true,
              "explain": "Skewed data can lead to wrong cardinality estimates without distribution stats."
            },
            {
              "text": "They reduce log usage",
              "correct": false,
              "explain": ""
            },
            {
              "text": "They automatically rebuild indexes",
              "correct": false,
              "explain": ""
            }
          ],
          "difficulty": "M",
          "tags": [
            "stats"
          ]
        }
      ]
    },
    {
      "id": "p4u2",
      "title": "Unit 2: Indexing for Performance Improvement",
      "summary": "Workload-driven indexing strategy, composite key order, covering indexes, and usage evidence.",
      "topics": [
        "Composite index ordering and matching predicates",
        "Covering indexes and INCLUDE columns concept",
        "Index usage monitoring and dead index removal",
        "Design Advisor as a starting point (not authority)"
      ],
      "takeaways": [
        "Indexes must match workload patterns (filters + joins + order by).",
        "Avoid over-indexing; measure write overhead.",
        "Remove unused indexes only with evidence and change control."
      ],
      "risks": [
        "Over-indexing slows DML and increases logging.",
        "Wrong column order prevents index matching.",
        "Removing indexes without evidence causes regressions."
      ],
      "questions": [
        {
          "id": "p4u2_q1",
          "prompt": "Scenario: INSERT throughput drops after adding 6 new indexes. What is the likely explanation?",
          "options": [
            {
              "text": "Each DML now maintains more index structures, increasing write cost and logging",
              "correct": true,
              "explain": "Indexes must be updated for each row change; more indexes = more work per insert/update/delete."
            },
            {
              "text": "Bufferpools are disabled by indexing",
              "correct": false,
              "explain": ""
            },
            {
              "text": "Indexes only affect SELECT performance",
              "correct": false,
              "explain": ""
            }
          ],
          "difficulty": "E",
          "tags": [
            "indexes",
            "dml"
          ]
        },
        {
          "id": "p4u2_q2",
          "prompt": "In a composite index, why does column order matter?",
          "options": [
            {
              "text": "It affects which predicates can match/seek efficiently and whether the index can support ordering",
              "correct": true,
              "explain": "Leading columns are critical for index matching; order impacts seekability and sort avoidance."
            },
            {
              "text": "It only affects storage size",
              "correct": false,
              "explain": ""
            },
            {
              "text": "It only affects backups",
              "correct": false,
              "explain": ""
            }
          ],
          "difficulty": "M",
          "tags": [
            "composite-index"
          ]
        },
        {
          "id": "p4u2_q3",
          "prompt": "Scenario: An index is suspected unused. What is the safest DBA approach?",
          "options": [
            {
              "text": "Drop it immediately to save space",
              "correct": false,
              "explain": ""
            },
            {
              "text": "Use monitoring evidence to confirm usage over time, then remove via change control with rollback plan",
              "correct": true,
              "explain": "Index removal should be evidence-based and controlled; allow safe rollback if performance regresses."
            },
            {
              "text": "Disable locking to test",
              "correct": false,
              "explain": ""
            }
          ],
          "difficulty": "E",
          "tags": [
            "governance",
            "monitoring"
          ]
        }
      ]
    },
    {
      "id": "p4u3",
      "title": "Unit 3: Using explain tools for query optimization",
      "summary": "Capturing and interpreting access plans and tying plans to runtime behaviour.",
      "topics": [
        "Explain tables and plan capture",
        "db2exfmt interpretation (operators, joins, sorts, scans)",
        "Static vs dynamic SQL plan behavior",
        "Comparing plans across environments"
      ],
      "takeaways": [
        "Plan analysis drives targeted tuning: fix stats, indexes, predicates.",
        "Focus on big operators: large scans, large sorts, expensive joins.",
        "Compare apples-to-apples: same bind options and parameters."
      ],
      "risks": [
        "Misreading plans leads to wasted tuning changes.",
        "Plan changes can shift bottlenecks; validate end-to-end.",
        "Differences in parameters can produce different plans."
      ],
      "questions": [
        {
          "id": "p4u3_q1",
          "prompt": "Scenario: EXPLAIN shows a table scan with very high estimated rows but actual result set is tiny. Most likely issue?",
          "options": [
            {
              "text": "Bad cardinality estimates due to missing/old statistics; collect appropriate RUNSTATS and re-evaluate plan",
              "correct": true,
              "explain": "Large mismatch between estimated and actual often indicates stale/missing stats or skew not captured."
            },
            {
              "text": "HADR is enabled",
              "correct": false,
              "explain": ""
            },
            {
              "text": "The database is encrypted",
              "correct": false,
              "explain": ""
            }
          ],
          "difficulty": "E",
          "tags": [
            "explain",
            "cardinality"
          ]
        },
        {
          "id": "p4u3_q2",
          "prompt": "Before capturing explain output reliably, what must exist?",
          "options": [
            {
              "text": "Explain tables in the target schema",
              "correct": true,
              "explain": "EXPLAIN writes plan metadata to explain tables; without them, capture/formatting is not reliable."
            },
            {
              "text": "A full offline backup",
              "correct": false,
              "explain": ""
            },
            {
              "text": "A reorg of all indexes",
              "correct": false,
              "explain": ""
            }
          ],
          "difficulty": "M",
          "tags": [
            "explain-tables"
          ]
        },
        {
          "id": "p4u3_q3",
          "prompt": "Scenario: Two environments produce different plans for the same SQL. What should you compare first?",
          "options": [
            {
              "text": "Stats, schema objects (indexes), and bind options/parameter values",
              "correct": true,
              "explain": "Plan differences commonly come from stats/index differences, configuration, and parameter values."
            },
            {
              "text": "Wallpaper settings",
              "correct": false,
              "explain": ""
            },
            {
              "text": "The number of files in /tmp only",
              "correct": false,
              "explain": ""
            }
          ],
          "difficulty": "E",
          "tags": [
            "plan-variance"
          ]
        }
      ]
    },
    {
      "id": "p4u4",
      "title": "Unit 4: Monitoring Fundamentals",
      "summary": "Monitoring KPIs, top SQL/waits, capacity trends, and practical triage using evidence.",
      "topics": [
        "Monitoring KPIs and thresholds",
        "Top SQL and wait analysis",
        "Log and tablespace health",
        "Correlation of symptoms"
      ],
      "takeaways": [
        "Operate on trends and thresholds, not only incidents.",
        "Correlate: CPU/IO waits, locks, logs, tablespaces, top SQL.",
        "Have a 10-minute triage playbook."
      ],
      "risks": [
        "Ignoring early capacity trends causes outages.",
        "Monitoring without ownership becomes noise.",
        "High-frequency monitoring can add overhead if misconfigured."
      ],
      "questions": [
        {
          "id": "p4u4_q1",
          "prompt": "Scenario: Users report slowness. CPU is normal, but lock waits spike. Best next step?",
          "options": [
            {
              "text": "Identify blocking chains and the root blocker transaction, then remediate with minimal impact",
              "correct": true,
              "explain": "Lock waits indicate contention; find blockers, capture evidence, then apply controlled remediation."
            },
            {
              "text": "Increase bufferpool blindly",
              "correct": false,
              "explain": ""
            },
            {
              "text": "Disable locks",
              "correct": false,
              "explain": ""
            }
          ],
          "difficulty": "E",
          "tags": [
            "monitoring",
            "locking"
          ]
        },
        {
          "id": "p4u4_q2",
          "prompt": "Which indicator most often predicts an outage if ignored?",
          "options": [
            {
              "text": "Tablespace/log utilization trending toward full without action",
              "correct": true,
              "explain": "Capacity trends are early warning signals: log full and tablespace full can hard-stop workloads."
            },
            {
              "text": "One successful ping",
              "correct": false,
              "explain": ""
            },
            {
              "text": "A single warning that never repeats",
              "correct": false,
              "explain": ""
            }
          ],
          "difficulty": "M",
          "tags": [
            "capacity",
            "risk"
          ]
        }
      ]
    }
  ]
};
