let score = 0;
let gameInterval, timerInterval, isPlaying = false;
let currentConfig = {};
let currentModeType = 'CHILD';
let toddlerSubTheme = 'FOREST'; // 預設幼兒副主題

// 1. 全靈活設定檔：以後要加新主題，直接改這裡就行！
const MODES = {
    TODDLER: { 
        speed: 1800, duration: 30000, penalty: 0, size: '95px', switchProb: 0,
        themes: {
            FOREST: { text: "🐿️ 幫小松鼠：抓 🌰", pool: [{e:'🌰', t:true}, {e:'🍂', t:false}] },
            CAR:    { text: "🚑 幫小車車：抓 ⛽", pool: [{e:'⛽', t:true}, {e:'🛑', t:false}] }, // 抓汽油，避開紅燈/路障
            CASTLE: { text: "👸 幫小公主：抓 💎", pool: [{e:'💎', t:true}, {e:'🐸', t:false}] }  // 抓鑽石，避開青蛙
        }
    },
    CHILD: { speed: 1100, duration: 40000, penalty: 5, size: '60px', switchProb: 0.2 }, 
    SENIOR: { speed: 2500, duration: 60000, penalty: 0, size: '85px', switchProb: 0.1 } 
};

// 音效 (請確保已上傳至你的 GitHub 專案中)
const correctSound = new Audio('success.mp3');
const wrongSound = new Audio('pop.mp3');

let activePool = [];

// 2. 顯示主選單
function showMenu() {
    document.getElementById('menu-overlay').style.display = 'flex';
    document.getElementById('toddler-sub-menu').style.display = 'none'; // 隱藏幼兒子選單
    document.getElementById('restart-btn').style.display = 'none';
    document.getElementById('timer-container').style.display = 'none';
    isPlaying = false;
    clearInterval(gameInterval);
    clearInterval(timerInterval);
}

// 3. 處理點擊模式按鈕
function selectMode(mode) {
    currentModeType = mode;
    currentConfig = MODES[mode];
    
    if (mode === 'TODDLER') {
        // 如果是幼兒，不直接開始，先切換到「選車車、小動物或公主」的子選單
        document.getElementById('menu-overlay').style.display = 'none';
        document.getElementById('toddler-sub-menu').style.display = 'flex';
    } else {
        // 其他模式直接開始
        document.getElementById('menu-overlay').style.display = 'none';
        startGame();
    }
}

// 4. 初始化幼兒副主題
function initToddlerGame(subTheme) {
    toddlerSubTheme = subTheme;
    document.getElementById('toddler-sub-menu').style.display = 'none';
    startGame();
}

// 5. 遊戲主邏輯
function startGame() {
    isPlaying = true;
    score = 0;
    let timeLeft = currentConfig.duration;
    document.getElementById('score').innerText = score;
    document.getElementById('timer-container').style.display = 'block';
    document.getElementById('game-object').style.fontSize = currentConfig.size;
    
    updateModeLogic(); 
    nextTurn();

    gameInterval = setInterval(() => {
        if (Math.random() < currentConfig.switchProb) updateModeLogic();
        nextTurn();
    }, currentConfig.speed);

    timerInterval = setInterval(() => {
        timeLeft -= 100;
        document.getElementById('timer-bar').style.width = (timeLeft / currentConfig.duration * 100) + '%';
        if (timeLeft <= 0) endGame();
    }, 100);
}

// 6. 每回合的角色與提示切換
function updateModeLogic() {
    const inst = document.getElementById('instruction');
    
    if (currentModeType === 'TODDLER') {
        // 幼兒模式：讀取對應的副主題設定
        const themeData = currentConfig.themes[toddlerSubTheme];
        inst.innerHTML = themeData.text;
        activePool = themeData.pool;
    } else {
        // 兒童與長輩模式：隨機切換松鼠或兔兔
        const isSquirrel = Math.random() > 0.5;
        const char = isSquirrel ? "🐿️ 松鼠" : "🐇 兔兔";
        const target = isSquirrel ? "🌰 橡實" : "🥕 蘿蔔";
        inst.innerHTML = `${char}說：幫我抓 ${target}`;
        activePool = isSquirrel ? [{e:'🌰', t:true}, {e:'🍄', t:false}] : [{e:'🥕', t:true}, {e:'🪨', t:false}];
    }
}

function nextTurn() {
    const item = activePool[Math.floor(Math.random() * activePool.length)];
    const obj = document.getElementById('game-object');
    obj.innerText = item.e;
    obj.dataset.isTarget = item.t;
    // 隨機在 400x400 的舞台內調整位置 (扣除物件本身大小)
    obj.style.left = Math.random() * (400 - 100) + 'px';
    obj.style.top = Math.random() * (400 - 100) + 'px';
    obj.style.display = 'block';
}

// 7. 點擊判定
document.getElementById('game-object').addEventListener('pointerdown', function(e) {
    if (!isPlaying) return;
    const isTarget = this.dataset.isTarget === 'true';
    const floatDiv = document.createElement('div');
    floatDiv.className = 'floating-text ' + (isTarget ? 'plus' : 'minus');
    
    if (isTarget) {
        score += 10;
        floatDiv.innerText = currentModeType === 'TODDLER' ? '⭐' : '+10';
        correctSound.currentTime = 0; correctSound.play().catch(e=>{});
    } else {
        score = Math.max(0, score - currentConfig.penalty);
        // 幼兒點錯不扣分，只飄出干擾物圖標
        floatDiv.innerText = currentModeType === 'TODDLER' ? '💨' : `-${currentConfig.penalty}`;
        wrongSound.currentTime = 0; wrongSound.play().catch(e=>{});
    }

    floatDiv.style.left = e.offsetX + 'px';
    floatDiv.style.top = e.offsetY + 'px';
    document.getElementById('stage').appendChild(floatDiv);
    setTimeout(()=>floatDiv.remove(), 800);
    document.getElementById('score').innerText = score;
    this.style.display = 'none';
});

function endGame() {
    clearInterval(gameInterval); clearInterval(timerInterval);
    isPlaying = false;
    document.getElementById('game-object').style.display = 'none';
    document.getElementById('restart-btn').style.display = 'inline-block';
    alert(`遊戲結束！您的得分是：${score}`);
}
