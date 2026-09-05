let questions = [];
let currentQuestion = null;
let currentQuestionIndex = -1;


// ============================================================
// CSV LOCATION
// ============================================================

const CSV_URL =
    "https://raw.githubusercontent.com/jai92xi/AIBrainBox/main/xi-questions.csv";


// ============================================================
// MOTIVATIONAL QUOTE API
// ============================================================

const QUOTE_API_URL =
    "https://zenquotes.io/api/random";


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
            "Question not found: " + id
        );

        return;

    }


    currentQuestion =
        questions[
            currentQuestionIndex
        ];


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


            // Immediate answer check

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


    // Update navigation

    updateNavigation();

}


// ============================================================
// QUESTION NAVIGATION
// ============================================================

function createNavigation() {

    // Don't create twice

    if (
        document.getElementById(
            "question-navigation"
        )
    ) {

        return;

    }


    const navigation =
        document.createElement(
            "div"
        );


    navigation.id =
        "question-navigation";


    navigation.innerHTML = `

        <button
            id="previous-question-btn"
            type="button"
            aria-label="Previous question"
        >
            ← Previous
        </button>

        <span
            id="question-position"
            aria-live="polite"
        >
            Question
        </span>

        <button
            id="next-question-btn"
            type="button"
            aria-label="Next question"
        >
            Next →
        </button>

    `;


    const questionContainer =
        document.getElementById(
            "question-container"
        );


    // Put navigation after explanation

    questionContainer.appendChild(
        navigation
    );


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

}


// ============================================================
// UPDATE NAVIGATION
// ============================================================

function updateNavigation() {

    createNavigation();


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


// ============================================================
// GO TO PREVIOUS QUESTION
// ============================================================

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


// ============================================================
// GO TO NEXT QUESTION
// ============================================================

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


// ============================================================
// NAVIGATE TO QUESTION
// ============================================================

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


    // Change URL without full page refresh

    window.history.pushState(
        {},
        "",
        url
    );


    // Load the new question

    loadQuestion();


    // Scroll back to question

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

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
// MOTIVATIONAL QUOTE
// ============================================================

function createQuoteBox() {

    // Don't create twice

    if (
        document.getElementById(
            "motivational-quote"
        )
    ) {

        return;

    }


    const quoteBox =
        document.createElement(
            "aside"
        );


    quoteBox.id =
        "motivational-quote";


    quoteBox.setAttribute(
        "aria-label",
        "Motivational quote"
    );


    quoteBox.innerHTML = `

        <div class="quote-icon">
            ✦
        </div>

        <div
            id="quote-text"
            class="quote-text"
        >
            Loading motivation...
        </div>

        <div
            id="quote-author"
            class="quote-author"
        >
        </div>

        <div class="quote-source">
            <a
                href="https://zenquotes.io/"
                target="_blank"
                rel="noopener noreferrer"
            >
                Inspirational quotes provided by ZenQuotes
            </a>
        </div>

    `;


    document.body.appendChild(
        quoteBox
    );

}


// ============================================================
// LOAD RANDOM MOTIVATIONAL QUOTE
// ============================================================

async function loadMotivationalQuote() {

    createQuoteBox();


    const quoteText =
        document.getElementById(
            "quote-text"
        );


    const quoteAuthor =
        document.getElementById(
            "quote-author"
        );


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

        console.error(
            "Quote loading error:",
            error
        );


        // Keep the site useful if the API fails.

        quoteText.innerText =
            "“Success is built one difficult step at a time.”";


        quoteAuthor.innerText =
            "— AIBrainBox";


    }

}


// ============================================================
// QUOTE STYLES
// ============================================================

function addQuoteStyles() {

    if (
        document.getElementById(
            "quote-navigation-styles"
        )
    ) {

        return;

    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "quote-navigation-styles";


    style.textContent = `

        /* =====================================================
           MOTIVATIONAL QUOTE
           ===================================================== */

        #motivational-quote {

            position: fixed;

            top: 18px;

            right: 18px;

            width: min(
                330px,
                calc(100vw - 36px)
            );

            padding: 16px 18px;

            background:
                linear-gradient(
                    135deg,
                    rgba(17, 24, 39, 0.97),
                    rgba(31, 41, 55, 0.97)
                );

            color: #ffffff;

            border: 1px solid
                rgba(255, 255, 255, 0.12);

            border-radius: 14px;

            box-shadow:
                0 12px 35px
                rgba(0, 0, 0, 0.25);

            backdrop-filter: blur(10px);

            z-index: 1000;

        }


        .quote-icon {

            color: #fbbf24;

            font-size: 18px;

            margin-bottom: 6px;

        }


        .quote-text {

            font-size: 14px;

            line-height: 1.55;

            font-weight: 600;

        }


        .quote-author {

            margin-top: 9px;

            color: #d1d5db;

            font-size: 12px;

            font-style: italic;

        }


        .quote-source {

            margin-top: 8px;

            font-size: 9px;

            opacity: 0.55;

        }


        .quote-source a {

            color: inherit;

            text-decoration: none;

        }


        .quote-source a:hover {

            text-decoration: underline;

        }


        /* =====================================================
           QUESTION NAVIGATION
           ===================================================== */

        #question-navigation {

            display: flex;

            align-items: center;

            justify-content: space-between;

            gap: 14px;

            width: 100%;

            margin-top: 28px;

            padding-top: 20px;

            border-top: 1px solid
                rgba(128, 128, 128, 0.18);

        }


        #question-navigation button {

            border: none;

            border-radius: 10px;

            padding: 11px 18px;

            font-size: 14px;

            font-weight: 700;

            cursor: pointer;

            color: #ffffff;

            background: #2563eb;

            transition:
                transform 0.15s ease,
                opacity 0.15s ease,
                background 0.15s ease;

        }


        #question-navigation button:hover:not(:disabled) {

            background: #1d4ed8;

            transform: translateY(-1px);

        }


        #question-navigation button:active:not(:disabled) {

            transform: translateY(0);

        }


        #question-navigation button:disabled {

            cursor: not-allowed;

            opacity: 0.35;

        }


        #question-position {

            flex: 1;

            text-align: center;

            font-size: 13px;

            font-weight: 700;

            color: #6b7280;

        }


        /* =====================================================
           MOBILE
           ===================================================== */

        @media (max-width: 700px) {

            #motivational-quote {

                position: relative;

                top: auto;

                right: auto;

                width: auto;

                margin:
                    12px 16px 0;

            }


            #question-navigation {

                gap: 8px;

            }


            #question-navigation button {

                padding:
                    10px 12px;

                font-size: 13px;

            }

        }

    `;


    document.head.appendChild(
        style
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

addQuoteStyles();

loadMotivationalQuote();

loadQuestions();
