let questions = [];
let currentQuestionIndex = -1;
let currentQuestion = null;

const CSV_URL = "./xi-questions.csv";

let score = 0;
let answeredQuestions = new Set();
let questionResults = new Map();
let savedAnswers = new Map();

const HIGHLIGHT_STORAGE_KEY = "aibrainbox-highlights-v1";

let highlighterActive = false;
let currentHighlightColor = "#fff176";

const HIGHLIGHT_COLORS = {
    yellow: "#fff176",
    green: "#b9f6ca",
    blue: "#b3e5fc",
    pink: "#f8bbd0"
};

const FALLBACK_QUOTES = [
    {
        quote: "You do not rise to the level of your goals. You fall to the level of your systems.",
        author: "James Clear"
    },
    {
        quote: "The future depends on what you do today.",
        author: "Mahatma Gandhi"
    },
    {
        quote: "Dreams become plans when you give them a deadline.",
        author: "AIBrainBox"
    },
    {
        quote: "The secret of getting ahead is getting started.",
        author: "Mark Twain"
    },
    {
        quote: "Nobody is coming to build the life you keep imagining. Start building it.",
        author: "AIBrainBox"
    },
    {
        quote: "He who conquers others is strong; he who conquers himself is mighty.",
        author: "Lao Tzu"
    },
    {
        quote: "Your comfort zone is a beautiful place, but nothing grows there.",
        author: "AIBrainBox"
    },
    {
        quote: "It is never too late to be what you might have been.",
        author: "George Eliot"
    },
    {
        quote: "Discipline is choosing between what you want now and what you want most.",
        author: "Abraham Lincoln"
    },
    {
        quote: "You will never always be motivated. You must learn to be disciplined.",
        author: "AIBrainBox"
    },
    {
        quote: "The pain of discipline weighs ounces; the pain of regret weighs tons.",
        author: "Jim Rohn"
    },
    {
        quote: "If you are tired of starting over, stop giving up.",
        author: "AIBrainBox"
    },
    {
        quote: "Success is the sum of small efforts, repeated day in and day out.",
        author: "Robert Collier"
    },
    {
        quote: "Do something today that your future self will thank you for.",
        author: "AIBrainBox"
    },
    {
        quote: "The man who moves a mountain begins by carrying away small stones.",
        author: "Confucius"
    },
    {
        quote: "Your excuses will never be stronger than your reasons to succeed.",
        author: "AIBrainBox"
    },
    {
        quote: "Act as if what you do makes a difference. It does.",
        author: "William James"
    },
    {
        quote: "You cannot change your life until you change something you do daily.",
        author: "John C. Maxwell"
    },
    {
        quote: "A year from now, you will wish you had started today.",
        author: "AIBrainBox"
    },
    {
        quote: "Great things are done by a series of small things brought together.",
        author: "Vincent van Gogh"
    },
    {
        quote: "The harder you work for something, the greater you will feel when you finally achieve it.",
        author: "AIBrainBox"
    },
    {
        quote: "Don't watch the clock; do what it does. Keep going.",
        author: "Sam Levenson"
    },
    {
        quote: "Fall seven times, stand up eight.",
        author: "Japanese Proverb"
    },
    {
        quote: "Failure is not the opposite of success; it is part of success.",
        author: "AIBrainBox"
    },
    {
        quote: "Whether you think you can or you think you can't, you're right.",
        author: "Henry Ford"
    },
    {
        quote: "It always seems impossible until it's done.",
        author: "Nelson Mandela"
    },
    {
        quote: "Start where you are. Use what you have. Do what you can.",
        author: "Arthur Ashe"
    },
    {
        quote: "The only way to do great work is to love what you do.",
        author: "Steve Jobs"
    },
    {
        quote: "Success is walking from failure to failure with no loss of enthusiasm.",
        author: "Winston Churchill"
    },
    {
        quote: "The journey of a thousand miles begins with one step.",
        author: "Lao Tzu"
    },
    {
        quote: "Nothing will work unless you do.",
        author: "Maya Angelou"
    },
    {
        quote: "Believe you can and you're halfway there.",
        author: "Theodore Roosevelt"
    },
    {
        quote: "Great things never come from comfort zones.",
        author: "Roy T. Bennett"
    },
    {
        quote: "The future starts today, not tomorrow.",
        author: "Pope John Paul II"
    },
    {
        quote: "Small progress is still progress. Keep moving.",
        author: "AIBrainBox"
    },
    {
        quote: "You may have to fight a battle more than once to win it.",
        author: "Margaret Thatcher"
    },
    {
        quote: "Your future self is watching what you do with today.",
        author: "AIBrainBox"
    },
    {
        quote: "You don't have to see the whole staircase. Just take the first step.",
        author: "Martin Luther King Jr."
    },
    {
        quote: "The best time to plant a tree was 20 years ago. The second best time is now.",
        author: "Chinese Proverb"
    },
    {
        quote: "The way to get started is to quit talking and begin doing.",
        author: "Walt Disney"
    },
    {
        quote: "All our dreams can come true, if we have the courage to pursue them.",
        author: "Walt Disney"
    },
    {
        quote: "Do not let what you cannot do interfere with what you can do.",
        author: "John Wooden"
    },
    {
        quote: "Make each day your masterpiece.",
        author: "John Wooden"
    },
    {
        quote: "Don't wish it were easier. Wish you were better.",
        author: "Jim Rohn"
    },
    {
        quote: "Discipline is the bridge between goals and accomplishment.",
        author: "Jim Rohn"
    },
    {
        quote: "Either you run the day, or the day runs you.",
        author: "Jim Rohn"
    },
    {
        quote: "Motivation is what gets you started. Habit is what keeps you going.",
        author: "Jim Rohn"
    },
    {
        quote: "A goal is a dream with a deadline.",
        author: "Napoleon Hill"
    },
    {
        quote: "Whatever the mind of man can conceive and believe, it can achieve.",
        author: "Napoleon Hill"
    },
    {
        quote: "The successful warrior is the average man, with laser-like focus.",
        author: "Bruce Lee"
    },
    {
        quote: "Knowing is not enough; we must apply. Willing is not enough; we must do.",
        author: "Bruce Lee"
    },
    {
        quote: "The impediment to action advances action. What stands in the way becomes the way.",
        author: "Marcus Aurelius"
    },
    {
        quote: "Waste no more time arguing about what a good man should be. Be one.",
        author: "Marcus Aurelius"
    },
    {
        quote: "Difficulties strengthen the mind, as labor does the body.",
        author: "Seneca"
    },
    {
        quote: "We suffer more often in imagination than in reality.",
        author: "Seneca"
    },
    {
        quote: "The future belongs to those who believe in the beauty of their dreams.",
        author: "Eleanor Roosevelt"
    },
    {
        quote: "You must do the thing you think you cannot do.",
        author: "Eleanor Roosevelt"
    },
    {
        quote: "No one can make you feel inferior without your consent.",
        author: "Eleanor Roosevelt"
    },
    {
        quote: "Education is the most powerful weapon which you can use to change the world.",
        author: "Nelson Mandela"
    },
    {
        quote: "You may encounter many defeats, but you must not be defeated.",
        author: "Nelson Mandela"
    },
    {
        quote: "I never lose. I either win or learn.",
        author: "Nelson Mandela"
    },
    {
        quote: "I have not failed. I've just found 10,000 ways that won't work.",
        author: "Thomas Edison"
    },
    {
        quote: "There is no substitute for hard work.",
        author: "Thomas Edison"
    },
    {
        quote: "If you can't outplay them, outwork them.",
        author: "Ben Hogan"
    },
    {
        quote: "I've failed over and over and over again in my life. And that is why I succeed.",
        author: "Michael Jordan"
    },
    {
        quote: "Some people want it to happen, some wish it would happen, others make it happen.",
        author: "Michael Jordan"
    },
    {
        quote: "You miss 100% of the shots you don't take.",
        author: "Wayne Gretzky"
    },
    {
        quote: "You can't be afraid to fail. It's the only way you succeed.",
        author: "LeBron James"
    },
    {
        quote: "I never dreamed about success. I worked for it.",
        author: "Estée Lauder"
    },
    {
        quote: "Don't count the days, make the days count.",
        author: "Muhammad Ali"
    },
    {
        quote: "He who is not courageous enough to take risks will accomplish nothing in life.",
        author: "Muhammad Ali"
    },
    {
        quote: "What would life be if we had no courage to attempt anything?",
        author: "Vincent van Gogh"
    },
    {
        quote: "If you hear a voice within you say 'you cannot paint,' then by all means paint.",
        author: "Vincent van Gogh"
    },
    {
        quote: "Act as if what you do makes a difference. It does.",
        author: "William James"
    },
    {
        quote: "Nothing is particularly hard if you divide it into small jobs.",
        author: "Henry Ford"
    },
    {
        quote: "Failure is simply the opportunity to begin again, this time more intelligently.",
        author: "Henry Ford"
    },
    {
        quote: "The best way to predict the future is to create it.",
        author: "Peter Drucker"
    },
    {
        quote: "Efficiency is doing things right; effectiveness is doing the right things.",
        author: "Peter Drucker"
    },
    {
        quote: "If you want to be happy, set a goal that commands your thoughts, liberates your energy and inspires your hopes.",
        author: "Andrew Carnegie"
    },
    {
        quote: "The only person you are destined to become is the person you decide to be.",
        author: "Ralph Waldo Emerson"
    },
    {
        quote: "What lies behind us and what lies before us are tiny matters compared to what lies within us.",
        author: "Ralph Waldo Emerson"
    },
    {
        quote: "Nothing great was ever achieved without enthusiasm.",
        author: "Ralph Waldo Emerson"
    }
];

let lastQuoteIndex = -1;


/* ============================================================
   START
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);


/* ============================================================
   INITIALIZE
   ============================================================ */

function initializeApp() {

    const previousButton =
        document.getElementById(
            "previous-question-btn"
        );

    const nextButton =
        document.getElementById(
            "next-question-btn"
        );

    if (previousButton) {
        previousButton.addEventListener(
            "click",
            goToPreviousQuestion
        );
    }

    if (nextButton) {
        nextButton.addEventListener(
            "click",
            goToNextQuestion
        );
    }

    window.addEventListener(
        "popstate",
        loadQuestion
    );

    document.addEventListener(
        "keydown",
        handleKeyboardNavigation
    );

    initializeHighlighter();

    loadQuestions();
}


/* ============================================================
   LOAD CSV
   ============================================================ */

async function loadQuestions() {

    const loading =
        document.getElementById("loading");

    const errorBox =
        document.getElementById("error");

    try {

        if (loading) {
            loading.classList.remove("hidden");
        }

        if (errorBox) {
            errorBox.classList.add("hidden");
        }

        const response =
            await fetch(
                CSV_URL + "?v=" + Date.now(),
                {
                    cache: "no-store"
                }
            );

        if (!response.ok) {

            throw new Error(
                "HTTP " +
                response.status +
                " - " +
                response.statusText
            );
        }

        const csvText =
            await response.text();

        if (!csvText.trim()) {

            throw new Error(
                "xi-questions.csv is empty."
            );
        }

        questions =
            parseCSV(csvText);

        if (!questions.length) {

            throw new Error(
                "No questions were found in xi-questions.csv."
            );
        }

        console.log(
            "Questions loaded:",
            questions.length
        );

        if (loading) {
            loading.classList.add("hidden");
        }

        loadQuestion();

    } catch (error) {

        console.error(
            "Question database error:",
            error
        );

        if (loading) {
            loading.classList.add("hidden");
        }

        if (errorBox) {

            errorBox.classList.remove(
                "hidden"
            );

            errorBox.innerText =
                "Unable to load the question database.\n\n" +
                "Error: " +
                error.message +
                "\n\n" +
                "Please make sure xi-questions.csv exists in the same folder as index.html.";
        }
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

        const char = text[i];
        const nextChar = text[i + 1];

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

            if (
                row.some(
                    value =>
                        value.trim() !== ""
                )
            ) {
                rows.push(row);
            }

            row = [];
            cell = "";

        } else {

            cell += char;
        }
    }

    if (
        cell !== "" ||
        row.length > 0
    ) {

        row.push(cell);

        if (
            row.some(
                value =>
                    value.trim() !== ""
            )
        ) {
            rows.push(row);
        }
    }

    if (!rows.length) {
        return [];
    }

    const headers =
        rows[0].map(
            normalizeHeader
        );

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
                            row[index] || ""
                        ).trim();
                }
            );

            return question;
        })
        .filter(question =>
            Object.values(question).some(
                value =>
                    value !== ""
            )
        );
}


function normalizeHeader(header) {

    return header
        .replace(/^\uFEFF/, "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
}


/* ============================================================
   LOAD QUESTION
   ============================================================ */

function loadQuestion() {

    if (!questions.length) {
        return;
    }

    const params =
        new URLSearchParams(
            window.location.search
        );

    let id =
        params.get("id");

    if (!id) {

        const firstQuestion =
            questions[0];

        if (
            firstQuestion &&
            firstQuestion.id
        ) {

            id =
                firstQuestion.id;

        } else {

            id = "1";
        }

        const url =
            new URL(
                window.location.href
            );

        url.searchParams.set(
            "id",
            id
        );

        window.history.replaceState(
            {},
            "",
            url
        );
    }

    currentQuestionIndex =
        questions.findIndex(
            question =>
                String(
                    question.id || ""
                )
                .trim()
                .toLowerCase() ===
                String(id)
                    .trim()
                    .toLowerCase()
        );

    if (
        currentQuestionIndex === -1
    ) {
        currentQuestionIndex = 0;
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

    document
        .getElementById(
            "question-container"
        )
        .classList.remove("hidden");

    document
        .getElementById(
            "error"
        )
        .classList.add("hidden");

    document
        .getElementById(
            "question"
        )
        .innerText =
            currentQuestion.question ||
            "Question unavailable.";

    createOptions();

    restoreAnswerState();

    updateNavigation();

    updateScore();

    loadMotivationalQuote();

    requestAnimationFrame(
        restoreHighlights
    );
}


/* ============================================================
   CREATE OPTIONS
   ============================================================ */

function createOptions() {

    const optionsContainer =
        document.getElementById(
            "options"
        );

    optionsContainer.innerHTML = "";

    const letters = [
        "A",
        "B",
        "C",
        "D"
    ];

    letters.forEach(letter => {

        const optionText =
            currentQuestion[
                letter.toLowerCase()
            ];

        if (
            !optionText ||
            !optionText.trim()
        ) {
            return;
        }

        const option =
            document.createElement("div");

        option.className =
            "option";

        const radio =
            document.createElement("input");

        radio.type = "radio";
        radio.name = "answer";
        radio.value = letter;
        radio.id = "option-" + letter;

        const label =
            document.createElement("label");

        label.htmlFor =
            "option-" + letter;

        const letterSpan =
            document.createElement("span");

        letterSpan.className =
            "option-letter";

        letterSpan.innerText =
            letter;

        const textSpan =
            document.createElement("span");

        textSpan.className =
            "option-text";

        textSpan.innerText =
            optionText;

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

        radio.addEventListener(
            "change",
            () => {

                checkAnswer(
                    radio,
                    option
                );
            }
        );
    });
}


/* ============================================================
   CHECK ANSWER
   ============================================================ */

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

    if (
        questionResults.has(
            questionId
        )
    ) {

        const previousResult =
            questionResults.get(
                questionId
            );

        if (previousResult === true) {
            score--;
        }
    }

    const isCorrect =
        userAnswer ===
        correctAnswer;

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

    selectedOption.classList.add(
        isCorrect
            ? "correct-answer"
            : "wrong-answer"
    );

    if (!isCorrect) {
        highlightCorrectAnswer(
            correctAnswer
        );
    }

    if (isCorrect) {

        score++;

        showCorrectCelebration();

        document
            .getElementById("result")
            .innerText =
            "Correct! 🎉";

        document
            .getElementById("result")
            .style.color =
            "#16a34a";

    } else {

        showWrongReaction();

        document
            .getElementById("result")
            .innerText =
            "Not quite. Keep learning!";

        document
            .getElementById("result")
            .style.color =
            "#dc2626";
    }

    createExplanationButton();

    updateScore();

    requestAnimationFrame(
        restoreHighlights
    );
}


/* ============================================================
   OPTION STATE
   ============================================================ */

function clearOptionStates() {

    document
        .querySelectorAll(".option")
        .forEach(option => {

            option.classList.remove(
                "selected",
                "correct-answer",
                "wrong-answer"
            );
        });
}


/* ============================================================
   EXPLANATION
   ============================================================ */

function createExplanationButton() {

    const oldButton =
        document.getElementById(
            "show-explanation-btn"
        );

    if (oldButton) {
        oldButton.remove();
    }

    const explanation =
        document.getElementById(
            "explanation"
        );

    explanation.classList.add(
        "hidden"
    );

    const button =
        document.createElement("button");

    button.id =
        "show-explanation-btn";

    button.type =
        "button";

    button.innerText =
        "💡 Show Explanation";

    button.style.display =
        "block";

    button.style.width =
        "100%";

    button.style.marginTop =
        "14px";

    button.style.padding =
        "10px 15px";

    button.style.border =
        "1px solid #c7d2fe";

    button.style.borderRadius =
        "10px";

    button.style.background =
        "#f5f3ff";

    button.style.color =
        "#4f46e5";

    button.style.fontSize =
        "13px";

    button.style.fontWeight =
        "700";

    button.style.cursor =
        "pointer";

    button.addEventListener(
        "click",
        showExplanation
    );

    const optionsContainer =
        document.getElementById(
            "options"
        );

    optionsContainer.parentNode.insertBefore(
        button,
        explanation
    );
}


function showExplanation() {

    const button =
        document.getElementById(
            "show-explanation-btn"
        );

    const explanation =
        document.getElementById(
            "explanation"
        );

    const explanationText =
        document.getElementById(
            "explanation-text"
        );

    const text =
        currentQuestion.explanation ||
        currentQuestion.explaination ||
        "No explanation is available for this question.";

    explanationText.innerText =
        text.trim();

    explanation.classList.remove(
        "hidden"
    );

    if (button) {

        button.innerText =
            "🙈 Hide Explanation";

        button.onclick =
            hideExplanation;
    }

    requestAnimationFrame(
        restoreHighlights
    );
}


function hideExplanation() {

    const button =
        document.getElementById(
            "show-explanation-btn"
        );

    const explanation =
        document.getElementById(
            "explanation"
        );

    explanation.classList.add(
        "hidden"
    );

    if (button) {

        button.innerText =
            "💡 Show Explanation";

        button.onclick =
            showExplanation;
    }
}


/* ============================================================
   RESTORE ANSWER
   ============================================================ */

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

    const explanationText =
        document.getElementById(
            "explanation-text"
        );

    const result =
        document.getElementById(
            "result"
        );

    explanation.classList.add(
        "hidden"
    );

    explanationText.innerText = "";
    result.innerText = "";

    const oldButton =
        document.getElementById(
            "show-explanation-btn"
        );

    if (oldButton) {
        oldButton.remove();
    }

    if (!savedAnswer) {
        return;
    }

    const radio =
        document.querySelector(
            'input[name="answer"][value="' +
            savedAnswer +
            '"]'
        );

    if (!radio) {
        return;
    }

    radio.checked = true;

    const option =
        radio.closest(".option");

    const correctAnswer =
        getCorrectAnswer();

    if (
        savedAnswer ===
        correctAnswer
    ) {

        option.classList.add(
            "correct-answer"
        );

        result.innerText =
            "Correct! 🎉";

        result.style.color =
            "#16a34a";

    } else {

        option.classList.add(
            "wrong-answer"
        );

        highlightCorrectAnswer(
            correctAnswer
        );

        result.innerText =
            "Not quite. Keep learning!";

        result.style.color =
            "#dc2626";
    }

    createExplanationButton();
}


function highlightCorrectAnswer(
    correctAnswer
) {

    const radio =
        document.querySelector(
            'input[name="answer"][value="' +
            correctAnswer +
            '"]'
        );

    if (!radio) {
        return;
    }

    const option =
        radio.closest(".option");

    if (option) {
        option.classList.add(
            "correct-answer"
        );
    }
}


/* ============================================================
   NAVIGATION
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

    if (previousButton) {
        previousButton.disabled =
            currentQuestionIndex <= 0;
    }

    if (nextButton) {
        nextButton.disabled =
            currentQuestionIndex >=
            questions.length - 1;
    }

    if (position) {

        position.innerText =
            "Question " +
            (currentQuestionIndex + 1) +
            " of " +
            questions.length;
    }
}


/* ============================================================
   SCORE
   ============================================================ */

function updateScore() {

    const scoreDisplay =
        document.getElementById(
            "score-display"
        );

    if (!scoreDisplay) {
        return;
    }

    const answeredCount =
        answeredQuestions.size;

    scoreDisplay.innerHTML =
        "Your current streak - " +
        "<strong>" +
        score +
        "/" +
        answeredCount +
        "</strong>";
}


/* ============================================================
   PREVIOUS / NEXT
   ============================================================ */

function goToPreviousQuestion() {

    if (
        currentQuestionIndex <= 0
    ) {
        return;
    }

    navigateToQuestion(
        questions[
            currentQuestionIndex - 1
        ]
    );
}


function goToNextQuestion() {

    if (
        currentQuestionIndex >=
        questions.length - 1
    ) {
        return;
    }

    navigateToQuestion(
        questions[
            currentQuestionIndex + 1
        ]
    );
}


function navigateToQuestion(
    question
) {

    if (
        !question ||
        !question.id
    ) {
        return;
    }

    const url =
        new URL(
            window.location.href
        );

    url.searchParams.set(
        "id",
        question.id
    );

    window.history.pushState(
        {},
        "",
        url
    );

    loadQuestion();
}


/* ============================================================
   MOTIVATIONAL QUOTE
   ============================================================ */

function loadMotivationalQuote() {

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

    let index =
        Math.floor(
            Math.random() *
            FALLBACK_QUOTES.length
        );

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
        FALLBACK_QUOTES[index];

    quoteText.innerText =
        "“" +
        quote.quote +
        "”";

    quoteAuthor.innerText =
        "— " +
        quote.author;
}


/* ============================================================
   QUESTION HELPERS
   ============================================================ */

function getQuestionId() {

    return String(
        currentQuestion.id
    );
}


function getCorrectAnswer() {

    return (
        currentQuestion["correct answer"] ||
        currentQuestion["correct_answer"] ||
        currentQuestion.answer ||
        currentQuestion.correct ||
        ""
    )
        .trim()
        .toUpperCase();
}


/* ============================================================
   REACTIONS
   ============================================================ */

function showCorrectCelebration() {

    createEmojiBurst([
        "🎉",
        "👏",
        "🥳",
        "✨",
        "🚀",
        "🧠",
        "💡",
        "⭐",
        "🔥"
    ]);
}


function showWrongReaction() {

    createEmojiBurst([
        "😢",
        "😞",
        "🥺",
        "💔",
        "😔"
    ]);
}


function createEmojiBurst(
    emojis
) {

    document
        .querySelectorAll(
            ".reaction-container"
        )
        .forEach(
            element =>
                element.remove()
        );

    const container =
        document.createElement(
            "div"
        );

    container.className =
        "reaction-container";

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

            element.style.setProperty(
                "--start-left",
                (
                    5 +
                    Math.random() * 90
                ) +
                "%"
            );

            element.style.setProperty(
                "--delay",
                (
                    Math.random() * 0.3
                ) +
                "s"
            );

            element.style.setProperty(
                "--duration",
                (
                    2 +
                    Math.random() * 1.4
                ) +
                "s"
            );

            element.style.setProperty(
                "--rotation",
                (
                    -40 +
                    Math.random() * 80
                ) +
                "deg"
            );

            element.style.setProperty(
                "--horizontal",
                (
                    -120 +
                    Math.random() * 240
                ) +
                "px"
            );

            element.style.setProperty(
                "--emoji-size",
                (
                    1.7 +
                    Math.random() * 1.5
                ) +
                "rem"
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


/* ============================================================
   KEYBOARD NAVIGATION
   ============================================================ */

function handleKeyboardNavigation(
    event
) {

    const activeElement =
        document.activeElement;

    if (
        activeElement &&
        (
            activeElement.tagName === "INPUT" ||
            activeElement.tagName === "TEXTAREA" ||
            activeElement.tagName === "BUTTON"
        )
    ) {
        return;
    }

    if (
        event.key === "ArrowLeft"
    ) {

        goToPreviousQuestion();

    } else if (
        event.key === "ArrowRight"
    ) {

        goToNextQuestion();
    }
}


/* ============================================================
   ============================================================
   HIGHLIGHTER
   ============================================================
   ============================================================ */

function initializeHighlighter() {

    injectHighlighterStyles();

    const button =
        document.getElementById(
            "highlighter-btn"
        );

    if (button) {

        button.setAttribute(
            "aria-pressed",
            "false"
        );

        button.addEventListener(
            "mousedown",
            event => {
                event.preventDefault();
            }
        );

        button.addEventListener(
            "click",
            event => {

                event.preventDefault();

                toggleHighlighter();
            }
        );
    }

    document.addEventListener(
        "mousedown",
        handleHighlighterMouseDown
    );

    document.addEventListener(
        "mouseup",
        handleHighlighterMouseUp
    );

    document.addEventListener(
        "click",
        handleHighlightClick
    );

    document.addEventListener(
        "click",
        handleHighlightColorClick
    );
}


/* ============================================================
   TOGGLE HIGHLIGHTER
   ============================================================ */

function toggleHighlighter() {

    highlighterActive =
        !highlighterActive;

    const button =
        document.getElementById(
            "highlighter-btn"
        );

    document.body.classList.toggle(
        "highlighter-active",
        highlighterActive
    );

    if (button) {

        button.classList.toggle(
            "active",
            highlighterActive
        );

        button.setAttribute(
            "aria-pressed",
            highlighterActive
                ? "true"
                : "false"
        );
    }
}


/* ============================================================
   HIGHLIGHTER MOUSE DOWN
   ============================================================ */

function handleHighlighterMouseDown(
    event
) {

    if (!highlighterActive) {
        return;
    }

    if (
        event.target.closest(
            "#highlighter-btn"
        )
    ) {
        return;
    }

    if (
        event.target.closest(
            ".aib-highlight"
        )
    ) {
        return;
    }
}


/* ============================================================
   HIGHLIGHTER MOUSE UP
   ============================================================ */

function handleHighlighterMouseUp(
    event
) {

    if (!highlighterActive) {
        return;
    }

    if (
        event.target.closest(
            "#highlighter-btn"
        )
    ) {
        return;
    }

    setTimeout(
        applyHighlightFromSelection,
        20
    );
}


/* ============================================================
   APPLY HIGHLIGHT
   ============================================================ */

function applyHighlightFromSelection() {

    const selection =
        window.getSelection();

    if (
        !selection ||
        selection.rangeCount === 0 ||
        selection.isCollapsed
    ) {
        return;
    }

    const range =
        selection.getRangeAt(0);

    const text =
        selection.toString();

    if (!text.trim()) {
        selection.removeAllRanges();
        return;
    }

    const startElement =
        getElementFromNode(
            range.startContainer
        );

    const endElement =
        getElementFromNode(
            range.endContainer
        );

    const container =
        getHighlightContainer(
            range.commonAncestorContainer
        );

    if (
        !container ||
        !startElement ||
        !endElement
    ) {
        selection.removeAllRanges();
        return;
    }

    if (
        getHighlightContainer(
            range.startContainer
        ) !== container ||
        getHighlightContainer(
            range.endContainer
        ) !== container
    ) {
        selection.removeAllRanges();
        return;
    }

    /*
     * Do not allow highlighting UI controls.
     */

    if (
        container.closest(
            "button,input,textarea,select"
        )
    ) {
        selection.removeAllRanges();
        return;
    }

    try {

        const mark =
            document.createElement(
                "mark"
            );

        mark.className =
            "aib-highlight";

        mark.style.backgroundColor =
            currentHighlightColor;

        mark.dataset.highlightColor =
            currentHighlightColor;

        mark.title =
            "Click to remove highlight";

        const fragment =
            range.extractContents();

        mark.appendChild(
            fragment
        );

        range.insertNode(
            mark
        );

        mergeAdjacentHighlights(
            container
        );

        container.normalize();

        saveHighlights();

    } catch (error) {

        console.error(
            "Highlight error:",
            error
        );
    }

    selection.removeAllRanges();
}


/* ============================================================
   GET ELEMENT
   ============================================================ */

function getElementFromNode(
    node
) {

    if (!node) {
        return null;
    }

    if (
        node.nodeType ===
        Node.ELEMENT_NODE
    ) {
        return node;
    }

    return node.parentElement;
}


/* ============================================================
   GET HIGHLIGHT CONTAINER
   ============================================================ */

function getHighlightContainer(
    node
) {

    const element =
        getElementFromNode(
            node
        );

    if (!element) {
        return null;
    }

    const question =
        document.getElementById(
            "question"
        );

    const options =
        document.getElementById(
            "options"
        );

    const explanation =
        document.getElementById(
            "explanation-text"
        );

    if (
        question &&
        question.contains(element)
    ) {
        return question;
    }

    if (
        options &&
        options.contains(element)
    ) {
        return options;
    }

    if (
        explanation &&
        explanation.contains(element)
    ) {
        return explanation;
    }

    return null;
}


/* ============================================================
   REMOVE / MERGE HIGHLIGHTS
   ============================================================ */

function handleHighlightClick(
    event
) {

    if (!highlighterActive) {
        return;
    }

    const highlight =
        event.target.closest(
            ".aib-highlight"
        );

    if (!highlight) {
        return;
    }

    if (
        event.target.closest(
            "#highlighter-btn"
        )
    ) {
        return;
    }

    event.preventDefault();
    event.stopPropagation();

    removeHighlight(
        highlight
    );
}


function removeHighlight(
    highlight
) {

    if (!highlight) {
        return;
    }

    const parent =
        highlight.parentNode;

    if (!parent) {
        return;
    }

    while (
        highlight.firstChild
    ) {

        parent.insertBefore(
            highlight.firstChild,
            highlight
        );
    }

    highlight.remove();

    parent.normalize();

    saveHighlights();
}


function mergeAdjacentHighlights(
    container
) {

    const marks =
        Array.from(
            container.querySelectorAll(
                ".aib-highlight"
            )
        );

    marks.forEach(mark => {

        let next =
            mark.nextSibling;

        while (
            next &&
            next.nodeType ===
            Node.TEXT_NODE &&
            !next.textContent.trim()
        ) {
            next =
                next.nextSibling;
        }

        if (
            next &&
            next.nodeType ===
            Node.ELEMENT_NODE &&
            next.classList.contains(
                "aib-highlight"
            ) &&
            next.dataset.highlightColor ===
            mark.dataset.highlightColor
        ) {

            while (
                next.firstChild
            ) {

                mark.appendChild(
                    next.firstChild
                );
            }

            next.remove();
        }
    });
}


/* ============================================================
   COLOR BUTTONS
   ============================================================ */

function handleHighlightColorClick(
    event
) {

    const button =
        event.target.closest(
            "[data-highlight-color]"
        );

    if (!button) {
        return;
    }

    const color =
        button.dataset.highlightColor;

    if (
        !HIGHLIGHT_COLORS[color]
    ) {
        return;
    }

    event.preventDefault();

    currentHighlightColor =
        HIGHLIGHT_COLORS[color];

    document
        .querySelectorAll(
            "[data-highlight-color]"
        )
        .forEach(
            item =>
                item.classList.remove(
                    "active"
                )
        );

    button.classList.add(
        "active"
    );
}


/* ============================================================
   SAVE HIGHLIGHTS
   ============================================================ */

function saveHighlights() {

    if (
        !currentQuestion ||
        !currentQuestion.id
    ) {
        return;
    }

    const questionId =
        String(
            currentQuestion.id
        );

    const data = {};

    const question =
        document.getElementById(
            "question"
        );

    const options =
        document.getElementById(
            "options"
        );

    const explanation =
        document.getElementById(
            "explanation-text"
        );

    if (question) {
        data.question =
            question.innerHTML;
    }

    if (options) {
        data.options =
            options.innerHTML;
    }

    if (explanation) {
        data.explanation =
            explanation.innerHTML;
    }

    try {

        const stored =
            JSON.parse(
                localStorage.getItem(
                    HIGHLIGHT_STORAGE_KEY
                ) || "{}"
            );

        stored[questionId] =
            data;

        localStorage.setItem(
            HIGHLIGHT_STORAGE_KEY,
            JSON.stringify(stored)
        );

    } catch (error) {

        console.error(
            "Could not save highlights:",
            error
        );
    }
}


/* ============================================================
   RESTORE HIGHLIGHTS
   ============================================================ */

function restoreHighlights() {

    if (
        !currentQuestion ||
        !currentQuestion.id
    ) {
        return;
    }

    let stored;

    try {

        stored =
            JSON.parse(
                localStorage.getItem(
                    HIGHLIGHT_STORAGE_KEY
                ) || "{}"
            );

    } catch (error) {

        console.error(
            "Could not read highlights:",
            error
        );

        return;
    }

    const data =
        stored[
            String(
                currentQuestion.id
            )
        ];

    if (!data) {
        return;
    }

    const question =
        document.getElementById(
            "question"
        );

    const options =
        document.getElementById(
            "options"
        );

    const explanation =
        document.getElementById(
            "explanation-text"
        );

    if (
        question &&
        data.question
    ) {

        question.innerHTML =
            sanitizeHighlightHTML(
                data.question
            );
    }

    if (
        options &&
        data.options
    ) {

        /*
         * Only restore the highlight
         * markup, not arbitrary HTML.
         */
        restoreOptionHighlights(
            options,
            data.options
        );
    }

    if (
        explanation &&
        data.explanation
    ) {

        explanation.innerHTML =
            sanitizeHighlightHTML(
                data.explanation
            );
    }
}


/* ============================================================
   RESTORE OPTION HIGHLIGHTS
   ============================================================ */

function restoreOptionHighlights(
    container,
    savedHTML
) {

    const template =
        document.createElement(
            "template"
        );

    template.innerHTML =
        savedHTML;

    const savedTexts =
        Array.from(
            template.content.querySelectorAll(
                ".option-text"
            )
        );

    const currentTexts =
        Array.from(
            container.querySelectorAll(
                ".option-text"
            )
        );

    savedTexts.forEach(
        (
            saved,
            index
        ) => {

            const current =
                currentTexts[index];

            if (!current) {
                return;
            }

            current.innerHTML =
                sanitizeHighlightHTML(
                    saved.innerHTML
                );
        }
    );
}


/* ============================================================
   SANITIZE HIGHLIGHT HTML
   ============================================================ */

function sanitizeHighlightHTML(
    html
) {

    const template =
        document.createElement(
            "template"
        );

    template.innerHTML =
        html;

    const elements =
        Array.from(
            template.content.querySelectorAll(
                "*"
            )
        );

    elements.forEach(
        element => {

            if (
                element.tagName !==
                "MARK" ||
                !element.classList.contains(
                    "aib-highlight"
                )
            ) {

                if (
                    element.tagName !==
                    "BR"
                ) {

                    element.replaceWith(
                        ...element.childNodes
                    );
                }

                return;
            }

            const color =
                element.dataset.highlightColor;

            if (
                color &&
                /^#[0-9a-fA-F]{6}$/.test(
                    color
                )
            ) {

                element.style.backgroundColor =
                    color;

            } else {

                element.style.backgroundColor =
                    currentHighlightColor;
            }

            element.title =
                "Click to remove highlight";
        }
    );

    return template.innerHTML;
}


/* ============================================================
   CLEAR ALL HIGHLIGHTS
   ============================================================ */

function clearAllHighlights() {

    if (!currentQuestion) {
        return;
    }

    const containers = [
        document.getElementById(
            "question"
        ),
        document.getElementById(
            "options"
        ),
        document.getElementById(
            "explanation-text"
        )
    ];

    containers.forEach(
        container => {

            if (!container) {
                return;
            }

            container
                .querySelectorAll(
                    ".aib-highlight"
                )
                .forEach(
                    removeHighlight
                );
        }
    );

    try {

        const stored =
            JSON.parse(
                localStorage.getItem(
                    HIGHLIGHT_STORAGE_KEY
                ) || "{}"
            );

        delete stored[
            String(
                currentQuestion.id
            )
        ];

        localStorage.setItem(
            HIGHLIGHT_STORAGE_KEY,
            JSON.stringify(stored)
        );

    } catch (error) {

        console.error(
            "Could not clear highlights:",
            error
        );
    }
}


/* ============================================================
   KEYBOARD SHORTCUTS
   ALT + H = HIGHLIGHTER
   ESC = TURN OFF HIGHLIGHTER
   ============================================================ */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.altKey &&
            event.key.toLowerCase() ===
            "h"
        ) {

            event.preventDefault();

            toggleHighlighter();
        }

        if (
            event.key === "Escape" &&
            highlighterActive
        ) {

            highlighterActive =
                false;

            document.body.classList.remove(
                "highlighter-active"
            );

            const button =
                document.getElementById(
                    "highlighter-btn"
                );

            if (button) {

                button.classList.remove(
                    "active"
                );

                button.setAttribute(
                    "aria-pressed",
                    "false"
                );
            }
        }
    }
);


/* ============================================================
   HIGHLIGHTER STYLES
   ============================================================ */

function injectHighlighterStyles() {

    if (
        document.getElementById(
            "aibrainbox-highlighter-styles"
        )
    ) {
        return;
    }

    const style =
        document.createElement(
            "style"
        );

    style.id =
        "aibrainbox-highlighter-styles";

    style.textContent = `
        .aib-highlight {
            background-color: #fff176;
            color: inherit;
            padding: 0 2px;
            border-radius: 3px;
            cursor: pointer;
            -webkit-box-decoration-break: clone;
            box-decoration-break: clone;
            transition:
                background-color 0.15s ease,
                box-shadow 0.15s ease;
        }

        .aib-highlight:hover {
            box-shadow:
                0 0 0 2px rgba(0, 0, 0, 0.08);
        }

        body.highlighter-active
        #question,
        body.highlighter-active
        #options,
        body.highlighter-active
        #explanation-text {
            cursor: text;
        }

        #highlighter-btn.active {
            background: #fff176 !important;
            color: #4a3f00 !important;
            border-color: #e6c900 !important;
            box-shadow:
                0 0 0 3px rgba(255, 241, 118, 0.35);
        }

        [data-highlight-color].active {
            outline:
                2px solid #333 !important;
            outline-offset: 2px;
        }

        .reaction-container {
            position: fixed;
            inset: 0;
            pointer-events: none;
            overflow: hidden;
            z-index: 99999;
        }

        .reaction-emoji {
            position: absolute;
            left: var(--start-left);
            bottom: -60px;
            font-size: var(--emoji-size);
            animation:
                aibReaction
                var(--duration)
                ease-out
                var(--delay)
                forwards;
        }

        @keyframes aibReaction {

            0% {
                transform:
                    translate3d(
                        0,
                        0,
                        0
                    )
                    rotate(0deg)
                    scale(0.7);
                opacity: 0;
            }

            10% {
                opacity: 1;
            }

            100% {
                transform:
                    translate3d(
                        var(--horizontal),
                        -105vh,
                        0
                    )
                    rotate(var(--rotation))
                    scale(1.15);
                opacity: 0;
            }
        }
    `;

    document.head.appendChild(
        style
    );
}


/* ============================================================
   ERROR
   ============================================================ */

function showError(
    message
) {

    const loading =
        document.getElementById(
            "loading"
        );

    const container =
        document.getElementById(
            "question-container"
        );

    const errorBox =
        document.getElementById(
            "error"
        );

    if (loading) {
        loading.classList.add(
            "hidden"
        );
    }

    if (container) {
        container.classList.add(
            "hidden"
        );
    }

    if (errorBox) {

        errorBox.classList.remove(
            "hidden"
        );

        errorBox.innerText =
            message;
    }
}
