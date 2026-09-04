let questions = [];
let currentQuestion = null;


// Load CSV
async function loadQuestions() {

    try {

        const response = await fetch("xi-questions.csv");

        if (!response.ok) {
            throw new Error("CSV could not be loaded");
        }

        const csvText = await response.text();

        questions = parseCSV(csvText);

        if (questions.length === 0) {
            throw new Error("No questions found in CSV");
        }

        loadQuestion();

    } catch (error) {

        console.error(error);

        document.getElementById("loading").classList.add("hidden");

        const errorBox = document.getElementById("error");

        errorBox.classList.remove("hidden");

        errorBox.innerText =
            "Unable to load the question database.";
    }
}


// Robust CSV parser supporting quoted multiline cells
function parseCSV(text) {

    const rows = [];

    let row = [];
    let cell = "";

    let insideQuotes = false;

    for (let i = 0; i < text.length; i++) {

        const char = text[i];

        if (char === '"') {

            if (insideQuotes && text[i + 1] === '"') {

                cell += '"';

                i++;

            } else {

                insideQuotes = !insideQuotes;
            }

        }

        else if (char === "," && !insideQuotes) {

            row.push(cell);

            cell = "";
        }

        else if ((char === "\n" || char === "\r") && !insideQuotes) {

            if (char === "\r" && text[i + 1] === "\n") {
                i++;
            }

            row.push(cell);

            if (row.some(value => value.trim() !== "")) {
                rows.push(row);
            }

            row = [];
            cell = "";
        }

        else {

            cell += char;
        }
    }


    // Last row
    if (cell !== "" || row.length > 0) {

        row.push(cell);

        if (row.some(value => value.trim() !== "")) {
            rows.push(row);
        }
    }


    if (rows.length < 2) {
        return [];
    }


    // Headers
    const headers = rows[0].map(header =>
        header.trim().toLowerCase()
    );


    // Convert rows to objects
    return rows.slice(1).map(row => {

        const question = {};

        headers.forEach((header, index) => {

            question[header] =
                row[index] !== undefined
                    ? row[index].trim()
                    : "";
        });

        return question;
    });
}


// Find question from URL
function loadQuestion() {

    const params =
        new URLSearchParams(window.location.search);

    const id = params.get("id");


    if (!id) {

        showError(
            "No question ID was provided."
        );

        return;
    }


    currentQuestion = questions.find(
        q =>
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


// Display question
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
            currentQuestion.id;


    document
        .getElementById("topic")
        .innerText =
            currentQuestion.topic;


    document
        .getElementById("question")
        .innerText =
            currentQuestion.question;


    const optionsContainer =
        document.getElementById("options");


    optionsContainer.innerHTML = "";


    const optionLetters =
        ["A", "B", "C", "D"];


    optionLetters.forEach(letter => {

        const label =
            document.createElement("label");


        label.className = "option";


        label.innerHTML = `

            <input
                type="radio"
                name="answer"
                value="${letter}"
            >

            <span class="option-letter">
                ${letter}
            </span>

            <span class="option-text">
                ${escapeHTML(
                    currentQuestion[
                        letter.toLowerCase()
                    ]
                )}
            </span>

        `;


        optionsContainer.appendChild(label);


        // Highlight selected option
        const radio =
            label.querySelector("input");


        radio.addEventListener(
            "change",
            function () {

                document
                    .querySelectorAll(".option")
                    .forEach(option =>
                        option.classList.remove(
                            "selected"
                        )
                    );


                label.classList.add(
                    "selected"
                );
            }
        );

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
        currentQuestion[
            "correct answer"
        ]
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


    document
        .getElementById("explanation-text")
        .innerText =
            currentQuestion.explaination || "";
}


// Copy link
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


// Error message
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


// Prevent HTML injection
function escapeHTML(text) {

    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


loadQuestions();
