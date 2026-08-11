# iamzifei.github.io/home

**中文** · [English](README.en.md)

我的个人主页：开源的 macOS 应用、Claude Code 技能，以及《搞到钱再说》。

🔗 **[在线访问](https://iamzifei.github.io/home/)**

## 这是什么

一个静态单页，把散在几十个仓库里的东西按用途归好类，配上简介和截图，
让人三十秒内知道我做了些什么、哪个对他有用。

- **中英双语**，右上角切换，默认中文，选择记在 `localStorage`
- **深浅色自适应**，跟随系统，没有写死任何一个颜色值
- **手机优先**，从 390px 到宽屏都验证过，无横向溢出
- **零依赖**，一个 HTML、一个数据文件、几张图，没有构建步骤
- Star 数在页面加载时从 GitHub API 拉一次实时刷新，请求失败就用文件里的兜底值

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
```

## 动效说明

滚动进入视口时淡入上移，同组元素之间有 60ms 的错峰，最多累计 6 个。
悬停时卡片轻微抬起、截图缓慢放大、箭头右移。

所有动效都在 `prefers-reduced-motion: reduce` 下完全关闭 —— 不是缩短时长，
是直接给到终态。开启「减弱动态效果」的人不该看到任何位移。

## 许可

页面代码 MIT。截图与文案版权归各自项目所有。
