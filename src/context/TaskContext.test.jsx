import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { TaskProvider, useTaskContext } from './TaskContext';

let context;
function Probe() {
  context = useTaskContext();
  return <ul>{context.tasks.map(task => <li key={task.id}>{task.title}</li>)}</ul>;
}

describe('TaskContext persistence', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test('starts with only the daily tasks', () => {
    render(<TaskProvider><Probe /></TaskProvider>);
    expect(context.tasks).toHaveLength(3);
    expect(context.tasks.every(task => task.recurrence === 'daily')).toBe(true);
  });

  test('keeps added tasks and daily progress after a reload', () => {
    const { unmount } = render(<TaskProvider><Probe /></TaskProvider>);
    act(() => {
      context.addTask({ title: 'Steuererklärung', isCompleted: false, tags: [] });
    });
    act(() => {
      context.toggleTask('daily-cs50x');
    });
    unmount();

    render(<TaskProvider><Probe /></TaskProvider>);
    expect(screen.getByText('Steuererklärung')).toBeInTheDocument();
    expect(context.tasks.find(task => task.id === 'daily-cs50x').isCompleted).toBe(true);
    expect(context.tasks).toHaveLength(4);
  });

  test('daily tasks survive delete', () => {
    render(<TaskProvider><Probe /></TaskProvider>);
    act(() => {
      context.deleteTask('daily-cs50x');
    });
    expect(context.tasks).toHaveLength(3);
  });
});
