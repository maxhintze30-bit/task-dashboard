const PREFIX = 'task-dashboard:';

/**
 * Small wrapper around localStorage that never throws
 */
export const StorageService = {
  /**
   * Read a saved value
   * @param {string} key
   * @param {*} fallback Returned when nothing is saved or storage is unavailable
   */
  load: (key, fallback) => {
    try {
      const raw = window.localStorage.getItem(PREFIX + key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  },

  /**
   * Save a value
   * @param {string} key
   * @param {*} value
   */
  save: (key, value) => {
    try {
      window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      // Storage unavailable: changes only last for this session
    }
  }
};
