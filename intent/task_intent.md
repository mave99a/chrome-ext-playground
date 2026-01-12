# Chrome Extension Demo - Task Intent

## 目标

创建一个 Chrome Extension demo，作为侧栏 (Side Panel) 存在，展示基本的扩展开发能力。

## 核心需求

### 1. 基础架构

- 使用 **Manifest V3**
- 扩展以 **Side Panel** 形式呈现（非 popup）
- 不依赖任何外部服务

### 2. 界面结构

侧栏包含 **3 个 Tab**：

| Tab | 内容 |
|-----|------|
| Home | 主功能区，包含 3 个操作按钮 |
| About | 扩展介绍信息 |
| Settings | 测试用的开关选项（Dark Mode、Notifications 等） |

### 3. Home Tab 功能按钮

#### 按钮 1: Open Team Portal
- 打开 `https://team.arcblock.io`
- 如果**当前窗口**已存在该站点的 tab，则切换到该 tab
- 如果不存在，创建新 tab
- 新创建的 tab 加入名为 **"demo"** 的 tab group（蓝色）

#### 按钮 2: Internal Demo Page
- 打开扩展内置的 demo 页面
- 同样逻辑：当前窗口已存在则切换，否则创建
- 新 tab 加入 "demo" group

#### 按钮 3: Current Tab Info
- 获取当前活动 tab 的页面信息
- 显示顺序（从上到下）：
  1. **选中内容**（如有，黄色高亮背景，限制 10k 字符）
  2. **页面内容**（文本形式，可滚动区域，限制 50k 字符）
  3. 标题 (Title)
  4. URL
  5. 语言 (Language)
  6. 字符集 (Character Set)
  7. 内容长度
  8. Meta 信息（description, keywords, author）
  9. 页面统计（links, images, scripts, forms, buttons, headings 数量）
  10. **截图**（页面可视区域，放在最底部）

### 4. Tab Group 管理

- 扩展创建的所有 tab 应加入同一个 group
- Group 名称: `demo`
- Group 颜色: `blue`
- 如果 group 已存在则复用，否则创建新 group

## 技术要点

### 权限配置 (manifest.json)

```json
{
  "permissions": [
    "sidePanel",
    "tabs",
    "tabGroups",
    "activeTab",
    "scripting",
    "storage"
  ],
  "host_permissions": [
    "<all_urls>"
  ]
}
```

### 关键 API 使用

| 功能 | API |
|------|-----|
| 侧栏 | `chrome.sidePanel` |
| Tab 查询/创建 | `chrome.tabs.query()`, `chrome.tabs.create()` |
| Tab Group | `chrome.tabs.group()`, `chrome.tabGroups.update()` |
| 页面截图 | `chrome.tabs.captureVisibleTab()` |
| 注入脚本获取页面信息 | `chrome.scripting.executeScript()` |
| 设置存储 | `chrome.storage.local` |

### 注意事项

1. **CSP 限制**: Manifest V3 不允许内联脚本
   - 所有 JS 必须放在独立的 `.js` 文件中
   - HTML 中不能使用 `onclick` 等内联事件，需用 `addEventListener`

2. **Tab 查询范围**: 使用 `currentWindow: true` 限制只在当前窗口查找
   ```javascript
   chrome.tabs.query({ url: 'https://example.com/*', currentWindow: true }, callback)
   ```

3. **截图权限**: `activeTab` 在 Side Panel 中不足以截图，需要 `<all_urls>` host permission

4. **Tab Group 查询**: 需指定 windowId
   ```javascript
   chrome.tabGroups.query({ title: 'demo', windowId: chrome.windows.WINDOW_ID_CURRENT })
   ```

5. **错误处理**: Tab 切换时需处理 tab 已不存在的情况，失败时创建新 tab

## 文件结构

```
chrome-ext/
├── README.md              # 项目说明
├── src/                   # 扩展源码（加载扩展时选择此目录）
│   ├── manifest.json      # 扩展配置
│   ├── background.js      # Service Worker
│   ├── sidepanel.html     # 侧栏主界面
│   ├── sidepanel.css      # 侧栏样式
│   ├── sidepanel.js       # 侧栏逻辑
│   ├── internal-page.html # 内置 demo 页面
│   └── internal-page.js   # 内置页面脚本
└── intent/                # 需求文档
    └── task_intent.md     # 本文件
```

## 验收标准

1. ✅ 点击扩展图标打开侧栏
2. ✅ 3 个 Tab 可正常切换
3. ✅ "Open Team Portal" 在当前窗口打开/切换 team.arcblock.io
4. ✅ "Internal Demo Page" 打开内置页面
5. ✅ "Current Tab Info" 显示页面元信息
6. ✅ "Current Tab Info" 显示页面文本内容（可滚动区域）
7. ✅ "Current Tab Info" 显示选中内容（如有，黄色高亮）
8. ✅ "Current Tab Info" 截图显示在最底部
9. ✅ 新创建的 tab 自动加入 "demo" group
10. ✅ Settings 开关可操作并持久化
11. ✅ 无外部依赖，完全离线可用
