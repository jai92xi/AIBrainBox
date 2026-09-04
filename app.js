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

        document
            .getElementById("loading")
            .classList.add("hidden");

        const errorBox =
            document.getElementById("error");

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


        // Escaped quote
        if (
            char === '"' &&
            insideQuotes &&
            nextChar === '"'
        ) {

            cell += '"';

            i++;
        }


        // Opening / closing quote
        else if (char === '"') {

            insideQuotes = !insideQuotes;
        }


        // Comma
        else if (
            char === "," &&
            !insideQuotes
        ) {

            row.push(cell);

            cell = "";
        }


        // New line
        else if (
            (char === "\n" || char === "\r") &&
            !insideQuotes
        ) {

            if (
                char === "\r" &&
                nextChar === "\n"
            ) {
                i++;
            }

            row.push(cell);

            if (
                row.some(
                    value =>
                        value.trim() !== ""
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


    // Final row
    if (
        cell !== "" ||
        row.length > 0
    ) {

        row.push(cell);

        if (
            row.some(
                value =>
                    value.trim() !== ""
            )
        ) {
            rows.push(row);
        }
    }


    if (rows.length === 0) {
        return [];
    }


    // Headers
    const headers =
        rows[0].map(
            header =>
                header
                    .trim()
                    .toLowerCase()
        );


    // Convert CSV rows to objects
    return rows
        .slice(1)
        .map(row => {

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
            "No question ID was provided."
        );

        return;
    }


    currentQuestion =
        questions.find(
            q =>
                q.id &&
                q.id
                    .trim()
                    .toLowerCase() ===
                id
                    .trim()
                    .toLowerCase()
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


    // Question
    document
        .getElementById("question")
        .innerText =
        currentQuestion.question || "";


    // Options container
    const optionsContainer =
        document.getElementById("options");

    optionsContainer.innerHTML = "";


    // A / B / C / D
    const optionLetters = [
        "A",
        "B",
        "C",
        "D"
    ];


    optionLetters.forEach(
        letter => {

            // ------------------------------------------------
            // OPTION CARD
            // ------------------------------------------------

            const option =
                document.createElement("label");

            option.className = "option";

            option.dataset.answer =
                letter;


            // ------------------------------------------------
            // RADIO
            // ------------------------------------------------

            const radio =
                document.createElement("input");

            radio.type = "radio";

            radio.name = "answer";

            radio.value = letter;


            // ------------------------------------------------
            // LETTER
            // ------------------------------------------------

            const letterSpan =
                document.createElement("span");

            letterSpan.className =
                "option-letter";

            letterSpan.innerText =
                letter;


            // ------------------------------------------------
            // TEXT
            // ------------------------------------------------

            const textSpan =
                document.createElement("span");

            textSpan.className =
                "option-text";

            textSpan.innerText =
                currentQuestion[
                    letter.toLowerCase()
                ] || "";


            // ------------------------------------------------
            // CHECK ICON
            // ------------------------------------------------

            const statusIcon =
                document.createElement("span");

            statusIcon.className =
                "option-status";

            statusIcon.innerText = "";


            // ------------------------------------------------
            // BUILD OPTION
            // ------------------------------------------------

            option.appendChild(radio);

            option.appendChild(letterSpan);

            option.appendChild(textSpan);

            option.appendChild(statusIcon);


            optionsContainer.appendChild(option);


            // ------------------------------------------------
            // SELECT OPTION
            // ------------------------------------------------

            radio.addEventListener(
                "change",
                () => {

                    // Don't allow changing after answer
                    // has been submitted
                    if (
                        optionsContainer.classList.contains(
                            "answered"
                        )
                    ) {
                        return;
                    }


                    // Remove selected state
                    document
                        .querySelectorAll(".option")
                        .forEach(
                            item => {

                                item.classList.remove(
                                    "selected"
                                );
                            }
                        );


                    // Add selected state
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
        document.getElementById(
            "explanation"
        );

    explanation.classList.add(
        "hidden"
    );


    document
        .getElementById("explanation-text")
        .innerText = "";


    // Reset options
    optionsContainer.classList.remove(
        "answered"
    );
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


    const optionsContainer =
        document.getElementById("options");


    // --------------------------------------------------------
    // NO ANSWER
    // --------------------------------------------------------

    if (!selected) {

        result.className =
            "incorrect";

        result.innerText =
            "Please select an answer first.";

        return;
    }


    // --------------------------------------------------------
    // PREVENT SECOND SUBMISSION
    // --------------------------------------------------------

    if (
        optionsContainer.classList.contains(
            "answered"
        )
    ) {
        return;
    }


    // --------------------------------------------------------
    // GET ANSWERS
    // --------------------------------------------------------

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


    // --------------------------------------------------------
    // LOCK OPTIONS
    // --------------------------------------------------------

    optionsContainer.classList.add(
        "answered"
    );


    document
        .querySelectorAll(
            'input[name="answer"]'
        )
        .forEach(
            input => {

                input.disabled = true;
            }
        );


    // --------------------------------------------------------
    // FIND SELECTED OPTION
    // --------------------------------------------------------

    const selectedOption =
        selected.closest(".option");


    // --------------------------------------------------------
    // CORRECT ANSWER
    // --------------------------------------------------------

    if (
        userAnswer === correctAnswer
    ) {

        // Selected answer = green
        selectedOption.classList.remove(
            "selected"
        );

        selectedOption.classList.add(
            "correct"
        );


        const selectedIcon =
            selectedOption.querySelector(
                ".option-status"
            );

        selectedIcon.innerText = "✓";


        // Result message
        result.className =
            "correct";

        result.innerText =
            "🎉 Correct! Excellent work.";


        // Celebration
        launchCelebration();

    }


    // --------------------------------------------------------
    // WRONG ANSWER
    // --------------------------------------------------------

    else {

        // Selected answer = red
        selectedOption.classList.remove(
            "selected"
        );

        selectedOption.classList.add(
            "wrong"
        );


        const selectedIcon =
            selectedOption.querySelector(
                ".option-status"
            );

        selectedIcon.innerText = "✕";


        // Find correct option
        const correctOption =
            document.querySelector(
                `.option[data-answer="${correctAnswer}"]`
            );


        // Highlight correct answer green
        if (correctOption) {

            correctOption.classList.add(
                "correct"
            );


            const correctIcon =
                correctOption.querySelector(
                    ".option-status"
                );

            correctIcon.innerText = "✓";
        }


        // Result
        result.className =
            "incorrect";

        result.innerText =
            "✗ Not quite. The correct answer is " +
            correctAnswer + ".";
    }


    // --------------------------------------------------------
    // SHOW EXPLANATION
    // --------------------------------------------------------

    const explanation =
        document.getElementById(
            "explanation"
        );

    explanation.classList.remove(
        "hidden"
    );


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
// AI CELEBRATION
// ============================================================

function launchCelebration() {

    const celebration =
        document.createElement("div");

    celebration.className =
        "celebration";


    document.body.appendChild(
        celebration
    );


    // AI-style clapping celebration
    const emojis = [
        "👏",
        "👏",
        "🎉",
        "👏",
        "✨",
        "👏",
        "🧠",
        "🎊",
        "👏",
        "⭐",
        "👏",
        "🎉"
    ];


    emojis.forEach(
        (emoji, index) => {

            const particle =
                document.createElement(
                    "span"
                );

            particle.className =
                "celebration-particle";

            particle.innerText =
                emoji;


            // Random horizontal position
            particle.style.left =
                Math.random() * 100 + "%";


            // Random animation delay
            particle.style.animationDelay =
                Math.random() * 0.6 + "s";


            // Random size
            particle.style.fontSize =
                (22 + Math.random() * 18) +
                "px";


            celebration.appendChild(
                particle
            );
        }
    );


    // Remove celebration
    setTimeout(
        () => {

            celebration.remove();

        },
        3000
    );
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

    document
        .getElementById("loading")
        .classList.add("hidden");


    document
        .getElementById(
            "question-container"
        )
        .classList.add("hidden");


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
// START APPLICATION
// ============================================================

loadQuestions();
