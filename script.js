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
let rushHourActive = false;
let rushHourStartTime = 0;
const RUSH_HOUR_DURATION = 30000;
const RUSH_HOUR_BONUS = 2;
let currentClickerImage = "https://assets.onecompiler.app/437rezxye/437y3emvn/IMG_0030.png";

// Music playlist with song names
const musicPlaylist = [
  { src: "https://github.com/candycanezaeq/George-clicker-/raw/2a93377cdc6a823d5a7cb859a1e9460eafa13817/town-talk-made-with-Voicemod.mp3", name: "Town Talk" },
  { src: "https://github.com/candycanezaeq/George-clicker-/raw/2a93377cdc6a823d5a7cb859a1e9460eafa13817/mystic%20cave%20zone.mp3", name: "Mystic Cave Zone" },
  { src: "https://github.com/candycanezaeq/George-clicker-/raw/2a93377cdc6a823d5a7cb859a1e9460eafa13817/Local%20Forecast%20-%20Elevator.mp3", name: "Local Forecast - Elevator" },
  { src: "https://github.com/candycanezaeq/George-clicker-/raw/2a93377cdc6a823d5a7cb859a1e9460eafa13817/12.%20M.U.L.E%20(Bitblaster%20Mix).mp3", name: "M.U.L.E (Bitblaster Mix)" },
  { src: "https://github.com/candycanezaeq/George-clicker-/raw/2a93377cdc6a823d5a7cb859a1e9460eafa13817/02%20-%20Duncan%20Lamont%20-%20Lazy%20Sunday.mp3", name: "Lazy Sunday" },
  { src: "https://github.com/candycanezaeq/George-clicker-/raw/f900e92e62bf4f01efe26034e64da1500a71e5b0/toby%20fox%20-%20UNDERTALE%20Soundtrack%20-%2055%20Can%20You%20Really%20Call%20This%20A%20Hotel%2C%20I%20Didn%27t%20Receive%20A%20Mint%20On%20My%20Pillow%20Or%20Anything.mp3", name: "Can You Really Call This A Hotel?" },
  { src: "https://github.com/candycanezaeq/George-clicker-/raw/f900e92e62bf4f01efe26034e64da1500a71e5b0/Roblox%20Movie%20Maker!.mp3", name: "Roblox Movie Maker!" },
  { src: "https://github.com/candycanezaeq/George-clicker-/raw/13db69019d4957f5d249047b997d720872ab8566/Lemon%20Demon%20-%20The%20Ultimate%20Showdown%20Of%20Ultimate%20Destiny.mp3", name: "The Ultimate Showdown" },
  { src: "https://github.com/candycanezaeq/George-clicker-/raw/13db69019d4957f5d249047b997d720872ab8566/(14)%20Life%20In%20An%20Elevator%20-%20Roblox.mp3", name: "Life In An Elevator" }
];

let mainMusicInitialized = false;

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

// Achievement system
const candyCaneQuotes = [
  "Hey hey! Looking to buy something?",
  "Psst... check out the shop!",
  "I wonder what ??? does...",
  "Have you unlocked any achievements yet?",
  "Getting close to 9,999,999,999 clicks?",
  "Need some help clicking?",
  "Those achievements won't unlock themselves!",
  "Keep clicking, you're doing great!"
];

const candyCaneResponses = [
  "Hey! That tickles!",
  "I'm trying to help here!",
  "Ouch, watch it!",
  "I'm not a clicker!",
  "You should be clicking Floyd instead!"
];

const achievements = {
  oohSpooky: {
    id: 'oohSpooky',
    name: 'Oooh Spooky!',
    description: 'Beat the game by buying Candycane',
    earned: false,
    icon: 'ð»'
  },
  clickMaster: {
    id: 'clickMaster', 
    name: 'Click Master',
    description: 'Click 1,000 times',
    earned: false,
    icon: 'ð'
  },
  autoClicker: {
    id: 'autoClicker',
    name: 'Auto-Click Champion',
    description: 'Reach 100 auto-clicks per second',
    earned: false,
    icon: 'ð¤'
  },
  shopaholic: {
    id: 'shopaholic',
    name: 'Shopaholic',
    description: 'Own 10 different shop items',
    earned: false,
    icon: 'ðï¸'
  },
  streakMaster: {
    id: 'streakMaster', 
    name: 'Streak Master',
    description: 'Get a 100 click streak',
    earned: false,
    icon: 'ð¥'
  },
  candyCaneClicker: {
    id: 'candyCaneClicker',
    name: 'Candy Cane Friend',
    description: 'Click on Candy Cane 10 times',
    earned: false,
    icon: 'ð¬',
    clicks: 0
  }
};

// Add achievement notification system
function showAchievement(achievement) {
  const notification = document.createElement('div');
  notification.className = 'achievement-notification';
  notification.innerHTML = `
    <div class="achievement-icon">${achievement.icon}</div>
    <div class="achievement-content">
      <div class="achievement-title">Achievement Unlocked!</div>
      <div class="achievement-name">${achievement.name}</div>
      <div class="achievement-desc">${achievement.description}</div>
    </div>
  `;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);

  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Achievement checks
function checkAchievements() {
  // Check for beating game
  if (!achievements.oohSpooky.earned && upgrades['Candycane']) {
    achievements.oohSpooky.earned = true;
    showAchievement(achievements.oohSpooky);
  }

  // Check click count
  if (!achievements.clickMaster.earned && clicks >= 1000) {
    achievements.clickMaster.earned = true; 
    showAchievement(achievements.clickMaster);
  }

  // Check auto-click rate
  if (!achievements.autoClicker.earned && autoClickRate >= 100) {
    achievements.autoClicker.earned = true;
    showAchievement(achievements.autoClicker);
  }

  // Check owned items
  if (!achievements.shopaholic.earned && Object.keys(upgrades).length >= 10) {
    achievements.shopaholic.earned = true;
    showAchievement(achievements.shopaholic);
  }

  // Check streak
  if (!achievements.streakMaster.earned && clickStreak >= 100) {
    achievements.streakMaster.earned = true;
    showAchievement(achievements.streakMaster);
  }

  saveAchievements();
}

// Save/load achievements
function saveAchievements() {
  localStorage.setItem('achievements', JSON.stringify(achievements));
}

function loadAchievements() {
  const saved = localStorage.getItem('achievements');
  if (saved) {
    const loaded = JSON.parse(saved);
    Object.keys(loaded).forEach(key => {
      if (achievements[key]) { // Check if the achievement exists
          achievements[key].earned = loaded[key].earned;
      }
    });
  }
}

// Function to start rush hour event
function startRushHour() {
  if (rushHourActive) return;

  clicks += 400;
  counterElem.textContent = clicks;
  rushHourActive = true;
  rushHourStartTime = Date.now();

  // Show the notification
  const rushHourNotification = document.getElementById('rush-hour-notification');
  rushHourNotification.style.display = 'block';
  rushHourNotification.classList.add('show');

  // Pulse the background red
  document.body.classList.add('rush-hour-active');

  // Clear rush hour after 30 seconds
  setTimeout(() => {
    rushHourActive = false;
    rushHourNotification.style.display = 'none';
    document.body.classList.remove('rush-hour-active');
  }, RUSH_HOUR_DURATION);

  // Check last 5 seconds
  setInterval(() => {
    const timeLeft = (rushHourStartTime + RUSH_HOUR_DURATION) - Date.now();
    if (timeLeft <= 5000 && timeLeft > 0) {
      document.body.classList.add('rush-hour-active');
    } else {
      document.body.classList.remove('rush-hour-active');
    }
  }, 250)
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
  let bonus = clickMultiplier;
  scoreText.textContent = `+${bonus}`;
  scoreText.style.left = `${event.clientX}px`;
  scoreText.style.top = `${event.clientY}px`;
  document.body.appendChild(scoreText);

  setTimeout(() => {
    clickEffect.remove();
    scoreText.remove();
  }, 1000);

  // Update game state
  let actualBonus = clickMultiplier;
  clicks += actualBonus;
  counterElem.textContent = clicks;
  streakCounterElem.textContent = clickStreak;

  saveProgress();
  resetInactivityTimer();
  checkAchievements();
}

// Enhanced save/load with better error handling
function saveProgress() {
  try {
    const gameState = {
      clicks,
      clickMultiplier,
      autoClickRate,
      currentClickerImage,
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
      currentClickerImage = gameState.currentClickerImage || "https://assets.onecompiler.app/437rezxye/437y3emvn/IMG_0030.png";
      upgrades = gameState.upgrades || {};
      clickStreak = gameState.clickStreak || 0;
      
      clickerElem.src = currentClickerImage;

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
      <h3>ð You've Got Mail!</h3>
      <button class="close-letter">Ã</button>
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

// Initialize function
function initializeCandyCaneAI() {
  const candyCane = document.getElementById('candycane-ai');
  const speech = candyCane.querySelector('.candycane-speech');
  const voiceSound = new Audio('animal-crossing-isabelle-voice-clips-no-background-music-youtubemp3free.mp3');
  voiceSound.volume = 0.3;
  
  // Set static position
  candyCane.style.bottom = '50px';
  candyCane.style.left = '50px';
  
  function showSpeech(text) {
    speech.textContent = '';
    speech.classList.add('show');
    
    // Play sound and type out text
    voiceSound.currentTime = 0;
    voiceSound.play();
    
    let i = 0;
    const typeInterval = setInterval(() => {
      speech.textContent += text[i];
      i++;
      
      if (i >= text.length) {
        clearInterval(typeInterval);
        // Stop sound after typing
        setTimeout(() => {
          voiceSound.pause();
          speech.classList.remove('show');
        }, 2000);
      }
    }, 50);
  }

  // Random speech
  setInterval(() => {
    if (Math.random() < 0.3) { // 30% chance to speak
      showSpeech(candyCaneQuotes[Math.floor(Math.random() * candyCaneQuotes.length)]);
      candyCane.classList.add('roll');
      setTimeout(() => candyCane.classList.remove('roll'), 1000);
    }
  }, 5000);

  // Click response
  candyCane.addEventListener('click', () => {
    showSpeech(candyCaneResponses[Math.floor(Math.random() * candyCaneResponses.length)]);
    candyCane.classList.add('roll');
    setTimeout(() => candyCane.classList.remove('roll'), 500);
    
    // Track achievement progress
    if (!achievements.candyCaneClicker.earned) {
      achievements.candyCaneClicker.clicks++;
      if (achievements.candyCaneClicker.clicks >= 10) {
        achievements.candyCaneClicker.earned = true;
        showAchievement(achievements.candyCaneClicker);
        saveAchievements();
      }
    }
  });
}

function initialize() {
  localStorage.removeItem('resetState');
  
  // Initialize main music
  if (!mainMusicInitialized) {
    playShuffledMusic();
    mainMusicInitialized = true;
  }
  checkInactivity();
  loadProgress();
  loadAchievements();
  
  // Only show notification if it hasn't been shown before
  const notificationShown = localStorage.getItem('notificationShown');
  if (!notificationShown) {
    setTimeout(showLoveLetterNotification, 2000);
    localStorage.setItem('notificationShown', 'true');
  }
  
  // Set up shop button
  shopBtn.addEventListener('click', () => {
    const shopURL = 'shop.html';
    window.open(shopURL, '_blank');
  });
  
  initializeCandyCaneAI();
  
  // Set up achievements tab
  const achievementsToggle = document.getElementById('achievements-toggle');
  const achievementsTab = document.getElementById('achievements-tab');
  const achievementsList = document.getElementById('achievements-list');

  achievementsToggle.addEventListener('click', () => {
    achievementsTab.classList.toggle('show');
  });

  // Populate achievements list
  function updateAchievementsList() {
    achievementsList.innerHTML = '';
    Object.values(achievements).forEach(achievement => {
      const item = document.createElement('div');
      item.className = `achievement-item ${achievement.earned ? 'earned' : ''}`;
      item.innerHTML = `
        <div class="achievement-icon">${achievement.icon}</div>
        <div>
          <div class="achievement-name">${achievement.name}</div>
          <div class="achievement-desc">${achievement.description}</div>
        </div>
      `;
      achievementsList.appendChild(item);
    });
  }

  updateAchievementsList();
  
  // Update achievements list when achievements change
  const originalShowAchievement = showAchievement;
  showAchievement = (achievement) => {
    originalShowAchievement(achievement);
    updateAchievementsList();
  };
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
    currentClickerImage = "https://assets.onecompiler.app/437rezxye/437y3emvn/IMG_0030.png";
    clickerElem.src = currentClickerImage;
    counterElem.textContent = clicks;
    clearInterval(autoClickInterval);
    
    // Clear game state
    localStorage.removeItem('gameState');
    
    // Set reset flag
    localStorage.setItem('resetState', 'true');
    
    // Reset achievements
    Object.keys(achievements).forEach(key => {
      achievements[key].earned = false;
    });
    saveAchievements();

    // Clear notification state
    localStorage.removeItem('notificationShown');
    localStorage.removeItem('mailSent');

    // Force reload to clear any cached state
    window.location.reload();
  }
}

// Add event listener for reset button
resetBtn.addEventListener("click", resetGame);

// Send game state to shop
shopBtn.addEventListener('click', () => {
  const shopURL = 'shop.html';
  const shopWindow = window.open(shopURL, '_blank');

  shopWindow.addEventListener('load', () => {
    shopWindow.postMessage({
      type: 'gameState',
      gameState: {
        clicks: clicks,
        clickMultiplier: clickMultiplier,
        autoClickRate: autoClickRate,
        currentClickerImage: currentClickerImage,
        upgrades: upgrades,
        clickStreak: clickStreak
      }
    }, '*');
  });
});

// Listen for updates from the shop
window.addEventListener('message', (event) => {
  if (event.data.type === 'updateDisplay') {
    clicks = event.data.clicks;
    clickMultiplier = event.data.clickMultiplier;
    autoClickRate = event.data.autoClickRate;
    currentClickerImage = event.data.currentClickerImage;

    counterElem.textContent = clicks;
    clickerElem.src = currentClickerImage;
  }
});

// New Button
let rapidClickActive = false;
let rapidClickCooldown = false;
let rapidClickTimer;
let chinImageElem; // Define chinImageElem outside the function

// Function to activate rapid click
function activateRapidClick() {
  if (rapidClickActive || rapidClickCooldown) return;

  rapidClickActive = true;
  rapidClickCooldown = true;

  // Change clicker image
  const originalClickerImage = clickerElem.src;
  //clickerElem.src = "https://github.com/candycanezaeq/George-clicker-/blob/1728ec5c7b2cf05d7375df8669119f6086b020dc/IMG_0199.gif";

  // Set up a temporary image element for the "Chopped Chin" image
  chinImageElem = document.createElement('img');
  chinImageElem.src = "https://assets.onecompiler.app/437rezxye/438aaxqjb/IMG_0088.jpeg";
  chinImageElem.style.position = 'fixed';
  chinImageElem.style.top = '50%';
  chinImageElem.style.left = '50%';
  chinImageElem.style.transform = 'translate(-50%, -50%)';
  chinImageElem.style.width = '200px';
  chinImageElem.style.height = '200px';
  chinImageElem.style.borderRadius = '50%';
  chinImageElem.style.objectFit = 'cover';
  chinImageElem.style.zIndex = '2000';
  chinImageElem.style.opacity = '1'; // Start with opacity 1
  chinImageElem.style.transition = 'opacity 1s ease-in-out'; // Smooth transition

  document.body.appendChild(chinImageElem);

  // Rapid click interval
  rapidClickTimer = setInterval(() => {
    clicks += clickMultiplier * 5; // Bonus
    counterElem.textContent = clicks;
    saveProgress();
  }, 100);

  // Reset state after 10 seconds
  setTimeout(() => {
    clearInterval(rapidClickTimer);
    rapidClickActive = false;
    clickerElem.src = originalClickerImage; // Revert the clicker image

    // Fade out "Chopped Chin" image
    chinImageElem.style.opacity = '0';

    // Remove "Chopped Chin" image from the DOM after it fades out
    setTimeout(() => {
      if (chinImageElem) {
        document.body.removeChild(chinImageElem);
        chinImageElem = null; // Reset the variable
      }
    }, 1000);
  }, 10000);

  // Cooldown after 60 seconds
  setTimeout(() => {
    rapidClickCooldown = false;
  }, 60000);
}

// Check for ??? purchase
function checkMail() {
  if (clicks >= 9999999999 && !localStorage.getItem('mailSent')) {
    const mailSound = new Audio('You\'ve Got Mail.wav');
    mailSound.volume = 0.3;
    mailSound.play();

    const notification = document.createElement('div');
    notification.className = 'love-letter';
    notification.innerHTML = `
      <div class="letter-content">
        <h3>ð Urgent Warning!</h3>
        <button class="close-letter">Ã</button>
        <div class="letter-text">
          <p>Dear Player,</p>
          <p>Do not buy the ??? item! It will end everything. Please, heed this warning!</p>
          <p>Sincerely,<br>Candy Cane</p>
        </div>
      </div>
    `;

    document.body.appendChild(notification);

    notification.querySelector('.close-letter').addEventListener('click', () => {
      notification.remove();
    });

    localStorage.setItem('mailSent', 'true'); // Set flag
  }
}

// Handle ??? purchase
function handleMysteryPurchase() {
  window.location.href = "https://candycanezaeq.github.io/god-us-coming-test/";
}

// Define the function for calling
function initializeGame() {
  initialize();
  updateFPS();
  checkMail();

  // Check for mail
  setInterval(checkMail, 5000);
}

document.addEventListener('DOMContentLoaded', function() {
  initializeGame();
});