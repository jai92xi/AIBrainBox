let questions = [];
let currentQuestion = null;


// Load questions from CSV
async function loadQuestions() {

    try {

        const response = await fetch("xi-questions.csv");


        if (!response.ok) {
            throw new Error("Could not load xi-questions.csv");
        }

        const csvText = await response.text();

        questions = parseCSV(csvText);

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


// Simple CSV parser
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

        } else if ((char === "\n" || char === "\r") && !insideQuotes) {

            if (char === "\r" && nextChar === "\n") {
                i++;
            }

            row.push(cell);

            if (row.some(value => value.trim() !== "")) {
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

        if (row.some(value => value.trim() !== "")) {
            rows.push(row);
        }
    }

    if (rows.length === 0) {
        return [];
    }

    const headers = rows[0].map(header =>
        header.trim().toLowerCase()
    );

    return rows.slice(1).map(row => {

        const question = {};

        headers.forEach((header, index) => {
            question[header] = row[index] || "";
        });

        return question;
    });
}


// Load question based on URL ID
function loadQuestion() {

    const params = new URLSearchParams(window.location.search);

    const id = params.get("id");

    if (!id) {

        showError(
            "No question ID was provided. Please use a question link such as ?id=Xi-00001"
        );

        return;
    }

    currentQuestion = questions.find(
        q => q.id.trim().toLowerCase() === id.trim().toLowerCase()
    );

    if (!currentQuestion) {

        showError(
            "Question not found: " + id
        );

        return;
    }

    displayQuestion();
}


// Display question
function displayQuestion() {

    document.getElementById("loading").classList.add("hidden");

    document
        .getElementById("question-container")
        .classList.remove("hidden");

    document.getElementById("question-id").innerText =
        currentQuestion.id;

    document.getElementById("topic").innerText =
        currentQuestion.topic;

    document.getElementById("question").innerText =
        currentQuestion.question;

    const optionsContainer =
        document.getElementById("options");

    optionsContainer.innerHTML = "";

    const optionLetters = ["A", "B", "C", "D"];

    optionLetters.forEach(letter => {

        const option = document.createElement("label");

        option.className = "option";

        option.innerHTML = `
            <input type="radio"
                   name="answer"
                   value="${letter}">
            <strong>${letter}.</strong>
            ${escapeHTML(currentQuestion[letter.toLowerCase()])}
        `;

        optionsContainer.appendChild(option);
    });
}


// Submit answer
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
            "Please select an answer first.";

        return;
    }

    const userAnswer =
        selected.value.toUpperCase();

    const correctAnswer =
        currentQuestion["correct answer"]
            .trim()
            .toUpperCase();

    if (userAnswer === correctAnswer) {

        result.className = "correct";

        result.innerText =
            "✓ Correct!";

    } else {

        result.className = "incorrect";

        result.innerText =
            "✗ Incorrect. Correct answer: " +
            correctAnswer;
    }

    document
        .getElementById("explanation")
        .classList.remove("hidden");

    document.getElementById("explanation-text").innerText =
        currentQuestion.explaination || "";
}


// Copy question URL
function copyLink() {

    navigator.clipboard.writeText(
        window.location.href
    );

    const button =
        document.getElementById("copy-btn");

    button.innerText =
        "✓ Link Copied!";

    setTimeout(() => {

        button.innerText =
            "🔗 Copy Question Link";

    }, 2000);
}


// Show error
function showError(message) {

    document.getElementById("loading")
        .classList.add("hidden");

    document.getElementById("question-container")
        .classList.add("hidden");

    const errorBox =
        document.getElementById("error");

    errorBox.classList.remove("hidden");

    errorBox.innerText = message;
}


// Prevent HTML from being interpreted inside options
function escapeHTML(text) {

    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


loadQuestions();
