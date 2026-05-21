let score = 0;
let gameInterval, timerInterval, isPlaying = false;
let currentConfig = {};
let currentModeType = 'CHILD';

const MODES = {
    TODDLER: { speed: 1800, duration: 30000, penalty: 0, size: '95px', switchProb: 0, pool: [{e:'🌰', t:true}, {e:'🍂', t:false}] },
    CHILD: { speed: 1100, duration: 40000, penalty: 5, size: '60px', switchProb: 0.2, pool: [] }, // 兒童版會動態切換
    SENIOR: { speed: 2500, duration: 60000, penalty: 0, size: '85px', switchProb: 0.1, pool: [] } 
};

// 音效 (請確保已上傳至 GitHub)
const correctSound = new Audio('success.mp3');
const wrongSound = new Audio('pop.mp3');

function showMenu() {
    document.getElementById('menu-overlay').style.display = 'flex';
    document.getElementById('restart-btn').style.display = 'none';
    document.getElementById('timer-container').style.display = 'none';
    isPlaying = false;
    clearInterval(gameInterval);
    clearInterval(timerInterval);
}

function initGame(mode) {
    currentModeType = mode;
    currentConfig = MODES[mode];
    document.getElementById('menu-overlay').style.display = 'none';
    startGame();
}

function startGame() {
    isPlaying = true;
    score = 0;
    let timeLeft = currentConfig.duration;
    document.getElementById('score').innerText = score;
    document.getElementById('timer-container').style.display = 'block';
    document.getElementById('game-object').style.fontSize = currentConfig.size;
    
    updateModeLogic(); // 初始化角色提示
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

let activePool = [];
function updateModeLogic() {
    const isSquirrel = Math.random() > 0.5;
    const inst = document.getElementById('instruction');
    if (currentModeType === 'TODDLER') {
        inst.innerHTML = "🐿️ 幫幫小松鼠：抓 🌰";
        activePool = [{e:'🌰', t:true}, {e:'🍂', t:false}];
    } else {
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
    obj.style.left = Math.random() * (400 - 100) + 'px';
    obj.style.top = Math.random() * (400 - 100) + 'px';
    obj.style.display = 'block';
}

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
        floatDiv.innerText = currentModeType === 'TODDLER' ? '🍂' : `-${currentConfig.penalty}`;
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
