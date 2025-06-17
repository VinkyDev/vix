<div align="center">
  <img src="src/assets/logo.png" alt="Vix Logo" width="128" height="128">
  <h1>Vix</h1>
  <p>一个基于 Tauri 2 的现代桌面 AI 聊天应用</p>
</div>

## 📖 项目介绍

Vix 是一个开源的 Tauri 桌面应用项目，旨在提供便捷的 AI 聊天体验。这是 MVP 版本，专注于实现核心的 AI 对话功能。

### ✨ 特性

- 📦 极小的包体积
- 🪄 丝滑唤出隐藏
- 🎨 现代化简洁UI
- ⚡ 快速响应体验
- 🔒 本地数据存储
- 🌐 跨平台支持


## 🚀 使用指南

### 下载安装

从 [Releases](https://github.com/VinkyDev/vix/releases) 页面下载适合您系统的安装包。

### macOS 用户注意事项

⚠️ **重要提醒**: 由于应用暂未进行数字签名，macOS 用户在首次运行时需要进行手动认证：

```bash
sudo xattr -rc /Applications/vix.app
```

执行此命令后即可正常使用应用。

### 基本使用

1. 启动应用
2. 配置您的 API 密钥
3. 开始与 AI 对话
4. 使用快捷键 `Option + Space` (macOS) 或 `Alt + Space` (Windows) 快速唤起或隐藏应用

## 🛠️ 开发指南

### 环境要求

- Node.js 18+
- pnpm
- Rust 工具链
- 系统依赖（根据平台而定）

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm tauri dev
```

### 构建应用

```bash
pnpm tauri build
```

## 🏗️ 技术栈

- **框架**: Tauri 2
- **前端**: React 18 + TypeScript
- **构建工具**: Vite
- **状态管理**: Zustand
- **UI 组件**: Ant Design (X)
- **样式**: Sass
- **路由**: React Router v7

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

