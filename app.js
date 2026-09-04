let questions = [];
let currentQuestion = null;


// ============================================================
// FULL-SCREEN CORRECT ANSWER SPARKLES
// ============================================================

let sparkleTimeout = null;

function showCorrectSparkles() {

    // Remove any existing sparkle layer
    const existingSparkles =
        document.getElementById("correct-sparkles");

    if (existingSparkles) {
        existingSparkles.remove();
    }

    // Create full-screen sparkle layer
    const sparkleLayer =
        document.createElement("div");

    sparkleLayer.id =
        "correct-sparkles";

    Object.assign(
        sparkleLayer.style,
        {
            position: "fixed",
            inset: "0",
            width: "100vw",
            height: "100vh",
            pointerEvents: "none",
            zIndex: "99999",
            overflow: "hidden"
        }
    );


    // Sparkle colors matching AIBrainBox
    const colors = [
        "#4f46e5", // indigo
        "#6366f1", // light indigo
        "#7c3aed", // purple
        "#22c55e", // green
        "#facc15", // gold
        "#ffffff"  // white
    ];


    // Number of sparkles
    const sparkleCount = 120;


    for (let i = 0; i < sparkleCount; i++) {

        const sparkle =
            document.createElement("span");


        // Use different sparkle shapes
        sparkle.innerText =
            Math.random() > 0.5
                ? "✦"
                : "✧";


        // Random size
        const size =
            Math.random() * 18 + 8;


        // Random screen position
        const left =
            Math.random() * 100;

        const top =
            Math.random() * 100;


        // Random animation timing
        const delay =
            Math.random() * 0.25;

        const duration =
            Math.random() * 0.8 + 1.1;


        // Random color
        const color =
            colors[
                Math.floor(
                    Math.random() * colors.length
                )
            ];


        Object.assign(
            sparkle.style,
            {
                position: "absolute",
                left: `${left}%`,
                top: `${top}%`,
                color: color,
                fontSize: `${size}px`,
                fontWeight: "700",
                lineHeight: "1",
                opacity: "0",
                textShadow:
                    `0 0 6px ${color},
                     0 0 14px ${color},
                     0 0 22px ${color}`,
                transform:
                    "translate(-50%, -50%) scale(0) rotate(0deg)",
                animation:
                    `aibrainboxSparkle ${duration}s ease-out ${delay}s forwards`
            }
        );


        sparkleLayer.appendChild(
            sparkle
        );
    }


    // Add sparkle layer to page
    document.body.appendChild(
        sparkleLayer
    );


    // Remove automatically after 2 seconds
    clearTimeout(
        sparkleTimeout
    );


    sparkleTimeout =
        setTimeout(
            () => {

                if (
                    sparkleLayer &&
                    sparkleLayer.parentNode
                ) {
                    sparkleLayer.remove();
                }

            },
            2000
        );
}


// ============================================================
// SPARKLE ANIMATION CSS
// ============================================================

if (
    !document.getElementById(
        "aibrainbox-sparkle-style"
    )
) {

    const style =
        document.createElement("style");


    style.id =
        "aibrainbox-sparkle-style";


    style.innerHTML = `

        @keyframes aibrainboxSparkle {

            0% {
                opacity: 0;
                transform:
                    translate(-50%, -50%)
                    scale(0)
                    rotate(0deg);
            }

            15% {
                opacity: 1;
                transform:
                    translate(-50%, -50%)
                    scale(1.4)
                    rotate(30deg);
            }

            40% {
                opacity: 1;
                transform:
                    translate(-50%, -50%)
                    scale(1)
                    rotate(90deg);
            }

            70% {
                opacity: 0.8;
                transform:
                    translate(-50%, -50%)
                    scale(0.8)
                    rotate(150deg);
            }

            100% {
                opacity: 0;
                transform:
                    translate(-50%, -50%)
                    scale(0.1)
                    rotate(220deg);
            }
        }


        @media (prefers-reduced-motion: reduce) {

            #correct-sparkles {
                display: none !important;
            }

        }

    `;


    document.head.appendChild(
        style
    );
}


// ============================================================
// LOAD QUESTIONS FROM CSV
// ============================================================

async function loadQuestions() {

    try {

        const response =
            await fetch(
                "xi-questions.csv"
            );


        if (!response.ok) {

            throw new Error(
                "Could not load xi-questions.csv"
            );

        }


        const csvText =
            await response.text();


        questions =
            parseCSV(
                csvText
            );


        if (
            questions.length === 0
        ) {

            throw new Error(
                "No questions found in the CSV file."
            );

        }


        loadQuestion();

    }

    catch (error) {

        document
            .getElementById("loading")
            .classList.add("hidden");


        const errorBox =
            document.getElementById(
                "error"
            );


        errorBox.classList.remove(
            "hidden"
        );


        errorBox.innerText =
            "Unable to load the question database. Please check that xi-questions.csv exists in the repository.";


        console.error(
            error
        );
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


    for (
        let i = 0;
        i < text.length;
        i++
    ) {

        const char =
            text[i];

        const nextChar =
            text[i + 1];


        // Handle escaped quotes: ""
        if (
            char === '"' &&
            insideQuotes &&
            nextChar === '"'
        ) {

            cell += '"';

            i++;

        }


        // Start / end quoted field
        else if (
            char === '"'
        ) {

            insideQuotes =
                !insideQuotes;

        }


        // Comma separates cells
        else if (
            char === "," &&
            !insideQuotes
        ) {

            row.push(
                cell
            );

            cell = "";

        }


        // New row
        else if (
            (
                char === "\n" ||
                char === "\r"
            ) &&
            !insideQuotes
        ) {

            if (
                char === "\r" &&
                nextChar === "\n"
            ) {

                i++;

            }


            row.push(
                cell
            );


            if (
                row.some(
                    value =>
                        value.trim() !== ""
                )
            ) {

                rows.push(
                    row
                );

            }


            row = [];

            cell = "";

        }


        else {

            cell += char;

        }
    }


    // Add final row
    if (
        cell !== "" ||
        row.length > 0
    ) {

        row.push(
            cell
        );


        if (
            row.some(
                value =>
                    value.trim() !== ""
            )
        ) {

            rows.push(
                row
            );

        }
    }


    // No data
    if (
        rows.length === 0
    ) {

        return [];

    }


    // First row = headers
    const headers =
        rows[0].map(
            header =>
                header
                    .trim()
                    .toLowerCase()
        );


    // Convert rows into objects
    return rows
        .slice(1)
        .map(
            row => {

                const question = {};


                headers.forEach(
                    (
                        header,
                        index
                    ) => {

                        question[header] =
                            row[index] ||
                            "";

                    }
                );


                return question;

            }
        );
}


// ============================================================
// LOAD QUESTION USING URL ID
// ============================================================

function loadQuestion() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const id =
        params.get("id");


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
                q.id
                    .trim()
                    .toLowerCase() ===
                id
                    .trim()
                    .toLowerCase()
        );


    // Question not found
    if (!currentQuestion) {

        showError(
            "Question not found: " +
            id
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
        currentQuestion.id ||
        "";


    // Topic
    document
        .getElementById("topic")
        .innerText =
        currentQuestion.topic ||
        "";


    // Question text
    document
        .getElementById("question")
        .innerText =
        currentQuestion.question ||
        "";


    // Clear previous options
    const optionsContainer =
        document.getElementById(
            "options"
        );


    optionsContainer.innerHTML =
        "";


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
                document.createElement(
                    "label"
                );


            option.className =
                "option";


            // Create radio button
            const radio =
                document.createElement(
                    "input"
                );


            radio.type =
                "radio";

            radio.name =
                "answer";

            radio.value =
                letter;


            // Create answer letter
            const letterSpan =
                document.createElement(
                    "span"
                );


            letterSpan.className =
                "option-letter";


            letterSpan.innerText =
                letter + ".";


            // Create answer text
            const textSpan =
                document.createElement(
                    "span"
                );


            textSpan.className =
                "option-text";


            textSpan.innerText =
                currentQuestion[
                    letter.toLowerCase()
                ] || "";


            // Put everything inside option
            option.appendChild(
                radio
            );


            option.appendChild(
                letterSpan
            );


            option.appendChild(
                textSpan
            );


            // Add option to container
            optionsContainer.appendChild(
                option
            );


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
        document.getElementById(
            "result"
        );


    result.innerText =
        "";


    result.className =
        "";


    // Reset explanation
    const explanation =
        document.getElementById(
            "explanation"
        );


    explanation.classList.add(
        "hidden"
    );


    const explanationText =
        document.getElementById(
            "explanation-text"
        );


    explanationText.innerText =
        "";
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
        document.getElementById(
            "result"
        );


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
            currentQuestion[
                "correct answer"
            ] ||
            ""
        )
        .trim()
        .toUpperCase();


    // Check answer
    if (
        userAnswer ===
        correctAnswer
    ) {

        result.className =
            "correct";


        result.innerText =
            "✓ Correct!";


        // ====================================================
        // TRIGGER FULL-SCREEN SPARKLES
        // ====================================================

        showCorrectSparkles();

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
