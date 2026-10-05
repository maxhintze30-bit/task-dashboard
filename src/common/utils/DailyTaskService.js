import dailyTasks from '../../data/dailyTasks.json';

const STORAGE_KEY = 'task-dashboard:daily-completion';

/**
 * Local calendar date as YYYY-MM-DD
 * @param {Date} date
 * @returns {string}
 */
export const getDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const readCompletion = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/**
 * Service for tasks that repeat every day and reset at midnight
 */
export const DailyTaskService = {
  /**
   * Daily tasks for the given day, with today's completion restored
   * @param {Date} date
   * @returns {Array} Array of daily tasks
   */
  getDailyTasks: (date = new Date()) => {
    const saved = readCompletion();
    const completedIds = saved && saved.date === getDateKey(date) ? saved.completedIds : [];
    return dailyTasks.map(task => ({
      ...task,
      recurrence: 'daily',
      isCompleted: completedIds.includes(task.id)
    }));
  },

  /**
   * Remember which daily tasks are done today
   * @param {Array} tasks
   * @param {Date} date
   */
  saveCompletion: (tasks, date = new Date()) => {
    const completedIds = tasks
      .filter(task => task.recurrence === 'daily' && task.isCompleted)
      .map(task => task.id);
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ date: getDateKey(date), completedIds })
      );
    } catch {
      // Storage unavailable: completion only lasts for this session
    }
  },

  /**
   * Mark daily tasks as not completed again
   * @param {Array} tasks
   * @returns {Array}
   */
  resetDailyTasks: (tasks) =>
    tasks.map(task => (task.recurrence === 'daily' ? { ...task, isCompleted: false } : task))
};
