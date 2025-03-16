// Shop page functionality 
let gameState = {};
let shopMusicInitialized = false;

// Updated load game state with reset check
try {
  const savedState = localStorage.getItem('gameState');
  const resetState = localStorage.getItem('resetState'); 
  
  if (savedState && resetState !== 'true') {
    gameState = JSON.parse(savedState);
  } else {
    // Clear shop state on reset
    gameState = {
      clicks: 0,
      clickMultiplier: 1,
      autoClickRate: 0,
      upgrades: {}
    };
  }
} catch (err) {
  console.error('Failed to load game state:', err);
}

// Enhanced shop system
class ShopItem {
  constructor(element) {
    this.element = element;
    this.name = element.dataset.name;
    this.cost = parseInt(element.dataset.cost);
    this.multiplier = parseInt(element.dataset.multiplier);
    this.autoClick = parseInt(element.dataset.autoclick);
    this.image = element.dataset.image;
    this.owned = gameState.upgrades?.[this.name] || 0;
    
    this.updateDisplay();

    this.element.addEventListener('click', () => this.purchase());
  }

  updateDisplay() {
    // Display owned badge
    let ownedBadge = this.element.querySelector('.shop-item-owned');
    if (this.owned > 0) {
      if (!ownedBadge) {
        ownedBadge = document.createElement('div');
        ownedBadge.className = 'shop-item-owned';
        this.element.querySelector('.shop-item-image').appendChild(ownedBadge);
      }
      ownedBadge.textContent = `x${this.owned}`;
    } else if (ownedBadge) {
      ownedBadge.remove(); // Remove badge if not owned
    }
    
    // Update affordability styling
    if (gameState.clicks >= this.cost) {
      this.element.classList.remove('shop-item-disabled');
    } else {
      this.element.classList.add('shop-item-disabled');  
    }

    const costDisplay = this.element.querySelector('.shop-item-cost');
    if (costDisplay) {
      costDisplay.textContent = `${this.cost} clicks`;
    }
  }

  purchase() {
    if (gameState.clicks >= this.cost) {
      // Play cash register sound
      const cashSound = new Audio('cash-register-kaching-sound-effect-125042.mp3');
      cashSound.volume = 0.3;
      cashSound.play();

      // Get click position from the item's location
      const rect = this.element.getBoundingClientRect();
      const x = rect.left + (rect.width / 2);
      const y = rect.top + (rect.height / 2);
      
      // Show purchase effect
      showPurchaseEffect(this.cost, x, y);
      
      // Existing purchase logic
      gameState.clicks -= this.cost;
      gameState.clickMultiplier = (gameState.clickMultiplier || 1) + this.multiplier;
      gameState.autoClickRate = (gameState.autoClickRate || 0) + this.autoClick;
      //gameState.currentClickerImage = this.image;
      
      if (!gameState.upgrades) gameState.upgrades = {};
      gameState.upgrades[this.name] = (gameState.upgrades[this.name] || 0) + 1;
      this.owned++;
      
      localStorage.setItem('gameState', JSON.stringify(gameState));
      
      // Update displays in main game
      updateMainGameDisplay();

      // Update displays
      this.updateDisplay();
    }
  }
}

// Fix the music initialization
const shopMusic = new Audio();
shopMusic.src = 'Raise_A_Floppa_Soundtrack_[_YouConvert.net_].mp3';
shopMusic.loop = true;
shopMusic.volume = 0.3;

// Add error handling for music
shopMusic.addEventListener('error', (e) => {
  console.error('Error loading shop music:', e);
});

// Start music when page is interacted with
document.addEventListener('click', () => {
  if (!shopMusicInitialized) {
    shopMusic.play().catch(err => console.log('Playback prevented:', err));
    shopMusicInitialized = true;
  }
}, { once: true });

// Navigation 
const backBtn = document.getElementById("back-btn");
backBtn.addEventListener("click", () => {
  shopMusic.pause();
  window.location.href = "index.html";
});

// Initialize shop items
const shopItems = Array.from(document.querySelectorAll('.shop-item')).map(item => new ShopItem(item));

// Function to update main game display in index.html
function updateMainGameDisplay() {
  // Send a message to the main game window to update its display
  window.opener?.postMessage({
    type: 'updateDisplay',
    clicks: gameState.clicks,
    clickMultiplier: gameState.clickMultiplier,
    autoClickRate: gameState.autoClickRate,
    currentClickerImage: gameState.currentClickerImage
  }, '*');
}

// Listen for messages from the main game window
window.addEventListener('message', (event) => {
  if (event.data.type === 'gameState') {
    gameState = event.data.gameState;
    shopItems.forEach(item => item.updateDisplay());
  }
});

// Add settings
const settingsBtn = document.createElement('button');
settingsBtn.id = 'settings-btn';
settingsBtn.textContent = 'âï¸ Settings';
document.body.appendChild(settingsBtn);

const settingsModal = document.createElement('div');
settingsModal.id = 'settings-modal';
settingsModal.innerHTML = `
  <div class="settings-content">
    <h2>Settings</h2>
    <div class="setting">
      <label>Music Volume</label>
      <input type="range" min="0" max="100" value="${shopMusic.volume * 100}" id="music-volume">
    </div>
    <div class="setting">  
      <label>Sound Effects</label>
      <input type="checkbox" id="sfx-enabled" checked>
    </div>
    <button id="close-settings">Close</button>
  </div>
`;
document.body.appendChild(settingsModal);

// Settings controls
document.getElementById('music-volume').addEventListener('input', (e) => {
  shopMusic.volume = e.target.value / 100;
  localStorage.setItem('musicVolume', e.target.value);
});

document.getElementById('sfx-enabled').addEventListener('change', (e) => {
  localStorage.setItem('sfxEnabled', e.target.checked);
});

settingsBtn.addEventListener('click', () => {
  settingsModal.style.display = 'flex';
});

document.getElementById('close-settings').addEventListener('click', () => {
  settingsModal.style.display = 'none';
});

// Load settings
const savedVolume = localStorage.getItem('musicVolume');
if (savedVolume) {
  shopMusic.volume = savedVolume / 100;
  document.getElementById('music-volume').value = savedVolume;
}

const sfxEnabled = localStorage.getItem('sfxEnabled');
if (sfxEnabled !== null) {
  document.getElementById('sfx-enabled').checked = JSON.parse(sfxEnabled);
}

function showPurchaseEffect(cost, x, y) {
  // Create purchase line effect
  const line = document.createElement('div');
  line.className = 'purchase-line';
  
  const shopBtn = document.getElementById("back-btn");
  // Calculate start and end positions
  const startX = shopBtn.getBoundingClientRect().right;
  const startY = shopBtn.getBoundingClientRect().top + (shopBtn.offsetHeight / 2);
  
  line.style.left = `${startX}px`;
  line.style.top = `${startY}px`;
  
  // Calculate angle and length
  const deltaX = x - startX;
  const deltaY = y - startY;
  const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  const angle = Math.atan2(deltaY, deltaX);
  
  line.style.width = `${length}px`;
  line.style.transform = `rotate(${angle}rad)`;
  
  document.body.appendChild(line);
  
  // Remove after animation
  setTimeout(() => line.remove(), 500);

  // Show floating cost text
  const purchaseText = document.createElement("div");
  purchaseText.className = "floating-score purchase-effect";
  purchaseText.textContent = `-${cost}`;
  purchaseText.style.left = `${x}px`;
  purchaseText.style.top = `${y}px`;
  purchaseText.style.color = '#ff4444';
  document.body.appendChild(purchaseText);
  
  setTimeout(() => purchaseText.remove(), 1000);
}