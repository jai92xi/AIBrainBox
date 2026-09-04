let questions = [];
let currentQuestion = null;


// ============================================================
// DIWALI FIREWORKS CELEBRATION
// ============================================================

let fireworksTimeout = null;
let fireworksInterval = null;

function showCorrectSparkles() {

    // Remove any existing celebration
    stopFireworks();

    // Create full-screen fireworks layer
    const layer =
        document.createElement("div");

    layer.id = "diwali-fireworks";

    Object.assign(layer.style, {
        position: "fixed",
        inset: "0",
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: "99999",
        overflow: "hidden"
    });

    document.body.appendChild(layer);


    // Add animation CSS once
    addFireworksStyles();


    // --------------------------------------------------------
    // Create fireworks bursts
    // --------------------------------------------------------

    function createFirework() {

        const x =
            Math.random() * 100;

        const y =
            15 + Math.random() * 60;

        const colors = [
            "#FFD700", // gold
            "#FF4500", // orange red
            "#FF1744", // red
            "#FFEA00", // yellow
            "#00E676", // green
            "#00E5FF", // cyan
            "#7C4DFF", // purple
            "#FFFFFF"  // white
        ];

        const color =
            colors[
                Math.floor(
                    Math.random() * colors.length
                )
            ];

        const particleCount = 32 + Math.floor(
            Math.random() * 20
        );


        // Bright flash in the center
        const flash =
            document.createElement("div");

        flash.className =
            "diwali-flash";

        Object.assign(flash.style, {
            left: `${x}%`,
            top: `${y}%`,
            background: color,
            boxShadow:
                `0 0 15px ${color},
                 0 0 35px ${color},
                 0 0 60px ${color}`
        });

        layer.appendChild(flash);


        // Create particles
        for (
            let i = 0;
            i < particleCount;
            i++
        ) {

            const particle =
                document.createElement("span");

            particle.className =
                "diwali-particle";


            const angle =
                (Math.PI * 2 * i) /
                particleCount +
                (Math.random() * 0.15);


            const distance =
                60 +
                Math.random() * 110;


            const dx =
                Math.cos(angle) *
                distance;

            const dy =
                Math.sin(angle) *
                distance;


            const size =
                3 +
                Math.random() * 5;


            Object.assign(
                particle.style,
                {
                    left: `${x}%`,
                    top: `${y}%`,
                    width: `${size}px`,
                    height: `${size}px`,
                    background: color,
                    boxShadow:
                        `0 0 5px ${color},
                         0 0 12px ${color}`,
                    "--dx": `${dx}px`,
                    "--dy": `${dy}px`,
                    animationDelay:
                        `${Math.random() * 0.08}s`
                }
            );


            layer.appendChild(
                particle
            );
        }


        // A few larger star particles
        for (let i = 0; i < 8; i++) {

            const star =
                document.createElement("span");

            star.className =
                "diwali-star";

            Object.assign(star.style, {
                left: `${x}%`,
                top: `${y}%`,
                color: color,
                "--dx":
                    `${(Math.random() - 0.5) * 260}px`,
                "--dy":
                    `${(Math.random() - 0.5) * 260}px`
            });

            star.innerText = "✦";

            layer.appendChild(star);
        }
    }


    // --------------------------------------------------------
    // Initial fireworks
    // --------------------------------------------------------

    createFirework();

    setTimeout(
        createFirework,
        150
    );

    setTimeout(
        createFirework,
        300
    );


    // --------------------------------------------------------
    // Continue fireworks for 2 seconds
    // --------------------------------------------------------

    fireworksInterval =
        setInterval(
            () => {

                createFirework();

            },
            220
        );


    // --------------------------------------------------------
    // Stop after exactly 2 seconds
    // --------------------------------------------------------

    fireworksTimeout =
        setTimeout(
            () => {

                stopFireworks();

            },
            2000
        );
}


// ============================================================
// STOP FIREWORKS
// ============================================================

function stopFireworks() {

    if (fireworksInterval) {

        clearInterval(
            fireworksInterval
        );

        fireworksInterval = null;
    }


    if (fireworksTimeout) {

        clearTimeout(
            fireworksTimeout
        );

        fireworksTimeout = null;
    }


    const layer =
        document.getElementById(
            "diwali-fireworks"
        );

    if (layer) {
        layer.remove();
    }
}


// ============================================================
// FIREWORKS CSS
// ============================================================

function addFireworksStyles() {

    if (
        document.getElementById(
            "aibrainbox-diwali-style"
        )
    ) {
        return;
    }


    const style =
        document.createElement("style");


    style.id =
        "aibrainbox-diwali-style";


    style.innerHTML = `

        /*
         * Bright center flash
         */
        .diwali-flash {

            position: absolute;

            width: 12px;
            height: 12px;

            border-radius: 50%;

            transform:
                translate(-50%, -50%)
                scale(0);

            animation:
                diwaliFlash
                0.45s
                ease-out
                forwards;
        }


        /*
         * Firework particles
         */
        .diwali-particle {

            position: absolute;

            border-radius: 50%;

            transform:
                translate(-50%, -50%)
                scale(1);

            opacity: 1;

            animation:
                diwaliParticle
                1.15s
                cubic-bezier(
                    0.15,
                    0.75,
                    0.3,
                    1
                )
                forwards;
        }


        /*
         * Star-shaped particles
         */
        .diwali-star {

            position: absolute;

            font-size: 18px;

            font-weight: bold;

            text-shadow:
                0 0 5px currentColor,
                0 0 12px currentColor,
                0 0 25px currentColor;

            transform:
                translate(-50%, -50%)
                scale(0);

            opacity: 1;

            animation:
                diwaliStar
                1.1s
                ease-out
                forwards;
        }


        /*
         * Flash animation
         */
        @keyframes diwaliFlash {

            0% {
                opacity: 0;
                transform:
                    translate(-50%, -50%)
                    scale(0);
            }

            15% {
                opacity: 1;
                transform:
                    translate(-50%, -50%)
                    scale(3);
            }

            35% {
                opacity: 1;
                transform:
                    translate(-50%, -50%)
                    scale(1.5);
            }

            100% {
                opacity: 0;
                transform:
                    translate(-50%, -50%)
                    scale(0);
            }
        }


        /*
         * Particle explosion
         */
        @keyframes diwaliParticle {

            0% {

                opacity: 1;

                transform:
                    translate(-50%, -50%)
                    translate(0, 0)
                    scale(1.3);
            }

            15% {

                opacity: 1;
            }

            75% {

                opacity: 0.9;
            }

            100% {

                opacity: 0;

                transform:
                    translate(-50%, -50%)
                    translate(
                        var(--dx),
                        var(--dy)
                    )
                    scale(0.15);
            }
        }


        /*
         * Star explosion
         */
        @keyframes diwaliStar {

            0% {

                opacity: 1;

                transform:
                    translate(-50%, -50%)
                    scale(0)
                    rotate(0deg);
            }

            20% {

                opacity: 1;

                transform:
                    translate(-50%, -50%)
                    scale(1.5)
                    rotate(45deg);
            }

            100% {

                opacity: 0;

                transform:
                    translate(-50%, -50%)
                    translate(
                        var(--dx),
                        var(--dy)
                    )
                    scale(0.2)
                    rotate(180deg);
            }
        }


        /*
         * Respect reduced-motion settings
         */
        @media (
            prefers-reduced-motion: reduce
        ) {

            #diwali-fireworks {
                display: none !important;
            }

        }

    `;


    document.head.appendChild(
        style
    );
}


// ============================================================
// LOAD QUESTIONS FROM CSV
// ============================================================

async function loadQuestions() {

    try {

        const response =
            await fetch(
                "xi-questions.csv"
            );

        if (!response.ok) {

            throw new Error(
                "Could not load xi-questions.csv"
            );
        }

        const csvText =
            await response.text();

        questions =
            parseCSV(
                csvText
            );

        if (
            questions.length === 0
        ) {

            throw new Error(
                "No questions found in the CSV file."
            );
        }

        loadQuestion();

    }

    catch (error) {

        document
            .getElementById("loading")
            .classList.add("hidden");

        const errorBox =
            document.getElementById(
                "error"
            );

        errorBox.classList.remove(
            "hidden"
        );

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

    for (
        let i = 0;
        i < text.length;
        i++
    ) {

        const char =
            text[i];

        const nextChar =
            text[i + 1];


        // Handle escaped quotes: ""
        if (
            char === '"' &&
            insideQuotes &&
            nextChar === '"'
        ) {

            cell += '"';

            i++;

        }


        // Start / end quoted field
        else if (
            char === '"'
        ) {

            insideQuotes =
                !insideQuotes;

        }


        // Comma separates cells
        else if (
            char === "," &&
            !insideQuotes
        ) {

            row.push(cell);

            cell = "";

        }


        // New row
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

        }

        else {

            cell += char;

        }
    }


    // Add final row
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


    // No data
    if (
        rows.length === 0
    ) {

        return [];
    }


    // First row = headers
    const headers =
        rows[0].map(
            header =>
                header
                    .trim()
                    .toLowerCase()
        );


    // Convert rows into objects
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

    const id =
        params.get("id");


    // No ID supplied
    if (!id) {

        showError(
            "No question ID was provided. Please use a question link such as ?id=Xi-00001"
        );

        return;
    }


    // Find question
    currentQuestion =
        questions.find(
            q =>
                q.id &&
                q.id.trim().toLowerCase() ===
                id.trim().toLowerCase()
        );


    // Question not found
    if (!currentQuestion) {

        showError(
            "Question not found: " +
            id
        );

        return;
    }


    displayQuestion();
}


// ============================================================
// DISPLAY QUESTION
// ============================================================

function displayQuestion() {

    // Hide loading
    document
        .getElementById("loading")
        .classList.add("hidden");


    // Show question container
    document
        .getElementById("question-container")
        .classList.remove("hidden");


    // Question ID
    document
        .getElementById("question-id")
        .innerText =
        currentQuestion.id || "";


    // Topic
    document
        .getElementById("topic")
        .innerText =
        currentQuestion.topic || "";


    // Question text
    document
        .getElementById("question")
        .innerText =
        currentQuestion.question || "";


    // Clear previous options
    const optionsContainer =
        document.getElementById(
            "options"
        );

    optionsContainer.innerHTML = "";


    // Answer options
    const optionLetters = [
        "A",
        "B",
        "C",
        "D"
    ];


    optionLetters.forEach(
        letter => {

            // Create label
            const option =
                document.createElement(
                    "label"
                );

            option.className =
                "option";


            // Create radio button
            const radio =
                document.createElement(
                    "input"
                );

            radio.type =
                "radio";

            radio.name =
                "answer";

            radio.value =
                letter;


            // Create answer letter
            const letterSpan =
                document.createElement(
                    "span"
                );

            letterSpan.className =
                "option-letter";

            letterSpan.innerText =
                letter + ".";


            // Create answer text
            const textSpan =
                document.createElement(
                    "span"
                );

            textSpan.className =
                "option-text";

            textSpan.innerText =
                currentQuestion[
                    letter.toLowerCase()
                ] || "";


            // Put everything inside option
            option.appendChild(
                radio
            );

            option.appendChild(
                letterSpan
            );

            option.appendChild(
                textSpan
            );


            // Add option to container
            optionsContainer.appendChild(
                option
            );


            // Highlight selected option
            radio.addEventListener(
                "change",
                () => {

                    document
                        .querySelectorAll(
                            ".option"
                        )
                        .forEach(
                            item =>
                                item.classList.remove(
                                    "selected"
                                )
                        );


                    option.classList.add(
                        "selected"
                    );

                }
            );

        }
    );


    // Reset result
    const result =
        document.getElementById(
            "result"
        );

    result.innerText =
        "";

    result.className =
        "";


    // Reset explanation
    const explanation =
        document.getElementById(
            "explanation"
        );

    explanation.classList.add(
        "hidden"
    );


    const explanationText =
        document.getElementById(
            "explanation-text"
        );

    explanationText.innerText =
        "";
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
        document.getElementById(
            "result"
        );


    // No answer selected
    if (!selected) {

        result.className =
            "incorrect";

        result.innerText =
            "Please select an answer first.";

        return;
    }


    // User answer
    const userAnswer =
        selected.value
            .trim()
            .toUpperCase();


    // Correct answer
    const correctAnswer =
        (
            currentQuestion[
                "correct answer"
            ] ||
            ""
        )
        .trim()
        .toUpperCase();


    // Check answer
    if (
        userAnswer ===
        correctAnswer
    ) {

        result.className =
            "correct";

        result.innerText =
            "✓ Correct!";


        // ====================================================
        // DIWALI FIREWORKS
        // ====================================================

        showCorrectSparkles();

    }

    else {

        result.className =
            "incorrect";

        result.innerText =
            "✗ Incorrect. Correct answer: " +
            correctAnswer;

    }


    // Show explanation
    const explanation =
        document.getElementById(
            "explanation"
        );

    explanation.classList.remove(
        "hidden"
    );


    /*
       Support both spellings.

       Preferred:
       explanation

       Older CSV:
       explaination
    */

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

    // Hide loading
    document
        .getElementById("loading")
        .classList.add("hidden");


    // Hide question
    document
        .getElementById(
            "question-container"
        )
        .classList.add("hidden");


    // Show error
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
