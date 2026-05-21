let score = 0;
let gameInterval;
let isPlaying = false;
let currentMode = 'squirrel'; // 預設松鼠模式

const gameObject = document.getElementById('game-object');
const scoreDisplay = document.getElementById('score');
const startBtn = document.getElementById('start-btn');
const stage = document.getElementById('stage');
const instruction = document.getElementById('instruction');

// 松鼠關卡的物品池
const squirrelPool = [
    { emoji: '🌰', isTarget: true },  // 得分目標
    { emoji: '🍄', isTarget: false }, 
    { emoji: '🍂', isTarget: false }
];

// 兔兔關卡的物品池
const rabbitPool = [
    { emoji: '🥕', isTarget: true },  // 得分目標
    { emoji: '🦋', isTarget: false }, // 蝴蝶干擾
    { emoji: '石头', emoji: '🪨', isTarget: false }
];

startBtn.addEventListener('click', startGame);
gameObject.addEventListener('pointerdown', handleClick);

function startGame() {
    if (isPlaying) return;
    isPlaying = true;
    score = 0;
    scoreDisplay.innerText = score;
    startBtn.style.display = 'none';
    
    // 隨機決定第一關是松鼠還是兔兔
    switchMode();
    nextTurn();
    
    // 每 1.2 秒換一次位置或物品
    gameInterval = setInterval(() => {
        // 20% 的機率隨機切換任務角色，增加驚喜感與專注切換練習
        if (Math.random() < 0.2) {
            switchMode();
        }
        nextTurn();
    }, 1200);
    
    // 30 秒一局
    setTimeout(endGame, 30000);
}

// 切換松鼠或兔兔模式
function switchMode() {
    currentMode = Math.random() > 0.5 ? 'squirrel' : 'rabbit';
    
    if (currentMode === 'squirrel') {
        stage.classList.remove('brown-theme'); // 變回綠色
        instruction.innerHTML = `🐿️ 松鼠說：幫我收集 <span>🌰 橡實</span>！`;
    } else {
        stage.classList.add('brown-theme');    // 變泥土棕
        instruction.innerHTML = `🐇 兔兔說：幫我收集 <span>🥕 蘿蔔</span>！`;
    }
}

function nextTurn() {
    // 根據目前的模式，從不同的池子挑選物品
    const currentPool = currentMode === 'squirrel' ? squirrelPool : rabbitPool;
    const currentItem = currentPool[Math.floor(Math.random() * currentPool.length)];
    
    gameObject.innerText = currentItem.emoji;
    gameObject.dataset.isTarget = currentItem.isTarget;

    // 計算隨機位置
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
        score = Math.max(0, score - 5); // 答錯小扣分，不打擊信心
    }
    scoreDisplay.innerText = score;
    gameObject.style.display = 'none'; // 點擊後立刻消失
}

function endGame() {
    clearInterval(gameInterval);
    isPlaying = false;
    gameObject.style.display = 'none';
    stage.classList.remove('brown-theme');
    instruction.innerHTML = `🌲 歡迎來到專注森林 🌲`;
    startBtn.style.display = 'inline-block';
    startBtn.innerText = '再幫一次小動物';
    alert(`遊戲結束囉！\n小動物們很開心有你的幫忙，你得到了 ${score} 分！🌟`);
}
