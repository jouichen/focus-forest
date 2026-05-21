let score = 0;
let gameInterval;
let timerInterval; // 新增：控制計時器的變數
let isPlaying = false;
let currentMode = 'squirrel';

// 遊戲總時間設定（30秒 = 30000毫秒）
const GAME_DURATION = 30000; 
let timeLeft = GAME_DURATION;

const gameObject = document.getElementById('game-object');
const scoreDisplay = document.getElementById('score');
const startBtn = document.getElementById('start-btn');
const stage = document.getElementById('stage');
const instruction = document.getElementById('instruction');
const timerContainer = document.getElementById('timer-container');
const timerBar = document.getElementById('timer-bar');

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
    timeLeft = GAME_DURATION; // 重設時間
    scoreDisplay.innerText = score;
    startBtn.style.display = 'none';
    
    // 顯示計時條，並讓進度條全滿
    timerContainer.style.display = 'block';
    timerBar.style.width = '100%';
    
    switchMode();
    nextTurn();
    
    // 每 1.2 秒更換物品
    gameInterval = setInterval(() => {
        if (Math.random() < 0.2) {
            switchMode();
        }
        nextTurn();
    }, 1200);
    
    // 新增：每 100 毫秒（0.1秒）更新一次計時器長度
    timerInterval = setInterval(() => {
        timeLeft -= 100;
        const percentage = (timeLeft / GAME_DURATION) * 100;
        timerBar.style.width = percentage + '%';
        
        // 當時間到了就結束遊戲
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
    gameObject.dataset.isTarget = currentTarget = currentItem.isTarget;

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
    if (isTarget) {
        score += 10;
    } else {
        score = Math.max(0, score - 5);
    }
    scoreDisplay.innerText = score;
    gameObject.style.display = 'none';
}

function endGame() {
    clearInterval(gameInterval);
    clearInterval(timerInterval); // 新增：停止計時器
    
    isPlaying = false;
    gameObject.style.display = 'none';
    timerContainer.style.display = 'none'; // 隱藏計時器
    stage.classList.remove('brown-theme');
    
    instruction.innerHTML = `🌲 歡迎來到專注森林 🌲`;
    startBtn.style.display = 'inline-block';
    startBtn.innerText = '再幫一次小動物';
    
    // 延遲一點點跳出提示，讓孩子先看清最後畫面
    setTimeout(() => {
        alert(`時間到囉！\n小動物們很開心有你的幫忙，你得到了 ${score} 分！🌟`);
    }, 100);
}
