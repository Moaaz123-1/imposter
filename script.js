
"use strict";

/* =========================================
   SPY // GAME
   Setup, roles, timer, voting, guessing,
   results and cumulative scoreboard
========================================= */


/* =========================================
   1. HOME SCREEN / PLAYER SETUP
========================================= */

const playerButtons = document.querySelectorAll(".players-box button");
const playerNamesBox = document.getElementById("playerNames");
const playerCountDisplay = document.getElementById("playersCount");
const imposterCountDisplay = document.getElementById("impostersCount");
const spyCountDisplay = document.getElementById("spyCountDisplay");

let selectedPlayers = 0;
let selectedImposters = 1;
let selectedCategory = "food";
let selectedSpyMode = "classic";


playerButtons.forEach(button => {
    button.addEventListener("click", () => {
        playerButtons.forEach(btn => btn.classList.remove("selected"));
        button.classList.add("selected");

        selectedPlayers = Number(button.textContent.trim());

        if (playerCountDisplay) {
            playerCountDisplay.textContent = selectedPlayers;
        }

        createPlayerNameInputs();
        updateImposterCount();
    });
});


function createPlayerNameInputs() {
    if (!playerNamesBox) return;

    const previousNames = [
        ...playerNamesBox.querySelectorAll(".player-name-input")
    ].map(input => input.value);

    let savedNames = [];

    try {
        savedNames = JSON.parse(
            localStorage.getItem("playerNames") || "[]"
        );
    } catch {
        savedNames = [];
    }

    playerNamesBox.innerHTML = "";

    for (let i = 0; i < selectedPlayers; i++) {
        const input = document.createElement("input");

        input.type = "text";
        input.className = "player-name-input";
        input.placeholder = `Enter name of Player ${i + 1}`;
        input.maxLength = 20;
        input.autocomplete = "off";
        input.value = previousNames[i] || savedNames[i] || "";

        playerNamesBox.appendChild(input);
    }
}


/* =========================================
   2. IMPOSTER COUNT
========================================= */

function updateImposterCount() {
    const maxImposters = selectedPlayers >= 3
        ? selectedPlayers - 2
        : 1;

    selectedImposters = Math.max(
        1,
        Math.min(selectedImposters, maxImposters)
    );

    if (spyCountDisplay) {
        spyCountDisplay.textContent = selectedImposters;
    }

    if (imposterCountDisplay) {
        imposterCountDisplay.textContent = selectedImposters;
    }
}


const spyMinusButton = document.getElementById("spyMinus");
const spyPlusButton = document.getElementById("spyPlus");

if (spyMinusButton) {
    spyMinusButton.addEventListener("click", () => {
        selectedImposters = Math.max(1, selectedImposters - 1);
        updateImposterCount();
    });
}

if (spyPlusButton) {
    spyPlusButton.addEventListener("click", () => {
        const maxImposters = selectedPlayers >= 3
            ? selectedPlayers - 2
            : 1;

        if (selectedImposters < maxImposters) {
            selectedImposters++;
        }

        updateImposterCount();
    });
}


/* =========================================
   3. CATEGORY AND MODE SELECTION
========================================= */

function setupChoiceButtons(containerId, buttonClass, callback) {
    const container = document.getElementById(containerId);

    if (!container) return;

    container.querySelectorAll("." + buttonClass).forEach(button => {
        button.addEventListener("click", () => {
            container.querySelectorAll("." + buttonClass)
                .forEach(item => item.classList.remove("selected"));

            button.classList.add("selected");
            callback(button);
        });
    });
}


setupChoiceButtons("categoryGrid", "category-option", button => {
    selectedCategory = button.dataset.category;
});


setupChoiceButtons("modeGrid", "mode-option", button => {
    selectedSpyMode = button.dataset.mode;
});


/* =========================================
   4. START GAME
========================================= */

function startGame() {
    if (!selectedPlayers || selectedPlayers < 3) {
        alert("Choose at least 3 players first!");
        return;
    }

    const nameInputs = [
        ...document.querySelectorAll(".player-name-input")
    ];

    const names = nameInputs.map(input => input.value.trim());

    if (names.length !== selectedPlayers) {
        alert("Please select the number of players again!");
        return;
    }

    if (names.some(name => !name)) {
        alert("Please enter a name for every player!");
        return;
    }

    const normalizedNames = names.map(name =>
        name.toLocaleLowerCase()
    );

    if (new Set(normalizedNames).size !== names.length) {
        alert("Each player must have a different name!");
        return;
    }

    if (
        selectedImposters < 1 ||
        selectedImposters > selectedPlayers - 2
    ) {
        alert("Choose a valid number of imposters!");
        return;
    }

    localStorage.setItem("players", String(selectedPlayers));
    localStorage.setItem("playerNames", JSON.stringify(names));
    localStorage.setItem("imposterCount", String(selectedImposters));
    localStorage.setItem("spyCategory", selectedCategory);
    localStorage.setItem("spyMode", selectedSpyMode);

    // Keep cumulative scores for the next round.
    window.location.href = "game.html?newRound=" + Date.now();
}


function startGameWithSettings() {
    startGame();
}


/* =========================================
   5. GAME CATEGORIES
========================================= */

const gameCategories = {
    locations: [
        "المطار", "البنك", "المستشفى", "المدرسة",
        "الفندق", "المطعم", "المول", "السينما",
        "الاستاد", "الشاطئ", "المتحف", "المكتبة",
        "الحديقة", "الجامعة", "محطة القطار",
        "المخبز", "المسرح", "حديقة الحيوان",
        "السوبر ماركت", "مدينة الملاهي"
    ],

    foods: [
        "بيتزا", "برجر", "كشري", "ملوخية",
        "كفتة", "شاورما", "فتة", "محشي",
        "مكرونة", "سمك", "فول", "طعمية",
        "بطاطس", "أرز", "سوشي", "تاكو",
        "نودلز", "آيس كريم", "كيك", "كريب",
        "فطير", "كنافة", "بسبوسة", "فشار",
        "محشي ورق عنب", "شوكولاتة", "دونات"
    ],

    cartoons: [
        "سبونج بوب", "توم وجيري", "ميكي ماوس",
        "بطوط", "بن تن", "سبايدرمان", "باتمان",
        "سلاحف النينجا", "دورا", "كونان",
        "ناروتو", "ون بيس", "شريك",
        "سيمبا", "السنافر", "غامبول",
        "فروزن", "الأسد الملك"
    ],

    animals: [
        "أسد", "نمر", "فيل", "زرافة",
        "قرد", "حصان", "كلب", "قطة",
        "أرنب", "دب", "ذئب", "ثعلب",
        "دولفين", "حوت", "بطريق", "تمساح",
        "سلحفاة", "كنغر", "باندا", "بومة"
    ],

    football: [
        "محمد صلاح", "ليونيل ميسي",
        "كريستيانو رونالدو", "كيليان مبابي",
        "نيمار", "رياض محرز", "عمر مرموش",
        "إمام عاشور", "محمد الشناوي",
        "مانشستر سيتي", "ريال مدريد",
        "برشلونة", "الأهلي", "الزمالك",
        "ليفربول", "بايرن ميونخ",
        "أرسنال", "باريس سان جيرمان"
    ],

    movies: [
        "فول الصين العظيم", "عسل أسود",
        "الناظر", "الفيل الأزرق", "كده رضا",
        "تيتو", "إكس لارج", "اللمبي",
        "الباشا تلميذ", "الجزيرة", "ولاد رزق",
        "The Lion King", "Frozen", "Toy Story",
        "Finding Nemo", "Harry Potter", "Spider-Man"
    ],

    actors: [
        "أحمد حلمي", "محمد هنيدي", "عادل إمام",
        "كريم عبد العزيز", "أحمد عز", "منى زكي",
        "هند صبري", "ياسمين عبد العزيز",
        "تامر حسني", "عمرو يوسف", "آسر ياسين",
        "خالد النبوي", "أحمد السقا", "مي عز الدين"
    ]
};


const categoryMap = {
    food: "foods",
    foods: "foods",
    cartoon: "cartoons",
    cartoons: "cartoons",
    animals: "animals",
    football: "football",
    movies: "movies",
    locations: "locations",
    actors: "actors"
};


/* =========================================
   6. RELATED WORDS - MISLEADING MODE
========================================= */

const relatedWords = {
    foods: [
        ["بيتزا", "فطير"],
        ["برجر", "ساندويتش"],
        ["كشري", "مكرونة"],
        ["ملوخية", "سبانخ"],
        ["كفتة", "كباب"],
        ["شاورما", "طاووق"],
        ["فتة", "محشي"],
        ["سمك", "جمبري"],
        ["فول", "طعمية"],
        ["بطاطس", "بطاطا"],
        ["سوشي", "سمك"],
        ["آيس كريم", "ميلك شيك"],
        ["كيك", "دونات"],
        ["كنافة", "بسبوسة"],
        ["فشار", "شيبسي"],
        ["شوكولاتة", "حلوى"]
    ],

    cartoons: [
        ["سبونج بوب", "باتريك"],
        ["توم وجيري", "ميكي ماوس"],
        ["بن تن", "سبايدرمان"],
        ["باتمان", "سوبرمان"],
        ["ناروتو", "ساسكي"],
        ["ون بيس", "ناروتو"],
        ["بطوط", "ميكي ماوس"],
        ["سيمبا", "موفاسا"],
        ["غامبول", "داروين"],
        ["شريك", "فيونا"],
        ["دورا", "دييغو"]
    ],

    animals: [
        ["أسد", "نمر"],
        ["فيل", "وحيد القرن"],
        ["زرافة", "حمار وحشي"],
        ["قرد", "غوريلا"],
        ["كلب", "ذئب"],
        ["قطة", "نمر"],
        ["أرنب", "سنجاب"],
        ["دولفين", "حوت"],
        ["تمساح", "سحلية"],
        ["باندا", "دب"]
    ],

    football: [
        ["محمد صلاح", "عمر مرموش"],
        ["ليونيل ميسي", "كريستيانو رونالدو"],
        ["نيمار", "مبابي"],
        ["الأهلي", "الزمالك"],
        ["ريال مدريد", "برشلونة"],
        ["مانشستر سيتي", "ليفربول"],
        ["أرسنال", "تشيلسي"],
        ["محمد الشناوي", "محمد صلاح"]
    ],

    movies: [
        ["الناظر", "عسل أسود"],
        ["الفيل الأزرق", "الجزيرة"],
        ["ولاد رزق", "تيتو"],
        ["Frozen", "The Lion King"],
        ["Toy Story", "Finding Nemo"],
        ["Harry Potter", "Spider-Man"]
    ],

    locations: [
        ["المطار", "محطة القطار"],
        ["المستشفى", "العيادة"],
        ["المدرسة", "الجامعة"],
        ["المطعم", "المقهى"],
        ["المول", "السوبر ماركت"],
        ["الشاطئ", "حمام السباحة"],
        ["المتحف", "المكتبة"],
        ["الفندق", "المنتجع"]
    ],

    actors: [
        ["أحمد حلمي", "محمد هنيدي"],
        ["عادل إمام", "أحمد السقا"],
        ["أحمد عز", "كريم عبد العزيز"],
        ["منى زكي", "هند صبري"],
        ["تامر حسني", "عمرو دياب"]
    ]
};


/* =========================================
   7. RANDOM HELPERS
========================================= */

function pickRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
}


function shuffleArray(array) {
    const shuffled = [...array];

    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [shuffled[i], shuffled[j]] = [
            shuffled[j],
            shuffled[i]
        ];
    }

    return shuffled;
}


function getCategoryKey() {
    const savedCategory =
        localStorage.getItem("spyCategory") || "food";

    if (savedCategory === "random") {
        return pickRandom(Object.keys(gameCategories));
    }

    const mappedCategory = categoryMap[savedCategory];

    if (mappedCategory && gameCategories[mappedCategory]) {
        return mappedCategory;
    }

    return "foods";
}


function getRelatedWord(categoryKey, secretWord) {
    const pairs = relatedWords[categoryKey] || [];

    const matchingPair = pairs.find(pair =>
        pair.includes(secretWord)
    );

    if (matchingPair) {
        return matchingPair.find(word => word !== secretWord);
    }

    const alternatives = (gameCategories[categoryKey] || [])
        .filter(word => word !== secretWord);

    return alternatives.length
        ? pickRandom(alternatives)
        : secretWord;
}


/* =========================================
   8. GAME SCREEN
========================================= */

const card = document.getElementById("card");

if (card) {
    // Read the exact player count selected on the setup screen.
    const storedPlayers = Number(localStorage.getItem("players"));
    const players = Number.isInteger(storedPlayers) && storedPlayers >= 3
        ? storedPlayers
        : 3;

    let playerNames = [];

    try {
        playerNames = JSON.parse(
            localStorage.getItem("playerNames") || "[]"
        );
    } catch {
        playerNames = [];
    }

    playerNames = playerNames.slice(0, players);

    while (playerNames.length < players) {
        playerNames.push(`PLAYER ${playerNames.length + 1}`);
    }

    // Load cumulative scores and display names.
    let playerScores = {};
    let playerScoreNames = {};

    try {
        playerScores = JSON.parse(
            localStorage.getItem("spyGameScores") || "{}"
        );

        playerScoreNames = JSON.parse(
            localStorage.getItem("spyGamePlayerNames") || "{}"
        );
    } catch {
        playerScores = {};
        playerScoreNames = {};
    }

    function getPlayerKey(name) {
        return String(name).trim().toLocaleLowerCase();
    }

    function addPoints(playerName, points) {
        const key = getPlayerKey(playerName);

        playerScores[key] = (Number(playerScores[key]) || 0) + points;
        playerScoreNames[key] = String(playerName).trim();

        localStorage.setItem(
            "spyGameScores",
            JSON.stringify(playerScores)
        );

        localStorage.setItem(
            "spyGamePlayerNames",
            JSON.stringify(playerScoreNames)
        );
    }

    const savedImposterCount =
        Number(localStorage.getItem("imposterCount")) || 1;

    const imposterCount = Math.max(
        1,
        Math.min(savedImposterCount, players - 2)
    );

    const spyMode = localStorage.getItem("spyMode") || "classic";
    const categoryKey = getCategoryKey();
    const secretWord = pickRandom(gameCategories[categoryKey]);
    const misleadingWord = getRelatedWord(categoryKey, secretWord);

    const playerIndexes = Array.from(
        { length: players },
        (_, index) => index
    );

    const spies = shuffleArray(playerIndexes).slice(0, imposterCount);

    const hiddenSide = document.getElementById("hiddenSide");
    const roleSide = document.getElementById("roleSide");
    const roleText = document.getElementById("role");
    const locationText = document.getElementById("location");

    const playerNumber = document.getElementById("playerNumber");
    const nextBtn = document.getElementById("nextBtn");
    const voteBtn = document.getElementById("voteBtn");

    const voteScreen = document.getElementById("voteScreen");
    const playersVote = document.getElementById("playersVote");
    const voterNumber = document.getElementById("voterNumber");
    const homeBtn = document.getElementById("homeBtn");
    const timer = document.getElementById("timer");

    let currentPlayer = 0;
    let currentVoter = 0;

    const votes = Array(players).fill(0);
    const hasVoted = Array(players).fill(false);

    let cardOpened = false;
    let votingStarted = false;
    let gameFinished = false;

    let timeLeft = 4 * 60;
    let gameTimer = null;


    /* ---------- TIMER ---------- */

    function updateTimerDisplay() {
        if (!timer) return;

        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;

        timer.textContent =
            `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }


    function startTimer() {
        if (gameTimer || !timer || gameFinished) return;

        updateTimerDisplay();

        gameTimer = setInterval(() => {
            if (gameFinished || votingStarted) {
                clearInterval(gameTimer);
                gameTimer = null;
                return;
            }

            timeLeft--;
            updateTimerDisplay();

            if (timeLeft <= 0) {
                timeLeft = 0;
                updateTimerDisplay();

                clearInterval(gameTimer);
                gameTimer = null;

                startVoting();
            }
        }, 1000);
    }


    /* ---------- PRIVATE PLAYER CARDS ---------- */

    function showCurrentPlayer() {
        // Never show a card for an index outside the selected player count.
        if (currentPlayer >= players) {
            card.style.display = "none";
            if (nextBtn) nextBtn.style.display = "none";
            if (playerNumber) playerNumber.textContent = "DISCUSSION TIME";
            if (voteBtn) voteBtn.style.display = "inline-block";
            startTimer();
            return;
        }

        cardOpened = false;

        if (playerNumber) {
            playerNumber.textContent =
                `PLAYER ${currentPlayer + 1}: ${playerNames[currentPlayer]}`;
        }

        if (hiddenSide) hiddenSide.style.display = "block";
        if (roleSide) roleSide.style.display = "none";
        if (nextBtn) nextBtn.style.display = "none";

        card.style.display = "block";
        card.classList.remove("reveal");
    }


    function revealCurrentRole() {
        if (
            cardOpened ||
            votingStarted ||
            gameFinished ||
            currentPlayer >= players
        ) return;

        cardOpened = true;

        card.classList.remove("reveal");
        void card.offsetWidth;
        card.classList.add("reveal");

        if (hiddenSide) hiddenSide.style.display = "none";
        if (roleSide) roleSide.style.display = "block";

        const isSpy = spies.includes(currentPlayer);

        if (isSpy) {
            if (spyMode === "misleading") {
                if (roleText) roleText.textContent = "معلومتك السرية";
                if (locationText) locationText.textContent = misleadingWord;
            } else {
                if (roleText) roleText.textContent = "أنت الإمبوستر 🕵️";
                if (locationText) {
                    locationText.textContent = "حاول اكتشاف الكلمة السرية!";
                }
            }
        } else {
            if (roleText) {
                roleText.textContent = spyMode === "misleading"
                    ? "معلومتك السرية"
                    : "الكلمة السرية";
            }

            if (locationText) locationText.textContent = secretWord;
        }

        if (nextBtn) nextBtn.style.display = "block";
    }


    card.addEventListener("click", event => {
        if (event.target.closest("#nextBtn")) return;
        revealCurrentRole();
    });


    /* ---------- NEXT PLAYER ---------- */

    if (nextBtn) {
        nextBtn.addEventListener("click", event => {
            event.stopPropagation();

            if (!cardOpened || votingStarted || gameFinished) return;

            // Protect against accidental extra clicks.
            nextBtn.disabled = true;
            currentPlayer++;

            if (currentPlayer >= players) {
                card.style.display = "none";
                nextBtn.style.display = "none";

                if (playerNumber) {
                    playerNumber.textContent = "DISCUSSION TIME";
                }

                if (voteBtn) voteBtn.style.display = "inline-block";

                startTimer();
                return;
            }

            showCurrentPlayer();
            nextBtn.disabled = false;
        });
    }


    /* =========================================
       9. VOTING
    ========================================= */

    function startVoting() {
        if (votingStarted || gameFinished) return;

        votingStarted = true;

        if (gameTimer) {
            clearInterval(gameTimer);
            gameTimer = null;
        }

        card.style.display = "none";

        if (nextBtn) nextBtn.style.display = "none";
        if (voteBtn) voteBtn.style.display = "none";
        if (voteScreen) voteScreen.style.display = "block";

        currentVoter = 0;
        showVotingScreen();
    }


    if (voteBtn) {
        voteBtn.addEventListener("click", startVoting);
    }


    function showVotingScreen() {
        if (!playersVote || gameFinished) return;

        playersVote.innerHTML = "";

        if (currentVoter >= players) {
            showResult();
            return;
        }

        if (voterNumber) {
            voterNumber.textContent =
                `${playerNames[currentVoter]}، اختار مين الإمبوستر؟`;
        }

        for (let i = 0; i < players; i++) {
            const button = document.createElement("button");

            button.type = "button";
            button.className = "vote-player";
            button.textContent = playerNames[i];

            // A player cannot vote for themselves.
            if (i === currentVoter) {
                button.disabled = true;
                button.textContent += " (YOU)";
            }

            button.addEventListener("click", () => {
                if (gameFinished || hasVoted[currentVoter]) return;

                votes[i]++;

                // Correct vote by a non-imposter = 100 points.
                if (
                    !spies.includes(currentVoter) &&
                    spies.includes(i)
                ) {
                    addPoints(playerNames[currentVoter], 100);
                }

                hasVoted[currentVoter] = true;
                currentVoter++;

                showVotingScreen();
            });

            playersVote.appendChild(button);
        }
    }


    /* =========================================
       10. RESULTS AND IMPOSTER GUESSES
    ========================================= */

function showResult() {
    if (gameFinished) return;

    if (gameTimer) {
        clearInterval(gameTimer);
        gameTimer = null;
    }

    if (playersVote) playersVote.innerHTML = "";
    if (voterNumber) voterNumber.textContent = "";

    const voteHeading = voteScreen
        ? voteScreen.querySelector("h2")
        : null;

    const highestVotes = Math.max(...votes);

    const mostVoted = votes
        .map((count, index) => ({ count, index }))
        .filter(item => item.count === highestVotes)
        .map(item => item.index);

    let resultMessage = "The vote ended in a tie!";

    if (highestVotes > 0 && mostVoted.length === 1) {
        const eliminatedPlayer = mostVoted[0];

        resultMessage = spies.includes(eliminatedPlayer)
            ? `${playerNames[eliminatedPlayer]} was an imposter!`
            : `${playerNames[eliminatedPlayer]} was NOT an imposter!`;
    }

    let guessIndex = 0;
    const guessResults = [];

    function finishResults() {
        if (gameFinished) return;

        gameFinished = true;

        const roundResults = {
            resultMessage: resultMessage,
            spies: spies.map(index => playerNames[index]),
            secretWord: secretWord,
            category: categoryKey,
            guessResults: guessResults
        };

        localStorage.setItem(
            "spyGameRoundResults",
            JSON.stringify(roundResults)
        );

        window.location.href = "imposter.html";
    }

    // المرحلة الأولى: كشف الإمبوستر بعد التصويت.
    function revealImposters() {
        if (!playersVote) {
            showSpyGuess();
            return;
        }

        if (voteHeading) {
            voteHeading.textContent = "VOTING RESULTS";
        }

        playersVote.innerHTML = "";

        const result = document.createElement("h3");
        result.className = "vote-result";
        result.textContent = resultMessage;

        const revealTitle = document.createElement("h2");
        revealTitle.textContent = "THE IMPOSTER IS...";

        const names = document.createElement("div");
        names.className = "imposter-names";
        names.textContent = spies
            .map(index => playerNames[index])
            .join(", ");

        const continueButton = document.createElement("button");
        continueButton.type = "button";
        continueButton.className = "guess-option";
        continueButton.textContent = "CONTINUE TO GUESSING →";

        continueButton.addEventListener("click", () => {
            revealTitle.remove();
            names.remove();
            result.remove();
            continueButton.remove();

            showSpyGuess();
        });

        playersVote.append(
            result,
            revealTitle,
            names,
            continueButton
        );
    }

    // المرحلة الثانية: الإمبوستر يحاول تخمين الكلمة.
    function showSpyGuess() {
        if (guessIndex >= spies.length) {
            finishResults();
            return;
        }

        const spyIndex = spies[guessIndex];
        const spyName = playerNames[spyIndex];

        if (voteHeading) {
            voteHeading.textContent =
                `IMPOSTER GUESS (${guessIndex + 1}/${spies.length})`;
        }

        if (!playersVote) {
            finishResults();
            return;
        }

        playersVote.innerHTML = "";

        const instruction = document.createElement("p");
        instruction.className = "vote-result";
        instruction.textContent =
            `Pass the device to ${spyName}. Choose the secret word:`;

        const categoryWords = gameCategories[categoryKey] || [];

        const wrongAnswers = shuffleArray(
            categoryWords.filter(word => word !== secretWord)
        ).slice(0, 3);

        const answerOptions = shuffleArray([
            secretWord,
            ...wrongAnswers
        ]);

        const optionsContainer = document.createElement("div");
        optionsContainer.className = "guess-options";

        answerOptions.forEach(word => {
            const optionButton = document.createElement("button");

            optionButton.type = "button";
            optionButton.className = "guess-option";
            optionButton.textContent = word;

            optionButton.addEventListener("click", () => {
                if (gameFinished) return;

                const isCorrect = word === secretWord;

                if (isCorrect) {
                    addPoints(spyName, 100);
                }

                guessResults.push({
                    name: spyName,
                    guess: word,
                    correct: isCorrect
                });

                optionsContainer.querySelectorAll("button")
                    .forEach(button => {
                        button.disabled = true;
                    });

                const feedback = document.createElement("p");
                feedback.className = "vote-result";
                feedback.textContent = isCorrect
                    ? "CORRECT! +100 POINTS 🎉"
                    : "WRONG GUESS!";

                playersVote.appendChild(feedback);

                const nextButton = document.createElement("button");
                nextButton.type = "button";
                nextButton.className = "guess-option";
                nextButton.textContent =
                    guessIndex + 1 < spies.length
                        ? "NEXT IMPOSTER →"
                        : "SHOW FINAL RESULTS →";

                nextButton.addEventListener("click", () => {
                    guessIndex++;
                    showSpyGuess();
                });

                playersVote.appendChild(nextButton);
            });

            optionsContainer.appendChild(optionButton);
        });

        playersVote.append(instruction, optionsContainer);
    }

    // لا يبدأ التخمين إلا بعد كشف الإمبوستر والضغط على زر المتابعة.
    revealImposters();
}


    /* ---------- HOME BUTTON ---------- */

    if (homeBtn) {
        homeBtn.addEventListener("click", () => {
            if (gameTimer) clearInterval(gameTimer);

            // Home clears cumulative scores only if this is the game's Home button.
            localStorage.removeItem("spyGameScores");
            localStorage.removeItem("spyGamePlayerNames");
            localStorage.removeItem("spyGameRoundResults");

            window.location.href = "index.html";
        });
    }


    /* ---------- INITIALIZE ---------- */

    if (voteScreen) voteScreen.style.display = "none";
    if (voteBtn) voteBtn.style.display = "none";
    if (homeBtn) homeBtn.style.display = "none";

    showCurrentPlayer();
}


/* =========================================
   11. OPTIONAL PLAY AGAIN BUTTON
========================================= */

const playAgainBtn = document.getElementById("playAgainBtn");

if (playAgainBtn) {
    playAgainBtn.addEventListener("click", () => {
        // Keep scores, start a fresh round.
        window.location.href = "game.html?newRound=" + Date.now();
    });
}
