const PART2_DATA = {
  id: "part2",
  title: "Data Management & Recovery",
  units: [
    {
      id: "p2u1",
      title: "Data Movement",
      topics: [
        "INSERT vs LOAD vs IMPORT vs INGEST",
        "Load phases",
        "Set Integrity Pending",
        "Utility monitoring"
      ],
      takeaways: [
        "Use LOAD for bulk high-speed ingestion.",
        "Use INGEST for concurrent workloads.",
        "Always inspect .msg files after load."
      ],
      risks: [
        "NONRECOVERABLE loads eliminate rollforward capability.",
        "LOAD REPLACE truncates on failure."
      ],
      questions: [
        {
          q: "When is INGEST preferred over LOAD?",
          options: [
            "When concurrency is required",
            "When loading XML",
            "When IXF file is used",
            "When running REORG"
          ],
          answer: 0,
          explanation: "INGEST allows row locking and concurrent activity."
        }
      ]
    }
  ]
};
