const challenges = [
  {
    id: "disk-space",
    category: "DISK SPACE",
    points: 25,
    brief: "A teammate reports that a Linux server cannot save new files. You need to investigate before changing anything.",
    question: "Which command is the best first step to check filesystem space?",
    context: "The server may be running out of disk space. Start by checking the filesystem usage.",
    options: [
      "df -h",
      "chmod 777 /",
      "reboot",
      "whoami"
    ],
    answer: 0,
    hint: "Think of the command that reports filesystem disk space in a human-readable format.",
    explanation: "`df -h` shows filesystem space usage in readable units. It helps you confirm whether a filesystem is full before deciding what to do next."
  },
  {
    id: "permissions",
    category: "FILE PERMISSIONS",
    points: 25,
    brief: "A deployment script exists, but when the team tries to run it, Linux reports “Permission denied.”",
    question: "What is a sensible next step?",
    context: "You should inspect the file's current permissions before making a targeted change.",
    options: [
      "Run chmod 777 on the entire folder",
      "Use ls -l script.sh to inspect its permissions",
      "Delete the script and start over",
      "Disable Linux security"
    ],
    answer: 1,
    hint: "`ls -l` displays file details, including permission bits.",
    explanation: "`ls -l script.sh` lets you inspect the permissions first. If the script needs to be executable, a targeted command such as `chmod u+x script.sh` may be appropriate. Avoid `chmod 777` because it grants overly broad permissions."
  },
  {
    id: "cpu-load",
    category: "PERFORMANCE",
    points: 25,
    brief: "Users say an application is responding slowly. The server is reachable, but performance has dropped.",
    question: "Which tool is useful for checking live CPU and process activity?",
    context: "Gather evidence about running processes before restarting services.",
    options: [
      "top",
      "mkdir",
      "touch",
      "pwd"
    ],
    answer: 0,
    hint: "This command provides a live view of processes and system resource use.",
    explanation: "`top` displays running processes and resource usage, helping you identify processes consuming CPU or memory. You can investigate further with tools such as `ps`."
  },
  {
    id: "ssh-access",
    category: "SSH TROUBLESHOOTING",
    points: 25,
    brief: "You cannot connect to an EC2 Linux instance and receive “Permission denied (publickey).”",
    question: "What should you verify first?",
    context: "SSH authentication depends on the correct login user and matching private/public key setup.",
    options: [
      "Try random usernames until one works",
      "Check the SSH username, key file, and matching public key",
      "Make the private key readable by everyone",
      "Immediately recreate every server"
    ],
    answer: 1,
    hint: "Check the identity you are logging in as and the credentials SSH is using.",
    explanation: "Verify the correct OS username, the intended private key, its file permissions, and whether the matching public key is installed for that account. Never make a private key world-readable."
  },
  {
    id: "service-failure",
    category: "SYSTEMD SERVICES",
    points: 50,
    brief: "A Linux web server is down. The nginx service failed to start, and you need to understand why.",
    question: "Which commands are a good starting point for investigating the failure?",
    context: "Read the service status and its logs to find the cause before attempting a fix.",
    options: [
      "systemctl status nginx and journalctl -u nginx",
      "chmod 777 /etc",
      "Delete the system logs",
      "Reinstall Linux immediately"
    ],
    answer: 0,
    hint: "One command shows service status; the other reads its journal logs.",
    explanation: "`systemctl status nginx` shows the service state and recent messages. `journalctl -u nginx` helps inspect logs for the underlying error. Use the evidence to choose a targeted fix."
  }
];

const ranks = [
  { name: "Rookie", min: 0 },
  { name: "Terminal Explorer", min: 50 },
  { name: "Command Runner", min: 100 },
  { name: "Linux Operator", min: 175 },
  { name: "DevOps Engineer", min: 250 }
];

const STORAGE_KEY = "devopsLevelUpProgressV2";
const defaultProgress = { xp: 0, solved: [], cleared: false };
let progress = loadProgress();
let currentIndex = 0;
let selectedAnswer = null;
let answered = false;
let runCorrect = 0;
let runXp = 0;

const $ = (id) => document.getElementById(id);
const elements = {
  topXp: $("top-xp"),
  statXp: $("stat-xp"),
  statRank: $("stat-rank"),
  rankNext: $("rank-next"),
  statSolved: $("stat-solved"),
  statMissions: $("stat-missions"),
  start: $("start-mission"),
  exit: $("exit-mission"),
  game: $("game-panel"),
  completion: $("completion-panel"),
  gameTitle: $("game-title"),
  questionCount: $("question-count"),
  missionPercent: $("mission-percent"),
  missionProgress: $("mission-progress"),
  incidentBrief: $("incident-brief"),
  category: $("challenge-category"),
  points: $("challenge-points"),
  question: $("challenge-question"),
  context: $("challenge-context"),
  answers: $("answer-list"),
  feedback: $("feedback"),
  submit: $("submit-answer"),
  next: $("next-challenge"),
  hintButton: $("hint-button"),
  hintText: $("hint-text"),
  completionTitle: $("completion-title"),
  completionMessage: $("completion-message"),
  completionCorrect: $("completion-correct"),
  completionXp: $("completion-xp")
};

function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && typeof saved.xp === "number" && Array.isArray(saved.solved)) {
      return { ...defaultProgress, ...saved };
    }
  } catch (error) {
    console.warn("Could not load saved game progress.", error);
  }
  return { ...defaultProgress };
}

function saveProgress() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.warn("Could not save game progress in this browser.", error);
  }
}

function currentRank() {
  return [...ranks].reverse().find((rank) => progress.xp >= rank.min) || ranks[0];
}

function updateDashboard() {
  const rank = currentRank();
  const nextRank = ranks.find((item) => item.min > progress.xp);
  elements.topXp.textContent = `${progress.xp} XP`;
  elements.statXp.textContent = progress.xp;
  elements.statRank.textContent = rank.name;
  elements.rankNext.textContent = nextRank ? `${nextRank.min - progress.xp} XP to ${nextRank.name}` : "Top rank reached!";
  elements.statSolved.textContent = progress.solved.length;
  elements.statMissions.textContent = `${progress.cleared ? 1 : 0} / 1`;
}

function startMission() {
  currentIndex = 0;
  selectedAnswer = null;
  answered = false;
  runCorrect = 0;
  runXp = 0;
  elements.completion.classList.add("hidden");
  elements.game.classList.remove("hidden");
  elements.game.scrollIntoView({ behavior: "smooth", block: "start" });
  renderChallenge();
}

function renderChallenge() {
  const challenge = challenges[currentIndex];
  selectedAnswer = null;
  answered = false;
  elements.gameTitle.textContent = "Linux Incident Response";
  elements.questionCount.textContent = `Challenge ${currentIndex + 1} of ${challenges.length}`;
  const percent = Math.round((currentIndex / challenges.length) * 100);
  elements.missionPercent.textContent = `${percent}% complete`;
  elements.missionProgress.style.width = `${percent}%`;
  elements.incidentBrief.textContent = challenge.brief;
  elements.category.textContent = challenge.category;
  elements.points.textContent = `+${challenge.points} XP`;
  elements.question.textContent = challenge.question;
  elements.context.textContent = challenge.context;
  elements.feedback.className = "feedback hidden";
  elements.feedback.textContent = "";
  elements.hintText.textContent = `HINT: ${challenge.hint}`;
  elements.hintText.classList.add("hidden");
  elements.hintButton.classList.remove("hidden");
  elements.submit.classList.remove("hidden");
  elements.submit.disabled = true;
  elements.next.classList.add("hidden");
  elements.answers.replaceChildren();

  challenge.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer-option";
    button.innerHTML = `<span class="letter">${String.fromCharCode(65 + index)}</span><span></span>`;
    button.querySelector("span:last-child").textContent = option;
    button.addEventListener("click", () => selectOption(index));
    elements.answers.appendChild(button);
  });
}

function selectOption(index) {
  if (answered) return;
  selectedAnswer = index;
  [...elements.answers.children].forEach((button, buttonIndex) => {
    button.classList.toggle("selected", buttonIndex === index);
  });
  elements.submit.disabled = false;
}

function submitAnswer() {
  if (selectedAnswer === null || answered) return;
  answered = true;
  const challenge = challenges[currentIndex];
  const isCorrect = selectedAnswer === challenge.answer;
  const answerButtons = [...elements.answers.children];

  answerButtons.forEach((button, index) => {
    button.disabled = true;
    if (index === challenge.answer) button.classList.add("correct");
    if (index === selectedAnswer && !isCorrect) button.classList.add("wrong");
  });

  if (isCorrect) {
    runCorrect += 1;
    if (!progress.solved.includes(challenge.id)) {
      progress.solved.push(challenge.id);
      progress.xp += challenge.points;
      runXp += challenge.points;
    }
    elements.feedback.className = "feedback good";
    elements.feedback.textContent = `Correct! ${challenge.explanation}${progress.solved.includes(challenge.id) && runXp === 0 ? " You already earned XP for this challenge on a previous run." : ""}`;
  } else {
    elements.feedback.className = "feedback bad";
    elements.feedback.textContent = `Not quite. ${challenge.explanation}`;
  }

  elements.submit.classList.add("hidden");
  elements.hintButton.classList.add("hidden");
  elements.next.textContent = currentIndex === challenges.length - 1 ? "View mission report →" : "Next challenge →";
  elements.next.classList.remove("hidden");
  saveProgress();
  updateDashboard();
}

function nextChallenge() {
  if (currentIndex < challenges.length - 1) {
    currentIndex += 1;
    renderChallenge();
  } else {
    finishMission();
  }
}

function finishMission() {
  const firstClear = !progress.cleared;
  if (firstClear) {
    progress.cleared = true;
    progress.xp += 25;
    runXp += 25;
  }
  saveProgress();
  updateDashboard();
  elements.game.classList.add("hidden");
  elements.completion.classList.remove("hidden");
  elements.completionTitle.textContent = runCorrect === challenges.length ? "Perfect run!" : "Mission report";
  elements.completionMessage.textContent = runCorrect === challenges.length
    ? "Outstanding work. You investigated each incident with an engineer's mindset."
    : "Good effort. Review the explanations and replay the mission to practise. XP is only awarded once per challenge.";
  elements.completionCorrect.textContent = `${runCorrect} / ${challenges.length}`;
  elements.completionXp.textContent = `+${runXp} XP`;
  elements.missionPercent.textContent = "100% complete";
  elements.missionProgress.style.width = "100%";
  elements.completion.scrollIntoView({ behavior: "smooth", block: "center" });
}

elements.start.addEventListener("click", startMission);
elements.exit.addEventListener("click", () => {
  elements.game.classList.add("hidden");
  $("missions").scrollIntoView({ behavior: "smooth", block: "start" });
});
elements.submit.addEventListener("click", submitAnswer);
elements.next.addEventListener("click", nextChallenge);
elements.hintButton.addEventListener("click", () => {
  elements.hintText.classList.toggle("hidden");
  elements.hintButton.textContent = elements.hintText.classList.contains("hidden") ? "Show hint" : "Hide hint";
});
$("back-to-missions").addEventListener("click", () => {
  elements.completion.classList.add("hidden");
  $("missions").scrollIntoView({ behavior: "smooth", block: "start" });
});

updateDashboard();
