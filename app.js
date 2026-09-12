/* =========================================================
   AI BRAIN BOX
   ========================================================= */

let questions = [];
let currentQuestionIndex = -1;
let currentQuestion = null;


/* =========================================================
   FILE PATHS
   ========================================================= */

const CSV_URL = "./xi-questions.csv";
const QUOTES_URL = "./xi-Quotes.csv";


/* =========================================================
   QUIZ STATE
   ========================================================= */

let score = 0;

let answeredQuestions = new Set();

let questionResults = new Map();

let savedAnswers = new Map();

let currentStreak = 0;

let answerHistory = [];


/* =========================================================
   QUOTES
   ========================================================= */

let quotes = [];

let lastQuoteIndex = -1;


/* =========================================================
   BACKGROUND VIDEO
   ========================================================= */

const BACKGROUNDS_API =
    "https://api.github.com/repos/jai92xi/AIBrainBox/contents/Backgrounds_Folder";

const BACKGROUND_SESSION_KEY =
    "aibrainbox-session-background";


/* =========================================================
   START APPLICATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);


function initializeApp() {

    const previousButton =
        document.getElementById(
            "previous-button"
        );

    const nextButton =
        document.getElementById(
            "next-button"
        );


    /* Previous */

    if (previousButton) {

        previousButton.addEventListener(
            "click",
            () => navigateQuestion(-1)
        );
    }


    /* Next */

    if (nextButton) {

        nextButton.addEventListener(
            "click",
            () => navigateQuestion(1)
        );
    }


    /* Browser back / forward */

    window.addEventListener(
        "popstate",
        handlePopState
    );


    /* Keyboard navigation */

    document.addEventListener(
        "keydown",
        handleKeyboardNavigation
    );


    /* Load data */

    loadQuestions();

    loadQuotes();

    loadSessionBackground();
}


/* =========================================================
   LOAD QUESTIONS
   ========================================================= */

async function loadQuestions() {

    const loading =
        document.getElementById(
            "loading"
        );

    const error =
        document.getElementById(
            "error"
        );


    try {

        if (loading) {

            loading.classList.remove(
                "hidden"
            );
        }

        if (error) {

            error.classList.add(
                "hidden"
            );
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

            loading.classList.add(
                "hidden"
            );
        }


        loadQuestionFromURL();


    } catch (err) {

        console.error(
            "Question loading error:",
            err
        );


        if (loading) {

            loading.classList.add(
                "hidden"
            );
        }


        if (error) {

            error.textContent =
                "Unable to load questions. Please refresh the page.";

            error.classList.remove(
                "hidden"
            );
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
   LOAD RANDOM SESSION BACKGROUND
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

        /*
         * Check whether a background was
         * already selected during this session.
         */

        let selectedVideo =
            sessionStorage.getItem(
                BACKGROUND_SESSION_KEY
            );


        /*
         * If there is no session video,
         * retrieve the MP4 files from GitHub.
         */

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
                        /\.mp4$/i.test(
                            file.name
                        )
                );


            if (!videoFiles.length) {

                console.warn(
                    "No MP4 background videos found."
                );

                return;
            }


            /*
             * Pick one random video.
             */

            const randomIndex =
                Math.floor(
                    Math.random() *
                    videoFiles.length
                );


            selectedVideo =
                videoFiles[
                    randomIndex
                ].download_url;


            /*
             * Save it so the same video
             * remains during this session.
             */

            sessionStorage.setItem(
                BACKGROUND_SESSION_KEY,
                selectedVideo
            );
        }


        /*
         * Set video source.
         */

        video.src =
            selectedVideo;


        video.load();


        const playPromise =
            video.play();


        if (
            playPromise !== undefined
        ) {

            playPromise.catch(
                () => {

                    console.warn(
                        "Background video autoplay was blocked."
                    );
                }
            );
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


    /*
     * Open requested question if
     * an ID exists in the URL.
     */

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


    /*
     * Otherwise start from first question.
     */

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
        questions[
            currentQuestionIndex
        ];


    const questionContainer =
        document.getElementById(
            "question-container"
        );


    const error =
        document.getElementById(
            "error"
        );


    const questionElement =
        document.getElementById(
            "question"
        );


    if (questionContainer) {

        questionContainer.classList.remove(
            "hidden"
        );
    }


    if (error) {

        error.classList.add(
            "hidden"
        );
    }


    /*
     * Display question text.
     */

    if (questionElement) {

        let questionText =
            getQuestionText(
                currentQuestion
            );


        /*
         * Remove markdown bold markers
         * from CSV text.
         *
         * Example:
         * **production team**
         *
         * becomes:
         * production team
         */

        questionText =
            cleanQuestionText(
                questionText
            );


        questionElement.innerText =
            questionText ||
            "Question unavailable.";
    }


    /*
     * Create answer options.
     */

    createOptions();


    /*
     * Restore previously selected answer.
     */

    restoreAnswerState();


    /*
     * Update Previous / Next buttons.
     */

    updateNavigation();


    /*
     * Update current streak.
     */

    updateScore();


    /*
     * Show motivational quote.
     */

    loadMotivationalQuote();
}


/* =========================================================
   CLEAN QUESTION TEXT
   ========================================================= */

function cleanQuestionText(text) {

    if (!text) {

        return "";
    }


    return String(text)

        /*
         * Remove **bold**
         */

        .replace(
            /\*\*/g,
            ""
        )

        /*
         * Remove unnecessary
         * Windows line endings.
         */

        .replace(
            /\r\n/g,
            "\n"
        )

        .trim();
}


/* =========================================================
   GET QUESTION TEXT
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
     * Fallback:
     * Search any column containing
     * the word "question".
     */

    const fallbackKey =
        Object.keys(
            question
        ).find(
            key =>

                key
                    .replace(
                        /^\uFEFF/,
                        ""
                    )
                    .trim()
                    .toLowerCase()
                    .includes(
                        "question"
                    )
        );


    if (

        fallbackKey &&

        String(
            question[
                fallbackKey
            ]
        ).trim() !== ""

    ) {

        return String(
            question[
                fallbackKey
            ]
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


    /*
     * Clear previous options.
     */

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

            const optionValue =
                getOptionValue(
                    currentQuestion,
                    letter
                );


            /*
             * Ignore empty options.
             */

            if (!optionValue) {

                return;
            }


            /*
             * Create label.
             */

            const label =
                document.createElement(
                    "label"
                );


            label.className =
                "option";


            /*
             * Radio button.
             */

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


            /*
             * Option letter.
             */

            const optionLetter =
                document.createElement(
                    "span"
                );


            optionLetter.className =
                "option-letter";


            optionLetter.innerText =
                letter;


            /*
             * Option text.
             */

            const optionText =
                document.createElement(
                    "span"
                );


            optionText.className =
                "option-text";


            optionText.innerText =
                cleanQuestionText(
                    optionValue
                );


            /*
             * Build option.
             */

            label.appendChild(
                radio
            );

            label.appendChild(
                optionLetter
            );

            label.appendChild(
                optionText
            );


            /*
             * Check answer when selected.
             */

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
     * More flexible fallback.
     */

    const fallbackKey =
        Object.keys(
            question
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
                    normalized ===
                    `option ${letter.toLowerCase()}`
                );
            }
        );


    if (

        fallbackKey &&

        String(
            question[
                fallbackKey
            ]
        ).trim() !== ""

    ) {

        return String(
            question[
                fallbackKey
            ]
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
        userAnswer ===
        correctAnswer;


    /*
     * Correct score handling.
     */

    if (
        previousResult === true
    ) {

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


    /*
     * Update streak.
     */

    updateCurrentStreak(
        questionId,
        isCorrect
    );


    /*
     * Remove previous answer styling.
     */

    clearOptionStates();


    /*
     * Highlight selected option.
     */

    if (selectedOption) {

        selectedOption.classList.add(

            isCorrect
                ? "correct-answer"
                : "wrong-answer"

        );
    }


    /*
     * If answer is wrong,
     * show the correct answer too.
     */

    if (!isCorrect) {

        highlightCorrectAnswer(
            correctAnswer
        );
    }


    /*
     * Result message.
     */

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


            /*
             * Happy emoji animation.
             */

            showCorrectCelebration();

        } else {

            result.innerHTML =
                "Not quite. Keep learning!";

            result.className =
                "result-wrong";


            /*
             * Sad emoji animation.
             */

            showWrongReaction();
        }
    }


    /*
     * IMPORTANT:
     *
     * Explanation opens immediately
     * after selecting an option.
     */

    showExplanation();


    /*
     * Update streak display.
     */

    updateScore();
}


/* =========================================================
   UPDATE CURRENT STREAK
   ========================================================= */

function updateCurrentStreak(
    questionId,
    isCorrect
) {

    /*
     * If this is the first answer
     * for this question, add it to
     * the answer history.
     */

    if (
        !answerHistory.includes(
            questionId
        )
    ) {

        answerHistory.push(
            questionId
        );
    }


    /*
     * Recalculate streak from the
     * latest answered question.
     *
     * This means:
     *
     * Correct → streak increases
     * Wrong   → streak resets
     */

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
            questionResults.get(
                id
            );


        if (
            result === true
        ) {

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

        result.innerHTML =
            "";

        result.className =
            "";
    }


    /*
     * Question has not been answered.
     */

    if (!savedAnswer) {

        hideExplanation();

        return;
    }


    /*
     * Restore selected radio.
     */

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

                radio.checked =
                    true;


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


    /*
     * Wrong answer:
     * highlight correct answer.
     */

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

        /*
         * Correct answer.
         */

        if (result) {

            result.innerHTML =
                "Correct! 🎉";

            result.className =
                "result-correct";
        }
    }


    /*
     * Explanation remains visible
     * when revisiting an answered question.
     */

    showExplanation();
}


/* =========================================================
   SHOW EXPLANATION
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
        cleanQuestionText(
            text
        ) ||
        "Explanation not available.";


    /*
     * Remove hidden class.
     */

    explanation.classList.remove(
        "hidden"
    );
}


/* =========================================================
   GET EXPLANATION TEXT
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
        "EXPLANATION TEXT",

        "explanation_text",
        "Explanation_Text",
        "EXPLANATION_TEXT"
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
     * Fallback search.
     */

    const fallbackKey =
        Object.keys(
            question
        ).find(
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
            question[
                fallbackKey
            ]
        ).trim() !== ""

    ) {

        return String(
            question[
                fallbackKey
            ]
        ).trim();
    }


    return "";
}


/* =========================================================
   HIDE EXPLANATION
   ========================================================= */

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
   CLEAR OPTION STATES
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


/* =========================================================
   HIGHLIGHT CORRECT ANSWER
   ========================================================= */

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
   NAVIGATE QUESTIONS
   ========================================================= */

function navigateQuestion(
    direction
) {

    const newIndex =
        currentQuestionIndex +
        direction;


    /*
     * Prevent going outside
     * available questions.
     */

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


    /*
     * Update URL.
     */

    if (questionId) {

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
    }


    /*
     * Display new question.
     */

    displayQuestion();
}


/* =========================================================
   BROWSER BACK / FORWARD
   ========================================================= */

function handlePopState() {

    loadQuestionFromURL();
}


/* =========================================================
   UPDATE NAVIGATION BUTTONS
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


    /*
     * Previous disabled on first question.
     */

    if (previousButton) {

        previousButton.disabled =
            currentQuestionIndex <= 0;
    }


    /*
     * Next disabled on final question.
     */

    if (nextButton) {

        nextButton.disabled =
            currentQuestionIndex >=
            questions.length - 1;
    }


    /*
     * Question position is intentionally
     * not displayed.
     */

    const position =
        document.getElementById(
            "question-position"
        );


    if (position) {

        position.innerText =
            "";
    }
}


/* =========================================================
   UPDATE CURRENT STREAK DISPLAY
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


    /*
     * Avoid showing the same quote
     * consecutively.
     */

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
        quotes[
            randomIndex
        ];


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

    const target =
        event.target;


    if (!target) {

        return;
    }


    const tag =
        target.tagName.toLowerCase();


    /*
     * Don't navigate while interacting
     * with form fields.
     */

    if (

        tag === "input" ||

        tag === "textarea" ||

        tag === "button"

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


    /*
     * Random starting position.
     */

    const startLeft =
        10 +
        Math.random() * 80;


    const startTop =
        55 +
        Math.random() * 25;


    /*
     * Random movement.
     */

    const drift =
        (
            Math.random() -
            0.5
        ) *
        160;


    const rotation =
        (
            Math.random() -
            0.5
        ) *
        50;


    const duration =
        1200 +
        Math.random() * 900;


    /*
     * Styling.
     */

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


    /*
     * Add to page.
     */

    document.body.appendChild(
        element
    );


    /*
     * Start animation.
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


    /*
     * Remove after animation.
     */

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


    /*
     * Fallback:
     * If your CSV has another ID-like
     * column, try to find it.
     */

    const fallbackKey =
        Object.keys(
            question
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
                    normalized === "id" ||
                    normalized.includes(
                        "question id"
                    )
                );
            }
        );


    if (
        fallbackKey
    ) {

        return String(
            question[
                fallbackKey
            ]
        ).trim();
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
     * Flexible fallback.
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


        /*
         * Escaped quote.
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
         * Opening / closing quote.
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
         * Row separator.
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


            row.push(
                cell
            );


            cell = "";


            /*
             * Ignore completely empty rows.
             */

            if (
                row.some(
                    value =>
                        String(
                            value
                        ).trim() !== ""
                )
            ) {

                rows.push(
                    row
                );
            }


            row = [];
        }


        else {

            cell += char;
        }
    }


    /*
     * Last row.
     */

    if (

        cell !== "" ||

        row.length

    ) {

        row.push(
            cell
        );


        if (
            row.some(
                value =>
                    String(
                        value
                    ).trim() !== ""
            )
        ) {

            rows.push(
                row
            );
        }
    }


    if (!rows.length) {

        return [];
    }


    /*
     * Headers.
     */

    const headers =
        rows[0].map(
            header =>

                String(
                    header
                )
                    .replace(
                        /^\uFEFF/,
                        ""
                    )
                    .trim()
        );


    /*
     * Convert rows to objects.
     */

    return rows
        .slice(1)
        .map(
            values => {

                const object = {};


                headers.forEach(
                    (
                        header,
                        index
                    ) => {

                        object[header] =

                            values[index] !==
                            undefined

                                ? String(
                                    values[index]
                                ).trim()

                                : "";
                    }
                );


                return object;
            }
        );
}


/* =========================================================
   QUOTE CSV PARSER
   ========================================================= */

function parseQuotesCSV(
    csvText
) {

    const data =
        parseCSV(
            csvText
        );


    return data

        .map(
            row => {

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
            }
        )

        .filter(
            item =>
                item.quote
        );
}
