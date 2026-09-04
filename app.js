let questions = [];
let currentQuestion = null;


// ============================================================
// CSV LOCATION
// ============================================================

const CSV_URL =
    "https://raw.githubusercontent.com/jai92xi/AIBrainBox/main/xi-questions.csv";


// ============================================================
// LOAD QUESTIONS
// ============================================================

async function loadQuestions() {

    try {

        const response = await fetch(
            CSV_URL + "?v=" + Date.now()
        );

        if (!response.ok) {

            throw new Error(
                "Unable to load xi-questions.csv. HTTP status: " +
                response.status
            );

        }


        const csvText =
            await response.text();


        if (!csvText.trim()) {

            throw new Error(
                "The CSV file is empty."
            );

        }


        questions =
            parseCSV(csvText);


        if (!questions.length) {

            throw new Error(
                "No questions were found in the CSV file."
            );

        }


        loadQuestion();

    }

    catch (error) {

        console.error(
            "CSV loading error:",
            error
        );


        document
            .getElementById("loading")
            .classList
            .add("hidden");


        const errorBox =
            document.getElementById("error");


        errorBox.classList.remove(
            "hidden"
        );


        errorBox.innerText =
            "Unable to load the question database. Please check that xi-questions.csv exists in the repository.";

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


        // Double quote inside quoted field

        if (
            char === '"' &&
            insideQuotes &&
            nextChar === '"'
        ) {

            cell += '"';

            i++;

        }


        // Start/end quoted field

        else if (
            char === '"'
        ) {

            insideQuotes =
                !insideQuotes;

        }


        // Column separator

        else if (
            char === "," &&
            !insideQuotes
        ) {

            row.push(cell);

            cell = "";

        }


        // New line

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


            row.push(cell);


            if (
                row.some(
                    value =>
                        value
                            .trim() !== ""
                )
            ) {

                rows.push(row);

            }


            row = [];

            cell = "";

        }


        // Normal character

        else {

            cell += char;

        }

    }


    // Last row

    if (
        cell !== "" ||
        row.length > 0
    ) {

        row.push(cell);


        if (
            row.some(
                value =>
                    value
                        .trim() !== ""
            )
        ) {

            rows.push(row);

        }

    }


    if (
        rows.length === 0
    ) {

        return [];

    }


    // Normalize headers

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
        .map(row => {

            const question = {};


            headers.forEach(
                (
                    header,
                    index
                ) => {

                    question[header] =
                        (
                            row[index] ||
                            ""
                        ).trim();

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


    const id =
        params.get("id");


    if (!id) {

        showError(
            "No question ID was provided. Please use a question link such as ?id=Xi-00001"
        );

        return;

    }


    currentQuestion =
        questions.find(
            question => {

                return (
                    question.id &&
                    question.id
                        .trim()
                        .toLowerCase() ===
                    id
                        .trim()
                        .toLowerCase()
                );

            }
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
        .classList
        .add("hidden");


    document
        .getElementById("error")
        .classList
        .add("hidden");


    document
        .getElementById("question-container")
        .classList
        .remove("hidden");


    // Display question only

    document
        .getElementById("question")
        .innerText =
        currentQuestion.question || "";


    const optionsContainer =
        document.getElementById(
            "options"
        );


    optionsContainer.innerHTML = "";


    const optionLetters = [
        "A",
        "B",
        "C",
        "D"
    ];


    optionLetters.forEach(
        letter => {

            const option =
                document.createElement(
                    "div"
                );


            option.className =
                "option";


            // Radio

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

            radio.id =
                "option-" + letter;


            // Letter

            const letterSpan =
                document.createElement(
                    "span"
                );


            letterSpan.className =
                "option-letter";


            letterSpan.innerText =
                letter + ".";


            // Text

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


            // Label

            const label =
                document.createElement(
                    "label"
                );


            label.htmlFor =
                "option-" + letter;


            label.appendChild(
                letterSpan
            );


            label.appendChild(
                textSpan
            );


            option.appendChild(
                radio
            );


            option.appendChild(
                label
            );


            optionsContainer.appendChild(
                option
            );


            // ==================================================
            // IMMEDIATE ANSWER CHECK
            // ==================================================

            radio.addEventListener(
                "change",
                () => {

                    checkAnswer(
                        radio,
                        option
                    );

                }
            );

        }
    );


    resetAnswerState();

}


// ============================================================
// CHECK ANSWER
// ============================================================

function checkAnswer(
    selected,
    selectedOption
) {

    const userAnswer =
        selected.value
            .trim()
            .toUpperCase();


    const correctAnswer =
        (
            currentQuestion[
                "correct answer"
            ] || ""
        )
        .trim()
        .toUpperCase();


    // Remove old states

    document
        .querySelectorAll(
            ".option"
        )
        .forEach(
            option => {

                option.classList.remove(
                    "selected",
                    "correct-answer",
                    "wrong-answer"
                );

            }
        );


    // =========================================================
    // CORRECT
    // =========================================================

    if (
        userAnswer ===
        correctAnswer
    ) {

        selectedOption
            .classList
            .add(
                "correct-answer"
            );


        showCorrectCelebration();

    }


    // =========================================================
    // WRONG
    // =========================================================

    else {

        selectedOption
            .classList
            .add(
                "wrong-answer"
            );


        // Find correct option

        const correctRadio =
            document.querySelector(
                'input[name="answer"][value="' +
                correctAnswer +
                '"]'
            );


        if (correctRadio) {

            correctRadio
                .closest(".option")
                .classList
                .add(
                    "correct-answer"
                );

        }


        showWrongReaction();

    }


    // =========================================================
    // PREPARE EXPLANATION
    // =========================================================

    const explanation =
        currentQuestion.explanation ||
        currentQuestion.explaination ||
        "";


    document
        .getElementById(
            "explanation-text"
        )
        .innerText =
        explanation;


    // Show explanation button

    document
        .getElementById(
            "show-explanation-btn"
        )
        .classList
        .remove("hidden");


    // Keep explanation hidden

    document
        .getElementById(
            "explanation"
        )
        .classList
        .add("hidden");


    // No large result text

    const result =
        document.getElementById(
            "result"
        );


    result.innerText = "";

}


// ============================================================
// RESET ANSWER STATE
// ============================================================

function resetAnswerState() {

    const result =
        document.getElementById(
            "result"
        );


    result.innerText = "";


    result.className = "";


    const explanation =
        document.getElementById(
            "explanation"
        );


    explanation
        .classList
        .add("hidden");


    const explanationText =
        document.getElementById(
            "explanation-text"
        );


    explanationText.innerText =
        "";


    const explanationButton =
        document.getElementById(
            "show-explanation-btn"
        );


    explanationButton
        .classList
        .add("hidden");


    explanationButton.innerText =
        "💡 Show Explanation";


    document
        .querySelectorAll(
            ".option"
        )
        .forEach(
            option => {

                option.classList.remove(
                    "selected",
                    "correct-answer",
                    "wrong-answer"
                );

            }
        );

}


// ============================================================
// SHOW / HIDE EXPLANATION
// ============================================================

function toggleExplanation() {

    const explanation =
        document.getElementById(
            "explanation"
        );


    const button =
        document.getElementById(
            "show-explanation-btn"
        );


    if (
        explanation.classList.contains(
            "hidden"
        )
    ) {

        explanation
            .classList
            .remove("hidden");


        button.innerText =
            "🙈 Hide Explanation";


        explanation.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });

    }

    else {

        explanation
            .classList
            .add("hidden");


        button.innerText =
            "💡 Show Explanation";

    }

}


// ============================================================
// CORRECT ANSWER CELEBRATION
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


    createEmojiBurst(
        emojis,
        false
    );

}


// ============================================================
// WRONG ANSWER REACTION
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


    createEmojiBurst(
        emojis,
        true
    );

}


// ============================================================
// CREATE EMOJI BURST
// ============================================================

function createEmojiBurst(
    emojis,
    isSad = false
) {

    // Remove old reactions

    document
        .querySelectorAll(
            ".reaction-container"
        )
        .forEach(
            oldContainer => {

                oldContainer.remove();

            }
        );


    const container =
        document.createElement(
            "div"
        );


    container.className =
        "reaction-container";


    if (isSad) {

        container.classList.add(
            "sad"
        );

    }


    document.body.appendChild(
        container
    );


    emojis.forEach(
        emoji => {

            const element =
                document.createElement(
                    "span"
                );


            element.className =
                "reaction-emoji";


            element.innerText =
                emoji;


            const left =
                5 +
                Math.random() * 90;


            const delay =
                Math.random() * 0.3;


            const duration =
                2.0 +
                Math.random() * 1.4;


            const rotation =
                -40 +
                Math.random() * 80;


            const horizontal =
                -120 +
                Math.random() * 240;


            const size =
                1.7 +
                Math.random() * 1.8;


            element.style.setProperty(
                "--start-left",
                left + "%"
            );


            element.style.setProperty(
                "--delay",
                delay + "s"
            );


            element.style.setProperty(
                "--duration",
                duration + "s"
            );


            element.style.setProperty(
                "--rotation",
                rotation + "deg"
            );


            element.style.setProperty(
                "--horizontal",
                horizontal + "px"
            );


            element.style.setProperty(
                "--emoji-size",
                size + "rem"
            );


            container.appendChild(
                element
            );

        }
    );


    setTimeout(
        () => {

            if (
                container.parentNode
            ) {

                container.remove();

            }

        },
        4500
    );

}


// ============================================================
// SHOW ERROR
// ============================================================

function showError(
    message
) {

    document
        .getElementById(
            "loading"
        )
        .classList
        .add("hidden");


    document
        .getElementById(
            "question-container"
        )
        .classList
        .add("hidden");


    const errorBox =
        document.getElementById(
            "error"
        );


    errorBox
        .classList
        .remove("hidden");


    errorBox.innerText =
        message;

}


// ============================================================
// START APPLICATION
// ============================================================

loadQuestions();
