const counterElem = document.getElementById("counter");
const clickerElem = document.getElementById("clicker");
const streakCounterElem = document.getElementById("streak-counter");
const changelogBtn = document.getElementById("changelog-btn");
const changelogElem = document.getElementById("changelog");
const inactivityMessageElem = document.getElementById("inactivity-message");
const shopBtn = document.getElementById("shop-btn");
const resetBtn = document.getElementById("reset-btn");
const autoClickWarningElem = document.getElementById("auto-click-warning");
const songCreditElem = document.getElementById("song-credit");
const statusBarElem = document.getElementById("status-bar");

let clicks = 0;
let clickMultiplier = 1;
let autoClickRate = 0;
let autoClickInterval;
let lastClickTime = 0;
let clickCount = 0;
let clickStreak = 0;
let upgrades = {};
let inactivityTimer;
let notificationShown = false;

// Music playlist with song names
const musicPlaylist = [
  { src: "https://github.com/candycanezaeq/George-clicker-/raw/2a93377cdc6a823d5a7cb859a1e9460eafa13817/town-talk-made-with-Voicemod.mp3", name: "Town Talk" },
  { src: "https://github.com/candycanezaeq/George-clicker-/raw/2a93377cdc6a823d5a7cb859a1e9460eafa13817/mystic%20cave%20zone.mp3", name: "Mystic Cave Zone" },
  { src: "https://github.com/candycanezaeq/George-clicker-/raw/2a93377cdc6a823d5a7cb859a1e9460eafa13817/Local%20Forecast%20-%20Elevator.mp3", name: "Local Forecast - Elevator" },
  { src: "https://github.com/candycanezaeq/George-clicker-/raw/2a93377cdc6a823d5a7cb859a1e9460eafa13817/12.%20M.U.L.E%20(Bitblaster%20Mix).mp3", name: "M.U.L.E (Bitblaster Mix)" },
  { src: "https://github.com/candycanezaeq/George-clicker-/raw/2a93377cdc6a823d5a7cb859a1e9460eafa13817/02%20-%20Duncan%20Lamont%20-%20Lazy%20Sunday.mp3", name: "Lazy Sunday" },
  { src: "https://github.com/candycanezaeq/George-clicker-/raw/f900e92e62bf4f01efe26034e64da1500a71e5b0/toby%20fox%20-%20UNDERTALE%20Soundtrack%20-%2055%20Can%20You%20Really%20Call%20This%20A%20Hotel%2C%20I%20Didn't%20Receive%20A%20Mint%20On%20My%20Pillow%20Or%20Anything.mp3", name: "Can You Really Call This A Hotel?" },
  { src: "https://github.com/candycanezaeq/George-clicker-/raw/f900e92e62bf4f01efe26034e64da1500a71e5b0/Roblox%20Movie%20Maker!.mp3", name: "Roblox Movie Maker!" },
  { src: "https://github.com/candycanezaeq/George-clicker-/raw/13db69019d4957f5d249047b997d720872ab8566/Lemon%20Demon%20-%20The%20Ultimate%20Showdown%20Of%20Ultimate%20Destiny.mp3", name: "The Ultimate Showdown" },
  { src: "https://github.com/candycanezaeq/George-clicker-/raw/13db69019d4957f5d249047b997d720872ab8566/(14)%20Life%20In%20An%20Elevator%20-%20Roblox.mp3", name: "Life In An Elevator" }
];

// Function to shuffle the playlist
function shufflePlaylist(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Show song credit
function showSongCredit(songName) {
  songCreditElem.textContent = `Now Playing: ${songName}`;
  songCreditElem.style.opacity = 1;

  setTimeout(() => {
    songCreditElem.style.opacity = 0;
  }, 2000); // Fade out after 2 seconds
}

// Play shuffled music without looping
function playShuffledMusic() {
  const shuffledPlaylist = shufflePlaylist([...musicPlaylist]); // Create a shuffled copy of the playlist
  const bgMusic = document.getElementById("bg-music");

  let currentTrackIndex = 0;

  const playNextTrack = () => {
    if (currentTrackIndex >= shuffledPlaylist.length) {
      bgMusic.pause(); // Stop playing when the playlist ends
      return;
    }
    const track = shuffledPlaylist[currentTrackIndex];
    bgMusic.src = track.src;
    bgMusic.volume = 0.3;
    bgMusic.play();

    // Show song credit
    showSongCredit(track.name);

    currentTrackIndex++;
  };

  bgMusic.onended = playNextTrack; // Play the next track when the current one ends
  playNextTrack(); // Start playing the first track
}

// Inactivity check
function checkInactivity() {
  inactivityTimer = setTimeout(() => {
    inactivityMessageElem.style.display = "block";
  }, 60000); // 1 minute
}

// Reset inactivity timer
function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  inactivityMessageElem.style.display = "none";
  checkInactivity();
}

// Anti-autoclick measures
function handleAutoClick() {
  if (clickCount >= 5) {
    autoClickWarningElem.style.display = "block";
    setTimeout(() => {
      if (clickCount >= 5) {
        window.location.href = "https://www.indeed.com"; // Redirect to indeed.com
      }
    }, 2000);
  }
}

// Add purchase effect function
function showPurchaseEffect(cost, x, y) {
  const purchaseText = document.createElement("div");
  purchaseText.className = "floating-score purchase-effect";
  purchaseText.textContent = `-${cost}`;
  purchaseText.style.left = `${x}px`;
  purchaseText.style.top = `${y}px`;
  purchaseText.style.color = '#ff4444'; // Red color for purchases
  document.body.appendChild(purchaseText);
  
  setTimeout(() => {
    purchaseText.remove();
  }, 1000);
}

// Handle click
function handleClick(event) {
  const now = Date.now();
  if (now - lastClickTime < 100) {
    clickCount++;
    clickStreak++;
    handleAutoClick();
  } else {
    clickCount = 0;
    clickStreak = 0;
  }
  lastClickTime = now;

  // Add modernized click effect
  const clickEffect = document.createElement("div");
  clickEffect.className = "click-effect";
  clickEffect.style.left = `${event.clientX - 10}px`;
  clickEffect.style.top = `${event.clientY - 10}px`;
  document.body.appendChild(clickEffect);
  
  // Add floating score text
  const scoreText = document.createElement("div");
  scoreText.className = "floating-score";
  scoreText.textContent = `+${clickMultiplier}`;
  scoreText.style.left = `${event.clientX}px`;
  scoreText.style.top = `${event.clientY}px`;
  document.body.appendChild(scoreText);

  setTimeout(() => {
    clickEffect.remove();
    scoreText.remove();
  }, 1000);

  // Update game state
  clicks += clickMultiplier;
  counterElem.textContent = clicks;
  streakCounterElem.textContent = clickStreak;
  
  // Visual feedback for streak
  if (clickStreak > 10) {
    clickerElem.classList.add("streak-active");
    setTimeout(() => clickerElem.classList.remove("streak-active"), 200);
  }

  saveProgress();
  resetInactivityTimer();
}

// Add event listeners for navigation
shopBtn.addEventListener("click", () => {
  window.location.href = "shop.html";
});

// Enhanced save/load with better error handling
function saveProgress() {
  try {
    const gameState = {
      clicks,
      clickMultiplier,
      autoClickRate,
      clickerImage: clickerElem.src,
      upgrades,
      clickStreak,
      lastSave: Date.now()
    };
    localStorage.setItem('gameState', JSON.stringify(gameState));
  } catch (err) {
    console.error('Failed to save game state:', err);
  }
}

function loadProgress() {
  try {
    const savedState = localStorage.getItem('gameState');
    if (savedState) {
      const gameState = JSON.parse(savedState);
      clicks = gameState.clicks || 0;
      clickMultiplier = gameState.clickMultiplier || 1;
      autoClickRate = gameState.autoClickRate || 0;
      upgrades = gameState.upgrades || {};
      clickStreak = gameState.clickStreak || 0;
      
      if (gameState.clickerImage) {
        clickerElem.src = gameState.clickerImage;
      }

      counterElem.textContent = clicks;
      streakCounterElem.textContent = clickStreak;

      // Restore auto-clicker if active
      if (autoClickRate > 0) {
        startAutoClicker();
      }
    }
  } catch (err) {
    console.error('Failed to load game state:', err);
  }
}

// FPS Counter
let lastFrameTime = performance.now();
function updateFPS() {
  const now = performance.now();
  const delta = now - lastFrameTime;
  const fps = Math.round(1000 / delta);
}

// Show love letter notification
function showLoveLetterNotification() {
  if (notificationShown) return;
  
  const mailSound = new Audio('You\'ve Got Mail.wav');
  mailSound.volume = 0.3;
  mailSound.play();

  const notification = document.createElement('div');
  notification.className = 'love-letter';
  notification.innerHTML = `
    <div class="letter-content">
      <h3>💌 You've Got Mail!</h3>
      <button class="close-letter">×</button>
      <div class="letter-text">
        <p>Dear Community,</p>
        <p>I loved developing this with you! This was very fun. It may sound like I'm going to quit but I'm not - Floyd Clicker will only get better!</p>
        <p>Love,<br>Candy Cane</p>
      </div>
    </div>
  `;

  document.body.appendChild(notification);
  
  notification.querySelector('.close-letter').addEventListener('click', () => {
    notification.remove();
  });

  notificationShown = true;
  localStorage.setItem('notificationShown', true);
}

// Start the game
function initialize() {
  playShuffledMusic();
  checkInactivity();
  loadProgress();
  
  // Show notification after a short delay
  setTimeout(showLoveLetterNotification, 2000);
}

// Define startAutoClicker function
function startAutoClicker() {
  clearInterval(autoClickInterval);
  autoClickInterval = setInterval(() => {
    clicks += autoClickRate;
    counterElem.textContent = clicks;
    saveProgress();
  }, 1000);
}

// Update changelog button handler
changelogBtn.addEventListener("click", () => {
  const changelog = document.getElementById("changelog");
  changelog.style.display = changelog.style.display === "block" ? "none" : "block";
});

// Add event listener for clicker
clickerElem.addEventListener("click", handleClick);

// Define resetGame function
function resetGame() {
  if (confirm("Are you sure you want to reset your progress? This cannot be undone!")) {
    clicks = 0;
    clickMultiplier = 1;
    autoClickRate = 0;
    counterElem.textContent = clicks;
    clickerElem.src = "https://assets.onecompiler.app/437rezxye/437y3emvn/IMG_0030.png";
    clearInterval(autoClickInterval);
    localStorage.clear();
    saveProgress();
    streakCounterElem.textContent = 0;
  }
}

// Add event listener for reset button
resetBtn.addEventListener("click", resetGame);

initialize();