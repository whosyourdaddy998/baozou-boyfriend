import { useEffect, useMemo, useState } from "react";
import CharacterScene from "./components/CharacterScene";
import { MODE, STATUS, areaConfigs, defaultReadyPlayerMeUrl, mixamoSlots, unlockGoals } from "./config/gameConfig";
import { applyInteraction, getNextUnlockLabel, initialGameState } from "./lib/gameState";
import { loadStorage, saveStorage } from "./lib/storage";

function formatStatus(status) {
  const labels = {
    [STATUS.NORMAL]: "平静",
    [STATUS.HAPPY]: "开心",
    [STATUS.SHY]: "害羞",
    [STATUS.ANGRY]: "生气",
    [STATUS.TIRED]: "疲惫",
    [STATUS.ANNOYED]: "烦躁"
  };

  return labels[status] || "平静";
}

function formatArea(areaId) {
  return areaConfigs[areaId]?.label || "未知区域";
}

function DeltaPill({ label, value, tone }) {
  if (!value) {
    return null;
  }

  const prefix = value > 0 ? "+" : "";
  return (
    <span className={`delta-pill delta-${tone}`}>
      {label} {prefix}
      {value}
    </span>
  );
}

export default function App() {
  const [gameState, setGameState] = useState(() => loadStorage(initialGameState));
  const [interactionEffect, setInteractionEffect] = useState(null);
  const [bubbleVisible, setBubbleVisible] = useState(true);
  const [deltaVisible, setDeltaVisible] = useState(false);
  const [loadState, setLoadState] = useState("loading");
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [activePanel, setActivePanel] = useState("record");

  useEffect(() => {
    saveStorage(gameState);
  }, [gameState]);

  useEffect(() => {
    if (!interactionEffect) {
      return undefined;
    }

    setBubbleVisible(false);
    setDeltaVisible(false);

    const timers = [
      window.setTimeout(() => setBubbleVisible(true), 250),
      window.setTimeout(() => setDeltaVisible(true), 450),
      window.setTimeout(() => setInteractionEffect(null), 1200),
      window.setTimeout(() => setBubbleVisible(true), 1200),
      window.setTimeout(() => setDeltaVisible(false), 1200)
    ];

    return () => timers.forEach(window.clearTimeout);
  }, [interactionEffect]);

  function handleModeChange(mode) {
    setGameState((current) => ({
      ...current,
      mode,
      speech:
        mode === MODE.CARE
          ? "轻一点，先试试安抚他。"
          : "现在切到暴揍模式，小心别点太疯。"
    }));
  }

  function handleAvatarHit(areaId) {
    const { state, effect } = applyInteraction(gameState, areaId);
    setGameState(state);
    setInteractionEffect(effect);
  }

  function handleReset() {
    setGameState({
      ...initialGameState,
      settings: {
        ...initialGameState.settings,
        avatarUrl: gameState.settings.avatarUrl || defaultReadyPlayerMeUrl,
        boyfriendName: gameState.settings.boyfriendName || "暴走男朋友"
      }
    });
  }

  const statusLabel = formatStatus(gameState.status);
  const areaLabel = formatArea(gameState.lastAreaId);
  const nextUnlock = getNextUnlockLabel(gameState);
  const unlockCount = `${gameState.unlockedContentCount} / ${unlockGoals.length}`;
  const hiddenEndingText = gameState.hiddenEndingLocked ? "后续版本开放" : "可触发";
  const avatarUrl = gameState.settings.avatarUrl || defaultReadyPlayerMeUrl;
  const boyfriendName = gameState.settings.boyfriendName || "暴走男朋友";

  const panelClass = useMemo(
    () => `drawer-panel ${drawerOpen ? "is-open" : "is-closed"} panel-${activePanel}`,
    [activePanel, drawerOpen]
  );

  return (
    <div className={`app-shell mode-${gameState.mode}`}>
      <header className="top-bar">
        <div>
          <p className="eyebrow">3D Touch Drama</p>
          <h1>{boyfriendName}</h1>
        </div>
        <button className="ghost-button" type="button" onClick={() => setDrawerOpen((value) => !value)}>
          {drawerOpen ? "收起面板" : "展开面板"}
        </button>
      </header>

      <main className="stage-layout">
        <section className="scene-card">
          <div className="resource-strip">
            <div className="mode-switch">
              <button
                className={`mode-button ${gameState.mode === MODE.CARE ? "is-active" : ""}`}
                type="button"
                onClick={() => handleModeChange(MODE.CARE)}
              >
                抚摸模式
              </button>
              <button
                className={`mode-button ${gameState.mode === MODE.RAGE ? "is-active" : ""}`}
                type="button"
                onClick={() => handleModeChange(MODE.RAGE)}
              >
                暴揍模式
              </button>
            </div>
            <div className="pill-row">
              <span className="resource-pill">
                爱心值 <strong>{gameState.heart}</strong>
              </span>
              <span className="resource-pill">
                好感值 <strong>{gameState.affection}</strong>
              </span>
              <span className="resource-pill">
                求生值 <strong>{gameState.survival}</strong>
              </span>
              <span className="resource-pill">
                解锁 <strong>{unlockCount}</strong>
              </span>
            </div>
          </div>

          <div className="scene-wrap">
            <CharacterScene
              avatarUrl={avatarUrl}
              currentMode={gameState.mode}
              status={gameState.status}
              onHit={handleAvatarHit}
              interactionEffect={interactionEffect}
              onLoadStateChange={setLoadState}
            />
            <div className="scene-overlay">
              <div className="speech-box">
                <span className="speech-tag">{bubbleVisible ? "实时反应" : "动作中..."}</span>
                <p>{bubbleVisible ? gameState.speech : "..."}</p>
              </div>

              <div className="delta-stack">
                {deltaVisible && interactionEffect ? (
                  <>
                    <DeltaPill label="好感" value={interactionEffect.affectionDelta} tone="affection" />
                    <DeltaPill label="爱心" value={interactionEffect.heartDelta} tone="heart" />
                    <DeltaPill label="求生" value={interactionEffect.survivalDelta} tone="survival" />
                  </>
                ) : null}
              </div>

              <div className="status-grid">
                <article className="stat-card">
                  <span>当前状态</span>
                  <strong>{statusLabel}</strong>
                </article>
                <article className="stat-card">
                  <span>刚刚点击</span>
                  <strong>{areaLabel}</strong>
                </article>
                <article className="stat-card">
                  <span>模型状态</span>
                  <strong>{loadState === "ready" ? "Ready Player Me" : loadState === "fallback" ? "占位角色" : "加载中"}</strong>
                </article>
                <article className="stat-card">
                  <span>隐藏结局</span>
                  <strong>{hiddenEndingText}</strong>
                </article>
              </div>
            </div>
          </div>
        </section>

        <section className={panelClass}>
          <nav className="drawer-tabs" aria-label="3D 控制面板">
            <button className={activePanel === "record" ? "is-active" : ""} type="button" onClick={() => setActivePanel("record")}>
              记录
            </button>
            <button className={activePanel === "guide" ? "is-active" : ""} type="button" onClick={() => setActivePanel("guide")}>
              指南
            </button>
            <button className={activePanel === "settings" ? "is-active" : ""} type="button" onClick={() => setActivePanel("settings")}>
              设置
            </button>
          </nav>

          {activePanel === "record" ? (
            <div className="panel-content">
              <div className="card-grid">
                <article className="mini-card">
                  <span>总互动</span>
                  <strong>{gameState.totalInteractions}</strong>
                </article>
                <article className="mini-card">
                  <span>正确互动</span>
                  <strong>{gameState.metrics.correctHits}</strong>
                </article>
                <article className="mini-card">
                  <span>抚摸次数</span>
                  <strong>{gameState.metrics.careHits}</strong>
                </article>
                <article className="mini-card">
                  <span>暴揍次数</span>
                  <strong>{gameState.metrics.rageHits}</strong>
                </article>
              </div>

              <div className="tips-block">
                <h2>当前节奏</h2>
                <p>同一区域连续点击会衰减为 100% / 70% / 40% / 10% / 0%，三秒内连点五次会进入烦躁冷却。</p>
              </div>

              <div className="tips-block">
                <h2>下一个目标</h2>
                <p>{nextUnlock}</p>
              </div>
            </div>
          ) : null}

          {activePanel === "guide" ? (
            <div className="panel-content">
              <div className="tips-block">
                <h2>点击规则</h2>
                <p>手机和桌面都直接点角色本体。抚摸模式优先点头、脸、肩膀和手；暴揍模式优先点身体、脸、腿和手。</p>
              </div>
              <div className="tips-block">
                <h2>为什么有时没收益</h2>
                <p>如果你连续点同一个地方，收益会递减；被点烦之后，他会进入 5 秒烦躁状态，直接拒绝互动。</p>
              </div>
              <div className="tips-block">
                <h2>隐藏结局</h2>
                <p>3D 首版先锁住隐藏结局，只展示为“后续版本开放”，避免现在几分钟内误通关。</p>
              </div>
            </div>
          ) : null}

          {activePanel === "settings" ? (
            <div className="panel-content">
              <label className="field">
                <span>角色名字</span>
                <input
                  type="text"
                  maxLength={16}
                  value={boyfriendName}
                  onChange={(event) =>
                    setGameState((current) => ({
                      ...current,
                      settings: {
                        ...current.settings,
                        boyfriendName: event.target.value
                      }
                    }))
                  }
                />
              </label>

              <label className="field">
                <span>Ready Player Me GLB 地址</span>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(event) =>
                    setGameState((current) => ({
                      ...current,
                      settings: {
                        ...current.settings,
                        avatarUrl: event.target.value
                      }
                    }))
                  }
                />
              </label>

              <div className="tips-block">
                <h2>首版说明</h2>
                <p>
                  旧版 2D 存档不会迁移。Mixamo 动画槽位已经预留，当前工程会使用程序化动画先把交互跑通；
                  如果后续把 {mixamoSlots.length} 个 FBX 文件放进 `/public/mixamo`，就能继续升级动作质量。
                </p>
              </div>

              <button className="danger-button" type="button" onClick={handleReset}>
                重置 3D 新档
              </button>
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}
