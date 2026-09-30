// 全局变量
let allQuotes = [];
let currentCategory = '全部';
let todayPool = [];
let currentIndex = 0;
let shuffleSeed = 0;

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
        return;
    }
    
    const quote = todayPool[currentIndex];
    document.getElementById('quoteText').textContent = quote.text;
    document.getElementById('quoteAuthor').textContent = quote.author ? `— ${quote.author}` : '';
    document.getElementById('quoteCategory').textContent = quote.category;
}

// 下一句
function nextQuote() {
    if (todayPool.length === 0) return;
    currentIndex = (currentIndex + 1) % todayPool.length;
    displayQuote();
}

// 再来一批
function newBatch() {
    shuffleSeed++;
    generateTodayPool();
    displayQuote();
}

// 复制到剪贴板
async function copyQuote() {
    const quote = todayPool[currentIndex];
    if (!quote) return;
    
    const text = quote.author 
        ? `${quote.text}\n— ${quote.author}`
        : quote.text;
    
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
    generateTodayPool();
    displayQuote();
}

// 加载金句数据
async function loadQuotes() {
    try {
        const response = await fetch('quotes.json');
        if (!response.ok) {
            throw new Error('无法加载金句数据');
        }
        allQuotes = await response.json();
        
        // 生成今日金句池
        generateTodayPool();
        displayQuote();
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
