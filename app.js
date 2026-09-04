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

        // Handle escaped quotes: ""
        if (char === '"' && insideQuotes && nextChar === '"') {

            cell += '"';

            i++;

        }

        // Start / end quoted field
        else if (char === '"') {

            insideQuotes = !insideQuotes;

        }

        // Comma separates cells
        else if (char === "," && !insideQuotes) {

            row.push(cell);

            cell = "";

        }

        // New row
        else if (
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

        }

        else {

            cell += char;
        }
    }


    // Add final row
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


    // No data
    if (rows.length === 0) {
        return [];
    }


    // First row = headers
    const headers = rows[0].map(
        header =>
            header
                .trim()
                .toLowerCase()
    );


    // Convert rows into objects
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


    // No ID supplied
    if (!id) {

        showError(
            "No question ID was provided. Please use a question link such as ?id=Xi-00001"
        );

        return;
    }


    // Find question
    currentQuestion =
        questions.find(
            q =>
                q.id &&
                q.id.trim().toLowerCase() ===
                id.trim().toLowerCase()
        );


    // Question not found
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

    // Hide loading
    document
        .getElementById("loading")
        .classList.add("hidden");


    // Show question container
    document
        .getElementById("question-container")
        .classList.remove("hidden");


    // Question ID
    document
        .getElementById("question-id")
        .innerText =
        currentQuestion.id || "";


    // Topic
    document
        .getElementById("topic")
        .innerText =
        currentQuestion.topic || "";


    // Question text
    document
        .getElementById("question")
        .innerText =
        currentQuestion.question || "";


    // Clear previous options
    const optionsContainer =
        document.getElementById("options");

    optionsContainer.innerHTML = "";


    // Answer options
    const optionLetters = [
        "A",
        "B",
        "C",
        "D"
    ];


    optionLetters.forEach(
        letter => {

            // Create label
            const option =
                document.createElement("label");

            option.className = "option";


            // Create radio button
            const radio =
                document.createElement("input");

            radio.type = "radio";
            radio.name = "answer";
            radio.value = letter;


            // Create answer letter
            const letterSpan =
                document.createElement("span");

            letterSpan.className =
                "option-letter";

            letterSpan.innerText =
                letter + ".";


            // Create answer text
            const textSpan =
                document.createElement("span");

            textSpan.className =
                "option-text";

            textSpan.innerText =
                currentQuestion[
                    letter.toLowerCase()
                ] || "";


            // Put everything inside option
            option.appendChild(radio);

            option.appendChild(letterSpan);

            option.appendChild(textSpan);


            // Add option to container
            optionsContainer.appendChild(option);


            // Highlight selected option
            radio.addEventListener(
                "change",
                () => {

                    // Remove selected class
                    document
                        .querySelectorAll(
                            ".option"
                        )
                        .forEach(
                            item =>
                                item.classList.remove(
                                    "selected"
                                )
                        );


                    // Highlight current option
                    option.classList.add(
                        "selected"
                    );
                }
            );
        }
    );


    // Reset result
    const result =
        document.getElementById("result");

    result.innerText = "";
    result.className = "";


    // Reset explanation
    const explanation =
        document.getElementById("explanation");

    explanation.classList.add("hidden");


    const explanationText =
        document.getElementById(
            "explanation-text"
        );

    explanationText.innerText = "";
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


    // No answer selected
    if (!selected) {

        result.className =
            "incorrect";

        result.innerText =
            "Please select an answer first.";

        return;
    }


    // User answer
    const userAnswer =
        selected.value
            .trim()
            .toUpperCase();


    // Correct answer
    const correctAnswer =
        (
            currentQuestion["correct answer"] ||
            ""
        )
        .trim()
        .toUpperCase();


    // Check answer
    if (
        userAnswer === correctAnswer
    ) {

        result.className =
            "correct";

        result.innerText =
            "✓ Correct!";

    }

    else {

        result.className =
            "incorrect";

        result.innerText =
            "✗ Incorrect. Correct answer: " +
            correctAnswer;
    }


    // Show explanation
    const explanation =
        document.getElementById(
            "explanation"
        );

    explanation.classList.remove(
        "hidden"
    );


    /*
       Support both spellings.

       Preferred:
       explanation

       Older CSV:
       explaination
    */

    const explanationValue =
        currentQuestion.explanation ||
        currentQuestion.explaination ||
        "";


    document.getElementById(
        "explanation-text"
    ).innerText =
        explanationValue;
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

    }

    catch (error) {

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

    // Hide loading
    document
        .getElementById("loading")
        .classList.add("hidden");


    // Hide question
    document
        .getElementById(
            "question-container"
        )
        .classList.add("hidden");


    // Show error
    const errorBox =
        document.getElementById(
            "error"
        );

    errorBox.classList.remove(
        "hidden"
    );

    errorBox.innerText =
        message;
}


// ============================================================
// LOAD APPLICATION
// ============================================================

loadQuestions();
