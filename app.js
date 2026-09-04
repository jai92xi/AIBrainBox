let questions = [];
let currentQuestion = null;


// ============================================================
// LOAD QUESTIONS FROM CSV
// ============================================================

async function loadQuestions() {
    try {
        const response = await fetch("xi-questions.csv");

        if (!response.ok) {
            throw new Error("Could not load xi-questions.csv");
        }

        const csvText = await response.text();

        questions = parseCSV(csvText);

        if (questions.length === 0) {
            throw new Error("No questions found in the CSV file.");
        }

        loadQuestion();

    } catch (error) {
        document.getElementById("loading").classList.add("hidden");

        const errorBox = document.getElementById("error");

        errorBox.classList.remove("hidden");

        errorBox.innerText =
            "Unable to load the question database. Please check that xi-questions.csv exists in the repository.";

        console.error(error);
    }
}


// ============================================================
// CSV PARSER
// ============================================================

function parseCSV(text) {

    const rows = [];

    let row = [];
    let cell = "";
    let insideQuotes = false;

    for (let i = 0; i < text.length; i++) {

        const char = text[i];
        const nextChar = text[i + 1];

        if (char === '"' && insideQuotes && nextChar === '"') {

            cell += '"';
            i++;

        } else if (char === '"') {

            insideQuotes = !insideQuotes;

        } else if (char === "," && !insideQuotes) {

            row.push(cell);
            cell = "";

        } else if (
            (char === "\n" || char === "\r") &&
            !insideQuotes
        ) {

            if (char === "\r" && nextChar === "\n") {
                i++;
            }

            row.push(cell);

            if (
                row.some(
                    value => value.trim() !== ""
                )
            ) {
                rows.push(row);
            }

            row = [];
            cell = "";

        } else {

            cell += char;
        }
    }

    if (cell !== "" || row.length > 0) {

        row.push(cell);

        if (
            row.some(
                value => value.trim() !== ""
            )
        ) {
            rows.push(row);
        }
    }

    if (rows.length === 0) {
        return [];
    }

    const headers = rows[0].map(
        header =>
            header
                .trim()
                .toLowerCase()
    );

    return rows.slice(1).map(row => {

        const question = {};

        headers.forEach(
            (header, index) => {

                question[header] =
                    row[index] || "";
            }
        );

        return question;
    });
}


// ============================================================
// LOAD QUESTION USING URL ID
// ============================================================

function loadQuestion() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const id = params.get("id");

    if (!id) {

        showError(
            "No question ID was provided. Please use a question link such as ?id=Xi-00001"
        );

        return;
    }

    currentQuestion =
        questions.find(
            q =>
                q.id &&
                q.id.trim().toLowerCase() ===
                id.trim().toLowerCase()
        );

    if (!currentQuestion) {

        showError(
            "Question not found: " + id
        );

        return;
    }

    displayQuestion();
}


// ============================================================
// DISPLAY QUESTION
// ============================================================

function displayQuestion() {

    document
        .getElementById("loading")
        .classList.add("hidden");

    document
        .getElementById("question-container")
        .classList.remove("hidden");

    document
        .getElementById("question-id")
        .innerText =
        currentQuestion.id || "";

    document
        .getElementById("topic")
        .innerText =
        currentQuestion.topic || "";

    document
        .getElementById("question")
        .innerText =
        currentQuestion.question || "";

    const optionsContainer =
        document.getElementById("options");

    optionsContainer.innerHTML = "";

    const optionLetters = [
        "A",
        "B",
        "C",
        "D"
    ];

    optionLetters.forEach(letter => {

        const option =
            document.createElement("label");

        option.className = "option";

        const radio =
            document.createElement("input");

        radio.type = "radio";
        radio.name = "answer";
        radio.value = letter;

        const letterSpan =
            document.createElement("span");

        letterSpan.className =
            "option-letter";

        letterSpan.innerText =
            letter + ".";

        const textSpan =
            document.createElement("span");

        textSpan.className =
            "option-text";

        textSpan.innerText =
            currentQuestion[
                letter.toLowerCase()
            ] || "";

        option.appendChild(radio);
        option.appendChild(letterSpan);
        option.appendChild(textSpan);

        optionsContainer.appendChild(option);

        radio.addEventListener(
            "change",
            () => {

                document
                    .querySelectorAll(".option")
                    .forEach(item => {

                        item.classList.remove(
                            "selected",
                            "correct-answer",
                            "wrong-answer"
                        );
                    });

                option.classList.add("selected");

                // Clear previous result when choosing another answer
                const result =
                    document.getElementById("result");

                result.innerText = "";
                result.className = "";

                // Hide explanation until answer is checked
                document
                    .getElementById("explanation")
                    .classList.add("hidden");

                document
                    .getElementById("show-explanation-btn")
                    .classList.add("hidden");
            }
        );
    });

    resetAnswerState();
}


// ============================================================
// RESET ANSWER STATE
// ============================================================

function resetAnswerState() {

    const result =
        document.getElementById("result");

    result.innerText = "";
    result.className = "";

    const explanation =
        document.getElementById("explanation");

    explanation.classList.add("hidden");

    const explanationText =
        document.getElementById(
            "explanation-text"
        );

    explanationText.innerText = "";

    const explanationButton =
        document.getElementById(
            "show-explanation-btn"
        );

    explanationButton.classList.add("hidden");

    document
        .querySelectorAll(".option")
        .forEach(option => {

            option.classList.remove(
                "selected",
                "correct-answer",
                "wrong-answer"
            );
        });
}


// ============================================================
// SUBMIT ANSWER
// ============================================================

function submitAnswer() {

    const selected =
        document.querySelector(
            'input[name="answer"]:checked'
        );

    const result =
        document.getElementById("result");

    if (!selected) {

        result.className = "incorrect";

        result.innerText =
            "🤔 Please select an answer first.";

        return;
    }

    const userAnswer =
        selected.value
            .trim()
            .toUpperCase();

    const correctAnswer =
        (
            currentQuestion["correct answer"] ||
            ""
        )
        .trim()
        .toUpperCase();

    const selectedOption =
        selected.closest(".option");

    // Remove previous answer states
    document
        .querySelectorAll(".option")
        .forEach(option => {

            option.classList.remove(
                "correct-answer",
                "wrong-answer"
            );
        });


    // ========================================================
    // CORRECT ANSWER
    // ========================================================

    if (userAnswer === correctAnswer) {

        selectedOption.classList.remove("selected");
        selectedOption.classList.add("correct-answer");

        result.className = "correct";

        result.innerText =
            "🎉👏👏 Congratulations! Correct! 🥳🎊✨🚀🤖🧠💡⭐🔥";

        showCorrectCelebration();
    }


    // ========================================================
    // WRONG ANSWER
    // ========================================================

    else {

        selectedOption.classList.remove("selected");
        selectedOption.classList.add("wrong-answer");

        // Highlight correct answer in green
        const correctOption =
            document.querySelector(
                `input[name="answer"][value="${correctAnswer}"]`
            );

        if (correctOption) {

            correctOption
                .closest(".option")
                .classList.add("correct-answer");
        }

        result.className = "incorrect";

        result.innerText =
            "😢😞 Not quite! 💔🥺😔 Try again! 😕";

        showWrongReaction();
    }


    // ========================================================
    // PREPARE EXPLANATION
    // ========================================================

    const explanationValue =
        currentQuestion.explanation ||
        currentQuestion.explaination ||
        "";

    document.getElementById(
        "explanation-text"
    ).innerText =
        explanationValue;

    // Show "Show Explanation" button
    document
        .getElementById("show-explanation-btn")
        .classList.remove("hidden");

    // Keep explanation hidden initially
    document
        .getElementById("explanation")
        .classList.add("hidden");
}


// ============================================================
// SHOW / HIDE EXPLANATION
// ============================================================

function toggleExplanation() {

    const explanation =
        document.getElementById("explanation");

    const button =
        document.getElementById(
            "show-explanation-btn"
        );

    if (explanation.classList.contains("hidden")) {

        explanation.classList.remove("hidden");

        button.innerText =
            "🙈 Hide Explanation";

        explanation.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });

    } else {

        explanation.classList.add("hidden");

        button.innerText =
            "💡 Show Explanation";
    }
}


// ============================================================
// HAPPY CELEBRATION
// ============================================================

function showCorrectCelebration() {

    const emojis = [
        "🎉",
        "👏",
        "👏",
        "🥳",
        "🎊",
        "✨",
        "🚀",
        "🤖",
        "🧠",
        "💡",
        "⭐",
        "🔥",
        "👏",
        "🎉",
        "🥳",
        "✨",
        "🎊",
        "🚀"
    ];

    createEmojiBurst(emojis);
}


// ============================================================
// SAD REACTION
// ============================================================

function showWrongReaction() {

    const emojis = [
        "😢",
        "😞",
        "🥺",
        "💔",
        "😔",
        "😕",
        "😭",
        "🥲"
    ];

    createEmojiBurst(emojis);
}


// ============================================================
// EMOJI BURST
// ============================================================

function createEmojiBurst(emojis) {

    const container =
        document.createElement("div");

    container.className =
        "reaction-container";

    document.body.appendChild(container);

    emojis.forEach((emoji, index) => {

        const element =
            document.createElement("span");

        element.className =
            "reaction-emoji";

        element.innerText = emoji;

        const left =
            10 + Math.random() * 80;

        const delay =
            Math.random() * 0.25;

        const duration =
            1.8 + Math.random() * 1.4;

        const rotation =
            -35 + Math.random() * 70;

        element.style.left =
            left + "%";

        element.style.animationDelay =
            delay + "s";

        element.style.animationDuration =
            duration + "s";

        element.style.setProperty(
            "--rotation",
            rotation + "deg"
        );

        element.style.fontSize =
            (1.8 + Math.random() * 1.8) + "rem";

        container.appendChild(element);
    });

    setTimeout(() => {

        container.remove();

    }, 4000);
}


// ============================================================
// COPY QUESTION LINK
// ============================================================

async function copyLink() {

    const button =
        document.getElementById(
            "copy-btn"
        );

    try {

        await navigator.clipboard.writeText(
            window.location.href
        );

        button.innerText =
            "✓ Link Copied!";

        setTimeout(
            () => {

                button.innerText =
                    "🔗 Copy Question Link";

            },
            2000
        );

    } catch (error) {

        console.error(
            "Unable to copy link:",
            error
        );

        button.innerText =
            "Unable to copy link";

        setTimeout(
            () => {

                button.innerText =
                    "🔗 Copy Question Link";

            },
            2000
        );
    }
}


// ============================================================
// SHOW ERROR
// ============================================================

function showError(message) {

    document
        .getElementById("loading")
        .classList.add("hidden");

    document
        .getElementById("question-container")
        .classList.add("hidden");

    const errorBox =
        document.getElementById("error");

    errorBox.classList.remove("hidden");

    errorBox.innerText =
        message;
}


// ============================================================
// LOAD APPLICATION
// ============================================================

loadQuestions();
