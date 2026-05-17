import {
  ANNOYED_DURATION_MS,
  COOLDOWN_MS,
  COMBO_WINDOW_MS,
  MODE,
  STATUS,
  areaConfigs,
  comboCurve,
  defaultReadyPlayerMeUrl,
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
  speech: "试着点击角色不同部位，看看他会怎么反应。",
  floatingDelta: null,
  settings: {
    avatarUrl: defaultReadyPlayerMeUrl,
    boyfriendName: "暴走男朋友"
  },
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
    const unmet =
      (threshold.totalInteractions && state.totalInteractions < threshold.totalInteractions) ||
      (threshold.affection && state.affection < threshold.affection) ||
      (threshold.heart && state.heart < threshold.heart);

    return unmet;
  });

  return nextGoal ? nextGoal.label : "隐藏结局后续开放";
}

function getComboMeta(previousAreaCombo, areaId, now) {
  const previous = previousAreaCombo[areaId];

  if (!previous || now - previous.lastAt > COMBO_WINDOW_MS) {
    return {
      count: 1,
      multiplier: comboCurve[0],
      annoyedTriggered: false
    };
  }

  const count = previous.count + 1;
  const annoyedTriggered = count >= 5;
  const multiplier = comboCurve[Math.min(count - 1, comboCurve.length - 1)];

  return {
    count,
    multiplier,
    annoyedTriggered
  };
}

function isAreaBlocked(state, areaId, now) {
  return (state.areaCooldownUntil[areaId] || 0) > now;
}

function buildSpeech(area, mode, blocked) {
  if (blocked) {
    return "这里已经被你点烦了，先冷静五秒。";
  }

  const lines = mode === MODE.CARE ? area.careLines : area.rageLines;
  return pickRandom(lines);
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

  if (multiplier >= 0.7) {
    return 1;
  }

  return 0;
}

function resolveSurvivalDelta(mode, areaId, multiplier) {
  if (mode === MODE.CARE) {
    if (areaId === "shoulder" || areaId === "head") {
      return 2;
    }

    return 1;
  }

  const baseDamage = areaId === "body" ? -4 : areaId === "leg" ? -3 : -2;
  return Math.round(baseDamage * Math.max(multiplier, 0.5));
}

export function applyInteraction(state, areaId) {
  const now = Date.now();
  const area = areaConfigs[areaId];

  if (!area) {
    return {
      state,
      effect: null
    };
  }

  const blocked = isAreaBlocked(state, areaId, now);
  const isCorrect = area.correctModes.includes(state.mode);
  const comboMeta = getComboMeta(state.areaCombo, areaId, now);

  const nextAreaCombo = {
    ...state.areaCombo,
    [areaId]: {
      count: comboMeta.count,
      lastAt: now
    }
  };

  const nextAreaCooldownUntil = {
    ...state.areaCooldownUntil
  };

  if (blocked || comboMeta.annoyedTriggered) {
    nextAreaCooldownUntil[areaId] = now + ANNOYED_DURATION_MS;
  }

  const multiplier = blocked ? 0 : comboMeta.multiplier;
  const affectionDelta = blocked ? 0 : maybeAffectionDelta(state.mode, isCorrect) * (multiplier > 0 ? 1 : 0);
  const heartDelta = blocked ? 0 : resolveHeartDelta(state.mode, isCorrect, multiplier);
  const survivalDelta = blocked ? 0 : resolveSurvivalDelta(state.mode, areaId, multiplier);
  const status = blocked ? STATUS.ANNOYED : resolveStatus(area, state.mode, isCorrect, comboMeta.annoyedTriggered);
  const speech = buildSpeech(area, state.mode, blocked);

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
      speech,
      affectionDelta,
      heartDelta,
      survivalDelta,
      cooldownMs: blocked ? ANNOYED_DURATION_MS : COOLDOWN_MS,
      blocked,
      annoyedTriggered: comboMeta.annoyedTriggered,
      multiplier
    }
  };
}
