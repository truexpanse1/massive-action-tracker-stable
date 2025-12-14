// Image Templates Library - Premium Marketing Asset Generator

export interface ImageTemplate {
  name: string;
  prompt: string;
  aspectRatio: string;
  category: string;
}

// SOCIAL MEDIA PRESETS
export const socialMediaPresets = [
  { value: '1:1', label: 'Instagram Post (1:1)', size: '1080x1080px' },
  { value: '9:16', label: 'Instagram Story (9:16)', size: '1080x1920px' },
  { value: '9:16', label: 'TikTok Video (9:16)', size: '1080x1920px' },
  { value: '16:9', label: 'YouTube Thumbnail (16:9)', size: '1280x720px' },
  { value: '1.91:1', label: 'Facebook Post (1.91:1)', size: '1200x630px' },
  { value: '16:9', label: 'LinkedIn Post (16:9)', size: '1200x627px' },
  { value: '1:1', label: 'LinkedIn Carousel (1:1)', size: '1080x1080px' },
  { value: '16:9', label: 'Twitter/X Header (16:9)', size: '1500x500px' },
  { value: '4:5', label: 'Pinterest Pin (4:5)', size: '1000x1250px' },
  { value: '1:1', label: 'Facebook Profile (1:1)', size: '180x180px' },
];

// INDUSTRY-SPECIFIC TEMPLATES
export const industryTemplates = {
  'Real Estate': [
    { name: 'Luxury Property Showcase', prompt: 'Elegant luxury home exterior with modern architecture, manicured landscaping, golden hour lighting, professional real estate photography style, high-end residential property', aspectRatio: '4:3', category: 'Real Estate' },
    { name: 'Open House Invitation', prompt: 'Welcoming open house scene with "Welcome Home" aesthetic, bright and inviting residential entrance, professional staging, warm afternoon lighting, real estate marketing style', aspectRatio: '16:9', category: 'Real Estate' },
    { name: 'Just Sold Celebration', prompt: 'Celebratory real estate success image with sold sign, happy homeowners silhouette, keys in hand, achievement and success theme, professional photography', aspectRatio: '1:1', category: 'Real Estate' },
    { name: 'New Listing Feature', prompt: 'Eye-catching "New Listing" property feature image, stunning home exterior, professional real estate photography, vibrant and inviting, market-ready presentation', aspectRatio: '3:4', category: 'Real Estate' },
    { name: 'Agent Headshot Background', prompt: 'Professional real estate office background, modern and clean, subtle luxury elements, perfect for agent headshots, corporate and trustworthy aesthetic', aspectRatio: '4:3', category: 'Real Estate' },
  ],
  
  'Insurance': [
    { name: 'Family Protection Theme', prompt: 'Caring family protection concept, silhouette of family under umbrella, security and safety theme, warm and trustworthy, insurance marketing style, professional and reassuring', aspectRatio: '16:9', category: 'Insurance' },
    { name: 'Life Insurance Security', prompt: 'Life insurance security concept, peaceful family scene, protection and peace of mind theme, soft lighting, professional and caring aesthetic, trust-building imagery', aspectRatio: '4:3', category: 'Insurance' },
    { name: 'Auto Insurance Coverage', prompt: 'Modern car protection concept, sleek vehicle with shield imagery, safety and coverage theme, professional automotive photography, insurance marketing style', aspectRatio: '16:9', category: 'Insurance' },
    { name: 'Health Insurance Wellness', prompt: 'Health and wellness concept, active healthy lifestyle, medical protection theme, bright and positive, professional healthcare imagery, trust and care aesthetic', aspectRatio: '1:1', category: 'Insurance' },
    { name: 'Business Insurance Professional', prompt: 'Professional business protection concept, modern office building, corporate security theme, trustworthy and established, commercial insurance marketing style', aspectRatio: '16:9', category: 'Insurance' },
  ],

  'Financial Services': [
    { name: 'Wealth Management Success', prompt: 'Financial success and wealth growth concept, upward trending graphs, prosperity theme, professional financial imagery, trust and expertise aesthetic, corporate and sophisticated', aspectRatio: '16:9', category: 'Financial Services' },
    { name: 'Retirement Planning Peace', prompt: 'Peaceful retirement planning concept, serene beach or mountain scene, financial security theme, relaxed and confident, professional financial planning imagery', aspectRatio: '4:3', category: 'Financial Services' },
    { name: 'Investment Growth Chart', prompt: 'Investment portfolio growth visualization, professional financial charts and graphs, success and prosperity theme, corporate financial imagery, data-driven aesthetic', aspectRatio: '16:9', category: 'Financial Services' },
    { name: 'Financial Advisor Trust', prompt: 'Professional financial advisor consultation scene, modern office setting, trust and expertise theme, corporate and approachable, financial services marketing', aspectRatio: '4:3', category: 'Financial Services' },
    { name: 'Tax Planning Strategy', prompt: 'Tax planning and strategy concept, organized financial documents, professional accounting imagery, efficiency and expertise theme, corporate and trustworthy', aspectRatio: '16:9', category: 'Financial Services' },
  ],

  'B2B Technology': [
    { name: 'Cloud Solutions Innovation', prompt: 'Modern cloud computing concept, futuristic technology visualization, innovation and efficiency theme, professional tech imagery, corporate and cutting-edge aesthetic', aspectRatio: '16:9', category: 'B2B Technology' },
    { name: 'Cybersecurity Protection', prompt: 'Cybersecurity and data protection concept, digital security visualization, trust and safety theme, professional technology imagery, corporate and secure aesthetic', aspectRatio: '16:9', category: 'B2B Technology' },
    { name: 'AI & Automation Future', prompt: 'Artificial intelligence and automation concept, futuristic AI visualization, innovation and efficiency theme, professional technology imagery, cutting-edge and sophisticated', aspectRatio: '16:9', category: 'B2B Technology' },
    { name: 'SaaS Platform Interface', prompt: 'Modern SaaS platform dashboard visualization, clean user interface design, professional software imagery, efficiency and usability theme, corporate tech aesthetic', aspectRatio: '16:9', category: 'B2B Technology' },
    { name: 'Data Analytics Insights', prompt: 'Business intelligence and data analytics concept, professional data visualization, insights and growth theme, corporate technology imagery, sophisticated and data-driven', aspectRatio: '16:9', category: 'B2B Technology' },
  ],

  'Healthcare': [
    { name: 'Medical Care Compassion', prompt: 'Compassionate healthcare professional, caring medical environment, trust and expertise theme, professional healthcare photography, warm and reassuring aesthetic', aspectRatio: '4:3', category: 'Healthcare' },
    { name: 'Wellness & Prevention', prompt: 'Health and wellness prevention concept, active healthy lifestyle, preventive care theme, bright and positive, professional healthcare imagery, encouraging aesthetic', aspectRatio: '1:1', category: 'Healthcare' },
    { name: 'Telemedicine Innovation', prompt: 'Modern telemedicine consultation concept, digital healthcare technology, accessibility and convenience theme, professional medical imagery, innovative and caring', aspectRatio: '16:9', category: 'Healthcare' },
    { name: 'Patient Success Story', prompt: 'Positive patient outcome and recovery, healthcare success story, hope and healing theme, professional medical photography, uplifting and inspirational', aspectRatio: '4:3', category: 'Healthcare' },
    { name: 'Medical Facility Modern', prompt: 'State-of-the-art medical facility, modern healthcare environment, advanced care theme, professional hospital photography, clean and trustworthy aesthetic', aspectRatio: '16:9', category: 'Healthcare' },
  ],

  'Consulting': [
    { name: 'Business Strategy Session', prompt: 'Professional business consulting session, modern boardroom meeting, strategy and growth theme, corporate photography, collaborative and expert aesthetic', aspectRatio: '16:9', category: 'Consulting' },
    { name: 'Executive Leadership', prompt: 'Executive leadership and management concept, professional business leader, authority and expertise theme, corporate photography, confident and trustworthy', aspectRatio: '4:3', category: 'Consulting' },
    { name: 'Growth & Transformation', prompt: 'Business growth and transformation concept, upward trajectory visualization, success and innovation theme, professional consulting imagery, dynamic and progressive', aspectRatio: '16:9', category: 'Consulting' },
    { name: 'Team Collaboration', prompt: 'Collaborative team working together, modern office environment, teamwork and synergy theme, professional business photography, energetic and productive', aspectRatio: '16:9', category: 'Consulting' },
    { name: 'Problem Solving Expert', prompt: 'Problem-solving and strategic thinking concept, professional consultant analyzing data, expertise and solutions theme, corporate imagery, analytical and confident', aspectRatio: '4:3', category: 'Consulting' },
  ],
};

// MARKETING PIECE TEMPLATES
export const marketingPieceTemplates = {
  'Email Marketing': [
    { name: 'Newsletter Header - Professional', prompt: 'Professional email newsletter header design, clean and modern layout, corporate branding space, minimalist aesthetic, business communication style, high-end marketing design', aspectRatio: '16:9', category: 'Email Marketing' },
    { name: 'Newsletter Header - Bold', prompt: 'Bold and eye-catching email header, vibrant colors and dynamic composition, attention-grabbing design, modern marketing aesthetic, energetic and engaging', aspectRatio: '16:9', category: 'Email Marketing' },
    { name: 'Promotional Email Banner', prompt: 'Promotional email campaign banner, special offer aesthetic, compelling visual design, marketing-focused composition, conversion-optimized imagery, professional and persuasive', aspectRatio: '16:9', category: 'Email Marketing' },
    { name: 'Welcome Email Hero', prompt: 'Welcoming email hero image, warm and inviting design, onboarding aesthetic, professional welcome message visual, friendly and engaging, brand introduction style', aspectRatio: '16:9', category: 'Email Marketing' },
    { name: 'Product Showcase Email', prompt: 'Product feature showcase for email, clean product photography style, professional e-commerce aesthetic, conversion-focused design, high-quality marketing imagery', aspectRatio: '4:3', category: 'Email Marketing' },
  ],

  'Social Media Content': [
    { name: 'Motivational Quote Post', prompt: 'Inspirational motivational quote background, professional typography space, uplifting and energetic design, social media optimized, engaging and shareable aesthetic', aspectRatio: '1:1', category: 'Social Media Content' },
    { name: 'Behind-the-Scenes Story', prompt: 'Behind-the-scenes business moment, authentic and relatable, company culture showcase, professional yet casual, social media storytelling style, engaging and personal', aspectRatio: '9:16', category: 'Social Media Content' },
    { name: 'Product Announcement', prompt: 'Exciting product announcement visual, bold and attention-grabbing, launch campaign aesthetic, professional marketing design, buzz-worthy and shareable', aspectRatio: '1:1', category: 'Social Media Content' },
    { name: 'Tips & Advice Carousel', prompt: 'Educational tips and advice graphic, clean infographic style, professional knowledge-sharing design, social media carousel optimized, informative and valuable aesthetic', aspectRatio: '1:1', category: 'Social Media Content' },
    { name: 'Event Promotion Post', prompt: 'Event promotion and invitation design, exciting and engaging visual, call-to-action focused, professional event marketing, compelling and informative aesthetic', aspectRatio: '1:1', category: 'Social Media Content' },
    { name: 'Customer Testimonial', prompt: 'Customer testimonial and review showcase, trust-building design, social proof aesthetic, professional testimonial visual, credible and persuasive', aspectRatio: '1:1', category: 'Social Media Content' },
  ],

  'Print Materials': [
    { name: 'Business Flyer - Modern', prompt: 'Modern business flyer background, clean and professional design, corporate aesthetic, print-ready quality, high-resolution marketing material, sophisticated and polished', aspectRatio: '3:4', category: 'Print Materials' },
    { name: 'Business Flyer - Creative', prompt: 'Creative and eye-catching flyer design, bold visual elements, artistic marketing aesthetic, print-optimized quality, unique and memorable design', aspectRatio: '3:4', category: 'Print Materials' },
    { name: 'Postcard Mailer', prompt: 'Direct mail postcard design, attention-grabbing visual, professional marketing aesthetic, print-ready quality, compelling and conversion-focused', aspectRatio: '4:3', category: 'Print Materials' },
    { name: 'Brochure Cover', prompt: 'Professional brochure cover design, premium business aesthetic, corporate marketing material, high-quality print design, sophisticated and trustworthy', aspectRatio: '3:4', category: 'Print Materials' },
    { name: 'Event Poster', prompt: 'Event poster design, bold and informative visual, professional event marketing, print-ready quality, attention-grabbing and clear communication', aspectRatio: '3:4', category: 'Print Materials' },
  ],

  'Presentation Graphics': [
    { name: 'Title Slide Background', prompt: 'Professional presentation title slide background, clean and modern design, corporate aesthetic, minimalist and sophisticated, business presentation style', aspectRatio: '16:9', category: 'Presentation Graphics' },
    { name: 'Section Divider Slide', prompt: 'Presentation section divider background, visual break design, professional transition slide, corporate aesthetic, clean and purposeful', aspectRatio: '16:9', category: 'Presentation Graphics' },
    { name: 'Data Visualization Background', prompt: 'Data presentation background, professional chart and graph aesthetic, corporate analytics style, clean and data-focused design, business intelligence visual', aspectRatio: '16:9', category: 'Presentation Graphics' },
    { name: 'Thank You Slide', prompt: 'Professional thank you slide background, closing presentation design, corporate and appreciative aesthetic, memorable conclusion visual, polished and professional', aspectRatio: '16:9', category: 'Presentation Graphics' },
    { name: 'Team Introduction Slide', prompt: 'Team introduction slide background, professional headshot backdrop, corporate team presentation, clean and people-focused design, trustworthy aesthetic', aspectRatio: '16:9', category: 'Presentation Graphics' },
  ],

  'Website Graphics': [
    { name: 'Hero Section Background', prompt: 'Website hero section background, modern and engaging design, professional web aesthetic, high-quality digital imagery, conversion-optimized visual', aspectRatio: '16:9', category: 'Website Graphics' },
    { name: 'About Us Page Banner', prompt: 'About us page header image, company story visual, professional corporate photography, trustworthy and authentic aesthetic, brand-building design', aspectRatio: '16:9', category: 'Website Graphics' },
    { name: 'Services Page Feature', prompt: 'Services page feature image, professional service showcase, corporate web design, high-quality digital asset, value-focused visual', aspectRatio: '4:3', category: 'Website Graphics' },
    { name: 'Blog Post Featured Image', prompt: 'Blog post featured image, engaging article visual, professional content marketing, SEO-optimized imagery, shareable and clickable aesthetic', aspectRatio: '16:9', category: 'Website Graphics' },
    { name: 'Contact Page Background', prompt: 'Contact page background image, welcoming and approachable design, professional communication visual, trust-building aesthetic, call-to-action focused', aspectRatio: '16:9', category: 'Website Graphics' },
  ],

  'Advertising': [
    { name: 'Google Display Ad', prompt: 'Google display ad creative, attention-grabbing design, professional digital advertising, click-worthy visual, conversion-optimized imagery, marketing campaign style', aspectRatio: '16:9', category: 'Advertising' },
    { name: 'Facebook Ad Creative', prompt: 'Facebook advertising creative, scroll-stopping visual, social media ad optimized, professional marketing design, engagement-focused aesthetic, campaign-ready', aspectRatio: '1:1', category: 'Advertising' },
    { name: 'LinkedIn Sponsored Content', prompt: 'LinkedIn sponsored content image, professional B2B advertising, corporate marketing aesthetic, business-focused visual, lead generation optimized', aspectRatio: '16:9', category: 'Advertising' },
    { name: 'Instagram Ad Story', prompt: 'Instagram story ad creative, mobile-optimized design, attention-grabbing visual, social media advertising style, swipe-up worthy aesthetic', aspectRatio: '9:16', category: 'Advertising' },
    { name: 'Retargeting Ad Banner', prompt: 'Retargeting campaign banner, reminder and conversion-focused, professional remarketing design, brand recall visual, persuasive advertising aesthetic', aspectRatio: '16:9', category: 'Advertising' },
  ],
};

// STYLE MODIFIERS
export const styleOptions = [
  { value: 'photorealistic', label: 'Photorealistic', description: 'Looks like a real photograph' },
  { value: 'professional', label: 'Professional', description: 'Corporate and polished' },
  { value: 'modern', label: 'Modern', description: 'Contemporary and clean' },
  { value: 'minimalist', label: 'Minimalist', description: 'Simple and elegant' },
  { value: 'bold', label: 'Bold & Vibrant', description: 'Eye-catching and colorful' },
  { value: 'elegant', label: 'Elegant', description: 'Sophisticated and refined' },
  { value: 'creative', label: 'Creative', description: 'Artistic and unique' },
  { value: 'corporate', label: 'Corporate', description: 'Business-focused and trustworthy' },
];

// COLOR THEMES
export const colorThemes = [
  { value: 'blue', label: 'Trust Blue', description: 'Professional and reliable' },
  { value: 'green', label: 'Growth Green', description: 'Fresh and prosperous' },
  { value: 'red', label: 'Energy Red', description: 'Bold and attention-grabbing' },
  { value: 'purple', label: 'Premium Purple', description: 'Luxury and sophistication' },
  { value: 'orange', label: 'Optimistic Orange', description: 'Warm and friendly' },
  { value: 'neutral', label: 'Neutral Tones', description: 'Versatile and timeless' },
  { value: 'monochrome', label: 'Black & White', description: 'Classic and dramatic' },
  { value: 'warm', label: 'Warm Tones', description: 'Inviting and comfortable' },
  { value: 'cool', label: 'Cool Tones', description: 'Calm and professional' },
];
