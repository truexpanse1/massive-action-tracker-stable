// Knowledge Base Service - Supabase operations
// This file should be placed in: /home/ubuntu/mat/services/knowledgeBaseService.ts

import { supabase } from './supabaseClient';
import type { BusinessConcept, ConceptNote, ImplementationStrategy } from '../types';

// ============================================================================
// BUSINESS CONCEPTS
// ============================================================================

export async function getAllConcepts(): Promise<BusinessConcept[]> {
  const { data, error } = await supabase
    .from('business_concepts')
    .select('*')
    .order('title', { ascending: true });
  
  if (error) {
    console.error('Error fetching concepts:', error);
    return [];
  }
  return data || [];
}

export async function getConceptsByCategory(category: string): Promise<BusinessConcept[]> {
  const { data, error } = await supabase
    .from('business_concepts')
    .select('*')
    .eq('category', category)
    .order('title', { ascending: true });
  
  if (error) {
    console.error('Error fetching concepts by category:', error);
    return [];
  }
  return data || [];
}

export async function getConceptById(id: string): Promise<BusinessConcept | null> {
  const { data, error } = await supabase
    .from('business_concepts')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching concept:', error);
    return null;
  }
  return data;
}

export async function searchConcepts(query: string): Promise<BusinessConcept[]> {
  const { data, error } = await supabase
    .from('business_concepts')
    .select('*')
    .or(`title.ilike.%${query}%`)
    .order('view_count', { ascending: false })
    .limit(20);
  
  if (error) {
    console.error('Error searching concepts:', error);
    return [];
  }
  return data || [];
}

export async function getPopularConcepts(limit: number = 10): Promise<BusinessConcept[]> {
  const { data, error } = await supabase
    .from('business_concepts')
    .select('*')
    .order('view_count', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching popular concepts:', error);
    return [];
  }
  return data || [];
}

export async function getRecentlyViewedConcepts(userId: string, limit: number = 5): Promise<BusinessConcept[]> {
  const { data, error } = await supabase
    .from('concept_views')
    .select(`
      concept_id,
      viewed_at,
      business_concepts (*)
    `)
    .eq('assigned_to', userId)
    .order('viewed_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching recently viewed concepts:', error);
    return [];
  }
  
  return (data || [])
    .map((item: any) => item.business_concepts)
    .filter((concept: any) => concept !== null);
}

// ============================================================================
// CONCEPT VIEWS (Analytics)
// ============================================================================

export async function recordConceptView(
  conceptId: string,
  userId: string,
  timeSpentSeconds?: number
): Promise<void> {
  const { error } = await supabase
    .from('concept_views')
    .insert({
      concept_id: conceptId,
      user_id: userId,
      assigned_to: userId,
      time_spent_seconds: timeSpentSeconds
    });
  
  if (error) {
    console.error('Error recording concept view:', error);
  }
}

// ============================================================================
// CONCEPT NOTES
// ============================================================================

export async function getConceptNotes(conceptId: string, userId: string): Promise<ConceptNote[]> {
  const { data, error } = await supabase
    .from('concept_notes')
    .select('*')
    .eq('concept_id', conceptId)
    .eq('assigned_to', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching concept notes:', error);
    return [];
  }
  return data || [];
}

export async function getAllUserNotes(userId: string): Promise<ConceptNote[]> {
  const { data, error } = await supabase
    .from('concept_notes')
    .select('*')
    .eq('assigned_to', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching user notes:', error);
    return [];
  }
  return data || [];
}

export async function createConceptNote(
  conceptId: string,
  userId: string,
  noteText: string,
  noteType: string = 'insight',
  tags?: string[],
  clientProject?: string
): Promise<ConceptNote | null> {
  const { data, error } = await supabase
    .from('concept_notes')
    .insert({
      concept_id: conceptId,
      user_id: userId,
      assigned_to: userId,
      note_text: noteText,
      note_type: noteType,
      tags: tags || [],
      client_project: clientProject
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating concept note:', error);
    return null;
  }
  return data;
}

export async function updateConceptNote(
  noteId: string,
  updates: Partial<ConceptNote>
): Promise<ConceptNote | null> {
  const { data, error } = await supabase
    .from('concept_notes')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', noteId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating concept note:', error);
    return null;
  }
  return data;
}

export async function deleteConceptNote(noteId: string): Promise<boolean> {
  const { error } = await supabase
    .from('concept_notes')
    .delete()
    .eq('id', noteId);
  
  if (error) {
    console.error('Error deleting concept note:', error);
    return false;
  }
  return true;
}

// ============================================================================
// IMPLEMENTATION STRATEGIES
// ============================================================================

export async function getUserStrategies(userId: string): Promise<ImplementationStrategy[]> {
  const { data, error } = await supabase
    .from('implementation_strategies')
    .select('*')
    .eq('assigned_to', userId)
    .order('created_at', { ascending: false});
  
  if (error) {
    console.error('Error fetching user strategies:', error);
    return [];
  }
  return data || [];
}

export async function getActiveStrategies(userId: string): Promise<ImplementationStrategy[]> {
  const { data, error } = await supabase
    .from('implementation_strategies')
    .select('*')
    .eq('assigned_to', userId)
    .in('status', ['in_progress', 'not_started'])
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching active strategies:', error);
    return [];
  }
  return data || [];
}

export async function getStrategyById(strategyId: string): Promise<ImplementationStrategy | null> {
  const { data, error } = await supabase
    .from('implementation_strategies')
    .select('*')
    .eq('id', strategyId)
    .single();
  
  if (error) {
    console.error('Error fetching strategy:', error);
    return null;
  }
  return data;
}

export async function createImplementationStrategy(
  conceptId: string,
  userId: string,
  strategy: Partial<ImplementationStrategy>
): Promise<ImplementationStrategy | null> {
  const { data, error } = await supabase
    .from('implementation_strategies')
    .insert({
      concept_id: conceptId,
      user_id: userId,
      assigned_to: userId,
      ...strategy
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating implementation strategy:', error);
    return null;
  }
  return data;
}

export async function updateImplementationStrategy(
  strategyId: string,
  updates: Partial<ImplementationStrategy>
): Promise<ImplementationStrategy | null> {
  const { data, error } = await supabase
    .from('implementation_strategies')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', strategyId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating implementation strategy:', error);
    return null;
  }
  return data;
}

export async function markTaskComplete(
  strategyId: string,
  taskId: string
): Promise<ImplementationStrategy | null> {
  const strategy = await getStrategyById(strategyId);
  if (!strategy) return null;
  
  const completedTasks = strategy.completed_tasks || [];
  if (!completedTasks.includes(taskId)) {
    completedTasks.push(taskId);
  }
  
  return updateImplementationStrategy(strategyId, {
    completed_tasks: completedTasks
  });
}

export async function deleteImplementationStrategy(strategyId: string): Promise<boolean> {
  const { error } = await supabase
    .from('implementation_strategies')
    .delete()
    .eq('id', strategyId);
  
  if (error) {
    console.error('Error deleting implementation strategy:', error);
    return false;
  }
  return true;
}

// ============================================================================
// ANALYTICS & STATS
// ============================================================================

export async function getUserLearningStats(userId: string): Promise<{
  conceptsViewed: number;
  notesTaken: number;
  strategiesCreated: number;
  strategiesCompleted: number;
  totalTimeSpent: number;
}> {
  const { count: conceptsViewed } = await supabase
    .from('concept_views')
    .select('*', { count: 'exact', head: true })
    .eq('assigned_to', userId);
  
  const { count: notesTaken } = await supabase
    .from('concept_notes')
    .select('*', { count: 'exact', head: true })
    .eq('assigned_to', userId);
  
  const { count: strategiesCreated } = await supabase
    .from('implementation_strategies')
    .select('*', { count: 'exact', head: true })
    .eq('assigned_to', userId);
  
  const { count: strategiesCompleted } = await supabase
    .from('implementation_strategies')
    .select('*', { count: 'exact', head: true })
    .eq('assigned_to', userId)
    .eq('status', 'completed');
  
  const { data: viewData } = await supabase
    .from('concept_views')
    .select('time_spent_seconds')
    .eq('assigned_to', userId);
  
  const totalTimeSpent = (viewData || []).reduce(
    (sum, view) => sum + (view.time_spent_seconds || 0),
    0
  );
  
  return {
    conceptsViewed: conceptsViewed || 0,
    notesTaken: notesTaken || 0,
    strategiesCreated: strategiesCreated || 0,
    strategiesCompleted: strategiesCompleted || 0,
    totalTimeSpent
  };
}
