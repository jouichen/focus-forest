let score = 0;
let gameInterval, timerInterval, isPlaying = false;
let currentConfig = {};
let currentModeType = 'CHILD';
let currentThemeKey = ''; 

// 1. 終極設定檔：三大年齡層、九大主題全部到位！
const MODES = { 
    TODDLER: { 
        speed: 1800, duration: 30000, penalty: 0, size: '95px', switchProb: 0,
        themes: {
            FOREST: { n: "🌲 森林小動物", text: "🐿️ 專注森林：幫小松鼠抓 🌰", pool: [{e:'🌰', t:true}, {e:'🍂', t:false}], c: '#4A6B5D' },
            CAR:    { n: "🚑 嗶嗶啵啵車車", text: "🚑 森林救援隊：幫小車車加油 ⛽", pool: [{e:'⛽', t:true}, {e:'🛑', t:false}], c: '#3B82F6' }, 
            CASTLE: { n: "🏰 夢幻公主城堡", text: "👸 森林城堡：收集公主喜愛的 👑 和 🎀！", pool: [{e:'👑', t:true}, {e:'🎀', t:true}, {e:'🏰', t:false}, {e:'🧌', t:false}], c: '#EC4899' },
            BEAR:   { n: "🧸 熊熊與蜂蜜屋", text: "🧸 蜂蜜小屋：幫小熊收集好吃的 🍯！", pool: [{e:'🍯', t:true}, {e:'🐝', t:false}, {e:'🌲', t:false}], c: '#B45309' }
        }
    },
    CHILD: { 
        speed: 1100, duration: 40000, penalty: 5, size: '60px', switchProb: 0.2, // 0.2 機率觸發隨機切換
        themes: {
            CLASSIC: { n: "🌲 經典專注森林", text: "🐿️ 任務：幫松鼠抓橡實/兔兔抓蘿蔔", pool_squirrel: [{e:'🌰', t:true}, {e:'🍄', t:false}], pool_rabbit: [{e:'🥕', t:true}, {e:'🪨', t:false}], c: '#10B981' },
            SPACE:   { n: "🚀 宇宙大冒險", text: "🚀 任務：收集太空水晶！小心隕石！", pool_squirrel: [{e:'💎', t:true}, {e:'🪨', t:false}], pool_rabbit: [{e:'🔮', t:true}, {e:'🔥', t:false}], c: '#6366F1' },
            MAGIC:   { n: "🧙 魔法煉金術", text: "🧙 任務：收集魔法藥水！避開骷髏！", pool_squirrel: [{e:'🧪', t:true}, {e:'💀', t:false}], pool_rabbit: [{e:'📜', t:true}, {e:'🕷️', t:false}], c: '#8B5CF6' }
        }
    },
    SENIOR: { 
        speed: 2300, duration: 60000, penalty: 0, size: '85px', switchProb: 0.1,
        themes: {
            CLASSIC: { n: "🌲 樂齡大腦體操", text: "🐿️ 請聽指令：幫動物收集糧食", pool_squirrel: [{e:'🌰', t:true}, {e:'❌', t:false}], pool_rabbit: [{e:'🥕', t:true}, {e:'❌', t:false}], c: '#14B8A6' },
            FARM:    { n: "👨‍🌾 快樂開心農場", text: "👨‍🌾 請聽指令：採收蔬菜、消滅害蟲", pool_squirrel: [{e:'🥬', t:true}, {e:'🐛', t:false}], pool_rabbit: [{e:'🎃', t:true}, {e:'🐌', t:false}], c: '#84CC16' },
            CHEF:    { n: "🍲 總舖師大上菜", text: "🍲 請聽指令：收集食材放進湯鍋", pool_squirrel: [{e:'🍄', t:true}, {e:'🗑️', t:false}], pool_rabbit: [{e:'🍤', t:true}, {e:'👟', t:false}], c: '#F59E0B' }
        }
    }
};

const correctSound = new Audio('success.mp3');
const wrongSound = new Audio('pop.mp3');
let activePool = [];

function showMenu() {
    // 1. 先開槍擊斃計時器！防止它在背景偷偷重新整理、把物件叫出來
    clearInterval(gameInterval); 
    clearInterval(timerInterval);
    isPlaying = false;

    // 2. 切換選單的顯示狀態
    document.getElementById('menu-overlay').style.display = 'flex';
    document.getElementById('sub-menu-overlay').style.display = 'none'; 
    document.getElementById('restart-btn').style.display = 'none';
    document.getElementById('timer-container').style.display = 'none';
    
    // 3. 徹底清空並隱藏遊戲物件（例如大垃圾桶、皇冠）
    const obj = document.getElementById('game-object');
    if (obj) {
        obj.style.display = 'none';
        obj.innerText = ''; // 關鍵：直接把裡面的 Emoji 擦掉，確保就算穿透也是透明的
    }

    // 4. 把最上方的提示文字還原成歡迎詞，這樣就不會殘留「準備熬湯」
    const inst = document.getElementById('instruction');
    if (inst) {
        inst.innerHTML = "🌲 歡迎來到專注森林 🌲";
    }
}

// 3. 處理點擊模式按鈕（新增：進入前先斬斷所有前局計時器）
function selectMode(mode) {
    // 徹底清除前一局可能殘留的幽靈計時器
    clearInterval(gameInterval);
    clearInterval(timerInterval);
    
    currentModeType = mode;
    currentConfig = MODES[mode];
    
    const container = document.getElementById('theme-buttons-container');
    container.innerHTML = ''; // 清空舊按鈕
    
    const titles = { TODDLER: "👶 幼童專屬主題", CHILD: "🐿️ 兒童挑戰主題", SENIOR: "👵 樂齡懷舊主題" };
    document.getElementById('sub-menu-overlay').style.innerText = titles[mode]; // 修正原代碼小手誤：使用 innerText 確保相容
    if(document.getElementById('sub-menu-title')) {
        document.getElementById('sub-menu-title').innerText = titles[mode];
    }

    // 動態生成按鈕
    Object.keys(currentConfig.themes).forEach(key => {
        const theme = currentConfig.themes[key];
        const btn = document.createElement('button');
        btn.className = 'mode-btn';
        btn.style.backgroundColor = theme.c;
        btn.innerText = theme.n;
        btn.onclick = () => startThemedGame(key);
        container.appendChild(btn);
    });

    document.getElementById('menu-overlay').style.display = 'none';
    document.getElementById('sub-menu-overlay').style.display = 'flex';
}

function startThemedGame(themeKey) {
    currentThemeKey = themeKey;
    document.getElementById('sub-menu-overlay').style.display = 'none';
    startGame();
}

// 5. 遊戲主邏輯（雙重保險版）
function startGame() {
    // 【最關鍵的一步】啟動新局前，先把舊的計時器全部開槍擊斃！
    clearInterval(gameInterval);
    clearInterval(timerInterval);

    isPlaying = true;
    score = 0;
    let timeLeft = currentConfig.duration;
    document.getElementById('score').innerText = score;
    document.getElementById('timer-container').style.display = 'block';
    document.getElementById('game-object').style.fontSize = currentConfig.size;
    
    // 清空並隱藏可能殘留的舊物件
    const obj = document.getElementById('game-object');
    if (obj) {
        obj.style.display = 'none';
        obj.innerText = ''; 
    }
    
    updateModeLogic(); 
    nextTurn();

    // 啟動這一局全新的計時器
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

function updateModeLogic() {
    const inst = document.getElementById('instruction');
    const themeData = currentConfig.themes[currentThemeKey];
    
    if (currentModeType === 'TODDLER') {
        inst.innerHTML = themeData.text;
        activePool = themeData.pool;
    } else {
        // 兒童與樂齡：會隨機在 A、B 兩套指令間切換（動腦核心！）
        const isSquirrel = Math.random() > 0.5;
        if (currentModeType === 'CHILD') {
            const char = isSquirrel ? "🚀 宇航員" : "🧙 魔法師";
            if (currentThemeKey === 'CLASSIC') inst.innerHTML = isSquirrel ? "🐿️ 松鼠說：抓 🌰橡實" : "🐇 兔兔說：抓 🥕蘿蔔";
            if (currentThemeKey === 'SPACE') inst.innerHTML = isSquirrel ? "🚀 領航員：抓 💎藍水晶" : "🛸 外星人：抓 🔮紫能量";
            if (currentThemeKey === 'MAGIC') inst.innerHTML = isSquirrel ? "🧙 巫師：提煉 🧪綠藥水" : "📜 卷軸：尋找 📜黃羊皮紙";
        } else {
            if (currentThemeKey === 'CLASSIC') inst.innerHTML = isSquirrel ? "👵 請注意：幫松鼠抓 🌰" : "👵 請注意：幫兔兔抓 🥕";
            if (currentThemeKey === 'FARM') inst.innerHTML = isSquirrel ? "👨‍🌾 巡視菜園：採收 🥬高麗菜" : "👨‍🌾 巡視瓜田：採收 🎃大南瓜";
            if (currentThemeKey === 'CHEF') inst.innerHTML = isSquirrel ? "🍲 準備熬湯：快放 🍄鮮香菇" : "🍲 準備海鮮：快放 🍤大鮮蝦";
        }
        activePool = isSquirrel ? themeData.pool_squirrel : themeData.pool_rabbit;
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
