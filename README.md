# Vix

> 一个基于 Tauri 2 的现代桌面 AI 聊天应用

## 📖 项目介绍

Vix 是一个开源的 Tauri 桌面应用项目，旨在提供便捷的 AI 聊天体验。这是 MVP 版本，专注于实现核心的 AI 对话功能。

### ✨ 主要功能

- 🤖 AI 聊天对话
- 🎨 现代化界面设计
- ⚡ 快速响应体验
- 🔒 本地数据存储
- 🌐 跨平台支持

## 🚀 快速开始

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

## 📦 发布

我们使用 GitHub Actions 自动构建和发布应用。

### 自动发布

1. 运行发布脚本：
   ```bash
   ./scripts/release.sh
   ```

2. 或者手动创建版本标签：
   ```bash
   git tag -a "v0.1.0" -m "Release version 0.1.0"
   git push origin "v0.1.0"
   ```

详细的发布流程请参考 [RELEASE.md](./RELEASE.md)。

## 🏗️ 技术栈

- **框架**: Tauri 2
- **前端**: React 18 + TypeScript
- **构建工具**: Vite
- **状态管理**: Zustand
- **UI 组件**: Ant Design
- **样式**: Sass
- **路由**: React Router v7

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🤝 贡献

欢迎贡献代码！请查看我们的贡献指南。

## 📞 联系

如有问题或建议，请通过 Issues 联系我们。

