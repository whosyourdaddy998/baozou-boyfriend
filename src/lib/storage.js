import { STORAGE_KEY } from "../config/gameConfig";

export function loadStorage(defaultState) {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaultState;
    }

    const parsed = JSON.parse(raw);
    const legacyAvatarUrl = parsed?.settings?.avatarUrl || parsed?.avatarUrl || "";
    const migratedSettings = {
      ...defaultState.settings,
      ...(parsed.settings || {})
    };

    if (legacyAvatarUrl && !migratedSettings.customAvatarUrl && legacyAvatarUrl !== defaultState.settings.defaultAvatarPath) {
      migratedSettings.useCustomAvatarUrl = true;
      migratedSettings.customAvatarUrl = legacyAvatarUrl;
    }

    return {
      ...defaultState,
      ...parsed,
      settings: migratedSettings,
      metrics: {
        ...defaultState.metrics,
        ...(parsed.metrics || {})
      },
      areaCombo: {
        ...defaultState.areaCombo,
        ...(parsed.areaCombo || {})
      },
      areaCooldownUntil: {
        ...defaultState.areaCooldownUntil,
        ...(parsed.areaCooldownUntil || {})
      }
    };
  } catch (error) {
    return defaultState;
  }
}

export function saveStorage(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    // Ignore storage write failures to keep the page playable.
  }
}
