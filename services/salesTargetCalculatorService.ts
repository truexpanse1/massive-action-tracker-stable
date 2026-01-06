/**
 * Sales Target Calculator Service
 * 
 * This service calculates realistic sales targets by working backward from
 * an annual revenue goal to determine daily, weekly, and monthly activities.
 * 
 * All calculations use simple math that a 5th grader can understand:
 * - Division to break big numbers into small numbers
 * - Multiplication to scale up from daily to weekly/monthly
 * - Percentages converted to decimals (25% = 0.25)
 */

export interface CalculatorInputs {
  // Basic Goals
  annualRevenueGoal: number;        // How much money you want to make this year
  averageDealSize: number;          // How much is one sale worth?
  
  // Time Available
  workingDaysPerYear: number;       // How many days will you work? (usually 250)
  salesCycleDays: number;           // How many days does it take to close a deal?
  
  // Conversion Rates (as percentages, will be converted to decimals)
  leadToOppRate: number;            // Out of 100 leads, how many become opportunities?
  oppToCloseRate: number;           // Out of 100 opportunities, how many close?
  
  // Activity Ratios (how many activities per lead)
  callsPerLead: number;             // How many calls to reach one lead?
  emailsPerLead: number;            // How many emails per lead?
  textsPerLead: number;             // How many texts per lead?
}

export interface CalculatedTargets {
  // Annual Totals
  annual: {
    dealsNeeded: number;            // Total deals to close this year
    opportunitiesNeeded: number;    // Total opportunities needed
    leadsNeeded: number;            // Total leads needed
    revenue: number;                // Your goal (same as input)
  };
  
  // Monthly Targets
  monthly: {
    deals: number;                  // Deals per month
    opportunities: number;          // Opportunities per month
    leads: number;                  // Leads per month
    revenue: number;                // Revenue per month
  };
  
  // Weekly Targets
  weekly: {
    deals: number;                  // Deals per week
    opportunities: number;          // Opportunities per week
    leads: number;                  // Leads per week
    revenue: number;                // Revenue per week
  };
  
  // Daily Targets (Most Important!)
  daily: {
    // RESULTS
    deals: number;                  // Deals to close today
    revenue: number;                // Money to make today
    
    // PIPELINE
    leads: number;                  // New leads to add today
    opportunities: number;          // New opportunities today
    
    // ACTIVITY
    calls: number;                  // Calls to make today
    emails: number;                 // Emails to send today
    texts: number;                  // Texts to send today
  };
  
  // Pipeline Health
  pipeline: {
    coverageRatio: number;          // How much pipeline you need (e.g., 4x)
    requiredPipelineValue: number;  // Total $ value of pipeline needed
    salesVelocity: number;          // How much $ you make per day from pipeline
  };
}

/**
 * Calculate all sales targets from inputs
 */
export function calculateTargets(inputs: CalculatorInputs): CalculatedTargets {
  // Convert percentages to decimals for math
  const leadToOppDecimal = inputs.leadToOppRate / 100;
  const oppToCloseDecimal = inputs.oppToCloseRate / 100;
  
  // STEP 1: How many deals do you need?
  // Simple division: Your goal ÷ Price per sale = Number of sales
  const dealsNeeded = inputs.annualRevenueGoal / inputs.averageDealSize;
  
  // STEP 2: How many opportunities do you need?
  // If you close 25% of opportunities, you need 4 opportunities per deal
  // Formula: Deals ÷ Close rate = Opportunities
  const opportunitiesNeeded = dealsNeeded / oppToCloseDecimal;
  
  // STEP 3: How many leads do you need?
  // If 25% of leads become opportunities, you need 4 leads per opportunity
  // Formula: Opportunities ÷ Lead-to-Opp rate = Leads
  const leadsNeeded = opportunitiesNeeded / leadToOppDecimal;
  
  // STEP 4: Break it down by time period
  
  // Monthly (divide by 12 months)
  const monthlyDeals = dealsNeeded / 12;
  const monthlyOpportunities = opportunitiesNeeded / 12;
  const monthlyLeads = leadsNeeded / 12;
  const monthlyRevenue = inputs.annualRevenueGoal / 12;
  
  // Weekly (divide by 52 weeks)
  const weeklyDeals = dealsNeeded / 52;
  const weeklyOpportunities = opportunitiesNeeded / 52;
  const weeklyLeads = leadsNeeded / 52;
  const weeklyRevenue = inputs.annualRevenueGoal / 52;
  
  // Daily (divide by working days)
  const dailyDeals = dealsNeeded / inputs.workingDaysPerYear;
  const dailyOpportunities = opportunitiesNeeded / inputs.workingDaysPerYear;
  const dailyLeads = leadsNeeded / inputs.workingDaysPerYear;
  const dailyRevenue = inputs.annualRevenueGoal / inputs.workingDaysPerYear;
  
  // STEP 5: Calculate daily activities
  // Multiply leads by activity ratios
  const dailyCalls = dailyLeads * inputs.callsPerLead;
  const dailyEmails = dailyLeads * inputs.emailsPerLead;
  const dailyTexts = dailyLeads * inputs.textsPerLead;
  
  // STEP 6: Calculate pipeline health metrics
  
  // Pipeline Coverage Ratio
  // This tells you how much pipeline you need compared to your goal
  // Formula: 1 ÷ Close Rate = Coverage needed
  // Example: 25% close rate means you need 4x coverage (1 ÷ 0.25 = 4)
  const coverageRatio = 1 / oppToCloseDecimal;
  
  // Required Pipeline Value
  // How much total $ value should be in your pipeline
  const requiredPipelineValue = inputs.annualRevenueGoal * coverageRatio;
  
  // Sales Velocity
  // How much money your pipeline generates per day
  // Formula: (Opportunities × Close Rate × Deal Size) ÷ Sales Cycle
  const salesVelocity = 
    (opportunitiesNeeded * oppToCloseDecimal * inputs.averageDealSize) / 
    inputs.salesCycleDays;
  
  // Return everything organized
  return {
    annual: {
      dealsNeeded: Math.ceil(dealsNeeded),
      opportunitiesNeeded: Math.ceil(opportunitiesNeeded),
      leadsNeeded: Math.ceil(leadsNeeded),
      revenue: inputs.annualRevenueGoal,
    },
    monthly: {
      deals: Math.ceil(monthlyDeals),
      opportunities: Math.ceil(monthlyOpportunities),
      leads: Math.ceil(monthlyLeads),
      revenue: Math.round(monthlyRevenue),
    },
    weekly: {
      deals: Math.ceil(weeklyDeals),
      opportunities: Math.ceil(weeklyOpportunities),
      leads: Math.ceil(weeklyLeads),
      revenue: Math.round(weeklyRevenue),
    },
    daily: {
      deals: parseFloat(dailyDeals.toFixed(2)),
      revenue: Math.round(dailyRevenue),
      leads: Math.ceil(dailyLeads),
      opportunities: Math.ceil(dailyOpportunities),
      calls: Math.ceil(dailyCalls),
      emails: Math.ceil(dailyEmails),
      texts: Math.ceil(dailyTexts),
    },
    pipeline: {
      coverageRatio: parseFloat(coverageRatio.toFixed(1)),
      requiredPipelineValue: Math.round(requiredPipelineValue),
      salesVelocity: Math.round(salesVelocity),
    },
  };
}

/**
 * Get default inputs based on industry standards
 */
export function getDefaultInputs(): CalculatorInputs {
  return {
    annualRevenueGoal: 500000,      // $500k is a good starting goal
    averageDealSize: 5000,          // $5k average deal
    workingDaysPerYear: 250,        // 5 days/week × 50 weeks (2 weeks vacation)
    salesCycleDays: 30,             // 30 days to close (1 month)
    leadToOppRate: 25,              // 25% of leads become opportunities
    oppToCloseRate: 25,             // 25% of opportunities close
    callsPerLead: 3,                // 3 calls per lead
    emailsPerLead: 5,               // 5 emails per lead
    textsPerLead: 2,                // 2 texts per lead
  };
}

/**
 * Validate inputs to ensure they make sense
 */
export function validateInputs(inputs: CalculatorInputs): string[] {
  const errors: string[] = [];
  
  if (inputs.annualRevenueGoal <= 0) {
    errors.push('Your money goal must be more than $0');
  }
  
  if (inputs.averageDealSize <= 0) {
    errors.push('Your sale price must be more than $0');
  }
  
  if (inputs.workingDaysPerYear < 1 || inputs.workingDaysPerYear > 365) {
    errors.push('Working days must be between 1 and 365');
  }
  
  if (inputs.salesCycleDays < 1) {
    errors.push('Sales cycle must be at least 1 day');
  }
  
  if (inputs.leadToOppRate <= 0 || inputs.leadToOppRate > 100) {
    errors.push('Lead conversion rate must be between 1% and 100%');
  }
  
  if (inputs.oppToCloseRate <= 0 || inputs.oppToCloseRate > 100) {
    errors.push('Close rate must be between 1% and 100%');
  }
  
  if (inputs.callsPerLead < 0) {
    errors.push('Calls per lead cannot be negative');
  }
  
  if (inputs.emailsPerLead < 0) {
    errors.push('Emails per lead cannot be negative');
  }
  
  if (inputs.textsPerLead < 0) {
    errors.push('Texts per lead cannot be negative');
  }
  
  return errors;
}

/**
 * Format a number as currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a number with commas
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}
