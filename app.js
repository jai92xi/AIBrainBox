/* =========================================================
   AI Brain Box - app.js
   ========================================================= */

const CSV_URL = "./xi-questions.csv";
const QUOTES_URL = "./xi-Quotes.csv";

const BACKGROUNDS_API =
    "https://api.github.com/repos/jai92xi/AIBrainBox/contents/Backgrounds_Folder";

const BACKGROUND_SESSION_KEY =
    "aibrainbox-session-background";

let questions = [];
let quotes = [];

let currentQuestion = null;
let currentQuestionIndex = 0;

let currentStreak = 0;
let answerSelected = false;


/* ============================================================
   DOM ELEMENTS
   ============================================================ */

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

const loadingElement =
    document.getElementById("loading");

const errorElement =
    document.getElementById("error");

const quoteTextElement =
    document.getElementById("quote-text");

const quoteAuthorElement =
    document.getElementById("quote-author");

const previousButton =
    document.querySelector(".previous-related");

const nextButton =
    document.querySelector(".next-related");


/* ============================================================
   INITIALIZATION
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);


async function initializeApp() {

    document.body.classList.add(
        "light-theme"
    );

    const subtitle =
        document.querySelector(
            ".brand-subtitle"
        );

    if (subtitle) {
        subtitle.textContent = "";
        subtitle.style.display = "none";
    }

    setupNavigation();

    await Promise.all([
        loadQuestions(),
        loadQuotes(),
        loadSessionBackground()
    ]);

}


/* ============================================================
   LOAD QUESTIONS
   ============================================================ */

async function loadQuestions() {

    showLoading();

    try {

        const response =
            await fetch(
                `${CSV_URL}?v=${Date.now()}`,
                {
                    cache: "no-store"
                }
            );

        if (!response.ok) {
            throw new Error(
                `Unable to load ${CSV_URL}`
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
                "No questions found."
            );
        }

        loadQuestionFromURL();

    } catch (error) {

        console.error(
            "Questions could not be loaded:",
            error
        );

        showError(
            "Unable to load questions. Please check the CSV file."
        );
    }

}


/* ============================================================
   LOAD QUOTES
   ============================================================ */

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

            console.warn(
                `Unable to load ${QUOTES_URL}`
            );

            return;
        }

        const csvText =
            await response.text();

        quotes =
            parseCSV(csvText);

        console.log(
            `Loaded ${quotes.length} quotes.`
        );

        displayRandomQuote();

    } catch (error) {

        console.warn(
            "Quotes could not be loaded:",
            error
        );
    }

}


/* ============================================================
   CSV PARSER
   ============================================================ */

function parseCSV(text) {

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
                    cell =>
                        cell.trim() !== ""
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
                cell =>
                    cell.trim() !== ""
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

    const headers =
        rows[0].map(
            header =>
                header.trim()
        );

    return rows
        .slice(1)
        .map(row => {

            const object = {};

            headers.forEach(
                (header, index) => {

                    object[header] =
                        (
                            row[index] ||
                            ""
                        ).trim();
                }
            );

            return object;
        });
}


/* ============================================================
   GET CSV VALUE
   ============================================================ */

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
        const name of possibleNames
    ) {

        const matchingKey =
            keys.find(
                key =>
                    key
                        .trim()
                        .toLowerCase() ===
                    name
                        .trim()
                        .toLowerCase()
            );

        if (
            matchingKey !==
            undefined
        ) {

            return (
                object[matchingKey] ||
                ""
            );
        }
    }

    return "";
}


/* ============================================================
   QUESTION ID
   ============================================================ */

function getQuestionId(
    question
) {

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


function getQuestionIdFromURL() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    return params.get("id");
}


/* ============================================================
   FIND QUESTION
   ============================================================ */

function findQuestionById(id) {

    if (!id) {
        return null;
    }

    return (
        questions.find(
            question =>
                getQuestionId(question)
                    .toLowerCase() ===
                id.toLowerCase()
        ) ||
        null
    );
}


/* ============================================================
   LOAD QUESTION FROM URL
   ============================================================ */

function loadQuestionFromURL() {

    const requestedId =
        getQuestionIdFromURL();

    let question = null;

    if (requestedId) {

        question =
            findQuestionById(
                requestedId
            );
    }

    if (
        !question &&
        questions.length
    ) {

        question =
            questions[0];
    }

    if (question) {

        displayQuestion(
            question,
            false
        );

    } else {

        showError(
            "No questions are available."
        );
    }

}


/* ============================================================
   DISPLAY QUESTION
   ============================================================ */

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

    answerSelected =
        false;

    const questionId =
        getQuestionId(
            question
        );

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


    // --------------------------------------------------------
    // QUESTION
    // --------------------------------------------------------

    const questionText =
        getValue(
            question,
            [
                "Question",
                "question",
                "Questions"
            ]
        );

    // Use innerHTML so <b>...</b>
    // in CSV is rendered as bold text.

    questionElement.innerHTML =
        questionText;


    // --------------------------------------------------------
    // OPTIONS
    // --------------------------------------------------------

    renderOptions(
        question
    );


    // --------------------------------------------------------
    // RESET RESULT
    // --------------------------------------------------------

    resultElement.textContent =
        "";

    resultElement.className =
        "result";


    // --------------------------------------------------------
    // RESET EXPLANATION
    // --------------------------------------------------------

    explanationTextElement.innerHTML =
        "";

    explanationElement.classList.add(
        "hidden"
    );


    // --------------------------------------------------------
    // UPDATE NAVIGATION
    // --------------------------------------------------------

    updateRelatedNavigation();


    // --------------------------------------------------------
    // SHOW QUESTION CONTAINER
    // --------------------------------------------------------

    questionContainer.classList.remove(
        "hidden"
    );


    // --------------------------------------------------------
    // LAYOUT
    // --------------------------------------------------------

    setupQuestionLayout();

}


/* ============================================================
   RENDER OPTIONS
   ============================================================ */

function renderOptions(
    question
) {

    optionsElement.innerHTML =
        "";

    const optionValues = [

        getValue(
            question,
            [
                "Option A",
                "option A",
                "A",
                "OptionA"
            ]
        ),

        getValue(
            question,
            [
                "Option B",
                "option B",
                "B",
                "OptionB"
            ]
        ),

        getValue(
            question,
            [
                "Option C",
                "option C",
                "C",
                "OptionC"
            ]
        ),

        getValue(
            question,
            [
                "Option D",
                "option D",
                "D",
                "OptionD"
            ]
        )
    ];

    const labels = [
        "A",
        "B",
        "C",
        "D"
    ];


    optionValues.forEach(
        (
            optionText,
            index
        ) => {

            if (!optionText) {
                return;
            }

            const optionButton =
                document.createElement(
                    "button"
                );

            optionButton.type =
                "button";

            optionButton.className =
                "option";

            optionButton.dataset.answer =
                optionText;

            optionButton.dataset.index =
                index;


            const optionLabel =
                document.createElement(
                    "span"
                );

            optionLabel.className =
                "option-label";

            optionLabel.textContent =
                labels[index];


            const optionContent =
                document.createElement(
                    "span"
                );

            optionContent.className =
                "option-text";

            // Render HTML such as <b>...</b>

            optionContent.innerHTML =
                optionText;


            optionButton.appendChild(
                optionLabel
            );

            optionButton.appendChild(
                optionContent
            );


            optionButton.addEventListener(
                "click",
                () => {

                    selectAnswer(
                        optionButton,
                        optionText
                    );
                }
            );


            optionsElement.appendChild(
                optionButton
            );

        }
    );

}


/* ============================================================
   GET CORRECT ANSWER
   ============================================================ */

function getCorrectAnswer(
    question
) {

    return getValue(
        question,
        [
            "Correct Answer",
            "CorrectAnswer",
            "Correct answer",
            "Answer",
            "answer",
            "Correct"
        ]
    );
}


/* ============================================================
   NORMALIZE ANSWER
   ============================================================ */

function normalizeAnswer(
    answer
) {

    return String(
        answer || ""
    )
        .trim()
        .replace(
            /\s+/g,
            " "
        )
        .toLowerCase();
}


/* ============================================================
   SELECT ANSWER
   ============================================================ */

function selectAnswer(
    selectedButton,
    selectedAnswer
) {

    if (answerSelected) {
        return;
    }

    answerSelected =
        true;


    const correctAnswer =
        getCorrectAnswer(
            currentQuestion
        );


    /*
     * ========================================================
     * FIX:
     *
     * The CSV stores Correct Answer as A/B/C/D.
     *
     * The selected option contains the FULL option text.
     *
     * Therefore compare the selected option's INDEX/LABEL
     * with the CSV correct-answer value.
     *
     * Example:
     *
     * Correct Answer = C
     * Selected button = option C
     *
     * => Correct
     *
     * ========================================================
     */

    const labels = [
        "A",
        "B",
        "C",
        "D"
    ];

    const selectedIndex =
        Number(
            selectedButton.dataset.index
        );

    const selectedLabel =
        labels[selectedIndex] || "";


    const selectedNormalized =
        normalizeAnswer(
            selectedLabel
        );

    const correctNormalized =
        normalizeAnswer(
            correctAnswer
        );


    /*
     * Primary comparison:
     *
     * A/B/C/D label
     * against
     * CSV Correct Answer
     */

    let isCorrect =
        selectedNormalized ===
        correctNormalized;


    /*
     * Fallback:
     *
     * If a CSV happens to store the FULL
     * answer text instead of A/B/C/D,
     * still support that format.
     */

    if (!isCorrect) {

        const selectedTextNormalized =
            normalizeAnswer(
                selectedAnswer
            );

        const correctTextNormalized =
            normalizeAnswer(
                correctAnswer
            );

        isCorrect =
            selectedTextNormalized ===
            correctTextNormalized;
    }


    // --------------------------------------------------------
    // DISABLE ALL OPTIONS
    // --------------------------------------------------------

    const allOptions =
        optionsElement.querySelectorAll(
            ".option"
        );

    allOptions.forEach(
        option => {

            option.disabled =
                true;
        }
    );


    // --------------------------------------------------------
    // CORRECT ANSWER
    // --------------------------------------------------------

    if (isCorrect) {

        selectedButton.classList.add(
            "correct"
        );

        resultElement.textContent =
            "Correct! 🎉";

        resultElement.className =
            "result correct-result";

        currentStreak++;

        showFloatingFeedback(
            true
        );

    }


    // --------------------------------------------------------
    // WRONG ANSWER
    // --------------------------------------------------------

    else {

        selectedButton.classList.add(
            "wrong"
        );

        resultElement.textContent =
            "Not quite. Try the next one!";

        resultElement.className =
            "result wrong-result";

        currentStreak =
            0;


        // Highlight the correct option

        allOptions.forEach(
            option => {

                const optionIndex =
                    Number(
                        option.dataset.index
                    );

                const optionLabel =
                    labels[optionIndex] ||
                    "";

                /*
                 * Compare the OPTION LABEL
                 * against the CSV answer.
                 */

                if (
                    normalizeAnswer(
                        optionLabel
                    ) ===
                    correctNormalized
                ) {

                    option.classList.add(
                        "correct"
                    );
                }

                /*
                 * Also support a CSV where
                 * Correct Answer contains the
                 * full option text.
                 */

                else if (
                    normalizeAnswer(
                        option.dataset.answer
                    ) ===
                    correctNormalized
                ) {

                    option.classList.add(
                        "correct"
                    );
                }
            }
        );

        showFloatingFeedback(
            false
        );
    }


    // --------------------------------------------------------
    // UPDATE STREAK
    // --------------------------------------------------------

    updateScore();


    // --------------------------------------------------------
    // SHOW EXPLANATION
    // --------------------------------------------------------

    showExplanation(
        currentQuestion
    );

}


/* ============================================================
   SHOW EXPLANATION
   ============================================================ */

function showExplanation(
    question
) {

    const explanation =
        getValue(
            question,
            [
                "Explaination",
                "Explanation",
                "explanation",
                "Explain",
                "Reason"
            ]
        );

    explanationTextElement.innerHTML =
        explanation ||
        "No explanation is available for this question.";


    explanationElement.classList.remove(
        "hidden"
    );

}


/* ============================================================
   UPDATE SCORE
   ============================================================ */

function updateScore() {

    if (!scoreElement) {
        return;
    }

    scoreElement.innerHTML =
        `Current streak: <strong>${currentStreak}</strong>`;
}


/* ============================================================
   RELATED QUESTION NAVIGATION
   ============================================================ */

function updateRelatedNavigation() {

    if (!currentQuestion) {
        return;
    }


    const previousId =
        getValue(
            currentQuestion,
            [
                "previous related question",
                "Previous Related Question",
                "Previous Related question",
                "previous question",
                "Previous Question"
            ]
        );


    const nextId =
        getValue(
            currentQuestion,
            [
                "next related question",
                "Next Related Question",
                "Next Related question",
                "next question",
                "Next Question"
            ]
        );


    // --------------------------------------------------------
    // PREVIOUS
    // --------------------------------------------------------

    if (previousId) {

        const previousQuestion =
            findQuestionById(
                previousId
            );

        previousButton.disabled =
            !previousQuestion;

    } else {

        previousButton.disabled =
            true;
    }


    // --------------------------------------------------------
    // NEXT
    // --------------------------------------------------------

    if (nextId) {

        const nextQuestion =
            findQuestionById(
                nextId
            );

        nextButton.disabled =
            !nextQuestion;

    } else {

        nextButton.disabled =
            true;
    }

}


/* ============================================================
   NAVIGATION BUTTONS
   ============================================================ */

function setupNavigation() {

    previousButton.addEventListener(
        "click",
        () => {

            if (
                !currentQuestion ||
                previousButton.disabled
            ) {

                return;
            }


            const previousId =
                getValue(
                    currentQuestion,
                    [
                        "previous related question",
                        "Previous Related Question",
                        "Previous Related question",
                        "previous question",
                        "Previous Question"
                    ]
                );


            const previousQuestion =
                findQuestionById(
                    previousId
                );


            if (previousQuestion) {

                displayQuestion(
                    previousQuestion
                );

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
            }

        }
    );


    nextButton.addEventListener(
        "click",
        () => {

            if (
                !currentQuestion ||
                nextButton.disabled
            ) {

                return;
            }


            const nextId =
                getValue(
                    currentQuestion,
                    [
                        "next related question",
                        "Next Related Question",
                        "Next Related question",
                        "next question",
                        "Next Question"
                    ]
                );


            const nextQuestion =
                findQuestionById(
                    nextId
                );


            if (nextQuestion) {

                displayQuestion(
                    nextQuestion
                );

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
            }

        }
    );

}


/* ============================================================
   BROWSER BACK / FORWARD
   ============================================================ */

function setupBrowserNavigation() {

    window.addEventListener(
        "popstate",
        () => {

            loadQuestionFromURL();
        }
    );

}


/* ============================================================
   KEYBOARD NAVIGATION
   ============================================================ */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.target.tagName ===
                "INPUT" ||
            event.target.tagName ===
                "TEXTAREA"
        ) {

            return;
        }


        if (
            event.key ===
            "ArrowLeft" &&
            !previousButton.disabled
        ) {

            previousButton.click();
        }


        if (
            event.key ===
            "ArrowRight" &&
            !nextButton.disabled
        ) {

            nextButton.click();
        }

    }
);


/* ============================================================
   FLOATING FEEDBACK
   ============================================================ */

function showFloatingFeedback(
    isCorrect
) {

    const happyEmojis = [
        "🎉",
        "👏",
        "🥳",
        "✨",
        "🙌",
        "🎊",
        "💯",
        "🔥",
        "⭐",
        "🤩",
        "👏",
        "🎉"
    ];


    const sadEmojis = [
        "😢",
        "😔",
        "🥲",
        "💔",
        "😕",
        "🙁",
        "😞",
        "🥺"
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


        const startLeft =
            Math.random() * 90 + 5;

        const startTop =
            Math.random() * 35 + 45;

        const size =
            Math.random() * 18 + 24;

        const delay =
            Math.random() * 0.8;

        const duration =
            Math.random() * 1.5 + 3;


        emoji.style.left =
            `${startLeft}%`;

        emoji.style.top =
            `${startTop}%`;

        emoji.style.fontSize =
            `${size}px`;

        emoji.style.animationDelay =
            `${delay}s`;

        emoji.style.animationDuration =
            `${duration}s`;


        document.body.appendChild(
            emoji
        );


        setTimeout(
            () => {

                emoji.remove();

            },
            (
                duration +
                delay
            ) * 1000 + 500
        );

    }

}


/* ============================================================
   RANDOM QUOTE
   ============================================================ */

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
                "Text",
                "text"
            ]
        );


    const quoteAuthor =
        getValue(
            quote,
            [
                "Author",
                "author",
                "Quote Author",
                "quote author"
            ]
        );


    if (quoteTextElement) {

        quoteTextElement.innerHTML =
            quoteText
                ? `"${quoteText}"`
                : "";
    }


    if (quoteAuthorElement) {

        quoteAuthorElement.textContent =
            quoteAuthor
                ? `— ${quoteAuthor}`
                : "";
    }

}


/* ============================================================
   QUESTION LAYOUT
   ============================================================ */

function setupQuestionLayout() {

    /*
     * The current index.html already contains:
     *
     * .question-content
     *     .question-pane
     *     .options-pane
     *
     * This function keeps compatibility with older
     * versions of the page.
     */

    const questionContent =
        document.querySelector(
            ".question-content"
        );


    const questionPane =
        document.querySelector(
            ".question-pane"
        );


    const optionsPane =
        document.querySelector(
            ".options-pane"
        );


    if (
        questionContent &&
        questionPane &&
        optionsPane
    ) {

        return;
    }

}


/* ============================================================
   LOADING STATE
   ============================================================ */

function showLoading() {

    if (loadingElement) {

        loadingElement.classList.remove(
            "hidden"
        );
    }


    if (questionContainer) {

        questionContainer.classList.add(
            "hidden"
        );
    }

}


function hideLoading() {

    if (loadingElement) {

        loadingElement.classList.add(
            "hidden"
        );
    }

}


function showError(
    message
) {

    hideLoading();


    if (questionContainer) {

        questionContainer.classList.add(
            "hidden"
        );
    }


    if (errorElement) {

        errorElement.textContent =
            message;

        errorElement.classList.remove(
            "hidden"
        );
    }

}


/* ============================================================
   BACKGROUND
   ============================================================ */

async function loadSessionBackground() {

    const overlay =
        document.getElementById(
            "background-overlay"
        );

    if (!overlay) {
        return;
    }


    try {

        let selectedBackground =
            sessionStorage.getItem(
                BACKGROUND_SESSION_KEY
            );


        if (!selectedBackground) {

            const response =
                await fetch(
                    `${BACKGROUNDS_API}?v=${Date.now()}`,
                    {
                        cache: "no-store"
                    }
                );


            if (!response.ok) {

                throw new Error(
                    `Background API failed (${response.status})`
                );
            }


            const files =
                await response.json();


            /*
             * Do NOT restrict this to .mp4.
             * Any file in Backgrounds_Folder
             * can be selected.
             */

            const validFiles =
                files.filter(
                    file =>
                        file &&
                        file.type ===
                            "file" &&
                        file.download_url
                );


            if (
                validFiles.length === 0
            ) {

                throw new Error(
                    "No background files found."
                );
            }


            const selected =
                validFiles[
                    Math.floor(
                        Math.random() *
                        validFiles.length
                    )
                ];


            selectedBackground =
                selected.download_url;


            sessionStorage.setItem(
                BACKGROUND_SESSION_KEY,
                selectedBackground
            );

        }


        applyBackground(
            selectedBackground
        );


    } catch (error) {

        console.warn(
            "Background loading failed:",
            error
        );


        overlay.style.background =
            "linear-gradient(135deg, #e0f2fe, #ede9fe)";
    }

}


/* ============================================================
   APPLY BACKGROUND
   ============================================================ */

function applyBackground(
    url
) {

    const overlay =
        document.getElementById(
            "background-overlay"
        );


    if (
        !overlay ||
        !url
    ) {

        return;
    }


    const cleanUrl =
        String(url)
            .split("?")[0]
            .toLowerCase();


    const videoExtensions = [
        ".mp4",
        ".webm",
        ".ogg",
        ".mov",
        ".m4v"
    ];


    const isVideo =
        videoExtensions.some(
            extension =>
                cleanUrl.endsWith(
                    extension
                )
        );


    if (isVideo) {

        const existingVideo =
            document.getElementById(
                "background-video"
            );


        if (existingVideo) {

            existingVideo.remove();
        }


        const video =
            document.createElement(
                "video"
            );


        video.id =
            "background-video";

        video.src =
            url;

        video.autoplay =
            true;

        video.loop =
            true;

        video.muted =
            true;

        video.playsInline =
            true;


        video.setAttribute(
            "aria-hidden",
            "true"
        );


        video.style.position =
            "absolute";

        video.style.inset =
            "0";

        video.style.width =
            "100%";

        video.style.height =
            "100%";

        video.style.objectFit =
            "cover";

        video.style.pointerEvents =
            "none";


        overlay.innerHTML =
            "";

        overlay.appendChild(
            video
        );


        video.play().catch(
            () => {}
        );


    } else {

        overlay.innerHTML =
            "";

        overlay.style.backgroundImage =
            `url("${url}")`;

        overlay.style.backgroundSize =
            "cover";

        overlay.style.backgroundPosition =
            "center";

        overlay.style.backgroundRepeat =
            "no-repeat";
    }

}
