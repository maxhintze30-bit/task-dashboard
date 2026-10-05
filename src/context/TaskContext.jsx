import React, { createContext, useState, useContext, useEffect } from 'react';
import { DataHydrationService } from '../common/utils/DataHydrationService';
import { DailyTaskService, getDateKey } from '../common/utils/DailyTaskService';
import { StorageService } from '../common/utils/StorageService';

// Create the task context
const TaskContext = createContext();

// Custom hook for using task context
export const useTaskContext = () => useContext(TaskContext);

// Task provider component
export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState(() => {
    // Daily tasks are always present; then saved tasks, or sample data if should hydrate
    const savedTasks = StorageService.load('tasks', null);
    const otherTasks = savedTasks
      ? savedTasks.filter(task => task.recurrence !== 'daily')
      : DataHydrationService.shouldHydrate() 
        ? DataHydrationService.getInitialTasks() 
        : [];
    return [...DailyTaskService.getDailyTasks(), ...otherTasks];
  });
  const [dateKey, setDateKey] = useState(() => getDateKey());
  const [stats, setStats] = useState({ total: 0, completed: 0, remaining: 0 });

  useEffect(() => {
    // Update stats whenever tasks change
    const completed = tasks.filter(task => task.isCompleted).length;
    setStats({
      total: tasks.length,
      completed,
      remaining: tasks.length - completed
    });
  }, [tasks]);

  useEffect(() => {
    // Remember tasks and today's progress on daily tasks
    StorageService.save('tasks', tasks.filter(task => task.recurrence !== 'daily'));
    DailyTaskService.saveCompletion(tasks);
  }, [tasks]);

  useEffect(() => {
    // Reset daily tasks when the day changes while the app is open
    const interval = setInterval(() => {
      const today = getDateKey();
      if (today !== dateKey) {
        setDateKey(today);
        setTasks(prevTasks => DailyTaskService.resetDailyTasks(prevTasks));
      }
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, [dateKey]);

  const isDaily = (task) => task.recurrence === 'daily';

  const addTask = (task) => {
    const id = Math.floor(Math.random() * 10000) + 1;
    const newTask = { id, ...task };
    setTasks([...tasks, newTask]);
    return newTask;
  };

  const toggleTask = (id) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
      )
    );
  };

  const deleteTask = (id) => {
    // Daily tasks can't be deleted, they come back every day
    setTasks(tasks.filter((task) => task.id !== id || isDaily(task)));
  };

  const completeAllTasks = (taskIds = null) => {
    if (taskIds) {
      // Complete specific tasks (for task lists)
      setTasks(tasks.map(task => 
        taskIds.includes(task.id) ? { ...task, isCompleted: true } : task
      ));
    } else {
      // Complete all tasks
      setTasks(tasks.map(task => ({ ...task, isCompleted: true })));
    }
  };

  const deleteCompletedTasks = (taskIds = null) => {
    if (taskIds && taskIds.length > 0) {
      // Delete specific completed tasks (for task lists)
      setTasks(tasks.filter(task => !taskIds.includes(task.id) || isDaily(task)));
    } else {
      // Delete all completed tasks
      setTasks(tasks.filter(task => !task.isCompleted || isDaily(task)));
    }
  };

  // Tag-related task operations
  const updateTasksWithEditedTag = (oldTag, newTag) => {
    setTasks(tasks.map(task => {
      if (task.tags && task.tags.includes(oldTag)) {
        const updatedTags = task.tags.map(tag => 
          tag === oldTag ? newTag : tag
        );
        return { ...task, tags: updatedTags };
      }
      return task;
    }));
  };

  const updateTasksWithDeletedTag = (tagToDelete) => {
    setTasks(tasks.map(task => {
      if (task.tags && task.tags.includes(tagToDelete)) {
        const updatedTags = task.tags.filter(tag => tag !== tagToDelete);
        return { ...task, tags: updatedTags };
      }
      return task;
    }));
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        stats,
        addTask,
        toggleTask,
        deleteTask,
        completeAllTasks,
        deleteCompletedTasks,
        updateTasksWithEditedTag,
        updateTasksWithDeletedTag
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};