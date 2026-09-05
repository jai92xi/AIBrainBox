let questions = [];
let currentQuestion = null;

// Stores answers for every question during the current session.
// Example:
// {
//     "Xi-00001": {
//         answer: "B",
//         correct: true
//     },
//     "Xi-00002": {
//         answer: "C",
//         correct: false
//     }
// }
const answerState = {};


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

    restoreAnswerState();

    updateNavigationButtons();

    updateScore();

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


    const isCorrect =
        userAnswer ===
        correctAnswer;


    // ========================================================
    // SAVE ANSWER
    // ========================================================

    answerState[
        currentQuestion.id
    ] = {

        answer:
            userAnswer,

        correct:
            isCorrect

    };


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


    // ========================================================
    // CORRECT
    // ========================================================

    if (isCorrect) {

        selectedOption
            .classList
            .add(
                "correct-answer"
            );


        showCorrectCelebration();

    }


    // ========================================================
    // WRONG
    // ========================================================

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


    // ========================================================
    // UPDATE SCORE
    // ========================================================

    updateScore();


    // ========================================================
    // PREPARE EXPLANATION
    // ========================================================

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
// RESTORE ANSWER STATE
// ============================================================

function restoreAnswerState() {

    if (!currentQuestion) {
        return;
    }


    const state =
        answerState[
            currentQuestion.id
        ];


    // Question has not been answered

    if (!state) {

        return;

    }


    // Find saved radio button

    const radio =
        document.querySelector(
            'input[name="answer"][value="' +
            state.answer +
            '"]'
        );


    if (!radio) {

        return;

    }


    // Restore selection

    radio.checked =
        true;


    const selectedOption =
        radio.closest(
            ".option"
        );


    // Remove old visual states

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


    // ========================================================
    // CORRECT ANSWER
    // ========================================================

    if (state.correct) {

        selectedOption
            .classList
            .add(
                "correct-answer"
            );

    }


    // ========================================================
    // WRONG ANSWER
    // ========================================================

    else {

        selectedOption
            .classList
            .add(
                "wrong-answer"
            );


        // Show correct answer

        const correctAnswer =
            (
                currentQuestion[
                    "correct answer"
                ] || ""
            )
            .trim()
            .toUpperCase();


        const correctRadio =
            document.querySelector(
                'input[name="answer"][value="' +
                correctAnswer +
                '"]'
            );


        if (correctRadio) {

            correctRadio
                .closest(
                    ".option"
                )
                .classList
                .add(
                    "correct-answer"
                );

        }

    }


    // Restore explanation

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


    document
        .getElementById(
            "result"
        )
        .innerText =
        "";

}


// ============================================================
// SCORE
// ============================================================

function updateScore() {

    const scoreElement =
        document.getElementById(
            "quiz-score"
        );


    if (!scoreElement) {
        return;
    }


    const states =
        Object.values(
            answerState
        );


    const answeredCount =
        states.length;


    const correctCount =
        states.filter(
            state =>
                state.correct === true
        ).length;


    scoreElement.innerText =
        "Score: " +
        correctCount +
        " / " +
        answeredCount;

}


// ============================================================
// GET CURRENT QUESTION INDEX
// ============================================================

function getCurrentQuestionIndex() {

    if (!currentQuestion) {

        return -1;

    }


    return questions.findIndex(
        question => {

            return (
                question.id &&
                currentQuestion.id &&
                question.id
                    .trim()
                    .toLowerCase() ===
                currentQuestion.id
                    .trim()
                    .toLowerCase()
            );

        }
    );

}


// ============================================================
// NAVIGATION TOOLBAR
// ============================================================

function initializeNavigation() {

    const toolbar =
        document.getElementById(
            "quiz-navigation-toolbar"
        );


    if (!toolbar) {

        return;

    }


    // Prevent duplicate initialization

    if (
        toolbar.dataset.initialized ===
        "true"
    ) {

        return;

    }


    toolbar.dataset.initialized =
        "true";


    toolbar.innerHTML = "";


    // ========================================================
    // PREVIOUS BUTTON
    // ========================================================

    const previousButton =
        document.createElement(
            "button"
        );


    previousButton.id =
        "previous-question-btn";


    previousButton.type =
        "button";


    previousButton.innerText =
        "← Previous Question";


    previousButton.addEventListener(
        "click",
        previousQuestion
    );


    // ========================================================
    // SCORE
    // ========================================================

    const score =
        document.createElement(
            "div"
        );


    score.id =
        "quiz-score";


    score.innerText =
        "Score: 0 / 0";


    // ========================================================
    // NEXT BUTTON
    // ========================================================

    const nextButton =
        document.createElement(
            "button"
        );


    nextButton.id =
        "next-question-btn";


    nextButton.type =
        "button";


    nextButton.innerText =
        "Next Question →";


    nextButton.addEventListener(
        "click",
        nextQuestion
    );


    toolbar.appendChild(
        previousButton
    );


    toolbar.appendChild(
        score
    );


    toolbar.appendChild(
        nextButton
    );


    updateNavigationButtons();

    updateScore();

}


// ============================================================
// PREVIOUS QUESTION
// ============================================================

function previousQuestion() {

    const currentIndex =
        getCurrentQuestionIndex();


    if (
        currentIndex <= 0
    ) {

        return;

    }


    const previous =
        questions[
            currentIndex - 1
        ];


    navigateToQuestion(
        previous
    );

}


// ============================================================
// NEXT QUESTION
// ============================================================

function nextQuestion() {

    const currentIndex =
        getCurrentQuestionIndex();


    if (
        currentIndex < 0
    ) {

        return;

    }


    if (
        currentIndex >=
        questions.length - 1
    ) {

        return;

    }


    const next =
        questions[
            currentIndex + 1
        ];


    navigateToQuestion(
        next
    );

}


// ============================================================
// NAVIGATE TO QUESTION
// ============================================================

function navigateToQuestion(
    question
) {

    if (!question) {

        return;

    }


    currentQuestion =
        question;


    // Update URL without reloading page

    const url =
        new URL(
            window.location.href
        );


    url.searchParams.set(
        "id",
        question.id
    );


    window.history.pushState(
        {
            questionId:
                question.id
        },
        "",
        url
    );


    displayQuestion();


    // Scroll to question

    const questionContainer =
        document.getElementById(
            "question-container"
        );


    if (questionContainer) {

        questionContainer.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

}


// ============================================================
// UPDATE NAVIGATION BUTTONS
// ============================================================

function updateNavigationButtons() {

    const currentIndex =
        getCurrentQuestionIndex();


    const previousButton =
        document.getElementById(
            "previous-question-btn"
        );


    const nextButton =
        document.getElementById(
            "next-question-btn"
        );


    if (
        !previousButton ||
        !nextButton
    ) {

        return;

    }


    // Disable previous on first question

    previousButton.disabled =
        currentIndex <= 0;


    // Disable next on last question

    nextButton.disabled =
        currentIndex < 0 ||
        currentIndex >=
        questions.length - 1;

}


// ============================================================
// RESET ANSWER STATE - VISUAL STATE ONLY
// ============================================================

function resetAnswerState() {

    const result =
        document.getElementById(
            "result"
        );


    if (result) {

        result.innerText = "";

        result.className = "";

    }


    const explanation =
        document.getElementById(
            "explanation"
        );


    if (explanation) {

        explanation
            .classList
            .add("hidden");

    }


    const explanationText =
        document.getElementById(
            "explanation-text"
        );


    if (explanationText) {

        explanationText.innerText =
            "";

    }


    const explanationButton =
        document.getElementById(
            "show-explanation-btn"
        );


    if (explanationButton) {

        explanationButton
            .classList
            .add("hidden");


        explanationButton.innerText =
            "💡 Show Explanation";

    }


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
        !explanation ||
        !button
    ) {

        return;

    }


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
// BROWSER BACK / FORWARD
// ============================================================

window.addEventListener(
    "popstate",
    () => {

        if (
            questions.length
        ) {

            loadQuestion();

        }

    }
);


// ============================================================
// START APPLICATION
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeNavigation();

        loadQuestions();

    }
);
