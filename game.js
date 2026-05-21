let score = 0;
let gameInterval;
let timerInterval;
let isPlaying = false;
let currentMode = 'squirrel';

const GAME_DURATION = 30000; 
let timeLeft = GAME_DURATION;

const gameObject = document.getElementById('game-object');
const scoreDisplay = document.getElementById('score');
const startBtn = document.getElementById('start-btn');
const stage = document.getElementById('stage');
const instruction = document.getElementById('instruction');
const timerContainer = document.getElementById('timer-container');
const timerBar = document.getElementById('timer-bar');

// --- 更新：直接讀取你 GitHub 專案裡的音效檔案 ---
// 答對音效（讀取同目錄下的 success.mp3）
const correctSound = new Audio('success.mp3');

// 答錯音效（讀取同目錄下的 pop.mp3）
const wrongSound = new Audio('pop.mp3');

// 背景音樂（我們先暫時關閉，確保前兩個音效正常發聲）
const bgm = new Audio(''); 
// ------------------------------------

bgm.loop = true; 
bgm.volume = 0.3; // 背景音樂小聲、舒服即可

correctSound.volume = 0.5;
wrongSound.volume = 0.4;
// ------------------------------------

const squirrelPool = [
    { emoji: '🌰', isTarget: true },
    { emoji: '🍄', isTarget: false }, 
    { emoji: '🍂', isTarget: false }
];

const rabbitPool = [
    { emoji: '🥕', isTarget: true },
    { emoji: '🦋', isTarget: false },
    { emoji: '🪨', isTarget: false }
];

startBtn.addEventListener('click', startGame);
gameObject.addEventListener('pointerdown', handleClick);

function startGame() {
    if (isPlaying) return;
    isPlaying = true;
    score = 0;
    timeLeft = GAME_DURATION;
    scoreDisplay.innerText = score;
    startBtn.style.display = 'none';
    
    timerContainer.style.display = 'block';
    timerBar.style.width = '100%';
    
    // --- 新增：開始遊戲時播放背景音樂 ---
    bgm.currentTime = 0; // 從頭播放
    bgm.play().catch(e => console.log("音樂播放被瀏覽器阻擋，需等待使用者點擊。"));
    // ----------------------------------
    
    switchMode();
    nextTurn();
    
    gameInterval = setInterval(() => {
        if (Math.random() < 0.2) {
            switchMode();
        }
        nextTurn();
    }, 1200);
    
    timerInterval = setInterval(() => {
        timeLeft -= 100;
        const percentage = (timeLeft / GAME_DURATION) * 100;
        timerBar.style.width = percentage + '%';
        
        if (timeLeft <= 0) {
            endGame();
        }
    }, 100);
}

function switchMode() {
    currentMode = Math.random() > 0.5 ? 'squirrel' : 'rabbit';
    if (currentMode === 'squirrel') {
        stage.classList.remove('brown-theme');
        instruction.innerHTML = `🐿️ 松鼠說：幫我收集 <span>🌰 橡實</span>！`;
    } else {
        stage.classList.add('brown-theme');
        instruction.innerHTML = `🐇 兔兔說：幫我收集 <span>🥕 蘿蔔</span>！`;
    }
}

function nextTurn() {
    const currentPool = currentMode === 'squirrel' ? squirrelPool : rabbitPool;
    const currentItem = currentPool[Math.floor(Math.random() * currentPool.length)];
    
    gameObject.innerText = currentItem.emoji;
    gameObject.dataset.isTarget = currentItem.isTarget;

    const maxX = stage.clientWidth - 70;
    const maxY = stage.clientHeight - 70;
    const randomX = Math.floor(Math.random() * maxX);
    const randomY = Math.floor(Math.random() * maxY);

    gameObject.style.left = randomX + 'px';
    gameObject.style.top = randomY + 'px';
    gameObject.style.display = 'block';
}

function handleClick(e) {
    if (!isPlaying) return;
    e.preventDefault();

    const isTarget = gameObject.dataset.isTarget === 'true';
    
    const rect = stage.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const floatDiv = document.createElement('div');
    floatDiv.classList.add('floating-text');
    
    if (isTarget) {
        score += 10;
        floatDiv.innerText = '+10';
        
        // --- 新增：播放答對音效 ---
        correctSound.currentTime = 0; // 重設時間，連續狂點時音效才不會卡住
        correctSound.play();
        // -------------------------
    } else {
        score = Math.max(0, score - 5);
        floatDiv.innerText = '-5';
        floatDiv.classList.add('minus');
        
        // --- 新增：播放答錯音效 ---
        wrongSound.currentTime = 0;
        wrongSound.play();
        // -------------------------
    }
    
    floatDiv.style.left = (clickX - 15) + 'px';
    floatDiv.style.top = (clickY - 20) + 'px';
    stage.appendChild(floatDiv);
    
    setTimeout(() => { floatDiv.remove(); }, 800);

    scoreDisplay.innerText = score;
    gameObject.style.display = 'none';
}

function endGame() {
    clearInterval(gameInterval);
    clearInterval(timerInterval);
    
    // --- 新增：遊戲結束時停止背景音樂 ---
    bgm.pause();
    // ----------------------------------
    
    isPlaying = false;
    gameObject.style.display = 'none';
    timerContainer.style.display = 'none';
    stage.classList.remove('brown-theme');
    
    instruction.innerHTML = `🌲 歡迎來到專注森林 🌲`;
    startBtn.style.display = 'inline-block';
    startBtn.innerText = '再幫一次小動物';
    
    setTimeout(() => {
        alert(`時間到囉！\n小動物們很開心有你的幫忙，你得到了 ${score} 分！🌟`);
    }, 100);
}
