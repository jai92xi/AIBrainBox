/* =========================================================
   AI BRAIN BOX
   ========================================================= */

let questions = [];
let currentQuestionIndex = -1;
let currentQuestion = null;


/* =========================================================
   FILES
   ========================================================= */

const CSV_URL = "./xi-questions.csv";
const QUOTES_URL = "./xi-Quotes.csv";


/* =========================================================
   SCORE / ANSWER STATE
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
   INITIALIZE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);


function initializeApp() {

    /*
     * Old navigation buttons are no longer used.
     * Related-question navigation is generated dynamically.
     */

    const previousButton =
        document.getElementById(
            "previous-button"
        );

    const nextButton =
        document.getElementById(
            "next-button"
        );


    if (previousButton) {
        previousButton.style.display = "none";
    }

    if (nextButton) {
        nextButton.style.display = "none";
    }


    /*
     * Browser navigation.
     */

    window.addEventListener(
        "popstate",
        handlePopState
    );


    /*
     * Keyboard navigation is intentionally
     * kept disabled for related-question navigation.
     */


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
            parseQuotesCSV(
                csvText
            );


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
   RANDOM SESSION BACKGROUND
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
         * First check whether a video was already
         * selected during this browser session.
         */

        let selectedVideo =
            sessionStorage.getItem(
                BACKGROUND_SESSION_KEY
            );


        /*
         * If no video has been selected,
         * get the MP4 files from GitHub.
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
             * Save it for this browser session.
             */

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


    if (questionId) {

        const index =
            questions.findIndex(
                question =>
                    normalizeQuestionId(
                        getQuestionIdFromObject(
                            question
                        )
                    ) ===
                    normalizeQuestionId(
                        questionId
                    )
            );


        if (index !== -1) {

            currentQuestionIndex =
                index;

            displayQuestion();

            return;

        }

    }


    /*
     * Default to first question.
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
        currentQuestionIndex >=
            questions.length
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

    updateScore();

    createRelatedNavigation();

    loadMotivationalQuote();
}


/* =========================================================
   QUESTION TEXT
   ========================================================= */

function getQuestionText(
    question
) {

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
     * If this question was previously answered
     * correctly and is changed, remove that
     * previous correct count.
     */

    if (
        previousResult === true
    ) {

        score--;

    }


    /*
     * Add new correct result.
     */

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
     * Update 2/3 style score.
     */

    updateCurrentStreak(
        questionId,
        isCorrect
    );


    clearOptionStates();


    if (selectedOption) {

        selectedOption.classList.add(

            isCorrect
                ? "correct-answer"
                : "wrong-answer"

        );

    }


    /*
     * If wrong, show the correct answer.
     */

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
     * Explanation automatically appears.
     */

    showExplanation();


    /*
     * Update score immediately.
     */

    updateScore();
}


/* =========================================================
   CURRENT SCORE
   ========================================================= */

function updateCurrentStreak(
    questionId,
    isCorrect
) {

    /*
     * Keep question in history.
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
     * Count all correct answers.
     *
     * Example:
     *
     * Q1 Correct
     * Q2 Correct
     * Q3 Wrong
     *
     * Current streak = 2/3
     */

    let correctCount = 0;


    questionResults.forEach(
        result => {

            if (result === true) {

                correctCount++;

            }

        }
    );


    currentStreak =
        correctCount;
}


/* =========================================================
   UPDATE SCORE DISPLAY
   ========================================================= */

function updateScore() {

    const scoreDisplay =
        document.getElementById(
            "score-display"
        );


    if (!scoreDisplay) {
        return;
    }


    const totalAnswered =
        answeredQuestions.size;


    scoreDisplay.innerHTML =
        `🔥 Current streak: <strong>${currentStreak}/${totalAnswered}</strong>`;
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
     * Wrong answer.
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
     * when returning to an answered question.
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
   RELATED QUESTION NAVIGATION
   ========================================================= */

/*
 * This is the important new section.
 *
 * The application looks for columns such as:
 *
 * Previous related question
 * Previous Related Question
 * previous_related_question
 *
 * Next related question
 * Next Related Question
 * next_related_question
 *
 * It also supports plural versions.
 */


function createRelatedNavigation() {

    const quizWrapper =
        document.querySelector(
            ".quiz-wrapper"
        );


    if (!quizWrapper) {
        return;
    }


    /*
     * Remove previously generated navigation.
     */

    const oldNavigation =
        document.getElementById(
            "related-navigation"
        );


    if (oldNavigation) {

        oldNavigation.remove();

    }


    /*
     * Get related questions from CSV.
     */

    const previousIds =
        getRelatedQuestionIds(
            currentQuestion,
            "previous"
        );


    const nextIds =
        getRelatedQuestionIds(
            currentQuestion,
            "next"
        );


    /*
     * Create main navigation container.
     */

    const navigation =
        document.createElement(
            "div"
        );


    navigation.id =
        "related-navigation";


    navigation.className =
        "related-navigation";


    /*
     * Previous column.
     */

    const previousColumn =
        createRelatedColumn(
            "Previous related question",
            previousIds,
            "previous"
        );


    /*
     * Next column.
     */

    const nextColumn =
        createRelatedColumn(
            "Next related question",
            nextIds,
            "next"
        );


    navigation.appendChild(
        previousColumn
    );


    navigation.appendChild(
        nextColumn
    );


    /*
     * Put navigation above the quiz.
     */

    quizWrapper.parentNode.insertBefore(
        navigation,
        quizWrapper
    );
}


/* =========================================================
   CREATE RELATED COLUMN
   ========================================================= */

function createRelatedColumn(
    title,
    ids,
    type
) {

    const column =
        document.createElement(
            "div"
        );


    column.className =
        `related-column ${type}-related-column`;


    const heading =
        document.createElement(
            "div"
        );


    heading.className =
        "related-column-title";


    heading.innerText =
        title;


    column.appendChild(
        heading
    );


    const list =
        document.createElement(
            "div"
        );


    list.className =
        "related-question-list";


    /*
     * If no related questions exist,
     * show a small empty state.
     */

    if (!ids.length) {

        const empty =
            document.createElement(
                "div"
            );


        empty.className =
            "related-empty";


        empty.innerText =
            "—";


        list.appendChild(
            empty
        );

    }


    ids.forEach(
        id => {

            const normalizedId =
                normalizeQuestionId(
                    id
                );


            /*
             * Find actual question in CSV.
             */

            const questionIndex =
                questions.findIndex(
                    question =>
                        normalizeQuestionId(
                            getQuestionIdFromObject(
                                question
                            )
                        ) ===
                        normalizedId
                );


            if (
                questionIndex === -1
            ) {

                return;

            }


            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "related-question";


            /*
             * Highlight current question.
             */

            if (
                questionIndex ===
                currentQuestionIndex
            ) {

                button.classList.add(
                    "current-related-question"
                );

            }


            button.innerText =
                getQuestionIdFromObject(
                    questions[
                        questionIndex
                    ]
                );


            button.addEventListener(
                "click",
                () =>
                    navigateToQuestion(
                        questionIndex
                    )
            );


            list.appendChild(
                button
            );

        }
    );


    column.appendChild(
        list
    );


    return column;
}


/* =========================================================
   GET RELATED QUESTION IDS
   ========================================================= */

function getRelatedQuestionIds(
    question,
    direction
) {

    if (!question) {
        return [];
    }


    let possibleKeys;


    if (
        direction ===
        "previous"
    ) {

        possibleKeys = [

            "previous related question",
            "Previous related question",
            "PREVIOUS RELATED QUESTION",

            "previous related questions",
            "Previous Related Questions",
            "PREVIOUS RELATED QUESTIONS",

            "previous_related_question",
            "Previous_Related_Question",
            "PREVIOUS_RELATED_QUESTION",

            "previous_related_questions",
            "Previous_Related_Questions",
            "PREVIOUS_RELATED_QUESTIONS",

            "previous question",
            "Previous Question",

            "previous_questions",
            "previous questions"

        ];

    } else {

        possibleKeys = [

            "next related question",
            "Next related question",
            "NEXT RELATED QUESTION",

            "next related questions",
            "Next Related Questions",
            "NEXT RELATED QUESTIONS",

            "next_related_question",
            "Next_Related_Question",
            "NEXT_RELATED_QUESTION",

            "next_related_questions",
            "Next_Related_Questions",
            "NEXT_RELATED_QUESTIONS",

            "next question",
            "Next Question",

            "next_questions",
            "next questions"

        ];

    }


    let value = "";


    /*
     * Find the matching CSV column.
     */

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

            value =
                String(
                    question[key]
                ).trim();

            break;

        }

    }


    /*
     * If exact headers were not found,
     * use flexible matching.
     */

    if (!value) {

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


                    if (
                        direction ===
                        "previous"
                    ) {

                        return (
                            normalized.includes(
                                "previous"
                            ) &&
                            normalized.includes(
                                "related"
                            )
                        );

                    }


                    return (
                        normalized.includes(
                            "next"
                        ) &&
                        normalized.includes(
                            "related"
                        )
                    );

                }
            );


        if (fallbackKey) {

            value =
                String(
                    question[
                        fallbackKey
                    ]
                ).trim();

        }

    }


    if (!value) {
        return [];
    }


    /*
     * Support different ways of storing IDs.
     *
     * Example:
     *
     * Xi-00001
     *
     * Xi-00001, Xi-00002
     *
     * Xi-00001;Xi-00002
     *
     * Xi-00001 | Xi-00002
     *
     * Xi-00001
     * Xi-00002
     */

    const ids =
        value
            .split(
                /[,;|\n]+/
            )
            .map(
                item =>
                    item.trim()
            )
            .filter(
                Boolean
            );


    /*
     * Remove duplicates while keeping
     * the original CSV order.
     */

    return [
        ...new Set(
            ids.map(
                id =>
                    normalizeQuestionId(
                        id
                    )
            )
        )
    ];
}


/* =========================================================
   NAVIGATE TO QUESTION
   ========================================================= */

function navigateToQuestion(
    questionIndex
) {

    if (
        questionIndex < 0 ||
        questionIndex >=
            questions.length
    ) {

        return;

    }


    currentQuestionIndex =
        questionIndex;


    const questionId =
        getQuestionIdFromObject(
            questions[
                questionIndex
            ]
        );


    /*
     * Update URL.
     */

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


    /*
     * Scroll to top of quiz.
     */

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================================
   POPSTATE
   ========================================================= */

function handlePopState() {

    loadQuestionFromURL();
}


/* =========================================================
   MOTIVATIONAL QUOTE
   ========================================================= */

function loadMotivationalQuote() {

    if (!quotes.length) {
        return;
    }


    let randomIndex;


    if (
        quotes.length === 1
    ) {

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


    /*
     * Flexible fallback.
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


    if (fallbackKey) {

        return String(
            question[
                fallbackKey
            ]
        ).trim();

    }


    return "";
}


/* =========================================================
   NORMALIZE QUESTION ID
   ========================================================= */

function normalizeQuestionId(
    id
) {

    return String(
        id || ""
    )
        .trim()
        .toUpperCase();
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


        /*
         * Start/end quoted cell.
         */

        } else if (
            char === '"'
        ) {

            insideQuotes =
                !insideQuotes;


        /*
         * Comma outside quotes.
         */

        } else if (
            char === "," &&
            !insideQuotes
        ) {

            row.push(cell);

            cell = "";


        /*
         * New row.
         */

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
     * Last row.
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
     * Clean headers.
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


    /*
     * Convert CSV rows into objects.
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
