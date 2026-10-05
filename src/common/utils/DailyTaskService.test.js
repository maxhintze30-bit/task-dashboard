import { DailyTaskService, getDateKey } from './DailyTaskService';

describe('DailyTaskService', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test('provides the three daily tasks, not completed by default', () => {
    const tasks = DailyTaskService.getDailyTasks();

    expect(tasks.map(task => task.title)).toEqual([
      'Software-Workflow Hof Hintze weiterführen',
      'CS50x Kurs',
      '30 Days of Python Kurs'
    ]);
    tasks.forEach(task => {
      expect(task.recurrence).toBe('daily');
      expect(task.isCompleted).toBe(false);
      expect(task.tags).toContain('Täglich');
    });
  });

  test('restores completion on the same day', () => {
    const today = new Date(2026, 9, 5, 9);
    const tasks = DailyTaskService.getDailyTasks(today);
    tasks[1].isCompleted = true;
    DailyTaskService.saveCompletion(tasks, today);

    const restored = DailyTaskService.getDailyTasks(new Date(2026, 9, 5, 22));
    expect(restored.map(task => task.isCompleted)).toEqual([false, true, false]);
  });

  test('resets completion on the next day', () => {
    const today = new Date(2026, 9, 5, 9);
    const tasks = DailyTaskService.getDailyTasks(today).map(task => ({ ...task, isCompleted: true }));
    DailyTaskService.saveCompletion(tasks, today);

    const tomorrow = DailyTaskService.getDailyTasks(new Date(2026, 9, 6, 7));
    expect(tomorrow.every(task => !task.isCompleted)).toBe(true);
  });

  test('resetDailyTasks leaves other tasks untouched', () => {
    const tasks = [
      { id: 'daily-cs50x', recurrence: 'daily', isCompleted: true },
      { id: 1, isCompleted: true }
    ];
    expect(DailyTaskService.resetDailyTasks(tasks)).toEqual([
      { id: 'daily-cs50x', recurrence: 'daily', isCompleted: false },
      { id: 1, isCompleted: true }
    ]);
  });

  test('getDateKey formats local dates', () => {
    expect(getDateKey(new Date(2026, 0, 7))).toBe('2026-01-07');
  });
});
