#!/bin/bash

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 开始发布流程...${NC}"

# 检查是否在 develop 分支
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "develop" ]; then
    echo -e "${RED}❌ 错误：请确保你在 develop 分支上${NC}"
    exit 1
fi

# 检查工作目录是否干净
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${RED}❌ 错误：工作目录不干净，请先提交或暂存所有更改${NC}"
    exit 1
fi

# 获取当前版本
CURRENT_VERSION=$(grep '"version"' package.json | head -1 | sed 's/.*"version": "\(.*\)".*/\1/')
echo -e "${YELLOW}📝 当前版本: $CURRENT_VERSION${NC}"

# 输入新版本
read -p "请输入新版本号 (当前: $CURRENT_VERSION): " NEW_VERSION

if [ -z "$NEW_VERSION" ]; then
    echo -e "${RED}❌ 版本号不能为空${NC}"
    exit 1
fi

echo -e "${GREEN}🔄 更新版本到 $NEW_VERSION...${NC}"

# 更新 package.json 版本
sed -i.bak "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" package.json
rm package.json.bak

# 更新 tauri.conf.json 版本
sed -i.bak "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" src-tauri/tauri.conf.json
rm src-tauri/tauri.conf.json.bak

# 更新 Cargo.toml 版本
sed -i.bak "s/version = \"$CURRENT_VERSION\"/version = \"$NEW_VERSION\"/" src-tauri/Cargo.toml
rm src-tauri/Cargo.toml.bak

echo -e "${GREEN}✅ 版本已更新${NC}"

# 提交版本更改
git add package.json src-tauri/tauri.conf.json src-tauri/Cargo.toml src-tauri/Cargo.lock
git commit -m "chore: bump version to $NEW_VERSION"

echo -e "${GREEN}🔄 切换到 main 分支并合并 develop...${NC}"

# 切换到 main 分支
git checkout main
git pull origin main

# 合并 develop 分支
git merge develop --no-ff -m "feat: release version $NEW_VERSION"

# 推送到远程
git push origin main

echo -e "${GREEN}🏷️  创建并推送标签...${NC}"

# 创建标签
git tag -a "v$NEW_VERSION" -m "Release version $NEW_VERSION"
git push origin "v$NEW_VERSION"

echo -e "${GREEN}🔄 切换回 develop 分支...${NC}"

# 切换回 develop 分支
git checkout develop
git push origin develop

echo -e "${GREEN}🎉 发布完成！${NC}"
echo -e "${YELLOW}📋 接下来的步骤：${NC}"
echo -e "1. 检查 GitHub Actions 构建状态"
echo -e "2. 编辑 GitHub Release 页面的发布说明"
echo -e "3. 将 Release 从草稿状态发布"
echo -e ""
echo -e "${GREEN}🔗 GitHub Actions: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^.]*\).*/\1/')/actions${NC}"
echo -e "${GREEN}🔗 GitHub Releases: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^.]*\).*/\1/')/releases${NC}"
