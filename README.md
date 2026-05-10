# Pianotes / 练琴手记

浏览器里的练琴日程与打卡手记：**分段路线、今日练习视图、进度热力图、按标签汇总的已学曲目**。界面中英文可切换，数据仅存本机。

## 作者

Zimo Gao

## 技术栈

- [Vite](https://vitejs.dev/) + [React](https://react.dev/) 18
- [lucide-react](https://lucide.dev/) 图标
- 无后端；持久化见 `src/storage.js`（`localStorage`，键前缀 `piano_storage_`）

## 本地运行

需要 Node.js 18+（或与你环境匹配的当前 LTS）。

```bash
npm install
npm run dev
```

默认开发地址：<http://127.0.0.1:5173/>（端口以终端输出为准）。

Safari **添加到主屏幕** 使用的图标是 `public/apple-touch-icon.png`（由 `favicon.svg` 导出）。若你更新了 SVG，可执行 `npm run icons` 重新生成。

```bash
npm run build    # 产出 dist/
npm run preview # 本地预览生产构建
```

## 数据与备份

- 练习起点、顺延天数、分段计划、打卡记录、主题与语言等均写入浏览器本地存储。
- **计划**页支持导出 / 导入备份（`.txt` JSON）及粘贴导入；存档格式说明见应用内「导出存档模板」。

## 目录简述

| 路径 | 说明 |
|------|------|
| `src/PianoApp.jsx` | 壳层：持久化、Tab、弹窗 |
| `src/piano/screens/` | 今日 / 进度 / 计划 与分段编辑器 |
| `src/locales/` | 中文 `zh.js`、英文 `en.js` |
| `src/piano/archive.js` | 备份 JSON 序列化与校验 |

## 许可证

私有项目（`package.json` 中 `"private": true`）；如需开源请自行补充 LICENSE。
