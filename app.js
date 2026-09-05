/* ============================================================
   AIBrainBox
   Complete Quiz Application
   ============================================================ */


/* ============================================================
   GLOBAL STATE
   ============================================================ */

let questions = [];

let currentQuestion = null;

let currentQuestionIndex = -1;


/* ============================================================
   CSV LOCATION
   ============================================================ */

/*
 * IMPORTANT:
 *
 * xi-questions.csv is in the same folder as index.html.
 *
 * Therefore use a relative path.
 */

const CSV_URL = "./xi-questions.csv";


/* ============================================================
   MOTIVATIONAL QUOTE API
   ============================================================ */

const QUOTE_API_URL =
    "https://zenquotes.io/api/random";


/* ============================================================
   FALLBACK MOTIVATIONAL QUOTES
   ============================================================ */

const FALLBACK_QUOTES = [

    {
        quote:
            "Success is built one difficult step at a time.",
        author:
            "AIBrainBox"
    },

    {
        quote:
            "The more you learn, the more you realize how much is possible.",
        author:
            "AIBrainBox"
    },

    {
        quote:
            "Every question you answer makes you a little smarter.",
        author:
            "AIBrainBox"
    },

    {
        quote:
            "Do not be afraid of difficult questions. They are opportunities to grow.",
        author:
            "AIBrainBox"
    },

    {
        quote:
            "Small progress every day leads to remarkable results.",
        author:
            "AIBrainBox"
    },

    {
        quote:
            "Keep going. Your future self will thank you.",
        author:
            "AIBrainBox"
    },

    {
        quote:
            "Learning is not about being perfect. It is about getting better.",
        author:
            "AIBrainBox"
    },

    {
        quote:
            "Challenge yourself today so tomorrow becomes easier.",
        author:
            "AIBrainBox"
    },

    {
        quote:
            "Every mistake is another step toward understanding.",
        author:
            "AIBrainBox"
    },

    {
        quote:
            "Your effort today becomes your knowledge tomorrow.",
        author:
            "AIBrainBox"
    },

    {
        quote:
            "Keep asking questions. Curiosity is the beginning of learning.",
        author:
            "AIBrainBox"
    },

    {
        quote:
            "You do not have to know everything. You just have to keep learning.",
        author:
            "AIBrainBox"
    }

];


/*
 * Used to avoid showing the same fallback quote twice
 * consecutively.
 */

let lastQuoteIndex = -1;


/* ============================================================
   DOM READY
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeApp();

    }
);


/* ============================================================
   INITIALIZE APPLICATION
   ============================================================ */

function initializeApp() {

    /*
     * Make sure required elements exist.
     */

    const requiredElements = [

        "loading",
        "error",
        "question-container",
        "question",
        "options",
        "result",
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
            id =>
                !document.getElementById(id)
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


    /*
     * Navigation button events.
     */

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


    /*
     * Browser back/forward.
     */

    window.addEventListener(
        "popstate",
        () => {

            if (
                questions.length > 0
            ) {

                loadQuestion();

            }

        }
    );


    /*
     * Load CSV.
     */

    loadQuestions();

}


/* ============================================================
   LOAD QUESTIONS FROM CSV
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

        /*
         * Make sure loading is visible.
         */

        loading.classList.remove(
            "hidden"
        );


        errorBox.classList.add(
            "hidden"
        );


        console.log(
            "===================================="
        );

        console.log(
            "AIBrainBox: Loading CSV"
        );

        console.log(
            "CSV URL:",
            CSV_URL
        );


        /*
         * Fetch local CSV.
         */

        const response =
            await fetch(
                CSV_URL +
                "?v=" +
                Date.now(),
                {
                    cache:
                        "no-store"
                }
            );


        console.log(
            "CSV HTTP status:",
            response.status
        );


        /*
         * Check HTTP response.
         */

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


        /*
         * Read CSV text.
         */

        const csvText =
            await response.text();


        console.log(
            "CSV characters:",
            csvText.length
        );


        /*
         * Make sure file isn't empty.
         */

        if (
            !csvText.trim()
        ) {

            throw new Error(
                "xi-questions.csv is empty."
            );

        }


        /*
         * Parse CSV.
         */

        questions =
            parseCSV(
                csvText
            );


        console.log(
            "Questions parsed:",
            questions.length
        );


        /*
         * Make sure questions exist.
         */

        if (
            questions.length === 0
        ) {

            throw new Error(
                "The CSV was loaded, but no questions were found."
            );

        }


        /*
         * Validate important CSV columns.
         */

        validateQuestions();


        console.log(
            "CSV loaded successfully."
        );

        console.log(
            "===================================="
        );


        /*
         * Hide loading.
         */

        loading.classList.add(
            "hidden"
        );


        /*
         * Load question based on URL.
         */

        loadQuestion();

    }


    catch (error) {

        console.error(
            "===================================="
        );

        console.error(
            "AIBrainBox CSV ERROR"
        );

        console.error(
            error
        );

        console.error(
            "===================================="
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
   VALIDATE QUESTIONS
   ============================================================ */

function validateQuestions() {

    if (
        questions.length === 0
    ) {

        throw new Error(
            "No questions available."
        );

    }


    const firstQuestion =
        questions[0];


    /*
     * Required question field.
     */

    if (
        !firstQuestion.question
    ) {

        console.warn(
            "CSV warning: 'Question' column was not found."
        );

    }


    /*
     * Correct answer field.
     *
     * Your CSV uses:
     *
     * Correct Answer
     *
     * which becomes:
     *
     * correct answer
     */

    if (
        !firstQuestion[
            "correct answer"
        ]
    ) {

        console.warn(
            "CSV warning: 'Correct Answer' column was not found."
        );

    }


    /*
     * Check IDs.
     */

    const missingIds =
        questions.filter(
            question =>
                !question.id
        );


    if (
        missingIds.length > 0
    ) {

        console.warn(
            missingIds.length +
            " question(s) do not have an ID."
        );

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


        /*
         * Escaped quote:
         *
         * ""
         */

        if (
            char === '"' &&
            insideQuotes &&
            nextChar === '"'
        ) {

            cell += '"';

            i++;

        }


        /*
         * Opening or closing quote.
         */

        else if (
            char === '"'
        ) {

            insideQuotes =
                !insideQuotes;

        }


        /*
         * Column separator.
         */

        else if (
            char === "," &&
            !insideQuotes
        ) {

            row.push(
                cell
            );

            cell = "";

        }


        /*
         * New line.
         */

        else if (
            (
                char === "\n" ||
                char === "\r"
            ) &&
            !insideQuotes
        ) {

            /*
             * Handle Windows CRLF.
             */

            if (
                char === "\r" &&
                nextChar === "\n"
            ) {

                i++;

            }


            row.push(
                cell
            );


            /*
             * Ignore completely empty rows.
             */

            if (
                row.some(
                    value =>
                        value
                            .trim() !== ""
                )
            ) {

                rows.push(
                    row
                );

            }


            row = [];

            cell = "";

        }


        /*
         * Normal character.
         */

        else {

            cell += char;

        }

    }


    /*
     * Add final cell/row.
     */

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
                    value
                        .trim() !== ""
            )
        ) {

            rows.push(
                row
            );

        }

    }


    /*
     * No rows.
     */

    if (
        rows.length === 0
    ) {

        return [];

    }


    /*
     * First row = headers.
     */

    const headers =
        rows[0].map(
            header =>
                normalizeHeader(
                    header
                )
        );


    console.log(
        "CSV headers:",
        headers
    );


    /*
     * Convert each CSV row into an object.
     */

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
   NORMALIZE CSV HEADER
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
   LOAD QUESTION FROM URL
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


    /*
     * If there is no ID in the URL,
     * start with the first question.
     */

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
                "No question ID was provided and the first question does not have an ID."
            );


            return;

        }

    }


    /*
     * Find question.
     */

    currentQuestionIndex =
        questions.findIndex(
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


    /*
     * Question not found.
     */

    if (
        currentQuestionIndex === -1
    ) {

        showError(
            "Question not found: " +
            id
        );


        return;

    }


    /*
     * Set current question.
     */

    currentQuestion =
        questions[
            currentQuestionIndex
        ];


    /*
     * Display.
     */

    displayQuestion();

}


/* ============================================================
   DISPLAY QUESTION
   ============================================================ */

function displayQuestion() {

    if (
        !currentQuestion
    ) {

        return;

    }


    const loading =
        document.getElementById(
            "loading"
        );


    const errorBox =
        document.getElementById(
            "error"
        );


    const container =
        document.getElementById(
            "question-container"
        );


    /*
     * Show correct section.
     */

    loading.classList.add(
        "hidden"
    );


    errorBox.classList.add(
        "hidden"
    );


    container.classList.remove(
        "hidden"
    );


    /*
     * Display question text.
     */

    const questionElement =
        document.getElementById(
            "question"
        );


    questionElement.innerText =
        currentQuestion.question ||
        "Question unavailable.";


    /*
     * Create answer options.
     */

    createOptions();


    /*
     * Reset previous answer.
     */

    resetAnswerState();


    /*
     * Update navigation.
     */

    updateNavigation();


    /*
     * IMPORTANT:
     *
     * Load a new motivational quote
     * every time a question changes.
     */

    loadMotivationalQuote();


    /*
     * Scroll page to top.
     */

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


    const optionLetters = [
        "A",
        "B",
        "C",
        "D"
    ];


    optionLetters.forEach(
        letter => {

            const optionText =
                currentQuestion[
                    letter.toLowerCase()
                ];


            /*
             * Don't create an option if
             * there is no text.
             */

            if (
                !optionText ||
                !optionText.trim()
            ) {

                return;

            }


            /*
             * Outer option.
             */

            const option =
                document.createElement(
                    "div"
                );


            option.className =
                "option";


            /*
             * Radio input.
             */

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


            /*
             * Letter badge.
             */

            const letterSpan =
                document.createElement(
                    "span"
                );


            letterSpan.className =
                "option-letter";


            letterSpan.innerText =
                letter;


            /*
             * Option text.
             */

            const textSpan =
                document.createElement(
                    "span"
                );


            textSpan.className =
                "option-text";


            textSpan.innerText =
                optionText;


            /*
             * Label.
             */

            const label =
                document.createElement(
                    "label"
                );


            label.htmlFor =
                "option-" +
                letter;


            label.appendChild(
                letterSpan
            );


            label.appendChild(
                textSpan
            );


            /*
             * Build option.
             */

            option.appendChild(
                radio
            );


            option.appendChild(
                label
            );


            optionsContainer.appendChild(
                option
            );


            /*
             * Answer event.
             */

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
   UPDATE NAVIGATION
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


    if (
        !previousButton ||
        !nextButton ||
        !position
    ) {

        return;

    }


    /*
     * Previous disabled at first question.
     */

    previousButton.disabled =
        currentQuestionIndex <= 0;


    /*
     * Next disabled at last question.
     */

    nextButton.disabled =
        currentQuestionIndex >=
        questions.length - 1;


    /*
     * Question counter.
     */

    position.innerText =
        "Question " +
        (
            currentQuestionIndex + 1
        ) +
        " of " +
        questions.length;

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
   NEXT QUESTION
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
   NAVIGATE TO QUESTION
   ============================================================ */

function navigateToQuestion(
    questionId
) {

    if (
        !questionId
    ) {

        return;

    }


    const url =
        new URL(
            window.location.href
        );


    url.searchParams.set(
        "id",
        questionId
    );


    /*
     * Change URL without full reload.
     */

    window.history.pushState(
        {},
        "",
        url
    );


    /*
     * Load new question.
     */

    loadQuestion();

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


    /*
     * User answer.
     */

    const userAnswer =
        selected.value
            .trim()
            .toUpperCase();


    /*
     * Correct answer.
     *
     * CSV column:
     *
     * Correct Answer
     *
     * becomes:
     *
     * correct answer
     */

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
     * Remove previous visual states.
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


    /*
     * Mark selected.
     */

    selectedOption.classList.add(
        "selected"
    );


    /*
     * Correct answer.
     */

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


    /*
     * Wrong answer.
     */

    else {

        selectedOption
            .classList
            .add(
                "wrong-answer"
            );


        /*
         * Highlight correct answer.
         */

        highlightCorrectAnswer(
            correctAnswer
        );


        showWrongReaction();

    }


    /*
     * Show explanation immediately.
     */

    showExplanation();

}


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


    /*
     * Your CSV currently uses the misspelled
     * "Explaination" column.
     *
     * After normalization:
     *
     * Explaination -> explaination
     *
     * Support both spellings.
     */

    const explanation =
        currentQuestion[
            "explanation"
        ] ||
        currentQuestion[
            "explaination"
        ] ||
        "";


    if (
        explanation.trim()
    ) {

        explanationText.innerText =
            explanation;

    }

    else {

        explanationText.innerText =
            "No explanation is available for this question.";

    }


    /*
     * Show explanation.
     */

    explanationBox.classList.remove(
        "hidden"
    );


    /*
     * Small scroll on mobile if needed.
     *
     * We don't force-scroll on desktop.
     */

}


/* ============================================================
   RESET ANSWER STATE
   ============================================================ */

function resetAnswerState() {

    const result =
        document.getElementById(
            "result"
        );


    const explanation =
        document.getElementById(
            "explanation"
        );


    const explanationText =
        document.getElementById(
            "explanation-text"
        );


    /*
     * Clear result.
     */

    if (
        result
    ) {

        result.innerText =
            "";

    }


    /*
     * Hide explanation until
     * an answer is selected.
     */

    if (
        explanation
    ) {

        explanation.classList.add(
            "hidden"
        );

    }


    /*
     * Clear explanation text.
     */

    if (
        explanationText
    ) {

        explanationText.innerText =
            "";

    }


    /*
     * Remove answer colors.
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


    /*
     * Reset quote animation.
     */

    const quoteBox =
        document.getElementById(
            "motivational-quote"
        );


    if (
        quoteBox
    ) {

        quoteBox.style.animation =
            "none";


        /*
         * Force browser reflow so the
         * animation can run again.
         */

        void quoteBox.offsetWidth;


        quoteBox.style.animation =
            "quoteIn 0.35s ease";

    }


    /*
     * Try online quote API.
     */

    try {

        const response =
            await fetch(
                QUOTE_API_URL +
                "?t=" +
                Date.now(),
                {
                    cache:
                        "no-store"
                }
            );


        if (
            !response.ok
        ) {

            throw new Error(
                "Quote API HTTP " +
                response.status
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
                "Invalid quote API response."
            );

        }


        /*
         * Display online quote.
         */

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

        /*
         * Don't break the quiz if
         * quote API is unavailable.
         */

        console.warn(
            "Quote API unavailable. Using fallback quote.",
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


    /*
     * Don't show same quote twice.
     */

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
   CORRECT ANSWER CELEBRATION
   ============================================================ */

function showCorrectCelebration() {

    const emojis = [

        "🎉",
        "👏",
        "🥳",
        "🎊",
        "✨",
        "🚀",
        "🤖",
        "🧠",
        "💡",
        "⭐",
        "🔥"

    ];


    createEmojiBurst(
        emojis,
        false
    );

}


/* ============================================================
   WRONG ANSWER REACTION
   ============================================================ */

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


/* ============================================================
   CREATE EMOJI BURST
   ============================================================ */

function createEmojiBurst(
    emojis,
    isSad = false
) {

    /*
     * Remove existing reactions.
     */

    document
        .querySelectorAll(
            ".reaction-container"
        )
        .forEach(
            oldContainer => {

                oldContainer.remove();

            }
        );


    /*
     * Container.
     */

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


    /*
     * Create each emoji.
     */

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


            /*
             * Random horizontal start.
             */

            const left =
                5 +
                Math.random() *
                90;


            /*
             * Random animation delay.
             */

            const delay =
                Math.random() *
                0.3;


            /*
             * Random animation duration.
             */

            const duration =
                2.0 +
                Math.random() *
                1.4;


            /*
             * Random rotation.
             */

            const rotation =
                -40 +
                Math.random() *
                80;


            /*
             * Random horizontal movement.
             */

            const horizontal =
                -120 +
                Math.random() *
                240;


            /*
             * Random emoji size.
             */

            const size =
                1.7 +
                Math.random() *
                1.8;


            /*
             * CSS variables.
             */

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


    /*
     * Remove after animation.
     */

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
   SHOW ERROR
   ============================================================ */

function showError(
    message
) {

    const loading =
        document.getElementById(
            "loading"
        );


    const questionContainer =
        document.getElementById(
            "question-container"
        );


    const errorBox =
        document.getElementById(
            "error"
        );


    if (
        loading
    ) {

        loading.classList.add(
            "hidden"
        );

    }


    if (
        questionContainer
    ) {

        questionContainer.classList.add(
            "hidden"
        );

    }


    if (
        errorBox
    ) {

        errorBox.classList.remove(
            "hidden"
        );


        errorBox.innerText =
            message;

    }

}


/* ============================================================
   KEYBOARD NAVIGATION
   ============================================================ */

/*
 * Left arrow  = Previous
 * Right arrow = Next
 */

document.addEventListener(
    "keydown",
    event => {

        /*
         * Don't navigate while typing.
         */

        const activeElement =
            document.activeElement;


        if (
            activeElement &&
            (
                activeElement.tagName ===
                "INPUT" ||
                activeElement.tagName ===
                "TEXTAREA" ||
                activeElement.tagName ===
                "BUTTON"
            )
        ) {

            return;

        }


        if (
            event.key ===
            "ArrowLeft"
        ) {

            goToPreviousQuestion();

        }


        else if (
            event.key ===
            "ArrowRight"
        ) {

            goToNextQuestion();

        }

    }
);
