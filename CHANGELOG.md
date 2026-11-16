# Changelog

## 0.3.0 — 2026-11-16

- 新增实时同步文件夹：两台设备指向同一个 iCloud/OneDrive/Syncthing 文件夹，面板每 3 秒检查更新。
- 同步设置保存在 `~/.dsh/story-loom-sync.json`，重启后仍生效；可一键恢复默认位置。
- 新增「复制当前世界到这里 / 使用这里已有的数据」两种切换方式。
- 新增 `api/sync/config`、`api/sync/folder`、`api/sync/reset`。

## 0.2.0 — 2026-11-16

- 新增跨设备同步：导出/导入 `.storyloom.json`，包含当前世界、地图/图片、文风指南。
- 同步包不经过服务器，用户自己用 AirDrop/U 盘/私有云传输。
- 同名项目导入前自动备份；新项目直接加入 index。
- 新增 `storyctl sync export/import`。

## 0.1.1 — 2026-11-16

- 修复 Host 数据目录：从 DSH workspaceRegistry 解析工作区，不再依赖 Host 进程 cwd。
- 桌面端不再把空档案写到 `~/.dsh/profiles/desktop/story-loom`。
- 新增 `storyctl project`，可查看/修改当前世界基本信息。
- README 增加隐私说明：插件不收集、不上传作品数据。

## 0.1.0 — 2026-11-16

首个公开版本。

- 左侧栏「织世」只读故事档案，与学习插件同一列。
- 17 个默认板块：总览、设定集、规则、人物、势力、地点、地图、力量、能力、大纲、时间线、伏笔、章节档案、文风样本、名词表、备忘录、怪物图鉴。
- 连续性检查：断链、越阶、死者复现、伏笔逾期、时间线错位、大纲成环。
- 单章写作上下文：正典、人物、前情、伏笔、时间线、文风、警告。
- `storyctl` CLI：context / scan / ingest / check / add / update / export。
- `scan` 从正文粗筛候选坑，`ingest` 导入章节档案。
- 示例世界「雾港夜航」：46 个条目、地图、五阶力量体系，含两处演示用矛盾。
