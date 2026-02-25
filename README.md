# Focus Companion（专注陪伴）

一个本地优先的专注陪伴应用，包含番茄钟、环境音效、植物成长、笔记、习惯追踪和学习统计。前端使用 React + Vite，数据默认保存在浏览器 `localStorage`。

## 功能概览

- 番茄钟（专注 / 休息切换）
- 场景化环境音与自定义混音
- 植物成长与进度反馈
- 学习笔记与标签
- 习惯追踪
- 学习统计与热力图
- 呼吸引导（休息时使用）

## 技术栈

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- Three.js
- Express（用于生产环境静态文件服务）

## 项目结构

```text
focus-companion/
├─ client/                 # 前端应用（Vite）
│  ├─ public/
│  │  └─ assets/           # 本地静态图片资源（已移除外链依赖）
│  └─ src/
├─ server/                 # 生产环境静态服务
├─ shared/                 # 共享常量 / 类型
├─ package.json
└─ README.md
```


## 本地快速部署（脚本）

### Windows（开发模式）
```bat
scripts\dev-local.bat
```

### macOS / Linux（开发模式）
```bash
bash scripts/dev-local.sh
```

脚本会自动检查 npm 是否安装，安装依赖并启动开发服务器，且会自动打开浏览器。

## 本地浏览效果（生产模式预览）

### Windows
```bat
scripts\preview-local.bat
```

### macOS / Linux
```bash
bash scripts/preview-local.sh
```

脚本会自动检查 npm 是否安装，执行构建并启动本地生产服务，浏览器访问 `http://localhost:3000`。

## 本地部署指南

### 1) 环境要求

- Node.js 22 或更高版本
### 2) 安装依赖

在项目根目录执行：

```bash
npm install
```

### 3) 启动开发环境

```bash
npm run dev
```

默认会启动 Vite 开发服务器（通常为 `http://localhost:3000`，如果端口占用会自动尝试下一个可用端口）。

### 4) 类型检查

```bash
npm run check
```

### 5) 构建生产版本

```bash
npm run build
```

构建产物会输出到：

- `dist/public/`（前端静态资源）
- `dist/index.js`（Node 服务入口）

### 6) 启动生产服务（本地）

```bash
npm start
```

默认监听 `3000` 端口。可通过环境变量指定端口：

```bash
# Windows
set PORT=8080 && npm start

# macOS/Linux
PORT=8080 npm start
```

## 数据存储说明

应用数据保存在浏览器本地 `localStorage`，包括：

- 专注时长与连续天数
- 植物成长进度
- 笔记与习惯数据
- 音效配置

不会默认上传到外部服务。

## 静态资源说明

本仓库已将运行所需图片资源改为本地文件（位于 `client/public/assets/`），不依赖外部图片链接。页面字体使用系统字体栈，避免运行时拉取外部字体文件。

## 常见问题

### 开发环境端口不是 3000

`vite.config.ts` 配置为优先使用 `3000`；如果被占用，Vite 会自动选择其他端口。终端输出会显示实际端口。

### 生产启动后页面空白

请先确认已经执行过：

```bash
pnpm build
```

并且当前目录为项目根目录，再执行：

```bash
pnpm start
```

## License

MIT
