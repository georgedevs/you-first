// src/lib/supabase/schema.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

export async function setupDatabase() {
  // 1. Create customers table
  const { error: customersError } = await supabase.rpc('create_table_if_not_exists', {
    table_name: 'customers',
    column_defs: `
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      address TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    `
  });

  if (customersError) {
    console.error('Error creating customers table:', customersError);
  }

  // 2. Create loans table
  const { error: loansError } = await supabase.rpc('create_table_if_not_exists', {
    table_name: 'loans',
    column_defs: `
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
      principal INTEGER NOT NULL,
      interest_rate INTEGER NOT NULL,
      duration_months INTEGER NOT NULL,
      disbursement_date DATE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    `
  });

  if (loansError) {
    console.error('Error creating loans table:', loansError);
  }

  // 3. Create payments table
  const { error: paymentsError } = await supabase.rpc('create_table_if_not_exists', {
    table_name: 'payments',
    column_defs: `
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
      month_number INTEGER NOT NULL,
      principal INTEGER NOT NULL,
      interest INTEGER NOT NULL,
      amount INTEGER NOT NULL,
      due_date DATE NOT NULL,
      status TEXT NOT NULL DEFAULT 'NOT_PAID' CHECK (status IN ('PAID', 'NOT_PAID', 'PENDING')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    `
  });

  if (paymentsError) {
    console.error('Error creating payments table:', paymentsError);
  }
}

