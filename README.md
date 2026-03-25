# 🖼️ 去背景工具

基于 Next.js 14 + TypeScript + Tailwind CSS 的图片去背景工具。

## ✨ 特性

- 🚀 Next.js 14 App Router
- 📘 TypeScript 类型安全
- 🎨 Tailwind CSS 样式
- 🔒 **纯内存处理**，图片不落地磁盘
- 📥 直接下载处理后的图片
- 🔌 使用 remove.bg API

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 API Key

复制环境变量模板：

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入你的 remove.bg API Key：

```env
REMOVE_BG_API_KEY=your_api_key_here
```

> 💡 获取 API Key: https://www.remove.bg/api
> 
> 免费额度：每月 50 张标准质量图片

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 📦 构建生产版本

```bash
npm run build
npm start
```

## 📁 项目结构

```
remove-bg-tool/
├── app/
│   ├── page.tsx              # 主页面（上传 + 预览 + 下载）
│   ├── api/
│   │   └── remove-bg/
│   │       └── route.ts      # API 路由（调用 remove.bg）
│   ├── layout.tsx            # 布局
│   └── globals.css           # 全局样式
├── public/                   # 静态资源
├── .env.example              # 环境变量模板
├── .env                      # 环境变量（需自行创建）
├── next.config.js            # Next.js 配置
├── tailwind.config.ts        # Tailwind 配置
├── tsconfig.json             # TypeScript 配置
└── package.json              # 依赖管理
```

## 🔒 安全说明

- 图片仅在内存中处理，不会保存到服务器磁盘
- API Key 存储在服务器环境变量中，不暴露给前端
- 建议在生产环境使用 HTTPS

## 📝 使用说明

1. 点击或拖拽上传图片（支持 PNG, JPG, WEBP）
2. 点击"去除背景"按钮
3. 等待处理完成
4. 点击下载按钮保存处理后的图片

## ⚠️ 限制

- 单张图片最大 10MB
- 免费 API Key 每月 50 张标准质量图片
- 处理速度取决于图片大小和网络状况

## 📄 License

MIT
