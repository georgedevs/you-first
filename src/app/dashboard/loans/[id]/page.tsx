// src/app/dashboard/loans/[id]/page.tsx
"use client"

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Calendar, 
  CheckCircle,
  Clock,
  Loader2,
  X,
  AlertTriangle,
  CreditCard,
  DollarSign,
  Download
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function LoanDetailPage() {
  const [loan, setLoan] = useState<any>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingPayment, setUpdatingPayment] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  const params = useParams();
  const loanId = params.id as string;
  
  useEffect(() => {
    async function fetchLoanData() {
      try {
        setLoading(true);
        
        // Fetch loan details
        const loanResponse = await fetch(`/api/loans/${loanId}`);
        if (!loanResponse.ok) {
          throw new Error('Failed to fetch loan details');
        }
        const loanData = await loanResponse.json();
        setLoan(loanData);
        
        // Fetch customer details
        const customerResponse = await fetch(`/api/customers/${loanData.customer_id}`);
        if (!customerResponse.ok) {
          throw new Error('Failed to fetch customer details');
        }
        const customerData = await customerResponse.json();
        setCustomer(customerData);
        
        // Fetch payment schedule
        const paymentsResponse = await fetch(`/api/loans/${loanId}/payments`);
        if (!paymentsResponse.ok) {
          throw new Error('Failed to fetch payment schedule');
        }
        const paymentsData = await paymentsResponse.json();
        setPayments(paymentsData);
      } catch (error) {
        console.error('Error fetching loan data:', error);
        toast.error('Failed to load loan details');
      } finally {
        setLoading(false);
      }
    }
    
    fetchLoanData();
  }, [loanId]);
  
  const updatePaymentStatus = async (paymentId: string, status: 'PAID' | 'NOT_PAID' | 'PENDING') => {
    try {
      setUpdatingPayment(paymentId);
      
      const response = await fetch(`/api/payments/${paymentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update payment status');
      }
      
      // Update payments list
      setPayments(payments.map(payment => 
        payment.id === paymentId ? { ...payment, status } : payment
      ));
      
      toast.success(`Payment status updated to ${status}`);
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Failed to update payment status');
    } finally {
      setUpdatingPayment(null);
      setShowPaymentModal(false);
    }
  };
  
  const openPaymentModal = (payment: any) => {
    setSelectedPayment(payment);
    setShowPaymentModal(true);
  };
  
  // Calculate summary statistics
  const calculateSummary = () => {
    if (!payments.length) return {
      totalAmount: 0,
      totalPaid: 0,
      totalPending: 0,
      totalOutstanding: 0,
      progressPercentage: 0
    };
    
    const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalPaid = payments.reduce((sum, payment) => payment.status === 'PAID' ? sum + payment.amount : sum, 0);
    const totalPending = payments.reduce((sum, payment) => payment.status === 'PENDING' ? sum + payment.amount : sum, 0);
    const totalOutstanding = totalAmount - totalPaid;
    const progressPercentage = Math.round((totalPaid / totalAmount) * 100);
    
    return {
      totalAmount,
      totalPaid,
      totalPending,
      totalOutstanding,
      progressPercentage
    };
  };
  
  const summary = calculateSummary();
  
  // Get payment status indicator
  const getStatusIndicator = (status: string, dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    
    if (status === 'PAID') {
      return {
        color: 'text-green-500',
        bgColor: 'bg-green-100',
        borderColor: 'border-green-200',
        icon: <CheckCircle className="h-5 w-5" />,
        text: 'Paid'
      };
    } else if (status === 'PENDING') {
      return {
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-100',
        borderColor: 'border-yellow-200',
        icon: <Clock className="h-5 w-5" />,
        text: 'Pending'
      };
    } else if (due < today) {
      return {
        color: 'text-red-500',
        bgColor: 'bg-red-100',
        borderColor: 'border-red-200',
        icon: <AlertTriangle className="h-5 w-5" />,
        text: 'Overdue'
      };
    } else {
      return {
        color: 'text-gray-500',
        bgColor: 'bg-gray-100',
        borderColor: 'border-gray-200',
        icon: <Calendar className="h-5 w-5" />,
        text: 'Not Paid'
      };
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
          <CreditCard className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">Loan not found</h3>
        <p className="text-gray-500 mb-4">
          The loan you're looking for doesn't exist or has been removed.
        </p>
        <Link
          href="/dashboard/customers"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-blue hover:bg-brand-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Customers
        </Link>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-6">
        <Link 
          href={`/dashboard/customers/${customer.id}`}
          className="inline-flex items-center text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Back to customer</span>
        </Link>
      </div>
      
      {/* Loan Header */}
      <div className="bg-white shadow rounded-xl overflow-hidden mb-6">
        <div className="p-6 sm:p-8 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <div className="flex items-center mb-4 sm:mb-0">
              <div className="h-16 w-16 rounded-full bg-brand-blue-50 flex items-center justify-center mr-4">
                <CreditCard className="h-8 w-8 text-brand-blue" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Loan Details
                </h1>
                <p className="text-gray-500">
                  For {customer.first_name} {customer.last_name} on {new Date(loan.disbursement_date).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue"
              >
                <Download className="h-4 w-4 mr-2 text-gray-500" />
                Export
              </button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-200">
          <div className="p-6 flex items-center">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Principal</h3>
              <p className="mt-1 text-lg font-semibold text-gray-900">{formatCurrency(loan.principal)}</p>
            </div>
          </div>
          
          <div className="p-6 flex items-center">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-md bg-orange-100 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Interest Rate</h3>
              <p className="mt-1 text-lg font-semibold text-gray-900">{loan.interest_rate}%</p>
            </div>
          </div>
          
          <div className="p-6 flex items-center">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-md bg-purple-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Duration</h3>
              <p className="mt-1 text-lg font-semibold text-gray-900">{loan.duration_months} months</p>
            </div>
          </div>
          
          <div className="p-6 flex items-center">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-md bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Repayment Progress</h3>
              <div className="mt-1">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-green-600 h-2.5 rounded-full" 
                    style={{ width: `${summary.progressPercentage}%` }}
                  ></div>
                </div>
                <p className="mt-1 text-sm font-medium text-gray-700">{summary.progressPercentage}% complete</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Loan Summary */}
      <div className="bg-white shadow rounded-xl overflow-hidden mb-6">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Payment Summary</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Loan Amount</h3>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalAmount)}</p>
            <p className="text-sm text-blue-600 mt-1">Full amount to be repaid</p>
          </div>
          
          <div className="bg-green-50 rounded-xl p-5 border border-green-200">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Amount Paid</h3>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalPaid)}</p>
            <p className="text-sm text-green-600 mt-1">Total payments received</p>
          </div>
          
          <div className="bg-orange-50 rounded-xl p-5 border border-orange-200">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Outstanding Balance</h3>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalOutstanding)}</p>
            <p className="text-sm text-orange-600 mt-1">Remaining amount to be paid</p>
          </div>
        </div>
      </div>
      
      {/* Payment Schedule */}
      <div className="bg-white shadow rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Payment Schedule</h2>
        </div>
        
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
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.map((payment, index) => {
                const statusData = getStatusIndicator(payment.status, payment.due_date);
                
                return (
                  <tr key={payment.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payment.month_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(payment.due_date).toLocaleDateString()}
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusData.bgColor} ${statusData.color} border ${statusData.borderColor}`}>
                          {statusData.icon}
                          <span className="ml-1">{statusData.text}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {updatingPayment === payment.id ? (
                        <div className="flex justify-end">
                          <Loader2 className="h-5 w-5 text-brand-blue animate-spin" />
                        </div>
                      ) : (
                        <button
                          onClick={() => openPaymentModal(payment)}
                          className="text-brand-blue hover:text-brand-blue-dark"
                        >
                          Update Status
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Payment Status Modal */}
      {showPaymentModal && selectedPayment && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Update Payment Status</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="px-6 py-4">
              <div className="mb-4">
                <p className="text-sm text-gray-500">Month {selectedPayment.month_number} Payment</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{formatCurrency(selectedPayment.amount)}</p>
                <p className="text-sm text-gray-500 mt-1">Due on {new Date(selectedPayment.due_date).toLocaleDateString()}</p>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => updatePaymentStatus(selectedPayment.id, 'PAID')}
                  disabled={updatingPayment === selectedPayment.id}
                  className={`flex items-center w-full px-4 py-3 ${
                    selectedPayment.status === 'PAID' 
                      ? 'bg-green-50 border-green-300 text-green-800' 
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-green-50'
                  } border rounded-md`}
                >
                  <CheckCircle className={`h-5 w-5 ${selectedPayment.status === 'PAID' ? 'text-green-500' : 'text-gray-400'} mr-3`} />
                  Mark as Paid
                </button>
                
                <button
                  onClick={() => updatePaymentStatus(selectedPayment.id, 'PENDING')}
                  disabled={updatingPayment === selectedPayment.id}
                  className={`flex items-center w-full px-4 py-3 ${
                    selectedPayment.status === 'PENDING' 
                      ? 'bg-yellow-50 border-yellow-300 text-yellow-800' 
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-yellow-50'
                  } border rounded-md`}
                >
                  <Clock className={`h-5 w-5 ${selectedPayment.status === 'PENDING' ? 'text-yellow-500' : 'text-gray-400'} mr-3`} />
                  Mark as Pending
                </button>
                
                <button
                  onClick={() => updatePaymentStatus(selectedPayment.id, 'NOT_PAID')}
                  disabled={updatingPayment === selectedPayment.id}
                  className={`flex items-center w-full px-4 py-3 ${
                    selectedPayment.status === 'NOT_PAID' 
                      ? 'bg-gray-100 border-gray-300 text-gray-800' 
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  } border rounded-md`}
                >
                  <X className={`h-5 w-5 ${selectedPayment.status === 'NOT_PAID' ? 'text-gray-500' : 'text-gray-400'} mr-3`} />
                  Mark as Not Paid
                </button>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 flex justify-end">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}