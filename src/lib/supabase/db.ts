// src/lib/supabase/db.ts
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

// Customer operations
export async function createCustomer(customerData: any) {
  const { data, error } = await supabase
    .from('customers')
    .insert(customerData)
    .select()
    .single();
    
  if (error) {
    console.error('Error creating customer:', error);
    toast.error('Failed to create customer');
    throw error;
  }
  
  return data;
}

export async function getCustomers() {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching customers:', error);
    toast.error('Failed to fetch customers');
    throw error;
  }
  
  return data || [];
}

export async function getCustomerById(id: string) {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) {
    console.error('Error fetching customer:', error);
    toast.error('Failed to fetch customer details');
    throw error;
  }
  
  return data;
}

// Loan operations
export async function createLoan(loanData: any) {
  const { data, error } = await supabase
    .from('loans')
    .insert(loanData)
    .select()
    .single();
    
  if (error) {
    console.error('Error creating loan:', error);
    toast.error('Failed to create loan');
    throw error;
  }
  
  return data;
}

export async function getCustomerLoans(customerId: string) {
  const { data, error } = await supabase
    .from('loans')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching loans:', error);
    toast.error('Failed to fetch customer loans');
    throw error;
  }
  
  return data || [];
}

// Payment operations
export async function createPaymentSchedule(paymentData: any[]) {
  const { data, error } = await supabase
    .from('payments')
    .insert(paymentData)
    .select();
    
  if (error) {
    console.error('Error creating payment schedule:', error);
    toast.error('Failed to create payment schedule');
    throw error;
  }
  
  return data || [];
}

export async function getLoanPayments(loanId: string) {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('loan_id', loanId)
    .order('month_number', { ascending: true });
    
  if (error) {
    console.error('Error fetching payments:', error);
    toast.error('Failed to fetch loan payments');
    throw error;
  }
  
  return data || [];
}

export async function updatePaymentStatus(paymentId: string, status: 'PAID' | 'NOT_PAID' | 'PENDING') {
  const { data, error } = await supabase
    .from('payments')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', paymentId)
    .select()
    .single();
    
  if (error) {
    console.error('Error updating payment status:', error);
    toast.error('Failed to update payment status');
    throw error;
  }
  
  return data;
}

// Dashboard analytics
export async function getDashboardStats() {
  // Total customers
  const { count: totalCustomers, error: customersError } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true });
    
  if (customersError) throw customersError;
  
  // Total loans and disbursed amount
  const { data: loans, error: loansError } = await supabase
    .from('loans')
    .select('principal');
    
  if (loansError) throw loansError;
  
  const totalLoans = loans?.length || 0;
  const totalDisbursed = loans?.reduce((sum, loan) => sum + loan.principal, 0) || 0;
  
  // Calculate due payments
  const { data: payments, error: paymentsError } = await supabase
    .from('payments')
    .select('amount, status, due_date');
    
  if (paymentsError) throw paymentsError;
  
  const today = new Date();
  const totalDue = payments?.reduce((sum, payment) => 
    sum + (payment.status !== 'PAID' ? payment.amount : 0), 0) || 0;
    
  const overduePayments = payments?.filter(payment => 
    payment.status !== 'PAID' && new Date(payment.due_date) < today).length || 0;
    
  return {
    totalCustomers: totalCustomers || 0,
    totalLoans,
    totalDisbursed,
    totalDue,
    overduePayments
  };
}