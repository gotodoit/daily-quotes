# 📖 每日金句 - Daily Quotes

一个简洁优雅的每日金句静态网站，适合用于阅读、背诵和分享励志名言。

## ✨ 功能特点

- **日期稳定**：同一天显示相同的主要金句，基于日期哈希算法实现
- **分类筛选**：支持按类别（古文、励志、英语、全部）筛选金句
- **灵活切换**：
  - 🔄 换一句：浏览今天准备的其他金句
  - 🎲 再来一批：基于今日种子重新洗牌，获取新的金句序列
- **便捷操作**：
  - 📋 一键复制金句到剪贴板
  - 🔊 浏览器语音合成朗读功能（支持中英文）
  - ⌨️ 键盘快捷键支持
- **响应式设计**：完美适配手机、平板和桌面设备
- **纯静态**：无需后端，可直接部署到 GitHub Pages

## 🚀 本地使用

1. **直接打开**：
   ```bash
   # 直接在浏览器中打开 index.html
   open index.html  # macOS
   # 或者
   start index.html  # Windows
   # 或者
   xdg-open index.html  # Linux
   ```

2. **使用本地服务器**（推荐）：
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js (需要先安装 http-server)
   npx http-server
   
   # 然后在浏览器访问 http://localhost:8000
   ```

## 📝 自定义金句

编辑 `quotes.json` 文件来添加、修改或删除金句。

### 金句格式

```json
{
  "text": "金句内容",
  "author": "作者或出处（可选）",
  "category": "分类（如：古文、励志、英语等）"
}
```

### 示例

```json
{
  "text": "路漫漫其修远兮，吾将上下而求索。",
  "author": "屈原《离骚》",
  "category": "古文"
}
```

**注意事项**：
- `text` 字段必填
- `author` 字段可以为空字符串 `""`
- `category` 字段决定分类筛选，请保持一致的命名
- 如果添加新分类，需要在 `index.html` 中的 `<select>` 元素添加对应的 `<option>`

## 🌐 部署到 GitHub Pages

### 方法一：通过 GitHub 网页操作

1. 将代码推送到 GitHub 仓库
2. 进入仓库的 **Settings** 页面
3. 在左侧菜单找到 **Pages**
4. 在 **Build and deployment** 部分：
   - **Source** 选择 `Deploy from a branch`
   - **Branch** 选择 `main`，目录选择 `/ (root)`
   - 点击 **Save**
5. 等待几分钟后，访问 `https://你的用户名.github.io/仓库名/`

### 方法二：使用 GitHub Actions（自动部署）

本项目已包含 GitHub Actions 工作流配置文件（`.github/workflows/pages.yml`），推送到 `main` 分支后会自动部署。

确保在仓库设置中启用 GitHub Actions：
1. **Settings** → **Pages** → **Build and deployment**
2. **Source** 选择 `GitHub Actions`

## ⌨️ 键盘快捷键

- `→` 或 `Space`：下一句
- `C`：复制当前金句
- `R`：重新洗牌

## 📂 项目结构

```
.
├── index.html          # 主页面
├── style.css           # 样式文件
├── script.js           # JavaScript 逻辑
├── quotes.json         # 金句数据库（50条示例金句）
└── README.md           # 项目说明
```

## 🎨 技术栈

- 纯 HTML + CSS + JavaScript
- 无框架依赖
- 使用现代浏览器 API：
  - Clipboard API（复制功能）
  - Web Speech API（朗读功能）
  - Fetch API（加载数据）

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可

MIT License

---

**Enjoy your daily inspiration! 🌟**
