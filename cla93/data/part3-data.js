const PART3_DATA = {
  id: "part3",
  title: "Maintenance & Monitoring",
  units: [
    {
      id: "p3u1",
      title: "Statistics & RUNSTATS",
      topics: [
        "Optimizer statistics",
        "Distribution statistics",
        "Statistics profiles"
      ],
      takeaways: [
        "Statistics drive access plans.",
        "Run RUNSTATS after bulk changes.",
        "Use SET PROFILE for consistency."
      ],
      risks: [
        "Outdated stats cause poor performance.",
        "Over-sampling may distort cost estimates."
      ],
      questions: [
        {
          q: "Why are distribution statistics important?",
          options: [
            "Improve optimizer selectivity",
            "Reduce log size",
            "Enable HADR",
            "Compress data"
          ],
          answer: 0,
          explanation: "Skewed data affects cardinality estimates."
        }
      ]
    }
  ]
};
