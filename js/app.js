const missions = [
  {
    title: "01 — The Silent Website",
    description: "The website is down. Investigate Nginx and restore the service.",
    difficulty: "EASY",
    reward: 100,
    hint: "Check the service, read its logs, then restart it.",
    objectives: [
      "Inspect the Nginx service",
      "Investigate the Nginx logs",
      "Restart Nginx to restore the website"
    ],
    commands: [
      "systemctl status nginx",
      "journalctl -u nginx",
      "sudo systemctl restart nginx"
    ],
    outputs: [
      "nginx.service - Web Server\nLoaded: loaded\nActive: inactive (dead)\nThe web server is currently stopped.",
      "Recent log: nginx failed to start because the service stopped unexpectedly.\nInvestigate the service status, then restart it.",
      "Simulated action successful: nginx is now active (running).\nWebsite restored. Mission complete!"
    ]
  },
  {
    title: "02 — The Full Disk",
    description: "A server is running out of storage. Find the cause and perform a simulated log rotation.",
    difficulty: "EASY",
    reward: 150,
    hint: "Use df -h to check disk usage, then inspect /var/log.",
    objectives: [
      "Check filesystem space",
      "Inspect the log directory size",
      "Run the simulated log rotation"
    ],
    commands: [
      "df -h",
      "du -sh /var/log",
      "sudo logrotate"
    ],
    outputs: [
      "Filesystem      Size  Used  Avail  Use%\n/dev/root        10G   9.2G  800M   92%\nWarning: disk usage is critically high.",
      "/var/log uses 4.2G of space.\nLarge log files may be contributing to the storage problem.",
      "Simulated log rotation complete.\nOld logs archived. Disk pressure reduced. Mission complete!"
    ]
  },
  {
    title: "03 — The Locked Door",
    description: "A deployment script cannot run because it lacks execute permission.",
    difficulty: "MEDIUM",
    reward: 200,
    hint: "Inspect deploy.sh, use chmod u+x deploy.sh, then inspect its permissions again.",
    objectives: [
      "Inspect deploy.sh permissions",
      "Grant the owner execute permission",
      "Verify the updated permissions"
    ],
    commands: [
      "ls -l deploy.sh",
      "chmod u+x deploy.sh",
      "ls -l deploy.sh"
    ],
    outputs: [
      "-rw-r--r-- 1 ubuntu ubuntu 245 deploy.sh\nThe owner does not have execute permission.",
      "Simulated permission change successful.",
      "-rwxr--r-- 1 ubuntu ubuntu 245 deploy.sh\nOwner execute permission verified. Mission complete!"
    ]
  },
  {
    title: "04 — The Busy Node",
    description: "An application server is overloaded. Investigate the processes and stop the simulated runaway process.",
    difficulty: "HARD",
    reward: 300,
    hint: "Use top and ps aux to investigate, then terminate process 4242.",
    objectives: [
      "Inspect system activity",
      "Find the problematic process",
      "Stop process 4242"
    ],
    commands: [
      "top",
      "ps aux",
      "kill 4242"
    ],
    outputs: [
      "CPU usage: 97%\nMemory usage: 81%\nSystem load is unusually high.",
      "USER       PID  %CPU  COMMAND\nubuntu     4242  94.0  runaway-worker\nInvestigate process 4242.",
      "Simulated process 4242 stopped.\nCPU pressure reduced. Node stabilised. Mission complete!"
    ]
  }
];

const $ = id => document.getElementById(id);
const storageKey = "devopsLevelUpSimulatorV1";

let saved = {};
try {
  saved = JSON.parse(localStorage.getItem(storageKey) || "{}") || {};
} catch {
  saved = {};
}

let currentMission = Math.min(
  Math.max(Number(saved.currentMission) || 0, 0),
  missions.length - 1
);
let xp = Math.max(0, Number(saved.xp) || 0);
let completed = new Set(
  Array.isArray(saved.completed) ? saved.completed : []
);
let step = Math.max(0, Number(saved.step) || 0);
let fixedWebsite = Boolean(saved.fixedWebsite);
let executable = Boolean(saved.executable);
let processStopped = Boolean(saved.processStopped);

if (completed.has(0)) fixedWebsite = true;
if (completed.has(2)) executable = true;
if (completed.has(3)) processStopped = true;

function saveProgress() {
  localStorage.setItem(storageKey, JSON.stringify({
    currentMission,
    xp,
    completed: [...completed],
    step,
    fixedWebsite,
    executable,
    processStopped
  }));
}

function printLine(text, type = "output") {
  const output = $("terminal-output");
  const p = document.createElement("p");
  p.className = type;
  p.textContent = text;
  output.appendChild(p);
  output.scrollTop = output.scrollHeight;
}

function clearTerminal() {
  $("terminal-output").replaceChildren();
}

function updateProgress() {
  $("xp").textContent = xp;
  $("completed").textContent = `${completed.size} / ${missions.length}`;
  $("progress-bar").style.width =
    `${(completed.size / missions.length) * 100}%`;

  $("rank").textContent =
    xp >= 600 ? "ELITE" :
    xp >= 300 ? "ENGINEER" :
    xp >= 100 ? "OPERATOR" : "ROOKIE";

  $("incident-count").textContent =
    completed.size === missions.length ? "ALL RESOLVED" : "1 ACTIVE";

  $("incident-name").textContent =
    completed.size === missions.length
      ? "All training incidents resolved"
      : missions[currentMission].title;

  const detail = $("incident-detail");
  if (detail) {
    detail.textContent = completed.size === missions.length
      ? "LAB-01 · All missions completed"
      : `LAB-01 · Mission ${currentMission + 1} requires investigation`;
  }

  ["web-01", "db-01", "app-01"].forEach(server => {
    const status = $(`state-${server}`);
    if (!status) return;

    if (server === "web-01" && fixedWebsite) {
      status.textContent = "HEALTHY";
    } else if (server === "web-01" && currentMission === 0) {
      status.textContent = "INCIDENT";
    } else if (server === "app-01" && currentMission === 3 && !processStopped) {
      status.textContent = "HIGH CPU";
    } else {
      status.textContent = "HEALTHY";
    }
  });

  document.querySelectorAll(".server-light").forEach(light => {
    const server = light.closest(".server");
    if (!server) return;
    const id = server.dataset.server;
    const isProblem =
      (id === "web-01" && !fixedWebsite && currentMission === 0) ||
      (id === "app-01" && currentMission === 3 && !processStopped);
    light.classList.toggle("warning", isProblem);
    light.classList.toggle("good", !isProblem);
  });
}

function renderMission() {
  const mission = missions[currentMission];

  $("mission-title").textContent = mission.title;
  $("mission-description").textContent = mission.description;
  $("difficulty").textContent = mission.difficulty;
  $("reward").textContent = `${mission.reward} XP`;
  $("hint-text").hidden = true;
  $("hint-text").textContent = mission.hint;
  $("hint-button").textContent = "Show hint";

  const list = $("objectives");
  list.replaceChildren();

  mission.objectives.forEach((objective, index) => {
    const row = document.createElement("div");
    row.className = "objective";

    const check = document.createElement("input");
    check.type = "checkbox";
    check.disabled = true;
    check.checked = completed.has(currentMission) || index < step;

    const label = document.createElement("span");
    label.textContent = objective;

    row.classList.toggle("done", check.checked);
    row.append(check, label);
    list.appendChild(row);
  });

  updateProgress();
}

function completeMission() {
  if (completed.has(currentMission)) return;

  const mission = missions[currentMission];
  completed.add(currentMission);
  xp += mission.reward;

  printLine(`+${mission.reward} XP earned!`, "success");
  printLine("Mission objectives completed.", "success");

  if (currentMission === 0) fixedWebsite = true;
  if (currentMission === 2) executable = true;
  if (currentMission === 3) processStopped = true;

  if (completed.size === missions.length) {
    printLine("Congratulations! You completed every training mission!", "success");
    printLine("You are now an ELITE DevOps trainee.", "success");
  } else {
    currentMission = missions.findIndex((_, index) => !completed.has(index));
    step = 0;
    printLine(`Next mission unlocked: ${missions[currentMission].title}`, "success");
  }

  saveProgress();
  renderMission();
}

function runCommand(raw) {
  const command = raw.trim().replace(/\s+/g, " ");

  if (!command) return;

  printLine(`learner@lab:~$ ${command}`, "command-line");
  const lower = command.toLowerCase();

  if (lower === "help") {
    printLine(
      "Available commands:\nhelp, clear, pwd, whoami, ls\n" +
      "systemctl status nginx\njournalctl -u nginx\n" +
      "sudo systemctl restart nginx\n" +
      "df -h\ndu -sh /var/log\nsudo logrotate\n" +
      "ls -l deploy.sh\nchmod u+x deploy.sh\n" +
      "top\nps aux\nkill 4242"
    );
    return;
  }

  if (lower === "clear") {
    clearTerminal();
    return;
  }

  if (lower === "pwd") {
    printLine("/home/learner");
    return;
  }

  if (lower === "whoami") {
    printLine("learner");
    return;
  }

  if (lower === "ls") {
    printLine("deploy.sh  README.md  logs/");
    return;
  }

  const selectedServer =
    document.querySelector(".server.selected")?.dataset.server || "web-01";
  const selectedData = serverMetrics[selectedServer];

  if (["server-info", "metrics", "hostname", "free -h"].includes(lower)) {
    if (lower === "hostname") {
      printLine(`${selectedServer}.lab.internal`, "output");
    } else if (lower === "free -h") {
      const used = Math.round(selectedData.memory * 0.16);
      printLine(
        "               total        used        free\n" +
        `Mem:           8Gi         ${used}Gi        ${8-used}Gi\n` +
        "Swap:          2Gi         0Gi          2Gi",
        "output"
      );
    } else if (lower === "metrics") {
      printLine(
        `${selectedData.name} metrics\n` +
        `CPU: ${selectedData.cpu}%\n` +
        `Memory: ${selectedData.memory}%\n` +
        `Disk: ${selectedData.disk}%`,
        "output"
      );
    } else {
      printLine(
        `Server: ${selectedData.name}\n` +
        `CPU: ${selectedData.cpu}% | Memory: ${selectedData.memory}% | Disk: ${selectedData.disk}%\n` +
        `Service: ${selectedData.service}\n` +
        `Status: ${getMetricHealth(Math.max(selectedData.cpu, selectedData.memory, selectedData.disk))}`,
        "output"
      );
    }
    return;
  }

  // STAGE 3: SIMULATED SERVER TROUBLESHOOTING
  if (completed.has(currentMission)) {
    if (lower === "systemctl status nginx") {
      if (selectedServer !== "web-01") {
        printLine(`nginx.service was not found on ${selectedData.name}.`, "error");
      } else {
        const running = serverMetrics["web-01"].service.includes("RUNNING");
        printLine(
          `nginx.service - Nginx Web Server
   Active: ${running ? "active (running)" : "inactive (dead)"}
   Website: ${running ? "ONLINE" : "UNAVAILABLE"}`,
          running ? "output" : "error"
        );
      }
      return;
    }

    if (lower === "journalctl -u nginx") {
      if (selectedServer !== "web-01") {
        printLine(`No nginx logs found on ${selectedData.name}.`, "error");
      } else if (serverMetrics["web-01"].service.includes("RUNNING")) {
        printLine("nginx.service: Started successfully. Website is online.", "output");
      } else {
        printLine(
          "nginx.service: Failed to start.\nError: Web service is stopped.\nHint: Try sudo systemctl restart nginx",
          "error"
        );
      }
      return;
    }

    if (lower === "sudo systemctl restart nginx") {
      if (selectedServer !== "web-01") {
        printLine(`Cannot restart nginx: service not installed on ${selectedData.name}.`, "error");
      } else {
        serverMetrics["web-01"].service = "nginx: RUNNING";
        serverMetrics["web-01"].note = "Website responding normally";
        updateServerMetrics("web-01");
        printLine("Restarting nginx.service...", "output");
        printLine("Success: nginx is now running. Website is ONLINE.", "success");
        awardBonusChallenge("web");
      }
      return;
    }

    if (lower === "systemctl status postgresql") {
      if (selectedServer !== "db-01") {
        printLine(`postgresql.service was not found on ${selectedData.name}.`, "error");
      } else {
        printLine("postgresql.service - PostgreSQL Database\nActive: active (running)\nDatabase: accepting connections", "output");
      }
      return;
    }

    if (lower === "sudo systemctl restart postgresql") {
      if (selectedServer !== "db-01") {
        printLine(`Cannot restart PostgreSQL: service not installed on ${selectedData.name}.`, "error");
      } else {
        printLine("Restarting postgresql.service...", "output");
        printLine("Success: PostgreSQL is running and accepting connections.", "success");
        awardBonusChallenge("db");
      }
      return;
    }

    if (lower === "kill 4242") {
      if (selectedServer !== "app-01") {
        printLine("Select APP-01 to investigate process 4242.", "error");
      } else {
        serverMetrics["app-01"].cpu = 32;
        serverMetrics["app-01"].note = "High CPU usage resolved";
        updateServerMetrics("app-01");
        printLine("Process 4242 stopped.", "output");
        printLine("CPU usage has returned to normal.", "success");
        awardBonusChallenge("app");
      }
      return;
    }

    if (lower === "systemctl status application") {
      if (selectedServer !== "app-01") {
        printLine(`application.service was not found on ${selectedData.name}.`, "error");
      } else {
        printLine("application.service - Main Application\nActive: active (running)\nWarning: High CPU usage detected", "output");
      }
      return;
    }

    if (lower === "df -h") {
      const used = Math.round(20 * selectedData.disk / 100);
      const available = 20 - used;
      printLine(
        `Filesystem      Size  Used  Avail  Use%  Mounted on
/dev/root        20G   ${used}G    ${available}G   ${selectedData.disk}%   /
Server: ${selectedData.name}`,
        "output"
      );
      return;
    }

    if (lower === "top") {
      printLine(
        `Top processes on ${selectedData.name}
CPU usage: ${selectedData.cpu}%
Memory usage: ${selectedData.memory}%
PID  COMMAND       STATUS
101  systemd       running
4242 application   ${selectedServer === "app-01" ? "high CPU" : "running"}`,
        "output"
      );
      return;
    }

    if (lower === "ps aux") {
      printLine(
        `USER       PID  COMMAND
root         1  /sbin/init
root       101  systemd
learner   4242  ${selectedServer === "app-01" ? "application (high CPU)" : "worker process"}`,
        "output"
      );
      return;
    }
  }

  if (completed.has(currentMission)) {
    printLine("This mission is already complete. Continue to the next assignment.", "success");
    return;
  }

  const mission = missions[currentMission];
  const expected = mission.commands[step];

  if (lower === expected &&
      currentMission === 0 &&
      selectedServer !== "web-01") {
    printLine(
      `You selected ${selectedData.name}. Select WEB-01 to work on the website mission.`,
      "error"
    );
    return;
  }

  if (lower === expected &&
      currentMission === 3 &&
      selectedServer !== "app-01") {
    printLine(
      `You selected ${selectedData.name}. Select APP-01 to work on the busy-node mission.`,
      "error"
    );
    return;
  }

  if (lower !== expected) {
    if (mission.commands.includes(lower) && lower !== expected) {
      printLine(`Not quite yet. Your current objective is: ${mission.objectives[step]}`, "error");
    } else {
      printLine("Command not available in this training simulation. Type help to see supported commands.", "error");
    }
    return;
  }

  if (lower === "chmod u+x deploy.sh") executable = true;
  if (lower === "kill 4242") processStopped = true;

  printLine(mission.outputs[step], "output");
  step++;

  saveProgress();
  renderMission();

  if (step >= mission.commands.length) {
    completeMission();
  }
}

$("terminal-form").addEventListener("submit", event => {
  event.preventDefault();
  const input = $("terminal-input");
  runCommand(input.value);
  input.value = "";
  input.focus();
});

$("hint-button").addEventListener("click", () => {
  const hint = $("hint-text");
  hint.hidden = !hint.hidden;
  $("hint-button").textContent = hint.hidden ? "Show hint" : "Hide hint";
});

$("reset-button").addEventListener("click", () => {
  const confirmed = window.confirm("Reset all mission progress and XP?");
  if (!confirmed) return;

  currentMission = 0;
  xp = 0;
  step = 0;
  completed = new Set();
  fixedWebsite = false;
  executable = false;
  processStopped = false;

  saveProgress();
  clearTerminal();
  printLine("Progress reset. Welcome back to the training lab.", "success");
  renderMission();
});

document.querySelectorAll(".nav-item").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach(item => {
      item.classList.toggle("active", item === button);
    });

    const page = button.dataset.page;
    $("page-title").textContent = {
      mission: "Mission Control",
      servers: "Server Room",
      terminal: "Terminal Lab"
    }[page] || "Mission Control";

    if (page === "servers") {
      printLine("Server room selected. Click a server to inspect it.", "success");
    } else if (page === "terminal") {
      $("terminal-input").focus();
      printLine("Terminal Lab selected. Type help to view supported commands.", "success");
    }
  });
});


const serverMetrics = {
  "web-01": {
    name: "WEB-01",
    cpu: 82,
    memory: 74,
    disk: 92,
    service: "nginx: STOPPED",
    note: "Website unavailable"
  },
  "db-01": {
    name: "DB-01",
    cpu: 28,
    memory: 61,
    disk: 48,
    service: "database: RUNNING",
    note: "Database responding normally"
  },
  "app-01": {
    name: "APP-01",
    cpu: 96,
    memory: 83,
    disk: 55,
    service: "application: RUNNING",
    note: "High CPU usage detected"
  }
};


function animateServerMetrics() {
  const selected = document.querySelector(".server.selected");
  const serverId = selected?.dataset.server || "web-01";
  const data = serverMetrics[serverId];
  if (!data) return;

  const liveCpu = Math.max(1, Math.min(100, data.cpu + Math.round(Math.random() * 8 - 4)));
  const liveMemory = Math.max(1, Math.min(100, data.memory + Math.round(Math.random() * 8 - 4)));
  const health = getMetricHealth(Math.max(liveCpu, liveMemory, data.disk));
  const badge = $("metrics-health");
  if (badge) badge.textContent = health;

  [["cpu", data.cpu], ["memory", data.memory]].forEach(([key, base]) => {
    const value = Math.max(1, Math.min(100, base + Math.round(Math.random() * 8 - 4)));
    const label = $(`metric-${key}`);
    const bar = $(`bar-${key}`);

    if (!label || !bar) return;
    label.textContent = `${value}%`;
    bar.style.width = `${value}%`;
    bar.classList.toggle("warning", value >= 70 && value < 90);
    bar.classList.toggle("critical", value >= 90);
  });
}

setInterval(animateServerMetrics, 3000);

const bonusChallengeCompleted = new Set(
  JSON.parse(localStorage.getItem("devopsLevelUpBonusChallenges") || "[]")
);

function renderBonusChallenges() {
  const ids = ["web", "db", "app"];

  ids.forEach(id => {
    const element = document.getElementById(`bonus-${id}-status`);
    if (!element) return;

    const done = bonusChallengeCompleted.has(id);
    element.textContent = done ? "COMPLETED" : "INCOMPLETE";
    element.classList.toggle("completed", done);
  });

  const count = document.getElementById("bonus-challenge-count");
  if (count) count.textContent = `${bonusChallengeCompleted.size}/3`;
}

function awardBonusChallenge(id) {
  if (bonusChallengeCompleted.has(id)) {
    printLine("You have already earned XP for this bonus challenge.", "output");
    return;
  }

  const names = {
    web: "WEB-01 service restored",
    db: "DB-01 database service restarted",
    app: "APP-01 high-CPU process stopped"
  };

  bonusChallengeCompleted.add(id);
  localStorage.setItem(
    "devopsLevelUpBonusChallenges",
    JSON.stringify([...bonusChallengeCompleted])
  );

  xp += 50;
  printLine(`Bonus challenge complete: ${names[id]}. +50 XP!`, "success");
  updateProgress();
  saveProgress();
  renderBonusChallenges();
}

function getMetricHealth(value) {
  if (value >= 90) return "CRITICAL";
  if (value >= 70) return "WARNING";
  return "NORMAL";
}

function updateServerMetrics(serverId) {
  const data = serverMetrics[serverId];
  if (!data) return;

  $("metrics-server-name").textContent = `${data.name} Overview`;
  $("metrics-health").textContent =
    serverId === "web-01" && !fixedWebsite ? "DEGRADED" :
    serverId === "app-01" && !processStopped && currentMission === 3 ? "WARNING" :
    "HEALTHY";

  [["cpu", data.cpu], ["memory", data.memory], ["disk", data.disk]].forEach(([key, value]) => {
    $(`metric-${key}`).textContent = `${value}%`;
    const bar = $(`bar-${key}`);
    bar.style.width = `${value}%`;
    bar.classList.toggle("warning", value >= 70 && value < 90);
    bar.classList.toggle("critical", value >= 90);
  });

  let service = data.service;
  let note = data.note;

  if (serverId === "web-01" && fixedWebsite) {
    service = "nginx: RUNNING";
    note = "Website restored";
  }
  if (serverId === "app-01" && processStopped) {
    service = "application: RUNNING";
    note = "CPU pressure reduced";
  }

  $("metric-service").textContent = service;
  $("metric-service-note").textContent = note;
}

document.querySelectorAll(".server").forEach(button => {
  button.addEventListener("click", () => {
    const server = button.dataset.server;

    document.querySelectorAll(".server").forEach(item => {
      item.classList.toggle("selected", item === button);
    });

    updateServerMetrics(server);
    printLine(`Inspecting ${server.toUpperCase()}...`, "command-line");

    if (server === "web-01" && !fixedWebsite && currentMission === 0) {
      printLine("Alert: Nginx is stopped. Investigate the service using the terminal.", "error");
    } else if (server === "app-01" && currentMission === 3 && !processStopped) {
      printLine("Alert: CPU usage is high. Investigate process 4242.", "error");
    } else {
      printLine(`${server.toUpperCase()} status: HEALTHY`, "success");
    }
  });
});

renderBonusChallenges();
renderMission();
updateServerMetrics("web-01");
saveProgress();
