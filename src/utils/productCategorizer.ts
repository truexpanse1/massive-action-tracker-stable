/**
 * Product Categorization Utility
 * Automatically categorizes transaction products into master categories
 */

export type ProductCategory = 
  | 'Business Coaching'
  | 'Website Design'
  | 'Graphic Design'
  | 'CRM Services'
  | 'Marketing Services'
  | 'Other';

interface CategoryKeywords {
  category: ProductCategory;
  keywords: string[];
}

const CATEGORY_MAPPINGS: CategoryKeywords[] = [
  {
    category: 'Business Coaching',
    keywords: [
      'coaching', 'coach', 'consulting', 'consultant', 'mentoring', 'mentor',
      'training', 'trainer', 'advisory', 'advisor', 'strategy session',
      'business development', 'leadership', 'accountability', 'mastermind'
    ]
  },
  {
    category: 'Website Design',
    keywords: [
      'website', 'web design', 'web development', 'web dev', 'site', 'landing page',
      'hosting', 'domain', 'wordpress', 'shopify', 'ecommerce', 'e-commerce',
      'web app', 'webapp', 'portal', 'online store', 'web build', 'redesign'
    ]
  },
  {
    category: 'Graphic Design',
    keywords: [
      'logo', 'branding', 'brand', 'graphic', 'graphics', 'design project',
      'flyer', 'poster', 'banner', 'business card', 'print design', 'illustration',
      'visual identity', 'brand guide', 'style guide', 'mockup', 'layout'
    ]
  },
  {
    category: 'CRM Services',
    keywords: [
      'crm', 'gohighlevel', 'go high level', 'highlevel', 'automation',
      'workflow', 'workflows', 'funnel', 'funnels', 'pipeline', 'sales automation',
      'lead management', 'contact management', 'email automation', 'sms automation'
    ]
  },
  {
    category: 'Marketing Services',
    keywords: [
      'seo', 'search engine', 'ads', 'advertising', 'ppc', 'google ads', 'facebook ads',
      'social media', 'content marketing', 'content creation', 'email marketing',
      'digital marketing', 'marketing campaign', 'lead generation', 'social',
      'instagram', 'facebook', 'linkedin', 'twitter', 'tiktok', 'youtube'
    ]
  }
];

/**
 * Categorize a product name into one of the master categories
 * @param productName - The original product/deal name
 * @returns The categorized product category
 */
export function categorizeProduct(productName: string): ProductCategory {
  if (!productName || productName.trim() === '') {
    return 'Other';
  }

  const lowerName = productName.toLowerCase();

  // Check each category's keywords
  for (const mapping of CATEGORY_MAPPINGS) {
    for (const keyword of mapping.keywords) {
      if (lowerName.includes(keyword)) {
        return mapping.category;
      }
    }
  }

  // Default to 'Other' if no match found
  return 'Other';
}

/**
 * Get all available product categories
 */
export function getProductCategories(): ProductCategory[] {
  return [
    'Business Coaching',
    'Website Design',
    'Graphic Design',
    'CRM Services',
    'Marketing Services',
    'Other'
  ];
}

/**
 * Get category color for UI display
 */
export function getCategoryColor(category: ProductCategory): string {
  const colors: Record<ProductCategory, string> = {
    'Business Coaching': '#8B5CF6',    // Purple
    'Website Design': '#3B82F6',       // Blue
    'Graphic Design': '#EC4899',       // Pink
    'CRM Services': '#10B981',         // Green
    'Marketing Services': '#F59E0B',   // Orange
    'Other': '#6B7280'                 // Gray
  };
  return colors[category];
}

/**
 * Get category emoji for UI display
 */
export function getCategoryEmoji(category: ProductCategory): string {
  const emojis: Record<ProductCategory, string> = {
    'Business Coaching': '🎯',
    'Website Design': '🌐',
    'Graphic Design': '🎨',
    'CRM Services': '⚙️',
    'Marketing Services': '📈',
    'Other': '📦'
  };
  return emojis[category];
}
