"use client"

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  DollarSign, 
  Calendar, 
  CheckCircle,
  AlertCircle,
  Clock3,
  Loader2,
  FileText,
  Download
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function LoanDetailPage() {
  const [loan, setLoan] = useState<any>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingPaymentId, setUpdatingPaymentId] = useState<string | null>(null);
  
  const params = useParams();
  const loanId = params.id as string;
  const supabase = createClientComponentClient();
  
  useEffect(() => {
    async function fetchLoanData() {
      try {
        setLoading(true);
        
        // Fetch loan details
        const { data: loanData, error: loanError } = await supabase
          .from('loans')
          .select('*')
          .eq('id', loanId)
          .single();
          
        if (loanError) throw loanError;
        setLoan(loanData);
        
        // Fetch customer details
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('*')
          .eq('id', loanData.customer_id)
          .single();
          
        if (customerError) throw customerError;
        setCustomer(customerData);
        
        // Fetch payment schedule
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('payments')
          .select('*')
          .eq('loan_id', loanId)
          .order('month_number', { ascending: true });
          
        if (paymentsError) throw paymentsError;
        setPayments(paymentsData || []);
        
      } catch (error) {
        console.error('Error fetching loan data:', error);
        toast.error('Failed to load loan details');
      } finally {
        setLoading(false);
      }
    }
    
    fetchLoanData();
  }, [loanId, supabase]);
  
  const handleUpdatePaymentStatus = async (paymentId: string, newStatus: 'PAID' | 'NOT_PAID' | 'PENDING') => {
    try {
      setUpdatingPaymentId(paymentId);
      
      const { error } = await supabase
        .from('payments')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString() 
        })
        .eq('id', paymentId)
        .select()
        .single();
      
      if (error) throw error;
      
      // Update local state
      setPayments(payments.map(payment => 
        payment.id === paymentId ? { ...payment, status: newStatus } : payment
      ));
      
      toast.success(`Payment marked as ${newStatus.toLowerCase()}`);
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Failed to update payment status');
    } finally {
      setUpdatingPaymentId(null);
    }
  };
  
  const getStatusBadgeClasses = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'NOT_PAID':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'PENDING':
        return <Clock3 className="h-5 w-5 text-yellow-500" />;
      case 'NOT_PAID':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen -mt-16">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 text-brand-blue animate-spin mb-4" />
          <p className="text-gray-500">Loading loan details...</p>
        </div>
      </div>
    );
  }
  
  if (!loan || !customer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen -mt-16">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <DollarSign className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">Loan not found</h3>
        <p className="text-gray-500 mb-4">
          The loan you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-blue hover:bg-brand-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
      </div>
    );
  }
  
  // Calculate loan summary
  const totalPrincipal = loan.principal;
  const totalPaid = payments
    .filter(payment => payment.status === 'PAID')
    .reduce((sum, payment) => sum + payment.amount, 0);
  const totalPending = payments
    .filter(payment => payment.status === 'PENDING')
    .reduce((sum, payment) => sum + payment.amount, 0);
  const totalRemaining = payments
    .filter(payment => payment.status === 'NOT_PAID')
    .reduce((sum, payment) => sum + payment.amount, 0);
  
  // Calculate payment statistics
  const paidCount = payments.filter(payment => payment.status === 'PAID').length;
  const pendingCount = payments.filter(payment => payment.status === 'PENDING').length;
  const remainingCount = payments.filter(payment => payment.status === 'NOT_PAID').length;
  
  return (
    <div>
      <div className="mb-6">
        <Link 
          href={`/customers/${customer.id}`}
          className="inline-flex items-center text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Back to customer</span>
        </Link>
      </div>
      
      {/* Loan header */}
      <div className="bg-white shadow rounded-xl overflow-hidden mb-6">
        <div className="p-6 sm:p-8 bg-gradient-to-r from-brand-blue to-brand-blue-light text-white">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <div className="flex items-center mb-4 sm:mb-0">
              <div className="h-16 w-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mr-4">
                <DollarSign className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-1">
                  {formatCurrency(loan.principal)}
                </h1>
                <div className="flex items-center space-x-2">
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm backdrop-blur-sm">
                    {loan.interest_rate}% Interest
                  </span>
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm backdrop-blur-sm">
                    {loan.duration_months} Months
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end space-y-1">
              <div className="text-sm text-white/80">Disbursement Date</div>
              <div className="font-semibold flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(loan.disbursement_date).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
        
        {/* Customer info */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-brand-blue-50 flex items-center justify-center mr-3">
              <span className="text-brand-blue font-medium">
                {customer.first_name?.[0]}{customer.last_name?.[0]}
              </span>
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-500">Customer</h2>
              <Link
                href={`/customers/${customer.id}`}
                className="text-brand-blue hover:underline"
              >
                {customer.first_name} {customer.last_name}
              </Link>
            </div>
          </div>
          
          <div className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Active
          </div>
        </div>
        
        {/* Loan summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-gray-200">
          <div className="p-4 sm:p-6">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Loan</h3>
            <p className="mt-2 text-xl font-semibold text-gray-900">{formatCurrency(totalPrincipal)}</p>
          </div>
          
          <div className="p-4 sm:p-6">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</h3>
            <p className="mt-2 text-xl font-semibold text-green-600">{formatCurrency(totalPaid)}</p>
            <span className="text-xs text-gray-500">{paidCount} of {payments.length} payments</span>
          </div>
          
          <div className="p-4 sm:p-6">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</h3>
            <p className="mt-2 text-xl font-semibold text-yellow-600">{formatCurrency(totalPending)}</p>
            <span className="text-xs text-gray-500">{pendingCount} payments</span>
          </div>
          
          <div className="p-4 sm:p-6">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Remaining</h3>
            <p className="mt-2 text-xl font-semibold text-gray-900">{formatCurrency(totalRemaining)}</p>
            <span className="text-xs text-gray-500">{remainingCount} payments</span>
          </div>
        </div>
      </div>
      
      {/* Payment schedule */}
      <div className="bg-white shadow rounded-xl overflow-hidden mb-6">
        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Payment Schedule</h2>
          <div className="flex space-x-3">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue"
            >
              <FileText className="h-4 w-4 mr-2" />
              Print
            </button>
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>
        
        {payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Month
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Principal
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Interest
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => {
                  const isPastDue = new Date(payment.due_date) < new Date() && payment.status !== 'PAID';
                  return (
                    <tr key={payment.id} className={
                      isPastDue ? 'bg-red-50' : (
                        payment.status === 'PAID' ? 'bg-green-50' : ''
                      )
                    }>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {payment.month_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(payment.due_date).toLocaleDateString()}
                        {isPastDue && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            Overdue
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        {formatCurrency(payment.principal)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        {formatCurrency(payment.interest)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClasses(payment.status)}`}>
                          {getPaymentStatusIcon(payment.status)}
                          <span className="ml-1">{payment.status.replace('_', ' ')}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {updatingPaymentId === payment.id ? (
                          <span className="text-gray-500">
                            <Loader2 className="h-4 w-4 animate-spin inline-block" />
                          </span>
                        ) : (
                          <div className="flex justify-end space-x-3">
                            {payment.status !== 'PAID' && (
                              <button
                                type="button"
                                className="text-green-600 hover:text-green-900"
                                onClick={() => handleUpdatePaymentStatus(payment.id, 'PAID')}
                              >
                                Mark Paid
                              </button>
                            )}
                            {payment.status !== 'PENDING' && (
                              <button
                                type="button"
                                className="text-yellow-600 hover:text-yellow-900"
                                onClick={() => handleUpdatePaymentStatus(payment.id, 'PENDING')}
                              >
                                Mark Pending
                              </button>
                            )}
                            {payment.status !== 'NOT_PAID' && (
                              <button
                                type="button"
                                className="text-red-600 hover:text-red-900"
                                onClick={() => handleUpdatePaymentStatus(payment.id, 'NOT_PAID')}
                              >
                                Mark Unpaid
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No payments scheduled</h3>
            <p className="text-gray-500 max-w-md">
              This loan doesn&apos;t have any payments scheduled yet.
            </p>
          </div>
        )}
      </div>
      
      {/* Payment history timeline */}
      <div className="bg-white shadow rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Payment History</h2>
        </div>
        
        <div className="flow-root px-6 py-6">
          {payments.filter(payment => payment.status === 'PAID').length > 0 ? (
            <ul className="-mb-8">
              {payments
                .filter(payment => payment.status === 'PAID')
                .map((payment, index, filteredArray) => (
                <li key={payment.id}>
                  <div className="relative pb-8">
                    {index < filteredArray.length - 1 ? (
                      <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                    ) : null}
                    <div className="relative flex items-start space-x-3">
                      <div>
                        <div className="relative px-1">
                          <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center ring-8 ring-white">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </div>
                        </div>
                      </div>
                      <div className="min-w-0 flex-1 py-1.5">
                        <div className="text-sm text-gray-500">
                          <span className="font-medium text-gray-900">Payment Received</span>
                          {" "} for Month {payment.month_number} - {formatCurrency(payment.amount)}
                        </div>
                        <div className="mt-1 text-sm text-gray-500">
                          <span>Received on {new Date(payment.updated_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">No payments have been recorded yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}