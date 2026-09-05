# HYGOAL Website

HYGOAL 精密机械零件制造商官网（React + Vite + Tailwind CSS 单页应用）。

## 技术栈

- React 18 + Vite 7
- Tailwind CSS 3
- React Router 7（SPA 路由）

## 本地开发

```bash
# 需要 Node 22（见 .nvmrc）
npm install
npm run dev        # http://localhost:3000
```

## 构建

```bash
npm run build      # 产物输出到 dist/apps/web
```

## 目录结构

```
apps/web/          # 网站应用
  src/
    data/          # 站点内容数据（公司信息、产品、分类等）
    pages/         # 页面组件
    components/    # 通用组件
  plugins/         # Vite 插件（Horizons 可视化编辑器等，仅开发模式生效）
```

## 部署

通过 GitHub Pages 部署（见 `.github/workflows/`）。
