/* =========================================================
   AI BRAIN BOX
   MAIN JAVASCRIPT
   ========================================================= */


/* =========================================================
   GLOBAL VARIABLES
   ========================================================= */

let questions = [];

let currentQuestionIndex = -1;

let currentQuestion = null;


/* =========================================================
   FILE PATHS
   ========================================================= */

const CSV_URL =
    "./xi-questions.csv";

const QUOTES_URL =
    "./xi-Quotes.csv";


/* =========================================================
   QUIZ STATE
   ========================================================= */

let score = 0;

let answeredQuestions =
    new Set();

let questionResults =
    new Map();

let savedAnswers =
    new Map();


/* =========================================================
   QUOTES
   ========================================================= */

let quotes = [];

let lastQuoteIndex = -1;


/* =========================================================
   BACKGROUND FOLDER
   ========================================================= */

const BACKGROUNDS_API =
    "https://api.github.com/repos/jai92xi/AIBrainBox/contents/Backgrounds_Folder";


/*
 * The random background is stored here so that
 * refreshing the page does not immediately select
 * another background during the same browser session.
 */

const BACKGROUND_SESSION_KEY =
    "aibrainbox-session-background";


/* =========================================================
   INITIALIZE APPLICATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);


function initializeApp() {

    /*
     * Move streak box into the AI Brain Box header.
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
     * Browser back / forward navigation.
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
}


/* =========================================================
   MOVE STREAK INTO HEADER
   ========================================================= */

function moveScoreIntoHeader() {

    const scoreDisplay =
        document.getElementById(
            "score-display"
        );


    const header =
        document.querySelector(
            ".brain-box-header"
        );


    if (
        scoreDisplay &&
        header &&
        !header.contains(
            scoreDisplay
        )
    ) {

        header.appendChild(
            scoreDisplay
        );
    }
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
            parseCSV(
                csvText
            );


        console.log(
            "Questions loaded:",
            questions.length
        );


        if (
            questions.length > 0
        ) {

            console.log(
                "First question:",
                questions[0]
            );
        }


        if (
            !questions.length
        ) {

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


        if (
            quotes.length
        ) {

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

/*
 * IMPORTANT:
 *
 * This function NO LONGER checks only for .mp4 files.
 *
 * It gets every FILE inside Backgrounds_Folder
 * and randomly selects one.
 *
 * The selected file is saved in sessionStorage.
 *
 * Therefore:
 *
 *   New browser session  -> random background
 *   Page refresh          -> same background
 *   New browser session  -> new random background
 *
 * Supported visual formats include:
 *
 *   JPG
 *   JPEG
 *   PNG
 *   WEBP
 *   GIF
 *   MP4
 *   WEBM
 *   OGG
 *   MOV
 *
 */

async function loadSessionBackground() {

    const existingBackground =
        document.getElementById(
            "session-background"
        );


    /*
     * If the original HTML contains a
     * background element, remove it.
     *
     * A new element will be created
     * according to the selected file type.
     */

    if (
        existingBackground
    ) {

        existingBackground.remove();
    }


    try {

        /*
         * Check sessionStorage first.
         */

        let selectedBackground =
            sessionStorage.getItem(
                BACKGROUND_SESSION_KEY
            );


        /*
         * If no background has been selected
         * in this browser session, fetch the folder.
         */

        if (
            !selectedBackground
        ) {

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
             * DO NOT restrict by extension.
             *
             * Every actual file is considered.
             *
             * Directories are ignored.
             */

            const availableFiles =
                files.filter(
                    file =>
                        file.type === "file" &&
                        file.download_url
                );


            if (
                !availableFiles.length
            ) {

                console.warn(
                    "No files found in Backgrounds_Folder."
                );

                return;
            }


            /*
             * Pick a random file.
             */

            const randomIndex =
                Math.floor(
                    Math.random() *
                    availableFiles.length
                );


            const selectedFile =
                availableFiles[
                    randomIndex
                ];


            selectedBackground =
                JSON.stringify({

                    name:
                        selectedFile.name,

                    url:
                        selectedFile.download_url

                });


            /*
             * Save selected background
             * for this browser session.
             */

            sessionStorage.setItem(
                BACKGROUND_SESSION_KEY,
                selectedBackground
            );
        }


        /*
         * Read selected background.
         */

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


        /*
         * Create the appropriate background
         * element based on file extension.
         */

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

    /*
     * Find the overlay.
     */

    const overlay =
        document.getElementById(
            "background-overlay"
        );


    /*
     * Remove any existing background.
     */

    const existingVideo =
        document.getElementById(
            "session-background"
        );


    if (
        existingVideo
    ) {

        existingVideo.remove();
    }


    const existingImage =
        document.getElementById(
            "session-background-image"
        );


    if (
        existingImage
    ) {

        existingImage.remove();
    }


    /*
     * Get extension.
     */

    const extension =
        getFileExtension(
            fileName
        );


    /*
     * Video formats.
     */

    const videoExtensions = [

        "mp4",
        "webm",
        "ogg",
        "ogv",
        "mov",
        "m4v"

    ];


    /*
     * Image formats.
     */

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
     * =====================================================
     * VIDEO BACKGROUND
     * =====================================================
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


        video.autoplay =
            true;


        video.muted =
            true;


        video.loop =
            true;


        video.playsInline =
            true;


        video.setAttribute(
            "aria-hidden",
            "true"
        );


        video.src =
            url;


        /*
         * Background styling.
         *
         * CSS can also override these values.
         */

        video.style.position =
            "fixed";


        video.style.top =
            "0";


        video.style.left =
            "0";


        video.style.width =
            "100%";


        video.style.height =
            "100%";


        video.style.objectFit =
            "cover";


        video.style.zIndex =
            "-3";


        video.style.pointerEvents =
            "none";


        /*
         * Insert before overlay.
         */

        if (overlay) {

            document.body.insertBefore(
                video,
                overlay
            );

        } else {

            document.body.prepend(
                video
            );
        }


        /*
         * Try autoplay.
         */

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
     * =====================================================
     * IMAGE BACKGROUND
     * =====================================================
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


        image.src =
            url;


        image.alt =
            "";


        image.setAttribute(
            "aria-hidden",
            "true"
        );


        image.style.position =
            "fixed";


        image.style.top =
            "0";


        image.style.left =
            "0";


        image.style.width =
            "100%";


        image.style.height =
            "100%";


        image.style.objectFit =
            "cover";


        image.style.zIndex =
            "-3";


        image.style.pointerEvents =
            "none";


        /*
         * Insert before overlay.
         */

        if (overlay) {

            document.body.insertBefore(
                image,
                overlay
            );

        } else {

            document.body.prepend(
                image
            );
        }


        return;
    }


    /*
     * =====================================================
     * UNKNOWN FILE TYPE
     * =====================================================
     *
     * The requirement is to randomly pick
     * whatever is inside the folder.
     *
     * If the selected file is not a browser
     * displayable image/video, try it as an
     * image first.
     *
     * If it fails, the CSS background remains
     * visible instead of breaking the quiz.
     */

    console.warn(
        `Unsupported visual background format: ${fileName}`
    );


    const fallbackImage =
        document.createElement(
            "img"
        );


    fallbackImage.id =
        "session-background-image";


    fallbackImage.src =
        url;


    fallbackImage.alt =
        "";


    fallbackImage.setAttribute(
        "aria-hidden",
        "true"
    );


    fallbackImage.style.position =
        "fixed";


    fallbackImage.style.top =
        "0";


    fallbackImage.style.left =
        "0";


    fallbackImage.style.width =
        "100%";


    fallbackImage.style.height =
        "100%";


    fallbackImage.style.objectFit =
        "cover";


    fallbackImage.style.zIndex =
        "-3";


    fallbackImage.style.pointerEvents =
        "none";


    fallbackImage.onerror =
        () => {

            console.warn(
                `The selected background cannot be displayed: ${fileName}`
            );


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
   GET FILE EXTENSION
   ========================================================= */

function getFileExtension(
    fileName
) {

    if (
        !fileName
    ) {

        return "";
    }


    const cleanName =
        fileName
            .split("?")[0]
            .split("#")[0];


    const parts =
        cleanName.split(".");


    if (
        parts.length < 2
    ) {

        return "";
    }


    return parts[
        parts.length - 1
    ]
        .toLowerCase();
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
        params.get(
            "id"
        );


    if (
        questionId
    ) {

        const index =
            questions.findIndex(
                question =>
                    getQuestionIdFromObject(
                        question
                    ) === questionId
            );


        if (
            index !== -1
        ) {

            currentQuestionIndex =
                index;

            displayQuestion();

            return;
        }
    }


    currentQuestionIndex =
        0;


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


    if (
        questionContainer
    ) {

        questionContainer.classList.remove(
            "hidden"
        );
    }


    if (
        error
    ) {

        error.classList.add(
            "hidden"
        );
    }


    /*
     * Question text.
     */

    if (
        questionElement
    ) {

        const questionText =
            getQuestionText(
                currentQuestion
            );


        questionElement.innerText =
            questionText ||
            "Question unavailable.";
    }


    /*
     * Navigation.
     */

    createRelatedNavigation();


    /*
     * Options.
     */

    createOptions();


    /*
     * Restore previous answer.
     */

    restoreAnswerState();


    /*
     * Score.
     */

    updateScore();


    /*
     * Quote.
     */

    loadMotivationalQuote();
}


/* =========================================================
   GET QUESTION TEXT
   ========================================================= */

function getQuestionText(
    question
) {

    if (
        !question
    ) {

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


    if (
        !optionsContainer
    ) {

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

    if (
        !question
    ) {

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
     * Remove previous correct score
     * if the user changes the answer.
     */

    if (
        previousResult === true
    ) {

        score--;
    }


    /*
     * Add score for correct answer.
     */

    if (
        isCorrect
    ) {

        score++;
    }


    /*
     * Save answer.
     */

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
     * Reset option styling.
     */

    clearOptionStates();


    /*
     * Highlight selected option.
     */

    if (
        selectedOption
    ) {

        selectedOption.classList.add(

            isCorrect
                ? "correct-answer"
                : "wrong-answer"

        );
    }


    /*
     * If wrong, highlight correct answer.
     */

    if (
        !isCorrect
    ) {

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


    if (
        result
    ) {

        if (
            isCorrect
        ) {

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
     * Automatically show explanation.
     */

    showExplanation();


    /*
     * Update score.
     */

    updateScore();
}


/* =========================================================
   CREATE PREVIOUS / NEXT NAVIGATION
   ========================================================= */

function createRelatedNavigation() {

    /*
     * Remove old navigation.
     */

    const existingNavigation =
        document.querySelector(
            ".related-navigation"
        );


    if (
        existingNavigation
    ) {

        existingNavigation.remove();
    }


    const questionContainer =
        document.getElementById(
            "question-container"
        );


    if (
        !questionContainer
    ) {

        return;
    }


    const navigation =
        document.createElement(
            "div"
        );


    navigation.className =
        "related-navigation";


    /*
     * =====================================================
     * PREVIOUS
     * =====================================================
     */

    const previousColumn =
        document.createElement(
            "div"
        );


    previousColumn.className =
        "related-column";


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
        "Previous question"
    );


    previousButton.title =
        "Previous question";


    previousButton.disabled =
        currentQuestionIndex <= 0;


    previousButton.addEventListener(
        "click",
        () =>
            navigateQuestion(
                -1
            )
    );


    previousColumn.appendChild(
        previousButton
    );


    /*
     * =====================================================
     * NEXT
     * =====================================================
     */

    const nextColumn =
        document.createElement(
            "div"
        );


    nextColumn.className =
        "related-column";


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
        "Next question"
    );


    nextButton.title =
        "Next question";


    nextButton.disabled =
        currentQuestionIndex >=
        questions.length - 1;


    nextButton.addEventListener(
        "click",
        () =>
            navigateQuestion(
                1
            )
    );


    nextColumn.appendChild(
        nextButton
    );


    /*
     * =====================================================
     * ADD BOTH
     * =====================================================
     */

    navigation.appendChild(
        previousColumn
    );


    navigation.appendChild(
        nextColumn
    );


    /*
     * Place navigation above
     * the question content.
     */

    questionContainer.insertBefore(
        navigation,
        questionContainer.firstChild
    );
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


    if (
        result
    ) {

        result.innerHTML =
            "";

        result.className =
            "";
    }


    /*
     * Not answered yet.
     */

    if (
        !savedAnswer
    ) {

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


                if (
                    option
                ) {

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

    if (
        !savedResult
    ) {

        highlightCorrectAnswer(
            getCorrectAnswer()
        );


        if (
            result
        ) {

            result.innerHTML =
                "Not quite. Keep learning!";

            result.className =
                "result-wrong";
        }


    } else {

        /*
         * Correct answer.
         */

        if (
            result
        ) {

            result.innerHTML =
                "Correct! 🎉";

            result.className =
                "result-correct";
        }
    }


    /*
     * Explanation remains visible.
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
   GET EXPLANATION TEXT
   ========================================================= */

function getExplanationText(
    question
) {

    if (
        !question
    ) {

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


    if (
        explanation
    ) {

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


                if (
                    option
                ) {

                    option.classList.add(
                        "correct-answer"
                    );
                }
            }
        }
    );
}


/* =========================================================
   NAVIGATE QUESTION
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


    /*
     * Update URL.
     */

    const url =
        new URL(
            window.location.href
        );


    if (
        questionId
    ) {

        url.searchParams.set(
            "id",
            questionId
        );
    }


    history.pushState(
        {},
        "",
        url
    );


    displayQuestion();
}


/* =========================================================
   BROWSER BACK / FORWARD
   ========================================================= */

function handlePopState() {

    loadQuestionFromURL();
}


/* =========================================================
   UPDATE NAVIGATION
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


    if (
        previousButton
    ) {

        previousButton.disabled =
            currentQuestionIndex <= 0;
    }


    if (
        nextButton
    ) {

        nextButton.disabled =
            currentQuestionIndex >=
            questions.length - 1;
    }


    if (
        position
    ) {

        position.innerText =
            "";
    }
}


/* =========================================================
   UPDATE CURRENT STREAK / SCORE
   ========================================================= */

/*
 * Example:
 *
 * Q1 -> Correct
 * Q2 -> Correct
 * Q3 -> Wrong
 *
 * Display:
 *
 * 🔥 Current streak: 2/3
 *
 * This represents:
 *
 * Correct answers / Answered questions
 *
 * It does NOT reset to zero after a wrong answer.
 */

function updateScore() {

    const scoreDisplay =
        document.getElementById(
            "score-display"
        );


    if (
        !scoreDisplay
    ) {

        return;
    }


    const totalAnswered =
        answeredQuestions.size;


    scoreDisplay.innerHTML =
        `🔥 Current streak: <strong>${score}/${totalAnswered}</strong>`;
}


/* =========================================================
   LOAD MOTIVATIONAL QUOTE
   ========================================================= */

function loadMotivationalQuote() {

    if (
        !quotes.length
    ) {

        return;
    }


    let randomIndex;


    if (
        quotes.length === 1
    ) {

        randomIndex =
            0;

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


    if (
        quoteText
    ) {

        quoteText.innerText =
            `“${selectedQuote.quote}”`;
    }


    if (
        quoteAuthor
    ) {

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


    /*
     * Don't navigate while typing
     * or interacting with buttons.
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

        navigateQuestion(
            -1
        );


    } else if (
        event.key === "ArrowRight"
    ) {

        navigateQuestion(
            1
        );
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

    if (
        !question
    ) {

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
     * Fallback if CSV has no ID.
     */

    const index =
        questions.indexOf(
            question
        );


    if (
        index !== -1
    ) {

        return String(
            index + 1
        );
    }


    return "";
}


/* =========================================================
   CORRECT ANSWER
   ========================================================= */

function getCorrectAnswer() {

    if (
        !currentQuestion
    ) {

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

            row.push(
                cell
            );

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


            row.push(
                cell
            );

            cell = "";


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


    if (
        !rows.length
    ) {

        return [];
    }


    /*
     * Clean headers.
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
     * Convert CSV rows
     * into objects.
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
                            values[index] !== undefined
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
