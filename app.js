let questions = [];
let currentQuestionIndex = -1;
let currentQuestion = null;

const CSV_URL = "./xi-questions.csv";
const QUOTES_URL = "./xi-Quotes.csv";

let score = 0;
let answeredQuestions = new Set();
let questionResults = new Map();
let savedAnswers = new Map();

let currentStreak = 0;
let answerHistory = [];

let quotes = [];
let lastQuoteIndex = -1;

const BACKGROUNDS_API =
    "https://api.github.com/repos/jai92xi/AIBrainBox/contents/Backgrounds_Folder";

const BACKGROUND_SESSION_KEY =
    "aibrainbox-session-background";


/* =========================================================
   INITIALIZE APP
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);

function initializeApp() {

    const previousButton =
        document.getElementById("previous-button");

    const nextButton =
        document.getElementById("next-button");

    if (previousButton) {
        previousButton.addEventListener(
            "click",
            () => navigateQuestion(-1)
        );
    }

    if (nextButton) {
        nextButton.addEventListener(
            "click",
            () => navigateQuestion(1)
        );
    }

    window.addEventListener(
        "popstate",
        handlePopState
    );

    document.addEventListener(
        "keydown",
        handleKeyboardNavigation
    );

    loadQuestions();
    loadQuotes();
    loadSessionBackground();
}


/* =========================================================
   LOAD QUESTIONS
   ========================================================= */

async function loadQuestions() {

    const loading =
        document.getElementById("loading");

    const error =
        document.getElementById("error");

    try {

        if (loading) {
            loading.classList.remove("hidden");
        }

        if (error) {
            error.classList.add("hidden");
        }

        const response =
            await fetch(
                `${CSV_URL}?v=${Date.now()}`,
                {
                    cache: "no-store"
                }
            );

        if (!response.ok) {
            throw new Error(
                "Unable to load questions."
            );
        }

        const csvText =
            await response.text();

        questions =
            parseCSV(csvText);

        console.log(
            "Questions loaded:",
            questions.length
        );

        if (questions.length > 0) {
            console.log(
                "First question:",
                questions[0]
            );
        }

        if (!questions.length) {
            throw new Error(
                "No questions found in CSV."
            );
        }

        if (loading) {
            loading.classList.add("hidden");
        }

        loadQuestionFromURL();

    } catch (err) {

        console.error(
            "Question loading error:",
            err
        );

        if (loading) {
            loading.classList.add("hidden");
        }

        if (error) {

            error.textContent =
                "Unable to load questions. Please refresh the page.";

            error.classList.remove("hidden");
        }
    }
}


/* =========================================================
   LOAD QUOTES
   ========================================================= */

async function loadQuotes() {

    try {

        const response =
            await fetch(
                `${QUOTES_URL}?v=${Date.now()}`,
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

    } catch (err) {

        console.warn(
            "Quote CSV could not be loaded. Using fallback quotes."
        );

        quotes = [

            {
                quote:
                    "Keep going. Your future self will thank you.",
                author:
                    "AIBrainBox"
            },

            {
                quote:
                    "Small progress is still progress.",
                author:
                    "AIBrainBox"
            },

            {
                quote:
                    "Learning never stops.",
                author:
                    "AIBrainBox"
            },

            {
                quote:
                    "Consistency beats perfection.",
                author:
                    "AIBrainBox"
            }
        ];

        loadMotivationalQuote();
    }
}


/* =========================================================
   SESSION BACKGROUND VIDEO
   ========================================================= */

async function loadSessionBackground() {

    const video =
        document.getElementById(
            "session-background"
        );

    if (!video) {
        return;
    }

    try {

        let selectedVideo =
            sessionStorage.getItem(
                BACKGROUND_SESSION_KEY
            );

        if (!selectedVideo) {

            const response =
                await fetch(
                    BACKGROUNDS_API,
                    {
                        cache: "no-store"
                    }
                );

            if (!response.ok) {

                throw new Error(
                    "Unable to access background folder."
                );
            }

            const files =
                await response.json();

            const videoFiles =
                files.filter(
                    file =>
                        file.type === "file" &&
                        /\.mp4$/i.test(file.name)
                );

            if (!videoFiles.length) {

                console.warn(
                    "No MP4 background videos found."
                );

                return;
            }

            const randomIndex =
                Math.floor(
                    Math.random() *
                    videoFiles.length
                );

            selectedVideo =
                videoFiles[randomIndex].download_url;

            sessionStorage.setItem(
                BACKGROUND_SESSION_KEY,
                selectedVideo
            );
        }

        video.src =
            selectedVideo;

        video.load();

        const playPromise =
            video.play();

        if (playPromise !== undefined) {

            playPromise.catch(() => {

                console.warn(
                    "Background video autoplay was blocked."
                );

            });
        }

    } catch (err) {

        console.warn(
            "Background video could not be loaded:",
            err
        );
    }
}


/* =========================================================
   LOAD QUESTION FROM URL
   ========================================================= */

function loadQuestionFromURL() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const questionId =
        params.get("id");

    if (questionId) {

        const index =
            questions.findIndex(
                question =>
                    getQuestionIdFromObject(
                        question
                    ) === questionId
            );

        if (index !== -1) {

            currentQuestionIndex =
                index;

            displayQuestion();

            return;
        }
    }

    currentQuestionIndex = 0;

    displayQuestion();
}


/* =========================================================
   DISPLAY QUESTION
   ========================================================= */

function displayQuestion() {

    if (
        currentQuestionIndex < 0 ||
        currentQuestionIndex >= questions.length
    ) {
        return;
    }

    currentQuestion =
        questions[currentQuestionIndex];

    const questionContainer =
        document.getElementById(
            "question-container"
        );

    const error =
        document.getElementById("error");

    const questionElement =
        document.getElementById("question");

    if (questionContainer) {
        questionContainer.classList.remove(
            "hidden"
        );
    }

    if (error) {
        error.classList.add("hidden");
    }

    if (questionElement) {

        const questionText =
            getQuestionText(
                currentQuestion
            );

        questionElement.innerText =
            questionText ||
            "Question unavailable.";
    }

    createOptions();

    restoreAnswerState();

    updateNavigation();

    updateScore();

    loadMotivationalQuote();
}


/* =========================================================
   GET QUESTION TEXT
   Robust against different CSV headers
   ========================================================= */

function getQuestionText(question) {

    if (!question) {
        return "";
    }

    const possibleKeys = [

        "question",

        "Question",

        "QUESTION",

        "question text",

        "Question Text",

        "QUESTION TEXT",

        "question_text",

        "Question_Text",

        "QUESTION_TEXT",

        "question description",

        "Question Description"
    ];

    for (
        const key of possibleKeys
    ) {

        if (
            question[key] !== undefined &&
            question[key] !== null &&
            String(
                question[key]
            ).trim() !== ""
        ) {

            return String(
                question[key]
            ).trim();
        }
    }

    /*
     * Final fallback:
     * Find any column containing
     * the word "question".
     */

    const fallbackKey =
        Object.keys(question).find(
            key =>
                key
                    .replace(
                        /^\uFEFF/,
                        ""
                    )
                    .trim()
                    .toLowerCase()
                    .includes("question")
        );

    if (
        fallbackKey &&
        String(
            question[fallbackKey]
        ).trim() !== ""
    ) {

        return String(
            question[fallbackKey]
        ).trim();
    }

    return "";
}


/* =========================================================
   CREATE OPTIONS
   ========================================================= */

function createOptions() {

    const optionsContainer =
        document.getElementById(
            "options"
        );

    if (!optionsContainer) {
        return;
    }

    optionsContainer.innerHTML = "";

    const optionLetters =
        ["A", "B", "C", "D"];

    optionLetters.forEach(
        letter => {

            const optionValue =
                getOptionValue(
                    currentQuestion,
                    letter
                );

            if (!optionValue) {
                return;
            }

            const label =
                document.createElement(
                    "label"
                );

            label.className =
                "option";

            const radio =
                document.createElement(
                    "input"
                );

            radio.type =
                "radio";

            radio.name =
                "quiz-option";

            radio.value =
                letter;

            const optionLetter =
                document.createElement(
                    "span"
                );

            optionLetter.className =
                "option-letter";

            optionLetter.innerText =
                letter;

            const optionText =
                document.createElement(
                    "span"
                );

            optionText.className =
                "option-text";

            optionText.innerText =
                optionValue;

            label.appendChild(
                radio
            );

            label.appendChild(
                optionLetter
            );

            label.appendChild(
                optionText
            );

            radio.addEventListener(
                "change",
                () =>
                    checkAnswer(
                        radio,
                        label
                    )
            );

            optionsContainer.appendChild(
                label
            );
        }
    );
}


/* =========================================================
   GET OPTION VALUE
   ========================================================= */

function getOptionValue(
    question,
    letter
) {

    if (!question) {
        return "";
    }

    const possibleKeys = [

        `option ${letter}`,

        `Option ${letter}`,

        `OPTION ${letter}`,

        `option_${letter.toLowerCase()}`,

        `option_${letter}`,

        `Option_${letter}`,

        `OPTION_${letter}`,

        letter
    ];

    for (
        const key of possibleKeys
    ) {

        if (
            question[key] !== undefined &&
            question[key] !== null &&
            String(
                question[key]
            ).trim() !== ""
        ) {

            return String(
                question[key]
            ).trim();
        }
    }

    /*
     * Fallback:
     * Search for a column whose name
     * represents the requested option.
     */

    const fallbackKey =
        Object.keys(question).find(
            key => {

                const normalized =
                    key
                        .replace(
                            /^\uFEFF/,
                            ""
                        )
                        .trim()
                        .toLowerCase()
                        .replace(
                            /[_-]/g,
                            " "
                        );

                return (
                    normalized ===
                    `option ${letter.toLowerCase()}`
                );
            }
        );

    if (
        fallbackKey &&
        String(
            question[fallbackKey]
        ).trim() !== ""
    ) {

        return String(
            question[fallbackKey]
        ).trim();
    }

    return "";
}


/* =========================================================
   CHECK ANSWER
   ========================================================= */

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

    const isCorrect =
        userAnswer === correctAnswer;

    /*
     * Keep score accurate if the
     * user changes an already answered
     * question.
     */

    if (previousResult === true) {
        score--;
    }

    if (isCorrect) {
        score++;
    }

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

    updateCurrentStreak(
        questionId,
        isCorrect,
        previousResult
    );

    clearOptionStates();

    if (selectedOption) {

        selectedOption.classList.add(
            isCorrect
                ? "correct-answer"
                : "wrong-answer"
        );
    }

    if (!isCorrect) {

        highlightCorrectAnswer(
            correctAnswer
        );
    }

    const result =
        document.getElementById(
            "result"
        );

    if (result) {

        if (isCorrect) {

            result.innerHTML =
                "Correct! 🎉";

            result.className =
                "result-correct";

            showCorrectCelebration();

        } else {

            result.innerHTML =
                "Not quite. Keep learning!";

            result.className =
                "result-wrong";

            showWrongReaction();
        }
    }

    /*
     * Explanation automatically appears
     * immediately after selecting an answer.
     */

    showExplanation();

    updateScore();
}


/* =========================================================
   CURRENT STREAK
   ========================================================= */

function updateCurrentStreak(
    questionId,
    isCorrect,
    previousResult
) {

    if (
        !answerHistory.includes(
            questionId
        )
    ) {

        answerHistory.push(
            questionId
        );

        if (isCorrect) {

            currentStreak++;

        } else {

            currentStreak = 0;
        }

        return;
    }

    const historyIndex =
        answerHistory.indexOf(
            questionId
        );

    if (historyIndex === -1) {
        return;
    }

    questionResults.set(
        questionId,
        isCorrect
    );

    let streak = 0;

    for (
        let i =
            answerHistory.length - 1;
        i >= 0;
        i--
    ) {

        const id =
            answerHistory[i];

        const result =
            questionResults.get(id);

        if (result === true) {

            streak++;

        } else {

            break;
        }
    }

    currentStreak =
        streak;
}


/* =========================================================
   RESTORE ANSWER STATE
   ========================================================= */

function restoreAnswerState() {

    const questionId =
        getQuestionId();

    const savedAnswer =
        savedAnswers.get(
            questionId
        );

    const savedResult =
        questionResults.get(
            questionId
        );

    clearOptionStates();

    const result =
        document.getElementById(
            "result"
        );

    if (result) {

        result.innerHTML = "";

        result.className = "";
    }

    if (!savedAnswer) {

        hideExplanation();

        return;
    }

    const radios =
        document.querySelectorAll(
            'input[name="quiz-option"]'
        );

    radios.forEach(
        radio => {

            if (
                radio.value.toUpperCase() ===
                savedAnswer.toUpperCase()
            ) {

                radio.checked = true;

                const option =
                    radio.closest(
                        ".option"
                    );

                if (option) {

                    option.classList.add(
                        savedResult
                            ? "correct-answer"
                            : "wrong-answer"
                    );
                }
            }
        }
    );

    if (!savedResult) {

        highlightCorrectAnswer(
            getCorrectAnswer()
        );

        if (result) {

            result.innerHTML =
                "Not quite. Keep learning!";

            result.className =
                "result-wrong";
        }

    } else {

        if (result) {

            result.innerHTML =
                "Correct! 🎉";

            result.className =
                "result-correct";
        }
    }

    showExplanation();
}


/* =========================================================
   EXPLANATION
   ========================================================= */

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
        !explanationText
    ) {
        return;
    }

    const text =
        getExplanationText(
            currentQuestion
        );

    explanationText.innerText =
        text ||
        "Explanation not available.";

    explanation.classList.remove(
        "hidden"
    );
}


/* =========================================================
   GET EXPLANATION
   ========================================================= */

function getExplanationText(
    question
) {

    if (!question) {
        return "";
    }

    const possibleKeys = [

        "explanation",

        "Explanation",

        "EXPLANATION",

        "explaination",

        "Explaination",

        "EXPLAINATION",

        "explanation text",

        "Explanation Text",

        "explanation_text",

        "Explanation_Text"
    ];

    for (
        const key of possibleKeys
    ) {

        if (
            question[key] !== undefined &&
            question[key] !== null &&
            String(
                question[key]
            ).trim() !== ""
        ) {

            return String(
                question[key]
            ).trim();
        }
    }

    const fallbackKey =
        Object.keys(question).find(
            key =>
                key
                    .replace(
                        /^\uFEFF/,
                        ""
                    )
                    .trim()
                    .toLowerCase()
                    .includes(
                        "explanation"
                    )
        );

    if (
        fallbackKey &&
        String(
            question[fallbackKey]
        ).trim() !== ""
    ) {

        return String(
            question[fallbackKey]
        ).trim();
    }

    return "";
}


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


/* =========================================================
   OPTION STATES
   ========================================================= */

function clearOptionStates() {

    const options =
        document.querySelectorAll(
            ".option"
        );

    options.forEach(
        option => {

            option.classList.remove(
                "selected",
                "correct-answer",
                "wrong-answer"
            );
        }
    );
}


function highlightCorrectAnswer(
    correctAnswer
) {

    const radios =
        document.querySelectorAll(
            'input[name="quiz-option"]'
        );

    radios.forEach(
        radio => {

            if (
                radio.value.toUpperCase() ===
                correctAnswer.toUpperCase()
            ) {

                const option =
                    radio.closest(
                        ".option"
                    );

                if (option) {

                    option.classList.add(
                        "correct-answer"
                    );
                }
            }
        }
    );
}


/* =========================================================
   NAVIGATION
   ========================================================= */

function navigateQuestion(
    direction
) {

    const newIndex =
        currentQuestionIndex +
        direction;

    if (
        newIndex < 0 ||
        newIndex >= questions.length
    ) {
        return;
    }

    currentQuestionIndex =
        newIndex;

    const questionId =
        getQuestionId();

    const url =
        new URL(
            window.location.href
        );

    url.searchParams.set(
        "id",
        questionId
    );

    history.pushState(
        {},
        "",
        url
    );

    displayQuestion();
}


function handlePopState() {

    loadQuestionFromURL();
}


/* =========================================================
   NAVIGATION UI
   ========================================================= */

function updateNavigation() {

    const previousButton =
        document.getElementById(
            "previous-button"
        );

    const nextButton =
        document.getElementById(
            "next-button"
        );

    const position =
        document.getElementById(
            "question-position"
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

    /*
     * Question number intentionally
     * remains hidden.
     */

    if (position) {

        position.innerText = "";
    }
}


/* =========================================================
   SCORE / STREAK
   ========================================================= */

function updateScore() {

    const scoreDisplay =
        document.getElementById(
            "score-display"
        );

    if (!scoreDisplay) {
        return;
    }

    scoreDisplay.innerHTML =
        `🔥 Current streak: <strong>${currentStreak}</strong>`;
}


/* =========================================================
   MOTIVATIONAL QUOTE
   ========================================================= */

function loadMotivationalQuote() {

    if (!quotes.length) {
        return;
    }

    let randomIndex;

    if (quotes.length === 1) {

        randomIndex = 0;

    } else {

        do {

            randomIndex =
                Math.floor(
                    Math.random() *
                    quotes.length
                );

        } while (
            randomIndex ===
            lastQuoteIndex
        );
    }

    lastQuoteIndex =
        randomIndex;

    const selectedQuote =
        quotes[randomIndex];

    const quoteText =
        document.getElementById(
            "quote-text"
        );

    const quoteAuthor =
        document.getElementById(
            "quote-author"
        );

    if (quoteText) {

        quoteText.innerText =
            `“${selectedQuote.quote}”`;
    }

    if (quoteAuthor) {

        quoteAuthor.innerText =
            selectedQuote.author
                ? `— ${selectedQuote.author}`
                : "— AIBrainBox";
    }
}


/* =========================================================
   KEYBOARD NAVIGATION
   ========================================================= */

function handleKeyboardNavigation(
    event
) {

    const tag =
        event.target.tagName.toLowerCase();

    if (
        tag === "input" ||
        tag === "textarea"
    ) {
        return;
    }

    if (
        event.key === "ArrowLeft"
    ) {

        navigateQuestion(-1);

    } else if (
        event.key === "ArrowRight"
    ) {

        navigateQuestion(1);
    }
}


/* =========================================================
   HAPPY EMOJI CELEBRATION
   ========================================================= */

function showCorrectCelebration() {

    const happyEmojis = [

        "🎉",
        "🥳",
        "😊",
        "✨",
        "❤️",
        "🤩",
        "👏",
        "🔥"
    ];

    for (
        let i = 0;
        i < 8;
        i++
    ) {

        setTimeout(
            () => {

                createEmojiBurst(

                    happyEmojis[
                        Math.floor(
                            Math.random() *
                            happyEmojis.length
                        )
                    ],

                    "happy"
                );

            },
            i * 100
        );
    }
}


/* =========================================================
   SAD EMOJI REACTION
   ========================================================= */

function showWrongReaction() {

    const sadEmojis = [

        "😢",
        "😞",
        "😭",
        "💔",
        "🥺",
        "😔",
        "🙁"
    ];

    for (
        let i = 0;
        i < 5;
        i++
    ) {

        setTimeout(
            () => {

                createEmojiBurst(

                    sadEmojis[
                        Math.floor(
                            Math.random() *
                            sadEmojis.length
                        )
                    ],

                    "sad"
                );

            },
            i * 120
        );
    }
}


/* =========================================================
   FLOATING EMOJI
   ========================================================= */

function createEmojiBurst(
    emoji,
    type
) {

    const element =
        document.createElement(
            "div"
        );

    element.className =
        `emoji-burst ${type}`;

    element.innerText =
        emoji;

    const startLeft =
        10 +
        Math.random() * 80;

    const startTop =
        55 +
        Math.random() * 25;

    const drift =
        (Math.random() - 0.5) *
        160;

    const rotation =
        (Math.random() - 0.5) *
        50;

    const duration =
        1200 +
        Math.random() * 900;

    element.style.position =
        "fixed";

    element.style.left =
        `${startLeft}%`;

    element.style.top =
        `${startTop}%`;

    element.style.zIndex =
        "99999";

    element.style.pointerEvents =
        "none";

    element.style.userSelect =
        "none";

    element.style.fontSize =
        `${28 + Math.random() * 18}px`;

    element.style.lineHeight =
        "1";

    element.style.willChange =
        "transform, opacity";

    element.style.opacity =
        "1";

    element.style.transition =
        `transform ${duration}ms ease-out, opacity ${duration}ms ease-out`;

    document.body.appendChild(
        element
    );

    /*
     * Two animation frames ensure
     * the browser registers the
     * starting position first.
     */

    requestAnimationFrame(
        () => {

            requestAnimationFrame(
                () => {

                    element.style.transform =
                        `translate(${drift}px, -${180 + Math.random() * 180}px) rotate(${rotation}deg) scale(1.15)`;

                    element.style.opacity =
                        "0";
                }
            );
        }
    );

    setTimeout(
        () => {

            element.remove();

        },
        duration + 100
    );
}


/* =========================================================
   QUESTION ID
   ========================================================= */

function getQuestionId() {

    return getQuestionIdFromObject(
        currentQuestion
    );
}


function getQuestionIdFromObject(
    question
) {

    if (!question) {
        return "";
    }

    const possibleKeys = [

        "id",

        "ID",

        "Id",

        "question id",

        "Question ID",

        "QUESTION ID",

        "question_id",

        "Question_ID",

        "QUESTION_ID"
    ];

    for (
        const key of possibleKeys
    ) {

        if (
            question[key] !== undefined &&
            question[key] !== null &&
            String(
                question[key]
            ).trim() !== ""
        ) {

            return String(
                question[key]
            ).trim();
        }
    }

    return "";
}


/* =========================================================
   CORRECT ANSWER
   ========================================================= */

function getCorrectAnswer() {

    if (!currentQuestion) {
        return "";
    }

    const possibleKeys = [

        "correct answer",

        "Correct Answer",

        "CORRECT ANSWER",

        "correct_answer",

        "Correct_Answer",

        "CORRECT_ANSWER",

        "answer",

        "Answer",

        "correct",

        "Correct"
    ];

    for (
        const key of possibleKeys
    ) {

        if (
            currentQuestion[key] !== undefined &&
            currentQuestion[key] !== null &&
            String(
                currentQuestion[key]
            ).trim() !== ""
        ) {

            return String(
                currentQuestion[key]
            )
                .trim()
                .toUpperCase();
        }
    }

    /*
     * Fallback for differently named
     * correct-answer columns.
     */

    const fallbackKey =
        Object.keys(
            currentQuestion
        ).find(
            key => {

                const normalized =
                    key
                        .replace(
                            /^\uFEFF/,
                            ""
                        )
                        .trim()
                        .toLowerCase()
                        .replace(
                            /[_-]/g,
                            " "
                        );

                return (
                    normalized.includes(
                        "correct"
                    ) &&
                    (
                        normalized.includes(
                            "answer"
                        ) ||
                        normalized ===
                            "correct"
                    )
                );
            }
        );

    if (
        fallbackKey &&
        String(
            currentQuestion[
                fallbackKey
            ]
        ).trim() !== ""
    ) {

        return String(
            currentQuestion[
                fallbackKey
            ]
        )
            .trim()
            .toUpperCase();
    }

    return "";
}


/* =========================================================
   CSV PARSER
   ========================================================= */

function parseCSV(
    csvText
) {

    const rows = [];

    let row = [];

    let cell = "";

    let insideQuotes =
        false;

    for (
        let i = 0;
        i < csvText.length;
        i++
    ) {

        const char =
            csvText[i];

        const nextChar =
            csvText[i + 1];

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

            cell = "";

            if (
                row.some(
                    value =>
                        String(
                            value
                        ).trim() !== ""
                )
            ) {

                rows.push(row);
            }

            row = [];

        } else {

            cell += char;
        }
    }

    /*
     * Add final row.
     */

    if (
        cell !== "" ||
        row.length
    ) {

        row.push(cell);

        if (
            row.some(
                value =>
                    String(
                        value
                    ).trim() !== ""
            )
        ) {

            rows.push(row);
        }
    }

    if (!rows.length) {
        return [];
    }

    /*
     * Clean CSV headers:
     * - Remove BOM
     * - Trim whitespace
     */

    const headers =
        rows[0].map(
            header =>
                String(header)
                    .replace(
                        /^\uFEFF/,
                        ""
                    )
                    .trim()
        );

    return rows
        .slice(1)
        .map(values => {

            const object = {};

            headers.forEach(
                (header, index) => {

                    object[header] =
                        values[index] !== undefined
                            ? String(
                                values[index]
                            ).trim()
                            : "";
                }
            );

            return object;
        });
}


/* =========================================================
   QUOTE CSV PARSER
   ========================================================= */

function parseQuotesCSV(
    csvText
) {

    const data =
        parseCSV(csvText);

    return data

        .map(row => {

            const quote =
                row.quote ||
                row.Quote ||
                row.QUOTE ||
                row["Quote Text"] ||
                row["quote text"] ||
                row["QUOTE TEXT"] ||
                "";

            const author =
                row.author ||
                row.Author ||
                row.AUTHOR ||
                row["Quote Author"] ||
                row["quote author"] ||
                row["QUOTE AUTHOR"] ||
                "";

            return {

                quote:
                    String(
                        quote
                    ).trim(),

                author:
                    String(
                        author
                    ).trim()
            };
        })

        .filter(
            item =>
                item.quote
        );
}
