import React, { useState, useEffect } from 'react';
import { Goal } from '../types';

interface GoalsBlockProps {
  title: string;
  goals: Goal[];
  onGoalChange: (goal: Goal, isCompletion: boolean) => void;
  highlight?: boolean;
  iconType?: 'checkbox' | 'target';
}

const GoalsBlock: React.FC<GoalsBlockProps> = ({ 
  title, 
  goals, 
  onGoalChange, 
  highlight = false,
  iconType = 'checkbox'
}) => {
  const [localGoals, setLocalGoals] = useState<Goal[]>(goals);

  useEffect(() => {
    setLocalGoals(goals);
  }, [goals]);

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

  return (
    <div className="bg-brand-light-card dark:bg-brand-navy p-4 rounded-lg border border-brand-light-border dark:border-brand-gray">
      <h3
        className={`text-sm font-bold uppercase mb-2 ${
          highlight ? 'text-brand-red' : 'text-gray-600 dark:text-gray-300'
        }`}
      >
        {title}
      </h3>
      <div className="space-y-2">
        {localGoals.map((goal) => (
          <div key={goal.id} className="flex items-center space-x-3">
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
              className={`w-full bg-transparent border-b border-dashed border-brand-light-border dark:border-brand-gray text-brand-light-text dark:text-white text-sm p-1 focus:outline-none focus:border-brand-blue focus:border-solid ${
                goal.completed ? 'line-through text-gray-500' : ''
              }`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default GoalsBlock;