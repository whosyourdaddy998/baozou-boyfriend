# 暴走男朋友 3D 版

一个面向 GitHub Pages 的手机优先 3D 互动网页。  
当前版本基于 `Vite + React + React Three Fiber + Three.js + Drei + GSAP`，点击角色身体不同区域会触发不同动作、表情、文本和数值反馈。

## 当前能力

- Ready Player Me 角色加载，失败时自动切到本地占位 3D 角色
- `抚摸模式 / 暴揍模式` 双模式切换
- Raycaster 身体点击检测
- 7 个区域逻辑：头部、脸部、左右手、肩膀、身体、腿部
- 状态系统：`normal / happy / shy / angry / tired / annoyed`
- 连击衰减：`100 / 70 / 40 / 10 / 0`
- 3 秒内连点 5 次触发烦躁状态并锁区 5 秒
- 爱心值、好感值、求生值三套数值
- 隐藏结局保留展示但首版锁定

## 本地开发

```powershell
npm install
npm run dev -- --host
```

默认打开：

```text
http://127.0.0.1:5173
```

## 构建

```powershell
npm run build
```

构建产物输出到：

```text
dist/
```

## GitHub Pages

仓库已包含 GitHub Actions 部署工作流：

- 推送到 `main` 后自动执行构建
- 构建 `dist/`
- 通过 GitHub Pages Actions 部署

如果仓库还是旧的 Pages 分支模式，需要在 GitHub 仓库设置里改成：

```text
Settings -> Pages -> Source -> GitHub Actions
```

## Ready Player Me

默认角色地址写在前端配置里，也可以在页面设置区直接替换成你自己的 Ready Player Me `GLB` 地址。

## Mixamo 动画槽位

当前首版优先保证交互可玩，动作以程序化驱动为主。  
如果你要继续升级动作质量，把下列文件放到 `public/mixamo/` 即可接后续扩展：

- `Idle.fbx`
- `Shy.fbx`
- `Hit.fbx`
- `PushBack.fbx`
- `Wave.fbx`
- `Angry.fbx`
