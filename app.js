let questions = [];
let currentQuestionIndex = -1;
let currentQuestion = null;

const CSV_URL = "./xi-questions.csv";
const QUOTES_URL = "./xi-Quotes.csv";

let score = 0;
let answeredQuestions = new Set();
let questionResults = new Map();
let savedAnswers = new Map();

const FALLBACK_QUOTES = [
    {
        quote: "You do not rise to the level of your goals. You fall to the level of your systems.",
        author: "James Clear"
    },
    {
        quote: "The future depends on what you do today.",
        author: "Mahatma Gandhi"
    }
];

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

    document
        .getElementById("previous-question-btn")
        .addEventListener(
            "click",
            goToPreviousQuestion
        );

    document
        .getElementById("next-question-btn")
        .addEventListener(
            "click",
            goToNextQuestion
        );

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

        loading.classList.remove("hidden");
        errorBox.classList.add("hidden");

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
                "No questions were found in xi-questions.csv."
            );
        }

        console.log(
            "Questions loaded:",
            questions.length
        );

        loading.classList.add("hidden");

        loadQuestion();

    } catch (error) {

        console.error(
            "Question database error:",
            error
        );

        loading.classList.add("hidden");

        errorBox.classList.remove("hidden");

        errorBox.innerText =
            "Unable to load the question database.\n\n" +
            "Error: " +
            error.message +
            "\n\n" +
            "Please make sure xi-questions.csv exists in the same folder as index.html.";
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
                "HTTP " +
                response.status
            );
        }

        const csvText =
            await response.text();

        if (!csvText.trim()) {
            throw new Error(
                "xi-Quotes.csv is empty."
            );
        }

        quotes =
            parseQuotesCSV(csvText);

        console.log(
            "Quotes loaded:",
            quotes.length
        );

        if (
            quotes.length &&
            currentQuestion
        ) {
            loadMotivationalQuote();
        }

    } catch (error) {

        console.warn(
            "Quote database could not be loaded. Using fallback quotes.",
            error
        );

        quotes =
            FALLBACK_QUOTES;

        if (currentQuestion) {
            loadMotivationalQuote();
        }
    }
}


/* ============================================================
   PARSE QUOTES CSV
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

    const quoteColumn =
        headers.findIndex(
            header =>
                header === "quote"
        );

    const authorColumn =
        headers.findIndex(
            header =>
                header === "author"
        );

    /*
     * If the CSV has two columns but no
     * recognizable headers, use column 1
     * as quote and column 2 as author.
     */

    return rows
        .slice(
            quoteColumn === -1 &&
            authorColumn === -1
                ? 0
                : 1
        )
        .map(row => {

            let quote = "";
            let author = "";

            if (
                quoteColumn !== -1
            ) {
                quote =
                    (
                        row[quoteColumn] ||
                        ""
                    ).trim();
            }

            if (
                authorColumn !== -1
            ) {
                author =
                    (
                        row[authorColumn] ||
                        ""
                    ).trim();
            }

            if (
                quoteColumn === -1 &&
                authorColumn === -1
            ) {
                quote =
                    (
                        row[0] ||
                        ""
                    ).trim();

                author =
                    (
                        row[1] ||
                        ""
                    ).trim();
            }

            return {
                quote,
                author
            };
        })
        .filter(item =>
            item.quote !== "" ||
            item.author !== ""
        );
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
        .filter(question =>
            Object.values(question).some(
                value =>
                    value !== ""
            )
        );
}


/* ============================================================
   NORMALIZE CSV HEADER
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

        if (
            firstQuestion &&
            firstQuestion.id
        ) {

            id =
                firstQuestion.id;

        } else {

            id = "1";
        }

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
                )
                    .trim()
                    .toLowerCase() ===
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

    document
        .getElementById(
            "question-container"
        )
        .classList.remove("hidden");

    document
        .getElementById(
            "error"
        )
        .classList.add("hidden");

    document
        .getElementById(
            "question"
        )
        .innerText =
            currentQuestion.question ||
            "Question unavailable.";

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

    optionsContainer.innerHTML = "";

    const letters = [
        "A",
        "B",
        "C",
        "D"
    ];

    letters.forEach(letter => {

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
            "option-" + letter;

        const label =
            document.createElement("label");

        label.htmlFor =
            "option-" + letter;

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
    });

    createInfoButtons();
}


/* ============================================================
   ABOUT ME / BUY ME A COFFEE
   ============================================================ */

function createInfoButtons() {

    const optionsPanel =
        document.querySelector(
            ".options-panel"
        );

    if (!optionsPanel) {
        return;
    }

    const existing =
        document.getElementById(
            "info-buttons"
        );

    if (existing) {
        existing.remove();
    }

    const buttonContainer =
        document.createElement("div");

    buttonContainer.id =
        "info-buttons";

    buttonContainer.style.display =
        "flex";

    buttonContainer.style.gap =
        "10px";

    buttonContainer.style.marginTop =
        "20px";

    buttonContainer.style.paddingTop =
        "15px";

    buttonContainer.style.borderTop =
        "1px solid #e2e8f0";

    const aboutButton =
        document.createElement("button");

    aboutButton.type =
        "button";

    aboutButton.innerText =
        "👋 About Me";

    aboutButton.style.flex =
        "1";

    aboutButton.style.padding =
        "10px 12px";

    aboutButton.style.border =
        "1px solid #c7d2fe";

    aboutButton.style.borderRadius =
        "10px";

    aboutButton.style.background =
        "#f5f3ff";

    aboutButton.style.color =
        "#4f46e5";

    aboutButton.style.fontSize =
        "12px";

    aboutButton.style.fontWeight =
        "700";

    aboutButton.style.cursor =
        "pointer";

    aboutButton.addEventListener(
        "click",
        () => {

            /*
             * Replace this URL with your
             * About Me page when ready.
             */

            window.open(
                "about.html",
                "_blank"
            );
        }
    );

    const coffeeButton =
        document.createElement("button");

    coffeeButton.type =
        "button";

    coffeeButton.innerText =
        "☕ Buy Me a Coffee";

    coffeeButton.style.flex =
        "1";

    coffeeButton.style.padding =
        "10px 12px";

    coffeeButton.style.border =
        "1px solid #f5c2c7";

    coffeeButton.style.borderRadius =
        "10px";

    coffeeButton.style.background =
        "#fff7ed";

    coffeeButton.style.color =
        "#c2410c";

    coffeeButton.style.fontSize =
        "12px";

    coffeeButton.style.fontWeight =
        "700";

    coffeeButton.style.cursor =
        "pointer";

    coffeeButton.addEventListener(
        "click",
        () => {

            /*
             * Replace this URL with your
             * Buy Me a Coffee page.
             */

            window.open(
                "https://www.buymeacoffee.com/",
                "_blank"
            );
        }
    );

    buttonContainer.appendChild(
        aboutButton
    );

    buttonContainer.appendChild(
        coffeeButton
    );

    optionsPanel.appendChild(
        buttonContainer
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

    if (
        questionResults.has(
            questionId
        )
    ) {

        const previousResult =
            questionResults.get(
                questionId
            );

        if (previousResult === true) {
            score--;
        }
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

    clearOptionStates();

    selectedOption.classList.add(
        isCorrect
            ? "correct-answer"
            : "wrong-answer"
    );

    if (!isCorrect) {

        highlightCorrectAnswer(
            correctAnswer
        );
    }

    if (isCorrect) {

        score++;

        showCorrectCelebration();

        document
            .getElementById("result")
            .innerText =
            "Correct! 🎉";

        document
            .getElementById("result")
            .style.color =
            "#16a34a";

    } else {

        showWrongReaction();

        document
            .getElementById("result")
            .innerText =
            "Not quite. Keep learning!";

        document
            .getElementById("result")
            .style.color =
            "#dc2626";
    }

    createExplanationButton();

    updateScore();
}


/* ============================================================
   CLEAR OPTION STATES
   ============================================================ */

function clearOptionStates() {

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


/* ============================================================
   CREATE EXPLANATION BUTTON
   ============================================================ */

function createExplanationButton() {

    const oldButton =
        document.getElementById(
            "show-explanation-btn"
        );

    if (oldButton) {
        oldButton.remove();
    }

    const explanation =
        document.getElementById(
            "explanation"
        );

    explanation.classList.add(
        "hidden"
    );

    const button =
        document.createElement("button");

    button.id =
        "show-explanation-btn";

    button.type =
        "button";

    button.innerText =
        "💡 Show Explanation";

    button.style.display =
        "block";

    button.style.width =
        "100%";

    button.style.marginTop =
        "14px";

    button.style.padding =
        "10px 15px";

    button.style.border =
        "1px solid #c7d2fe";

    button.style.borderRadius =
        "10px";

    button.style.background =
        "#f5f3ff";

    button.style.color =
        "#4f46e5";

    button.style.fontSize =
        "13px";

    button.style.fontWeight =
        "700";

    button.style.cursor =
        "pointer";

    button.addEventListener(
        "click",
        showExplanation
    );

    const optionsContainer =
        document.getElementById(
            "options"
        );

    optionsContainer.parentNode.insertBefore(
        button,
        explanation
    );
}


/* ============================================================
   SHOW / HIDE EXPLANATION
   ============================================================ */

function showExplanation() {

    const button =
        document.getElementById(
            "show-explanation-btn"
        );

    const explanation =
        document.getElementById(
            "explanation"
        );

    const explanationText =
        document.getElementById(
            "explanation-text"
        );

    const text =
        currentQuestion.explanation ||
        currentQuestion.explaination ||
        "No explanation is available for this question.";

    explanationText.innerText =
        text.trim();

    explanation.classList.remove(
        "hidden"
    );

    if (button) {

        button.innerText =
            "🙈 Hide Explanation";

        button.onclick =
            hideExplanation;
    }
}


function hideExplanation() {

    const button =
        document.getElementById(
            "show-explanation-btn"
        );

    const explanation =
        document.getElementById(
            "explanation"
        );

    explanation.classList.add(
        "hidden"
    );

    if (button) {

        button.innerText =
            "💡 Show Explanation";

        button.onclick =
            showExplanation;
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

    explanation.classList.add(
        "hidden"
    );

    explanationText.innerText = "";

    result.innerText = "";

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

        option.classList.add(
            "correct-answer"
        );

        result.innerText =
            "Correct! 🎉";

        result.style.color =
            "#16a34a";

    } else {

        option.classList.add(
            "wrong-answer"
        );

        highlightCorrectAnswer(
            correctAnswer
        );

        result.innerText =
            "Not quite. Keep learning!";

        result.style.color =
            "#dc2626";
    }

    createExplanationButton();
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

    const position =
        document.getElementById(
            "question-position"
        );

    previousButton.disabled =
        currentQuestionIndex <= 0;

    nextButton.disabled =
        currentQuestionIndex >=
        questions.length - 1;

    position.innerText =
        "Question " +
        (currentQuestionIndex + 1) +
        " of " +
        questions.length;
}


/* ============================================================
   SCORE
   ============================================================ */

function updateScore() {

    const scoreDisplay =
        document.getElementById(
            "score-display"
        );

    if (!scoreDisplay) {
        return;
    }

    const answeredCount =
        answeredQuestions.size;

    scoreDisplay.innerHTML =
        "Your current streak - " +
        "<strong>" +
        score +
        "/" +
        answeredCount +
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

    const question =
        questions[
            currentQuestionIndex - 1
        ];

    navigateToQuestion(
        question
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

    const question =
        questions[
            currentQuestionIndex + 1
        ];

    navigateToQuestion(
        question
    );
}


/* ============================================================
   NAVIGATE TO QUESTION
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
        !quoteAuthor
    ) {
        return;
    }

    const quoteList =
        quotes.length
            ? quotes
            : FALLBACK_QUOTES;

    if (!quoteList.length) {
        return;
    }

    let index =
        Math.floor(
            Math.random() *
            quoteList.length
        );

    if (
        quoteList.length > 1 &&
        index === lastQuoteIndex
    ) {

        index =
            (
                index + 1
            ) %
            quoteList.length;
    }

    lastQuoteIndex =
        index;

    const quote =
        quoteList[index];

    quoteText.innerText =
        quote.quote
            ? "“" +
              quote.quote +
              "”"
            : "";

    quoteAuthor.innerText =
        quote.author
            ? "— " +
              quote.author
            : "";
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
        currentQuestion["correct_answer"] ||
        currentQuestion.answer ||
        currentQuestion.correct ||
        ""
    )
        .trim()
        .toUpperCase();
}


/* ============================================================
   CORRECT ANSWER CELEBRATION
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
        "🔥"
    ]);
}


/* ============================================================
   WRONG ANSWER REACTION
   ============================================================ */

function showWrongReaction() {

    createEmojiBurst([
        "😢",
        "😞",
        "🥺",
        "💔",
        "😔"
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
                ) +
                "%"
            );

            element.style.setProperty(
                "--delay",
                (
                    Math.random() * 0.3
                ) +
                "s"
            );

            element.style.setProperty(
                "--duration",
                (
                    2 +
                    Math.random() * 1.4
                ) +
                "s"
            );

            element.style.setProperty(
                "--rotation",
                (
                    -40 +
                    Math.random() * 80
                ) +
                "deg"
            );

            element.style.setProperty(
                "--horizontal",
                (
                    -120 +
                    Math.random() * 240
                ) +
                "px"
            );

            element.style.setProperty(
                "--emoji-size",
                (
                    1.7 +
                    Math.random() * 1.5
                ) +
                "rem"
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


/* ============================================================
   ERROR
   ============================================================ */

function showError(
    message
) {

    document
        .getElementById(
            "loading"
        )
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
