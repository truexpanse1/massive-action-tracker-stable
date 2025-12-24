// BusinessMasteryKnowledgeBase.tsx
// Place this file in: /components/BusinessMasteryKnowledgeBase.tsx

import React, { useState, useEffect } from 'react';
import { 
  getAllConcepts, 
  getPopularConcepts, 
  getRecentlyViewedConcepts,
  searchConcepts,
  getConceptsByCategory,
  recordConceptView
} from '../services/knowledgeBaseService';
import { BusinessConcept, CONCEPT_CATEGORIES } from '../types';
import ConceptDetailModal from './ConceptDetailModal';
import { supabase } from '../supabaseClient';

export default function BusinessMasteryKnowledgeBase() {
  const [searchQuery, setSearchQuery] = useState('');
  const [popularConcepts, setPopularConcepts] = useState<BusinessConcept[]>([]);
  const [recentConcepts, setRecentConcepts] = useState<BusinessConcept[]>([]);
  const [searchResults, setSearchResults] = useState<BusinessConcept[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryConcepts, setCategoryConcepts] = useState<BusinessConcept[]>([]);
  const [selectedConcept, setSelectedConcept] = useState<BusinessConcept | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Get user ID from Supabase auth
  useEffect(() => {
    const getUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      } else {
        // If no auth user, use a default ID for demo
        setUserId('demo-user');
      }
    };
    getUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      loadInitialData();
    }
  }, [userId]);

  useEffect(() => {
    if (selectedCategory) {
      loadCategoryData();
    }
  }, [selectedCategory]);

  async function loadInitialData() {
    setIsLoading(true);
    try {
      const [popular, recent] = await Promise.all([
        getPopularConcepts(6),
        getRecentlyViewedConcepts(userId, 4)
      ]);
      
      setPopularConcepts(popular);
      setRecentConcepts(recent);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadCategoryData() {
    if (!selectedCategory) return;
    
    try {
      const concepts = await getConceptsByCategory(selectedCategory);
      setCategoryConcepts(concepts);
    } catch (error) {
      console.error('Error loading category data:', error);
    }
  }

  async function handleSearch(query: string) {
    setSearchQuery(query);
    setSelectedCategory(null);
    
    if (query.length > 2) {
      try {
        const results = await searchConcepts(query);
        setSearchResults(results);
      } catch (error) {
        console.error('Error searching concepts:', error);
      }
    } else {
      setSearchResults([]);
    }
  }

  function handleCategoryClick(category: string) {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedCategory(selectedCategory === category ? null : category);
  }

  async function handleConceptClick(concept: BusinessConcept) {
    setSelectedConcept(concept);
    // Record the view
    if (userId) {
      await recordConceptView(concept.id, userId);
    }
  }

  function handleCloseModal() {
    setSelectedConcept(null);
    // Refresh data to show updated view counts
    loadInitialData();
  }

  const displayConcepts = searchResults.length > 0 
    ? searchResults 
    : selectedCategory 
    ? categoryConcepts 
    : [];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🎓 Business Mastery Knowledge Base
        </h2>
        <p className="text-gray-600">
          Master the concepts that drive business success. Search, learn, take notes, and implement.
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search for business concepts... (e.g., 'objections', 'cold calling', '10x')"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg
            className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Category Filters */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Browse by Category:</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(CONCEPT_CATEGORIES).map(([key, category]) => (
            <button
              key={key}
              onClick={() => handleCategoryClick(key)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === key
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Results or Category Results */}
      {displayConcepts.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {searchQuery ? `Search Results (${displayConcepts.length})` : `${CONCEPT_CATEGORIES[selectedCategory!]?.label} (${displayConcepts.length})`}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayConcepts.map((concept) => (
              <ConceptCard 
                key={concept.id} 
                concept={concept} 
                onClick={() => handleConceptClick(concept)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Popular This Week */}
      {!searchQuery && !selectedCategory && popularConcepts.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <span className="mr-2">🔥</span>
            Popular This Week
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularConcepts.map((concept) => (
              <ConceptCard 
                key={concept.id} 
                concept={concept} 
                onClick={() => handleConceptClick(concept)}
                showViews
              />
            ))}
          </div>
        </div>
      )}

      {/* Recently Viewed */}
      {!searchQuery && !selectedCategory && recentConcepts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <span className="mr-2">📚</span>
            Recently Studied
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentConcepts.map((concept) => (
              <ConceptCard 
                key={concept.id} 
                concept={concept} 
                onClick={() => handleConceptClick(concept)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !searchQuery && !selectedCategory && popularConcepts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎓</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Welcome to Your Business Mastery Knowledge Base
          </h3>
          <p className="text-gray-600 mb-4">
            Search for a concept or browse by category to get started
          </p>
        </div>
      )}

      {/* No Results */}
      {searchQuery && searchResults.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No concepts found for "{searchQuery}"
          </h3>
          <p className="text-gray-600">
            Try a different search term or browse by category
          </p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading concepts...</p>
        </div>
      )}

      {/* Concept Detail Modal */}
      {selectedConcept && (
        <ConceptDetailModal
          concept={selectedConcept}
          userId={userId}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

// Concept Card Component
interface ConceptCardProps {
  concept: BusinessConcept;
  onClick: () => void;
  showViews?: boolean;
}

function ConceptCard({ concept, onClick, showViews }: ConceptCardProps) {
  const categoryInfo = CONCEPT_CATEGORIES[concept.category];
  
  return (
    <div
      onClick={onClick}
      className="p-4 border border-gray-200 rounded-lg hover:shadow-md hover:border-blue-300 transition-all cursor-pointer bg-white"
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-gray-900 flex-1 pr-2">
          {concept.title}
        </h4>
        <span className="text-lg flex-shrink-0">
          {categoryInfo?.icon}
        </span>
      </div>
      
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
        {concept.definition}
      </p>
      
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-3">
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {concept.estimated_read_time} min
          </span>
          <span className={`px-2 py-1 rounded ${
            concept.difficulty_level === 'beginner' ? 'bg-green-100 text-green-800' :
            concept.difficulty_level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {concept.difficulty_level}
          </span>
        </div>
        {showViews && (
          <span className="flex items-center text-gray-500">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {concept.view_count}
          </span>
        )}
      </div>
    </div>
  );
}
