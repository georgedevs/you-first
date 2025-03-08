// src/app/customers/[id]/page.tsx
"use client"

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCustomerById, getCustomerLoans } from '@/lib/supabase/db';
import { formatCurrency } from '@/lib/utils';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  MapPin,
  Calendar,
  DollarSign,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  CreditCard,
  Clock 
} from 'lucide-react';
import { toast } from 'sonner';
import LoanCalculator from '@/components/LoanCalculator';

export default function CustomerDetailPage() {
  const [customer, setCustomer] = useState<any>(null);
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLoanCalculator, setShowLoanCalculator] = useState(false);
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;
  
  useEffect(() => {
    async function fetchCustomerData() {
      try {
        setLoading(true);
        
        // Fetch customer details
        const customerData = await getCustomerById(customerId);
        setCustomer(customerData);
        
        // Fetch customer loans
        const loansData = await getCustomerLoans(customerId);
        setLoans(loansData);
      } catch (error) {
        console.error('Error fetching customer data:', error);
        toast.error('Failed to load customer details');
      } finally {
        setLoading(false);
      }
    }
    
    fetchCustomerData();
  }, [customerId]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen -mt-16">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 text-brand-blue animate-spin mb-4" />
          <p className="text-gray-500">Loading customer details...</p>
        </div>
      </div>
    );
  }
  
  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen -mt-16">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <User className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">Customer not found</h3>
        <p className="text-gray-500 mb-4">
          The customer you're looking for doesn't exist or has been removed.
        </p>
        <Link
          href="/customers"
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
          href="/customers"
          className="inline-flex items-center text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Back to customers</span>
        </Link>
      </div>
      
      {/* Customer header */}
      <div className="bg-white shadow rounded-xl overflow-hidden mb-6">
        <div className="p-6 sm:p-8 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <div className="flex items-center mb-4 sm:mb-0">
              <div className="h-16 w-16 rounded-full bg-brand-blue-50 flex items-center justify-center mr-4">
                <span className="text-brand-blue text-xl font-bold">
                  {customer.first_name?.[0]}{customer.last_name?.[0]}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {customer.first_name} {customer.last_name}
                </h1>
                <p className="text-gray-500">
                  Customer since {new Date(customer.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue"
              >
                <Pencil className="h-4 w-4 mr-2 text-gray-500" />
                Edit
              </button>
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                Delete
              </button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200">
          {customer.phone && (
            <div className="p-6 flex items-start">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center">
                  <Phone className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Phone Number</h3>
                <p className="mt-1 text-sm text-gray-900">{customer.phone}</p>
              </div>
            </div>
          )}
          
          {customer.email && (
            <div className="p-6 flex items-start">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Email Address</h3>
                <p className="mt-1 text-sm text-gray-900">{customer.email}</p>
              </div>
            </div>
          )}
          
          {customer.address && (
            <div className="p-6 flex items-start">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Address</h3>
                <p className="mt-1 text-sm text-gray-900">{customer.address}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Loans section */}
      <div className="bg-white shadow rounded-xl overflow-hidden mb-6">
        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Loans</h2>
          <button
            type="button"
            onClick={() => setShowLoanCalculator(!showLoanCalculator)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-blue hover:bg-brand-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Loan
          </button>
        </div>
        
        {showLoanCalculator ? (
          <div className="p-6">
            <LoanCalculator customerId={customerId} isNewLoan={true} />
          </div>
        ) : loans.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Disbursement Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Principal
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Interest Rate
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">View</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loans.map((loan) => (
                  <tr key={loan.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(loan.disbursement_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(loan.principal)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {loan.interest_rate}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {loan.duration_months} months
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/loans/${loan.id}`}
                        className="text-brand-blue hover:text-brand-blue-dark"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <CreditCard className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No loans yet</h3>
            <p className="text-gray-500 max-w-md mb-6">
              This customer doesn't have any loans yet. Click 'New Loan' to create one.
            </p>
            <button
              type="button"
              onClick={() => setShowLoanCalculator(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-blue hover:bg-brand-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Loan
            </button>
          </div>
        )}
      </div>
      
      {/* Activity section */}
      <div className="bg-white shadow rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
        </div>
        
        <div className="flow-root px-6 py-6">
          <ul className="-mb-8">
            <li>
              <div className="relative pb-8">
                <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                <div className="relative flex items-start space-x-3">
                  <div className="relative">
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center ring-8 ring-white">
                      <User className="h-5 w-5 text-gray-500" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div>
                      <div className="text-sm">
                        <span className="font-medium text-gray-900">Customer Added</span>
                      </div>
                      <p className="mt-0.5 text-sm text-gray-500">
                        {new Date(customer.created_at).toLocaleDateString()} at {new Date(customer.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="mt-2 text-sm text-gray-700">
                      <p>Customer profile was created.</p>
                    </div>
                  </div>
                </div>
              </div>
            </li>
            
            {loans.map((loan, index) => (
              <li key={loan.id}>
                <div className="relative pb-8">
                  {index < loans.length - 1 ? (
                    <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                  ) : null}
                  <div className="relative flex items-start space-x-3">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center ring-8 ring-white">
                        <DollarSign className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div>
                        <div className="text-sm">
                          <span className="font-medium text-gray-900">New Loan</span>
                        </div>
                        <p className="mt-0.5 text-sm text-gray-500">
                          {new Date(loan.created_at).toLocaleDateString()} at {new Date(loan.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="mt-2 text-sm text-gray-700">
                        <p>
                          Loan of {formatCurrency(loan.principal)} was disbursed with {loan.interest_rate}% interest for {loan.duration_months} months.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
            
            {loans.length === 0 && (
              <li>
                <div className="relative pb-8">
                  <div className="relative flex items-start space-x-3">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center ring-8 ring-white">
                        <Clock className="h-5 w-5 text-gray-500" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div>
                        <div className="text-sm">
                          <span className="font-medium text-gray-900">No Activity</span>
                        </div>
                        <p className="mt-0.5 text-sm text-gray-500">
                          Waiting for activity...
                        </p>
                      </div>
                      <div className="mt-2 text-sm text-gray-700">
                        <p>No additional activity has been recorded for this customer yet.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}