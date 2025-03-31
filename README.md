# SQL 格式化与压缩工具

一个基于 Web 的 SQL 格式化、压缩和对比工具。

[![Deploy to Cloudflare Pages](https://img.shields.io/badge/Deploy%20to%20Cloudflare%20Pages-F68200?style=for-the-badge&logo=cloudflare&logoColor=white)](https://dash.cloudflare.com/?to=/:account/pages/new/connect-your-repo)

## 功能特点

- SQL 格式化：支持多种 SQL 方言
- SQL 压缩：智能压缩 SQL 语句，保持关键字
- 文本对比：支持文本和十六进制对比
- 实时预览
- 一键复制结果

## 支持的 SQL 方言

- MySQL
- SQLite
- Standard SQL
- MariaDB
- PostgreSQL
- MS SQL Server (TSQL)
- Oracle PL/SQL

## 使用方法

1. 选择 SQL 方言
2. 在输入框中粘贴或输入 SQL 语句
3. 点击"格式化"或"压缩"按钮
4. 查看结果并复制

## 文本对比功能

1. 切换到"文本对比"标签
2. 在左侧输入原始文本
3. 在右侧输入需要对比的文本
4. 点击"对比"按钮查看差异
5. 可以切换查看文本或十六进制格式

## 技术栈

- HTML5
- CSS3
- JavaScript
- SQL Formatter
- Highlight.js

## 在线使用

访问 [https://sql-format.pages.dev](https://sql-format.pages.dev) 使用在线版本。

## 本地开发

1. 克隆仓库
2. 使用浏览器打开 `code.html` 文件
3. 开始使用

## 部署到 Cloudflare Pages

### 方法一：一键部署（推荐）

1. 点击上方的 [![Deploy to Cloudflare Pages](https://img.shields.io/badge/Deploy%20to%20Cloudflare%20Pages-F68200?style=for-the-badge&logo=cloudflare&logoColor=white)](https://dash.cloudflare.com/?to=/:account/pages/new/connect-your-repo) 按钮
2. 登录你的 Cloudflare 账户
3. 选择你的 Git 仓库（GitHub/GitLab/Bitbucket）
4. 选择此项目仓库
5. 点击 "Deploy"

### 方法二：手动部署

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 "Pages" 部分
3. 点击 "Create a project"
4. 选择 "Connect to Git"
5. 选择你的 Git 仓库
6. 选择此项目仓库
7. 配置构建设置：
   - Framework preset: None
   - Build command: 留空
   - Build output directory: ./
   - Root directory: ./
8. 点击 "Save and Deploy"

### 自定义域名（可选）

1. 在 Cloudflare Pages 项目设置中
2. 找到 "Custom domains" 部分
3. 点击 "Set up a custom domain"
4. 按照向导完成域名配置

## 许可证

MIT License 