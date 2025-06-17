# Vix 发布指南

本文档介绍如何发布 Vix 应用的新版本。

## 🛠️ 准备工作

### 1. GitHub 仓库设置

确保你的 GitHub 仓库已正确配置：

1. **权限设置**：进入 `Settings > Actions > General`
   - 将 `Workflow permissions` 设置为 `Read and write permissions`
   - 勾选 `Allow GitHub Actions to create and approve pull requests`

2. **分支保护**（可选但推荐）：
   - 设置 `main` 分支为受保护分支
   - 要求 PR 评审后才能合并

### 2. 本地环境

确保本地环境已安装：
- Git
- Node.js (推荐 LTS 版本)
- pnpm
- Rust 工具链

## 🚀 发布流程

### 方法一：使用自动化脚本（推荐）

1. **确保在 develop 分支**：
   ```bash
   git checkout develop
   git pull origin develop
   ```

2. **运行发布脚本**：
   ```bash
   ./scripts/release.sh
   ```

   脚本会自动：
   - 检查当前分支和工作目录状态
   - 提示输入新版本号
   - 更新所有配置文件的版本
   - 合并到 main 分支
   - 创建并推送版本标签
   - 触发 GitHub Actions 构建

### 方法二：手动发布

1. **更新版本号**：
   ```bash
   # 更新 package.json
   vim package.json

   # 更新 src-tauri/tauri.conf.json
   vim src-tauri/tauri.conf.json

   # 更新 src-tauri/Cargo.toml
   vim src-tauri/Cargo.toml
   ```

2. **提交更改**：
   ```bash
   git add .
   git commit -m "chore: bump version to 0.1.0"
   ```

3. **合并到 main 分支**：
   ```bash
   git checkout main
   git pull origin main
   git merge develop --no-ff -m "feat: release version 0.1.0"
   git push origin main
   ```

4. **创建版本标签**：
   ```bash
   git tag -a "v0.1.0" -m "Release version 0.1.0"
   git push origin "v0.1.0"
   ```

## 📦 GitHub Actions 工作流

### 构建工作流（`.github/workflows/build.yml`）

- **触发条件**：推送到 `develop` 或 `main` 分支，或创建 PR
- **功能**：测试在所有平台上的构建
- **平台**：macOS、Linux、Windows

### 发布工作流（`.github/workflows/release.yml`）

- **触发条件**：推送版本标签（如 `v0.1.0`）
- **功能**：构建并发布应用到 GitHub Releases
- **平台**：
  - macOS (Intel 和 Apple Silicon)
  - Linux (x64)
  - Windows (x64)

## 🔧 构建产物

发布工作流会生成以下文件：

### macOS
- `.dmg` - 磁盘镜像安装包
- `.app.tar.gz` - 应用程序包

### Windows
- `.msi` - Windows 安装程序
- `.exe` - NSIS 安装程序

### Linux
- `.deb` - Debian 包
- `.rpm` - Red Hat 包
- `.AppImage` - 便携式应用

## 📋 发布后检查清单

1. **检查 GitHub Actions**：
   - 访问 Actions 页面确认所有构建成功
   - 检查是否有任何错误或警告

2. **验证 Release**：
   - 确认 GitHub Release 页面有新版本
   - 检查所有平台的构建产物都已上传
   - 测试下载链接是否正常

3. **编辑 Release 说明**：
   - 添加版本更新日志
   - 描述新功能和修复的问题
   - 包含安装说明

4. **发布 Release**：
   - 将 Release 从草稿状态改为正式发布

## 🚨 故障排除

### 常见问题

1. **构建失败**：
   - 检查依赖是否正确安装
   - 确认 Rust 工具链版本兼容性
   - 查看 Actions 日志获取详细错误信息

2. **权限错误**：
   - 确认 GitHub Token 有写入权限
   - 检查仓库的 Actions 权限设置

3. **版本标签问题**：
   - 确保标签格式正确（v1.0.0）
   - 检查是否有重复的标签

### 获取帮助

如果遇到问题，可以：
1. 查看 GitHub Actions 日志
2. 检查 [Tauri 文档](https://tauri.app/)
3. 在项目 Issues 中搜索类似问题

## 📚 参考资源

- [Tauri GitHub Actions 指南](https://v2.tauri.app/distribute/pipelines/github/)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Semantic Versioning](https://semver.org/)
