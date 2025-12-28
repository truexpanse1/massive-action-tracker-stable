import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🔧 Starting database migration: Add company_id columns');

    // Step 1: Add company_id columns (IF NOT EXISTS prevents errors if already exists)
    console.log('📝 Adding company_id columns to tables...');
    
    const addColumnsSQL = `
      ALTER TABLE transactions ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);
      ALTER TABLE hot_leads ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);
      ALTER TABLE day_data ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);
      ALTER TABLE quotes ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);
    `;

    const { error: addColumnsError } = await supabase.rpc('exec_sql', { sql: addColumnsSQL });
    if (addColumnsError) {
      console.error('❌ Error adding columns:', addColumnsError);
      // Continue anyway - columns might already exist
    }

    // Step 2: Backfill existing data
    console.log('📊 Backfilling company_id for existing records...');
    
    const backfillSQL = `
      UPDATE transactions t
      SET company_id = u.company_id
      FROM users u
      WHERE t.user_id = u.id
      AND t.company_id IS NULL;

      UPDATE hot_leads hl
      SET company_id = u.company_id
      FROM users u
      WHERE hl.user_id = u.id
      AND hl.company_id IS NULL;

      UPDATE day_data dd
      SET company_id = u.company_id
      FROM users u
      WHERE dd.user_id = u.id
      AND dd.company_id IS NULL;

      UPDATE quotes q
      SET company_id = u.company_id
      FROM users u
      WHERE q.user_id = u.id
      AND q.company_id IS NULL;
    `;

    const { error: backfillError } = await supabase.rpc('exec_sql', { sql: backfillSQL });
    if (backfillError) {
      console.error('❌ Error backfilling data:', backfillError);
      throw backfillError;
    }

    // Step 3: Create indexes
    console.log('🔍 Creating indexes for performance...');
    
    const createIndexesSQL = `
      CREATE INDEX IF NOT EXISTS idx_transactions_company_id ON transactions(company_id);
      CREATE INDEX IF NOT EXISTS idx_hot_leads_company_id ON hot_leads(company_id);
      CREATE INDEX IF NOT EXISTS idx_day_data_company_id ON day_data(company_id);
      CREATE INDEX IF NOT EXISTS idx_quotes_company_id ON quotes(company_id);
    `;

    const { error: indexError } = await supabase.rpc('exec_sql', { sql: createIndexesSQL });
    if (indexError) {
      console.error('❌ Error creating indexes:', indexError);
      // Continue anyway - indexes might already exist
    }

    // Step 4: Verify data integrity
    console.log('✅ Verifying data integrity...');
    
    const { data: orphanedRecords } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          'transactions' as table_name, 
          COUNT(*) as orphaned_count
        FROM transactions 
        WHERE company_id IS NULL
        UNION ALL
        SELECT 'hot_leads', COUNT(*)
        FROM hot_leads 
        WHERE company_id IS NULL
        UNION ALL
        SELECT 'day_data', COUNT(*)
        FROM day_data 
        WHERE company_id IS NULL
        UNION ALL
        SELECT 'quotes', COUNT(*)
        FROM quotes 
        WHERE company_id IS NULL;
      `
    });

    console.log('🎉 Migration completed successfully!');
    console.log('Orphaned records check:', orphanedRecords);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Migration completed successfully',
        orphanedRecords: orphanedRecords || [],
      }),
    };

  } catch (error: any) {
    console.error('❌ Migration failed:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Migration failed',
        details: error.message,
      }),
    };
  }
};
