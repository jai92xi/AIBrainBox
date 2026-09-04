// ============================================================
// DIWALI CRACKER SPARKLES
// ============================================================

let sparkleTimeout = null;
let sparkleInterval = null;

function showCorrectSparkles() {

    stopCorrectSparkles();

    const layer = document.createElement("div");

    layer.id = "diwali-sparkles";

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

    addDiwaliSparkleStyles();

    const colors = [
        "#FFD700",
        "#FFA500",
        "#FFF4A3",
        "#FFFFFF",
        "#FFCC33",
        "#FF6B35",
        "#FF4081",
        "#B388FF"
    ];


    // --------------------------------------------------------
    // Create one Diwali-style sparkle burst
    // --------------------------------------------------------

    function createSparkleBurst() {

        const x = 5 + Math.random() * 90;
        const y = 8 + Math.random() * 82;

        const color =
            colors[
                Math.floor(
                    Math.random() * colors.length
                )
            ];


        // Main star
        const star =
            document.createElement("div");

        star.className =
            "diwali-star";

        star.innerHTML = "✦";

        Object.assign(star.style, {
            left: `${x}%`,
            top: `${y}%`,
            color: color,
            textShadow:
                `0 0 5px ${color},
                 0 0 12px ${color},
                 0 0 25px ${color}`
        });

        layer.appendChild(star);


        // ----------------------------------------------------
        // Sharp cracker sparks
        // ----------------------------------------------------

        const sparkCount =
            12 + Math.floor(
                Math.random() * 10
            );


        for (
            let i = 0;
            i < sparkCount;
            i++
        ) {

            const spark =
                document.createElement("span");

            spark.className =
                "diwali-spark";


            const angle =
                Math.random() * 360;


            const length =
                18 +
                Math.random() * 42;


            const distance =
                15 +
                Math.random() * 65;


            const radians =
                angle * Math.PI / 180;


            const dx =
                Math.cos(radians) *
                distance;


            const dy =
                Math.sin(radians) *
                distance;


            Object.assign(
                spark.style,
                {
                    left: `${x}%`,
                    top: `${y}%`,
                    background: color,
                    width: `${length}px`,
                    boxShadow:
                        `0 0 5px ${color},
                         0 0 10px ${color}`,
                    "--dx": `${dx}px`,
                    "--dy": `${dy}px`,
                    "--angle": `${angle}deg`,
                    animationDelay:
                        `${Math.random() * 0.08}s`
                }
            );


            layer.appendChild(
                spark
            );
        }


        // ----------------------------------------------------
        // Tiny twinkling stars
        // ----------------------------------------------------

        for (let i = 0; i < 5; i++) {

            const tiny =
                document.createElement("span");

            tiny.className =
                "diwali-twinkle";

            tiny.innerHTML =
                Math.random() > 0.5
                    ? "✧"
                    : "⋆";


            Object.assign(
                tiny.style,
                {
                    left:
                        `${x + (Math.random() - 0.5) * 12}%`,
                    top:
                        `${y + (Math.random() - 0.5) * 12}%`,
                    color: color,
                    textShadow:
                        `0 0 8px ${color},
                         0 0 18px ${color}`
                }
            );


            layer.appendChild(
                tiny
            );
        }
    }


    // --------------------------------------------------------
    // Start celebration
    // --------------------------------------------------------

    createSparkleBurst();


    setTimeout(
        createSparkleBurst,
        120
    );

    setTimeout(
        createSparkleBurst,
        240
    );


    // More cracker-style bursts
    sparkleInterval =
        setInterval(
            createSparkleBurst,
            180
        );


    // Exactly 2 seconds
    sparkleTimeout =
        setTimeout(
            stopCorrectSparkles,
            2000
        );
}


// ============================================================
// STOP SPARKLES
// ============================================================

function stopCorrectSparkles() {

    if (sparkleInterval) {

        clearInterval(
            sparkleInterval
        );

        sparkleInterval = null;
    }


    if (sparkleTimeout) {

        clearTimeout(
            sparkleTimeout
        );

        sparkleTimeout = null;
    }


    const layer =
        document.getElementById(
            "diwali-sparkles"
        );


    if (layer) {
        layer.remove();
    }
}


// ============================================================
// DIWALI SPARKLE ANIMATIONS
// ============================================================

function addDiwaliSparkleStyles() {

    if (
        document.getElementById(
            "diwali-sparkle-style"
        )
    ) {
        return;
    }


    const style =
        document.createElement("style");


    style.id =
        "diwali-sparkle-style";


    style.innerHTML = `

        /*
         * Main bright star
         */
        .diwali-star {

            position: absolute;

            font-size: 28px;

            font-weight: 900;

            line-height: 1;

            transform:
                translate(-50%, -50%)
                scale(0);

            opacity: 0;

            animation:
                diwaliStarBurst
                0.75s
                ease-out
                forwards;
        }


        /*
         * Thin sharp sparks
         * These are NOT bubbles.
         */
        .diwali-spark {

            position: absolute;

            height: 2px;

            border-radius: 2px;

            transform-origin: left center;

            transform:
                translate(0, 0)
                rotate(var(--angle))
                scaleX(0);

            opacity: 0;

            animation:
                diwaliSparkShoot
                0.85s
                cubic-bezier(
                    0.15,
                    0.75,
                    0.25,
                    1
                )
                forwards;
        }


        /*
         * Small twinkling stars
         */
        .diwali-twinkle {

            position: absolute;

            font-size: 17px;

            font-weight: bold;

            line-height: 1;

            transform:
                translate(-50%, -50%)
                scale(0);

            opacity: 0;

            animation:
                diwaliTwinkle
                0.9s
                ease-out
                forwards;
        }


        /*
         * Main star burst
         */
        @keyframes diwaliStarBurst {

            0% {

                opacity: 0;

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
                    rotate(20deg);
            }

            45% {

                opacity: 1;

                transform:
                    translate(-50%, -50%)
                    scale(0.9)
                    rotate(45deg);
            }

            70% {

                opacity: 0.9;

                transform:
                    translate(-50%, -50%)
                    scale(1.15)
                    rotate(70deg);
            }

            100% {

                opacity: 0;

                transform:
                    translate(-50%, -50%)
                    scale(0)
                    rotate(120deg);
            }
        }


        /*
         * Sharp sparks shooting outward
         */
        @keyframes diwaliSparkShoot {

            0% {

                opacity: 0;

                transform:
                    translate(0, 0)
                    rotate(var(--angle))
                    scaleX(0);
            }

            10% {

                opacity: 1;

                transform:
                    translate(0, 0)
                    rotate(var(--angle))
                    scaleX(0.4);
            }

            55% {

                opacity: 1;

                transform:
                    translate(
                        calc(var(--dx) * 0.55),
                        calc(var(--dy) * 0.55)
                    )
                    rotate(var(--angle))
                    scaleX(1);
            }

            100% {

                opacity: 0;

                transform:
                    translate(
                        var(--dx),
                        var(--dy)
                    )
                    rotate(var(--angle))
                    scaleX(0.25);
            }
        }


        /*
         * Tiny star twinkle
         */
        @keyframes diwaliTwinkle {

            0% {

                opacity: 0;

                transform:
                    translate(-50%, -50%)
                    scale(0)
                    rotate(0deg);
            }

            25% {

                opacity: 1;

                transform:
                    translate(-50%, -50%)
                    scale(1.4)
                    rotate(45deg);
            }

            60% {

                opacity: 1;

                transform:
                    translate(-50%, -50%)
                    scale(0.8)
                    rotate(90deg);
            }

            100% {

                opacity: 0;

                transform:
                    translate(-50%, -50%)
                    scale(0)
                    rotate(180deg);
            }
        }


        @media (
            prefers-reduced-motion: reduce
        ) {

            #diwali-sparkles {
                display: none !important;
            }

        }

    `;


    document.head.appendChild(
        style
    );
}
