import React, { useState, useEffect } from 'react';
import { Goal } from '../types';

interface GoalsBlockProps {
  title: string;
  goals: Goal[];
  onGoalChange: (goal: Goal, isCompletion: boolean) => void;
  onMoveToTomorrow?: (goal: Goal) => void;
  highlight?: boolean;
  iconType?: 'checkbox' | 'target';
  showForwardTip?: boolean;
}

const GoalsBlock: React.FC<GoalsBlockProps> = ({ 
  title, 
  goals, 
  onGoalChange,
  onMoveToTomorrow,
  highlight = false,
  iconType = 'checkbox',
  showForwardTip = false,
}) => {
  const [localGoals, setLocalGoals] = useState<Goal[]>(goals);
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    goal: Goal | null;
  }>({ visible: false, x: 0, y: 0, goal: null });
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLocalGoals(goals);
  }, [goals]);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setContextMenu({ visible: false, x: 0, y: 0, goal: null });
    if (contextMenu.visible) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu.visible]);

  const handleCompletionToggle = (goal: Goal) => {
    const updatedGoal = { ...goal, completed: !goal.completed };
    setLocalGoals((prev) =>
      prev.map((g) => (g.id === goal.id ? updatedGoal : g))
    );
    onGoalChange(updatedGoal, true);
  };

  const handleTextChange = (goal: Goal, newText: string) => {
    const updatedGoal = { ...goal, text: newText };
    setLocalGoals((prev) =>
      prev.map((g) => (g.id === goal.id ? updatedGoal : g))
    );
    onGoalChange(updatedGoal, false);
  };

  const handleContextMenu = (e: React.MouseEvent, goal: Goal) => {
    if (!onMoveToTomorrow) return;
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      goal,
    });
  };

  const handleTouchStart = (e: React.TouchEvent, goal: Goal) => {
    if (!onMoveToTomorrow) return;
    const timer = setTimeout(() => {
      const touch = e.touches[0];
      setContextMenu({
        visible: true,
        x: touch.clientX,
        y: touch.clientY,
        goal,
      });
    }, 500); // 500ms long press
    setLongPressTimer(timer);
  };

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleMarkComplete = () => {
    if (contextMenu.goal) {
      handleCompletionToggle(contextMenu.goal);
    }
    setContextMenu({ visible: false, x: 0, y: 0, goal: null });
  };

  const handleMoveToTomorrow = () => {
    if (contextMenu.goal && onMoveToTomorrow) {
      onMoveToTomorrow(contextMenu.goal);
    }
    setContextMenu({ visible: false, x: 0, y: 0, goal: null });
  };

  // Limit to maximum 6 goals
  const displayGoals = localGoals.slice(0, 6);

  return (
    <div className="bg-brand-light-card dark:bg-brand-navy p-4 rounded-lg border border-brand-light-border dark:border-brand-gray">
      <div className="flex items-center justify-between mb-2">
        <h3
          className={`text-sm font-bold uppercase ${
            highlight ? 'text-brand-red' : 'text-gray-600 dark:text-gray-300'
          }`}
        >
          {title}
        </h3>
        {showForwardTip && onMoveToTomorrow && (
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <span className="text-sm">💡</span>
            <span className="hidden sm:inline">Right-click or long press to move forward</span>
            <span className="sm:hidden">Long press to move forward</span>
          </div>
        )}
      </div>
      <div className="space-y-2">
        {displayGoals.map((goal) => (
          <div 
            key={goal.id} 
            className="flex items-center space-x-3"
            onContextMenu={(e) => handleContextMenu(e, goal)}
            onTouchStart={(e) => handleTouchStart(e, goal)}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
          >
            <div className="relative flex items-center">
              {iconType === 'checkbox' ? (
                <>
                  <input
                    type="checkbox"
                    checked={goal.completed}
                    onChange={() => handleCompletionToggle(goal)}
                    className="peer"
                    style={{
                      width: '20px',
                      height: '20px',
                      cursor: 'pointer',
                      accentColor: '#2563eb', // blue
                    }}
                  />

                  {/* Custom checkmark SVG that appears when checked */}
                  <svg
                    className="absolute w-5 h-5 pointer-events-none hidden peer-checked:block text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </>
              ) : (
                <div 
                  onClick={() => handleCompletionToggle(goal)}
                  className="w-5 h-5 flex items-center justify-center cursor-pointer text-xl"
                  style={{ fontSize: '20px' }}
                >
                  🎯
                </div>
              )}
            </div>

            <input
              type="text"
              value={goal.text}
              onChange={(e) => handleTextChange(goal, e.target.value)}
              className={`w-full bg-transparent border-b border-dashed border-brand-light-border dark:border-brand-gray text-sm p-1 focus:outline-none focus:border-brand-blue focus:border-solid ${
                goal.completed 
                  ? 'line-through text-gray-500' 
                  : goal.fromCoaching
                  ? 'text-purple-600 dark:text-purple-400 font-bold'
                  : (goal as any).forwarded
                  ? 'text-gray-400 dark:text-gray-500'
                  : goal.rolledOver 
                  ? 'text-red-600 dark:text-red-500 font-semibold' 
                  : 'text-brand-light-text dark:text-white'
              }`}
            />

            {/* Show forward indicator */}
            {((goal as any).forwarded || (goal as any).forward_count > 0) && (
              <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap flex items-center gap-1">
                <span>→</span>
                {(goal as any).forward_count > 1 && (
                  <span className="text-xs">
                    {'→'.repeat(Math.min((goal as any).forward_count - 1, 2))}
                    {(goal as any).forward_count > 3 && ` ${(goal as any).forward_count}x`}
                  </span>
                )}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Context Menu */}
      {contextMenu.visible && contextMenu.goal && (
        <div
          className="fixed bg-white dark:bg-brand-navy border-2 border-brand-blue shadow-2xl rounded-lg py-2 z-50 min-w-[200px]"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleMarkComplete}
            className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-brand-gray flex items-center gap-2 text-brand-light-text dark:text-white"
          >
            <span className="text-lg">✅</span>
            <span className="font-medium">Mark Complete</span>
          </button>
          {onMoveToTomorrow && !contextMenu.goal.completed && (
            <button
              onClick={handleMoveToTomorrow}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-brand-gray flex items-center gap-2 text-brand-light-text dark:text-white"
            >
              <span className="text-lg">➡️</span>
              <span className="font-medium">Move to Tomorrow</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default GoalsBlock;
