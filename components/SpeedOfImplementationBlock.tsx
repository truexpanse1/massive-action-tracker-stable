import React, { useState, useEffect } from 'react';
import { SpeedOfImplementationTarget } from '../types';

interface SpeedOfImplementationBlockProps {
  targets: SpeedOfImplementationTarget[];
  onTargetChange: (target: SpeedOfImplementationTarget, isCompletion: boolean) => void;
  onMoveToTomorrow?: (target: SpeedOfImplementationTarget) => void;
}

const SpeedOfImplementationBlock: React.FC<SpeedOfImplementationBlockProps> = ({
  targets,
  onTargetChange,
  onMoveToTomorrow,
}) => {
  const [localTargets, setLocalTargets] = useState<SpeedOfImplementationTarget[]>(
    targets && targets.length > 0 ? targets : Array.from({ length: 3 }, (_, i) => ({
      id: `soi-${i + 1}`,
      text: '',
      completed: false,
      currentDay: 0,
      totalDays: 0,
      startDate: '',
    }))
  );
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    target: SpeedOfImplementationTarget | null;
  }>({ visible: false, x: 0, y: 0, target: null });
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (targets && targets.length > 0) {
      setLocalTargets(targets);
    }
  }, [targets]);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setContextMenu({ visible: false, x: 0, y: 0, target: null });
    if (contextMenu.visible) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu.visible]);

  const handleCompletionToggle = (target: SpeedOfImplementationTarget) => {
    const updatedTarget = { ...target, completed: !target.completed };
    setLocalTargets((prev) =>
      prev.map((t) => (t.id === target.id ? updatedTarget : t))
    );
    onTargetChange(updatedTarget, true);
  };

  const handleTextChange = (target: SpeedOfImplementationTarget, newText: string) => {
    const updatedTarget = { ...target, text: newText };
    setLocalTargets((prev) =>
      prev.map((t) => (t.id === target.id ? updatedTarget : t))
    );
    onTargetChange(updatedTarget, false);
  };

  const handleContextMenu = (e: React.MouseEvent, target: SpeedOfImplementationTarget) => {
    if (!onMoveToTomorrow) return;
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      target,
    });
  };

  const handleTouchStart = (e: React.TouchEvent, target: SpeedOfImplementationTarget) => {
    if (!onMoveToTomorrow) return;
    const timer = setTimeout(() => {
      const touch = e.touches[0];
      setContextMenu({
        visible: true,
        x: touch.clientX,
        y: touch.clientY,
        target,
      });
    }, 500);
    setLongPressTimer(timer);
  };

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleMarkComplete = () => {
    if (contextMenu.target) {
      handleCompletionToggle(contextMenu.target);
    }
    setContextMenu({ visible: false, x: 0, y: 0, target: null });
  };

  const handleMoveToTomorrow = () => {
    if (contextMenu.target && onMoveToTomorrow) {
      onMoveToTomorrow(contextMenu.target);
    }
    setContextMenu({ visible: false, x: 0, y: 0, target: null });
  };

  // Calculate progress
  const activeTargets = localTargets.filter(t => t.text && t.text.trim() !== '');
  const completedCount = activeTargets.filter(t => t.completed).length;
  const totalCount = activeTargets.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="bg-brand-light-card dark:bg-brand-navy p-6 rounded-lg border border-brand-light-border dark:border-brand-gray">
      {/* Header - Purple */}
      <div className="bg-purple-600 dark:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">⚡</span>
          <span className="text-lg">SPEED OF IMPLEMENTATION</span>
        </div>
      </div>

      {/* Targets */}
      <div className="space-y-3 mb-4">
        {localTargets.map((target) => (
          <div
            key={target.id}
            className="flex items-start space-x-3"
            onContextMenu={(e) => handleContextMenu(e, target)}
            onTouchStart={(e) => handleTouchStart(e, target)}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
          >
            {/* Checkbox */}
            <div className="relative flex items-center">
              <input
                type="checkbox"
                checked={target.completed}
                onChange={() => handleCompletionToggle(target)}
                className="peer"
                style={{
                  width: '20px',
                  height: '20px',
                  cursor: 'pointer',
                  accentColor: '#9333ea', // purple
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
            </div>

            {/* Target Content */}
            <div className="flex-1">
              <input
                type="text"
                value={target.text}
                onChange={(e) => handleTextChange(target, e.target.value)}
                placeholder="Add a Speed of Implementation target..."
                className={`w-full bg-transparent border-b border-dashed border-brand-light-border dark:border-brand-gray text-sm p-1 focus:outline-none focus:border-purple-600 focus:border-solid ${
                  target.completed
                    ? 'line-through text-gray-500'
                    : target.rolledOver
                    ? 'text-red-600 dark:text-red-500 font-semibold'
                    : 'text-purple-600 dark:text-purple-400 font-bold'
                }`}
              />

              {/* Day Counter & Source */}
              {target.text && target.totalDays > 0 && (
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                  <span>
                    Day {target.currentDay} of {target.totalDays}
                  </span>
                  {target.source && (
                    <>
                      <span>•</span>
                      <span>{target.source}</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      {totalCount > 0 && (
        <div className="mt-4 pt-4 border-t border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span className="font-semibold">Progress:</span>
            <span>
              {completedCount} of {totalCount} completed
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className="bg-purple-600 dark:bg-purple-500 h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            >
              {progressPercentage > 10 && (
                <div className="text-white text-xs font-bold text-center leading-3">
                  {Math.round(progressPercentage)}%
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu.visible && contextMenu.target && (
        <div
          className="fixed bg-white dark:bg-brand-navy border border-gray-300 dark:border-brand-gray rounded-lg shadow-xl py-2 z-50"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
          }}
        >
          <button
            onClick={handleMarkComplete}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-brand-gray text-sm text-brand-light-text dark:text-white"
          >
            {contextMenu.target.completed ? '❌ Mark Incomplete' : '✅ Mark Complete'}
          </button>
          {onMoveToTomorrow && (
            <button
              onClick={handleMoveToTomorrow}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-brand-gray text-sm text-brand-light-text dark:text-white"
            >
              ➡️ Move to Tomorrow
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SpeedOfImplementationBlock;
