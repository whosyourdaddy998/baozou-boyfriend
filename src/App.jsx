import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CharacterScene from "./components/CharacterScene";
import {
  LOAD_STATE,
  MODE,
  RENDER_MODE,
  STATUS,
  areaConfigs,
  defaultLocalAvatarPath,
  mixamoSlots,
  unlockGoals
} from "./config/gameConfig";
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

function formatRenderMode(renderMode) {
  const labels = {
    [RENDER_MODE.FULL_3D]: "完整 3D",
    [RENDER_MODE.LITE_3D]: "手机 Q 版 3D",
    [RENDER_MODE.FALLBACK_2D]: "降级互动"
  };
  return labels[renderMode] || "手机 Q 版 3D";
}

function isSmallScreen() {
  if (typeof window === "undefined") {
    return false;
  }
  return window.matchMedia("(max-width: 720px)").matches;
}

function getImpactWords(effect) {
  if (!effect) {
    return ["", "", ""];
  }
  if (effect.blocked || effect.status === STATUS.ANNOYED) {
    return ["拒绝", "炸毛", "冷却中"];
  }
  if (effect.mode === MODE.CARE) {
    const map = {
      head: ["摸摸", "心软", "+乖巧"],
      face: ["脸红", "咻", "害羞暴击"],
      handLeft: ["牵手", "贴贴", "安心"],
      handRight: ["牵手", "贴贴", "安心"],
      shoulder: ["放松", "呼", "安抚成功"],
      body: ["警惕", "退退", "换个地方"],
      leg: ["躲开", "痒", "别闹"]
    };
    return map[effect.areaId] || ["贴贴", "心软", "哄好"];
  }

  const map = {
    head: ["咚", "脑袋警报", "嗷"],
    face: ["啪", "无语", "脸部抗议"],
    handLeft: ["甩开", "别拽", "哼"],
    handRight: ["挡开", "别拽", "哼"],
    shoulder: ["拍肩", "累了", "别敲"],
    body: ["轰", "防御", "求生警报"],
    leg: ["闪避", "跑路", "抗议"]
  };
  return map[effect.areaId] || ["砰", "爆炸", "抗议"];
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

function ImpactLayer({ effect }) {
  const words = getImpactWords(effect);

  return (
    <div className={`impact-layer ${effect ? "is-active" : ""}`} aria-hidden="true">
      <span className="impact-word impact-main">{words[0]}</span>
      <span className="impact-word impact-side-a">{words[1]}</span>
      <span className="impact-word impact-side-b">{words[2]}</span>
      <span className="impact-ring ring-a"></span>
      <span className="impact-ring ring-b"></span>
      <span className="impact-spark spark-a"></span>
      <span className="impact-spark spark-b"></span>
      <span className="impact-spark spark-c"></span>
    </div>
  );
}

function useTimedFeedback(gameState) {
  const timersRef = useRef([]);
  const [displaySpeech, setDisplaySpeech] = useState(gameState.speech);
  const [displayStatus, setDisplayStatus] = useState(gameState.status);
  const [speechTone, setSpeechTone] = useState("idle");
  const [deltaVisible, setDeltaVisible] = useState(false);
  const [pendingEffect, setPendingEffect] = useState(null);

  useEffect(() => {
    return () => {
      timersRef.current.forEach(window.clearTimeout);
    };
  }, []);

  function clearTimers() {
    timersRef.current.forEach(window.clearTimeout);
    timersRef.current = [];
  }

  function stageInteraction(effect, nextState) {
    clearTimers();
    setPendingEffect(effect);
    setDeltaVisible(false);
    setSpeechTone("idle");

    timersRef.current.push(
      window.setTimeout(() => {
        setDisplayStatus(effect.status);
      }, 120)
    );
    timersRef.current.push(
      window.setTimeout(() => {
        setDisplaySpeech(effect.speech);
        setSpeechTone(effect.speechTone || "idle");
      }, 250)
    );
    timersRef.current.push(
      window.setTimeout(() => {
        setDeltaVisible(true);
      }, 450)
    );
    timersRef.current.push(
      window.setTimeout(() => {
        setPendingEffect(null);
        setDeltaVisible(false);
        setDisplayStatus(nextState.status);
      }, 1200)
    );
  }

  function syncFromState(nextState) {
    clearTimers();
    setDisplaySpeech(nextState.speech);
    setDisplayStatus(nextState.status);
    setSpeechTone("idle");
    setPendingEffect(null);
    setDeltaVisible(false);
  }

  return {
    displaySpeech,
    displayStatus,
    speechTone,
    deltaVisible,
    pendingEffect,
    stageInteraction,
    syncFromState
  };
}

export default function App() {
  const [gameState, setGameState] = useState(() => loadStorage(initialGameState));
  const [drawerOpen, setDrawerOpen] = useState(() => !isSmallScreen());
  const [activePanel, setActivePanel] = useState("record");
  const {
    displaySpeech,
    displayStatus,
    speechTone,
    deltaVisible,
    pendingEffect,
    stageInteraction,
    syncFromState
  } = useTimedFeedback(gameState);

  useEffect(() => {
    saveStorage(gameState);
  }, [gameState]);

  const avatarUrl = gameState.settings.useCustomAvatarUrl && gameState.settings.customAvatarUrl
    ? gameState.settings.customAvatarUrl
    : gameState.settings.defaultAvatarPath || defaultLocalAvatarPath;

  function handleModeChange(mode) {
    setGameState((current) => {
      const nextState = {
        ...current,
        mode,
        speech: mode === MODE.CARE
          ? "切到抚摸模式：现在适合摸头、戳脸、牵手和拍拍肩。"
          : "切到暴揍模式：可以整蛊，但别把他点到炸毛。"
      };
      syncFromState(nextState);
      return nextState;
    });
  }

  function handleAvatarHit(areaId) {
    const { state, effect } = applyInteraction(gameState, areaId);
    setGameState(state);
    if (effect) {
      stageInteraction(effect, state);
    }
  }

  const handleRenderStateChange = useCallback(function handleRenderStateChange(payload) {
    setGameState((current) => {
      const nextRenderMode = payload.renderMode ?? current.renderMode;
      const nextLoadState = payload.loadState ?? current.loadState;
      const nextFallbackReason = payload.fallbackReason ?? current.fallbackReason;

      if (
        nextRenderMode === current.renderMode &&
        nextLoadState === current.loadState &&
        nextFallbackReason === current.fallbackReason
      ) {
        return current;
      }

      return {
        ...current,
        renderMode: nextRenderMode,
        loadState: nextLoadState,
        fallbackReason: nextFallbackReason
      };
    });
  }, []);

  function handleReset() {
    const nextState = {
      ...initialGameState,
      settings: {
        ...initialGameState.settings,
        boyfriendName: gameState.settings.boyfriendName || "暴走男朋友",
        defaultAvatarPath: defaultLocalAvatarPath
      }
    };
    setGameState(nextState);
    syncFromState(nextState);
  }

  const statusLabel = formatStatus(displayStatus);
  const areaLabel = formatArea(gameState.lastAreaId);
  const nextUnlock = getNextUnlockLabel(gameState);
  const unlockCount = `${gameState.unlockedContentCount} / ${unlockGoals.length}`;
  const hiddenEndingText = gameState.hiddenEndingLocked ? "后续版本开放" : "可触发";
  const boyfriendName = gameState.settings.boyfriendName || "暴走男朋友";
  const renderModeLabel = formatRenderMode(gameState.renderMode);
  const modeLabel = gameState.mode === MODE.CARE ? "抚摸模式" : "暴揍模式";

  const panelClass = useMemo(
    () => `drawer-panel ${drawerOpen ? "is-open" : "is-closed"} panel-${activePanel}`,
    [activePanel, drawerOpen]
  );

  const sceneClass = [
    "scene-wrap",
    `expression-${displayStatus}`,
    `tone-${speechTone}`,
    `render-${gameState.renderMode}`,
    pendingEffect ? "is-reacting" : "",
    pendingEffect ? `area-${pendingEffect.areaId}` : "",
    pendingEffect ? `fx-${pendingEffect.fxLevel}` : ""
  ].filter(Boolean).join(" ");

  return (
    <div className={`app-shell mode-${gameState.mode}`}>
      <header className="top-bar">
        <div>
          <p className="eyebrow">3D Touch Drama</p>
          <h1>{boyfriendName}</h1>
        </div>
        <button className="ghost-button panel-toggle" type="button" onClick={() => setDrawerOpen((value) => !value)}>
          {drawerOpen ? "收起面板" : "打开面板"}
        </button>
      </header>

      <main className="stage-layout">
        <section className="scene-card">
          <div className={sceneClass}>
            <CharacterScene
              avatarUrl={avatarUrl}
              currentMode={gameState.mode}
              status={displayStatus}
              renderMode={gameState.renderMode}
              loadState={gameState.loadState}
              onHit={handleAvatarHit}
              interactionEffect={pendingEffect}
              onRenderStateChange={handleRenderStateChange}
            />

            <div className="scene-overlay">
              <div className="hud-top">
                <div className="mode-switch">
                  <button
                    className={`mode-button ${gameState.mode === MODE.CARE ? "is-active" : ""}`}
                    type="button"
                    onClick={() => handleModeChange(MODE.CARE)}
                  >
                    抚摸
                  </button>
                  <button
                    className={`mode-button ${gameState.mode === MODE.RAGE ? "is-active" : ""}`}
                    type="button"
                    onClick={() => handleModeChange(MODE.RAGE)}
                  >
                    暴揍
                  </button>
                </div>
                <div className="pill-row">
                  <span className="resource-pill">爱心 <strong>{gameState.heart}</strong></span>
                  <span className="resource-pill">好感 <strong>{gameState.affection}</strong></span>
                  <span className="resource-pill">求生 <strong>{gameState.survival}</strong></span>
                  <span className="resource-pill">解锁 <strong>{unlockCount}</strong></span>
                </div>
              </div>

              <ImpactLayer effect={pendingEffect} />

              <div className="delta-stack">
                {deltaVisible && pendingEffect ? (
                  <>
                    <DeltaPill label="好感" value={pendingEffect.affectionDelta} tone="affection" />
                    <DeltaPill label="爱心" value={pendingEffect.heartDelta} tone="heart" />
                    <DeltaPill label="求生" value={pendingEffect.survivalDelta} tone="survival" />
                  </>
                ) : null}
              </div>

              <div className="expression-layer" aria-hidden="true">
                <div className="expression-face">
                  <span className="eye eye-left"></span>
                  <span className="eye eye-right"></span>
                  <span className="blush blush-left"></span>
                  <span className="blush blush-right"></span>
                  <span className="mouth"></span>
                </div>
              </div>

              <div className="speech-dock">
                <div className="speech-box">
                  <span className="speech-tag">
                    {gameState.loadState === LOAD_STATE.LOADING
                      ? "加载中"
                      : gameState.loadState === LOAD_STATE.FALLBACK
                        ? "已降级"
                        : "实时反应"}
                  </span>
                  <p>{displaySpeech}</p>
                </div>
                <div className="live-hint">
                  <span>{modeLabel}</span>
                  <span>{statusLabel}</span>
                  <span>{areaLabel}</span>
                  <span>{renderModeLabel}</span>
                </div>
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
                  <span>渲染模式</span>
                  <strong>{renderModeLabel}</strong>
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
                  <span>有效互动</span>
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
                <p>同一区域连续点击收益会递减为 100% / 70% / 40% / 10% / 0%，三秒内连点五次会让他炸毛 5 秒。</p>
              </div>

              <div className="tips-block">
                <h2>下一个目标</h2>
                <p>{nextUnlock}</p>
              </div>

              {gameState.fallbackReason ? (
                <div className="tips-block warning-block">
                  <h2>降级原因</h2>
                  <p>{gameState.fallbackReason}</p>
                </div>
              ) : null}
            </div>
          ) : null}

          {activePanel === "guide" ? (
            <div className="panel-content">
              <div className="tips-block">
                <h2>点击规则</h2>
                <p>手机上直接点角色本体。抚摸模式优先点头、脸、肩膀和手；暴揍模式会出现更夸张的抗议、爆炸贴纸和求生值变化。</p>
              </div>
              <div className="tips-block">
                <h2>为什么有时没收益</h2>
                <p>同一个地方狂点会递减，点烦之后他会进入烦躁冷却，不给收益，只给拒绝反馈。</p>
              </div>
              <div className="tips-block">
                <h2>手机显示策略</h2>
                <p>手机默认使用更稳定的 Q 版轻量 3D 角色，减少遮挡和加载压力。桌面端会继续尝试完整 3D 模型。</p>
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

              <label className="toggle-row">
                <input
                  type="checkbox"
                  checked={gameState.settings.useCustomAvatarUrl}
                  onChange={(event) =>
                    setGameState((current) => ({
                      ...current,
                      settings: {
                        ...current.settings,
                        useCustomAvatarUrl: event.target.checked
                      }
                    }))
                  }
                />
                <span>使用自定义 GLB 地址</span>
              </label>

              <label className="field">
                <span>模型地址</span>
                <input
                  type="url"
                  disabled={!gameState.settings.useCustomAvatarUrl}
                  value={gameState.settings.customAvatarUrl}
                  placeholder="https://example.com/avatar.glb"
                  onChange={(event) =>
                    setGameState((current) => ({
                      ...current,
                      settings: {
                        ...current.settings,
                        customAvatarUrl: event.target.value
                      }
                    }))
                  }
                />
              </label>

              <div className="button-row">
                <button
                  className="ghost-button"
                  type="button"
                  onClick={() =>
                    setGameState((current) => ({
                      ...current,
                      settings: {
                        ...current.settings,
                        useCustomAvatarUrl: false,
                        customAvatarUrl: "",
                        defaultAvatarPath: defaultLocalAvatarPath
                      }
                    }))
                  }
                >
                  恢复内置模型
                </button>
              </div>

              <div className="tips-block">
                <h2>版本说明</h2>
                <p>
                  当前保留 {mixamoSlots.length} 个动画槽位。手机端先用稳定 Q 版 3D，优先保证比例、完整度和点击反馈。
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
