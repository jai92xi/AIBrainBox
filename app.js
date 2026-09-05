/* ============================================================
   AIBrainBox
   ============================================================ */


/* ============================================================
   GLOBAL STATE
   ============================================================ */

let questions = [];

let currentQuestion = null;

let currentQuestionIndex = -1;


/* ============================================================
   DATA SOURCES
   ============================================================ */

const CSV_URL =
    "https://raw.githubusercontent.com/jai92xi/AIBrainBox/main/xi-questions.csv";


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
    }

];


/* ============================================================
   LAST QUOTE
   ============================================================ */

let lastQuoteIndex = -1;


/* ============================================================
   LOAD QUESTIONS
   ============================================================ */

async function loadQuestions() {

    try {

        const response =
            await fetch(
                CSV_URL +
                "?v=" +
                Date.now()
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load question database. HTTP status: " +
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


        showError(
            "Unable to load the question database. Please check that xi-questions.csv exists in the repository."
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
         * Double quote inside quoted field
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
         * Start/end quoted field
         */

        else if (
            char === '"'
        ) {

            insideQuotes =
                !insideQuotes;

        }


        /*
         * Column separator
         */

        else if (
            char === "," &&
            !insideQuotes
        ) {

            row.push(cell);

            cell = "";

        }


        /*
         * New line
         */

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


        /*
         * Normal character
         */

        else {

            cell += char;

        }

    }


    /*
     * Last row
     */

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


    /*
     * Normalize headers
     */

    const headers =
        rows[0].map(
            header =>
                header
                    .trim()
                    .toLowerCase()
        );


    /*
     * Convert rows into objects
     */

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


/* ============================================================
   LOAD QUESTION FROM URL
   ============================================================ */

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

    const loading =
        document.getElementById(
            "loading"
        );


    const error =
        document.getElementById(
            "error"
        );


    const container =
        document.getElementById(
            "question-container"
        );


    loading.classList.add(
        "hidden"
    );


    error.classList.add(
        "hidden"
    );


    container.classList.remove(
        "hidden"
    );


    /*
     * Display question
     */

    document
        .getElementById(
            "question"
        )
        .innerText =
        currentQuestion.question ||
        "";


    /*
     * Display options
     */

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
                    "div"
                );


            option.className =
                "option";


            /*
             * Radio input
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
             * Letter
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
             * Option text
             */

            const textSpan =
                document.createElement(
                    "span"
                );


            textSpan.className =
                "option-text";


            textSpan.innerText =
                currentQuestion[
                    letter.toLowerCase()
                ] ||
                "";


            /*
             * Label
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
             * Answer event
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


    /*
     * Reset explanation
     */

    resetAnswerState();


    /*
     * Update top navigation
     */

    updateNavigation();


    /*
     * IMPORTANT:
     * Every question gets a new quote.
     */

    loadMotivationalQuote();

}


/* ============================================================
   QUESTION NAVIGATION
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
     * Disable Previous on first question
     */

    previousButton.disabled =
        currentQuestionIndex <= 0;


    /*
     * Disable Next on last question
     */

    nextButton.disabled =
        currentQuestionIndex >=
        questions.length - 1;


    /*
     * Show question number
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

    const url =
        new URL(
            window.location.href
        );


    url.searchParams.set(
        "id",
        questionId
    );


    /*
     * Change URL without page reload
     */

    window.history.pushState(
        {},
        "",
        url
    );


    /*
     * Load new question
     */

    loadQuestion();


    /*
     * Scroll to top
     */

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* ============================================================
   BROWSER BACK / FORWARD
   ============================================================ */

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


/* ============================================================
   CHECK ANSWER
   ============================================================ */

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
            ] ||
            ""
        )
            .trim()
            .toUpperCase();


    /*
     * Remove previous states
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
     * CORRECT
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
     * WRONG
     */

    else {

        selectedOption
            .classList
            .add(
                "wrong-answer"
            );


        /*
         * Highlight correct option
         */

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


        showWrongReaction();

    }


    /*
     * Show explanation immediately
     */

    showExplanation();

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
     * Support both spellings:
     *
     * explanation
     * explaination
     */

    const explanation =
        currentQuestion.explanation ||
        currentQuestion.explaination ||
        "No explanation is available for this question.";


    explanationText.innerText =
        explanation;


    explanationBox.classList.remove(
        "hidden"
    );


}


/* ============================================================
   RESET ANSWER STATE
   ============================================================ */

function resetAnswerState() {

    const result =
        document.getElementById(
            "result"
        );


    result.innerText =
        "";


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
     * Reset animation so it runs
     * on every question.
     */

    const quoteBox =
        document.getElementById(
            "motivational-quote"
        );


    if (quoteBox) {

        quoteBox.style.animation =
            "none";


        void quoteBox.offsetWidth;


        quoteBox.style.animation =
            "quoteIn 0.35s ease";

    }


    try {

        const response =
            await fetch(
                QUOTE_API_URL +
                "?t=" +
                Date.now()
            );


        if (!response.ok) {

            throw new Error(
                "Quote API returned HTTP " +
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
                "Invalid quote response."
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
            "Quote API unavailable. Using local quote.",
            error
        );


        showFallbackQuote();

    }

}


/* ============================================================
   FALLBACK QUOTE
   ============================================================ */

function showFallbackQuote() {

    let index =
        Math.floor(
            Math.random() *
            FALLBACK_QUOTES.length
        );


    /*
     * Prevent the same fallback quote
     * from appearing twice in a row.
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


    const quoteText =
        document.getElementById(
            "quote-text"
        );


    const quoteAuthor =
        document.getElementById(
            "quote-author"
        );


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
     * Remove old reactions
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
     * Create container
     */

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


    /*
     * Create emojis
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


            const left =
                5 +
                Math.random() *
                90;


            const delay =
                Math.random() *
                0.3;


            const duration =
                2.0 +
                Math.random() *
                1.4;


            const rotation =
                -40 +
                Math.random() *
                80;


            const horizontal =
                -120 +
                Math.random() *
                240;


            const size =
                1.7 +
                Math.random() *
                1.8;


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
     * Clean up
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


    loading.classList.add(
        "hidden"
    );


    questionContainer.classList.add(
        "hidden"
    );


    errorBox.classList.remove(
        "hidden"
    );


    errorBox.innerText =
        message;

}


/* ============================================================
   NAVIGATION EVENTS
   ============================================================ */

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


/* ============================================================
   START APPLICATION
   ============================================================ */

loadQuestions();
