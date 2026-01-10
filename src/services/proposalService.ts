import { supabase } from './supabaseClient';
import { generateResponse } from './geminiService';

// Types
export interface ServicePackage {
  id: string;
  company_id: string;
  user_id: string;
  package_name: string;
  description: string | null;
  category: string | null;
  industry: string | null;
  pricing_model: 'monthly' | 'one-time' | 'annual';
  price: number;
  services: Array<{
    name: string;
    description: string;
    ai_description?: string;
  }>;
  is_template: boolean;
  is_active: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface Proposal {
  id: string;
  company_id: string;
  user_id: string;
  hot_lead_id: number | null;
  avatar_id: string | null;
  service_package_id: string | null;
  company_name: string;
  contact_name: string;
  contact_email: string | null;
  contact_phone: string | null;
  industry: string | null;
  ai_problem_analysis: string | null;
  ai_goals_content: string | null;
  ai_solution_narrative: string | null;
  services: Array<{
    name: string;
    description: string;
  }>;
  pricing_model: 'monthly' | 'one-time' | 'annual';
  price: number;
  slug: string;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected';
  view_count: number;
  last_viewed_at: string | null;
  sent_at: string | null;
  accepted_at: string | null;
  acceptance_notes: string | null;
  acceptance_signature: string | null;
  created_at: string;
  updated_at: string;
}

// Generate unique slug for proposal URL
export const generateProposalSlug = (companyName: string): string => {
  const slug = companyName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${slug}-${randomSuffix}`;
};

// Fetch all service packages for a company
export const fetchServicePackages = async (
  companyId: string
): Promise<ServicePackage[]> => {
  const { data, error } = await supabase
    .from('service_packages')
    .select('*')
    .eq('company_id', companyId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching service packages:', error);
    throw error;
  }

  return data || [];
};

// Create a new service package
export const createServicePackage = async (
  packageData: Omit<ServicePackage, 'id' | 'created_at' | 'updated_at' | 'usage_count'>
): Promise<ServicePackage> => {
  const { data, error } = await supabase
    .from('service_packages')
    .insert([packageData])
    .select()
    .single();

  if (error) {
    console.error('Error creating service package:', error);
    throw error;
  }

  return data;
};

// Generate AI content for proposal using avatar data
export const generateProposalContent = async (
  avatarData: {
    avatar_name: string;
    industry: string | null;
    pain_points: string[];
    fears: string[];
    goals: string[];
    dreams: string[];
    desires: string[];
    buying_triggers: string[];
    objections: string[];
  },
  companyName: string,
  services: Array<{ name: string; description: string }>
): Promise<{
  problemAnalysis: string;
  goalsContent: string;
  solutionNarrative: string;
}> => {
  // Generate Problem Analysis (from pain points + fears)
  const problemPrompt = `You are writing a compelling proposal for ${companyName} in the ${avatarData.industry || 'business'} industry.

Based on this Dream Client Profile:
- Pain Points: ${avatarData.pain_points.join(', ')}
- Fears: ${avatarData.fears.join(', ')}

Write a persuasive "The Challenge" section (2-3 paragraphs) that:
1. Acknowledges their specific pain points
2. Addresses their fears
3. Creates urgency
4. Positions our solution as the answer

Write in a professional, empathetic tone. Do NOT use bullet points. Write flowing paragraphs.`;

  const problemAnalysis = await generateResponse(problemPrompt, false);

  // Generate Goals Content (from goals + dreams + desires)
  const goalsPrompt = `You are writing a compelling proposal for ${companyName}.

Based on this Dream Client Profile:
- Goals: ${avatarData.goals.join(', ')}
- Dreams: ${avatarData.dreams.join(', ')}
- Desires: ${avatarData.desires.join(', ')}

Write an inspiring "Your Vision" or "What Success Looks Like" section (2-3 paragraphs) that:
1. Paints a vivid picture of their desired future
2. Shows you understand their aspirations
3. Connects their goals to our services
4. Creates emotional resonance

Write in an inspiring, forward-looking tone. Do NOT use bullet points. Write flowing paragraphs.`;

  const goalsContent = await generateResponse(goalsPrompt, false);

  // Generate Solution Narrative (addressing objections + leveraging buying triggers)
  const solutionPrompt = `You are writing a compelling proposal for ${companyName}.

Our Services:
${services.map(s => `- ${s.name}: ${s.description}`).join('\n')}

Dream Client Profile:
- Buying Triggers: ${avatarData.buying_triggers.join(', ')}
- Common Objections: ${avatarData.objections.join(', ')}

Write a persuasive "Our Solution" section (3-4 paragraphs) that:
1. Explains how our services solve their problems
2. Leverages their buying triggers
3. Preemptively addresses their objections
4. Builds confidence and trust
5. Creates desire to move forward

Write in a confident, solution-focused tone. Do NOT use bullet points. Write flowing paragraphs.`;

  const solutionNarrative = await generateResponse(solutionPrompt, false);

  return {
    problemAnalysis,
    goalsContent,
    solutionNarrative,
  };
};

// Create a new proposal
export const createProposal = async (
  proposalData: Omit<Proposal, 'id' | 'created_at' | 'updated_at' | 'view_count' | 'last_viewed_at' | 'sent_at' | 'accepted_at' | 'acceptance_notes' | 'acceptance_signature'>
): Promise<Proposal> => {
  const { data, error } = await supabase
    .from('proposals')
    .insert([proposalData])
    .select()
    .single();

  if (error) {
    console.error('Error creating proposal:', error);
    throw error;
  }

  return data;
};

// Fetch proposals for a hot lead
export const fetchProposalsByHotLead = async (
  hotLeadId: number
): Promise<Proposal[]> => {
  const { data, error } = await supabase
    .from('proposals')
    .select('*')
    .eq('hot_lead_id', hotLeadId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching proposals:', error);
    throw error;
  }

  return data || [];
};

// Fetch proposal by slug (for public view)
export const fetchProposalBySlug = async (
  slug: string
): Promise<Proposal | null> => {
  const { data, error } = await supabase
    .from('proposals')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found
      return null;
    }
    console.error('Error fetching proposal by slug:', error);
    throw error;
  }

  // Increment view count
  if (data) {
    await supabase
      .from('proposals')
      .update({
        view_count: data.view_count + 1,
        last_viewed_at: new Date().toISOString(),
        status: data.status === 'draft' || data.status === 'sent' ? 'viewed' : data.status,
      })
      .eq('id', data.id);
  }

  return data;
};

// Update proposal status
export const updateProposalStatus = async (
  proposalId: string,
  status: Proposal['status'],
  additionalData?: {
    acceptance_notes?: string;
    acceptance_signature?: string;
  }
): Promise<void> => {
  const updateData: any = { status };

  if (status === 'sent') {
    updateData.sent_at = new Date().toISOString();
  } else if (status === 'accepted') {
    updateData.accepted_at = new Date().toISOString();
    if (additionalData?.acceptance_notes) {
      updateData.acceptance_notes = additionalData.acceptance_notes;
    }
    if (additionalData?.acceptance_signature) {
      updateData.acceptance_signature = additionalData.acceptance_signature;
    }
  }

  const { error } = await supabase
    .from('proposals')
    .update(updateData)
    .eq('id', proposalId);

  if (error) {
    console.error('Error updating proposal status:', error);
    throw error;
  }
};

// Fetch all proposals for a company
export const fetchCompanyProposals = async (
  companyId: string
): Promise<Proposal[]> => {
  const { data, error } = await supabase
    .from('proposals')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching company proposals:', error);
    throw error;
  }

  return data || [];
};
