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
    [RENDER_MODE.LITE_3D]: "轻量 3D",
    [RENDER_MODE.FALLBACK_2D]: "降级互动"
  };
  return labels[renderMode] || "轻量 3D";
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

function useTimedFeedback(gameState, setGameState) {
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
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [activePanel, setActivePanel] = useState("record");
  const {
    displaySpeech,
    displayStatus,
    speechTone,
    deltaVisible,
    pendingEffect,
    stageInteraction,
    syncFromState
  } = useTimedFeedback(gameState, setGameState);

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
        speech: mode === MODE.CARE ? "轻一点，先试试安抚他。" : "现在切到暴揍模式，小心别点太疯。"
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
              <span className="resource-pill">爱心值 <strong>{gameState.heart}</strong></span>
              <span className="resource-pill">好感值 <strong>{gameState.affection}</strong></span>
              <span className="resource-pill">求生值 <strong>{gameState.survival}</strong></span>
              <span className="resource-pill">解锁 <strong>{unlockCount}</strong></span>
            </div>
          </div>

          <div className={`scene-wrap expression-${displayStatus} tone-${speechTone} render-${gameState.renderMode}`}>
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
                <p>手机和桌面都直接点角色本体。抚摸模式优先点头、脸、肩膀和手；暴揍模式优先点身体、脸、腿和手。</p>
              </div>
              <div className="tips-block">
                <h2>为什么有时没收益</h2>
                <p>如果你连续点同一个地方，收益会递减；被点烦之后，他会进入 5 秒烦躁状态，直接拒绝互动。</p>
              </div>
              <div className="tips-block">
                <h2>手机不显示怎么办</h2>
                <p>这版已经内置本地模型并加入自动降级。即使 3D 失败，也会回退成可见可玩的轻量角色展示层。</p>
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
                <h2>首版说明</h2>
                <p>
                  默认模型已经内置在仓库里，不再依赖外链。当前保留 {mixamoSlots.length} 个动画槽位，先以程序化表情和局部动作保证互动细腻度。
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
