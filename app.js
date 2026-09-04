let questions = [];
let currentQuestion = null;


// ============================================================
// LOAD QUESTIONS
// ============================================================

async function loadQuestions() {

    try {

        const response =
            await fetch("xi-questions.csv");


        if (!response.ok) {

            throw new Error(
                "Could not load xi-questions.csv"
            );

        }


        const csvText =
            await response.text();


        questions =
            parseCSV(csvText);


        if (questions.length === 0) {

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
            document.getElementById("error");


        errorBox.classList.remove(
            "hidden"
        );


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


    for (
        let i = 0;
        i < text.length;
        i++
    ) {

        const char =
            text[i];

        const nextChar =
            text[i + 1];


        if (
            char === '"' &&
            insideQuotes &&
            nextChar === '"'
        ) {

            cell += '"';

            i++;

        }


        else if (
            char === '"'
        ) {

            insideQuotes =
                !insideQuotes;

        }


        else if (
            char === "," &&
            !insideQuotes
        ) {

            row.push(cell);

            cell = "";

        }


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


    if (
        rows.length === 0
    ) {

        return [];
    }


    const headers =
        rows[0].map(
            header =>
                header
                    .trim()
                    .toLowerCase()
        );


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
        document.getElementById(
            "options"
        );


    optionsContainer.innerHTML =
        "";


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
                    "label"
                );


            option.className =
                "option";


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


            const letterSpan =
                document.createElement(
                    "span"
                );


            letterSpan.className =
                "option-letter";


            letterSpan.innerText =
                letter + ".";


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


            option.appendChild(
                radio
            );


            option.appendChild(
                letterSpan
            );


            option.appendChild(
                textSpan
            );


            optionsContainer.appendChild(
                option
            );


            // ====================================================
            // IMMEDIATE ANSWER CHECK
            // ====================================================

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
// CHECK ANSWER IMMEDIATELY
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


    // ----------------------------------------------------------
    // Remove previous visual states
    // ----------------------------------------------------------

    document
        .querySelectorAll(".option")
        .forEach(option => {

            option.classList.remove(
                "selected",
                "correct-answer",
                "wrong-answer"
            );

        });


    // ----------------------------------------------------------
    // CORRECT
    // ----------------------------------------------------------

    if (
        userAnswer ===
        correctAnswer
    ) {

        selectedOption.classList.add(
            "correct-answer"
        );


        showCorrectCelebration();

    }


    // ----------------------------------------------------------
    // WRONG
    // ----------------------------------------------------------

    else {

        selectedOption.classList.add(
            "wrong-answer"
        );


        const correctOption =
            document.querySelector(
                `input[name="answer"][value="${correctAnswer}"]`
            );


        if (correctOption) {

            correctOption
                .closest(".option")
                .classList.add(
                    "correct-answer"
                );

        }


        showWrongReaction();

    }


    // ----------------------------------------------------------
    // PREPARE EXPLANATION
    // ----------------------------------------------------------

    const explanationValue =
        currentQuestion.explanation ||
        currentQuestion.explaination ||
        "";


    document.getElementById(
        "explanation-text"
    ).innerText =
        explanationValue;


    document
        .getElementById(
            "show-explanation-btn"
        )
        .classList.remove(
            "hidden"
        );


    document
        .getElementById(
            "explanation"
        )
        .classList.add(
            "hidden"
        );
}


// ============================================================
// RESET ANSWER STATE
// ============================================================

function resetAnswerState() {

    const result =
        document.getElementById(
            "result"
        );


    result.innerText =
        "";


    result.className =
        "";


    document
        .getElementById(
            "explanation"
        )
        .classList.add(
            "hidden"
        );


    document
        .getElementById(
            "show-explanation-btn"
        )
        .classList.add(
            "hidden"
        );


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

        explanation.classList.remove(
            "hidden"
        );


        button.innerText =
            "🙈 Hide Explanation";


        explanation.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });

    }

    else {

        explanation.classList.add(
            "hidden"
        );


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
// EMOJI BURST
// ============================================================

function createEmojiBurst(
    emojis,
    isSad = false
) {

    // Remove any previous reaction
    // before starting a new one.

    document
        .querySelectorAll(
            ".reaction-container"
        )
        .forEach(
            container =>
                container.remove()
        );


    const container =
        document.createElement(
            "div"
        );


    container.className =
        "reaction-container";


    // IMPORTANT:
    // Sad class ONLY for wrong answers.

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
                Math.random() * 0.25;


            const duration =
                1.8 +
                Math.random() * 1.4;


            const rotation =
                -35 +
                Math.random() * 70;


            const horizontal =
                -120 +
                Math.random() * 240;


            element.style.left =
                left + "%";


            element.style.animationDelay =
                delay + "s";


            element.style.animationDuration =
                duration + "s";


            element.style.fontSize =
                (
                    1.8 +
                    Math.random() * 1.8
                ) +
                "rem";


            element.style.setProperty(
                "--rotation",
                rotation + "deg"
            );


            element.style.setProperty(
                "--horizontal",
                horizontal + "px"
            );


            container.appendChild(
                element
            );

        }
    );


    setTimeout(
        () => {

            if (
                container &&
                container.parentNode
            ) {

                container.remove();
            }

        },
        4000
    );
}


// ============================================================
// SHOW ERROR
// ============================================================

function showError(message) {

    document
        .getElementById("loading")
        .classList.add(
            "hidden"
        );


    document
        .getElementById(
            "question-container"
        )
        .classList.add(
            "hidden"
        );


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
