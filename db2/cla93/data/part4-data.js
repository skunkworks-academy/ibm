const PART4_DATA = {
  id: "part4",
  title: "Performance & Tuning",
  units: [
    {
      id: "p4u1",
      title: "Index Strategy",
      topics: [
        "Composite indexes",
        "Index monitoring",
        "Design Advisor"
      ],
      takeaways: [
        "Indexes must match workload patterns.",
        "Over-indexing slows writes.",
        "Monitor unused indexes."
      ],
      risks: [
        "Dead indexes waste resources.",
        "Wrong key order prevents matching."
      ],
      questions: [
        {
          q: "What is the primary risk of over-indexing?",
          options: [
            "Slower DML operations",
            "HADR failure",
            "Database corruption",
            "Optimizer shutdown"
          ],
          answer: 0,
          explanation: "Every index must be maintained during DML."
        }
      ]
    }
  ]
};
