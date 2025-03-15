// Shop page functionality 
let gameState = {};

// Load game state
try {
  const savedState = localStorage.getItem('gameState');
  if (savedState) {
    gameState = JSON.parse(savedState);
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
  }

  updateDisplay() {
    if (this.owned > 0) {
      const ownedBadge = this.element.querySelector('.shop-item-owned') || document.createElement('div');
      ownedBadge.className = 'shop-item-owned';
      ownedBadge.textContent = `x${this.owned}`;
      this.element.querySelector('.shop-item-image').appendChild(ownedBadge);
    }
    
    // Update affordability styling
    if (gameState.clicks >= this.cost) {
      this.element.classList.remove('shop-item-disabled');
    } else {
      this.element.classList.add('shop-item-disabled');  
    }
  }

  purchase() {
    if (gameState.clicks >= this.cost) {
      // Get click position from the item's location
      const rect = this.element.getBoundingClientRect();
      const x = rect.left + (rect.width / 2);
      const y = rect.top + (rect.height / 2);
      
      // Show purchase effect
      // showPurchaseEffect(this.cost, x, y);
      
      // Existing purchase logic
      gameState.clicks -= this.cost;
      gameState.clickMultiplier = (gameState.clickMultiplier || 1) + this.multiplier;
      gameState.autoClickRate = (gameState.autoClickRate || 0) + this.autoClick;
      gameState.currentClickerImage = this.image;
      
      if (!gameState.upgrades) gameState.upgrades = {};
      gameState.upgrades[this.name] = (gameState.upgrades[this.name] || 0) + 1;
      this.owned++;
      
      localStorage.setItem('gameState', JSON.stringify(gameState));
      
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
  shopMusic.play().catch(err => console.log('Playback prevented:', err));
}, { once: true });

// Fix shop item click handling
document.querySelectorAll('.shop-item').forEach(item => {
  item.addEventListener('click', () => {
    const shopItem = new ShopItem(item);
    shopItem.purchase();
  });
});

// Navigation 
const backBtn = document.getElementById("back-btn");
backBtn.addEventListener("click", () => {
  shopMusic.pause();
  window.location.href = "index.html";
});

// Initialize
document.querySelectorAll('.shop-item').forEach(item => {
  const shopItem = new ShopItem(item);
});

// Update shop every second
setInterval(() => {
  document.querySelectorAll('.shop-item').forEach(item => {
    const shopItem = new ShopItem(item);
    shopItem.updateDisplay();
  });
}, 1000);

// Add settings
const settingsBtn = document.createElement('button');
settingsBtn.id = 'settings-btn';
settingsBtn.textContent = '⚙️ Settings';
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