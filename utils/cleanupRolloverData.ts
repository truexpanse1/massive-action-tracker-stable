import { DayData, Goal } from '../types';

/**
 * Cleanup utility to fix historical data with excess targets/goals
 * 
 * This script:
 * 1. Limits topTargets and massiveGoals to 6 items max
 * 2. Removes duplicate items (same text or ID)
 * 3. Prioritizes rolled items (keeps them at top)
 * 4. Cleans up all days in the dataset
 */

export const cleanupRolloverData = (allData: Record<string, DayData>): Record<string, DayData> => {
  const cleanedData: Record<string, DayData> = {};
  let totalDaysProcessed = 0;
  let totalItemsRemoved = 0;

  Object.keys(allData).forEach(dateKey => {
    const dayData = allData[dateKey];
    const originalTargetsCount = dayData.topTargets?.length || 0;
    const originalGoalsCount = dayData.massiveGoals?.length || 0;

    // Clean top targets
    const cleanedTargets = cleanupGoalArray(dayData.topTargets || []);
    
    // Clean massive goals
    const cleanedGoals = cleanupGoalArray(dayData.massiveGoals || []);

    // Calculate items removed
    const targetsRemoved = originalTargetsCount - cleanedTargets.length;
    const goalsRemoved = originalGoalsCount - cleanedGoals.length;
    
    if (targetsRemoved > 0 || goalsRemoved > 0) {
      totalDaysProcessed++;
      totalItemsRemoved += targetsRemoved + goalsRemoved;
      console.log(`📅 ${dateKey}: Removed ${targetsRemoved} targets, ${goalsRemoved} goals`);
    }

    // Save cleaned data
    cleanedData[dateKey] = {
      ...dayData,
      topTargets: cleanedTargets,
      massiveGoals: cleanedGoals,
    };
  });

  console.log(`\n✅ Cleanup complete!`);
  console.log(`📊 Days processed: ${totalDaysProcessed}`);
  console.log(`🗑️  Items removed: ${totalItemsRemoved}`);

  return cleanedData;
};

/**
 * Clean a goal array by:
 * 1. Removing duplicates (same text or ID)
 * 2. Prioritizing rolled items (keep at top)
 * 3. Limiting to 6 items max
 */
const cleanupGoalArray = (goals: Goal[]): Goal[] => {
  if (!goals || goals.length === 0) return [];

  // Step 1: Remove duplicates
  const seen = new Set<string>();
  const uniqueGoals: Goal[] = [];

  goals.forEach(goal => {
    // Create a unique key based on text (case-insensitive) or ID
    const key = goal.text.toLowerCase().trim() || goal.id;
    
    if (!seen.has(key)) {
      seen.add(key);
      uniqueGoals.push(goal);
    }
  });

  // Step 2: Sort - rolled items first, then others
  const sortedGoals = uniqueGoals.sort((a, b) => {
    if (a.rolledOver && !b.rolledOver) return -1;
    if (!a.rolledOver && b.rolledOver) return 1;
    return 0;
  });

  // Step 3: Limit to 6 items
  return sortedGoals.slice(0, 6);
};

/**
 * Get cleanup statistics without modifying data
 */
export const getCleanupStats = (allData: Record<string, DayData>): {
  daysAffected: number;
  totalExcessItems: number;
  duplicatesFound: number;
} => {
  let daysAffected = 0;
  let totalExcessItems = 0;
  let duplicatesFound = 0;

  Object.keys(allData).forEach(dateKey => {
    const dayData = allData[dateKey];
    const targets = dayData.topTargets || [];
    const goals = dayData.massiveGoals || [];

    // Check for excess items
    if (targets.length > 6) {
      daysAffected++;
      totalExcessItems += targets.length - 6;
    }
    if (goals.length > 6) {
      if (targets.length <= 6) daysAffected++; // Only count once per day
      totalExcessItems += goals.length - 6;
    }

    // Check for duplicates
    const targetTexts = new Set<string>();
    targets.forEach(t => {
      const key = t.text.toLowerCase().trim();
      if (key && targetTexts.has(key)) {
        duplicatesFound++;
      }
      targetTexts.add(key);
    });

    const goalTexts = new Set<string>();
    goals.forEach(g => {
      const key = g.text.toLowerCase().trim();
      if (key && goalTexts.has(key)) {
        duplicatesFound++;
      }
      goalTexts.add(key);
    });
  });

  return {
    daysAffected,
    totalExcessItems,
    duplicatesFound,
  };
};
