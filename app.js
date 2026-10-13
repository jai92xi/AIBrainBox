
/* =========================================================
   AIBrainBox - app.js
   ========================================================= */

const CSV_URL = "./xi-questions.csv";
const QUOTES_URL = "./xi-Quotes.csv";

let questions = [];
let quotes = [];
let currentQuestion = null;
let currentQuestionIndex = 0;
let currentStreak = 0;
let answerSelected = false;

const questionContainer = document.getElementById("question-container");
const questionElement = document.getElementById("question");
const optionsElement = document.getElementById("options");
const resultElement = document.getElementById("result");
const explanationElement = document.getElementById("explanation");
const explanationTextElement = document.getElementById("explanation-text");
const scoreElement = document.getElementById("score-display");
const errorElement = document.getElementById("error");
const quoteTextElement = document.getElementById("quote-text");
const quoteAuthorElement = document.getElementById("quote-author");
const previousButton = document.getElementById("previous-question");
const nextButton = document.getElementById("next-question");

document.addEventListener("DOMContentLoaded", initializeApp);

async function initializeApp() {
    document.body.classList.add("light-theme");

    const subtitle = document.querySelector(".brand-subtitle");

    if (subtitle) {
        subtitle.textContent = "A box full of Ahaaaaaaa questions!!";
        subtitle.style.display = "";
    }

    setupNavigation();
    updateScore();

    try {
        await Promise.all([
            loadQuestions(),
            loadQuotes()
        ]);
    } catch (error) {
        console.error("Application initialization failed:", error);
        showError("Unable to load the question database. Please check xi-questions.csv.");
    }
}

/* =========================================================
   CSV LOADING
   ========================================================= */

async function loadQuestions() {
    const response = await fetch(`${CSV_URL}?v=${Date.now()}`, {
        cache: "no-store"
    });

    if (!response.ok) {
        throw new Error(`Unable to load ${CSV_URL}`);
    }

    const csvText = await response.text();

    questions = parseCSV(csvText);

    if (!questions.length) {
        throw new Error("No questions found.");
    }

    // Display questions in ID sequence instead of random order.
    questions.sort((a, b) =>
        getQuestionId(a).localeCompare(
            getQuestionId(b),
            undefined,
            { numeric: true, sensitivity: "base" }
        )
    );

    loadQuestionFromURL();
}

async function loadQuotes() {
    try {
        const response = await fetch(`${QUOTES_URL}?v=${Date.now()}`, {
            cache: "no-store"
        });

        if (!response.ok) return;

        quotes = parseCSV(await response.text());
        displayRandomQuote();
    } catch (error) {
        console.warn("Quotes could not be loaded:", error);
    }
}

/* =========================================================
   CSV PARSER
   Supports commas, quoted fields and multiline values.
   ========================================================= */

function parseCSV(text) {
    const rows = [];
    let row = [];
    let value = "";
    let insideQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const character = text[i];
        const nextCharacter = text[i + 1];

        if (character === '"') {
            if (insideQuotes && nextCharacter === '"') {
                value += '"';
                i++;
            } else {
                insideQuotes = !insideQuotes;
            }
        } else if (character === "," && !insideQuotes) {
            row.push(value);
            value = "";
        } else if (
            (character === "\n" || character === "\r") &&
            !insideQuotes
        ) {
            if (character === "\r" && nextCharacter === "\n") {
                i++;
            }

            row.push(value);

            if (row.some(cell => cell.trim() !== "")) {
                rows.push(row);
            }

            row = [];
            value = "";
        } else {
            value += character;
        }
    }

    if (value !== "" || row.length > 0) {
        row.push(value);

        if (row.some(cell => cell.trim() !== "")) {
            rows.push(row);
        }
    }

    if (!rows.length) return [];

    const headers = rows[0].map(header => header.trim());

    return rows.slice(1).map(rowValues => {
        const object = {};

        headers.forEach((header, index) => {
            object[header] = (rowValues[index] || "").trim();
        });

        return object;
    });
}

/* =========================================================
   CSV VALUE HELPERS
   ========================================================= */

function getValue(object, possibleNames) {
    if (!object) return "";

    const keys = Object.keys(object);

    for (const name of possibleNames) {
        const matchingKey = keys.find(key =>
            key.trim().toLowerCase() === name.trim().toLowerCase()
        );

        if (matchingKey !== undefined) {
            return object[matchingKey] || "";
        }
    }

    return "";
}

function getQuestionId(question) {
    return getValue(question, [
        "ID",
        "Id",
        "id",
        "Question ID",
        "QuestionID"
    ]);
}

function getQuestionIdFromURL() {
    return new URLSearchParams(window.location.search).get("id");
}

function findQuestionById(id) {
    if (!id) return null;

    return questions.find(question =>
        getQuestionId(question).toLowerCase() === id.toLowerCase()
    ) || null;
}

function getCorrectAnswer(question) {
    return getValue(question, [
        "Correct Answer",
        "CorrectAnswer",
        "Correct answer",
        "Answer",
        "answer",
        "Correct"
    ]);
}

function normalizeAnswer(answer) {
    return String(answer || "")
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase();
}

function formatMultilineHTML(value) {
    return String(value || "").replace(/\r\n|\r|\n/g, "<br>");
}

/* =========================================================
   LOAD QUESTION FROM URL
   ========================================================= */

function loadQuestionFromURL() {
    const requestedId = getQuestionIdFromURL();

    let question = requestedId
        ? findQuestionById(requestedId)
        : null;

    if (!question && questions.length) {
        question = questions[0];
    }

    if (question) {
        displayQuestion(question, false);
    } else {
        showError("No questions are available.");
    }
}

/* =========================================================
   DISPLAY QUESTION
   ========================================================= */

function displayQuestion(question, updateURL = true) {
    if (!question) return;

    currentQuestion = question;
    currentQuestionIndex = questions.indexOf(question);
    answerSelected = false;

    const questionId = getQuestionId(question);

    if (updateURL && questionId) {
        const newURL =
            `${window.location.pathname}?id=${encodeURIComponent(questionId)}`;

        window.history.pushState(
            { questionId },
            "",
            newURL
        );
    }

    const questionText = getValue(question, [
        "Question",
        "question",
        "Questions"
    ]);

    questionElement.innerHTML = formatMultilineHTML(questionText);

    renderOptions(question);

    resultElement.textContent = "";
    resultElement.className = "result";

    explanationTextElement.innerHTML = "";
    explanationElement.classList.add("hidden");

    updateRelatedNavigation();

    questionContainer.classList.remove("hidden");

    if (errorElement) {
        errorElement.classList.add("hidden");
    }
}

/* =========================================================
   RENDER OPTIONS
   ========================================================= */

function renderOptions(question) {
    optionsElement.innerHTML = "";

    const optionValues = [
        getValue(question, ["Option A", "option A", "A", "OptionA"]),
        getValue(question, ["Option B", "option B", "B", "OptionB"]),
        getValue(question, ["Option C", "option C", "C", "OptionC"]),
        getValue(question, ["Option D", "option D", "D", "OptionD"])
    ];

    const labels = ["A", "B", "C", "D"];

    optionValues.forEach((optionText, index) => {
        if (!optionText) return;

        const optionButton = document.createElement("button");
        optionButton.type = "button";
        optionButton.className = "option";
        optionButton.dataset.answer = optionText;
        optionButton.dataset.index = String(index);

        const optionLabel = document.createElement("span");
        optionLabel.className = "option-label";
        optionLabel.textContent = labels[index];

        const optionContent = document.createElement("span");
        optionContent.className = "option-text";
        optionContent.innerHTML = formatMultilineHTML(optionText);

        optionButton.appendChild(optionLabel);
        optionButton.appendChild(optionContent);

        optionButton.addEventListener("click", () => {
            selectAnswer(optionButton, optionText);
        });

        optionsElement.appendChild(optionButton);
    });
}

/* =========================================================
   SELECT ANSWER
   ========================================================= */

function selectAnswer(selectedButton, selectedAnswer) {
    if (answerSelected) return;

    answerSelected = true;

    const correctAnswer = getCorrectAnswer(currentQuestion);
    const labels = ["A", "B", "C", "D"];

    const selectedIndex = Number(selectedButton.dataset.index);
    const selectedLabel = labels[selectedIndex] || "";

    const selectedNormalized = normalizeAnswer(selectedLabel);
    const correctNormalized = normalizeAnswer(correctAnswer);

    let isCorrect = selectedNormalized === correctNormalized;

    if (!isCorrect) {
        isCorrect =
            normalizeAnswer(selectedAnswer) === correctNormalized;
    }

    const allOptions = optionsElement.querySelectorAll(".option");

    allOptions.forEach(option => {
        option.disabled = true;
    });

    if (isCorrect) {
        selectedButton.classList.add("correct");

        resultElement.textContent = "Correct! Well done.";
        resultElement.className = "result correct-result";

        // Correct answer adds one to the current streak.
        currentStreak += 1;

        showFloatingFeedback(true);
    } else {
        selectedButton.classList.add("incorrect");

        resultElement.textContent = "Incorrect. Review the correct answer and explanation.";
        resultElement.className = "result incorrect-result";

        // Wrong answer adds zero. Do not reset the current streak.
        currentStreak += 0;

        allOptions.forEach(option => {
            const optionIndex = Number(option.dataset.index);
            const optionLabel = labels[optionIndex] || "";

            if (
                normalizeAnswer(optionLabel) === correctNormalized ||
                normalizeAnswer(option.dataset.answer) === correctNormalized
            ) {
                option.classList.add("correct");
            }
        });

        showFloatingFeedback(false);
    }

    updateScore();
    showExplanation(currentQuestion);
}

/* =========================================================
   SHOW EXPLANATION
   ========================================================= */

function showExplanation(question) {
    const explanation = getValue(question, [
        "Explaination",
        "Explanation",
        "explanation",
        "Explain",
        "Reason"
    ]);

    if (explanation) {
        explanationTextElement.innerHTML = formatMultilineHTML(explanation);
    } else {
        explanationTextElement.textContent =
            "No explanation is available for this question.";
    }

    explanationElement.classList.remove("hidden");
}

/* =========================================================
   UPDATE STREAK
   ========================================================= */

function updateScore() {
    if (!scoreElement) return;

    scoreElement.innerHTML =
        `Current streak: <strong>${currentStreak}</strong>`;
}

/* =========================================================
   SEQUENTIAL QUESTION NAVIGATION
   ========================================================= */

function updateRelatedNavigation() {
    if (!currentQuestion) return;

    if (previousButton) {
        previousButton.disabled = currentQuestionIndex <= 0;
    }

    if (nextButton) {
        nextButton.disabled =
            currentQuestionIndex >= questions.length - 1;
    }
}

function setupNavigation() {
    if (previousButton) {
        previousButton.addEventListener("click", () => {
            if (!currentQuestion || currentQuestionIndex <= 0) return;

            displayQuestion(
                questions[currentQuestionIndex - 1]
            );

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }

    if (nextButton) {
        nextButton.addEventListener("click", () => {
            if (
                !currentQuestion ||
                currentQuestionIndex >= questions.length - 1
            ) {
                return;
            }

            displayQuestion(
                questions[currentQuestionIndex + 1]
            );

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }
}

/* =========================================================
   BROWSER BACK / FORWARD
   ========================================================= */

window.addEventListener("popstate", () => {
    const requestedId = getQuestionIdFromURL();
    const question = findQuestionById(requestedId);

    if (question) {
        displayQuestion(question, false);
    }
});

/* =========================================================
   KEYBOARD NAVIGATION
   ========================================================= */

document.addEventListener("keydown", event => {
    if (
        event.target.tagName === "INPUT" ||
        event.target.tagName === "TEXTAREA" ||
        event.target.isContentEditable
    ) {
        return;
    }

    if (
        event.key === "ArrowLeft" &&
        previousButton &&
        !previousButton.disabled
    ) {
        previousButton.click();
    }

    if (
        event.key === "ArrowRight" &&
        nextButton &&
        !nextButton.disabled
    ) {
        nextButton.click();
    }
});

/* =========================================================
   FLOATING FEEDBACK
   ========================================================= */

function showFloatingFeedback(isCorrect) {
    const happyEmojis = [
        "🎉", "👏", "🥳", "✨", "🙌", "🎊",
        "💯", "🔥", "⭐", "🤩", "🚀", "🧠",
        "⚡", "🌟", "🏆", "😎", "💥", "🎯"
    ];

    const sadEmojis = [
        "😢", "😔", "🥲", "💔", "😕", "🙁",
        "😞", "🥺", "😣", "😩", "😿", "🫠"
    ];

    const emojis = isCorrect ? happyEmojis : sadEmojis;
    const count = isCorrect ? 24 : 16;

    for (let i = 0; i < count; i++) {
        const emoji = document.createElement("div");

        emoji.className = "floating-feedback";
        emoji.textContent =
            emojis[Math.floor(Math.random() * emojis.length)];

        const startLeft = Math.random() * 90 + 5;
        const startTop = Math.random() * 35 + 45;
        const size = Math.random() * 16 + 22;
        const delay = Math.random() * 0.9;
        const duration = Math.random() * 1.6 + 2.8;

        emoji.style.left = `${startLeft}%`;
        emoji.style.top = `${startTop}%`;
        emoji.style.fontSize = `${size}px`;
        emoji.style.animationDelay = `${delay}s`;
        emoji.style.animationDuration = `${duration}s`;

        document.body.appendChild(emoji);

        setTimeout(() => {
            emoji.remove();
        }, (duration + delay) * 1000 + 500);
    }
}

/* =========================================================
   RANDOM MOTIVATIONAL QUOTE
   ========================================================= */

function displayRandomQuote() {
    if (!quotes || quotes.length === 0) return;

    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];

    const quoteText = getValue(quote, [
        "Quote",
        "quote",
        "Quotes",
        "Text",
        "text"
    ]);

    const quoteAuthor = getValue(quote, [
        "Author",
        "author",
        "Quote Author",
        "quote author"
    ]);

    if (quoteTextElement) {
        quoteTextElement.textContent =
            quoteText ? `"${quoteText}"` : "";
    }

    if (quoteAuthorElement) {
        quoteAuthorElement.textContent =
            quoteAuthor ? `— ${quoteAuthor}` : "";
    }
}

/* =========================================================
   ERROR HANDLING
   ========================================================= */

function showError(message) {
    if (questionContainer) {
        questionContainer.classList.add("hidden");
    }

    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove("hidden");
    }
}
