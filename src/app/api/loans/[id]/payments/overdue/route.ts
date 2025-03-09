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
  
      // Get today's date
      const today = new Date();
      
      // Format date for Supabase query
      const todayStr = today.toISOString().split('T')[0];
      
      // Get overdue payments (due date before today and not paid)
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
        .lt('due_date', todayStr)
        .order('due_date', { ascending: true });
        
      if (error) {
        console.error('Error fetching overdue payments:', error);
        return NextResponse.json({ error: 'Failed to fetch overdue payments' }, { status: 500 });
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
        customer_id: payment.loan.customer_id,
        days_overdue: Math.floor((today.getTime() - new Date(payment.due_date).getTime()) / (1000 * 60 * 60 * 24))
      })) || [];
      
      return NextResponse.json(formattedPayments);
    } catch (error) {
      console.error('Server error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }