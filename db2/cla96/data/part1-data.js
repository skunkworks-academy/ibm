const PART1_DATA = {
  id: "part1",
  title: "Db2 Foundations & Architecture",
  units: [
    {
      id: "p1u1",
      title: "Db2 Architecture",
      topics: [
        "Instance vs Database",
        "Db2 process model (EDUs)",
        "Memory architecture (bufferpools, sortheap)",
        "System catalog structure"
      ],
      takeaways: [
        "Instance manages engine resources and can host multiple databases.",
        "Bufferpool sizing directly affects IO and performance.",
        "Catalog tables store metadata critical to optimizer."
      ],
      risks: [
        "Improper instance-level config affects all databases.",
        "Under-sized bufferpools increase disk reads."
      ],
      questions: [
        {
          q: "What is the primary function of a Db2 instance?",
          options: [
            "Manage the Db2 engine and multiple databases",
            "Store application tables",
            "Execute SQL only",
            "Replace operating system"
          ],
          answer: 0,
          explanation: "An instance manages engine resources and can host multiple databases."
        }
      ]
    }
  ]
};
