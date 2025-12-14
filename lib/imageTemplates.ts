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
  'Accountant': [
    { name: 'Tax Season Professional', prompt: 'Professional accountant workspace, organized tax documents and calculator, expertise and precision theme, corporate office setting, trustworthy and detail-oriented aesthetic', aspectRatio: '16:9', category: 'Accountant' },
    { name: 'Financial Planning Meeting', prompt: 'Accountant consulting with client, financial planning session, professional office environment, trust and expertise theme, collaborative and approachable', aspectRatio: '4:3', category: 'Accountant' },
    { name: 'Bookkeeping Excellence', prompt: 'Clean organized bookkeeping concept, professional financial records, accuracy and efficiency theme, modern accounting aesthetic, reliable and systematic', aspectRatio: '16:9', category: 'Accountant' },
    { name: 'Business Growth Analytics', prompt: 'Business financial growth charts and analytics, professional accounting visualization, success and prosperity theme, data-driven and insightful', aspectRatio: '16:9', category: 'Accountant' },
    { name: 'CPA Credibility', prompt: 'Professional CPA certification and credentials showcase, trust and authority theme, corporate accounting aesthetic, established and credible', aspectRatio: '4:3', category: 'Accountant' },
  ],

  'Business Coach': [
    { name: 'Leadership Development', prompt: 'Business coaching leadership session, professional mentor and mentee, growth and transformation theme, inspiring and motivational aesthetic, success-focused', aspectRatio: '16:9', category: 'Business Coach' },
    { name: 'Goal Achievement Vision', prompt: 'Goal setting and achievement visualization, business success concept, motivational and inspiring theme, professional coaching imagery, empowering and focused', aspectRatio: '1:1', category: 'Business Coach' },
    { name: 'Strategy Workshop', prompt: 'Business strategy workshop session, collaborative planning environment, professional coaching setting, growth and innovation theme, dynamic and engaging', aspectRatio: '16:9', category: 'Business Coach' },
    { name: 'Success Mindset', prompt: 'Success mindset and breakthrough concept, motivational business coaching theme, professional and inspiring imagery, transformational and powerful', aspectRatio: '4:3', category: 'Business Coach' },
    { name: 'Executive Coaching', prompt: 'Executive business coaching session, high-level professional development, leadership and excellence theme, sophisticated and impactful', aspectRatio: '16:9', category: 'Business Coach' },
  ],

  'Electrician': [
    { name: 'Professional Installation', prompt: 'Professional electrician installing modern electrical panel, skilled tradesperson at work, expertise and safety theme, clean and professional service aesthetic', aspectRatio: '4:3', category: 'Electrician' },
    { name: 'Emergency Service Ready', prompt: 'Emergency electrical service truck and equipment, 24/7 availability theme, reliable and responsive service, professional and trustworthy', aspectRatio: '16:9', category: 'Electrician' },
    { name: 'Smart Home Technology', prompt: 'Modern smart home electrical installation, cutting-edge technology and automation, professional electrical service, innovative and efficient', aspectRatio: '16:9', category: 'Electrician' },
    { name: 'Commercial Electrical', prompt: 'Commercial electrical project, large-scale professional installation, industrial and commercial theme, expert and reliable service', aspectRatio: '16:9', category: 'Electrician' },
    { name: 'Safety Inspection', prompt: 'Electrical safety inspection and testing, professional electrician with diagnostic equipment, safety and compliance theme, thorough and certified', aspectRatio: '4:3', category: 'Electrician' },
  ],

  'General Contractor': [
    { name: 'Construction Project', prompt: 'Active construction site with professional contractor, building project in progress, quality and craftsmanship theme, reliable and experienced', aspectRatio: '16:9', category: 'General Contractor' },
    { name: 'Home Renovation', prompt: 'Beautiful home renovation transformation, before and after concept, quality craftsmanship theme, professional contractor work, impressive results', aspectRatio: '4:3', category: 'General Contractor' },
    { name: 'Commercial Build', prompt: 'Commercial construction project, large-scale building development, professional contractor management, quality and efficiency theme', aspectRatio: '16:9', category: 'General Contractor' },
    { name: 'Custom Build Quality', prompt: 'Custom home construction, high-end building project, craftsmanship and attention to detail theme, premium contractor service', aspectRatio: '4:3', category: 'General Contractor' },
    { name: 'Project Planning', prompt: 'Contractor reviewing blueprints and plans, professional project management, expertise and precision theme, organized and thorough', aspectRatio: '16:9', category: 'General Contractor' },
  ],

  'HVAC': [
    { name: 'System Installation', prompt: 'Professional HVAC technician installing modern heating and cooling system, expert service and quality equipment, comfort and efficiency theme', aspectRatio: '4:3', category: 'HVAC' },
    { name: 'Maintenance Service', prompt: 'HVAC maintenance and tune-up service, professional technician with diagnostic tools, preventive care theme, reliable and thorough', aspectRatio: '16:9', category: 'HVAC' },
    { name: 'Energy Efficiency', prompt: 'Energy-efficient HVAC system concept, modern climate control technology, savings and comfort theme, professional and eco-friendly', aspectRatio: '16:9', category: 'HVAC' },
    { name: 'Emergency Repair', prompt: 'Emergency HVAC repair service, 24/7 availability and quick response, reliable and professional service, comfort restoration theme', aspectRatio: '16:9', category: 'HVAC' },
    { name: 'Indoor Comfort', prompt: 'Perfect indoor climate and comfort concept, modern HVAC system benefits, comfort and quality of life theme, professional and inviting', aspectRatio: '4:3', category: 'HVAC' },
  ],

  'Hardscaper': [
    { name: 'Patio Paradise', prompt: 'Beautiful hardscape patio design, professional stone or paver installation, outdoor living space theme, elegant and inviting', aspectRatio: '16:9', category: 'Hardscaper' },
    { name: 'Retaining Wall Mastery', prompt: 'Professional retaining wall construction, expert hardscape engineering, functional and beautiful design, quality craftsmanship', aspectRatio: '4:3', category: 'Hardscaper' },
    { name: 'Driveway Excellence', prompt: 'Premium driveway hardscape installation, professional paver or concrete work, curb appeal and durability theme, high-quality results', aspectRatio: '16:9', category: 'Hardscaper' },
    { name: 'Outdoor Kitchen', prompt: 'Luxury outdoor kitchen hardscape, professional stone and masonry work, outdoor entertainment theme, sophisticated and functional', aspectRatio: '16:9', category: 'Hardscaper' },
    { name: 'Walkway Design', prompt: 'Beautiful hardscape walkway and pathway, professional landscape integration, aesthetic and functional design, inviting and well-crafted', aspectRatio: '4:3', category: 'Hardscaper' },
  ],

  'IT Services': [
    { name: 'Network Solutions', prompt: 'Professional IT network infrastructure, server room and technology systems, reliability and security theme, expert IT services', aspectRatio: '16:9', category: 'IT Services' },
    { name: 'Cybersecurity Protection', prompt: 'IT cybersecurity and data protection concept, digital security shield, safety and trust theme, professional IT security services', aspectRatio: '16:9', category: 'IT Services' },
    { name: 'Cloud Migration', prompt: 'Cloud computing and migration services, modern IT infrastructure, efficiency and scalability theme, professional cloud solutions', aspectRatio: '16:9', category: 'IT Services' },
    { name: 'Help Desk Support', prompt: 'IT support and help desk service, professional technician assisting client, responsive and reliable support theme, customer-focused', aspectRatio: '4:3', category: 'IT Services' },
    { name: 'Managed IT Services', prompt: 'Comprehensive managed IT services concept, proactive technology management, efficiency and peace of mind theme, professional and reliable', aspectRatio: '16:9', category: 'IT Services' },
  ],

  'Landscaper': [
    { name: 'Lawn Perfection', prompt: 'Perfectly manicured lawn and landscape, professional landscaping service results, lush and beautiful outdoor space, quality and care', aspectRatio: '16:9', category: 'Landscaper' },
    { name: 'Garden Design', prompt: 'Beautiful garden landscape design, professional planting and arrangement, colorful and vibrant outdoor space, artistic and natural', aspectRatio: '4:3', category: 'Landscaper' },
    { name: 'Seasonal Cleanup', prompt: 'Professional landscape maintenance and cleanup, seasonal yard care service, neat and well-maintained property, reliable service', aspectRatio: '16:9', category: 'Landscaper' },
    { name: 'Landscape Transformation', prompt: 'Dramatic landscape transformation before and after, professional landscaping results, impressive improvement theme, quality workmanship', aspectRatio: '16:9', category: 'Landscaper' },
    { name: 'Outdoor Living Space', prompt: 'Beautiful outdoor living space with professional landscaping, integrated design and natural elements, relaxing and inviting atmosphere', aspectRatio: '4:3', category: 'Landscaper' },
  ],

  'Lawyer': [
    { name: 'Legal Expertise', prompt: 'Professional lawyer in office with law books, legal expertise and authority theme, trustworthy and credible, corporate legal aesthetic', aspectRatio: '4:3', category: 'Lawyer' },
    { name: 'Courtroom Advocacy', prompt: 'Courtroom and legal advocacy concept, professional legal representation, justice and expertise theme, authoritative and confident', aspectRatio: '16:9', category: 'Lawyer' },
    { name: 'Contract Review', prompt: 'Legal contract review and consultation, professional lawyer analyzing documents, attention to detail theme, thorough and expert', aspectRatio: '16:9', category: 'Lawyer' },
    { name: 'Client Consultation', prompt: 'Lawyer consulting with client, professional legal advice session, trust and guidance theme, approachable and expert', aspectRatio: '4:3', category: 'Lawyer' },
    { name: 'Justice & Protection', prompt: 'Legal protection and justice concept, scales of justice and legal symbols, defense and advocacy theme, professional and trustworthy', aspectRatio: '16:9', category: 'Lawyer' },
  ],

  'Marketing Agency': [
    { name: 'Creative Campaign', prompt: 'Creative marketing campaign concept, brainstorming and strategy session, innovation and results theme, dynamic agency environment', aspectRatio: '16:9', category: 'Marketing Agency' },
    { name: 'Digital Marketing', prompt: 'Digital marketing analytics and performance, social media and online presence, growth and engagement theme, data-driven results', aspectRatio: '16:9', category: 'Marketing Agency' },
    { name: 'Brand Development', prompt: 'Brand development and identity creation, professional branding services, creative and strategic theme, impactful and memorable', aspectRatio: '4:3', category: 'Marketing Agency' },
    { name: 'Content Creation', prompt: 'Content creation and marketing production, professional creative team at work, engaging and quality content theme, innovative and strategic', aspectRatio: '16:9', category: 'Marketing Agency' },
    { name: 'ROI Success', prompt: 'Marketing ROI and business growth results, successful campaign metrics, performance and results theme, proven and effective', aspectRatio: '16:9', category: 'Marketing Agency' },
  ],

  'Painter': [
    { name: 'Interior Transformation', prompt: 'Professional interior painting transformation, fresh painted room with perfect finish, quality and craftsmanship theme, clean and beautiful results', aspectRatio: '4:3', category: 'Painter' },
    { name: 'Exterior Excellence', prompt: 'Exterior house painting project, professional painter at work, curb appeal and protection theme, quality and durability', aspectRatio: '16:9', category: 'Painter' },
    { name: 'Color Consultation', prompt: 'Professional color consultation and paint selection, expert advice and samples, personalized and creative theme, helpful and knowledgeable', aspectRatio: '4:3', category: 'Painter' },
    { name: 'Commercial Painting', prompt: 'Commercial painting project, large-scale professional work, efficiency and quality theme, reliable business service', aspectRatio: '16:9', category: 'Painter' },
    { name: 'Detail & Precision', prompt: 'Precision painting detail work, professional craftsmanship close-up, attention to detail theme, quality and expertise', aspectRatio: '4:3', category: 'Painter' },
  ],

  'Personal Trainer': [
    { name: 'Fitness Transformation', prompt: 'Personal training fitness transformation, client achieving goals with trainer support, motivation and results theme, inspiring and empowering', aspectRatio: '16:9', category: 'Personal Trainer' },
    { name: 'Workout Session', prompt: 'Personal training workout session, trainer coaching client, professional fitness guidance, energetic and motivating', aspectRatio: '4:3', category: 'Personal Trainer' },
    { name: 'Nutrition Coaching', prompt: 'Personal trainer nutrition coaching, healthy meal planning and guidance, wellness and health theme, holistic and supportive', aspectRatio: '16:9', category: 'Personal Trainer' },
    { name: 'Strength Training', prompt: 'Strength training with personal trainer, professional fitness coaching, power and progress theme, motivating and results-focused', aspectRatio: '4:3', category: 'Personal Trainer' },
    { name: 'Goal Achievement', prompt: 'Fitness goal achievement celebration, personal training success story, transformation and victory theme, inspiring and motivational', aspectRatio: '1:1', category: 'Personal Trainer' },
  ],

  'Photographer': [
    { name: 'Portrait Session', prompt: 'Professional portrait photography session, photographer with camera and lighting, artistic and creative theme, quality and expertise', aspectRatio: '4:3', category: 'Photographer' },
    { name: 'Wedding Photography', prompt: 'Beautiful wedding photography moment, romantic and elegant capture, special memories theme, artistic and professional', aspectRatio: '16:9', category: 'Photographer' },
    { name: 'Commercial Photography', prompt: 'Commercial photography studio setup, professional product or business photography, quality and precision theme, expert and versatile', aspectRatio: '16:9', category: 'Photographer' },
    { name: 'Event Coverage', prompt: 'Event photography coverage, photographer capturing special moments, professional documentation theme, reliable and skilled', aspectRatio: '16:9', category: 'Photographer' },
    { name: 'Creative Vision', prompt: 'Creative photography concept, artistic vision and unique perspective, innovation and artistry theme, distinctive and professional', aspectRatio: '4:3', category: 'Photographer' },
  ],

  'Plumber': [
    { name: 'Expert Installation', prompt: 'Professional plumber installing modern fixtures, expert plumbing service, quality and reliability theme, skilled and trustworthy', aspectRatio: '4:3', category: 'Plumber' },
    { name: 'Emergency Service', prompt: 'Emergency plumbing service response, 24/7 availability and quick repair, reliable and professional service, problem-solving theme', aspectRatio: '16:9', category: 'Plumber' },
    { name: 'Pipe Repair', prompt: 'Professional pipe repair and plumbing maintenance, expert diagnosis and fix, quality workmanship theme, thorough and reliable', aspectRatio: '16:9', category: 'Plumber' },
    { name: 'Bathroom Renovation', prompt: 'Bathroom plumbing renovation, modern fixture installation, upgrade and improvement theme, quality and style', aspectRatio: '4:3', category: 'Plumber' },
    { name: 'Water Heater Service', prompt: 'Water heater installation or repair service, professional plumbing expertise, comfort and efficiency theme, reliable and expert', aspectRatio: '16:9', category: 'Plumber' },
  ],

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

  'Roofer': [
    { name: 'Roof Installation', prompt: 'Professional roofing installation project, roofer working on quality roof, craftsmanship and durability theme, reliable and expert service', aspectRatio: '16:9', category: 'Roofer' },
    { name: 'Storm Damage Repair', prompt: 'Emergency roof repair after storm damage, professional roofing restoration, quick response and quality work theme, reliable and trustworthy', aspectRatio: '16:9', category: 'Roofer' },
    { name: 'Roof Inspection', prompt: 'Professional roof inspection service, roofer examining roof condition, preventive maintenance theme, thorough and expert assessment', aspectRatio: '4:3', category: 'Roofer' },
    { name: 'New Construction Roofing', prompt: 'New construction roofing project, professional installation on new build, quality and precision theme, expert craftsmanship', aspectRatio: '16:9', category: 'Roofer' },
    { name: 'Roof Replacement', prompt: 'Complete roof replacement project, transformation and upgrade, quality materials and workmanship theme, professional and reliable', aspectRatio: '4:3', category: 'Roofer' },
  ],

  'Software/SaaS': [
    { name: 'Product Dashboard', prompt: 'Modern SaaS product dashboard interface, clean user experience design, professional software visualization, innovation and usability theme', aspectRatio: '16:9', category: 'Software/SaaS' },
    { name: 'Development Team', prompt: 'Software development team collaborating, modern tech office environment, innovation and expertise theme, professional and dynamic', aspectRatio: '16:9', category: 'Software/SaaS' },
    { name: 'Cloud Platform', prompt: 'Cloud-based software platform concept, scalable technology infrastructure, efficiency and reliability theme, professional and cutting-edge', aspectRatio: '16:9', category: 'Software/SaaS' },
    { name: 'Integration Ecosystem', prompt: 'Software integration and API ecosystem, connected platforms visualization, versatility and compatibility theme, professional tech imagery', aspectRatio: '16:9', category: 'Software/SaaS' },
    { name: 'Customer Success', prompt: 'SaaS customer success and support, professional client relationship, satisfaction and results theme, trustworthy and supportive', aspectRatio: '4:3', category: 'Software/SaaS' },
  ],

  'Web Developer': [
    { name: 'Modern Website Design', prompt: 'Modern responsive website design showcase, professional web development, clean user interface theme, innovative and functional', aspectRatio: '16:9', category: 'Web Developer' },
    { name: 'Coding Workspace', prompt: 'Professional web developer coding workspace, multiple monitors with code, expertise and precision theme, technical and focused', aspectRatio: '16:9', category: 'Web Developer' },
    { name: 'E-commerce Platform', prompt: 'Professional e-commerce website development, online store platform, conversion and user experience theme, polished and effective', aspectRatio: '16:9', category: 'Web Developer' },
    { name: 'Mobile Responsive', prompt: 'Mobile-responsive web design concept, cross-device compatibility, modern web development theme, professional and versatile', aspectRatio: '4:3', category: 'Web Developer' },
    { name: 'Web Application', prompt: 'Custom web application development, complex functionality and clean interface, professional software engineering theme, sophisticated and powerful', aspectRatio: '16:9', category: 'Web Developer' },
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
