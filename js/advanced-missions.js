const advancedMissions = [
  {
    id: 5,
    title: "The Git Time Machine",
    reward: 150,
    commands: ["git status", "git add .", 'git commit -m "Initial deployment"']
  },
  {
    id: 6,
    title: "The Container Challenge",
    reward: 200,
    commands: ["docker --version", "docker ps", "docker images"]
  },
  {
    id: 7,
    title: "The Automation Engineer",
    reward: 250,
    commands: ["ansible --version", "ansible-inventory --list", "ansible all -m ping"]
  },
  {
    id: 8,
    title: "Infrastructure Builder",
    reward: 300,
    commands: ["terraform --version", "terraform init", "terraform validate"]
  }
];

const advancedProgressKey = "devopsLevelUpAdvancedProgress";

function startAdvancedMissions() {
  if (document.getElementById("advanced-missions-panel")) return;

  const panel = document.createElement("section");
  panel.id = "advanced-missions-panel";
  panel.style.cssText = "margin:30px auto;padding:20px;max-width:850px;background:#111827;color:white;border:1px solid #334155;border-radius:14px;font-family:Arial,sans-serif";

  panel.innerHTML = `
    <h2>Advanced DevOps Challenges</h2>
    <p>Complete each command sequence to earn XP.</p>
    <div id="advanced-mission-list"></div>
    <div id="advanced-terminal" style="margin-top:20px"></div>
  `;

  document.body.appendChild(panel);

  const list = panel.querySelector("#advanced-mission-list");
  const terminal = panel.querySelector("#advanced-terminal");

  let progress = JSON.parse(localStorage.getItem(advancedProgressKey) || "{}");
  let activeMission = null;
  let step = 0;

  function render() {
    list.innerHTML = advancedMissions.map(mission => `
      <div style="padding:12px;margin:10px 0;background:#1e293b;border-radius:8px">
        <strong>${mission.id}. ${mission.title}</strong>
        <span style="float:right">${mission.reward} XP</span>
        <p>${progress[mission.id] ? "COMPLETED" : "AVAILABLE"}</p>
        <button data-mission="${mission.id}" ${progress[mission.id] ? "disabled" : ""}>
          ${progress[mission.id] ? "Completed" : "Start mission"}
        </button>
      </div>
    `).join("");

    list.querySelectorAll("button").forEach(button => {
      button.addEventListener("click", () => {
        activeMission = advancedMissions.find(m => m.id === Number(button.dataset.mission));
        step = 0;
        showTerminal();
      });
    });
  }

  function showTerminal() {
    terminal.innerHTML = `
      <h3>${activeMission.title}</h3>
      <p>Enter this command:</p>
      <code id="expected-command" style="display:block;padding:12px;background:#020617"></code>
      <input id="advanced-command-input" placeholder="Type command..." style="width:70%;padding:10px">
      <button id="advanced-run">Run</button>
      <p id="advanced-feedback"></p>
      <p id="advanced-step"></p>
    `;

    updateTerminal();

    terminal.querySelector("#advanced-run").addEventListener("click", run);
    terminal.querySelector("#advanced-command-input").addEventListener("keydown", event => {
      if (event.key === "Enter") run();
    });
  }

  function updateTerminal() {
    terminal.querySelector("#expected-command").textContent = activeMission.commands[step];
    terminal.querySelector("#advanced-step").textContent =
      `Command ${step + 1} of ${activeMission.commands.length}`;
  }

  function run() {
    const input = terminal.querySelector("#advanced-command-input");
    const feedback = terminal.querySelector("#advanced-feedback");

    if (input.value.trim() !== activeMission.commands[step]) {
      feedback.textContent = "Incorrect command. Try again.";
      return;
    }

    step++;
    input.value = "";

    if (step === activeMission.commands.length) {
      progress[activeMission.id] = true;
      localStorage.setItem(advancedProgressKey, JSON.stringify(progress));

      const saved = JSON.parse(localStorage.getItem("devopsLevelUpSimulatorV1") || "{}");
      saved.xp = (Number(saved.xp) || 0) + activeMission.reward;
      localStorage.setItem("devopsLevelUpSimulatorV1", JSON.stringify(saved));

      feedback.textContent = `Mission complete! You earned ${activeMission.reward} XP.`;
      render();
      return;
    }

    feedback.textContent = "Correct! Next command.";
    updateTerminal();
  }

  render();
}

document.addEventListener("DOMContentLoaded", startAdvancedMissions);
