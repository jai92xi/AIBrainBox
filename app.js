/* =========================================================
   AI BRAIN BOX
   MAIN JAVASCRIPT
   ========================================================= */

"use strict";

/* =========================================================
   GLOBAL STATE
   ========================================================= */

let questions = [];
let currentQuestionIndex = -1;
let currentQuestion = null;

let score = 0;

const answeredQuestions = new Set();
const questionResults = new Map();
const savedAnswers = new Map();

let quotes = [];
let lastQuoteIndex = -1;


/* =========================================================
   FILE PATHS
   ========================================================= */

const CSV_URL = "./xi-questions.csv";
const QUOTES_URL = "./xi-Quotes.csv";

const BACKGROUNDS_API =
    "https://api.github.com/repos/jai92xi/AIBrainBox/contents/Backgrounds_Folder";

const BACKGROUND_SESSION_KEY =
    "aibrainbox-session-background";


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener("DOMContentLoaded", initializeApp);

function initializeApp() {

    /*
     * Remove the subtitle/caption under the main title.
     */
    const subtitle = document.querySelector(".brand-subtitle");

    if (subtitle) {
        subtitle.textContent = "";
        subtitle.style.display = "none";
    }

    /*
     * Make sure the quote stays inside the top header.
     */
    const header = document.querySelector(".brain-box-header");
    const quote = document.querySelector(".quote-section");

    if (header && quote && !header.contains(quote)) {
        header.appendChild(quote);
    }

    /*
     * Keep streak inside the top header.
     */
    moveScoreIntoHeader();

    /*
     * Keyboard navigation.
     */
    document.addEventListener(
        "keydown",
        handleKeyboardNavigation
    );

    /*
     * Browser back/forward.
     */
    window.addEventListener(
        "popstate",
        handlePopState
    );

    /*
     * Load application data.
     */
    loadQuestions();
    loadQuotes();
    loadSessionBackground();

    /*
     * Apply light theme through JS as a safeguard.
     */
    applyLightTheme();
}


/* =========================================================
   LIGHT THEME
   ========================================================= */

function applyLightTheme() {

    document.body.classList.add("light-theme");
    document.documentElement.classList.add("light-theme");

    document.body.style.color = "#172033";

    const overlay =
        document.getElementById("background-overlay");

    if (overlay) {
        /*
         * Keep the background visible while retaining
         * enough contrast for the light cards.
         */
        overlay.style.background =
            "rgba(255, 255, 255, 0.30)";
    }
}


/* =========================================================
   MOVE STREAK INTO HEADER
   ========================================================= */

function moveScoreIntoHeader() {

    const scoreDisplay =
        document.getElementById("score-display");

    const header =
        document.querySelector(".brain-box-header");

    if (
        scoreDisplay &&
        header &&
        !header.contains(scoreDisplay)
    ) {
        header.appendChild(scoreDisplay);
    }

    if (scoreDisplay) {
        scoreDisplay.setAttribute(
            "aria-live",
            "polite"
        );
    }
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

        const response = await fetch(
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

        questions = parseCSV(csvText);

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

        const response = await fetch(
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
   LOAD RANDOM BACKGROUND
   ========================================================= */

async function loadSessionBackground() {

    try {

        const existingVideo =
            document.getElementById(
                "session-background"
            );

        const existingImage =
            document.getElementById(
                "session-background-image"
            );

        if (existingVideo) {
            existingVideo.remove();
        }

        if (existingImage) {
            existingImage.remove();
        }

        let selectedBackground =
            sessionStorage.getItem(
                BACKGROUND_SESSION_KEY
            );

        /*
         * Pick a new background only if the current
         * browser session does not already have one.
         */
        if (!selectedBackground) {

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

            /*
             * IMPORTANT:
             * Do NOT restrict by file extension.
             * Every actual file in Backgrounds_Folder
             * is eligible.
             */
            const availableFiles =
                files.filter(
                    file =>
                        file.type === "file" &&
                        file.download_url
                );

            if (!availableFiles.length) {
                return;
            }

            const randomIndex =
                Math.floor(
                    Math.random() *
                    availableFiles.length
                );

            const selectedFile =
                availableFiles[randomIndex];

            selectedBackground =
                JSON.stringify({
                    name:
                        selectedFile.name,

                    url:
                        selectedFile.download_url
                });

            sessionStorage.setItem(
                BACKGROUND_SESSION_KEY,
                selectedBackground
            );
        }

        const backgroundData =
            JSON.parse(
                selectedBackground
            );

        if (
            !backgroundData ||
            !backgroundData.url
        ) {
            throw new Error(
                "Invalid background data."
            );
        }

        createBackgroundElement(
            backgroundData.url,
            backgroundData.name
        );

    } catch (err) {

        console.warn(
            "Background could not be loaded:",
            err
        );
    }
}


/* =========================================================
   CREATE BACKGROUND ELEMENT
   ========================================================= */

function createBackgroundElement(
    url,
    fileName
) {

    const overlay =
        document.getElementById(
            "background-overlay"
        );

    const existingVideo =
        document.getElementById(
            "session-background"
        );

    const existingImage =
        document.getElementById(
            "session-background-image"
        );

    if (existingVideo) {
        existingVideo.remove();
    }

    if (existingImage) {
        existingImage.remove();
    }

    const extension =
        getFileExtension(fileName);

    const videoExtensions = [
        "mp4",
        "webm",
        "ogg",
        "ogv",
        "mov",
        "m4v"
    ];

    const imageExtensions = [
        "jpg",
        "jpeg",
        "png",
        "webp",
        "gif",
        "avif",
        "bmp",
        "svg"
    ];

    /*
     * VIDEO
     */
    if (
        videoExtensions.includes(
            extension
        )
    ) {

        const video =
            document.createElement(
                "video"
            );

        video.id =
            "session-background";

        video.autoplay = true;
        video.muted = true;
        video.loop = true;
        video.playsInline = true;

        video.setAttribute(
            "aria-hidden",
            "true"
        );

        video.src = url;

        styleBackgroundElement(video);

        if (overlay) {
            document.body.insertBefore(
                video,
                overlay
            );
        } else {
            document.body.prepend(video);
        }

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

        return;
    }

    /*
     * IMAGE
     */
    if (
        imageExtensions.includes(
            extension
        )
    ) {

        const image =
            document.createElement(
                "img"
            );

        image.id =
            "session-background-image";

        image.src = url;
        image.alt = "";

        image.setAttribute(
            "aria-hidden",
            "true"
        );

        styleBackgroundElement(image);

        if (overlay) {
            document.body.insertBefore(
                image,
                overlay
            );
        } else {
            document.body.prepend(image);
        }

        return;
    }

    /*
     * Unknown file type:
     * Try it as an image.
     */
    const fallbackImage =
        document.createElement(
            "img"
        );

    fallbackImage.id =
        "session-background-image";

    fallbackImage.src = url;
    fallbackImage.alt = "";

    fallbackImage.setAttribute(
        "aria-hidden",
        "true"
    );

    styleBackgroundElement(
        fallbackImage
    );

    fallbackImage.onerror =
        () => {
            fallbackImage.remove();
        };

    if (overlay) {
        document.body.insertBefore(
            fallbackImage,
            overlay
        );
    } else {
        document.body.prepend(
            fallbackImage
        );
    }
}


/* =========================================================
   BACKGROUND ELEMENT STYLING
   ========================================================= */

function styleBackgroundElement(
    element
) {

    element.style.position = "fixed";
    element.style.top = "0";
    element.style.left = "0";

    element.style.width = "100%";
    element.style.height = "100%";

    element.style.objectFit = "cover";

    element.style.zIndex = "-3";

    element.style.pointerEvents =
        "none";

    element.style.userSelect =
        "none";
}


/* =========================================================
   GET FILE EXTENSION
   ========================================================= */

function getFileExtension(
    fileName
) {

    if (!fileName) {
        return "";
    }

    const cleanName =
        fileName
            .split("?")[0]
            .split("#")[0];

    const parts =
        cleanName.split(".");

    if (parts.length < 2) {
        return "";
    }

    return parts[
        parts.length - 1
    ].toLowerCase();
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

    /*
     * QUESTION
     *
     * Render HTML so keywords can be bold.
     */
    if (questionElement) {

        const questionText =
            getQuestionText(
                currentQuestion
            );

        questionElement.innerHTML =
            highlightKeywords(
                questionText ||
                "Question unavailable.",
                currentQuestion
            );
    }

    /*
     * NAVIGATION
     *
     * Navigation comes directly from:
     *
     * previous related question
     * next related question
     *
     * columns in xi-questions.csv
     */
    createRelatedNavigation();

    /*
     * OPTIONS
     */
    createOptions();

    /*
     * Restore previously selected answer.
     */
    restoreAnswerState();

    /*
     * STREAK
     */
    updateScore();

    /*
     * Quote remains inside the top box.
     */
    loadMotivationalQuote();
}


/* =========================================================
   GET QUESTION TEXT
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
                normalizeHeader(key)
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

    optionsContainer.innerHTML = "";

    const letters = [
        "A",
        "B",
        "C",
        "D",
        "E",
        "F"
    ];

    letters.forEach(
        letter => {

            const optionValue =
                getOptionValue(
                    currentQuestion,
                    letter
                );

            if (
                !optionValue
            ) {
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

            radio.autocomplete =
                "off";

            const optionLetter =
                document.createElement(
                    "span"
                );

            optionLetter.className =
                "option-letter";

            optionLetter.textContent =
                letter;

            const optionText =
                document.createElement(
                    "span"
                );

            optionText.className =
                "option-text";

            /*
             * Render highlighted keywords.
             */
            optionText.innerHTML =
                highlightKeywords(
                    optionValue,
                    currentQuestion
                );

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

            label.addEventListener(
                "click",
                () => {
                    if (!radio.disabled) {
                        radio.focus();
                    }
                }
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

    const normalizedTarget =
        `option ${letter.toLowerCase()}`;

    const fallbackKey =
        Object.keys(
            question
        ).find(
            key =>
                normalizeHeader(key) ===
                normalizedTarget
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

    if (
        !selected ||
        !currentQuestion
    ) {
        return;
    }

    const questionId =
        getQuestionId();

    const userAnswer =
        selected.value
            .trim()
            .toUpperCase();

    const correctAnswer =
        getCorrectAnswer()
            .trim()
            .toUpperCase();

    const previousResult =
        questionResults.get(
            questionId
        );

    const isCorrect =
        userAnswer ===
        correctAnswer;

    /*
     * If the user changes an already answered
     * question, adjust the score correctly.
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

    clearOptionStates();

    if (selectedOption) {

        selectedOption.classList.add(
            isCorrect
                ? "correct-answer"
                : "wrong-answer"
        );
    }

    /*
     * Always show the correct answer after
     * a wrong selection.
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
                "result result-correct";

            showCorrectCelebration();

        } else {

            result.innerHTML =
                "Not quite. Keep learning!";

            result.className =
                "result result-wrong";

            showWrongReaction();
        }
    }

    /*
     * Explanation opens immediately.
     */
    showExplanation();

    /*
     * Update current streak display.
     *
     * Format:
     * Current streak: 2/3
     *
     * Numerator = correct answers
     * Denominator = answered questions
     *
     * Wrong answers do NOT reset it to 0.
     */
    updateScore();
}


/* =========================================================
   RELATED QUESTION NAVIGATION
   ========================================================= */

function createRelatedNavigation() {

    const existingNavigation =
        document.querySelector(
            ".related-navigation"
        );

    if (existingNavigation) {
        existingNavigation.remove();
    }

    const questionContainer =
        document.getElementById(
            "question-container"
        );

    if (!questionContainer) {
        return;
    }

    const navigation =
        document.createElement(
            "div"
        );

    navigation.className =
        "related-navigation";

    /*
     * Previous and next IDs come directly
     * from the CSV columns.
     */
    const previousId =
        getRelatedQuestionId(
            currentQuestion,
            "previous"
        );

    const nextId =
        getRelatedQuestionId(
            currentQuestion,
            "next"
        );

    /*
     * PREVIOUS BUTTON
     */
    const previousButton =
        document.createElement(
            "button"
        );

    previousButton.type =
        "button";

    previousButton.className =
        "related-question previous-related";

    previousButton.innerHTML =
        "←";

    previousButton.setAttribute(
        "aria-label",
        "Previous related question"
    );

    previousButton.title =
        previousId
            ? `Previous: ${previousId}`
            : "Previous question";

    previousButton.disabled =
        !previousId;

    previousButton.addEventListener(
        "click",
        () => {

            if (previousId) {
                navigateToQuestionId(
                    previousId
                );
            }
        }
    );

    /*
     * NEXT BUTTON
     */
    const nextButton =
        document.createElement(
            "button"
        );

    nextButton.type =
        "button";

    nextButton.className =
        "related-question next-related";

    nextButton.innerHTML =
        "→";

    nextButton.setAttribute(
        "aria-label",
        "Next related question"
    );

    nextButton.title =
        nextId
            ? `Next: ${nextId}`
            : "Next question";

    nextButton.disabled =
        !nextId;

    nextButton.addEventListener(
        "click",
        () => {

            if (nextId) {
                navigateToQuestionId(
                    nextId
                );
            }
        }
    );

    navigation.appendChild(
        previousButton
    );

    navigation.appendChild(
        nextButton
    );

    /*
     * Put navigation at the TOP of the
     * question container so it does not
     * move downward with the options.
     */
    questionContainer.insertBefore(
        navigation,
        questionContainer.firstChild
    );
}


/* =========================================================
   GET RELATED QUESTION ID
   ========================================================= */

function getRelatedQuestionId(
    question,
    direction
) {

    if (!question) {
        return "";
    }

    const keys =
        direction === "previous"
            ? [
                "previous related question",
                "Previous Related Question",
                "previous_related_question",
                "Previous_Related_Question",
                "previous",
                "Previous"
            ]
            : [
                "next related question",
                "Next Related Question",
                "next_related_question",
                "Next_Related_Question",
                "next",
                "Next"
            ];

    for (
        const key of keys
    ) {

        if (
            question[key] !== undefined &&
            question[key] !== null
        ) {

            const value =
                String(
                    question[key]
                ).trim();

            if (value) {
                return extractFirstQuestionId(
                    value
                );
            }
        }
    }

    const target =
        direction === "previous"
            ? "previous related question"
            : "next related question";

    const fallbackKey =
        Object.keys(
            question
        ).find(
            key =>
                normalizeHeader(key) ===
                target
        );

    if (fallbackKey) {

        const value =
            String(
                question[fallbackKey]
            ).trim();

        if (value) {
            return extractFirstQuestionId(
                value
            );
        }
    }

    return "";
}


/* =========================================================
   EXTRACT QUESTION ID
   ========================================================= */

function extractFirstQuestionId(
    value
) {

    if (!value) {
        return "";
    }

    /*
     * The CSV may contain one ID or multiple
     * related IDs separated by comma/semicolon/pipe.
     *
     * For arrow navigation, use the first valid ID.
     */
    const parts =
        value
            .split(
                /[,;|\/\n]+/
            )
            .map(
                item =>
                    item.trim()
            )
            .filter(Boolean);

    if (!parts.length) {
        return "";
    }

    /*
     * Prefer an Xi-style ID.
     */
    const xiId =
        parts.find(
            item =>
                /^Xi-\d+$/i.test(
                    item
                )
        );

    if (xiId) {
        return xiId;
    }

    /*
     * Otherwise return the first value.
     */
    return parts[0];
}


/* =========================================================
   NAVIGATE TO QUESTION ID
   ========================================================= */

function navigateToQuestionId(
    questionId
) {

    if (!questionId) {
        return;
    }

    const normalizedTarget =
        questionId
            .trim()
            .toLowerCase();

    const index =
        questions.findIndex(
            question =>
                getQuestionIdFromObject(
                    question
                )
                    .trim()
                    .toLowerCase() ===
                normalizedTarget
        );

    if (index === -1) {

        console.warn(
            `Related question not found: ${questionId}`
        );

        return;
    }

    currentQuestionIndex =
        index;

    const url =
        new URL(
            window.location.href
        );

    url.searchParams.set(
        "id",
        getQuestionIdFromObject(
            questions[index]
        )
    );

    window.history.pushState(
        {},
        "",
        url
    );

    displayQuestion();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
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

    const explanation =
        document.getElementById(
            "explanation"
        );

    const result =
        document.getElementById(
            "result"
        );

    clearOptionStates();

    /*
     * New/unanswered question.
     */
    if (!savedAnswer) {

        hideExplanation();

        if (result) {
            result.innerHTML = "";
            result.className =
                "result";
        }

        return;
    }

    const radio =
        document.querySelector(
            `input[name="quiz-option"][value="${CSS.escape(savedAnswer)}"]`
        );

    if (!radio) {
        return;
    }

    radio.checked = true;

    const selectedOption =
        radio.closest(".option");

    const isCorrect =
        questionResults.get(
            questionId
        );

    if (selectedOption) {

        selectedOption.classList.add(
            isCorrect
                ? "correct-answer"
                : "wrong-answer"
        );
    }

    if (!isCorrect) {

        highlightCorrectAnswer(
            getCorrectAnswer()
        );
    }

    if (result) {

        if (isCorrect) {

            result.innerHTML =
                "Correct! 🎉";

            result.className =
                "result result-correct";

        } else {

            result.innerHTML =
                "Not quite. Keep learning!";

            result.className =
                "result result-wrong";
        }
    }

    showExplanation();

    if (explanation) {
        explanation.classList.remove(
            "hidden"
        );
    }
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

    explanationText.innerHTML =
        highlightKeywords(
            text ||
            "Explanation not available.",
            currentQuestion
        );

    /*
     * Explanation is displayed immediately
     * below the options/result area.
     */
    explanation.classList.remove(
        "hidden"
    );

    /*
     * Make sure it is visually below options.
     */
    const options =
        document.getElementById(
            "options"
        );

    if (
        options &&
        explanation.parentElement
    ) {

        const parent =
            explanation.parentElement;

        if (
            explanation.previousElementSibling !==
            parent.querySelector(".result")
        ) {
            parent.appendChild(
                explanation
            );
        }
    }
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
                normalizeHeader(key)
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
                radio.value
                    .toUpperCase() ===
                correctAnswer
                    .toUpperCase()
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
   NAVIGATE BY POSITION
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
        getQuestionIdFromObject(
            questions[newIndex]
        );

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

    displayQuestion();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================================
   UPDATE CURRENT STREAK
   ========================================================= */

function updateScore() {

    const scoreDisplay =
        document.getElementById(
            "score-display"
        );

    if (!scoreDisplay) {
        return;
    }

    const answered =
        answeredQuestions.size;

    let correct = 0;

    questionResults.forEach(
        result => {

            if (result === true) {
                correct++;
            }
        }
    );

    score = correct;

    scoreDisplay.innerHTML =
        `🔥 Current streak: <strong>${correct}/${answered}</strong>`;
}


/* =========================================================
   GET QUESTION ID
   ========================================================= */

function getQuestionId() {

    if (!currentQuestion) {
        return "";
    }

    return getQuestionIdFromObject(
        currentQuestion
    );
}


/* =========================================================
   GET QUESTION ID FROM OBJECT
   ========================================================= */

function getQuestionIdFromObject(
    question
) {

    if (!question) {
        return "";
    }

    const possibleKeys = [
        "ID",
        "Id",
        "id",
        "Question ID",
        "Question Id",
        "question id",
        "question_id",
        "Question_ID"
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
                normalizeHeader(key) ===
                "id"
        );

    if (fallbackKey) {

        return String(
            question[fallbackKey]
        ).trim();
    }

    return "";
}


/* =========================================================
   GET CORRECT ANSWER
   ========================================================= */

function getCorrectAnswer() {

    if (!currentQuestion) {
        return "";
    }

    const possibleKeys = [
        "Correct Answer",
        "Correct answer",
        "correct answer",
        "correct_answer",
        "Correct_Answer",
        "ANSWER",
        "Answer",
        "answer"
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
                .toUpperCase()
                .replace(
                    /[^A-Z]/g,
                    ""
                );
        }
    }

    const fallbackKey =
        Object.keys(
            currentQuestion
        ).find(
            key =>
                normalizeHeader(key) ===
                "correct answer"
        );

    if (fallbackKey) {

        return String(
            currentQuestion[fallbackKey]
        )
            .trim()
            .toUpperCase()
            .replace(
                /[^A-Z]/g,
                ""
            );
    }

    return "";
}


/* =========================================================
   KEYWORD EXTRACTION
   ========================================================= */

function getKeywords(
    question
) {

    if (!question) {
        return [];
    }

    const keywords = [];

    /*
     * Explicit keyword columns if present.
     */
    const explicitKeywordKeys =
        Object.keys(
            question
        ).filter(
            key => {

                const normalized =
                    normalizeHeader(key);

                return (
                    normalized === "keywords" ||
                    normalized === "keyword" ||
                    normalized.includes(
                        "key words"
                    )
                );
            }
        );

    explicitKeywordKeys.forEach(
        key => {

            const value =
                String(
                    question[key] ?? ""
                ).trim();

            if (value) {

                value
                    .split(
                        /[,;|]+/
                    )
                    .map(
                        item =>
                            item.trim()
                    )
                    .filter(Boolean)
                    .forEach(
                        item =>
                            keywords.push(item)
                    );
            }
        }
    );

    /*
     * Topic.
     */
    const topic =
        getColumnValue(
            question,
            [
                "Topic",
                "topic"
            ]
        );

    if (topic) {
        keywords.push(
            ...splitKeywordValues(
                topic
            )
        );
    }

    /*
     * Sub Topics.
     */
    const subTopics =
        getColumnValue(
            question,
            [
                "Sub Topics",
                "Sub Topic",
                "sub topics",
                "sub topic",
                "Sub_Topics",
                "Sub_Topic"
            ]
        );

    if (subTopics) {

        keywords.push(
            ...splitKeywordValues(
                subTopics
            )
        );
    }

    /*
     * De-duplicate and remove very short terms.
     */
    const unique =
        new Map();

    keywords.forEach(
        keyword => {

            const clean =
                String(
                    keyword
                )
                    .replace(
                        /^["']|["']$/g,
                        ""
                    )
                    .trim();

            if (
                clean.length >= 2
            ) {

                unique.set(
                    clean.toLowerCase(),
                    clean
                );
            }
        }
    );

    return Array.from(
        unique.values()
    );
}


/* =========================================================
   SPLIT KEYWORD VALUES
   ========================================================= */

function splitKeywordValues(
    value
) {

    return String(
        value
    )
        .split(
            /[,;|]+/
        )
        .map(
            item =>
                item.trim()
        )
        .filter(Boolean);
}


/* =========================================================
   HIGHLIGHT KEYWORDS
   ========================================================= */

function highlightKeywords(
    text,
    question
) {

    if (
        text === undefined ||
        text === null
    ) {
        return "";
    }

    let source =
        String(text);

    /*
     * First escape HTML so CSV content cannot inject
     * arbitrary HTML/JavaScript.
     */
    let html =
        escapeHTML(
            source
        );

    /*
     * Support markdown-style bold:
     *
     * **important**
     */
    html =
        html.replace(
            /\*\*(.+?)\*\*/g,
            "<strong>$1</strong>"
        );

    const keywords =
        getKeywords(
            question
        );

    if (!keywords.length) {
        return html;
    }

    /*
     * Sort longest first so:
     *
     * "attention mechanism"
     *
     * is processed before:
     *
     * "attention"
     */
    keywords.sort(
        (
            a,
            b
        ) =>
            b.length -
            a.length
    );

    /*
     * Protect existing HTML tags while applying
     * keyword highlighting.
     */
    const parts =
        html.split(
            /(<[^>]+>)/g
        );

    return parts
        .map(
            part => {

                if (
                    part.startsWith("<")
                ) {
                    return part;
                }

                let output =
                    part;

                keywords.forEach(
                    keyword => {

                        const escapedKeyword =
                            escapeRegExp(
                                escapeHTML(
                                    keyword
                                )
                            );

                        if (
                            !escapedKeyword
                        ) {
                            return;
                        }

                        const regex =
                            new RegExp(
                                `(^|[^\\w])(${escapedKeyword})(?=$|[^\\w])`,
                                "gi"
                            );

                        output =
                            output.replace(
                                regex,
                                "$1<strong>$2</strong>"
                            );
                    }
                );

                return output;
            }
        )
        .join("");
}


/* =========================================================
   GET COLUMN VALUE
   ========================================================= */

function getColumnValue(
    object,
    keys
) {

    if (!object) {
        return "";
    }

    for (
        const requestedKey of keys
    ) {

        if (
            object[requestedKey] !== undefined &&
            object[requestedKey] !== null
        ) {

            const value =
                String(
                    object[requestedKey]
                ).trim();

            if (value) {
                return value;
            }
        }
    }

    const normalizedKeys =
        keys.map(
            key =>
                normalizeHeader(key)
        );

    const fallback =
        Object.keys(
            object
        ).find(
            key =>
                normalizedKeys.includes(
                    normalizeHeader(key)
                )
        );

    if (fallback) {

        return String(
            object[fallback]
        ).trim();
    }

    return "";
}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(
    value
) {

    return String(
        value
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


/* =========================================================
   ESCAPE REGEX
   ========================================================= */

function escapeRegExp(
    value
) {

    return String(
        value
    ).replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
    );
}


/* =========================================================
   NORMALIZE CSV HEADER
   ========================================================= */

function normalizeHeader(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /^\uFEFF/,
            ""
        )
        .trim()
        .toLowerCase()
        .replace(
            /[_-]+/g,
            " "
        )
        .replace(
            /\s+/g,
            " "
        );
}


/* =========================================================
   LOAD MOTIVATIONAL QUOTE
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

        quoteText.innerHTML =
            `“${escapeHTML(
                selectedQuote.quote || ""
            )}”`;
    }

    if (quoteAuthor) {

        quoteAuthor.innerHTML =
            selectedQuote.author
                ? `— ${escapeHTML(
                    selectedQuote.author
                )}`
                : "— AIBrainBox";
    }

    /*
     * Ensure quote remains in the top box.
     */
    const header =
        document.querySelector(
            ".brain-box-header"
        );

    const quoteSection =
        document.querySelector(
            ".quote-section"
        );

    if (
        header &&
        quoteSection &&
        !header.contains(
            quoteSection
        )
    ) {
        header.appendChild(
            quoteSection
        );
    }
}


/* =========================================================
   KEYBOARD NAVIGATION
   ========================================================= */

function handleKeyboardNavigation(
    event
) {

    const tag =
        event.target.tagName
            ? event.target.tagName.toLowerCase()
            : "";

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

        event.preventDefault();

        navigateRelatedByKeyboard(
            "previous"
        );

    } else if (
        event.key === "ArrowRight"
    ) {

        event.preventDefault();

        navigateRelatedByKeyboard(
            "next"
        );
    }
}


/* =========================================================
   KEYBOARD RELATED NAVIGATION
   ========================================================= */

function navigateRelatedByKeyboard(
    direction
) {

    if (!currentQuestion) {
        return;
    }

    const questionId =
        getRelatedQuestionId(
            currentQuestion,
            direction
        );

    if (questionId) {

        navigateToQuestionId(
            questionId
        );
    }
}


/* =========================================================
   BROWSER HISTORY
   ========================================================= */

function handlePopState() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const questionId =
        params.get("id");

    if (!questionId) {
        return;
    }

    const index =
        questions.findIndex(
            question =>
                getQuestionIdFromObject(
                    question
                )
                    .toLowerCase() ===
                questionId.toLowerCase()
        );

    if (index !== -1) {

        currentQuestionIndex =
            index;

        displayQuestion();

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
}


/* =========================================================
   CORRECT ANSWER CELEBRATION
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
   WRONG ANSWER REACTION
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

    element.textContent =
        emoji;

    const startLeft =
        10 +
        Math.random() *
        80;

    const startTop =
        55 +
        Math.random() *
        25;

    const drift =
        (
            Math.random() -
            0.5
        ) * 160;

    const rotation =
        (
            Math.random() -
            0.5
        ) * 50;

    const duration =
        1200 +
        Math.random() *
        900;

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

    document.body.appendChild(
        element
    );

    const animation =
        element.animate(
            [
                {
                    transform:
                        "translate(-50%, 0) scale(0.7) rotate(0deg)",
                    opacity: 1
                },
                {
                    transform:
                        `translate(calc(-50% + ${drift}px), -180px) scale(1.25) rotate(${rotation}deg)`,
                    opacity: 0
                }
            ],
            {
                duration:
                    duration,
                easing:
                    "cubic-bezier(0.2, 0.7, 0.3, 1)",
                fill:
                    "forwards"
            }
        );

    animation.onfinish =
        () => {
            element.remove();
        };
}


/* =========================================================
   CSV PARSER
   ========================================================= */

function parseCSV(
    csvText
) {

    const rows =
        parseCSVRows(
            csvText
        );

    if (!rows.length) {
        return [];
    }

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

    const data = [];

    for (
        let i = 1;
        i < rows.length;
        i++
    ) {

        const row =
            rows[i];

        if (
            row.every(
                value =>
                    String(
                        value ?? ""
                    ).trim() === ""
            )
        ) {
            continue;
        }

        const object = {};

        headers.forEach(
            (
                header,
                index
            ) => {

                object[header] =
                    row[index] !== undefined
                        ? row[index]
                        : "";
            }
        );

        data.push(
            object
        );
    }

    return data;
}


/* =========================================================
   CSV ROW PARSER
   ========================================================= */

function parseCSVRows(
    text
) {

    const rows = [];
    let row = [];
    let value = "";

    let insideQuotes = false;

    for (
        let i = 0;
        i < text.length;
        i++
    ) {

        const character =
            text[i];

        const nextCharacter =
            text[i + 1];

        if (
            character === '"'
        ) {

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

            continue;
        }

        if (
            character === "," &&
            !insideQuotes
        ) {

            row.push(value);
            value = "";

            continue;
        }

        if (
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

            rows.push(row);
            row = [];

            continue;
        }

        value += character;
    }

    if (
        value !== "" ||
        row.length
    ) {

        row.push(value);
        rows.push(row);
    }

    return rows;
}


/* =========================================================
   QUOTE CSV PARSER
   ========================================================= */

function parseQuotesCSV(
    csvText
) {

    const rows =
        parseCSVRows(
            csvText
        );

    if (!rows.length) {
        return [];
    }

    const headers =
        rows[0].map(
            header =>
                normalizeHeader(
                    header
                )
        );

    const quoteIndex =
        headers.findIndex(
            header =>
                header === "quote" ||
                header.includes("quote")
        );

    const authorIndex =
        headers.findIndex(
            header =>
                header === "author" ||
                header.includes("author")
        );

    const result = [];

    for (
        let i = 1;
        i < rows.length;
        i++
    ) {

        const row =
            rows[i];

        const quote =
            quoteIndex >= 0
                ? String(
                    row[quoteIndex] ?? ""
                ).trim()
                : "";

        const author =
            authorIndex >= 0
                ? String(
                    row[authorIndex] ?? ""
                ).trim()
                : "";

        if (quote) {

            result.push({
                quote,
                author
            });
        }
    }

    return result;
}
