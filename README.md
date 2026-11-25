# jamesai.dev

**中文** · [English](README.en.md)

我的个人主页：开源的 macOS 应用、Claude Code 技能，以及《搞到钱再说》。

🔗 **[在线访问](https://jamesai.dev)**

## 这是什么

一个静态单页，把散在几十个仓库里的东西按用途归好类，配上简介和截图，
让人三十秒内知道我做了些什么、哪个对他有用。

- **中英双语**，右上角切换，默认中文，选择记在 `localStorage`
- **深浅色自适应**，跟随系统，没有写死任何一个颜色值
- **手机优先**，从 390px 到宽屏都验证过，无横向溢出
- **零依赖**，一个 HTML、一个数据文件、几张图，没有构建步骤
- Star 数在页面加载时从 GitHub API 拉一次实时刷新，请求失败就用文件里的兜底值

## 六个 Mac 应用，都能用 Homebrew 装

```bash
brew install --cask iamzifei/tap/clipstack     # 剪贴板历史 · macOS 13+
brew install --cask iamzifei/tap/candela       # 显示器控制 · macOS 26+
brew install --cask iamzifei/tap/audioswitch   # 音频设备切换 · macOS 14+
brew install --cask iamzifei/tap/veil          # 只让当前窗口清晰 · macOS 14+
brew install --cask iamzifei/tap/tapper        # 敲黑板，指针变手套 · macOS 14+
brew install --cask iamzifei/tap/inkstone      # Markdown 笔记 · macOS 26+
```

每个应用的详情页（`product.html?p=<仓库名>`）也有这条命令，带复制按钮；命令写在
[`data.js`](data.js) 每个应用的 `brew` 字段里。

## 改内容

项目清单在 [`data.js`](data.js)，加一个项目就是加一个对象：

```js
{
  repo: "your-repo",              // GitHub 仓库名，链接由它生成
  name: { zh: "中文名", en: "English name" },   // 两边同名时写一个字符串即可
  stars: 0,                       // 兜底值，线上会被实时数据覆盖
  shot: "assets/xxx.jpg",         // 仅 featured 分类需要，16:10
  tagline: { zh: "一句话", en: "One line" },
  desc: { zh: "两三句", en: "Two or three sentences" },
}
```

分类里带 `featured: true` 的会用大截图卡片，其余用紧凑的文字卡片。
页面文案（标题、按钮、footer）在 `index.html` 顶部的 `COPY` 对象里。

### 截图规范

featured 卡片的图按 **16:10** 裁切（`object-fit: cover`）。仓库里的原始截图
比例各不相同，统一合成过一遍，命令见 [`scripts/make-cards.py`](scripts/make-cards.py)：

```bash
python3 scripts/make-cards.py
```

它把任意比例的截图放到 1600×1000 的渐变背景上居中，加一层投影，
这样竖版面板和横版窗口并排时高度一致、观感统一。

## /mac：大家真正在用的 Mac 软件

[jamesai.dev/mac](https://jamesai.dev/mac/) 是一个推荐站：每个人一页，推荐的分量来自
macOS Spotlight 记下的真实打开次数（以诚实为准，不做第三方验证）。

- **任何人一站式发布**：`curl -fsSL https://jamesai.dev/mac/scan.py | python3` → 浏览器里勾选 → 点「发布」→ 自动跳到自己的页面。不用注册；编辑密钥存在本机 `~/.config/jamesai/mac.json`，再跑一次就是更新
- **数据**：每人资料和排行在 Vercel Blob（`u/<名字>.json`、`index.json`），由 `mac-api/`（Vercel 项目 `orris/jamesai-mac-api`）写入；页面直接从 Blob 读
- **共享资料**（官网、价格、简介、图标）：`mac/prices.json` + `scripts/build-mac-apps.py` → `mac/catalog.json`；联盟链接写在 `prices.json` 的 `ref` 字段
- **管理**：`python3 scripts/mac-admin.py list | delete <名字> | reindex`
- **我自己那页**：`python3 scripts/build-mac-apps.py`（顺带重建 catalog，然后 commit + push）
- **部署 API**：`cd mac-api && vercel deploy --prod --scope orris`
- **测试**：`python3 -m unittest discover -s tests`

## 本地预览

```bash
python3 -m http.server 8899
# 打开 http://localhost:8899
```

改完直接刷新，没有构建。

## 结构

```
index.html    页面本体：样式、文案、渲染逻辑、滚动动效
data.js       项目清单（分类 → 条目）
assets/       截图与图标
scripts/      截图合成脚本
sitemap.xml   全站页面清单（含 /veil/ /tapper/ 和各详情页），新增公开页面时同步
robots.txt    允许所有爬虫，含 AI 搜索爬虫
llms.txt      给 AI 助手读的站点说明：每个应用一句话、官网和 brew 命令
```

## 排版

中英混排是这页最花心思的部分。

**两套字体，各司其职。** 拉丁字体排在前、中文字体排在后，让每种文字由为它设计的
字体来渲染——这是混排的标准做法，写反了会让中文去凑合英文字体的兜底字形。
标题用衬线（macOS 上是 New York + 宋体），正文与界面用无衬线。

**字距要分开调。** 拉丁标题收紧（-0.022em）显得挺拔，中文标题反而要放松
（+0.03em）——宋体挤在一起会闷。同一条 CSS 规则套两种文字，必有一方难看。

**行高按中文定。** 1.78 而不是英文常用的 1.5：汉字撑满字身框，密度更高，
行距不够就糊成一片。

**行宽按字数定。** 正文限 34em 而不是英文的 60–75 字符——中文单字信息量约是
英文单词的两倍，同样字符数的一行读起来长得多。

**中英之间的空隙**交给 `text-autospace: normal`（CSS Text 4，Chrome 已支持）
自动插入，不再手动敲空格；不支持的浏览器退回到文案里本来就写好的半角空格。

**色彩取纸与墨。** 底色是带暖度的宣纸白 `#faf8f4`，不是纯白；深色模式是
`#12110f` 的夜墨，也不是纯黑。强调色用黛青 `#35566b`——宋瓷的那种蓝灰，
而不是饱和的界面蓝。留白给得比一般落地页更多，让版面自己呼吸。

## 动效说明

滚动进入视口时淡入上移，同组元素之间有 60ms 的错峰，最多累计 6 个。
悬停时卡片轻微抬起、截图缓慢放大、箭头右移。

所有动效都在 `prefers-reduced-motion: reduce` 下完全关闭 —— 不是缩短时长，
是直接给到终态。开启「减弱动态效果」的人不该看到任何位移。

## 许可

页面代码 MIT。截图与文案版权归各自项目所有。
