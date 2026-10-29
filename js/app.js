```javascript
const questions = [
    {
        category: "SYSTEM TROUBLESHOOTING",
        points: 25,
        question: "A Linux server reports that its root filesystem is 100% full. What is the safest first response?",
        context: "You have administrator access to a production server. You need to investigate without causing additional damage.",
        options: [
            "Delete everything inside /var immediately.",
            "Use disk-usage tools to identify what is consuming space before deciding what can safely be removed.",
            "Change all file permissions to 777.",
            "Reboot the server repeatedly until space becomes available."
        ],
        answer: 1,
        explanation: "Correct. First investigate disk usage using tools such as df -h and du -xhd1 /. Identify the source of the problem before removing files. Blindly deleting files can damage applications or the operating system."
    },
    {
        category: "LINUX PERMISSIONS",
        points: 25,
        question: "A script called deploy.sh exists, but running ./deploy.sh returns Permission denied. You have confirmed that the filesystem allows execution. What should you investigate first?",
        context: "You need to fix the problem without granting unnecessary permissions.",
        options: [
            "Grant every user full permissions with chmod 777 deploy.sh.",
            "Check the file's permissions and whether your user has execute permission; add execute permission if appropriate.",
            "Delete the script and recreate the server.",
            "Change the system hostname."
        ],
        answer: 1,
        explanation: "Correct. Inspect the permissions with ls -l deploy.sh. If appropriate, chmod u+x deploy.sh grants the file owner execute permission without giving everyone unrestricted access."
    },
    {
        category: "PROCESS MANAGEMENT",
        points: 25,
        question: "An application is not responding. You suspect a process is consuming excessive CPU. Which approach is most appropriate?",
        context: "You want to identify the problem before terminating a process.",
        options: [
            "Kill every process owned by root.",
            "Use a process-monitoring tool such as top to inspect CPU usage and identify the relevant process.",
            "Delete the application's executable file.",
            "Disable SSH immediately."
        ],
        answer: 1,
        explanation: "Correct. Tools such as top or ps help identify resource-intensive processes. Investigate the process and its role before deciding whether restarting or terminating it is appropriate."
    },
    {
        category: "SSH TROUBLESHOOTING",
        points: 25,
        question: "Your SSH connection returns Permission denied (publickey). The server is running. What should you check first?",
        context: "You are connecting to an Ubuntu EC2 instance from your local terminal.",
        options: [
            "Open every inbound port in the security group.",
            "Verify the SSH username, private key, and whether its matching public key is authorized on the instance.",
            "Change the server's disk size immediately.",
            "Disable all authentication methods."
        ],
        answer: 1,
        explanation: "Correct. A public-key authentication failure commonly points to an incorrect username or key, or a mismatch with the authorized public key. Security-group changes generally address network connectivity, not an authentication rejection."
    },
    {
        category: "SERVICE MANAGEMENT",
        points: 50,
        question: "A service named nginx fails to start. systemctl status nginx reports a failed service. What is the best next step?",
        context: "You are troubleshooting a systemd-based Linux server.",
        options: [
            "Run chmod -R 777 /etc.",
            "Inspect the service status and relevant logs using systemctl status nginx and journalctl -u nginx, then investigate the reported error.",
            "Delete the systemd directory.",
            "Reinstall the entire operating system immediately."
        ],
        answer: 1,
        explanation: "Correct. The service status and journal logs often reveal configuration errors, missing files, permission problems, or port conflicts. Use the evidence to identify the cause before applying a fix."
    }
];

const STORAGE_KEY = "devopsLevelUpProgress";

const defaultState = {
    xp: 0,
    completed: [],
    attempts: 0,
    correct: 0
};

function loadState() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) return { ...defaultState };

        const parsed = JSON.parse(saved);

        return {
            xp: Number.isFinite(parsed.xp) ? Math.max(0, parsed.xp) : 0,
            completed: Array.isArray(parsed.completed)
                ? [...new Set(parsed.completed.filter(
                    id => Number.isInteger(id) && id >= 0 && id < questions.length
                ))]
                : [],
            attempts: Number.isFinite(parsed.attempts)
                ? Math.max(0, parsed.attempts)
                : 0,
            correct: Number.isFinite(parsed.correct)
                ? Math.max(0, parsed.correct)
                : 0
        };
    } catch {
        return { ...defaultState };
    }
}

let state = loadState();
let currentQuestion = 0;
let selectedAnswer = null;
let submitted = false;
let sessionCompleted = [];

const elements = {
    navXp: document.getElementById("nav-xp"),
    totalXp: document.getElementById("total-xp"),
    currentLevel: document.getElementById("current-level"),
    rankName: document.getElementById("rank-name"),
    completedCount: document.getElementById("completed-count"),
    successRate: document.getElementById("success-rate"),
    missionProgress: document.getElementById("mission-progress"),
    progressLabel: document.getElementById("progress-label"),
    startMission: document.getElementById("start-mission"),
    arena: document.getElementById("challenge-arena"),
    questionCounter: document.getElementById("question-counter"),
    category: document.getElementById("question-category"),
    points: document.getElementById("question-points"),
    questionText: document.getElementById("question-text"),
    context: document.getElementById("question-context"),
    options: document.getElementById("answer-options"),
    feedback: document.getElementById("feedback"),
    submit: document.getElementById("submit-answer"),
    next: document.getElementById("next-question"),
    exit: document.getElementById("exit-mission"),
    leaderXp: document.getElementById("leader-xp")
};

function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function renderDashboard() {
    const level = Math.floor(state.xp / 100) + 1;
    const rank =
        state.xp >= 3000 ? "Automation Specialist" :
        state.xp >= 1500 ? "Cloud Engineer" :
        state.xp >= 750 ? "Systems Engineer" :
        state.xp >= 250 ? "Junior Operator" :
        "Linux Recruit";

    const rate = state.attempts
        ? Math.round((state.correct / state.attempts) * 100)
        : 0;

    elements.navXp.textContent = state.xp;
    elements.totalXp.textContent = state.xp;
    elements.currentLevel.textContent = String(level).padStart(2, "0");
    elements.rankName.textContent = rank;
    elements.completedCount.textContent = state.completed.length;
    elements.successRate.textContent = rate;
    elements.missionProgress.style.width =
        `${(state.completed.length / questions.length) * 100}%`;

    elements.progressLabel.textContent =
        `${state.completed.length} of ${questions.length} challenges completed`;

    elements.leaderXp.textContent = `${state.xp} XP`;

    elements.startMission.textContent =
        state.completed.length === questions.length
            ? "Review Mission →"
            : "Enter Mission →";
}

function renderQuestion() {
    const question = questions[currentQuestion];

    selectedAnswer = null;
    submitted = false;

    elements.questionCounter.textContent =
        `Challenge ${currentQuestion + 1} of ${questions.length}`;

    elements.category.textContent = question.category;
    elements.points.textContent = `+${question.points} XP`;
    elements.questionText.textContent = question.question;
    elements.context.textContent = question.context;

    elements.options.replaceChildren();

    question.options.forEach((option, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "answer-option";

        const letter = document.createElement("span");
        letter.className = "option-letter";
        letter.textContent = String.fromCharCode(65 + index);

        const text = document.createElement("span");
        text.textContent = option;

        button.append(letter, text);

        button.addEventListener("click", () => {
            if (submitted) return;

            selectedAnswer = index;

            document.querySelectorAll(".answer-option").forEach(item => {
                item.classList.remove("selected");
            });

            button.classList.add("selected");
        });

        elements.options.appendChild(button);
    });

    elements.feedback.classList.add("hidden");
    elements.feedback.replaceChildren();
    elements.submit.classList.remove("hidden");
    elements.next.classList.add("hidden");
    elements.submit.disabled = false;
}

function startMission() {
    currentQuestion = 0;
    sessionCompleted = [];

    elements.arena.classList.remove("hidden");
    elements.arena.scrollIntoView({ behavior: "smooth" });

    renderQuestion();
}

function submitAnswer() {
    if (submitted || selectedAnswer === null) return;

    submitted = true;

    const question = questions[currentQuestion];
    const isCorrect = selectedAnswer === question.answer;
    const previouslyCompleted = state.completed.includes(currentQuestion);

    state.attempts += 1;

    if (isCorrect) {
        state.correct += 1;

        if (!previouslyCompleted) {
            state.xp += question.points;
            state.completed.push(currentQuestion);
            sessionCompleted.push(currentQuestion);
        }
    }

    saveState();
    renderDashboard();

    document.querySelectorAll(".answer-option").forEach((button, index) => {
        button.disabled = true;

        if (index === question.answer) {
            button.classList.add("correct");
        } else if (index === selectedAnswer && !isCorrect) {
            button.classList.add("incorrect");
        }
    });

    elements.feedback.classList.remove("hidden");

    const title = document.createElement("strong");
    title.textContent = isCorrect
        ? previouslyCompleted ? "Correct! Challenge already completed." : "Correct! XP earned."
        : "Not quite. Review the explanation.";

    const explanation = document.createElement("p");
    explanation.textContent = question.explanation;

    elements.feedback.replaceChildren(title, explanation);

    if (isCorrect && !previouslyCompleted) {
        const reward = document.createElement("p");
        reward.textContent = `You earned ${question.points} XP!`;
        reward.style.color = "var(--accent)";
        reward.style.marginTop = "8px";
        elements.feedback.appendChild(reward);
    }

    elements.submit.classList.add("hidden");
    elements.next.classList.remove("hidden");

    elements.next.textContent =
        currentQuestion === questions.length - 1
            ? "Complete Mission →"
            : "Next Challenge →";
}

function nextQuestion() {
    if (!submitted) return;

    if (currentQuestion < questions.length - 1) {
        currentQuestion += 1;
        renderQuestion();
        return;
    }

    showMissionSummary();
}

function showMissionSummary() {
    elements.questionCounter.textContent = "MISSION REPORT";
    elements.category.textContent = "MISSION COMPLETE";
    elements.points.textContent = `${sessionCompleted.length} NEW CHALLENGES`;

    elements.questionText.textContent =
        "You've reached the end of the Linux Survival mission.";

    elements.context.textContent =
        "Review your progress and revisit any challenges you want to practise.";

    elements.options.replaceChildren();

    const summary = document.createElement("div");
    summary.className = "feedback";

    const heading = document.createElement("strong");
    heading.textContent = "Mission Summary";

    const details = document.createElement("p");
    details.textContent =
        `${state.completed.length} of ${questions.length} challenges completed. ` +
        `Your total experience is ${state.xp} XP.`;

    const note = document.createElement("p");
    note.textContent = state.completed.length === questions.length
        ? "All Linux Survival challenges are complete. You can revisit them for practice."
        : "Answer the remaining challenges correctly to complete this mission.";

    note.style.marginTop = "10px";

    summary.append(heading, details, note);
    elements.options.appendChild(summary);

    elements.feedback.classList.add("hidden");
    elements.submit.classList.add("hidden");
    elements.next.classList.add("hidden");

    const restart = document.createElement("button");
    restart.type = "button";
    restart.className = "primary-button";
    restart.textContent = "Review Challenges →";
    restart.addEventListener("click", startMission);

    elements.options.appendChild(restart);
    renderDashboard();
}

function exitMission() {
    elements.arena.classList.add("hidden");
    document.getElementById("missions").scrollIntoView({ behavior: "smooth" });
}

elements.startMission.addEventListener("click", startMission);
elements.submit.addEventListener("click", submitAnswer);
elements.next.addEventListener("click", nextQuestion);
elements.exit.addEventListener("click", exitMission);

renderDashboard();
```
