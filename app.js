let questions = [];
let currentQuestionIndex = -1;
let currentQuestion = null;

const CSV_URL = "./xi-questions.csv";

let score = 0;
let answeredQuestions = new Set();
let questionResults = new Map();
let savedAnswers = new Map();

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
    quote: "Your life changes the moment you decide that excuses are no longer acceptable.",
    author: "AIBrainBox"
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
    quote: "You don't need more time. You need more focus.",
    author: "AIBrainBox"
},
{
    quote: "What seems impossible today will one day become your proof of what is possible.",
    author: "AIBrainBox"
},
{
    quote: "It always seems impossible until it's done.",
    author: "Nelson Mandela"
},
{
    quote: "Your potential means nothing if you refuse to act on it.",
    author: "AIBrainBox"
},
{
    quote: "Start where you are. Use what you have. Do what you can.",
    author: "Arthur Ashe"
},
{
    quote: "The distance between your dreams and reality is called action.",
    author: "AIBrainBox"
},
{
    quote: "Success usually comes to those who are too busy to be looking for it.",
    author: "Henry David Thoreau"
},
{
    quote: "You are one decision away from changing the direction of your life.",
    author: "AIBrainBox"
},
{
    quote: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
},
{
    quote: "Stop waiting for the perfect moment. Make the moment matter.",
    author: "AIBrainBox"
},
{
    quote: "If you want something you've never had, you must be willing to do something you've never done.",
    author: "Thomas Jefferson"
},
{
    quote: "Your habits are quietly building the person you will become.",
    author: "AIBrainBox"
},
{
    quote: "Great works are performed not by strength but by perseverance.",
    author: "Samuel Johnson"
},
{
    quote: "The version of you that you want to become is built by the choices you make today.",
    author: "AIBrainBox"
},
{
    quote: "Success is walking from failure to failure with no loss of enthusiasm.",
    author: "Winston Churchill"
},
{
    quote: "You cannot defeat a person who refuses to quit.",
    author: "AIBrainBox"
},
{
    quote: "The only limit to our realization of tomorrow is our doubts of today.",
    author: "Franklin D. Roosevelt"
},
{
    quote: "Your doubts are not predictions. They are just thoughts.",
    author: "AIBrainBox"
},
{
    quote: "Energy and persistence conquer all things.",
    author: "Benjamin Franklin"
},
{
    quote: "Do not let a bad chapter convince you that your story is over.",
    author: "AIBrainBox"
},
{
    quote: "If opportunity doesn't knock, build a door.",
    author: "Milton Berle"
},
{
    quote: "Nobody remembers the days you almost gave up. They remember the day you made it.",
    author: "AIBrainBox"
},
{
    quote: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt"
},
{
    quote: "You owe your future self more than another excuse.",
    author: "AIBrainBox"
},
{
    quote: "Do not wait to strike till the iron is hot; but make it hot by striking.",
    author: "William Butler Yeats"
},
{
    quote: "Your results will eventually expose what your habits have been hiding.",
    author: "AIBrainBox"
},
{
    quote: "The only person you are destined to become is the person you decide to be.",
    author: "Ralph Waldo Emerson"
},
{
    quote: "You don't need permission to become who you were meant to be.",
    author: "AIBrainBox"
},
{
    quote: "Courage doesn't always roar. Sometimes courage is the quiet voice saying, 'I will try again tomorrow.'",
    author: "Mary Anne Radmacher"
},
{
    quote: "Every day you delay is another day your dream waits for you.",
    author: "AIBrainBox"
},
{
    quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill"
},
{
    quote: "You become unstoppable when quitting is no longer an option.",
    author: "AIBrainBox"
},
{
    quote: "The journey of a thousand miles begins with one step.",
    author: "Lao Tzu"
},
{
    quote: "One disciplined hour today can change the direction of your entire year.",
    author: "AIBrainBox"
},
{
    quote: "Nothing will work unless you do.",
    author: "Maya Angelou"
},
{
    quote: "Your life will not change because you want it to. It changes when you do.",
    author: "AIBrainBox"
},
{
    quote: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt"
},
{
    quote: "The hardest step is often the one you keep postponing.",
    author: "AIBrainBox"
},
{
    quote: "Don't limit your challenges. Challenge your limits.",
    author: "Jerry Dunn"
},
{
    quote: "You are capable of more than your current circumstances suggest.",
    author: "AIBrainBox"
},
{
    quote: "The best way out is always through.",
    author: "Robert Frost"
},
{
    quote: "You don't find confidence. You build it by keeping promises to yourself.",
    author: "AIBrainBox"
},
{
    quote: "What you do every day matters more than what you do once in a while.",
    author: "Gretchen Rubin"
},
{
    quote: "Your future is being created by what you repeatedly do right now.",
    author: "AIBrainBox"
},
{
    quote: "Hardships often prepare ordinary people for an extraordinary destiny.",
    author: "C. S. Lewis"
},
{
    quote: "The struggle you are avoiding may be the exact thing that makes you stronger.",
    author: "AIBrainBox"
},
{
    quote: "There is no substitute for hard work.",
    author: "Thomas Edison"
},
{
    quote: "Talent may open the door, but consistency decides who stays in the room.",
    author: "AIBrainBox"
},
{
    quote: "You miss 100% of the shots you don't take.",
    author: "Wayne Gretzky"
},
{
    quote: "Regret is often the price of the chances you were too afraid to take.",
    author: "AIBrainBox"
},
{
    quote: "Don't count the days. Make the days count.",
    author: "Muhammad Ali"
},
{
    quote: "Your circumstances may explain where you are, but they do not decide where you finish.",
    author: "AIBrainBox"
},
{
    quote: "The secret of success is to do the common thing uncommonly well.",
    author: "John D. Rockefeller"
},
{
    quote: "You don't need to be extraordinary. You need to be relentless.",
    author: "AIBrainBox"
},
{
    quote: "Quality is not an act, it is a habit.",
    author: "Aristotle"
},
{
    quote: "Every excuse you repeat becomes a wall between you and the life you want.",
    author: "AIBrainBox"
},
{
    quote: "If you can dream it, you can do it.",
    author: "Walt Disney"
},
{
    quote: "Stop measuring your progress against someone else's timeline.",
    author: "AIBrainBox"
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
    quote: "The person you want to become is waiting on the other side of your discipline.",
    author: "AIBrainBox"
},
{
    quote: "Great things never come from comfort zones.",
    author: "Roy T. Bennett"
},
{
    quote: "If you keep doing what you've always done, you'll keep getting what you've always got.",
    author: "AIBrainBox"
},
{
    quote: "Don't be afraid to give up the good to go for the great.",
    author: "John D. Rockefeller"
},
{
    quote: "Your comfort today can become your regret tomorrow.",
    author: "AIBrainBox"
},
{
    quote: "The pain you feel today will be the strength you feel tomorrow.",
    author: "AIBrainBox"
},
{
    quote: "Success is not for the chosen few. It is built by the few who choose not to quit.",
    author: "AIBrainBox"
},
{
    quote: "When you feel like quitting, remember why you started.",
    author: "AIBrainBox"
},
{
    quote: "A goal without a plan is just a wish.",
    author: "Antoine de Saint-Exupéry"
},
{
    quote: "Your next chapter requires you to stop rereading the last one.",
    author: "AIBrainBox"
},
{
    quote: "You can either suffer the pain of discipline or the pain of regret.",
    author: "Jim Rohn"
},
{
    quote: "One day, your discipline will become the life you once prayed for.",
    author: "AIBrainBox"
},
{
    quote: "The best time to plant a tree was 20 years ago. The second best time is now.",
    author: "Chinese Proverb"
},
{
    quote: "You are not behind. You are being challenged to become stronger.",
    author: "AIBrainBox"
},
{
    quote: "If it matters to you, you will find a way. If not, you will find an excuse.",
    author: "AIBrainBox"
},
{
    quote: "Work in silence. Let your results make the noise.",
    author: "AIBrainBox"
},
{
    quote: "Your future self is watching what you do with today.",
    author: "AIBrainBox"
},
{
    quote: "The world rewards those who keep showing up after motivation disappears.",
    author: "AIBrainBox"
},
{
    quote: "You don't have to see the whole staircase. Just take the first step.",
    author: "Martin Luther King Jr."
},
{
    quote: "The life you want is hidden inside the work you keep avoiding.",
    author: "AIBrainBox"
},
{
    quote: "Keep going. Your breakthrough may be closer than your frustration suggests.",
    author: "AIBrainBox"
},
{
    quote: "You were not given this dream to spend your life doubting it.",
    author: "AIBrainBox"
},
{
    quote: "The strongest version of you is built on the days you wanted to quit but didn't.",
    author: "AIBrainBox"
},
{
    quote: "Start before you're ready. Become ready by starting.",
    author: "AIBrainBox"
},
{
    quote: "Your actions today are votes for the person you will become tomorrow.",
    author: "AIBrainBox"
},
{
    quote: "Don't wait for confidence. Act, and let confidence catch up.",
    author: "AIBrainBox"
},
{
    quote: "You have survived every difficult day that brought you here. Keep going.",
    author: "AIBrainBox"
},
{
    quote: "The difference between wishing and achieving is what you do next.",
    author: "AIBrainBox"
},
{
    quote: "Never, never, in nothing great or small, large or petty, never give in except to convictions of honour and good sense.",
    author: "Winston Churchill"
},
{
    quote: "Your time is limited, so don't waste it living someone else's life.",
    author: "Steve Jobs"
},
{
    quote: "Stay hungry. Stay foolish.",
    author: "Steve Jobs"
},
{
    quote: "You can't connect the dots looking forward; you can only connect them looking backwards.",
    author: "Steve Jobs"
},
{
    quote: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
},
{
    quote: "Don't settle.",
    author: "Steve Jobs"
},
{
    quote: "Have the courage to follow your heart and intuition.",
    author: "Steve Jobs"
},
{
    quote: "I have not failed. I've just found 10,000 ways that won't work.",
    author: "Thomas Edison"
},
{
    quote: "Opportunity is missed by most people because it is dressed in overalls and looks like work.",
    author: "Thomas Edison"
},
{
    quote: "Many of life's failures are people who did not realize how close they were to success when they gave up.",
    author: "Thomas Edison"
},
{
    quote: "The value of an idea lies in the using of it.",
    author: "Thomas Edison"
},
{
    quote: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt"
},
{
    quote: "Do one thing every day that scares you.",
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
    quote: "It always seems impossible until it's done.",
    author: "Nelson Mandela"
},
{
    quote: "Education is the most powerful weapon which you can use to change the world.",
    author: "Nelson Mandela"
},
{
    quote: "I learned that courage was not the absence of fear, but the triumph over it.",
    author: "Nelson Mandela"
},
{
    quote: "The brave man is not he who does not feel afraid, but he who conquers that fear.",
    author: "Nelson Mandela"
},
{
    quote: "It is not where you start but how high you aim that matters for success.",
    author: "Nelson Mandela"
},
{
    quote: "You may encounter many defeats, but you must not be defeated.",
    author: "Maya Angelou"
},
{
    quote: "Nothing will work unless you do.",
    author: "Maya Angelou"
},
{
    quote: "Try to be a rainbow in someone's cloud.",
    author: "Maya Angelou"
},
{
    quote: "My mission in life is not merely to survive, but to thrive.",
    author: "Maya Angelou"
},
{
    quote: "We may encounter many defeats but we must not be defeated.",
    author: "Maya Angelou"
},
{
    quote: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt"
},
{
    quote: "Do what you can, with what you have, where you are.",
    author: "Theodore Roosevelt"
},
{
    quote: "Far and away the best prize that life offers is the chance to work hard at work worth doing.",
    author: "Theodore Roosevelt"
},
{
    quote: "Nothing in the world is worth having or worth doing unless it means effort, pain, difficulty.",
    author: "Theodore Roosevelt"
},
{
    quote: "The credit belongs to the man who is actually in the arena.",
    author: "Theodore Roosevelt"
},
{
    quote: "In a moment of decision, the best thing you can do is the right thing.",
    author: "Theodore Roosevelt"
},
{
    quote: "Keep your eyes on the stars, and your feet on the ground.",
    author: "Theodore Roosevelt"
},
{
    quote: "The only limit to our realization of tomorrow is our doubts of today.",
    author: "Franklin D. Roosevelt"
},
{
    quote: "The only thing we have to fear is fear itself.",
    author: "Franklin D. Roosevelt"
},
{
    quote: "When you reach the end of your rope, tie a knot in it and hang on.",
    author: "Franklin D. Roosevelt"
},
{
    quote: "Men are not prisoners of fate, but only prisoners of their own minds.",
    author: "Franklin D. Roosevelt"
},
{
    quote: "The future lies with those wise political leaders who realize that the great public is interested more in government than in politics.",
    author: "Franklin D. Roosevelt"
},
{
    quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill"
},
{
    quote: "If you're going through hell, keep going.",
    author: "Winston Churchill"
},
{
    quote: "Kites rise highest against the wind, not with it.",
    author: "Winston Churchill"
},
{
    quote: "We shall never surrender.",
    author: "Winston Churchill"
},
{
    quote: "Attitude is a little thing that makes a big difference.",
    author: "Winston Churchill"
},
{
    quote: "You have enemies? Good. That means you've stood up for something, sometime in your life.",
    author: "Winston Churchill"
},
{
    quote: "Success consists of going from failure to failure without loss of enthusiasm.",
    author: "Winston Churchill"
},
{
    quote: "I never lose. I either win or learn.",
    author: "Nelson Mandela"
},
{
    quote: "The future depends on what you do today.",
    author: "Mahatma Gandhi"
},
{
    quote: "Strength does not come from physical capacity. It comes from an indomitable will.",
    author: "Mahatma Gandhi"
},
{
    quote: "You must be the change you wish to see in the world.",
    author: "Mahatma Gandhi"
},
{
    quote: "Live as if you were to die tomorrow. Learn as if you were to live forever.",
    author: "Mahatma Gandhi"
},
{
    quote: "In a gentle way, you can shake the world.",
    author: "Mahatma Gandhi"
},
{
    quote: "The weak can never forgive. Forgiveness is the attribute of the strong.",
    author: "Mahatma Gandhi"
},
{
    quote: "First they ignore you, then they laugh at you, then they fight you, then you win.",
    author: "Mahatma Gandhi"
},
{
    quote: "A winner is a dreamer who never gives up.",
    author: "Nelson Mandela"
},
{
    quote: "The greatest glory in living lies not in never falling, but in rising every time we fall.",
    author: "Nelson Mandela"
},
{
    quote: "I am the master of my fate, I am the captain of my soul.",
    author: "William Ernest Henley"
},
{
    quote: "It matters not how strait the gate, how charged with punishments the scroll.",
    author: "William Ernest Henley"
},
{
    quote: "What lies behind us and what lies before us are tiny matters compared to what lies within us.",
    author: "Ralph Waldo Emerson"
},
{
    quote: "The only person you are destined to become is the person you decide to be.",
    author: "Ralph Waldo Emerson"
},
{
    quote: "Once you make a decision, the universe conspires to make it happen.",
    author: "Ralph Waldo Emerson"
},
{
    quote: "Nothing great was ever achieved without enthusiasm.",
    author: "Ralph Waldo Emerson"
},
{
    quote: "Life consists in what a man is thinking of all day.",
    author: "Ralph Waldo Emerson"
},
{
    quote: "Our greatest glory is not in never failing, but in rising every time we fail.",
    author: "Confucius"
},
{
    quote: "It does not matter how slowly you go as long as you do not stop.",
    author: "Confucius"
},
{
    quote: "The man who asks a question is a fool for a minute, the man who does not ask is a fool for life.",
    author: "Confucius"
},
{
    quote: "Everything has beauty, but not everyone sees it.",
    author: "Confucius"
},
{
    quote: "He who learns but does not think, is lost. He who thinks but does not learn is in great danger.",
    author: "Confucius"
},
{
    quote: "The journey of a thousand miles begins with one step.",
    author: "Lao Tzu"
},
{
    quote: "Mastering others is strength. Mastering yourself is true power.",
    author: "Lao Tzu"
},
{
    quote: "When I let go of what I am, I become what I might be.",
    author: "Lao Tzu"
},
{
    quote: "Knowing others is intelligence; knowing yourself is true wisdom.",
    author: "Lao Tzu"
},
{
    quote: "A good traveler has no fixed plans and is not intent upon arriving.",
    author: "Lao Tzu"
},
{
    quote: "The greatest glory in living lies not in never falling, but in rising every time we fall.",
    author: "Nelson Mandela"
},
{
    quote: "You have power over your mind—not outside events. Realize this, and you will find strength.",
    author: "Marcus Aurelius"
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
    quote: "The happiness of your life depends upon the quality of your thoughts.",
    author: "Marcus Aurelius"
},
{
    quote: "It is not death that a man should fear, but he should fear never beginning to live.",
    author: "Marcus Aurelius"
},
{
    quote: "If it is not right, do not do it; if it is not true, do not say it.",
    author: "Marcus Aurelius"
},
{
    quote: "You have power over your mind, not outside events.",
    author: "Marcus Aurelius"
},
{
    quote: "He who fears he will suffer, already suffers because he fears.",
    author: "Michel de Montaigne"
},
{
    quote: "The greatest wealth is to live content with little.",
    author: "Plato"
},
{
    quote: "Courage is knowing what not to fear.",
    author: "Plato"
},
{
    quote: "The beginning is the most important part of the work.",
    author: "Plato"
},
{
    quote: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
    author: "Aristotle"
},
{
    quote: "Pleasure in the job puts perfection in the work.",
    author: "Aristotle"
},
{
    quote: "It is during our darkest moments that we must focus to see the light.",
    author: "Aristotle"
},
{
    quote: "Knowing yourself is the beginning of all wisdom.",
    author: "Aristotle"
},
{
    quote: "Quality is not an act, it is a habit.",
    author: "Aristotle"
},
{
    quote: "The secret of getting ahead is getting started.",
    author: "Mark Twain"
},
{
    quote: "Twenty years from now you will be more disappointed by the things you didn't do than by the ones you did.",
    author: "Mark Twain"
},
{
    quote: "Continuous improvement is better than delayed perfection.",
    author: "Mark Twain"
},
{
    quote: "Courage is resistance to fear, mastery of fear, not absence of fear.",
    author: "Mark Twain"
},
{
    quote: "The two most important days in your life are the day you are born and the day you find out why.",
    author: "Mark Twain"
},
{
    quote: "Don't go around saying the world owes you a living. The world owes you nothing. It was here first.",
    author: "Mark Twain"
},
{
    quote: "It's not the size of the dog in the fight, it's the size of the fight in the dog.",
    author: "Mark Twain"
},
{
    quote: "If you want to conquer fear, do not sit home and think about it. Go out and get busy.",
    author: "Dale Carnegie"
},
{
    quote: "Develop success from failures. Discouragement and failure are two of the surest stepping stones to success.",
    author: "Dale Carnegie"
},
{
    quote: "Act enthusiastic and you will be enthusiastic.",
    author: "Dale Carnegie"
},
{
    quote: "Today is life—the only life you are sure of. Make the most of today.",
    author: "Dale Carnegie"
},
{
    quote: "People rarely succeed unless they have fun in what they are doing.",
    author: "Dale Carnegie"
},
{
    quote: "Don't be afraid to give up the good to go for the great.",
    author: "John D. Rockefeller"
},
{
    quote: "The secret of success is to do the common thing uncommonly well.",
    author: "John D. Rockefeller"
},
{
    quote: "A friendship founded on business is better than a business founded on friendship.",
    author: "John D. Rockefeller"
},
{
    quote: "The way to make money is to buy when blood is running in the streets.",
    author: "John D. Rockefeller"
},
{
    quote: "The most important thing for a young man is to establish a credit—a reputation, character.",
    author: "John D. Rockefeller"
},
{
    quote: "If you want to be happy, set a goal that commands your thoughts, liberates your energy and inspires your hopes.",
    author: "Andrew Carnegie"
},
{
    quote: "Concentration is my motto—first honesty, then industry, then concentration.",
    author: "Andrew Carnegie"
},
{
    quote: "Teamwork is the ability to work together toward a common vision.",
    author: "Andrew Carnegie"
},
{
    quote: "No man will make a great leader who wants to do it all himself.",
    author: "Andrew Carnegie"
},
{
    quote: "As I grow older, I pay less attention to what men say. I just watch what they do.",
    author: "Andrew Carnegie"
},
{
    quote: "If you can't outplay them, outwork them.",
    author: "Ben Hogan"
},
{
    quote: "The more I practice, the luckier I get.",
    author: "Gary Player"
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
    quote: "The only way to prove that you're a good loser is to lose gracefully.",
    author: "Eric Hoffer"
},
{
    quote: "The difference between the impossible and the possible lies in a man's determination.",
    author: "Tommy Lasorda"
},
{
    quote: "You can't put a limit on anything. The more you dream, the farther you get.",
    author: "Michael Phelps"
},
{
    quote: "It's hard to beat a person who never gives up.",
    author: "Babe Ruth"
},
{
    quote: "Never let the fear of striking out keep you from playing the game.",
    author: "Babe Ruth"
},
{
    quote: "You have to expect things of yourself before you can do them.",
    author: "Michael Jordan"
},
{
    quote: "Champions keep playing until they get it right.",
    author: "Billie Jean King"
},
{
    quote: "Pressure is a privilege.",
    author: "Billie Jean King"
},
{
    quote: "A champion is afraid of losing. Everyone else is afraid of winning.",
    author: "Billie Jean King"
},
{
    quote: "You have to believe in yourself when no one else does.",
    author: "Serena Williams"
},
{
    quote: "Luck has nothing to do with it.",
    author: "Serena Williams"
},
{
    quote: "Every champion was once a contender who refused to give up.",
    author: "Rocky Balboa"
},
{
    quote: "The harder the conflict, the more glorious the triumph.",
    author: "Thomas Paine"
},
{
    quote: "Those who expect moments of change to be comfortable have not learned their history.",
    author: "Joan Wallach Scott"
},
{
    quote: "Nothing is impossible. The word itself says 'I'm possible!'",
    author: "Audrey Hepburn"
},
{
    quote: "The most difficult thing is the decision to act, the rest is merely tenacity.",
    author: "Amelia Earhart"
},
{
    quote: "Adventure is worthwhile in itself.",
    author: "Amelia Earhart"
},
{
    quote: "The woman who follows the crowd will usually go no further than the crowd.",
    author: "Albert Einstein"
},
{
    quote: "A person who never made a mistake never tried anything new.",
    author: "Albert Einstein"
},
{
    quote: "Imagination is more important than knowledge.",
    author: "Albert Einstein"
},
{
    quote: "Life is like riding a bicycle. To keep your balance, you must keep moving.",
    author: "Albert Einstein"
},
{
    quote: "Once you stop learning, you start dying.",
    author: "Albert Einstein"
},
{
    quote: "In the middle of difficulty lies opportunity.",
    author: "Albert Einstein"
},
{
    quote: "Only those who will risk going too far can possibly find out how far one can go.",
    author: "T. S. Eliot"
},
{
    quote: "Do not go where the path may lead, go instead where there is no path and leave a trail.",
    author: "Ralph Waldo Emerson"
},
{
    quote: "What you do speaks so loudly that I cannot hear what you say.",
    author: "Ralph Waldo Emerson"
},
{
    quote: "The reward of a thing well done is having done it.",
    author: "Ralph Waldo Emerson"
},
{
    quote: "Once you make a decision, the universe conspires to make it happen.",
    author: "Ralph Waldo Emerson"
},
{
    quote: "Do not wait; the time will never be 'just right.'",
    author: "Napoleon Hill"
},
{
    quote: "Whatever the mind of man can conceive and believe, it can achieve.",
    author: "Napoleon Hill"
},
{
    quote: "A goal is a dream with a deadline.",
    author: "Napoleon Hill"
},
{
    quote: "Strength and growth come only through continuous effort and struggle.",
    author: "Napoleon Hill"
},
{
    quote: "Action is the real measure of intelligence.",
    author: "Napoleon Hill"
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
    quote: "Success is nothing more than a few simple disciplines, practiced every day.",
    author: "Jim Rohn"
},
{
    quote: "Motivation is what gets you started. Habit is what keeps you going.",
    author: "Jim Rohn"
},
{
    quote: "We are what we repeatedly do.",
    author: "Aristotle"
},
{
    quote: "The future depends on what you do today.",
    author: "Mahatma Gandhi"
},
{
    quote: "Hardships often prepare ordinary people for an extraordinary destiny.",
    author: "C. S. Lewis"
},
{
    quote: "You are never too old to set another goal or to dream a new dream.",
    author: "C. S. Lewis"
},
{
    quote: "Courage, dear heart.",
    author: "C. S. Lewis"
},
{
    quote: "There are far, far better things ahead than any we leave behind.",
    author: "C. S. Lewis"
},
{
    quote: "Do not waste time knocking on a wall, hoping to transform it into a door.",
    author: "Coco Chanel"
},
{
    quote: "The most courageous act is still to think for yourself. Aloud.",
    author: "Coco Chanel"
},
{
    quote: "Success is most often achieved by those who don't know that failure is inevitable.",
    author: "Coco Chanel"
},
{
    quote: "I don't care what you think about me. I don't think about you at all.",
    author: "Coco Chanel"
},
{
    quote: "You can fail at what you don't want, so you might as well take a chance on doing what you love.",
    author: "Jim Carrey"
},
{
    quote: "Life opens up opportunities to you, and you either take them or you stay afraid of taking them.",
    author: "Jim Carrey"
},
{
    quote: "Fear is going to be a player in your life, but you decide how much.",
    author: "Jim Carrey"
},
{
    quote: "Your need for acceptance can make you invisible in this world.",
    author: "Jim Carrey"
},
{
    quote: "The only person you should try to be better than is the person you were yesterday.",
    author: "Matty Mullins"
},
{
    quote: "If you don't like the road you're walking, start paving another one.",
    author: "Dolly Parton"
},
{
    quote: "Storms make trees take deeper roots.",
    author: "Dolly Parton"
},
{
    quote: "Find out who you are and do it on purpose.",
    author: "Dolly Parton"
},
{
    quote: "If you don't have confidence, you'll always find a way not to win.",
    author: "Carl Lewis"
},
{
    quote: "You can't be afraid to fail. It's the only way you succeed.",
    author: "LeBron James"
},
{
    quote: "I like criticism. It makes you strong.",
    author: "LeBron James"
},
{
    quote: "You have to be able to accept failure to get better.",
    author: "LeBron James"
},
{
    quote: "I never dreamed about success. I worked for it.",
    author: "Estée Lauder"
},
{
    quote: "I didn't get there by wishing for it or hoping for it, but by working for it.",
    author: "Estée Lauder"
},
{
    quote: "The only place where success comes before work is in the dictionary.",
    author: "Vidal Sassoon"
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
    quote: "It isn't the mountains ahead to climb that wear you out; it's the pebble in your shoe.",
    author: "Muhammad Ali"
},
{
    quote: "Service to others is the rent you pay for your room here on earth.",
    author: "Muhammad Ali"
},
{
    quote: "Float like a butterfly, sting like a bee.",
    author: "Muhammad Ali"
},
{
    quote: "If you want to make your dreams come true, the first thing you have to do is wake up.",
    author: "J. M. Power"
},
{
    quote: "A person who won't read has no advantage over one who can't read.",
    author: "Mark Twain"
},
{
    quote: "It is never too late to be what you might have been.",
    author: "George Eliot"
},
{
    quote: "It's never too late to be what you might have been.",
    author: "George Eliot"
},
{
    quote: "The strongest principle of growth lies in human choice.",
    author: "George Eliot"
},
{
    quote: "Great things are not done by impulse, but by a series of small things brought together.",
    author: "Vincent van Gogh"
},
{
    quote: "What would life be if we had no courage to attempt anything?",
    author: "Vincent van Gogh"
},
{
    quote: "If you hear a voice within you say 'you cannot paint,' then by all means paint, and that voice will be silenced.",
    author: "Vincent van Gogh"
},
{
    quote: "I am seeking. I am striving. I am in it with all my heart.",
    author: "Vincent van Gogh"
},
{
    quote: "Act as if what you do makes a difference. It does.",
    author: "William James"
},
{
    quote: "Nothing is so fatiguing as the eternal hanging on of an uncompleted task.",
    author: "William James"
},
{
    quote: "The greatest use of life is to spend it for something that will outlast it.",
    author: "William James"
},
{
    quote: "Most people live, whether physically, intellectually or morally, in a very restricted circle of their potential being.",
    author: "William James"
},
{
    quote: "You gain strength, courage, and confidence by every experience in which you really stop to look fear in the face.",
    author: "Eleanor Roosevelt"
},
{
    quote: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt"
},
{
    quote: "No one can make you feel inferior without your consent.",
    author: "Eleanor Roosevelt"
},
{
    quote: "You must do the thing you think you cannot do.",
    author: "Eleanor Roosevelt"
},
{
    quote: "Great minds have purposes, others have wishes.",
    author: "Washington Irving"
},
{
    quote: "There is no substitute for hard work.",
    author: "Thomas Edison"
},
{
    quote: "If we did all the things we are capable of doing, we would literally astound ourselves.",
    author: "Thomas Edison"
},
{
    quote: "Hell, there are no rules here—we're trying to accomplish something.",
    author: "Thomas Edison"
},
{
    quote: "Genius is one percent inspiration and ninety-nine percent perspiration.",
    author: "Thomas Edison"
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
    quote: "Absorb what is useful, discard what is useless and add what is specifically your own.",
    author: "Bruce Lee"
},
{
    quote: "A goal is not always meant to be reached; it often serves simply as something to aim at.",
    author: "Bruce Lee"
},
{
    quote: "Mistakes are always forgivable, if one has the courage to admit them.",
    author: "Bruce Lee"
},
{
    quote: "Do not pray for an easy life, pray for the strength to endure a difficult one.",
    author: "Bruce Lee"
},
{
    quote: "Knowing is not enough; we must apply.",
    author: "Bruce Lee"
},
{
    quote: "What we achieve inwardly will change outer reality.",
    author: "Plutarch"
},
{
    quote: "The mind is not a vessel to be filled, but a fire to be kindled.",
    author: "Plutarch"
},
{
    quote: "The whole future lies in uncertainty: live immediately.",
    author: "Seneca"
},
{
    quote: "Luck is what happens when preparation meets opportunity.",
    author: "Seneca"
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
    quote: "He who is brave is free.",
    author: "Seneca"
},
{
    quote: "If one does not know to which port one is sailing, no wind is favorable.",
    author: "Seneca"
},
{
    quote: "Begin at once to live, and count each separate day as a separate life.",
    author: "Seneca"
},
{
    quote: "It is not because things are difficult that we do not dare; it is because we do not dare that they are difficult.",
    author: "Seneca"
},
{
    quote: "A man who suffers before it is necessary, suffers more than is necessary.",
    author: "Seneca"
},
{
    quote: "We are more often frightened than hurt; and we suffer more from imagination than from reality.",
    author: "Seneca"
},
{
    quote: "No man is more unhappy than he who never faces adversity.",
    author: "Seneca"
},
{
    quote: "The secret of happiness is freedom, the secret of freedom is courage.",
    author: "Thucydides"
},
{
    quote: "The bravest are surely those who have the clearest vision of what is before them.",
    author: "Thucydides"
},
{
    quote: "Hope is a waking dream.",
    author: "Aristotle"
},
{
    quote: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
    author: "Aristotle"
},
{
    quote: "Well begun is half done.",
    author: "Aristotle"
},
{
    quote: "Quality is not an act, it is a habit.",
    author: "Aristotle"
},
{
    quote: "Pleasure in the job puts perfection in the work.",
    author: "Aristotle"
},
{
    quote: "The roots of education are bitter, but the fruit is sweet.",
    author: "Aristotle"
},
{
    quote: "The energy of the mind is the essence of life.",
    author: "Aristotle"
},
{
    quote: "What we think, or what we know, or what we believe is, in the end, of little consequence. The only consequence is what we do.",
    author: "John Ruskin"
},
{
    quote: "Quality is never an accident; it is always the result of intelligent effort.",
    author: "John Ruskin"
},
{
    quote: "Endurance is nobler than strength, and patience than beauty.",
    author: "John Ruskin"
},
{
    quote: "There is no wealth but life.",
    author: "John Ruskin"
},
{
    quote: "Nothing great is ever achieved without much enduring.",
    author: "Catherine of Siena"
},
{
    quote: "Be who God meant you to be and you will set the world on fire.",
    author: "Catherine of Siena"
},
{
    quote: "Start by doing what's necessary; then do what's possible; and suddenly you are doing the impossible.",
    author: "Francis of Assisi"
},
{
    quote: "A journey is best measured in friends, rather than in miles.",
    author: "Tim Cahill"
},
{
    quote: "Do not fear failure but rather fear not trying.",
    author: "Roy T. Bennett"
},
{
    quote: "Don't be pushed around by the fears in your mind. Be led by the dreams in your heart.",
    author: "Roy T. Bennett"
},
{
    quote: "It's your life; you don't need someone's permission to live the life you want.",
    author: "Roy T. Bennett"
},
{
    quote: "Believe in yourself. You are braver than you think, more talented than you know, and capable of more than you imagine.",
    author: "Roy T. Bennett"
},
{
    quote: "The only person you are destined to become is the person you decide to be.",
    author: "Ralph Waldo Emerson"
},
{
    quote: "The purpose of life is to live it, to taste experience to the utmost.",
    author: "Eleanor Roosevelt"
},
{
    quote: "It is your reaction to adversity, not the adversity itself, that determines how your life's story will develop.",
    author: "Dieter F. Uchtdorf"
},
{
    quote: "The future belongs to those who prepare for it today.",
    author: "Malcolm X"
},
{
    quote: "If you have no confidence in self, you are twice defeated in the race of life.",
    author: "Marcus Garvey"
},
{
    quote: "The only way to achieve the impossible is to believe it is possible.",
    author: "Charles Kingsleigh"
},
{
    quote: "Everything you've ever wanted is on the other side of fear.",
    author: "George Addair"
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
    quote: "It's what you learn after you know it all that counts.",
    author: "John Wooden"
},
{
    quote: "Don't measure yourself by what you have accomplished, but rather by what you should have accomplished with your ability.",
    author: "John Wooden"
},
{
    quote: "Things work out best for those who make the best of how things work out.",
    author: "John Wooden"
},
{
    quote: "Success comes from knowing that you did your best to become the best that you are capable of becoming.",
    author: "John Wooden"
},
{
    quote: "Do not let making a living prevent you from making a life.",
    author: "John Wooden"
},
{
    quote: "If you don't have time to do it right, when will you have time to do it over?",
    author: "John Wooden"
},
{
    quote: "Ability may get you to the top, but it takes character to keep you there.",
    author: "John Wooden"
},
{
    quote: "The main ingredient of stardom is the rest of the team.",
    author: "John Wooden"
},
{
    quote: "Success is peace of mind attained only through self-satisfaction in knowing you made the effort to become the best of which you are capable.",
    author: "John Wooden"
},
{
    quote: "Do not let what you cannot do interfere with what you can do.",
    author: "John Wooden"
},
{
    quote: "Failure is simply the opportunity to begin again, this time more intelligently.",
    author: "Henry Ford"
},
{
    quote: "Whether you think you can, or you think you can't—you're right.",
    author: "Henry Ford"
},
{
    quote: "Coming together is a beginning; keeping together is progress; working together is success.",
    author: "Henry Ford"
},
{
    quote: "Obstacles are those frightful things you see when you take your eyes off your goal.",
    author: "Henry Ford"
},
{
    quote: "If everyone is moving forward together, then success takes care of itself.",
    author: "Henry Ford"
},
{
    quote: "Nothing is particularly hard if you divide it into small jobs.",
    author: "Henry Ford"
},
{
    quote: "You can't build a reputation on what you are going to do.",
    author: "Henry Ford"
},
{
    quote: "Thinking is the hardest work there is, which is probably the reason so few engage in it.",
    author: "Henry Ford"
},
{
    quote: "Failure is the condiment that gives success its flavor.",
    author: "Truman Capote"
},
{
    quote: "The man who has confidence in himself gains the confidence of others.",
    author: "Hasidic Proverb"
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
    quote: "It's kind of fun to do the impossible.",
    author: "Walt Disney"
},
{
    quote: "If you can dream it, you can do it.",
    author: "Walt Disney"
},
{
    quote: "The difference between winning and losing is most often not quitting.",
    author: "Walt Disney"
},
{
    quote: "Laughter is timeless, imagination has no age, and dreams are forever.",
    author: "Walt Disney"
},
{
    quote: "I have learned that success is to be measured not so much by the position that one has reached in life as by the obstacles which he has overcome.",
    author: "Booker T. Washington"
},
{
    quote: "Success is to be measured not so much by the position that one has reached as by the obstacles which he has overcome.",
    author: "Booker T. Washington"
},
{
    quote: "Character, not circumstances, makes the man.",
    author: "Booker T. Washington"
},
{
    quote: "If you want to lift yourself up, lift up someone else.",
    author: "Booker T. Washington"
},
{
    quote: "Excellence is to do a common thing in an uncommon way.",
    author: "Booker T. Washington"
},
{
    quote: "Associate yourself with people of good quality, for it is better to be alone than in bad company.",
    author: "Booker T. Washington"
},
{
    quote: "I have learned over the years that when one's mind is made up, this diminishes fear.",
    author: "Rosa Parks"
},
{
    quote: "I would like to be remembered as a person who wanted to be free and other people would be also free.",
    author: "Rosa Parks"
},
{
    quote: "The only tired I was, was tired of giving in.",
    author: "Rosa Parks"
},
{
    quote: "Each person must live their life as a model for others.",
    author: "Rosa Parks"
},
{
    quote: "You must never be fearful about what you are doing when it is right.",
    author: "Rosa Parks"
},
{
    quote: "We must learn to live together as brothers or perish together as fools.",
    author: "Martin Luther King Jr."
},
{
    quote: "Faith is taking the first step even when you don't see the whole staircase.",
    author: "Martin Luther King Jr."
},
{
    quote: "Our lives begin to end the day we become silent about things that matter.",
    author: "Martin Luther King Jr."
},
{
    quote: "The time is always right to do what is right.",
    author: "Martin Luther King Jr."
},
{
    quote: "If you can't fly then run, if you can't run then walk, if you can't walk then crawl, but whatever you do you have to keep moving forward.",
    author: "Martin Luther King Jr."
},
{
    quote: "We must accept finite disappointment, but never lose infinite hope.",
    author: "Martin Luther King Jr."
},
{
    quote: "Darkness cannot drive out darkness; only light can do that.",
    author: "Martin Luther King Jr."
},
{
    quote: "Nothing worthwhile comes easily. Work, continuous work and hard work, is the only way to accomplish results that last.",
    author: "Hamilton Holt"
},
{
    quote: "The will to win, the desire to succeed, the urge to reach your full potential... these are the keys that will unlock the door to personal excellence.",
    author: "Confucius"
},
{
    quote: "Our greatest glory is not in never falling, but in rising every time we fall.",
    author: "Confucius"
},
{
    quote: "He who asks a question is a fool for five minutes; he who does not ask a question remains a fool forever.",
    author: "Confucius"
},
{
    quote: "When it is obvious that the goals cannot be reached, don't adjust the goals, adjust the action steps.",
    author: "Confucius"
},
{
    quote: "The man who moves a mountain begins by carrying away small stones.",
    author: "Confucius"
},
{
    quote: "Everything has beauty, but not everyone sees it.",
    author: "Confucius"
},
{
    quote: "A superior man is modest in his speech, but exceeds in his actions.",
    author: "Confucius"
},
{
    quote: "The best way to predict the future is to create it.",
    author: "Peter Drucker"
},
{
    quote: "There is nothing so useless as doing efficiently that which should not be done at all.",
    author: "Peter Drucker"
},
{
    quote: "Follow effective action with quiet reflection. From the quiet reflection will come even more effective action.",
    author: "Peter Drucker"
},
{
    quote: "Knowledge has to be improved, challenged, and increased constantly, or it vanishes.",
    author: "Peter Drucker"
},
{
    quote: "The greatest danger in times of turbulence is not the turbulence; it is to act with yesterday's logic.",
    author: "Peter Drucker"
},
{
    quote: "Unless commitment is made, there are only promises and hopes; but no plans.",
    author: "Peter Drucker"
},
{
    quote: "Efficiency is doing things right; effectiveness is doing the right things.",
    author: "Peter Drucker"
},
{
    quote: "The future is created by what you do today, not tomorrow.",
    author: "Robert Kiyosaki"
},
{
    quote: "Don't let the fear of losing be greater than the excitement of winning.",
    author: "Robert Kiyosaki"
},
{
    quote: "Your future is created by what you do today, not tomorrow.",
    author: "Robert Kiyosaki"
},
{
    quote: "The richest people in the world look for and build networks; everyone else looks for work.",
    author: "Robert Kiyosaki"
},
{
    quote: "Winners are not afraid of losing. But losers are.",
    author: "Robert Kiyosaki"
},
{
    quote: "The size of your success is measured by the strength of your desire.",
    author: "Robert Kiyosaki"
},
{
    quote: "Success is not about how much money you make; it's about the difference you make in people's lives.",
    author: "Michelle Obama"
},
{
    quote: "There is no magic to achievement. It's really about hard work, choices, and persistence.",
    author: "Michelle Obama"
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

    document
        .getElementById("previous-question-btn")
        .addEventListener(
            "click",
            goToPreviousQuestion
        );

    document
        .getElementById("next-question-btn")
        .addEventListener(
            "click",
            goToNextQuestion
        );

    window.addEventListener(
        "popstate",
        loadQuestion
    );

    document.addEventListener(
        "keydown",
        handleKeyboardNavigation
    );

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

        loading.classList.remove("hidden");
        errorBox.classList.add("hidden");

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

        loading.classList.add("hidden");

        loadQuestion();

    } catch (error) {

        console.error(
            "Question database error:",
            error
        );

        loading.classList.add("hidden");

        errorBox.classList.remove("hidden");

        errorBox.innerText =
            "Unable to load the question database.\n\n" +
            "Error: " +
            error.message +
            "\n\n" +
            "Please make sure xi-questions.csv exists in the same folder as index.html.";
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


/* ============================================================
   NORMALIZE CSV HEADER
   ============================================================ */

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

    /*
     * If there is no usable ID,
     * fall back to the first question.
     */

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

        radio.id =
            "option-" + letter;

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

    /*
     * Remove old score if the user
     * changes an already answered question.
     */

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
}


/* ============================================================
   CLEAR OPTION STATES
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
   CREATE EXPLANATION BUTTON
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


/* ============================================================
   SHOW / HIDE EXPLANATION
   ============================================================ */

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

    if (savedAnswer === correctAnswer) {

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


/* ============================================================
   HIGHLIGHT CORRECT ANSWER
   ============================================================ */

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

    previousButton.disabled =
        currentQuestionIndex <= 0;

    nextButton.disabled =
        currentQuestionIndex >=
        questions.length - 1;

    position.innerText =
        "Question " +
        (currentQuestionIndex + 1) +
        " of " +
        questions.length;
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
   PREVIOUS QUESTION
   ============================================================ */

function goToPreviousQuestion() {

    if (
        currentQuestionIndex <= 0
    ) {
        return;
    }

    const question =
        questions[
            currentQuestionIndex - 1
        ];

    navigateToQuestion(
        question
    );
}


/* ============================================================
   NEXT QUESTION
   ============================================================ */

function goToNextQuestion() {

    if (
        currentQuestionIndex >=
        questions.length - 1
    ) {
        return;
    }

    const question =
        questions[
            currentQuestionIndex + 1
        ];

    navigateToQuestion(
        question
    );
}


/* ============================================================
   NAVIGATE TO QUESTION
   ============================================================ */

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

    /*
     * Use a different quote on every question.
     * This avoids depending on an external API.
     */

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
   QUESTION ID
   ============================================================ */

function getQuestionId() {

    return String(
        currentQuestion.id
    );
}


/* ============================================================
   CORRECT ANSWER
   ============================================================ */

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
   CORRECT ANSWER CELEBRATION
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


/* ============================================================
   WRONG ANSWER REACTION
   ============================================================ */

function showWrongReaction() {

    createEmojiBurst([
        "😢",
        "😞",
        "🥺",
        "💔",
        "😔"
    ]);
}


/* ============================================================
   EMOJI BURST
   ============================================================ */

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
   ERROR
   ============================================================ */

function showError(
    message
) {

    document
        .getElementById(
            "loading"
        )
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
