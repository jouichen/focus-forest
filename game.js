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
            FOREST: { text: "🐿️ 專注森林：幫小松鼠抓 🌰", pool: [{e:'🌰', t:true}, {e:'🍂', t:false}] },
            CAR:    { text: "🚑 森林救援隊：幫小車車加油 ⛽", pool: [{e:'⛽', t:true}, {e:'🛑', t:false}] }, 
            // ----- 已更新：精靈公主城堡主題 -----
            CASTLE: { 
                text: "👸 森林城堡：收集公主喜愛的 👑 和 🎀！", 
                pool: [
                    {e:'👑', t:true},  // 得分目標 1：閃亮皇冠
                    {e:'🎀', t:true},  // 得分目標 2：可愛蝴蝶結
                    {e:'🏰', t:false}, // 干擾項 1：這是大城堡（不能抓）
                    {e:'🧌', t:false}  // 干擾項 2：綠色泥巴怪（髒兮兮不能點）
                ] 
            }
            // ----------------------------------
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
