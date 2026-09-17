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

let currentQuestionIndex = 0;
let currentQuestion = null;

let answeredCount = 0;
let correctCount = 0;

let answeredQuestions = {};


/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);

async function initializeApp() {
    document.body.classList.add("light-theme");

    const subtitle =
        document.querySelector(".brand-subtitle");

    if (subtitle) {
        subtitle.textContent = "";
        subtitle.style.display = "none";
    }

    setupKeyboardNavigation();
    setupBrowserNavigation();

    await Promise.all([
        loadQuestions(),
        loadQuotes(),
        loadSessionBackground()
    ]);
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
                `Unable to load questions (${response.status})`
            );
        }

        const csvText =
            await response.text();

        questions =
            parseCSV(csvText);

        if (!questions.length) {
            throw new Error(
                "No questions found in CSV."
            );
        }

        const questionId =
            getQuestionIdFromURL();

        let index = -1;

        if (questionId) {
            const requestedId =
                String(questionId)
                    .trim()
                    .toLowerCase();

            index =
                questions.findIndex(
                    question =>
                        String(
                            getQuestionIdFromObject(
                                question
                            )
                        )
                            .trim()
                            .toLowerCase() ===
                        requestedId
                );
        }

        currentQuestionIndex =
            index >= 0 ? index : 0;

        if (loading) {
            loading.classList.add("hidden");
        }

        displayQuestion(
            currentQuestionIndex
        );

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
                "Unable to load the question database. Please check that xi-questions.csv exists in the repository.";

            error.classList.remove("hidden");
        }
    }
}


/* =========================================================
   LOAD QUOTES
   ========================================================= */

async function loadQuotes() {
    const quoteText =
        document.getElementById("quote-text");

    const quoteAuthor =
        document.getElementById("quote-author");

    try {
        const response = await fetch(
            `${QUOTES_URL}?v=${Date.now()}`,
            {
                cache: "no-store"
            }
        );

        if (!response.ok) {
            throw new Error(
                "Quote CSV unavailable"
            );
        }

        const csvText =
            await response.text();

        quotes =
            parseCSV(csvText);

        if (!quotes.length) {
            throw new Error(
                "No quotes found"
            );
        }

        displayRandomQuote();

    } catch (err) {
        console.warn(
            "Using fallback quote:",
            err
        );

        const fallbackQuotes = [
            {
                quote:
                    "Keep learning. Keep improving.",
                author:
                    "AIBrainBox"
            },
            {
                quote:
                    "The best way to learn AI is to keep solving real problems.",
                author:
                    "AIBrainBox"
            },
            {
                quote:
                    "Every difficult question is an opportunity to understand something better.",
                author:
                    "AIBrainBox"
            }
        ];

        const selected =
            fallbackQuotes[
                Math.floor(
                    Math.random() *
                    fallbackQuotes.length
                )
            ];

        if (quoteText) {
            quoteText.textContent =
                `“${selected.quote}”`;
        }

        if (quoteAuthor) {
            quoteAuthor.textContent =
                `— ${selected.author}`;
        }
    }
}


function displayRandomQuote() {
    if (!quotes.length) {
        return;
    }

    const selected =
        quotes[
            Math.floor(
                Math.random() *
                quotes.length
            )
        ];

    const quoteText =
        document.getElementById("quote-text");

    const quoteAuthor =
        document.getElementById("quote-author");

    const quote =
        getValue(
            selected,
            [
                "Quote",
                "quote",
                "Quotes",
                "quotes",
                "Text",
                "text"
            ]
        );

    const author =
        getValue(
            selected,
            [
                "Author",
                "author",
                "Quote Author",
                "quote author"
            ]
        );

    if (quoteText) {
        quoteText.textContent =
            quote
                ? `“${stripHtml(quote)}”`
                : "“Keep learning. Keep improving.”";
    }

    if (quoteAuthor) {
        quoteAuthor.textContent =
            author
                ? `— ${stripHtml(author)}`
                : "— AIBrainBox";
    }
}


/* =========================================================
   BACKGROUND
   ========================================================= */

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

            const validFiles =
                files.filter(
                    file =>
                        file &&
                        file.type === "file" &&
                        file.download_url
                );

            if (!validFiles.length) {
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

    } catch (err) {
        console.warn(
            "Background loading failed:",
            err
        );

        overlay.style.background =
            "linear-gradient(135deg, #e0f2fe, #ede9fe)";
    }
}


function applyBackground(url) {
    const overlay =
        document.getElementById(
            "background-overlay"
        );

    if (!overlay || !url) {
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
            ext =>
                cleanUrl.endsWith(ext)
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


/* =========================================================
   DISPLAY QUESTION
   ========================================================= */

function displayQuestion(index) {
    if (!questions.length) {
        return;
    }

    if (
        index < 0 ||
        index >= questions.length
    ) {
        return;
    }

    currentQuestionIndex =
        index;

    currentQuestion =
        questions[index];

    const container =
        document.getElementById(
            "question-container"
        );

    const questionElement =
        document.getElementById(
            "question"
        );

    const optionsElement =
        document.getElementById(
            "options"
        );

    const resultElement =
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

    if (
        !container ||
        !questionElement ||
        !optionsElement
    ) {
        return;
    }

    container.classList.remove(
        "hidden"
    );

    if (resultElement) {
        resultElement.innerHTML =
            "";

        resultElement.className =
            "result";
    }

    if (explanation) {
        explanation.classList.add(
            "hidden"
        );
    }

    if (explanationText) {
        explanationText.innerHTML =
            "";
    }


    /* ---------------------------------------------------------
       QUESTION
       --------------------------------------------------------- */

    const questionText =
        getValue(
            currentQuestion,
            [
                "Question",
                "question",
                "Question Text",
                "question text",
                "Question_Text"
            ]
        );

    const keywords =
        getKeywords(
            currentQuestion
        );

    questionElement.innerHTML =
        highlightKeywords(
            questionText,
            keywords
        );


    /* ---------------------------------------------------------
       OPTIONS
       --------------------------------------------------------- */

    optionsElement.innerHTML =
        "";

    const optionColumns =
        getOptionColumns(
            currentQuestion
        );

    optionColumns.forEach(
        option => {
            if (!option.value) {
                return;
            }

            const button =
                document.createElement(
                    "button"
                );

            button.type =
                "button";

            /*
             * IMPORTANT:
             * CSS uses .option.
             */
            button.className =
                "option";

            button.dataset.option =
                option.label;

            button.innerHTML =
                `<span class="option-label">${escapeHtml(
                    option.label
                )}</span>
                 <span class="option-text">${highlightKeywords(
                     option.value,
                     keywords
                 )}</span>`;

            button.addEventListener(
                "click",
                () => {
                    selectAnswer(
                        option.label,
                        option.value,
                        button
                    );
                }
            );

            optionsElement.appendChild(
                button
            );
        }
    );


    /* ---------------------------------------------------------
       RELATED QUESTION NAVIGATION
       --------------------------------------------------------- */

    createRelatedNavigation(
        currentQuestion
    );


    /* ---------------------------------------------------------
       RESTORE PREVIOUS ANSWER
       --------------------------------------------------------- */

    const questionId =
        getQuestionIdFromObject(
            currentQuestion
        );

    const answerKey =
        normalizeQuestionId(
            questionId
        );

    if (
        answerKey &&
        answeredQuestions[answerKey]
    ) {
        restoreAnsweredQuestion(
            answeredQuestions[
                answerKey
            ]
        );
    }

    updateScore();
}


/* =========================================================
   OPTIONS
   ========================================================= */

function getOptionColumns(row) {
    const options = [];

    const possibleOptions = [
        [
            "A",
            [
                "Option A",
                "option a",
                "A",
                "a",
                "Option_A"
            ]
        ],
        [
            "B",
            [
                "Option B",
                "option b",
                "B",
                "b",
                "Option_B"
            ]
        ],
        [
            "C",
            [
                "Option C",
                "option c",
                "C",
                "c",
                "Option_C"
            ]
        ],
        [
            "D",
            [
                "Option D",
                "option d",
                "D",
                "d",
                "Option_D"
            ]
        ],
        [
            "E",
            [
                "Option E",
                "option e",
                "E",
                "e",
                "Option_E"
            ]
        ],
        [
            "F",
            [
                "Option F",
                "option f",
                "F",
                "f",
                "Option_F"
            ]
        ]
    ];

    possibleOptions.forEach(
        ([label, keys]) => {
            const value =
                getValue(
                    row,
                    keys
                );

            if (
                value !== null &&
                value !== undefined &&
                String(value).trim()
            ) {
                options.push({
                    label,
                    value:
                        String(value).trim()
                });
            }
        }
    );

    return options;
}


/* =========================================================
   SELECT ANSWER
   ========================================================= */

function selectAnswer(
    selectedLabel,
    selectedValue,
    selectedButton
) {
    if (!currentQuestion) {
        return;
    }

    const questionId =
        getQuestionIdFromObject(
            currentQuestion
        );

    const answerKey =
        normalizeQuestionId(
            questionId
        );

    /*
     * Prevent answering the same
     * question repeatedly.
     */
    if (
        answerKey &&
        answeredQuestions[answerKey]
    ) {
        return;
    }

    const correctAnswer =
        getCorrectAnswer(
            currentQuestion
        );

    const normalizedSelected =
        normalizeAnswer(
            selectedLabel,
            selectedValue
        );

    const normalizedCorrect =
        normalizeAnswer(
            correctAnswer,
            correctAnswer
        );

    let isCorrect =
        normalizedSelected ===
        normalizedCorrect;

    const options =
        getOptionColumns(
            currentQuestion
        );

    const correctOption =
        options.find(
            option =>
                normalizeAnswer(
                    option.label,
                    option.value
                ) ===
                normalizedCorrect
        );

    /*
     * If the CSV stores the correct
     * answer as the actual option text,
     * compare the selected option with it.
     */
    if (
        !isCorrect &&
        correctOption
    ) {
        isCorrect =
            normalizeAnswer(
                selectedLabel,
                selectedValue
            ) ===
            normalizeAnswer(
                correctOption.label,
                correctOption.value
            );
    }

    answeredCount++;

    if (isCorrect) {
        correctCount++;
    }

    if (answerKey) {
        answeredQuestions[
            answerKey
        ] = {
            selectedLabel,
            selectedValue,
            isCorrect
        };
    }


    /* ---------------------------------------------------------
       DISABLE ALL OPTIONS
       --------------------------------------------------------- */

    const buttons =
        document.querySelectorAll(
            ".option"
        );

    buttons.forEach(
        button => {
            button.disabled =
                true;

            const label =
                button.dataset.option;

            if (
                label ===
                selectedLabel
            ) {
                button.classList.add(
                    isCorrect
                        ? "correct"
                        : "wrong"
                );
            }
        }
    );


    /* ---------------------------------------------------------
       HIGHLIGHT CORRECT OPTION
       --------------------------------------------------------- */

    if (correctOption) {
        buttons.forEach(
            button => {
                if (
                    button.dataset.option ===
                    correctOption.label
                ) {
                    button.classList.add(
                        "correct-answer"
                    );
                }
            }
        );
    }


    /* ---------------------------------------------------------
       RESULT
       --------------------------------------------------------- */

    showResult(
        isCorrect
    );


    /* ---------------------------------------------------------
       EXPLANATION
       --------------------------------------------------------- */

    showExplanation(
        currentQuestion
    );


    /* ---------------------------------------------------------
       FLOATING FEEDBACK
       --------------------------------------------------------- */

    showFloatingFeedback(
        isCorrect
    );


    /* ---------------------------------------------------------
       SCORE
       --------------------------------------------------------- */

    updateScore();
}


/* =========================================================
   RESULT
   ========================================================= */

function showResult(isCorrect) {
    const result =
        document.getElementById(
            "result"
        );

    if (!result) {
        return;
    }

    if (isCorrect) {
        result.innerHTML =
            "✅ Correct!";

        result.classList.add(
            "correct-result"
        );

        result.classList.remove(
            "wrong-result"
        );

    } else {
        result.innerHTML =
            "❌ Incorrect";

        result.classList.add(
            "wrong-result"
        );

        result.classList.remove(
            "correct-result"
        );
    }
}


/* =========================================================
   EXPLANATION
   ========================================================= */

function showExplanation(row) {
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

    /*
     * IMPORTANT:
     *
     * The actual CSV column is:
     *
     * Explaination
     *
     * Keep support for Explanation as
     * a fallback as well.
     */
    const text =
        getValue(
            row,
            [
                "Explaination",
                "explaination",
                "Explanation",
                "explanation",
                "Answer Explanation",
                "answer explanation",
                "Answer_Explanation",
                "Explanation Text",
                "explanation text"
            ]
        );

    const keywords =
        getKeywords(row);

    explanationText.innerHTML =
        highlightKeywords(
            text ||
                "No explanation available.",
            keywords
        );

    explanation.classList.remove(
        "hidden"
    );


    /*
     * Keep explanation below the
     * result/options area.
     */
    const parent =
        explanation.parentElement;

    const result =
        document.getElementById(
            "result"
        );

    if (
        parent &&
        result &&
        explanation.previousElementSibling !==
            result
    ) {
        parent.appendChild(
            explanation
        );
    }
}


/* =========================================================
   RESTORE ANSWER
   ========================================================= */

function restoreAnsweredQuestion(
    answerData
) {
    if (!answerData) {
        return;
    }

    const buttons =
        document.querySelectorAll(
            ".option"
        );

    buttons.forEach(
        button => {
            button.disabled =
                true;

            if (
                button.dataset.option ===
                answerData.selectedLabel
            ) {
                button.classList.add(
                    answerData.isCorrect
                        ? "correct"
                        : "wrong"
                );
            }
        }
    );

    const correctAnswer =
        getCorrectAnswer(
            currentQuestion
        );

    const options =
        getOptionColumns(
            currentQuestion
        );

    const correctOption =
        options.find(
            option =>
                normalizeAnswer(
                    option.label,
                    option.value
                ) ===
                normalizeAnswer(
                    correctAnswer,
                    correctAnswer
                )
        );

    if (correctOption) {
        buttons.forEach(
            button => {
                if (
                    button.dataset.option ===
                    correctOption.label
                ) {
                    button.classList.add(
                        "correct-answer"
                    );
                }
            }
        );
    }

    showResult(
        answerData.isCorrect
    );

    showExplanation(
        currentQuestion
    );
}


/* =========================================================
   SCORE
   ========================================================= */

function updateScore() {
    const scoreDisplay =
        document.getElementById(
            "score-display"
        );

    if (!scoreDisplay) {
        return;
    }

    /*
     * Current streak remains:
     *
     * Correct / Answered
     *
     * Example:
     * Current streak: 2/3
     */
    scoreDisplay.innerHTML =
        `🔥 Current streak: <strong>${correctCount}/${answeredCount}</strong>`;
}


/* =========================================================
   RELATED QUESTION NAVIGATION
   ========================================================= */

function createRelatedNavigation(row) {
    const existing =
        document.querySelector(
            ".related-navigation"
        );

    if (existing) {
        existing.remove();
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


    /* ---------------------------------------------------------
       PREVIOUS RELATED QUESTION
       --------------------------------------------------------- */

    const previousId =
        getRelatedQuestionId(
            row,
            [
                "previous related question",
                "Previous Related Question",
                "previous_related_question",
                "Previous_Related_Question",
                "previous",
                "Previous"
            ]
        );

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

    if (previousId) {
        previousButton.addEventListener(
            "click",
            () =>
                navigateToQuestionId(
                    previousId
                )
        );
    } else {
        previousButton.disabled =
            true;
    }


    /* ---------------------------------------------------------
       NEXT RELATED QUESTION
       --------------------------------------------------------- */

    const nextId =
        getRelatedQuestionId(
            row,
            [
                "next related question",
                "Next Related Question",
                "next_related_question",
                "Next_Related_Question",
                "next",
                "Next"
            ]
        );

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

    if (nextId) {
        nextButton.addEventListener(
            "click",
            () =>
                navigateToQuestionId(
                    nextId
                )
        );
    } else {
        nextButton.disabled =
            true;
    }

    navigation.appendChild(
        previousButton
    );

    navigation.appendChild(
        nextButton
    );

    /*
     * Keep navigation at the top
     * of the question area.
     */
    questionContainer.prepend(
        navigation
    );
}


function getRelatedQuestionId(
    row,
    keys
) {
    const value =
        getValue(
            row,
            keys
        );

    if (!value) {
        return null;
    }

    const values =
        String(value)
            .split(
                /[,;|\/\n]+/
            )
            .map(
                item =>
                    item.trim()
            )
            .filter(Boolean);

    /*
     * Prefer an actual Xi question ID.
     */
    const xiId =
        values.find(
            value =>
                /^Xi-\d+$/i.test(
                    value
                )
        );

    return (
        xiId ||
        values[0] ||
        null
    );
}


function navigateToQuestionId(
    questionId
) {
    if (!questionId) {
        return;
    }

    const normalizedId =
        String(questionId)
            .trim()
            .toLowerCase();

    const index =
        questions.findIndex(
            question =>
                String(
                    getQuestionIdFromObject(
                        question
                    )
                )
                    .trim()
                    .toLowerCase() ===
                normalizedId
        );

    if (index === -1) {
        console.warn(
            "Related question not found:",
            questionId
        );

        return;
    }

    const actualId =
        getQuestionIdFromObject(
            questions[index]
        );

    /*
     * Every question has its own URL:
     *
     * ?id=Xi-00001
     * ?id=Xi-00003
     */
    const url =
        new URL(
            window.location.href
        );

    url.searchParams.set(
        "id",
        actualId
    );

    window.history.pushState(
        {},
        "",
        url
    );

    displayQuestion(
        index
    );

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================================
   KEYWORDS
   ========================================================= */

function getKeywords(row) {
    const keywordValue =
        getValue(
            row,
            [
                "Keywords",
                "keywords",
                "Keyword",
                "keyword",
                "Key Words",
                "key words",
                "Key_Words"
            ]
        );

    const keywords = [];

    if (keywordValue) {
        keywords.push(
            ...String(keywordValue)
                .split(
                    /[,;|]/
                )
                .map(
                    item =>
                        item.trim()
                )
                .filter(Boolean)
        );
    }


    /* ---------------------------------------------------------
       TOPIC
       --------------------------------------------------------- */

    const topic =
        getValue(
            row,
            [
                "Topic",
                "topic"
            ]
        );

    if (topic) {
        keywords.push(
            ...String(topic)
                .split(
                    /[,;|]/
                )
                .map(
                    item =>
                        item.trim()
                )
                .filter(Boolean)
        );
    }


    /* ---------------------------------------------------------
       SUB TOPIC
       --------------------------------------------------------- */

    const subTopic =
        getValue(
            row,
            [
                "Sub Topics",
                "sub topics",
                "Sub Topic",
                "sub topic",
                "Sub_Topics"
            ]
        );

    if (subTopic) {
        keywords.push(
            ...String(subTopic)
                .split(
                    /[,;|]/
                )
                .map(
                    item =>
                        item.trim()
                )
                .filter(Boolean)
        );
    }

    return [
        ...new Set(
            keywords.filter(
                keyword =>
                    keyword.length > 1
            )
        )
    ];
}


/* =========================================================
   HIGHLIGHT KEYWORDS / BOLD TEXT
   ========================================================= */

function highlightKeywords(
    text,
    keywords = []
) {
    if (
        text === null ||
        text === undefined
    ) {
        return "";
    }

    let result =
        String(text);


    /*
     * Decode common escaped HTML entities.
     */
    result =
        result
            .replace(
                /&lt;/gi,
                "<"
            )
            .replace(
                /&gt;/gi,
                ">"
            )
            .replace(
                /&amp;/gi,
                "&"
            )
            .replace(
                /&quot;/gi,
                '"'
            )
            .replace(
                /&#39;/gi,
                "'"
            );


    /*
     * Preserve <b>...</b>.
     */
    const boldParts = [];

    result =
        result.replace(
            /<b\b[^>]*>([\s\S]*?)<\/b>/gi,
            function (
                _,
                content
            ) {
                const index =
                    boldParts.length;

                boldParts.push(
                    content
                );

                return `___AIBRAINBOX_BOLD_${index}___`;
            }
        );


    /*
     * Preserve <strong>...</strong>.
     */
    result =
        result.replace(
            /<strong\b[^>]*>([\s\S]*?)<\/strong>/gi,
            function (
                _,
                content
            ) {
                const index =
                    boldParts.length;

                boldParts.push(
                    content
                );

                return `___AIBRAINBOX_BOLD_${index}___`;
            }
        );


    /*
     * Preserve Markdown **bold**.
     */
    result =
        result.replace(
            /\*\*([\s\S]*?)\*\*/g,
            function (
                _,
                content
            ) {
                const index =
                    boldParts.length;

                boldParts.push(
                    content
                );

                return `___AIBRAINBOX_BOLD_${index}___`;
            }
        );


    /*
     * Escape remaining HTML.
     */
    result =
        escapeHtml(
            result
        );


    /*
     * Restore bold text.
     */
    boldParts.forEach(
        function (
            content,
            index
        ) {
            const safeContent =
                escapeHtml(
                    String(content)
                );

            const placeholder =
                `___AIBRAINBOX_BOLD_${index}___`;

            result =
                result.replace(
                    placeholder,
                    `<strong>${safeContent}</strong>`
                );
        }
    );


    /*
     * Highlight keywords.
     */
    if (
        Array.isArray(keywords) &&
        keywords.length
    ) {
        keywords
            .filter(Boolean)
            .sort(
                (a, b) =>
                    String(b).length -
                    String(a).length
            )
            .forEach(
                keyword => {
                    const escapedKeyword =
                        escapeRegExp(
                            String(keyword)
                        );

                    const parts =
                        result.split(
                            /(<[^>]+>)/g
                        );

                    for (
                        let i = 0;
                        i < parts.length;
                        i++
                    ) {
                        if (
                            parts[i].startsWith(
                                "<"
                            )
                        ) {
                            continue;
                        }

                        parts[i] =
                            parts[i].replace(
                                new RegExp(
                                    `(${escapedKeyword})`,
                                    "gi"
                                ),
                                "<strong>$1</strong>"
                            );
                    }

                    result =
                        parts.join("");
                }
            );
    }

    return result;
}


/* =========================================================
   HTML SAFETY
   ========================================================= */

function escapeHtml(text) {
    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        String(text);

    return div.innerHTML;
}


function stripHtml(text) {
    if (!text) {
        return "";
    }

    const div =
        document.createElement(
            "div"
        );

    div.innerHTML =
        String(text);

    return (
        div.textContent ||
        div.innerText ||
        ""
    );
}


function escapeRegExp(text) {
    return String(text).replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
    );
}


/* =========================================================
   ANSWER NORMALIZATION
   ========================================================= */

function normalizeAnswer(
    label,
    value
) {
    let answer =
        label ||
        value ||
        "";

    answer =
        String(answer)
            .trim()
            .toLowerCase();

    /*
     * Remove:
     *
     * A
     * Option A
     * A.
     * A)
     * A -
     */
    answer =
        answer.replace(
            /^option\s*([a-f])[\s.:)\-]*/i,
            "$1"
        );

    answer =
        answer.replace(
            /^([a-f])[\s.:)\-]+/i,
            "$1"
        );

    return answer.trim();
}


function normalizeQuestionId(
    questionId
) {
    if (!questionId) {
        return "";
    }

    return String(questionId)
        .trim()
        .toLowerCase();
}


/* =========================================================
   CORRECT ANSWER
   ========================================================= */

function getCorrectAnswer(row) {
    return getValue(
        row,
        [
            "Correct Answer",
            "correct answer",
            "Correct_Answer",
            "correct_answer",
            "Answer",
            "answer",
            "Correct",
            "correct"
        ]
    );
}


/* =========================================================
   GENERIC CSV VALUE HELPERS
   ========================================================= */

function getValue(
    row,
    possibleKeys
) {
    if (!row) {
        return "";
    }


    /*
     * Exact key lookup.
     */
    for (
        const key of possibleKeys
    ) {
        if (
            Object.prototype.hasOwnProperty.call(
                row,
                key
            )
        ) {
            const value =
                row[key];

            if (
                value !== null &&
                value !== undefined &&
                String(value).trim() !== ""
            ) {
                return String(
                    value
                ).trim();
            }
        }
    }


    /*
     * Case-insensitive fallback.
     */
    const rowKeys =
        Object.keys(row);

    for (
        const wantedKey of possibleKeys
    ) {
        const foundKey =
            rowKeys.find(
                actualKey =>
                    String(actualKey)
                        .trim()
                        .toLowerCase() ===
                    String(wantedKey)
                        .trim()
                        .toLowerCase()
            );

        if (foundKey) {
            const value =
                row[foundKey];

            if (
                value !== null &&
                value !== undefined &&
                String(value).trim() !== ""
            ) {
                return String(
                    value
                ).trim();
            }
        }
    }

    return "";
}


/* =========================================================
   QUESTION ID
   ========================================================= */

function getQuestionIdFromObject(
    row
) {
    return getValue(
        row,
        [
            "ID",
            "Id",
            "id",
            "Question ID",
            "Question Id",
            "question id",
            "Question_ID",
            "question_id"
        ]
    );
}


function getQuestionIdFromURL() {
    const params =
        new URLSearchParams(
            window.location.search
        );

    return params.get(
        "id"
    );
}


/* =========================================================
   CSV PARSER
   ========================================================= */

function parseCSV(text) {
    const rows = [];

    let row = [];
    let field = "";
    let insideQuotes = false;

    for (
        let i = 0;
        i < text.length;
        i++
    ) {
        const char =
            text[i];

        const next =
            text[i + 1];


        /*
         * Handle quotes.
         */
        if (char === '"') {
            if (
                insideQuotes &&
                next === '"'
            ) {
                field += '"';
                i++;
            } else {
                insideQuotes =
                    !insideQuotes;
            }

            continue;
        }


        /*
         * Handle comma.
         */
        if (
            char === "," &&
            !insideQuotes
        ) {
            row.push(
                field
            );

            field =
                "";

            continue;
        }


        /*
         * Handle line breaks.
         */
        if (
            (
                char === "\n" ||
                char === "\r"
            ) &&
            !insideQuotes
        ) {
            if (
                char === "\r" &&
                next === "\n"
            ) {
                i++;
            }

            row.push(
                field
            );

            field =
                "";

            if (
                row.some(
                    value =>
                        String(value)
                            .trim() !== ""
                )
            ) {
                rows.push(
                    row
                );
            }

            row = [];

            continue;
        }

        field +=
            char;
    }


    /*
     * Last field / row.
     */
    if (
        field.length > 0 ||
        row.length > 0
    ) {
        row.push(
            field
        );

        if (
            row.some(
                value =>
                    String(value)
                        .trim() !== ""
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
                String(header)
                    .replace(
                        /^\uFEFF/,
                        ""
                    )
                    .trim()
        );


    /*
     * Convert rows into objects.
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
                            values[
                                index
                            ] !== undefined
                                ? values[
                                      index
                                  ].trim()
                                : "";
                    }
                );

                return object;
            }
        );
}


/* =========================================================
   FLOATING FEEDBACK
   ========================================================= */

function showFloatingFeedback(
    isCorrect
) {
    /*
     * Correct answer:
     * Use celebrations, claps and
     * positive feedback.
     *
     * Wrong answer:
     * Only sad/wrong feedback.
     */
    const emojis =
        isCorrect
            ? [
                  "🎉",
                  "😄",
                  "🥳",
                  "🔥",
                  "✨",
                  "👏",
                  "👏",
                  "🎊"
              ]
            : [
                  "😢",
                  "😞",
                  "💔",
                  "😕",
                  "🙁",
                  "😔"
              ];

    const count =
        isCorrect
            ? 10
            : 6;

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

        emoji.style.left =
            `${10 + Math.random() * 80}%`;

        emoji.style.top =
            `${45 + Math.random() * 30}%`;

        emoji.style.animationDelay =
            `${Math.random() * 0.5}s`;

        document.body.appendChild(
            emoji
        );

        setTimeout(
            () =>
                emoji.remove(),
            2200
        );
    }
}


/* =========================================================
   KEYBOARD NAVIGATION
   ========================================================= */

function setupKeyboardNavigation() {
    document.addEventListener(
        "keydown",
        event => {
            if (
                event.target &&
                (
                    event.target.tagName ===
                        "INPUT" ||
                    event.target.tagName ===
                        "TEXTAREA"
                )
            ) {
                return;
            }


            /*
             * Previous related question.
             */
            if (
                event.key ===
                "ArrowLeft"
            ) {
                const button =
                    document.querySelector(
                        ".previous-related"
                    );

                if (
                    button &&
                    !button.disabled
                ) {
                    button.click();
                }
            }


            /*
             * Next related question.
             */
            if (
                event.key ===
                "ArrowRight"
            ) {
                const button =
                    document.querySelector(
                        ".next-related"
                    );

                if (
                    button &&
                    !button.disabled
                ) {
                    button.click();
                }
            }
        }
    );
}


/* =========================================================
   BROWSER BACK / FORWARD
   ========================================================= */

function setupBrowserNavigation() {
    window.addEventListener(
        "popstate",
        () => {
            const questionId =
                getQuestionIdFromURL();

            if (!questionId) {
                return;
            }

            const normalizedId =
                String(questionId)
                    .trim()
                    .toLowerCase();

            const index =
                questions.findIndex(
                    question =>
                        String(
                            getQuestionIdFromObject(
                                question
                            )
                        )
                            .trim()
                            .toLowerCase() ===
                        normalizedId
                );

            if (index !== -1) {
                displayQuestion(
                    index
                );
            }
        }
    );
}
