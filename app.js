let questions = [];
let currentQuestionIndex = -1;
let currentQuestion = null;

const CSV_URL = "./xi-questions.csv";
const QUOTES_URL = "./xi-Quotes.csv";

let score = 0;
let currentStreak = 0;

let answeredQuestions = new Set();
let questionResults = new Map();
let savedAnswers = new Map();

let quotes = [];
let lastQuoteIndex = -1;


/* ============================================================
   START
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);


/* ============================================================
   INITIALIZE
   ============================================================ */

function initializeApp() {

    const previousButton =
        document.getElementById(
            "previous-question-btn"
        );

    const nextButton =
        document.getElementById(
            "next-question-btn"
        );


    if (previousButton) {

        previousButton.addEventListener(
            "click",
            goToPreviousQuestion
        );

    }


    if (nextButton) {

        nextButton.addEventListener(
            "click",
            goToNextQuestion
        );

    }


    window.addEventListener(
        "popstate",
        loadQuestion
    );


    document.addEventListener(
        "keydown",
        handleKeyboardNavigation
    );


    loadQuestions();
    loadQuotes();

}


/* ============================================================
   LOAD QUESTIONS
   ============================================================ */

async function loadQuestions() {

    const loading =
        document.getElementById("loading");

    const errorBox =
        document.getElementById("error");


    try {

        if (loading) {
            loading.classList.remove("hidden");
        }

        if (errorBox) {
            errorBox.classList.add("hidden");
        }


        const response =
            await fetch(
                CSV_URL + "?v=" + Date.now(),
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "HTTP " +
                response.status +
                " - " +
                response.statusText
            );

        }


        const csvText =
            await response.text();


        if (!csvText.trim()) {

            throw new Error(
                "xi-questions.csv is empty."
            );

        }


        questions =
            parseCSV(csvText);


        if (!questions.length) {

            throw new Error(
                "No questions were found."
            );

        }


        if (loading) {
            loading.classList.add("hidden");
        }


        loadQuestion();


    } catch (error) {

        console.error(
            "Question loading error:",
            error
        );


        if (loading) {
            loading.classList.add("hidden");
        }


        if (errorBox) {

            errorBox.classList.remove("hidden");

            errorBox.innerText =
                "Unable to load questions.\n\n" +
                error.message;

        }

    }

}


/* ============================================================
   LOAD QUOTES
   ============================================================ */

async function loadQuotes() {

    try {

        const response =
            await fetch(
                QUOTES_URL + "?v=" + Date.now(),
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {
            throw new Error(
                "Unable to load quotes."
            );
        }


        const csvText =
            await response.text();


        quotes =
            parseQuotesCSV(csvText);


        if (quotes.length) {
            loadMotivationalQuote();
        }


    } catch (error) {

        console.error(
            "Quote loading error:",
            error
        );


        quotes = [

            {
                quote:
                    "The important thing is not to stop questioning.",
                author:
                    "Albert Einstein"
            },

            {
                quote:
                    "The future depends on what you do today.",
                author:
                    "Mahatma Gandhi"
            },

            {
                quote:
                    "Great things are done by a series of small things brought together.",
                author:
                    "Vincent van Gogh"
            }

        ];


        loadMotivationalQuote();

    }

}


/* ============================================================
   CSV PARSER
   ============================================================ */

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

        const char = text[i];
        const nextChar = text[i + 1];


        if (
            char === '"' &&
            insideQuotes &&
            nextChar === '"'
        ) {

            cell += '"';
            i++;

        } else if (
            char === '"'
        ) {

            insideQuotes =
                !insideQuotes;

        } else if (
            char === "," &&
            !insideQuotes
        ) {

            row.push(cell);
            cell = "";

        } else if (
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

        } else {

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


    if (!rows.length) {
        return [];
    }


    const headers =
        rows[0].map(
            normalizeHeader
        );


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

        })
        .filter(
            question =>
                Object.values(question)
                    .some(
                        value =>
                            value !== ""
                    )
        );

}


/* ============================================================
   QUOTE CSV PARSER
   ============================================================ */

function parseQuotesCSV(text) {

    const rows = [];

    let row = [];
    let cell = "";
    let insideQuotes = false;


    for (
        let i = 0;
        i < text.length;
        i++
    ) {

        const char = text[i];
        const nextChar = text[i + 1];


        if (
            char === '"' &&
            insideQuotes &&
            nextChar === '"'
        ) {

            cell += '"';
            i++;

        } else if (
            char === '"'
        ) {

            insideQuotes =
                !insideQuotes;

        } else if (
            char === "," &&
            !insideQuotes
        ) {

            row.push(cell);
            cell = "";

        } else if (
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

        } else {

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


    if (!rows.length) {
        return [];
    }


    const headers =
        rows[0].map(
            normalizeHeader
        );


    const quoteIndex =
        headers.findIndex(
            header =>
                header === "quote"
        );


    const authorIndex =
        headers.findIndex(
            header =>
                header === "author"
        );


    const result = [];


    rows.slice(1).forEach(
        row => {

            if (quoteIndex !== -1) {

                const quote =
                    (
                        row[quoteIndex] ||
                        ""
                    ).trim();


                const author =
                    authorIndex !== -1
                        ? (
                            row[authorIndex] ||
                            ""
                        ).trim()
                        : "";


                if (quote) {

                    result.push({
                        quote,
                        author
                    });

                }

            } else {

                row.forEach(
                    value => {

                        const quote =
                            value.trim();


                        if (quote) {

                            result.push({
                                quote,
                                author: ""
                            });

                        }

                    }
                );

            }

        }
    );


    return result;

}


/* ============================================================
   NORMALIZE HEADER
   ============================================================ */

function normalizeHeader(header) {

    return header
        .replace(/^\uFEFF/, "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");

}


/* ============================================================
   LOAD QUESTION
   ============================================================ */

function loadQuestion() {

    if (!questions.length) {
        return;
    }


    const params =
        new URLSearchParams(
            window.location.search
        );


    let id =
        params.get("id");


    if (!id) {

        const firstQuestion =
            questions[0];


        id =
            firstQuestion.id ||
            "1";


        const url =
            new URL(
                window.location.href
            );


        url.searchParams.set(
            "id",
            id
        );


        window.history.replaceState(
            {},
            "",
            url
        );

    }


    currentQuestionIndex =
        questions.findIndex(
            question =>
                String(
                    question.id || ""
                ).trim().toLowerCase() ===
                String(id)
                    .trim()
                    .toLowerCase()
        );


    if (
        currentQuestionIndex === -1
    ) {

        currentQuestionIndex = 0;

    }


    currentQuestion =
        questions[
            currentQuestionIndex
        ];


    displayQuestion();

}


/* ============================================================
   DISPLAY QUESTION
   ============================================================ */

function displayQuestion() {

    const container =
        document.getElementById(
            "question-container"
        );


    const questionElement =
        document.getElementById(
            "question"
        );


    if (container) {
        container.classList.remove("hidden");
    }


    if (questionElement) {

        questionElement.innerText =
            currentQuestion.question ||
            "Question unavailable.";

    }


    createOptions();

    restoreAnswerState();

    updateNavigation();

    updateScore();

    loadMotivationalQuote();

}


/* ============================================================
   CREATE OPTIONS
   ============================================================ */

function createOptions() {

    const optionsContainer =
        document.getElementById(
            "options"
        );


    if (!optionsContainer) {
        return;
    }


    optionsContainer.innerHTML = "";


    const letters = [
        "A",
        "B",
        "C",
        "D"
    ];


    letters.forEach(
        letter => {

            const optionText =
                currentQuestion[
                    letter.toLowerCase()
                ];


            if (
                !optionText ||
                !optionText.trim()
            ) {

                return;

            }


            const option =
                document.createElement("div");


            option.className =
                "option";


            const radio =
                document.createElement("input");


            radio.type = "radio";
            radio.name = "answer";
            radio.value = letter;

            radio.id =
                "option-" +
                letter;


            const label =
                document.createElement("label");


            label.htmlFor =
                "option-" +
                letter;


            const letterSpan =
                document.createElement("span");


            letterSpan.className =
                "option-letter";


            letterSpan.innerText =
                letter;


            const textSpan =
                document.createElement("span");


            textSpan.className =
                "option-text";


            textSpan.innerText =
                optionText;


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

}


/* ============================================================
   CHECK ANSWER
   ============================================================ */

function checkAnswer(
    selected,
    selectedOption
) {

    const questionId =
        getQuestionId();


    const userAnswer =
        selected.value
            .trim()
            .toUpperCase();


    const correctAnswer =
        getCorrectAnswer();


    const previousResult =
        questionResults.get(
            questionId
        );


    /*
     * If this question was already answered,
     * remove its old score contribution.
     */

    if (
        previousResult === true
    ) {

        score--;

    }


    const isCorrect =
        userAnswer ===
        correctAnswer;


    questionResults.set(
        questionId,
        isCorrect
    );


    savedAnswers.set(
        questionId,
        userAnswer
    );


    answeredQuestions.add(
        questionId
    );


    /*
     * CURRENT STREAK
     *
     * Correct answer:
     *      streak + 1
     *
     * Wrong answer:
     *      streak = 0
     */

    if (isCorrect) {

        /*
         * Only increase streak if this is
         * a new correct answer.
         *
         * Changing an already-correct answer
         * should not keep increasing the streak.
         */

        if (previousResult !== true) {

            currentStreak++;

        }

    } else {

        currentStreak = 0;

    }


    clearOptionStates();


    if (isCorrect) {

        selectedOption.classList.add(
            "correct-answer"
        );


        showCorrectCelebration();


    } else {

        selectedOption.classList.add(
            "wrong-answer"
        );


        highlightCorrectAnswer(
            correctAnswer
        );


        showWrongReaction();

    }


    const result =
        document.getElementById(
            "result"
        );


    if (result) {

        if (isCorrect) {

            result.innerText =
                "Correct! 🎉";

            result.style.color =
                "#16a34a";

        } else {

            result.innerText =
                "Not quite. Keep learning!";

            result.style.color =
                "#dc2626";

        }

    }


    /*
     * Automatically open explanation.
     */

    showExplanation();


    updateScore();

}


/* ============================================================
   CLEAR OPTION STATES
   ============================================================ */

function clearOptionStates() {

    document
        .querySelectorAll(".option")
        .forEach(
            option => {

                option.classList.remove(
                    "correct-answer",
                    "wrong-answer"
                );

            }
        );

}


/* ============================================================
   SHOW EXPLANATION
   ============================================================ */

function showExplanation() {

    const explanation =
        document.getElementById(
            "explanation"
        );


    const explanationText =
        document.getElementById(
            "explanation-text"
        );


    if (
        !explanation ||
        !explanationText ||
        !currentQuestion
    ) {

        return;

    }


    const text =
        currentQuestion.explanation ||
        currentQuestion.explaination ||
        "No explanation is available for this question.";


    explanationText.innerText =
        text.trim();


    explanation.classList.remove(
        "hidden"
    );


    /*
     * Do not force the entire page
     * to scroll.
     *
     * The CSS is designed so the
     * explanation fits inside the
     * viewport on desktop.
     */

}


/* ============================================================
   HIDE EXPLANATION
   ============================================================ */

function hideExplanation() {

    const explanation =
        document.getElementById(
            "explanation"
        );


    if (explanation) {

        explanation.classList.add(
            "hidden"
        );

    }

}


/* ============================================================
   RESTORE ANSWER
   ============================================================ */

function restoreAnswerState() {

    const questionId =
        getQuestionId();


    const savedAnswer =
        savedAnswers.get(
            questionId
        );


    const explanation =
        document.getElementById(
            "explanation"
        );


    const explanationText =
        document.getElementById(
            "explanation-text"
        );


    const result =
        document.getElementById(
            "result"
        );


    if (explanation) {
        explanation.classList.add("hidden");
    }


    if (explanationText) {
        explanationText.innerText = "";
    }


    if (result) {
        result.innerText = "";
    }


    const oldButton =
        document.getElementById(
            "show-explanation-btn"
        );


    if (oldButton) {
        oldButton.remove();
    }


    if (!savedAnswer) {
        return;
    }


    const radio =
        document.querySelector(
            'input[name="answer"][value="' +
            savedAnswer +
            '"]'
        );


    if (!radio) {
        return;
    }


    radio.checked = true;


    const option =
        radio.closest(".option");


    const correctAnswer =
        getCorrectAnswer();


    if (
        savedAnswer ===
        correctAnswer
    ) {

        if (option) {

            option.classList.add(
                "correct-answer"
            );

        }


        if (result) {

            result.innerText =
                "Correct! 🎉";

            result.style.color =
                "#16a34a";

        }

    } else {

        if (option) {

            option.classList.add(
                "wrong-answer"
            );

        }


        highlightCorrectAnswer(
            correctAnswer
        );


        if (result) {

            result.innerText =
                "Not quite. Keep learning!";

            result.style.color =
                "#dc2626";

        }

    }


    /*
     * Restore explanation automatically.
     */

    showExplanation();

}


/* ============================================================
   HIGHLIGHT CORRECT ANSWER
   ============================================================ */

function highlightCorrectAnswer(
    correctAnswer
) {

    const radio =
        document.querySelector(
            'input[name="answer"][value="' +
            correctAnswer +
            '"]'
        );


    if (!radio) {
        return;
    }


    const option =
        radio.closest(".option");


    if (option) {

        option.classList.add(
            "correct-answer"
        );

    }

}


/* ============================================================
   NAVIGATION
   ============================================================ */

function updateNavigation() {

    const previousButton =
        document.getElementById(
            "previous-question-btn"
        );


    const nextButton =
        document.getElementById(
            "next-question-btn"
        );


    if (previousButton) {

        previousButton.disabled =
            currentQuestionIndex <= 0;

    }


    if (nextButton) {

        nextButton.disabled =
            currentQuestionIndex >=
            questions.length - 1;

    }

}


/* ============================================================
   SCORE / CURRENT STREAK
   ============================================================ */

function updateScore() {

    const scoreDisplay =
        document.getElementById(
            "score-display"
        );


    if (!scoreDisplay) {
        return;
    }


    scoreDisplay.innerHTML =
        "🔥 Current streak: " +
        "<strong>" +
        currentStreak +
        "</strong>";

}


/* ============================================================
   PREVIOUS QUESTION
   ============================================================ */

function goToPreviousQuestion() {

    if (
        currentQuestionIndex <= 0
    ) {

        return;

    }


    navigateToQuestion(
        questions[
            currentQuestionIndex - 1
        ]
    );

}


/* ============================================================
   NEXT QUESTION
   ============================================================ */

function goToNextQuestion() {

    if (
        currentQuestionIndex >=
        questions.length - 1
    ) {

        return;

    }


    navigateToQuestion(
        questions[
            currentQuestionIndex + 1
        ]
    );

}


/* ============================================================
   NAVIGATE
   ============================================================ */

function navigateToQuestion(
    question
) {

    if (
        !question ||
        !question.id
    ) {

        return;

    }


    const url =
        new URL(
            window.location.href
        );


    url.searchParams.set(
        "id",
        question.id
    );


    window.history.pushState(
        {},
        "",
        url
    );


    loadQuestion();

}


/* ============================================================
   MOTIVATIONAL QUOTE
   ============================================================ */

function loadMotivationalQuote() {

    const quoteText =
        document.getElementById(
            "quote-text"
        );


    const quoteAuthor =
        document.getElementById(
            "quote-author"
        );


    if (
        !quoteText ||
        !quoteAuthor ||
        !quotes.length
    ) {

        return;

    }


    let index =
        Math.floor(
            Math.random() *
            quotes.length
        );


    if (
        quotes.length > 1 &&
        index === lastQuoteIndex
    ) {

        index =
            (index + 1) %
            quotes.length;

    }


    lastQuoteIndex =
        index;


    const quote =
        quotes[index];


    quoteText.innerText =
        "“" +
        quote.quote +
        "”";


    if (
        quote.author &&
        quote.author.trim()
    ) {

        quoteAuthor.innerText =
            "— " +
            quote.author.trim();

        quoteAuthor.style.display =
            "block";

    } else {

        quoteAuthor.innerText =
            "";

        quoteAuthor.style.display =
            "none";

    }

}


/* ============================================================
   QUESTION ID
   ============================================================ */

function getQuestionId() {

    return String(
        currentQuestion.id
    );

}


/* ============================================================
   CORRECT ANSWER
   ============================================================ */

function getCorrectAnswer() {

    return (
        currentQuestion["correct answer"] ||
        currentQuestion.correct_answer ||
        currentQuestion.answer ||
        currentQuestion.correct ||
        ""
    )
        .trim()
        .toUpperCase();

}


/* ============================================================
   CORRECT CELEBRATION
   ============================================================ */

function showCorrectCelebration() {

    createEmojiBurst([
        "🎉",
        "👏",
        "🥳",
        "✨",
        "🚀",
        "🧠",
        "💡",
        "⭐",
        "🔥",
        "🤯",
        "⚡"
    ]);

}


/* ============================================================
   WRONG REACTION
   ============================================================ */

function showWrongReaction() {

    createEmojiBurst([
        "😅",
        "🤔",
        "🫠",
        "😵",
        "💭"
    ]);

}


/* ============================================================
   EMOJI BURST
   ============================================================ */

function createEmojiBurst(
    emojis
) {

    document
        .querySelectorAll(
            ".reaction-container"
        )
        .forEach(
            element =>
                element.remove()
        );


    const container =
        document.createElement(
            "div"
        );


    container.className =
        "reaction-container";


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


            element.style.setProperty(
                "--start-left",
                (
                    5 +
                    Math.random() * 90
                ) + "%"
            );


            element.style.setProperty(
                "--delay",
                (
                    Math.random() * 0.3
                ) + "s"
            );


            element.style.setProperty(
                "--duration",
                (
                    2 +
                    Math.random() * 1.4
                ) + "s"
            );


            element.style.setProperty(
                "--rotation",
                (
                    -40 +
                    Math.random() * 80
                ) + "deg"
            );


            element.style.setProperty(
                "--horizontal",
                (
                    -120 +
                    Math.random() * 240
                ) + "px"
            );


            element.style.setProperty(
                "--emoji-size",
                (
                    1.7 +
                    Math.random() * 1.5
                ) + "rem"
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


/* ============================================================
   KEYBOARD NAVIGATION
   ============================================================ */

function handleKeyboardNavigation(
    event
) {

    const activeElement =
        document.activeElement;


    if (
        activeElement &&
        (
            activeElement.tagName === "INPUT" ||
            activeElement.tagName === "TEXTAREA" ||
            activeElement.tagName === "BUTTON"
        )
    ) {

        return;

    }


    if (
        event.key === "ArrowLeft"
    ) {

        goToPreviousQuestion();

    } else if (
        event.key === "ArrowRight"
    ) {

        goToNextQuestion();

    }

}
