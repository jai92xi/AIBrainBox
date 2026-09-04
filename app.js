let questions = [];
let currentQuestion = null;


// ============================================================
// LOAD QUESTIONS FROM CSV
// ============================================================

async function loadQuestions() {
    try {
        const response = await fetch("xi-questions.csv");

        if (!response.ok) {
            throw new Error("Could not load xi-questions.csv");
        }

        const csvText = await response.text();

        questions = parseCSV(csvText);

        if (questions.length === 0) {
            throw new Error("No questions found in the CSV file.");
        }

        loadQuestion();

    } catch (error) {
        document.getElementById("loading").classList.add("hidden");

        const errorBox = document.getElementById("error");

        errorBox.classList.remove("hidden");

        errorBox.innerText =
            "Unable to load the question database. Please check that xi-questions.csv exists in the repository.";

        console.error(error);
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

    for (let i = 0; i < text.length; i++) {

        const char = text[i];
        const nextChar = text[i + 1];

        if (char === '"' && insideQuotes && nextChar === '"') {
            cell += '"';
            i++;
        }

        else if (char === '"') {
            insideQuotes = !insideQuotes;
        }

        else if (char === "," && !insideQuotes) {
            row.push(cell);
            cell = "";
        }

        else if (
            (char === "\n" || char === "\r") &&
            !insideQuotes
        ) {
            if (char === "\r" && nextChar === "\n") {
                i++;
            }

            row.push(cell);

            if (
                row.some(
                    value => value.trim() !== ""
                )
            ) {
                rows.push(row);
            }

            row = [];
            cell = "";
        }

        else {
            cell += char;
        }
    }

    if (cell !== "" || row.length > 0) {
        row.push(cell);

        if (
            row.some(
                value => value.trim() !== ""
            )
        ) {
            rows.push(row);
        }
    }

    if (rows.length === 0) {
        return [];
    }

    const headers = rows[0].map(
        header =>
            header
                .trim()
                .toLowerCase()
    );

    return rows.slice(1).map(row => {

        const question = {};

        headers.forEach(
            (header, index) => {
                question[header] =
                    row[index] || "";
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

    const id = params.get("id");

    if (!id) {

        showError(
            "No question ID was provided. Please use a question link such as ?id=Xi-00001"
        );

        return;
    }

    currentQuestion =
        questions.find(
            q =>
                q.id &&
                q.id.trim().toLowerCase() ===
                id.trim().toLowerCase()
        );

    if (!currentQuestion) {

        showError(
            "Question not found: " + id
        );

        return;
    }

    displayQuestion();
}


// ============================================================
// DISPLAY QUESTION
// ============================================================

function displayQuestion() {

    document
        .getElementById("loading")
        .classList.add("hidden");

    document
        .getElementById("question-container")
        .classList.remove("hidden");

    document
        .getElementById("question-id")
        .innerText =
        currentQuestion.id || "";

    document
        .getElementById("topic")
        .innerText =
        currentQuestion.topic || "";

    document
        .getElementById("question")
        .innerText =
        currentQuestion.question || "";


    const optionsContainer =
        document.getElementById("options");

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
                document.createElement("label");

            option.className = "option";


            const radio =
                document.createElement("input");

            radio.type = "radio";
            radio.name = "answer";
            radio.value = letter;


            const letterSpan =
                document.createElement("span");

            letterSpan.className =
                "option-letter";

            letterSpan.innerText =
                letter + ".";


            const textSpan =
                document.createElement("span");

            textSpan.className =
                "option-text";

            textSpan.innerText =
                currentQuestion[
                    letter.toLowerCase()
                ] || "";


            option.appendChild(radio);
            option.appendChild(letterSpan);
            option.appendChild(textSpan);

            optionsContainer.appendChild(option);


            radio.addEventListener(
                "change",
                () => {

                    document
                        .querySelectorAll(".option")
                        .forEach(
                            item =>
                                item.classList.remove(
                                    "selected"
                                )
                        );

                    option.classList.add(
                        "selected"
                    );

                    clearAnswerStates();
                }
            );
        }
    );


    const result =
        document.getElementById("result");

    result.innerText = "";
    result.className = "";


    const explanation =
        document.getElementById("explanation");

    explanation.classList.add("hidden");


    const explanationText =
        document.getElementById(
            "explanation-text"
        );

    explanationText.innerText = "";
}


// ============================================================
// CLEAR ANSWER STATES
// ============================================================

function clearAnswerStates() {

    document
        .querySelectorAll(".option")
        .forEach(option => {

            option.classList.remove(
                "correct-answer",
                "wrong-answer",
                "selected"
            );

        });

    const result =
        document.getElementById("result");

    result.innerText = "";
    result.className = "";
}


// ============================================================
// SUBMIT ANSWER
// ============================================================

function submitAnswer() {

    const selected =
        document.querySelector(
            'input[name="answer"]:checked'
        );


    const result =
        document.getElementById("result");


    if (!selected) {

        result.className =
            "incorrect";

        result.innerText =
            "😕 Please select an answer first.";

        return;
    }


    const userAnswer =
        selected.value
            .trim()
            .toUpperCase();


    const correctAnswer =
        (
            currentQuestion["correct answer"] ||
            ""
        )
        .trim()
        .toUpperCase();


    const allOptions =
        document.querySelectorAll(".option");


    allOptions.forEach(option => {

        option.classList.remove(
            "correct-answer",
            "wrong-answer"
        );

    });


    // ========================================================
    // CORRECT ANSWER
    // ========================================================

    if (
        userAnswer === correctAnswer
    ) {

        selected
            .closest(".option")
            .classList.add(
                "correct-answer"
            );


        result.className =
            "correct";

        result.innerText =
            "🎉👏👏 Excellent! Correct! 🥳🎊✨🚀";


        showCorrectCelebration();

    }


    // ========================================================
    // WRONG ANSWER
    // ========================================================

    else {

        selected
            .closest(".option")
            .classList.add(
                "wrong-answer"
            );


        allOptions.forEach(option => {

            const radio =
                option.querySelector(
                    'input[type="radio"]'
                );

            if (
                radio &&
                radio.value.toUpperCase() ===
                correctAnswer
            ) {
                option.classList.add(
                    "correct-answer"
                );
            }

        });


        result.className =
            "incorrect";

        result.innerText =
            "😢😞 Oh no! Not quite! 💔🥺 Try again!";


        showWrongReaction();
    }


    // ========================================================
    // SHOW EXPLANATION
    // ========================================================

    const explanation =
        document.getElementById(
            "explanation"
        );

    explanation.classList.remove(
        "hidden"
    );


    const explanationValue =
        currentQuestion.explanation ||
        currentQuestion.explaination ||
        "";


    document.getElementById(
        "explanation-text"
    ).innerText =
        explanationValue;
}


// ============================================================
// CORRECT CELEBRATION
// ============================================================

function showCorrectCelebration() {

    removeReaction();


    const reaction =
        document.createElement("div");

    reaction.id =
        "answer-reaction";

    reaction.className =
        "correct-reaction";


    reaction.innerHTML = `
        <div class="reaction-emojis">
            🎉 👏 🥳 🎊 👏 ✨ 🚀 🤖 🧠 💡 👏 🎉
        </div>

        <div class="reaction-message">
            Correct!
        </div>

        <div class="reaction-subtitle">
            Senior AI Engineer mode activated 🚀
        </div>
    `;


    document.body.appendChild(
        reaction
    );


    createConfetti();


    setTimeout(
        () => {
            removeReaction();
        },
        3200
    );
}


// ============================================================
// WRONG REACTION
// ============================================================

function showWrongReaction() {

    removeReaction();


    const reaction =
        document.createElement("div");

    reaction.id =
        "answer-reaction";

    reaction.className =
        "wrong-reaction";


    reaction.innerHTML = `
        <div class="reaction-emojis">
            😢 😞 😔 🥺 💔 😭 😕
        </div>

        <div class="reaction-message">
            Not quite!
        </div>

        <div class="reaction-subtitle">
            Review the explanation and try again 💡
        </div>
    `;


    document.body.appendChild(
        reaction
    );


    setTimeout(
        () => {
            removeReaction();
        },
        2800
    );
}


// ============================================================
// REMOVE REACTION
// ============================================================

function removeReaction() {

    const existing =
        document.getElementById(
            "answer-reaction"
        );

    if (existing) {
        existing.remove();
    }


    document
        .querySelectorAll(
            ".ai-confetti"
        )
        .forEach(
            item => item.remove()
        );
}


// ============================================================
// CONFETTI
// ============================================================

function createConfetti() {

    const emojis = [
        "🎉",
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
        "👏"
    ];


    for (let i = 0; i < 35; i++) {

        const particle =
            document.createElement("div");

        particle.className =
            "ai-confetti";

        particle.innerText =
            emojis[
                Math.floor(
                    Math.random() *
                    emojis.length
                )
            ];


        particle.style.left =
            Math.random() * 100 + "vw";


        particle.style.animationDelay =
            Math.random() * 0.8 + "s";


        particle.style.animationDuration =
            2.2 +
            Math.random() * 1.8 +
            "s";


        document.body.appendChild(
            particle
        );


        setTimeout(
            () => {
                particle.remove();
            },
            4500
        );
    }
}


// ============================================================
// COPY QUESTION LINK
// ============================================================

async function copyLink() {

    const button =
        document.getElementById(
            "copy-btn"
        );


    try {

        await navigator.clipboard.writeText(
            window.location.href
        );


        button.innerText =
            "✓ Link Copied!";


        setTimeout(
            () => {

                button.innerText =
                    "🔗 Copy Question Link";

            },
            2000
        );

    }

    catch (error) {

        console.error(
            "Unable to copy link:",
            error
        );


        button.innerText =
            "Unable to copy link";


        setTimeout(
            () => {

                button.innerText =
                    "🔗 Copy Question Link";

            },
            2000
        );
    }
}


// ============================================================
// SHOW ERROR
// ============================================================

function showError(message) {

    document
        .getElementById("loading")
        .classList.add("hidden");


    document
        .getElementById(
            "question-container"
        )
        .classList.add("hidden");


    const errorBox =
        document.getElementById(
            "error"
        );


    errorBox.classList.remove(
        "hidden"
    );


    errorBox.innerText =
        message;
}


// ============================================================
// LOAD APPLICATION
// ============================================================

loadQuestions();
