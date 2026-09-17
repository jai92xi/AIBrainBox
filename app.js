/* =========================================================
   AIBrainBox - app.js
   ========================================================= */


/* =========================================================
   GLOBAL DATA
   ========================================================= */

let questions = [];
let quotes = [];

let currentQuestion = null;
let currentQuestionIndex = -1;

let currentStreak = 0;

let answerSelected = false;


/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const loadingElement =
    document.getElementById("loading");

const errorElement =
    document.getElementById("error");

const questionContainer =
    document.getElementById("question-container");

const questionElement =
    document.getElementById("question");

const optionsElement =
    document.getElementById("options");

const resultElement =
    document.getElementById("result");

const explanationElement =
    document.getElementById("explanation");

const explanationTextElement =
    document.getElementById("explanation-text");

const scoreElement =
    document.getElementById("score-display");

const previousButton =
    document.getElementById("previous-question");

const nextButton =
    document.getElementById("next-question");

const quoteTextElement =
    document.getElementById("quote-text");

const quoteAuthorElement =
    document.getElementById("quote-author");


/* =========================================================
   CSV FILES
   ========================================================= */

const QUESTIONS_FILE =
    "./xi-questions.csv";

const QUOTES_FILE =
    "./xi-Quotes.csv";


/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);


async function initializeApp() {

    try {

        showLoading();

        await loadQuestions();

        await loadQuotes();

        setupQuestionLayout();

        setupNavigation();

        setupBrowserNavigation();

        displayRandomQuote();

        loadQuestionFromURL();

    } catch (error) {

        console.error(
            "Application initialization error:",
            error
        );

        showError(
            "Unable to load the question database. " +
            "Please check that xi-questions.csv exists " +
            "in the repository."
        );
    }
}


/* =========================================================
   LOADING STATE
   ========================================================= */

function showLoading() {

    if (loadingElement) {
        loadingElement.classList.remove("hidden");
    }

    if (errorElement) {
        errorElement.classList.add("hidden");
    }

    if (questionContainer) {
        questionContainer.classList.add("hidden");
    }
}


function hideLoading() {

    if (loadingElement) {
        loadingElement.classList.add("hidden");
    }

    if (errorElement) {
        errorElement.classList.add("hidden");
    }

    if (questionContainer) {
        questionContainer.classList.remove("hidden");
    }
}


function showError(message) {

    if (loadingElement) {
        loadingElement.classList.add("hidden");
    }

    if (questionContainer) {
        questionContainer.classList.add("hidden");
    }

    if (errorElement) {

        errorElement.textContent =
            message;

        errorElement.classList.remove(
            "hidden"
        );
    }
}


/* =========================================================
   LOAD QUESTIONS
   ========================================================= */

async function loadQuestions() {

    const response =
        await fetch(
            QUESTIONS_FILE,
            {
                cache: "no-store"
            }
        );

    if (!response.ok) {

        throw new Error(
            `Unable to load ${QUESTIONS_FILE}`
        );
    }

    const csvText =
        await response.text();

    questions =
        parseCSV(csvText);

    if (
        !questions ||
        questions.length === 0
    ) {

        throw new Error(
            "No questions found in CSV."
        );
    }

    console.log(
        `Loaded ${questions.length} questions.`
    );
}


/* =========================================================
   LOAD QUOTES
   ========================================================= */

async function loadQuotes() {

    try {

        const response =
            await fetch(
                QUOTES_FILE,
                {
                    cache: "no-store"
                }
            );

        if (!response.ok) {
            return;
        }

        const csvText =
            await response.text();

        quotes =
            parseCSV(csvText);

    } catch (error) {

        console.warn(
            "Quotes file could not be loaded:",
            error
        );

        quotes = [];
    }
}


/* =========================================================
   CSV PARSER
   ========================================================= */

function parseCSV(csvText) {

    const rows = [];

    let row = [];

    let value = "";

    let insideQuotes = false;

    for (
        let i = 0;
        i < csvText.length;
        i++
    ) {

        const character =
            csvText[i];

        const nextCharacter =
            csvText[i + 1];

        if (character === '"') {

            if (
                insideQuotes &&
                nextCharacter === '"'
            ) {

                value += '"';

                i++;

            } else {

                insideQuotes =
                    !insideQuotes;
            }

        } else if (
            character === "," &&
            !insideQuotes
        ) {

            row.push(value);

            value = "";

        } else if (
            (
                character === "\n" ||
                character === "\r"
            ) &&
            !insideQuotes
        ) {

            if (
                character === "\r" &&
                nextCharacter === "\n"
            ) {
                i++;
            }

            row.push(value);

            value = "";

            if (
                row.some(
                    item =>
                        item.trim() !== ""
                )
            ) {

                rows.push(row);
            }

            row = [];

        } else {

            value += character;
        }
    }


    if (
        value !== "" ||
        row.length > 0
    ) {

        row.push(value);

        if (
            row.some(
                item =>
                    item.trim() !== ""
            )
        ) {

            rows.push(row);
        }
    }


    if (rows.length === 0) {
        return [];
    }


    const headers =
        rows[0].map(
            header =>
                header
                    .trim()
                    .replace(/^\uFEFF/, "")
        );


    const data = [];


    for (
        let i = 1;
        i < rows.length;
        i++
    ) {

        const object = {};

        headers.forEach(
            (header, index) => {

                object[header] =
                    rows[i][index] !== undefined
                        ? rows[i][index].trim()
                        : "";
            }
        );

        data.push(object);
    }


    return data;
}


/* =========================================================
   CASE-INSENSITIVE CSV VALUE
   ========================================================= */

function getValue(
    object,
    possibleNames
) {

    if (!object) {
        return "";
    }

    const keys =
        Object.keys(object);


    for (
        const possibleName
        of possibleNames
    ) {

        const exactKey =
            keys.find(
                key =>
                    key === possibleName
            );

        if (
            exactKey !== undefined
        ) {

            return (
                object[exactKey] || ""
            ).trim();
        }
    }


    for (
        const possibleName
        of possibleNames
    ) {

        const lowerName =
            possibleName
                .toLowerCase()
                .trim();

        const matchingKey =
            keys.find(
                key =>
                    key
                        .toLowerCase()
                        .trim() ===
                    lowerName
            );

        if (
            matchingKey !== undefined
        ) {

            return (
                object[matchingKey] || ""
            ).trim();
        }
    }


    return "";
}


/* =========================================================
   QUESTION ID
   ========================================================= */

function getQuestionId(question) {

    return getValue(
        question,
        [
            "ID",
            "Id",
            "id",
            "Question ID",
            "QuestionID"
        ]
    );
}


/* =========================================================
   URL QUESTION ID
   ========================================================= */

function getQuestionIdFromURL() {

    const parameters =
        new URLSearchParams(
            window.location.search
        );

    return (
        parameters.get("id") || ""
    ).trim();
}


/* =========================================================
   FIND QUESTION BY ID
   ========================================================= */

function findQuestionById(id) {

    if (!id) {
        return null;
    }

    const targetId =
        id.toLowerCase().trim();


    return (
        questions.find(
            question =>
                getQuestionId(question)
                    .toLowerCase()
                    .trim() ===
                targetId
        ) || null
    );
}


/* =========================================================
   LOAD QUESTION FROM URL
   ========================================================= */

function loadQuestionFromURL() {

    const questionId =
        getQuestionIdFromURL();


    if (questionId) {

        const question =
            findQuestionById(
                questionId
            );


        if (question) {

            displayQuestion(
                question
            );

            return;
        }
    }


    /*
     * If no valid ID exists,
     * open the first question.
     */

    if (questions.length > 0) {

        displayQuestion(
            questions[0],
            true
        );
    }
}


/* =========================================================
   DISPLAY QUESTION
   ========================================================= */

function displayQuestion(
    question,
    updateURL = true
) {

    if (!question) {
        return;
    }


    currentQuestion =
        question;


    currentQuestionIndex =
        questions.indexOf(
            question
        );


    answerSelected = false;


    clearQuestionState();


    /*
     * Update browser URL.
     */

    const questionId =
        getQuestionId(question);


    if (
        updateURL &&
        questionId
    ) {

        const newURL =
            `${window.location.pathname}?id=${encodeURIComponent(questionId)}`;

        window.history.pushState(
            {
                questionId:
                    questionId
            },
            "",
            newURL
        );
    }


    /*
     * Display question.
     */

    if (questionElement) {

        questionElement.textContent =
            getValue(
                question,
                [
                    "Question",
                    "question",
                    "Questions"
                ]
            );
    }


    /*
     * Display options.
     */

    renderOptions(question);


    /*
     * Display explanation only
     * after answer selection.
     */

    if (explanationElement) {
        explanationElement.classList.add(
            "hidden"
        );
    }


    if (explanationTextElement) {
        explanationTextElement.textContent =
            "";
    }


    /*
     * Navigation buttons.
     */

    updateNavigationButtons();


    /*
     * Make sure left/right layout
     * exists even if older HTML
     * is being used.
     */

    setupQuestionLayout();


    hideLoading();


    /*
     * Scroll back to question.
     */

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================================
   CLEAR QUESTION STATE
   ========================================================= */

function clearQuestionState() {

    if (optionsElement) {
        optionsElement.innerHTML =
            "";
    }

    if (resultElement) {

        resultElement.textContent =
            "";

        resultElement.className =
            "result";
    }

    if (explanationElement) {

        explanationElement.classList.add(
            "hidden"
        );
    }

    if (explanationTextElement) {

        explanationTextElement.textContent =
            "";
    }
}


/* =========================================================
   RENDER OPTIONS
   ========================================================= */

function renderOptions(question) {

    if (!optionsElement) {
        return;
    }


    optionsElement.innerHTML =
        "";


    const optionDefinitions = [

        {
            letter: "A",
            names: [
                "Option A",
                "option A",
                "A",
                "OptionA"
            ]
        },

        {
            letter: "B",
            names: [
                "Option B",
                "option B",
                "B",
                "OptionB"
            ]
        },

        {
            letter: "C",
            names: [
                "Option C",
                "option C",
                "C",
                "OptionC"
            ]
        },

        {
            letter: "D",
            names: [
                "Option D",
                "option D",
                "D",
                "OptionD"
            ]
        }
    ];


    optionDefinitions.forEach(
        definition => {

            const optionText =
                getValue(
                    question,
                    definition.names
                );


            if (!optionText) {
                return;
            }


            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "option";


            button.dataset.letter =
                definition.letter;


            button.setAttribute(
                "aria-label",
                `Option ${definition.letter}`
            );


            const label =
                document.createElement(
                    "span"
                );

            label.className =
                "option-label";

            label.textContent =
                definition.letter;


            const text =
                document.createElement(
                    "span"
                );

            text.className =
                "option-text";

            text.textContent =
                optionText;


            button.appendChild(
                label
            );

            button.appendChild(
                text
            );


            button.addEventListener(
                "click",
                () => {

                    selectAnswer(
                        button,
                        definition.letter
                    );
                }
            );


            optionsElement.appendChild(
                button
            );
        }
    );
}


/* =========================================================
   GET CORRECT ANSWER
   ========================================================= */

function getCorrectAnswer(question) {

    return getValue(
        question,
        [
            "Correct Answer",
            "correct answer",
            "CorrectAnswer",
            "Answer",
            "answer",
            "Correct"
        ]
    )
    .trim()
    .toUpperCase();
}


/* =========================================================
   NORMALIZE ANSWER
   ========================================================= */

function normalizeAnswer(answer) {

    if (!answer) {
        return "";
    }


    const normalized =
        answer
            .trim()
            .toUpperCase();


    /*
     * Handle values such as:
     * "A"
     * "OPTION A"
     * "ANSWER A"
     */

    if (
        normalized === "A" ||
        normalized.includes("OPTION A") ||
        normalized.includes("ANSWER A")
    ) {
        return "A";
    }


    if (
        normalized === "B" ||
        normalized.includes("OPTION B") ||
        normalized.includes("ANSWER B")
    ) {
        return "B";
    }


    if (
        normalized === "C" ||
        normalized.includes("OPTION C") ||
        normalized.includes("ANSWER C")
    ) {
        return "C";
    }


    if (
        normalized === "D" ||
        normalized.includes("OPTION D") ||
        normalized.includes("ANSWER D")
    ) {
        return "D";
    }


    return normalized;
}


/* =========================================================
   SELECT ANSWER
   ========================================================= */

function selectAnswer(
    selectedButton,
    selectedLetter
) {

    if (
        answerSelected ||
        !currentQuestion
    ) {
        return;
    }


    answerSelected = true;


    const correctAnswer =
        normalizeAnswer(
            getCorrectAnswer(
                currentQuestion
            )
        );


    const selectedAnswer =
        normalizeAnswer(
            selectedLetter
        );


    const isCorrect =
        selectedAnswer ===
        correctAnswer;


    /*
     * Disable all options.
     */

    const allOptions =
        optionsElement
            ? optionsElement.querySelectorAll(
                ".option"
            )
            : [];


    allOptions.forEach(
        option => {

            option.disabled =
                true;
        }
    );


    /*
     * Highlight selected answer.
     */

    if (isCorrect) {

        selectedButton.classList.add(
            "correct"
        );

        showCorrectResult();

        currentStreak++;

    } else {

        selectedButton.classList.add(
            "wrong"
        );

        showWrongResult();

        currentStreak = 0;


        /*
         * Also show correct answer
         * in green.
         */

        allOptions.forEach(
            option => {

                const optionLetter =
                    option.dataset.letter;


                if (
                    normalizeAnswer(
                        optionLetter
                    ) ===
                    correctAnswer
                ) {

                    option.classList.add(
                        "correct"
                    );
                }
            }
        );
    }


    updateScore();


    /*
     * Show explanation after
     * selecting the option.
     */

    showExplanation();


    /*
     * Floating emoji feedback.
     */

    showFloatingFeedback(
        isCorrect
    );
}


/* =========================================================
   CORRECT RESULT
   ========================================================= */

function showCorrectResult() {

    if (!resultElement) {
        return;
    }


    resultElement.className =
        "result correct-result";


    resultElement.textContent =
        "Correct! Great job!";
}


/* =========================================================
   WRONG RESULT
   ========================================================= */

function showWrongResult() {

    if (!resultElement) {
        return;
    }


    resultElement.className =
        "result wrong-result";


    resultElement.textContent =
        "Not quite. Keep learning!";
}


/* =========================================================
   SHOW EXPLANATION
   ========================================================= */

function showExplanation() {

    if (
        !currentQuestion ||
        !explanationElement ||
        !explanationTextElement
    ) {
        return;
    }


    /*
     * CSV uses "Explaination"
     * as the column name.
     */

    const explanation =
        getValue(
            currentQuestion,
            [
                "Explaination",
                "Explanation",
                "explaination",
                "explanation"
            ]
        );


    explanationTextElement.textContent =
        explanation ||
        "No explanation is available for this question.";


    explanationElement.classList.remove(
        "hidden"
    );


    /*
     * Smoothly bring explanation
     * into view.
     */

    setTimeout(
        () => {

            explanationElement.scrollIntoView({
                behavior: "smooth",
                block: "nearest"
            });

        },
        100
    );
}


/* =========================================================
   SCORE
   ========================================================= */

function updateScore() {

    if (!scoreElement) {
        return;
    }


    scoreElement.innerHTML =
        `Current streak: <strong>${currentStreak}</strong>`;
}


/* =========================================================
   NAVIGATION SETUP
   ========================================================= */

function setupNavigation() {

    if (previousButton) {

        previousButton.addEventListener(
            "click",
            () => {

                navigateToRelatedQuestion(
                    "previous"
                );
            }
        );
    }


    if (nextButton) {

        nextButton.addEventListener(
            "click",
            () => {

                navigateToRelatedQuestion(
                    "next"
                );
            }
        );
    }
}


/* =========================================================
   RELATED QUESTION NAVIGATION
   ========================================================= */

function navigateToRelatedQuestion(
    direction
) {

    if (!currentQuestion) {
        return;
    }


    let relatedId = "";


    if (direction === "previous") {

        relatedId =
            getValue(
                currentQuestion,
                [
                    "previous related question",
                    "Previous Related Question",
                    "previous related Question",
                    "Previous related question"
                ]
            );

    } else {

        relatedId =
            getValue(
                currentQuestion,
                [
                    "next related question",
                    "Next Related Question",
                    "next related Question",
                    "Next related question"
                ]
            );
    }


    if (!relatedId) {
        return;
    }


    const relatedQuestion =
        findQuestionById(
            relatedId
        );


    if (!relatedQuestion) {

        console.warn(
            `Related question ${relatedId} was not found.`
        );

        return;
    }


    displayQuestion(
        relatedQuestion,
        true
    );
}


/* =========================================================
   UPDATE NAVIGATION BUTTONS
   ========================================================= */

function updateNavigationButtons() {

    if (!currentQuestion) {
        return;
    }


    const previousId =
        getValue(
            currentQuestion,
            [
                "previous related question",
                "Previous Related Question"
            ]
        );


    const nextId =
        getValue(
            currentQuestion,
            [
                "next related question",
                "Next Related Question"
            ]
        );


    if (previousButton) {

        previousButton.disabled =
            !previousId ||
            !findQuestionById(
                previousId
            );
    }


    if (nextButton) {

        nextButton.disabled =
            !nextId ||
            !findQuestionById(
                nextId
            );
    }
}


/* =========================================================
   BROWSER BACK / FORWARD
   ========================================================= */

function setupBrowserNavigation() {

    window.addEventListener(
        "popstate",
        () => {

            loadQuestionFromURL();
        }
    );
}


/* =========================================================
   KEYBOARD NAVIGATION
   ========================================================= */

document.addEventListener(
    "keydown",
    event => {

        /*
         * Do not trigger navigation while
         * user is interacting with buttons.
         */

        if (
            event.target &&
            (
                event.target.tagName ===
                "BUTTON" ||
                event.target.tagName ===
                "INPUT" ||
                event.target.tagName ===
                "TEXTAREA"
            )
        ) {
            return;
        }


        if (
            event.key === "ArrowLeft"
        ) {

            navigateToRelatedQuestion(
                "previous"
            );
        }


        if (
            event.key === "ArrowRight"
        ) {

            navigateToRelatedQuestion(
                "next"
            );
        }
    }
);


/* =========================================================
   QUESTION / OPTIONS LAYOUT
   ========================================================= */

/*
 * This function supports both:
 *
 * 1. The new HTML structure
 *    with .question-content,
 *    .question-pane and .options-pane
 *
 * 2. The older HTML structure
 *    where #question and #options
 *    are direct children.
 *
 * This prevents the earlier requirements
 * from breaking if the existing index.html
 * has not yet been changed.
 */

function setupQuestionLayout() {

    if (!questionContainer) {
        return;
    }


    /*
     * Already using the new layout.
     */

    let content =
        questionContainer.querySelector(
            ".question-content"
        );


    if (content) {

        ensureLayoutClasses(
            content
        );

        return;
    }


    /*
     * Create the two-pane structure.
     */

    content =
        document.createElement(
            "div"
        );

    content.className =
        "question-content";


    const questionPane =
        document.createElement(
            "div"
        );

    questionPane.className =
        "question-pane";


    const optionsPane =
        document.createElement(
            "div"
        );

    optionsPane.className =
        "options-pane";


    /*
     * Locate existing elements.
     */

    const question =
        questionContainer.querySelector(
            "#question"
        );

    const options =
        questionContainer.querySelector(
            "#options"
        );

    const result =
        questionContainer.querySelector(
            "#result"
        );

    const explanation =
        questionContainer.querySelector(
            "#explanation"
        );


    /*
     * Move question into
     * left pane.
     */

    if (question) {

        questionPane.appendChild(
            question
        );
    }


    /*
     * Move options into
     * right pane.
     */

    if (options) {

        optionsPane.appendChild(
            options
        );
    }


    /*
     * Move result and explanation
     * into right pane.
     */

    if (result) {

        optionsPane.appendChild(
            result
        );
    }


    if (explanation) {

        optionsPane.appendChild(
            explanation
        );
    }


    content.appendChild(
        questionPane
    );

    content.appendChild(
        optionsPane
    );


    /*
     * Keep related navigation
     * above the two-pane layout.
     */

    const navigation =
        questionContainer.querySelector(
            ".related-navigation"
        );


    questionContainer.innerHTML =
        "";


    if (navigation) {

        questionContainer.appendChild(
            navigation
        );
    }


    questionContainer.appendChild(
        content
    );
}


/* =========================================================
   ENSURE LAYOUT CLASSES
   ========================================================= */

function ensureLayoutClasses(
    content
) {

    const question =
        content.querySelector(
            "#question"
        );

    const options =
        content.querySelector(
            "#options"
        );


    if (question) {

        const pane =
            question.closest(
                ".question-pane"
            );

        if (!pane) {

            const questionPane =
                document.createElement(
                    "div"
                );

            questionPane.className =
                "question-pane";

            question.parentNode.insertBefore(
                questionPane,
                question
            );

            questionPane.appendChild(
                question
            );
        }
    }


    if (options) {

        const pane =
            options.closest(
                ".options-pane"
            );

        if (!pane) {

            const optionsPane =
                document.createElement(
                    "div"
                );

            optionsPane.className =
                "options-pane";

            options.parentNode.insertBefore(
                optionsPane,
                options
            );

            optionsPane.appendChild(
                options
            );
        }
    }
}


/* =========================================================
   QUOTE DISPLAY
   ========================================================= */

function displayRandomQuote() {

    if (
        !quotes ||
        quotes.length === 0
    ) {
        return;
    }


    const randomIndex =
        Math.floor(
            Math.random() *
            quotes.length
        );


    const quote =
        quotes[randomIndex];


    const quoteText =
        getValue(
            quote,
            [
                "Quote",
                "quote",
                "Quotes",
                "quotes"
            ]
        );


    const author =
        getValue(
            quote,
            [
                "Author",
                "author",
                "By",
                "by"
            ]
        );


    if (quoteTextElement) {

        quoteTextElement.textContent =
            quoteText
                ? `"${quoteText}"`
                : "";
    }


    if (quoteAuthorElement) {

        quoteAuthorElement.textContent =
            author
                ? `— ${author}`
                : "";
    }
}


/* =========================================================
   FLOATING FEEDBACK
   ========================================================= */

function showFloatingFeedback(
    isCorrect
) {

    const happyEmojis = [

        "🎉",
        "🥳",
        "😄",
        "🤩",
        "👏",
        "👏",
        "🎊",
        "✨",
        "🙌",
        "💯"

    ];


    const sadEmojis = [

        "😢",
        "😞",
        "😔",
        "🙁",
        "😕",
        "💔",
        "🥺",
        "😭"

    ];


    const emojis =
        isCorrect
            ? happyEmojis
            : sadEmojis;


    const count =
        isCorrect
            ? 12
            : 8;


    for (
        let i = 0;
        i < count;
        i++
    ) {

        const emoji =
            document.createElement(
                "div"
            );


        emoji.className =
            "floating-feedback";


        emoji.textContent =
            emojis[
                Math.floor(
                    Math.random() *
                    emojis.length
                )
            ];


        /*
         * Spread emojis across
         * the full screen.
         */

        const leftPosition =
            5 +
            Math.random() * 90;


        emoji.style.left =
            `${leftPosition}%`;


        /*
         * Start around the
         * middle/lower area.
         */

        const topPosition =
            48 +
            Math.random() * 22;


        emoji.style.top =
            `${topPosition}%`;


        /*
         * Random size.
         */

        const size =
            38 +
            Math.random() * 20;


        emoji.style.fontSize =
            `${size}px`;


        /*
         * Random delay.
         */

        const delay =
            Math.random() * 0.65;


        emoji.style.animationDelay =
            `${delay}s`;


        /*
         * Slight horizontal
         * movement variation.
         */

        const drift =
            -80 +
            Math.random() * 160;


        emoji.style.setProperty(
            "--emoji-drift",
            `${drift}px`
        );


        document.body.appendChild(
            emoji
        );


        /*
         * Remove after animation.
         */

        setTimeout(
            () => {

                emoji.remove();

            },
            4500
        );
    }
}


/* =========================================================
   INITIAL SCORE
   ========================================================= */

updateScore();
