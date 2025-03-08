import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          async get(name: string) {
            return (await cookieStore).get(name)?.value;
          },
        },
      }
    );
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { 
      customerId, 
      principal, 
      interestRate, 
      durationMonths, 
      disbursementDate,
      paymentSchedule 
    } = await req.json();
    
    // Validate required fields
    if (!customerId || !principal || !interestRate || !durationMonths || !disbursementDate || !paymentSchedule) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Start a transaction
    const { data: loan, error: loanError } = await supabase
      .from('loans')
      .insert({
        customer_id: customerId,
        principal,
        interest_rate: interestRate,
        duration_months: durationMonths,
        disbursement_date: disbursementDate
      })
      .select()
      .single();
      
    if (loanError) {
      console.error('Error creating loan:', loanError);
      return NextResponse.json({ error: 'Failed to create loan' }, { status: 500 });
    }
    
    // Prepare payment schedule
    const payments = paymentSchedule.map((payment: any) => ({
      loan_id: loan.id,
      month_number: payment.month,
      principal: payment.principal,
      interest: payment.interest,
      amount: payment.amount,
      due_date: payment.dueDate,
      status: 'NOT_PAID'
    }));
    
    // Insert payment schedule
    const { data: paymentsData, error: paymentsError } = await supabase
      .from('payments')
      .insert(payments)
      .select();
      
    if (paymentsError) {
      console.error('Error creating payment schedule:', paymentsError);
      return NextResponse.json({ error: 'Failed to create payment schedule' }, { status: 500 });
    }
    
    return NextResponse.json({ 
      loan,
      payments: paymentsData
    });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}