# 暴走男朋友 3D 版

一个部署在 GitHub Pages 上、面向手机优先的 3D 互动网页。  
当前版本基于 `Vite + React + React Three Fiber + Three.js + Drei + GSAP`，点击角色身体不同区域会触发不同动作、表情、文本和数值反馈。

## 当前能力

- 默认使用仓库内置本地 `GLB` 模型，不再依赖外链角色才能首屏显示
- 手机端优先走轻量 3D 渲染，失败时自动降级为非 WebGL 的轻量互动角色
- `抚摸模式 / 暴揍模式` 双模式切换
- 7 个点击区域：头部、脸部、左右手、肩膀、身体、腿部
- 状态系统：`normal / happy / shy / angry / tired / annoyed`
- 连击衰减：`100 / 70 / 40 / 10 / 0`
- 3 秒内连点同一区域 5 次触发烦躁状态并锁区 5 秒
- 爱心值、好感值、求生值三套数值
- 隐藏结局继续保留展示，但首版锁定不开放

## 本地开发

```powershell
npm install
npm run dev -- --host
```

默认地址：

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

- 推送到 `main` 后自动构建
- 输出 `dist/`
- 通过 GitHub Pages Actions 部署

如果仓库仍是旧的 Pages 分支模式，需要在 GitHub 仓库设置里改成：

```text
Settings -> Pages -> Source -> GitHub Actions
```

## 模型资源

默认模型位置：

```text
public/models/default-boyfriend.glb
```

页面设置区仍保留“自定义 GLB 地址”入口，但默认使用本地模型，保证手机端首屏更稳。

## Mixamo 动画槽位

当前版本优先保证点击反馈、表情时序和移动端稳定性，动作主要仍以程序化驱动为主。  
如果后续要继续升级动作质量，把这些文件放到 `public/mixamo/` 即可继续扩展：

- `Idle.fbx`
- `Shy.fbx`
- `Hit.fbx`
- `PushBack.fbx`
- `Wave.fbx`
- `Angry.fbx`
