// 全局变量
let allQuotes = [];
let currentCategory = '全部';
let todayPool = [];
let currentIndex = 0;
let shuffleSeed = 0;

// LocalStorage 键前缀
const STORAGE_PREFIX = 'dailyQuote_';

// 简单的字符串哈希函数
function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // 转换为32位整数
    }
    return Math.abs(hash);
}

// 获取今天的日期字符串 (YYYY-MM-DD)
function getTodayString() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

// 基于日期和分类的稳定随机数生成器
function seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

// 洗牌算法（使用种子）
function shuffleArray(array, seed) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(seededRandom(seed + i) * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// 获取当前状态的存储键
function getStorageKey() {
    const todayString = getTodayString();
    const categoryKey = currentCategory === '全部' ? 'all' : currentCategory;
    return `${STORAGE_PREFIX}${todayString}_${categoryKey}_${shuffleSeed}`;
}

// 保存当前进度到 localStorage
function saveProgress() {
    try {
        const key = getStorageKey();
        const data = {
            currentIndex,
            shuffleSeed,
            currentCategory,
            date: getTodayString()
        };
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error('保存进度失败:', error);
    }
}

// 从 localStorage 加载进度
function loadProgress() {
    try {
        const todayString = getTodayString();
        
        // 尝试加载当前分类和种子的进度
        for (let seed = 0; seed <= 10; seed++) {
            const categoryKey = currentCategory === '全部' ? 'all' : currentCategory;
            const key = `${STORAGE_PREFIX}${todayString}_${categoryKey}_${seed}`;
            const stored = localStorage.getItem(key);
            
            if (stored) {
                const data = JSON.parse(stored);
                // 验证是否是今天的数据
                if (data.date === todayString && data.currentCategory === currentCategory) {
                    currentIndex = data.currentIndex || 0;
                    shuffleSeed = data.shuffleSeed || 0;
                    return true;
                }
            }
        }
        return false;
    } catch (error) {
        console.error('加载进度失败:', error);
        return false;
    }
}

// 清理过期的 localStorage 键
function cleanupOldProgress() {
    try {
        const todayString = getTodayString();
        const keysToRemove = [];
        
        // 遍历所有 localStorage 键
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(STORAGE_PREFIX)) {
                // 提取日期部分 (格式: dailyQuote_YYYY-MM-DD_...)
                const match = key.match(/dailyQuote_(\d{4}-\d{2}-\d{2})_/);
                if (match && match[1] !== todayString) {
                    keysToRemove.push(key);
                }
            }
        }
        
        // 删除过期的键
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        if (keysToRemove.length > 0) {
            console.log(`清理了 ${keysToRemove.length} 个过期的进度记录`);
        }
    } catch (error) {
        console.error('清理过期进度失败:', error);
    }
}

// 根据分类和日期生成今日金句池
function generateTodayPool() {
    const todayString = getTodayString();
    const categoryKey = currentCategory === '全部' ? 'all' : currentCategory;
    const seed = hashString(todayString + categoryKey + shuffleSeed);
    
    // 过滤分类
    let filtered = currentCategory === '全部' 
        ? allQuotes 
        : allQuotes.filter(q => q.category === currentCategory);
    
    if (filtered.length === 0) {
        filtered = allQuotes; // 如果没有匹配的，显示全部
    }
    
    // 基于种子洗牌
    todayPool = shuffleArray(filtered, seed);
    currentIndex = 0;
}

// 显示金句
function displayQuote() {
    if (todayPool.length === 0) {
        document.getElementById('quoteText').textContent = '暂无金句';
        document.getElementById('quoteAuthor').textContent = '';
        document.getElementById('quoteCategory').textContent = '';
        document.getElementById('quoteTranslation').textContent = '';
        document.getElementById('quoteTranslation').classList.remove('show');
        return;
    }
    
    const quote = todayPool[currentIndex];
    const quoteTextEl = document.getElementById('quoteText');
    
    quoteTextEl.textContent = quote.text;
    document.getElementById('quoteAuthor').textContent = quote.author ? `— ${quote.author}` : '';
    document.getElementById('quoteCategory').textContent = quote.category;
    
    // 如果文本长度超过 60 个字符，添加 long 类以使用较小字体
    if (quote.text.length > 60) {
        quoteTextEl.classList.add('long');
    } else {
        quoteTextEl.classList.remove('long');
    }
    
    // 显示翻译（如果存在）
    const translationEl = document.getElementById('quoteTranslation');
    if (quote.translation) {
        translationEl.textContent = quote.translation;
        translationEl.classList.add('show');
    } else {
        translationEl.textContent = '';
        translationEl.classList.remove('show');
    }
}

// 下一句
function nextQuote() {
    if (todayPool.length === 0) return;
    currentIndex = (currentIndex + 1) % todayPool.length;
    displayQuote();
    saveProgress(); // 保存进度
}

// 再来一批
function newBatch() {
    shuffleSeed++;
    generateTodayPool();
    displayQuote();
    saveProgress(); // 保存进度
}

// 复制到剪贴板
async function copyQuote() {
    const quote = todayPool[currentIndex];
    if (!quote) return;
    
    let text = quote.text;
    
    // 如果有翻译，添加翻译
    if (quote.translation) {
        text += `\n${quote.translation}`;
    }
    
    // 添加作者
    if (quote.author) {
        text += `\n— ${quote.author}`;
    }
    
    try {
        await navigator.clipboard.writeText(text);
        showToast('已复制到剪贴板');
    } catch (err) {
        // 降级方案
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            showToast('已复制到剪贴板');
        } catch (err2) {
            showToast('复制失败，请手动复制');
        }
        document.body.removeChild(textArea);
    }
}

// 朗读金句
function speakQuote() {
    const quote = todayPool[currentIndex];
    if (!quote) return;
    
    if ('speechSynthesis' in window) {
        // 停止当前朗读
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(quote.text);
        
        // 设置语言
        if (quote.category === '英语') {
            utterance.lang = 'en-US';
        } else {
            utterance.lang = 'zh-CN';
        }
        
        utterance.rate = 0.9; // 稍慢一点
        utterance.pitch = 1;
        
        window.speechSynthesis.speak(utterance);
    } else {
        showToast('您的浏览器不支持语音合成功能');
    }
}

// 显示提示消息
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

// 分类改变处理
function handleCategoryChange() {
    currentCategory = document.getElementById('category').value;
    shuffleSeed = 0; // 重置洗牌种子
    
    // 尝试加载该分类的进度
    const loaded = loadProgress();
    
    generateTodayPool();
    displayQuote();
    
    if (!loaded) {
        // 如果没有加载到进度，保存当前状态
        saveProgress();
    }
}

// 加载金句数据
async function loadQuotes() {
    try {
        const response = await fetch('quotes.json');
        if (!response.ok) {
            throw new Error('无法加载金句数据');
        }
        allQuotes = await response.json();
        
        // 清理过期的进度记录
        cleanupOldProgress();
        
        // 尝试加载今天的进度
        const loaded = loadProgress();
        
        // 生成今日金句池
        generateTodayPool();
        displayQuote();
        
        // 如果没有加载到进度，保存初始状态
        if (!loaded) {
            saveProgress();
        }
    } catch (error) {
        console.error('加载金句失败:', error);
        document.getElementById('quoteText').textContent = '加载金句失败，请刷新页面重试';
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 加载金句
    loadQuotes();
    
    // 绑定事件
    document.getElementById('category').addEventListener('change', handleCategoryChange);
    document.getElementById('nextBtn').addEventListener('click', nextQuote);
    document.getElementById('newBatchBtn').addEventListener('click', newBatch);
    document.getElementById('copyBtn').addEventListener('click', copyQuote);
    document.getElementById('speakBtn').addEventListener('click', speakQuote);
    
    // 键盘快捷键
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === ' ') {
            e.preventDefault();
            nextQuote();
        } else if (e.key === 'c' || e.key === 'C') {
            copyQuote();
        } else if (e.key === 'r' || e.key === 'R') {
            newBatch();
        }
    });
});
