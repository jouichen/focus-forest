let score = 0;
let gameInterval;
let isPlaying = false;

const gameObject = document.getElementById('game-object');
const scoreDisplay = document.getElementById('score');
const startBtn = document.getElementById('start-btn');
const stage = document.getElementById('stage');

// 森林主題庫：只有 🌰 橡實是得分目標，其他是干擾項
const forestItems = [
    { emoji: '🌰', isTarget: true, label: '橡實' },
    { emoji: '🍄', isTarget: false, label: '毒菇' },
    { emoji: '🍂', isTarget: false, label: '落葉' },
    { emoji: '🐝', isTarget: false, label: '小蜜蜂' }
];

startBtn.addEventListener('click', startGame);
// 為了在手機上更好點擊，使用 pointerdown 代替 mousedown
gameObject.addEventListener('pointerdown', handleClick);

function startGame() {
    if (isPlaying) return;
    isPlaying = true;
    score = 0;
    scoreDisplay.innerText = score;
    startBtn.style.display = 'none';
    
    nextTurn();
    // 每 1.2 秒換一個東西，適合過動兒的節奏
    gameInterval = setInterval(nextTurn, 1200);
    
    // 30 秒一局，短週期低挫折感
    setTimeout(endGame, 30000);
}

function nextTurn() {
    // 隨機選一個森林物品
    const currentItem = forestItems[Math.floor(Math.random() * forestItems.length)];
    
    // 把文字塞進 HTML
    gameObject.innerText = currentItem.emoji;
    gameObject.dataset.isTarget = currentItem.isTarget;

    // 隨機計算舞台內的位置 (扣除物體本身大小)
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
    
    // 防止連點或意外縮放
    e.preventDefault();

    const isTarget = gameObject.dataset.isTarget === 'true';
    if (isTarget) {
        score += 10; // 點到橡實加分
    } else {
        score = Math.max(0, score - 5); // 點到毒菇或落葉輕微扣分
    }
    scoreDisplay.innerText = score;
    gameObject.style.display = 'none'; // 點擊後立刻消失，給予即時反饋
}

function endGame() {
    clearInterval(gameInterval);
    isPlaying = false;
    gameObject.style.display = 'none';
    startBtn.style.display = 'inline-block';
    startBtn.innerText = '再玩一次';
    alert(`遊戲結束囉！你在專注森林裡收集了好多回憶！\n你的總得分是：${score} 分 🌲🌟`);
}
