window.CLA96G_DATA = window.CLA96G_DATA || {};
window.CLA96G_DATA['part2'] = {
  "id": "part2",
  "title": "Part 2: Data Movement, Backup/Recovery, Maintenance",
  "units": [
    {
      "id": "p2u1",
      "title": "Unit 1: Data Movement and Loading Fundamentals",
      "summary": "Choosing the right utility (IMPORT/LOAD/INGEST) and managing post-load states safely.",
      "topics": [
        "INSERT vs IMPORT vs LOAD vs INGEST",
        "COPY YES / NONRECOVERABLE implications",
        "Load pending and set integrity states",
        "Utility monitoring and message review"
      ],
      "takeaways": [
        "Use LOAD for high-volume ingestion when concurrency is not required.",
        "Use INGEST where concurrency and restartability matter.",
        "Always review utility messages and resolve pending states."
      ],
      "risks": [
        "NONRECOVERABLE operations can break rollforward recoverability objectives.",
        "LOAD REPLACE and improper options can cause data loss.",
        "Ignoring set integrity can cause queries to fail or return inconsistent results."
      ],
      "questions": [
        {
          "id": "p2u1_q1",
          "prompt": "Scenario: You must load 300M rows overnight, and the table can be unavailable. The business requires rollforward capability after the load. Best choice?",
          "options": [
            {
              "text": "LOAD with options that keep the table recoverable (avoid NONRECOVERABLE; ensure logs/backup strategy aligns)",
              "correct": true,
              "explain": "LOAD is designed for bulk ingestion. To preserve rollforward capability, avoid NONRECOVERABLE options and align backup/log strategy."
            },
            {
              "text": "IMPORT with row-by-row insert only",
              "correct": false,
              "explain": "IMPORT is usually slower for extreme bulk loads; it’s row-based and logs heavily."
            },
            {
              "text": "Disable logging permanently",
              "correct": false,
              "explain": "Disabling logging permanently is unsafe and breaks recovery requirements."
            }
          ],
          "difficulty": "E",
          "tags": [
            "load",
            "recoverability"
          ]
        },
        {
          "id": "p2u1_q2",
          "prompt": "Scenario: After a LOAD, a table is in 'set integrity pending'. What should a DBA do?",
          "options": [
            {
              "text": "Ignore it; it clears automatically after 24 hours",
              "correct": false,
              "explain": ""
            },
            {
              "text": "Run the appropriate SET INTEGRITY command (and validate constraints) to bring the table back to normal state",
              "correct": true,
              "explain": "Pending integrity states require explicit action. DBAs must restore integrity and validate outcomes."
            },
            {
              "text": "Run REORG on the table to clear the state",
              "correct": false,
              "explain": "REORG addresses physical organization; it does not replace integrity resolution."
            }
          ],
          "difficulty": "E",
          "tags": [
            "integrity",
            "states"
          ]
        },
        {
          "id": "p2u1_q3",
          "prompt": "Which statement is generally true about LOAD vs IMPORT?",
          "options": [
            {
              "text": "LOAD is optimized for bulk ingestion; IMPORT is row-based and typically logs more",
              "correct": true,
              "explain": "LOAD is a high-performance utility; IMPORT is row processing and often logs heavier."
            },
            {
              "text": "IMPORT always runs faster than LOAD",
              "correct": false,
              "explain": ""
            },
            {
              "text": "LOAD cannot be monitored",
              "correct": false,
              "explain": "Utilities can be monitored; DBAs should review status and message output."
            }
          ],
          "difficulty": "M",
          "tags": [
            "utilities"
          ]
        },
        {
          "id": "p2u1_q4",
          "prompt": "Operationally, why should DBAs review the .msg/utility output after data movement?",
          "options": [
            {
              "text": "To confirm success and detect warnings/pending states requiring follow-up",
              "correct": true,
              "explain": "Utility output is the evidence trail—warnings and follow-up actions often appear only there."
            },
            {
              "text": "To reduce CPU usage",
              "correct": false,
              "explain": ""
            },
            {
              "text": "Because it changes query plans automatically",
              "correct": false,
              "explain": ""
            }
          ],
          "difficulty": "M",
          "tags": [
            "operations"
          ]
        }
      ]
    },
    {
      "id": "p2u2",
      "title": "Unit 2: Backup and Recovery",
      "summary": "Recovery objectives, rollforward logic, log archiving, encryption readiness, and HA fundamentals.",
      "topics": [
        "Crash vs rollforward recovery concepts",
        "Logging and archive methods (conceptual)",
        "Restore + rollforward flow",
        "Backup encryption readiness (keystore mindset)",
        "HADR fundamentals (conceptual architecture)"
      ],
      "takeaways": [
        "Define RPO/RTO; align backup frequency and log archival throughput.",
        "Test restores regularly and document results.",
        "Treat encryption as operational: keys, rotation, access controls."
      ],
      "risks": [
        "Untested restores can fail during incidents (missing logs, incompatible media, permissions).",
        "Archive throughput constraints can cause log full conditions.",
        "Mismanaged encryption keys can make backups unrecoverable."
      ],
      "questions": [
        {
          "id": "p2u2_q1",
          "prompt": "Scenario: You restore an online backup and the database is not usable until additional steps. What must you do next in most cases?",
          "options": [
            {
              "text": "Run rollforward (to end of logs or point-in-time as required) to complete recovery",
              "correct": true,
              "explain": "Online backups typically require rollforward because they represent a consistent image requiring logs to reach a usable state."
            },
            {
              "text": "Drop all indexes",
              "correct": false,
              "explain": ""
            },
            {
              "text": "Recreate the database",
              "correct": false,
              "explain": ""
            }
          ],
          "difficulty": "E",
          "tags": [
            "restore",
            "rollforward"
          ]
        },
        {
          "id": "p2u2_q2",
          "prompt": "Scenario: The business wants minimal data loss. Which combination best aligns with that goal?",
          "options": [
            {
              "text": "Infrequent backups and no log archival",
              "correct": false,
              "explain": ""
            },
            {
              "text": "Frequent backups plus reliable log archival/management to support rollforward",
              "correct": true,
              "explain": "Minimal data loss requires short backup windows and continuous/robust log handling."
            },
            {
              "text": "Only weekly offline backups",
              "correct": false,
              "explain": ""
            }
          ],
          "difficulty": "E",
          "tags": [
            "rpo",
            "logging"
          ]
        },
        {
          "id": "p2u2_q3",
          "prompt": "Operationally, why can encrypted backups be risky if not managed properly?",
          "options": [
            {
              "text": "They always run slower than non-encrypted backups",
              "correct": false,
              "explain": ""
            },
            {
              "text": "If keystore/keys are unavailable, restores may be impossible even if backups exist",
              "correct": true,
              "explain": "Encryption introduces key dependency. Losing keys equals losing the ability to recover."
            },
            {
              "text": "They prevent rollforward",
              "correct": false,
              "explain": ""
            }
          ],
          "difficulty": "M",
          "tags": [
            "encryption",
            "backup"
          ]
        },
        {
          "id": "p2u2_q4",
          "prompt": "Scenario: You experience repeated log full events during peak workload. What is a DBA’s best first step?",
          "options": [
            {
              "text": "Disable logging",
              "correct": false,
              "explain": ""
            },
            {
              "text": "Investigate log usage drivers (long transactions, bulk loads), and validate log sizing and archival throughput",
              "correct": true,
              "explain": "Log full usually indicates capacity or throughput constraints. First identify drivers, then adjust configuration/operations."
            },
            {
              "text": "Run RUNSTATS",
              "correct": false,
              "explain": ""
            }
          ],
          "difficulty": "E",
          "tags": [
            "logs",
            "triage"
          ]
        }
      ]
    },
    {
      "id": "p2u3",
      "title": "Unit 3: Database Maintenance, Monitoring, and Problem Determination",
      "summary": "Maintenance utilities and baseline monitoring to prevent outages and support evidence-driven troubleshooting.",
      "topics": [
        "RUNSTATS and REORG basics (conceptual)",
        "Monitoring mindset (what matters first)",
        "Basic diagnostics approach and evidence capture",
        "Planning maintenance windows and verification steps"
      ],
      "takeaways": [
        "Use maintenance strategically: collect stats and reorg based on evidence, not habit.",
        "Monitor logs, tablespaces, lock waits, and top SQL to reduce incident surprises.",
        "Build operational checklists for maintenance: pre-check → execute → validate → document."
      ],
      "risks": [
        "Maintenance without evidence can waste windows and introduce regressions.",
        "No baseline metrics makes root cause analysis speculative.",
        "Ignoring early warnings (log/tablespace trends) creates outages."
      ],
      "questions": [
        {
          "id": "p2u3_q1",
          "prompt": "Scenario: After a large bulk load, queries suddenly run slower. What is a common DBA root cause and fix?",
          "options": [
            {
              "text": "Optimizer regression due to missing/old statistics; run RUNSTATS (with appropriate distribution) then validate plans",
              "correct": true,
              "explain": "Bulk changes often invalidate statistics. The optimizer may choose worse plans until stats are refreshed."
            },
            {
              "text": "The database permanently lost indexes",
              "correct": false,
              "explain": ""
            },
            {
              "text": "The network DNS settings changed",
              "correct": false,
              "explain": ""
            }
          ],
          "difficulty": "E",
          "tags": [
            "performance",
            "stats"
          ]
        },
        {
          "id": "p2u3_q2",
          "prompt": "Which monitoring approach is most practical for early outage prevention?",
          "options": [
            {
              "text": "Only look at monitoring after users complain",
              "correct": false,
              "explain": ""
            },
            {
              "text": "Trend key capacity and wait indicators (logs, tablespaces, locks, top SQL) with thresholds and ownership",
              "correct": true,
              "explain": "Preventative operations depend on trending + thresholds + action ownership."
            },
            {
              "text": "Disable monitoring to reduce overhead",
              "correct": false,
              "explain": ""
            }
          ],
          "difficulty": "M",
          "tags": [
            "monitoring"
          ]
        },
        {
          "id": "p2u3_q3",
          "prompt": "Scenario: A maintenance window ends. What is the best enterprise post-maintenance action?",
          "options": [
            {
              "text": "Assume it worked and close the ticket",
              "correct": false,
              "explain": ""
            },
            {
              "text": "Validate success criteria (state checks, sample queries, utility outputs), document changes, and capture evidence",
              "correct": true,
              "explain": "Enterprise change control requires verification and documentation."
            },
            {
              "text": "Delete logs to save disk",
              "correct": false,
              "explain": ""
            }
          ],
          "difficulty": "E",
          "tags": [
            "change-control"
          ]
        },
        {
          "id": "p2u3_q4",
          "prompt": "In problem determination, why is a baseline important?",
          "options": [
            {
              "text": "It reduces the number of tables",
              "correct": false,
              "explain": ""
            },
            {
              "text": "It provides a reference point to identify what changed and whether metrics are abnormal",
              "correct": true,
              "explain": "Without a baseline, you can’t reliably say if current behavior is normal or degraded."
            },
            {
              "text": "It automatically repairs corruption",
              "correct": false,
              "explain": ""
            }
          ],
          "difficulty": "M",
          "tags": [
            "troubleshooting"
          ]
        }
      ]
    }
  ]
};
