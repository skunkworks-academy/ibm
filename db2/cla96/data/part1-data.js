window.CLA96G_DATA = window.CLA96G_DATA || {};
window.CLA96G_DATA['part1'] = {
  "id": "part1",
  "title": "Part 1: Foundations for Relational DBAs",
  "units": [
    {
      "id": "p1u1",
      "title": "Unit 1: Introduction to Db2 v12.1",
      "summary": "Db2 LUW concepts, core architecture, and foundational terminology DBAs use daily.",
      "topics": [
        "Db2 instance vs database vs objects",
        "System catalog and metadata",
        "Basic connectivity model (client → server)",
        "Operational responsibilities (availability, integrity, performance, security)"
      ],
      "takeaways": [
        "Treat every change as controlled: baseline → change → validate → document → rollback-ready.",
        "Triage incidents by separating connectivity vs authorization vs service state vs SQL/workload.",
        "Catalog health matters: metadata drives authorization and optimizer behaviour."
      ],
      "risks": [
        "Changing instance-level configuration can impact all databases under the instance.",
        "Misdiagnosing connectivity as 'database corruption' wastes time and increases risk.",
        "Untracked changes cause repeat outages and weakens audit posture."
      ],
      "questions": [
        {
          "id": "p1u1_q1",
          "prompt": "Scenario: A new application cannot connect to Db2. Ping works, but the app reports 'connection refused'. What should you check first?",
          "options": [
            {
              "text": "Database corruption and immediate restore",
              "correct": false,
              "explain": ""
            },
            {
              "text": "Whether the Db2 service/port is listening on the server (db2start, port, firewall)",
              "correct": true,
              "explain": "‘Connection refused’ usually indicates nothing is listening on the target port or a firewall is blocking. Verify instance is up and the service/port is reachable before deeper DB checks."
            },
            {
              "text": "Reorg all tables to clear locks",
              "correct": false,
              "explain": ""
            }
          ],
          "difficulty": "E",
          "tags": [
            "connectivity",
            "triage"
          ]
        },
        {
          "id": "p1u1_q2",
          "prompt": "Which statement best describes the relationship between an instance and databases in Db2 LUW?",
          "options": [
            {
              "text": "A database contains multiple instances",
              "correct": false,
              "explain": ""
            },
            {
              "text": "An instance provides the runtime environment that can host one or more databases",
              "correct": true,
              "explain": "Db2 LUW: the instance is the engine/runtime context; databases are created/managed within the instance."
            },
            {
              "text": "An instance is equivalent to a schema",
              "correct": false,
              "explain": ""
            }
          ],
          "difficulty": "M",
          "tags": [
            "architecture"
          ]
        }
      ]
    },
    {
      "id": "p1u2",
      "title": "Unit 2: Db2 Command Line and GUI Tools",
      "summary": "CLP discipline, scripting, and tool-based operations for repeatable, auditable administration.",
      "topics": [
        "Db2 CLP usage patterns and scripting",
        "Capturing evidence (logs/output) for audit and RCA",
        "Basic GUI tooling (Data Studio / Admin views)",
        "Utility monitoring habits (check status, messages)"
      ],
      "takeaways": [
        "Prefer repeatable scripts with logs over manual command re-entry.",
        "Capture command output + timestamps during change windows.",
        "Standardize runbooks for start/stop, backup, and incident triage."
      ],
      "risks": [
        "Manual, ad-hoc operations increase human error and reduce reproducibility.",
        "Lack of evidence makes incidents harder to resolve and audit.",
        "Ignoring utility message output can leave objects in pending states."
      ],
      "questions": [
        {
          "id": "p1u2_q1",
          "prompt": "Scenario: You ran a bulk utility during maintenance, but users still report issues. What is the most enterprise-appropriate next step?",
          "options": [
            {
              "text": "Assume the utility completed successfully; move on",
              "correct": false,
              "explain": ""
            },
            {
              "text": "Review utility output/messages and capture evidence (e.g., message files / status) before additional changes",
              "correct": true,
              "explain": "Enterprise ops requires evidence. Utility messages often indicate warnings, pending states, or follow-up actions required."
            },
            {
              "text": "Immediately reboot the server",
              "correct": false,
              "explain": ""
            }
          ],
          "difficulty": "E",
          "tags": [
            "operations",
            "utilities"
          ]
        },
        {
          "id": "p1u2_q2",
          "prompt": "Why is scripting administrative tasks preferred in enterprise environments?",
          "options": [
            {
              "text": "It reduces CPU usage",
              "correct": false,
              "explain": ""
            },
            {
              "text": "It increases repeatability, lowers human error, and provides audit evidence",
              "correct": true,
              "explain": "Scripts standardize change execution and provide traceability via logs/output."
            },
            {
              "text": "It prevents the need for monitoring",
              "correct": false,
              "explain": ""
            }
          ],
          "difficulty": "M",
          "tags": [
            "governance",
            "scripting"
          ]
        }
      ]
    },
    {
      "id": "p1u3",
      "title": "Unit 3: The Db2 Database Manager Instance",
      "summary": "Instance operations, configuration scope, and service lifecycle controls.",
      "topics": [
        "Instance lifecycle (start/stop) and environment",
        "Instance-level configuration vs database-level configuration",
        "Understanding logs at a high level (existence and purpose)",
        "Basic instance diagnostic approach"
      ],
      "takeaways": [
        "Confirm scope: instance parameters affect all databases under the instance.",
        "Know your startup dependencies (filesystem, permissions, ports).",
        "Use a consistent incident timeline: what changed, when symptoms started."
      ],
      "risks": [
        "Restarting the instance without understanding root cause can worsen incidents.",
        "Incorrect environment variables can point tools to the wrong instance.",
        "Over-privileged accounts increase blast radius."
      ],
      "questions": [
        {
          "id": "p1u3_q1",
          "prompt": "Scenario: After a server patch, `db2 connect` fails intermittently for multiple databases in the same instance. Which is most likely?",
          "options": [
            {
              "text": "A single table is corrupt",
              "correct": false,
              "explain": ""
            },
            {
              "text": "An instance-level issue (service/port, instance start state, OS/network changes) affecting all hosted databases",
              "correct": true,
              "explain": "When multiple DBs in the same instance show similar symptoms, suspect instance/service/OS layer changes first."
            },
            {
              "text": "Missing column statistics",
              "correct": false,
              "explain": ""
            }
          ],
          "difficulty": "E",
          "tags": [
            "scope",
            "triage"
          ]
        },
        {
          "id": "p1u3_q2",
          "prompt": "What’s the key operational difference between instance configuration and database configuration?",
          "options": [
            {
              "text": "Instance config applies to a specific schema only",
              "correct": false,
              "explain": ""
            },
            {
              "text": "Instance config generally affects the engine/runtime and can affect multiple databases; DB config applies per database",
              "correct": true,
              "explain": "Scope matters: instance-level settings can change behaviour across all databases under the instance."
            },
            {
              "text": "Database config overrides OS firewall rules",
              "correct": false,
              "explain": ""
            }
          ],
          "difficulty": "M",
          "tags": [
            "configuration"
          ]
        }
      ]
    },
    {
      "id": "p1u4",
      "title": "Unit 4: Creating Databases and Data Placement",
      "summary": "Database creation, tablespaces, and placement decisions that influence performance, recovery, and manageability.",
      "topics": [
        "Create database fundamentals",
        "Tablespace concepts and layout",
        "Data vs logs placement rationale",
        "Storage management approach (automatic storage concepts)"
      ],
      "takeaways": [
        "Separate logs from data where possible for performance and recovery reliability.",
        "Plan growth: tablespace placement is a long-term decision.",
        "Document storage topology and naming conventions."
      ],
      "risks": [
        "Poor placement increases IO contention and complicates recovery.",
        "Undersized filesystems cause outages (tablespace full / log full).",
        "Ad-hoc tablespace creation leads to fragmentation and operational drift."
      ],
      "questions": [
        {
          "id": "p1u4_q1",
          "prompt": "Scenario: Your production DB shows frequent log full events during batch loads. What is the best initial DBA action?",
          "options": [
            {
              "text": "Drop indexes to reduce logging",
              "correct": false,
              "explain": ""
            },
            {
              "text": "Review logging configuration/capacity and workload pattern; adjust log sizing/archival strategy appropriately",
              "correct": true,
              "explain": "Log full events indicate insufficient log capacity or archival throughput. First validate log configuration and workload characteristics."
            },
            {
              "text": "Disable logging permanently",
              "correct": false,
              "explain": ""
            }
          ],
          "difficulty": "E",
          "tags": [
            "logging",
            "capacity"
          ]
        },
        {
          "id": "p1u4_q2",
          "prompt": "Why do DBAs commonly separate logs from data storage?",
          "options": [
            {
              "text": "It makes SQL syntax simpler",
              "correct": false,
              "explain": ""
            },
            {
              "text": "It reduces IO contention and improves recoverability and performance predictability",
              "correct": true,
              "explain": "Separating logs and data reduces competing IO patterns and helps during recovery and intensive workloads."
            },
            {
              "text": "It is required for all databases",
              "correct": false,
              "explain": ""
            }
          ],
          "difficulty": "M",
          "tags": [
            "storage",
            "recovery"
          ]
        }
      ]
    },
    {
      "id": "p1u5",
      "title": "Unit 5: Creating Database Objects",
      "summary": "Schemas, tables, indexes, views, and structures DBAs must manage for OLTP and analytics workloads.",
      "topics": [
        "Schemas, tables, indexes, views",
        "Temporary tables and specialized structures",
        "Partitioning concepts (high-level)",
        "Design considerations (OLTP vs analytics)"
      ],
      "takeaways": [
        "Enforce naming conventions and ownership (schema strategy) for maintainability.",
        "Index design should be workload-driven, not speculative.",
        "Use views to control exposure and simplify access patterns where appropriate."
      ],
      "risks": [
        "Object sprawl increases maintenance and security risk.",
        "Poor schema ownership complicates privilege management.",
        "Wrong index strategy can degrade write performance."
      ],
      "questions": [
        {
          "id": "p1u5_q1",
          "prompt": "Scenario: A team requests broad DBADM rights so they can create objects quickly. What is the best DBA response?",
          "options": [
            {
              "text": "Grant DBADM; it saves time",
              "correct": false,
              "explain": ""
            },
            {
              "text": "Use role-based, least-privilege grants (e.g., schema/object-level rights) and document exceptions with expiry",
              "correct": true,
              "explain": "Least privilege reduces blast radius and supports auditability. Grant only what’s needed for the task and scope."
            },
            {
              "text": "Deny all access permanently",
              "correct": false,
              "explain": ""
            }
          ],
          "difficulty": "E",
          "tags": [
            "security",
            "governance"
          ]
        },
        {
          "id": "p1u5_q2",
          "prompt": "Which object strategy best supports controlled exposure of data for apps/teams?",
          "options": [
            {
              "text": "Give all users direct access to base tables",
              "correct": false,
              "explain": ""
            },
            {
              "text": "Use views and role-based privileges to present curated access",
              "correct": true,
              "explain": "Views can simplify access and support controlled exposure; privileges can be granted on views rather than base tables."
            },
            {
              "text": "Disable privileges to force application use",
              "correct": false,
              "explain": ""
            }
          ],
          "difficulty": "M",
          "tags": [
            "authorization",
            "objects"
          ]
        }
      ]
    },
    {
      "id": "p1u6",
      "title": "Unit 6: Recovery and Troubleshooting Fundamentals",
      "summary": "Foundational recovery thinking, incident triage, and evidence-driven problem determination.",
      "topics": [
        "Recovery mindset: backups vs restores",
        "Common failure categories (connectivity, auth, resource, SQL, storage)",
        "Diagnostics and evidence collection basics",
        "Operational runbooks and escalation patterns"
      ],
      "takeaways": [
        "Backups are not proof of recovery—successful restores are.",
        "Build a first-response checklist: what to check in the first 10 minutes.",
        "Always capture evidence before restarting services when possible."
      ],
      "risks": [
        "Unverified backups create false confidence and increase incident duration.",
        "Restarting without evidence can destroy forensic context.",
        "No runbooks means inconsistent outcomes between DBAs."
      ],
      "questions": [
        {
          "id": "p1u6_q1",
          "prompt": "Scenario: A restore completed, but applications cannot use the database and it reports a pending state. What does this most likely mean?",
          "options": [
            {
              "text": "The network is down",
              "correct": false,
              "explain": ""
            },
            {
              "text": "Additional recovery steps are required (e.g., rollforward) before the database becomes usable",
              "correct": true,
              "explain": "Many restore types require follow-up actions (like rollforward). Pending state is a signal that recovery is not complete."
            },
            {
              "text": "Indexes must be dropped",
              "correct": false,
              "explain": ""
            }
          ],
          "difficulty": "E",
          "tags": [
            "recovery",
            "states"
          ]
        },
        {
          "id": "p1u6_q2",
          "prompt": "Which statement best reflects best practice for incident handling?",
          "options": [
            {
              "text": "Restart first, investigate later",
              "correct": false,
              "explain": ""
            },
            {
              "text": "Capture evidence (symptoms/logs/timestamps), triage root cause category, then apply controlled remediation",
              "correct": true,
              "explain": "Evidence-first avoids guessing and supports RCA. Controlled remediation reduces repeat incidents."
            },
            {
              "text": "Only investigate after business hours",
              "correct": false,
              "explain": ""
            }
          ],
          "difficulty": "M",
          "tags": [
            "troubleshooting",
            "operations"
          ]
        }
      ]
    }
  ]
};
