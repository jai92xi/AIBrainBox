/* ============================================================
   AIBrainBox
   ============================================================ */

let questions = [];
let currentQuestion = null;
let currentQuestionIndex = -1;


/* ============================================================
   SETTINGS
   ============================================================ */

const CSV_URL = "./xi-questions.csv";

const QUOTE_API_URL =
    "https://zenquotes.io/api/random";


/* ============================================================
   QUIZ STATE
   ============================================================ */

let score = 0;

let answeredQuestions = new Set();

let questionResults = new Map();


/* ============================================================
   FALLBACK QUOTES
   ============================================================ */

const FALLBACK_QUOTES = [

    {
        quote: "Success is built one difficult step at a time.",
        author: "AIBrainBox"
    },

    {
        quote: "Every question you answer makes you a little smarter.",
        author: "AIBrainBox"
    },

    {
        quote: "Do not be afraid of difficult questions. They are opportunities to grow.",
        author: "AIBrainBox"
    },

    {
        quote: "Small progress every day leads to remarkable results.",
        author: "AIBrainBox"
    },

    {
        quote: "Keep going. Your future self will thank you.",
        author: "AIBrainBox"
    },

    {
        quote: "Learning is not about being perfect. It is about getting better.",
        author: "AIBrainBox"
    },

    {
        quote: "Challenge yourself today so tomorrow becomes easier.",
        author: "AIBrainBox"
    },

    {
        quote: "Every mistake is another step toward understanding.",
        author: "AIBrainBox"
    },

    {
        quote: "Your effort today becomes your knowledge tomorrow.",
        author: "AIBrainBox"
    },

    {
        quote: "Keep asking questions. Curiosity is the beginning of learning.",
        author: "AIBrainBox"
    }

];

let lastQuoteIndex = -1;


/* ============================================================
   DOM READY
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);


/* ============================================================
   INITIALIZE
   ============================================================ */

function initializeApp() {

    const requiredElements = [

        "loading",
        "error",
        "question-container",
        "question",
        "options",
        "explanation",
        "explanation-text",
        "previous-question-btn",
        "next-question-btn",
        "question-position",
        "quote-text",
        "quote-author"

    ];


    const missingElements =
        requiredElements.filter(
            id => !document.getElementById(id)
        );


    if (
        missingElements.length > 0
    ) {

        console.error(
            "Missing HTML elements:",
            missingElements
        );

        return;
    }


    document
        .getElementById(
            "previous-question-btn"
        )
        .addEventListener(
            "click",
            goToPreviousQuestion
        );


    document
        .getElementById(
            "next-question-btn"
        )
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
}


/* ============================================================
   LOAD QUESTIONS
   ============================================================ */

async function loadQuestions() {

    const loading =
        document.getElementById(
            "loading"
        );

    const errorBox =
        document.getElementById(
            "error"
        );


    try {

        loading.classList.remove(
            "hidden"
        );

        errorBox.classList.add(
            "hidden"
        );


        console.log(
            "Loading:",
            CSV_URL
        );


        const response =
            await fetch(
                CSV_URL +
                "?v=" +
                Date.now(),
                {
                    cache: "no-store"
                }
            );


        if (
            !response.ok
        ) {

            throw new Error(
                "HTTP " +
                response.status +
                " " +
                response.statusText
            );
        }


        const csvText =
            await response.text();


        if (
            !csvText.trim()
        ) {

            throw new Error(
                "xi-questions.csv is empty."
            );
        }


        questions =
            parseCSV(
                csvText
            );


        if (
            questions.length === 0
        ) {

            throw new Error(
                "No questions were found in xi-questions.csv."
            );
        }


        console.log(
            "Questions loaded:",
            questions.length
        );


        loading.classList.add(
            "hidden"
        );


        loadQuestion();

    }

    catch (error) {

        console.error(
            "CSV loading error:",
            error
        );


        loading.classList.add(
            "hidden"
        );


        errorBox.classList.remove(
            "hidden"
        );


        errorBox.innerText =
            "Unable to load the question database.\n\n" +
            "Error: " +
            error.message +
            "\n\n" +
            "Make sure xi-questions.csv is in the same folder as index.html.";

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

            row.push(
                cell
            );

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


    if (
        rows.length === 0
    ) {

        return [];

    }


    const headers =
        rows[0].map(
            normalizeHeader
        );


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
                            (
                                row[index] ||
                                ""
                            ).trim();

                    }
                );


                return question;

            }
        )
        .filter(
            question =>
                Object.values(
                    question
                ).some(
                    value =>
                        value !== ""
                )
        );
}


/* ============================================================
   NORMALIZE HEADER
   ============================================================ */

function normalizeHeader(
    header
) {

    return header
        .replace(
            /^\uFEFF/,
            ""
        )
        .trim()
        .toLowerCase();
}


/* ============================================================
   LOAD CURRENT QUESTION
   ============================================================ */

function loadQuestion() {

    if (
        questions.length === 0
    ) {

        return;
    }


    const params =
        new URLSearchParams(
            window.location.search
        );


    let id =
        params.get(
            "id"
        );


    if (
        !id
    ) {

        if (
            questions[0] &&
            questions[0].id
        ) {

            id =
                questions[0].id;


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

        else {

            showError(
                "No question ID was provided."
            );

            return;
        }
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

        showError(
            "Question not found: " +
            id
        );

        return;
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


    const errorBox =
        document.getElementById(
            "error"
        );


    container.classList.remove(
        "hidden"
    );


    errorBox.classList.add(
        "hidden"
    );


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


    loadMotivationalQuote();


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* ============================================================
   CREATE OPTIONS
   ============================================================ */

function createOptions() {

    const optionsContainer =
        document.getElementById(
            "options"
        );


    optionsContainer.innerHTML =
        "";


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
                document.createElement(
                    "div"
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

            radio.id =
                "option-" +
                letter;


            const label =
                document.createElement(
                    "label"
                );


            label.htmlFor =
                "option-" +
                letter;


            const letterSpan =
                document.createElement(
                    "span"
                );


            letterSpan.className =
                "option-letter";


            letterSpan.innerText =
                letter;


            const textSpan =
                document.createElement(
                    "span"
                );


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

    if (
        !currentQuestion
    ) {

        return;
    }


    const questionId =
        currentQuestion.id;


    const userAnswer =
        selected.value
            .trim()
            .toUpperCase();


    const correctAnswer =
        (
            currentQuestion[
                "correct answer"
            ] ||
            ""
        )
            .trim()
            .toUpperCase();


    /*
     * If this question was already answered,
     * remove its old score before recalculating.
     */

    if (
        questionResults.has(
            questionId
        )
    ) {

        const previousResult =
            questionResults.get(
                questionId
            );


        if (
            previousResult === true
        ) {

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


    if (
        isCorrect
    ) {

        score++;

    }


    answeredQuestions.add(
        questionId
    );


    /*
     * Clear visual states.
     */

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


    selectedOption.classList.add(
        "selected"
    );


    /*
     * Correct answer.
     */

    if (
        isCorrect
    ) {

        selectedOption.classList.add(
            "correct-answer"
        );


        showCorrectCelebration();

    }

    /*
     * Wrong answer.
     */

    else {

        selectedOption.classList.add(
            "wrong-answer"
        );


        highlightCorrectAnswer(
            correctAnswer
        );


        showWrongReaction();

    }


    /*
     * IMPORTANT:
     *
     * Explanation does NOT automatically open.
     *
     * The button is created below the options.
     */

    createExplanationButton();


    updateScore();
}


/* ============================================================
   CREATE SHOW EXPLANATION BUTTON
   ============================================================ */

function createExplanationButton() {

    const existingButton =
        document.getElementById(
            "show-explanation-btn"
        );


    if (
        existingButton
    ) {

        existingButton.remove();

    }


    const explanation =
        document.getElementById(
            "explanation"
        );


    explanation.classList.add(
        "hidden"
    );


    const button =
        document.createElement(
            "button"
        );


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
        "11px 16px";


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
        "750";


    button.style.cursor =
        "pointer";


    button.style.transition =
        "all 0.15s ease";


    button.addEventListener(
        "mouseenter",
        () => {

            button.style.background =
                "#ede9fe";

        }
    );


    button.addEventListener(
        "mouseleave",
        () => {

            if (
                !button.classList.contains(
                    "active"
                )
            ) {

                button.style.background =
                    "#f5f3ff";

            }

        }
    );


    button.addEventListener(
        "click",
        () => {

            showExplanation();

            button.remove();

        }
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
   SHOW EXPLANATION
   ============================================================ */

function showExplanation() {

    const explanationBox =
        document.getElementById(
            "explanation"
        );


    const explanationText =
        document.getElementById(
            "explanation-text"
        );


    const explanation =
        currentQuestion[
            "explanation"
        ] ||
        currentQuestion[
            "explaination"
        ] ||
        "";


    explanationText.innerText =
        explanation.trim() ||
        "No explanation is available for this question.";


    explanationBox.classList.remove(
        "hidden"
    );
}


/* ============================================================
   RESTORE ANSWER STATE
   ============================================================ */

function restoreAnswerState() {

    const questionId =
        currentQuestion.id;


    const previousResult =
        questionResults.get(
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


    explanation.classList.add(
        "hidden"
    );


    explanationText.innerText =
        "";


    const oldButton =
        document.getElementById(
            "show-explanation-btn"
        );


    if (
        oldButton
    ) {

        oldButton.remove();

    }


    if (
        !answeredQuestions.has(
            questionId
        )
    ) {

        return;
    }


    const correctAnswer =
        (
            currentQuestion[
                "correct answer"
            ] ||
            ""
        )
            .trim()
            .toUpperCase();


    const radio =
        document.querySelector(
            'input[name="answer"][value="' +
            (
                previousResult
                    ? correctAnswer
                    : ""
            ) +
            '"]'
        );


    /*
     * We don't store the selected answer
     * separately in the original state.
     *
     * Therefore retrieve it from the
     * saved answer object when available.
     */

    const savedAnswer =
        getSavedAnswer(
            questionId
        );


    if (
        savedAnswer
    ) {

        const selectedRadio =
            document.querySelector(
                'input[name="answer"][value="' +
                savedAnswer +
                '"]'
            );


        if (
            selectedRadio
        ) {

            selectedRadio.checked =
                true;


            const option =
                selectedRadio.closest(
                    ".option"
                );


            if (
                option
            ) {

                if (
                    savedAnswer ===
                    correctAnswer
                ) {

                    option.classList.add(
                        "correct-answer"
                    );

                }

                else {

                    option.classList.add(
                        "wrong-answer"
                    );


                    highlightCorrectAnswer(
                        correctAnswer
                    );

                }

            }


            createExplanationButton();

        }

    }
}


/* ============================================================
   SAVED ANSWERS
   ============================================================ */

const savedAnswers =
    new Map();


function getSavedAnswer(
    questionId
) {

    return savedAnswers.get(
        questionId
    );
}


/*
 * Wrap original answer handling so the
 * selected answer is retained.
 */

const originalCheckAnswer =
    checkAnswer;


/*
 * Replace with state-saving version.
 */

checkAnswer = function(
    selected,
    selectedOption
) {

    savedAnswers.set(
        currentQuestion.id,
        selected.value
            .trim()
            .toUpperCase()
    );


    originalCheckAnswer(
        selected,
        selectedOption
    );
};


/* ============================================================
   HIGHLIGHT CORRECT ANSWER
   ============================================================ */

function highlightCorrectAnswer(
    correctAnswer
) {

    if (
        !correctAnswer
    ) {

        return;
    }


    const correctRadio =
        document.querySelector(
            'input[name="answer"][value="' +
            correctAnswer +
            '"]'
        );


    if (
        correctRadio
    ) {

        const correctOption =
            correctRadio.closest(
                ".option"
            );


        if (
            correctOption
        ) {

            correctOption.classList.add(
                "correct-answer"
            );

        }
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
        (
            currentQuestionIndex + 1
        ) +
        " of " +
        questions.length;


    updateScore();
}


/* ============================================================
   SCORE
   ============================================================ */

function updateScore() {

    let scoreDisplay =
        document.getElementById(
            "score-display"
        );


    /*
     * Create score display if it isn't
     * already present in index.html.
     */

    if (
        !scoreDisplay
    ) {

        scoreDisplay =
            document.createElement(
                "div"
            );


        scoreDisplay.id =
            "score-display";


        scoreDisplay.className =
            "score-display";


        const navigation =
            document.getElementById(
                "question-navigation"
            );


        const position =
            document.getElementById(
                "question-position"
            );


        navigation.insertBefore(
            scoreDisplay,
            position.nextSibling
        );

    }


    scoreDisplay.innerHTML =
        'Your current streak - <strong>' +
        score +
        '/' +
        currentQuestionIndexPlusOne() +
        '</strong>';
}


/* ============================================================
   CURRENT PROGRESS
   ============================================================ */

function currentQuestionIndexPlusOne() {

    return Math.max(
        0,
        Math.min(
            score,
            currentQuestionIndex + 1
        )
    );
}


/* ============================================================
   PREVIOUS
   ============================================================ */

function goToPreviousQuestion() {

    if (
        currentQuestionIndex <= 0
    ) {

        return;
    }


    const previousQuestion =
        questions[
            currentQuestionIndex - 1
        ];


    if (
        !previousQuestion ||
        !previousQuestion.id
    ) {

        return;
    }


    navigateToQuestion(
        previousQuestion.id
    );
}


/* ============================================================
   NEXT
   ============================================================ */

function goToNextQuestion() {

    if (
        currentQuestionIndex >=
        questions.length - 1
    ) {

        return;
    }


    const nextQuestion =
        questions[
            currentQuestionIndex + 1
        ];


    if (
        !nextQuestion ||
        !nextQuestion.id
    ) {

        return;
    }


    navigateToQuestion(
        nextQuestion.id
    );
}


/* ============================================================
   NAVIGATE
   ============================================================ */

function navigateToQuestion(
    questionId
) {

    const url =
        new URL(
            window.location.href
        );


    url.searchParams.set(
        "id",
        questionId
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

async function loadMotivationalQuote() {

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


    try {

        const response =
            await fetch(
                QUOTE_API_URL +
                "?t=" +
                Date.now(),
                {
                    cache: "no-store"
                }
            );


        if (
            !response.ok
        ) {

            throw new Error(
                "Quote API error"
            );
        }


        const data =
            await response.json();


        if (
            !Array.isArray(data) ||
            !data.length ||
            !data[0].q
        ) {

            throw new Error(
                "Invalid quote response"
            );
        }


        quoteText.innerText =
            "“" +
            data[0].q +
            "”";


        quoteAuthor.innerText =
            data[0].a
                ? "— " + data[0].a
                : "";

    }

    catch (error) {

        console.warn(
            "Using fallback quote:",
            error
        );


        showFallbackQuote();
    }
}


/* ============================================================
   FALLBACK QUOTE
   ============================================================ */

function showFallbackQuote() {

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


    let index =
        Math.floor(
            Math.random() *
            FALLBACK_QUOTES.length
        );


    if (
        FALLBACK_QUOTES.length > 1 &&
        index === lastQuoteIndex
    ) {

        index =
            (
                index + 1
            ) %
            FALLBACK_QUOTES.length;
    }


    lastQuoteIndex =
        index;


    const quote =
        FALLBACK_QUOTES[
            index
        ];


    quoteText.innerText =
        "“" +
        quote.quote +
        "”";


    quoteAuthor.innerText =
        "— " +
        quote.author;
}


/* ============================================================
   CORRECT REACTION
   ============================================================ */

function showCorrectCelebration() {

    createEmojiBurst(
        [
            "🎉",
            "👏",
            "🥳",
            "🎊",
            "✨",
            "🚀",
            "🧠",
            "💡",
            "⭐",
            "🔥"
        ],
        false
    );
}


/* ============================================================
   WRONG REACTION
   ============================================================ */

function showWrongReaction() {

    createEmojiBurst(
        [
            "😢",
            "😞",
            "🥺",
            "💔",
            "😔",
            "😕",
            "😭"
        ],
        true
    );
}


/* ============================================================
   EMOJI BURST
   ============================================================ */

function createEmojiBurst(
    emojis,
    isSad = false
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


    if (
        isSad
    ) {

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
                    Math.random() * 1.8
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

    }

    else if (
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

    const loading =
        document.getElementById(
            "loading"
        );


    const container =
        document.getElementById(
            "question-container"
        );


    const errorBox =
        document.getElementById(
            "error"
        );


    loading.classList.add(
        "hidden"
    );


    container.classList.add(
        "hidden"
    );


    errorBox.classList.remove(
        "hidden"
    );


    errorBox.innerText =
        message;
}
