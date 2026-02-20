window.CLA96G_DATA = window.CLA96G_DATA || {};
window.CLA96G_DATA['part3'] = {
  "id": "part3",
  "title": "Part 3: Locking, Concurrency, and Security",
  "units": [
    {
      "id": "p3u1",
      "title": "Unit 1: Locking and Concurrency Control",
      "summary": "Locks, isolation levels, deadlocks/timeouts, and evidence-driven triage of concurrency incidents.",
      "topics": [
        "Lock types and lock waits (conceptual)",
        "Isolation levels and concurrency trade-offs",
        "Deadlocks vs lock timeouts",
        "Triage approach for blocking chains"
      ],
      "takeaways": [
        "Treat lock incidents as workload + transaction design problems, not only 'DB issues'.",
        "Identify blockers first: blocking chains often point to the root cause transaction.",
        "Use controlled remediation: terminate the right session only after evidence capture."
      ],
      "risks": [
        "Killing random sessions can worsen incidents and lose forensic context.",
        "Improper isolation can cause blocking or inconsistent reads.",
        "Long transactions increase lock footprint and log usage."
      ],
      "questions": [
        {
          "id": "p3u1_q1",
          "prompt": "Scenario: Users report lock timeout symptoms. What is a best first step?",
          "options": [
            {
              "text": "Reboot the database server",
              "correct": false,
              "explain": ""
            },
            {
              "text": "Identify the blocking transaction/session and capture evidence (blocking chain) before remediation",
              "correct": true,
              "explain": "Lock timeouts are caused by blockers. Find blockers, capture evidence, then apply controlled action."
            },
            {
              "text": "Run REORG on all tables",
              "correct": false,
              "explain": ""
            }
          ],
          "difficulty": "E",
          "tags": [
            "locking",
            "triage"
          ]
        },
        {
          "id": "p3u1_q2",
          "prompt": "What is the operational difference between a deadlock and a lock timeout?",
          "options": [
            {
              "text": "Deadlock is mutual blocking detected by the engine; timeout is waiting too long on a lock",
              "correct": true,
              "explain": "Deadlock is cyclic dependency; timeout is duration-based wait failure."
            },
            {
              "text": "Timeout always means corruption",
              "correct": false,
              "explain": ""
            },
            {
              "text": "Deadlock only happens during backup",
              "correct": false,
              "explain": ""
            }
          ],
          "difficulty": "M",
          "tags": [
            "locking"
          ]
        },
        {
          "id": "p3u1_q3",
          "prompt": "Scenario: A batch job holds locks for hours and blocks OLTP users. Which change is most appropriate?",
          "options": [
            {
              "text": "Reduce transaction scope/commit more frequently (while preserving correctness)",
              "correct": true,
              "explain": "Long transactions hold locks longer. Committing more frequently reduces lock footprint and contention."
            },
            {
              "text": "Disable locking",
              "correct": false,
              "explain": ""
            },
            {
              "text": "Grant SYSADM to the batch user",
              "correct": false,
              "explain": ""
            }
          ],
          "difficulty": "E",
          "tags": [
            "transactions",
            "concurrency"
          ]
        },
        {
          "id": "p3u1_q4",
          "prompt": "Which statement best describes the purpose of isolation levels?",
          "options": [
            {
              "text": "They define how transactions see and are affected by concurrent changes",
              "correct": true,
              "explain": "Isolation levels are concurrency correctness policies (trade-off between consistency and concurrency)."
            },
            {
              "text": "They change filesystem permissions",
              "correct": false,
              "explain": ""
            },
            {
              "text": "They only affect backups",
              "correct": false,
              "explain": ""
            }
          ],
          "difficulty": "M",
          "tags": [
            "isolation"
          ]
        }
      ]
    },
    {
      "id": "p3u2",
      "title": "Unit 2: Security and Access Control Fundamentals",
      "summary": "Authentication vs authorization, authorities vs privileges, roles, and separation of duties.",
      "topics": [
        "Authentication vs authorization",
        "Authorities vs privileges (conceptual)",
        "Role-based access control",
        "Separation of duties"
      ],
      "takeaways": [
        "Prefer role-based privileges over per-user sprawl.",
        "Separate SECADM from SYSADM where feasible.",
        "Document exceptions (who/why/expiry) for audit."
      ],
      "risks": [
        "Shared accounts destroy auditability and accountability.",
        "Over-privileged users increase breach blast radius.",
        "Privilege creep accumulates over time without reviews."
      ],
      "questions": [
        {
          "id": "p3u2_q1",
          "prompt": "Scenario: An auditor asks 'who changed privileges last month?'. Which practice best supports answering?",
          "options": [
            {
              "text": "Use shared DBA credentials for convenience",
              "correct": false,
              "explain": ""
            },
            {
              "text": "Use individual accounts, role-based grants, and evidence/logging for changes",
              "correct": true,
              "explain": "Individual accounts + evidence provide traceability required for audits."
            },
            {
              "text": "Disable auditing for performance",
              "correct": false,
              "explain": ""
            }
          ],
          "difficulty": "E",
          "tags": [
            "audit",
            "rbac"
          ]
        },
        {
          "id": "p3u2_q2",
          "prompt": "Which statement best defines authentication vs authorization?",
          "options": [
            {
              "text": "Authentication = who you are; authorization = what you can do",
              "correct": true,
              "explain": "AuthN proves identity; AuthZ grants permissions."
            },
            {
              "text": "Authentication = what you can do; authorization = who you are",
              "correct": false,
              "explain": ""
            },
            {
              "text": "They mean the same thing",
              "correct": false,
              "explain": ""
            }
          ],
          "difficulty": "M",
          "tags": [
            "security-basics"
          ]
        },
        {
          "id": "p3u2_q3",
          "prompt": "Scenario: A developer needs to create objects in one schema only. Best approach?",
          "options": [
            {
              "text": "Grant DBADM for speed",
              "correct": false,
              "explain": ""
            },
            {
              "text": "Grant schema/object-level privileges (or role) limited to that schema; time-box exceptions",
              "correct": true,
              "explain": "Least privilege: grant only what’s required and scope it to the relevant objects."
            },
            {
              "text": "Grant SECADM",
              "correct": false,
              "explain": ""
            }
          ],
          "difficulty": "E",
          "tags": [
            "least-privilege"
          ]
        },
        {
          "id": "p3u2_q4",
          "prompt": "Why is least privilege a core security principle?",
          "options": [
            {
              "text": "It reduces the blast radius of mistakes or compromise",
              "correct": true,
              "explain": "Fewer privileges means fewer ways to cause damage—accidental or malicious."
            },
            {
              "text": "It increases query performance",
              "correct": false,
              "explain": ""
            },
            {
              "text": "It prevents the need for backups",
              "correct": false,
              "explain": ""
            }
          ],
          "difficulty": "M",
          "tags": [
            "security"
          ]
        }
      ]
    },
    {
      "id": "p3u3",
      "title": "Unit 3: More about Db2 Security and Access Control",
      "summary": "Operational security patterns: privileged workflows, access reviews, and secure admin habits.",
      "topics": [
        "Privileged operations workflow (change control)",
        "Access reviews and periodic audits",
        "Secure credential handling and break-glass approach",
        "Secure defaults and exception management"
      ],
      "takeaways": [
        "Implement periodic access reviews: remove stale privileges.",
        "Use break-glass access sparingly and record its use.",
        "Keep security operational: ownership, evidence, and repeatable procedures."
      ],
      "risks": [
        "Stale privileges persist after staff changes.",
        "Unmanaged break-glass accounts become permanent backdoors.",
        "Inconsistent privilege management increases incident response time."
      ],
      "questions": [
        {
          "id": "p3u3_q1",
          "prompt": "Scenario: A contractor finishes a project but still has privileges months later. Which control failed?",
          "options": [
            {
              "text": "Access review/offboarding process",
              "correct": true,
              "explain": "Access reviews and offboarding should remove unneeded privileges when roles change or contracts end."
            },
            {
              "text": "RUNSTATS schedule",
              "correct": false,
              "explain": ""
            },
            {
              "text": "HADR failover",
              "correct": false,
              "explain": ""
            }
          ],
          "difficulty": "E",
          "tags": [
            "governance",
            "offboarding"
          ]
        },
        {
          "id": "p3u3_q2",
          "prompt": "What is a 'break-glass' account used for?",
          "options": [
            {
              "text": "Emergency access when normal admin paths fail, with strict logging and controls",
              "correct": true,
              "explain": "Break-glass access is a last-resort emergency mechanism and must be tightly governed."
            },
            {
              "text": "Daily DBA work to speed up tasks",
              "correct": false,
              "explain": ""
            },
            {
              "text": "A shared developer account",
              "correct": false,
              "explain": ""
            }
          ],
          "difficulty": "M",
          "tags": [
            "ops-security"
          ]
        },
        {
          "id": "p3u3_q3",
          "prompt": "Scenario: You must grant elevated privileges for a critical incident. Best enterprise practice?",
          "options": [
            {
              "text": "Grant permanently to avoid future delays",
              "correct": false,
              "explain": ""
            },
            {
              "text": "Grant temporarily with documented justification and an expiry date; remove after incident",
              "correct": true,
              "explain": "Time-boxed access limits privilege creep and improves auditability."
            },
            {
              "text": "Grant to an anonymous shared account",
              "correct": false,
              "explain": ""
            }
          ],
          "difficulty": "E",
          "tags": [
            "privileges",
            "change-control"
          ]
        },
        {
          "id": "p3u3_q4",
          "prompt": "Why are shared accounts discouraged?",
          "options": [
            {
              "text": "They reduce accountability and hinder audit trails",
              "correct": true,
              "explain": "Shared accounts prevent attribution and break security auditing."
            },
            {
              "text": "They increase storage use",
              "correct": false,
              "explain": ""
            },
            {
              "text": "They make backups slower",
              "correct": false,
              "explain": ""
            }
          ],
          "difficulty": "M",
          "tags": [
            "audit"
          ]
        }
      ]
    }
  ]
};
