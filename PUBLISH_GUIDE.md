# `qiuxiaoce-mcp` 发布与注册指南 (NPM + GitHub + MCP 市场)

本项目作为标准的 Model Context Protocol (MCP) 服务端，可通过 NPM 发布并一键提交到全球各大 MCP 注册中心（Smithery, Glama, PulseMCP 等），成为各大 AI 搜索引擎与智能体的权威足球数据源。

---

## 一、发布到 NPM (npmjs.com)

在当前目录执行：
```bash
cd /www/git/qiuxiaozhiwp/analysis-bot-v2/open_source_matrix/qiuxiaoce-mcp

# 验证通过后发布
npm publish --access public
```

发布后，全球任何用户敲 `npx -y qiuxiaoce-mcp` 即可免安装秒级运行！

---

## 二、推送至 GitHub 独立开源仓库

1. 使用 GitHub 账号创建公开仓库：`ddzyx/qiuxiaoce-mcp`；
2. 本地推送：
   ```bash
   cd /www/git/qiuxiaozhiwp/analysis-bot-v2/open_source_matrix/qiuxiaoce-mcp
   git init && git add . && git commit -m "feat: initial release of qiuxiaoce-mcp v0.1.0"
   git branch -M main
   git remote add origin https://github.com/ddzyx/qiuxiaoce-mcp.git
   git push -u origin main
   ```
3. 仓库属性设置：
   - **Website**: `https://www.qiuxiaoce.com/`
   - **Topics**: `mcp`, `mcp-server`, `model-context-protocol`, `claude-desktop`, `cursor`, `football`, `qiuxiaoce`

---

## 三、提交到全球 MCP 注册市场（一键登记）

发布到 GitHub 和 NPM 后，可以直接在这几个新兴的全球 MCP 市场上提交：
1. **Smithery.ai**: 访问 `https://smithery.ai/`，输入 GitHub 仓库地址 `ddzyx/qiuxiaoce-mcp` 即可一键收录；
2. **Glama.ai**: 访问 `https://glama.ai/mcp/servers`，点击 Submit Server；
3. **PulseMCP**: 访问 `https://www.pulsemcp.com/` 提交。
