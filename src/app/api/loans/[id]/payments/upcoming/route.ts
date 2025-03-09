import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function GET() {
    try {
      const cookieStore = await cookies();
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value;
            },
          },
        }
      );
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  
      // Get today's date and 7 days from now
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      
      // Format dates for Supabase query
      const todayStr = today.toISOString().split('T')[0];
      const nextWeekStr = nextWeek.toISOString().split('T')[0];
      
      // Get upcoming payments within the next week that are not paid
      const { data: payments, error } = await supabase
        .from('payments')
        .select(`
          *,
          loan:loans(
            *,
            customer:customers(
              first_name,
              last_name,
              phone
            )
          )
        `)
        .not('status', 'eq', 'PAID')
        .gte('due_date', todayStr)
        .lte('due_date', nextWeekStr)
        .order('due_date', { ascending: true });
        
      if (error) {
        console.error('Error fetching upcoming payments:', error);
        return NextResponse.json({ error: 'Failed to fetch upcoming payments' }, { status: 500 });
      }
      
      // Format the response to include customer names
      const formattedPayments = payments?.map(payment => ({
        id: payment.id,
        loan_id: payment.loan_id,
        month_number: payment.month_number,
        principal: payment.principal,
        interest: payment.interest,
        amount: payment.amount,
        due_date: payment.due_date,
        status: payment.status,
        customer_name: `${payment.loan.customer.first_name} ${payment.loan.customer.last_name}`,
        customer_phone: payment.loan.customer.phone,
        customer_id: payment.loan.customer_id
      })) || [];
      
      return NextResponse.json(formattedPayments);
    } catch (error) {
      console.error('Server error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }