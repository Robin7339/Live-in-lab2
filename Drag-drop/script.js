const words = [
    { word: "CAT", image: "cat.jpeg", phonetic: "kæt" },
    { word: "DOG", image: "dog.jpeg", phonetic: "dɔːg" },
    { word: "LION", image: "lion.jpg", phonetic: "ˈlaɪən" },
    { word: "FISH", image: "fish.jpeg", phonetic: "fɪʃ" },
    { word: "BIRD", image: "bird.jpg", phonetic: "bɜːrd" },
    { word: "HORSE", image: "horse.jpg", phonetic: "hɔːrs" },
    { word: "ZEBRA", image: "zebra.jpg", phonetic: "ˈziːbrə" }
];

let currentLevel = 0;
const alphabet = "ABCDEFGHIJKLMNOPRSTUVWYZ".split("");
const qTable = {};
const learningRate = 0.1;
const discountFactor = 0.9;

const wordContainer = document.getElementById("word-container");
const lettersContainer = document.getElementById("letters-container");
const feedback = document.getElementById("feedback");
const nextLevelBtn = document.getElementById("next-level");
const retryLevelBtn = document.getElementById("retry-level");
const wordImage = document.getElementById("word-image");
const timerDisplay = document.getElementById("time");
const progressFill = document.getElementById("progress-fill");

const correctSound = document.getElementById("correct-sound");
const wrongSound = document.getElementById("wrong-sound");

let timerInterval;
let timeLeft = 30;

function loadLevel() {
    clearInterval(timerInterval);
    timeLeft = 30;
    timerDisplay.textContent = timeLeft;
    progressFill.style.width = "100%";
    startTimer();

    wordContainer.innerHTML = "";
    lettersContainer.innerHTML = "";
    feedback.textContent = "";
    nextLevelBtn.style.display = "none";
    retryLevelBtn.style.display = "none";

    const levelData = words[currentLevel];
    wordImage.src = `/static/images/${levelData.image}`;
    wordImage.alt = levelData.word;

    levelData.word.split("").forEach(() => {
        const blankSpace = document.createElement("div");
        blankSpace.classList.add("blank-space");
        blankSpace.dataset.empty = "true";
        blankSpace.ondrop = drop;
        blankSpace.ondragover = allowDrop;
        wordContainer.appendChild(blankSpace);
    });

    alphabet.forEach(letter => {
        const letterDiv = document.createElement("div");
        letterDiv.classList.add("letter");
        letterDiv.textContent = letter;
        letterDiv.draggable = true;
        letterDiv.ondragstart = drag;
        letterDiv.onclick = () => speak(letter);
        letterDiv.style.backgroundColor = getRandomColor();
        lettersContainer.appendChild(letterDiv);
    });

    speak(levelData.phonetic);
}

function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;
        progressFill.style.width = `${(timeLeft / 30) * 100}%`;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            feedback.textContent = "Time's up! Try again.";
            speak("Time's up! Try again.");
            retryLevelBtn.style.display = "inline-block";
        }
    }, 1000);
}

function allowDrop(event) {
    event.preventDefault();
}

function drag(event) {
    const letter = event.target.textContent;
    event.dataTransfer.setData("text", letter);
    speak(letter);
}

function drop(event) {
    event.preventDefault();
    const data = event.dataTransfer.getData("text");
    const blanks = Array.from(wordContainer.children);
    const position = blanks.indexOf(event.target);
    const correctWord = words[currentLevel].word;

    if (event.target.dataset.empty === "true" && data === correctWord[position]) {
        event.target.textContent = data;
        event.target.dataset.empty = "false";
        event.target.style.backgroundColor = "lightgreen";
        feedback.textContent = "Correct!";
        correctSound.play();
        updateQTable(correctWord, 1);
        checkAnswer();
    } else {
        feedback.textContent = "Incorrect. Try again!";
        wrongSound.play();
        speak("That's not correct. Try again!");
        updateQTable(correctWord, -1);
    }
}

function checkAnswer() {
    const answer = Array.from(wordContainer.children).map(div => div.textContent).join("");
    if (answer === words[currentLevel].word) {
        clearInterval(timerInterval);
        feedback.textContent = "Great job!";
        speak(`Great job! The correct pronunciation is ${words[currentLevel].phonetic}`);
        nextLevelBtn.style.display = "block";
    }
}

nextLevelBtn.addEventListener("click", () => {
    currentLevel++;
    if (currentLevel < words.length) {
        loadLevel();
    } else {
        feedback.textContent = "Game completed!";
        speak("Congratulations! You have completed the game!");
    }
});

retryLevelBtn.addEventListener("click", () => {
    loadLevel();
});

function updateQTable(word, reward) {
    if (!qTable[word]) qTable[word] = 0;
    qTable[word] = qTable[word] + learningRate * (reward + discountFactor * getMaxQValue() - qTable[word]);
}

function getMaxQValue() {
    return Math.max(...Object.values(qTable), 0);
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function speak(text) {
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    speech.rate = 0.9;
    speech.pitch = 1;
    speech.volume = 1;
    window.speechSynthesis.speak(speech);
}

loadLevel();
