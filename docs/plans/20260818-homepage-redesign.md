# 个人主页改版：jamesai.dev

status: in-progress
created: 2026-08-18

## Goal

把 https://zifei.info/home/ 改成一张顶级纸媒／时尚杂志质感的个人主页，
搬到新域名 jamesai.dev，加入 linktr.ee 上的全部链接（含 Telegram 群），
支持多语言、手机友好、加载快、动效克制优雅。

## 素材（实测抓取，不是猜的）

linktr.ee/jamesgong 的真实内容：

- Bio：全栈工程师。开过店，卖过房，创过业。现居悉尼 / 2024 年出海副业赚了点钱 /
  全职上班·咨询·独立开发同时进行
- **Telegram**：`https://t.me/+BA7dxgMiP6Q0OWI9` —— "James FYI · 关于我（含微信）"
- **小红书**：`https://www.xiaohongshu.com/user/profile/5af26425e8ac2b0a9bc030d2` —— 在悉尼和稀泥
- **X**：`https://x.com/JamesAI` —— 在悉尼和稀泥
- 产品：AI 内容写作自动化工作流（bit.ly/4bMfbZp）、
  《搞到钱再说》百万副业日记（bit.ly/4q46f5G）—— 两个都是 LemonSqueezy 结账页

## 设计方向

- **纸媒**：报头 + 细分隔线 + 编号栏目（01/02/03）+ 目录式链接索引，不用卡片和投影
- **字体**：衬线为主。拉丁走 ui-serif / New York / Charter，中文走 Songti SC /
  Source Han Serif；栈里拉丁在前中文在后，混排时各取各的字形
- **配色**：纸与墨。暖白 + 深墨 + 一点印泥红做强调，深色模式是暖黑不是冷黑
- **动效**：报头细线从 0 展开、正文分级淡入、hover 下划线从左生长；
  全部 respect prefers-reduced-motion

## 决策

- **多语言**：界面文案 + 个人叙述做 8 种（与三个 app 站一致）；
  **项目详情保持中英双语**，其他语言回落英文 —— 12 个项目 × 8 种语言的描述
  没人维护得动，而读者点进去看的是仓库本身
- 域名 jamesai.dev（与 X 账号 @JamesAI 对齐），由 James 购买
- 仍是零依赖单页 + data.js，GitHub Pages 托管（沿用 iamzifei/home 仓库）

## 阶段

- [ ] 阶段 1：重写 index.html（版式 + 动效 + 8 语言机制）
- [ ] 阶段 2：链接索引区（Telegram / 小红书 / X / GitHub / Ko-fi / 两个产品）
- [ ] 阶段 3：本地验证（375px 无横向溢出、无外部请求、逐语言检查）
- [ ] 阶段 4：域名 + CNAME + DNS + 上线验证

## HUMAN QUEUE

1. **买 jamesai.dev**（$9.99/年，Vercel Registrar 实测可注册）——
   MCP token 没有购买权限，你在 https://vercel.com/domains/search?q=jamesai.dev 下单，
   注册人信息可复用 memory 里那份。
