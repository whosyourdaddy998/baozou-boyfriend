import {
  ANNOYED_DURATION_MS,
  COOLDOWN_MS,
  COMBO_WINDOW_MS,
  LOAD_STATE,
  MODE,
  RENDER_MODE,
  STATUS,
  areaConfigs,
  comboCurve,
  defaultLocalAvatarPath,
  pickRandom,
  unlockGoals
} from "../config/gameConfig";

export const initialGameState = {
  mode: MODE.CARE,
  affection: 0,
  heart: 0,
  survival: 100,
  status: STATUS.NORMAL,
  areaCombo: {},
  areaCooldownUntil: {},
  totalInteractions: 0,
  unlockedContentCount: 1,
  hiddenEndingLocked: true,
  lastAreaId: "head",
  speech: "点点不同部位试试，手机上也会有明显反应。",
  floatingDelta: null,
  renderMode: RENDER_MODE.LITE_3D,
  loadState: LOAD_STATE.LOADING,
  settings: {
    boyfriendName: "暴走男朋友",
    useCustomAvatarUrl: false,
    customAvatarUrl: "",
    defaultAvatarPath: defaultLocalAvatarPath
  },
  fallbackReason: "",
  lastExpressionAt: 0,
  metrics: {
    careHits: 0,
    rageHits: 0,
    correctHits: 0
  }
};

function countUnlocked(state) {
  return unlockGoals.filter((goal) => {
    if (goal.unlockedByDefault) {
      return true;
    }
    if (goal.locked) {
      return false;
    }

    const threshold = goal.threshold || {};
    if (threshold.totalInteractions && state.totalInteractions < threshold.totalInteractions) {
      return false;
    }
    if (threshold.affection && state.affection < threshold.affection) {
      return false;
    }
    if (threshold.heart && state.heart < threshold.heart) {
      return false;
    }

    return true;
  }).length;
}

export function getNextUnlockLabel(state) {
  const nextGoal = unlockGoals.find((goal) => {
    if (goal.unlockedByDefault || goal.locked) {
      return false;
    }

    const threshold = goal.threshold || {};
    return (
      (threshold.totalInteractions && state.totalInteractions < threshold.totalInteractions) ||
      (threshold.affection && state.affection < threshold.affection) ||
      (threshold.heart && state.heart < threshold.heart)
    );
  });

  return nextGoal ? nextGoal.label : "隐藏结局后续开放，先把他逗到破防边缘。";
}

function getComboMeta(previousAreaCombo, areaId, now) {
  const previous = previousAreaCombo[areaId];

  if (!previous || now - previous.lastAt > COMBO_WINDOW_MS) {
    return { count: 1, multiplier: comboCurve[0], annoyedTriggered: false };
  }

  const count = previous.count + 1;
  return {
    count,
    multiplier: comboCurve[Math.min(count - 1, comboCurve.length - 1)],
    annoyedTriggered: count >= 5
  };
}

function isAreaBlocked(state, areaId, now) {
  return (state.areaCooldownUntil[areaId] || 0) > now;
}

function buildSpeech(area, mode, blocked) {
  if (blocked) {
    return "这里已经被你点烦了，先冷静 5 秒，不然他要炸毛。";
  }

  return pickRandom(mode === MODE.CARE ? area.careLines : area.rageLines);
}

function resolveStatus(area, mode, isCorrect, annoyedTriggered) {
  if (annoyedTriggered) {
    return STATUS.ANNOYED;
  }
  if (mode === MODE.RAGE) {
    return area.expressionKey.rage;
  }
  return isCorrect ? area.expressionKey.care : STATUS.TIRED;
}

function resolveSpeechTone(area, mode, blocked, status) {
  if (blocked || status === STATUS.ANNOYED) {
    return "refuse";
  }
  return mode === MODE.CARE ? area.speechTone.care : area.speechTone.rage;
}

function maybeAffectionDelta(mode, isCorrect) {
  if (mode !== MODE.CARE) {
    return 0;
  }
  if (isCorrect) {
    return Math.random() < 0.3 ? 1 : 0;
  }
  return -1;
}

function resolveHeartDelta(mode, isCorrect, multiplier) {
  if (mode !== MODE.CARE || !isCorrect || multiplier === 0) {
    return 0;
  }
  return multiplier >= 0.7 ? 1 : 0;
}

function resolveSurvivalDelta(mode, areaId, multiplier) {
  if (mode === MODE.CARE) {
    return areaId === "shoulder" || areaId === "head" ? 2 : 1;
  }

  const baseDamage = areaId === "body" ? -4 : areaId === "leg" ? -3 : -2;
  return Math.round(baseDamage * Math.max(multiplier, 0.5));
}

export function applyInteraction(state, areaId) {
  const now = Date.now();
  const area = areaConfigs[areaId];

  if (!area) {
    return { state, effect: null };
  }

  const blocked = isAreaBlocked(state, areaId, now);
  const isCorrect = area.correctModes.includes(state.mode);
  const comboMeta = getComboMeta(state.areaCombo, areaId, now);
  const nextAreaCombo = {
    ...state.areaCombo,
    [areaId]: { count: comboMeta.count, lastAt: now }
  };
  const nextAreaCooldownUntil = { ...state.areaCooldownUntil };

  if (blocked || comboMeta.annoyedTriggered) {
    nextAreaCooldownUntil[areaId] = now + ANNOYED_DURATION_MS;
  }

  const multiplier = blocked ? 0 : comboMeta.multiplier;
  const affectionDelta = blocked ? 0 : maybeAffectionDelta(state.mode, isCorrect) * (multiplier > 0 ? 1 : 0);
  const heartDelta = blocked ? 0 : resolveHeartDelta(state.mode, isCorrect, multiplier);
  const survivalDelta = blocked ? 0 : resolveSurvivalDelta(state.mode, areaId, multiplier);
  const status = blocked ? STATUS.ANNOYED : resolveStatus(area, state.mode, isCorrect, comboMeta.annoyedTriggered);
  const speech = buildSpeech(area, state.mode, blocked);
  const speechTone = resolveSpeechTone(area, state.mode, blocked, status);
  const expressionVariant = `${area.animationKey}-${status}`;

  const nextState = {
    ...state,
    affection: Math.max(0, state.affection + affectionDelta),
    heart: Math.max(0, state.heart + heartDelta),
    survival: Math.max(0, Math.min(100, state.survival + survivalDelta)),
    status,
    lastAreaId: areaId,
    speech,
    totalInteractions: state.totalInteractions + 1,
    areaCombo: nextAreaCombo,
    areaCooldownUntil: nextAreaCooldownUntil,
    lastExpressionAt: now,
    metrics: {
      ...state.metrics,
      careHits: state.metrics.careHits + (state.mode === MODE.CARE ? 1 : 0),
      rageHits: state.metrics.rageHits + (state.mode === MODE.RAGE ? 1 : 0),
      correctHits: state.metrics.correctHits + (isCorrect && !blocked ? 1 : 0)
    }
  };

  nextState.unlockedContentCount = countUnlocked(nextState);

  return {
    state: nextState,
    effect: {
      areaId,
      mode: state.mode,
      status,
      animationKey: area.animationKey,
      expressionKey: status,
      expressionVariant,
      speech,
      speechTone,
      affectionDelta,
      heartDelta,
      survivalDelta,
      cooldownMs: blocked ? ANNOYED_DURATION_MS : COOLDOWN_MS,
      blocked,
      annoyedTriggered: comboMeta.annoyedTriggered,
      multiplier,
      fxLevel: area.effectLevel[state.mode],
      renderMode: state.renderMode
    }
  };
}
