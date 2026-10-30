const advancedMissions = [
  {
    id: 5,
    title: "05 — The Git Time Machine",
    difficulty: "EASY",
    reward: 150,
    description: "A developer needs to track changes and save a working version of the application.",
    objectives: [
      "Check the current Git status",
      "Add files to staging",
      "Commit your changes"
    ],
    commands: [
      "git status",
      "git add .",
      "git commit -m \"Initial deployment\""
    ]
  },
  {
    id: 6,
    title: "06 — The Container Challenge",
    difficulty: "MEDIUM",
    reward: 200,
    description: "Your application needs to run inside a Docker container.",
    objectives: [
      "Check the Docker version",
      "List running containers",
      "List available images"
    ],
    commands: [
      "docker --version",
      "docker ps",
      "docker images"
    ]
  },
  {
    id: 7,
    title: "07 — The Automation Engineer",
    difficulty: "MEDIUM",
    reward: 250,
    description: "Use Ansible to communicate with managed servers.",
    objectives: [
      "Check the Ansible version",
      "Inspect the inventory",
      "Ping managed servers"
    ],
    commands: [
      "ansible --version",
      "ansible-inventory --list",
      "ansible all -m ping"
    ]
  },
  {
    id: 8,
    title: "08 — Infrastructure Builder",
    difficulty: "HARD",
    reward: 300,
    description: "Prepare infrastructure using Terraform.",
    objectives: [
      "Check Terraform version",
      "Initialize Terraform",
      "Validate the configuration"
    ],
    commands: [
      "terraform --version",
      "terraform init",
      "terraform validate"
    ]
  }
];
