import { STORAGE_KEY } from "../config/gameConfig";

export function loadStorage(defaultState) {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaultState;
    }

    const parsed = JSON.parse(raw);
    return {
      ...defaultState,
      ...parsed
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
