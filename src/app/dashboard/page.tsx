// src/app/dashboard/page.tsx
"use client"

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  Calendar,
  ChevronRight,
  Search
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalLoans: 0,
    totalDisbursed: 0,
    totalDue: 0,
    overduePayments: 0
  });
  
  const [recentCustomers, setRecentCustomers] = useState<any[]>([]);
  const [upcomingPayments, setUpcomingPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const supabase = createClientComponentClient();
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch customers count
        const { count: customersCount, error: customersError } = await supabase
          .from('customers')
          .select('*', { count: 'exact', head: true });
          
        if (customersError) throw customersError;
        
        // For other stats, we would make similar queries
        // This is where we'd fetch actual data from Supabase
        
        // Simulating data while you build your database
        setStats({
          totalCustomers: customersCount || 0,
          totalLoans: 0,
          totalDisbursed: 0,
          totalDue: 0,
          overduePayments: 0
        });
        
        // Fetch recent customers
        const { data: recentCustomersData, error: recentCustomersError } = await supabase
          .from('customers')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (recentCustomersError) throw recentCustomersError;
        
        setRecentCustomers(recentCustomersData || []);
        
        // For upcoming payments, we would query from the payments table
        // For now, we'll use an empty array until that table is set up
        setUpcomingPayments([]);
        
      } catch (error: any) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [supabase]);

  // Placeholder for no data yet
  const renderNoDataPlaceholder = (type: string) => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        {type === 'customers' ? (
          <Users className="h-8 w-8 text-gray-400" />
        ) : (
          <Calendar className="h-8 w-8 text-gray-400" />
        )}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">No {type} yet</h3>
      <p className="text-gray-500 max-w-md">
        {type === 'customers' 
          ? 'Start adding customers to see them listed here.' 
          : 'Upcoming payment schedules will appear here.'}
      </p>
      <Link
        href={type === 'customers' ? '/dashboard/customers/add' : '/dashboard'}
        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-blue hover:bg-brand-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue transition-colors"
      >
        {type === 'customers' ? 'Add a customer' : 'View all payments'}
      </Link>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, Patricia!</h1>
        <div className="mt-3 sm:mt-0 relative rounded-md shadow-sm max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="focus:ring-brand-blue focus:border-brand-blue block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2"
            placeholder="Search customers..."
          />
        </div>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-xl hover-lift">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-brand-blue-50 rounded-md p-3">
                <Users className="h-6 w-6 text-brand-blue" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Customers</dt>
                  <dd>
                    <div className="text-lg font-semibold text-gray-900">
                      {loading ? (
                        <div className="h-5 w-16 bg-gray-200 rounded animate-pulse"></div>
                      ) : (
                        stats.totalCustomers
                      )}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link href="/customers" className="font-medium text-brand-blue hover:text-brand-blue-dark flex items-center">
                View all customers
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-xl hover-lift">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-50 rounded-md p-3">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Disbursed</dt>
                  <dd>
                    <div className="text-lg font-semibold text-gray-900">
                      {loading ? (
                        <div className="h-5 w-24 bg-gray-200 rounded animate-pulse"></div>
                      ) : (
                        formatCurrency(stats.totalDisbursed)
                      )}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link href="/analytics" className="font-medium text-brand-blue hover:text-brand-blue-dark flex items-center">
                View analytics
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-xl hover-lift">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-50 rounded-md p-3">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Expected Income</dt>
                  <dd>
                    <div className="text-lg font-semibold text-gray-900">
                      {loading ? (
                        <div className="h-5 w-24 bg-gray-200 rounded animate-pulse"></div>
                      ) : (
                        formatCurrency(stats.totalDue)
                      )}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link href="/analytics" className="font-medium text-brand-blue hover:text-brand-blue-dark flex items-center">
                View projections
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-xl hover-lift">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-50 rounded-md p-3">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Overdue Payments</dt>
                  <dd>
                    <div className="text-lg font-semibold text-gray-900">
                      {loading ? (
                        <div className="h-5 w-12 bg-gray-200 rounded animate-pulse"></div>
                      ) : (
                        stats.overduePayments
                      )}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link href="/customers" className="font-medium text-red-600 hover:text-red-700 flex items-center">
                View overdue
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent activity and upcoming payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent customers */}
        <div className="bg-white shadow rounded-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Customers</h3>
          </div>
          
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-3 w-1/4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentCustomers.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {recentCustomers.map((customer) => (
                <li key={customer.id}>
                  <Link href={`/customers/${customer.id}`} className="block hover:bg-gray-50">
                    <div className="px-6 py-4 flex items-center">
                      <div className="min-w-0 flex-1 flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-brand-blue-50 flex items-center justify-center">
                            <span className="text-brand-blue font-medium">
                              {customer.first_name?.[0]}{customer.last_name?.[0]}
                            </span>
                          </div>
                        </div>
                        <div className="min-w-0 flex-1 px-4">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {customer.first_name} {customer.last_name}
                          </p>
                          <p className="mt-1 text-sm text-gray-500 truncate">
                            Added on {new Date(customer.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            renderNoDataPlaceholder('customers')
          )}
        </div>

        {/* Upcoming payments */}
        <div className="bg-white shadow rounded-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Upcoming Payments</h3>
          </div>
          
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-3 w-1/4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : upcomingPayments.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {upcomingPayments.map((payment) => (
                <li key={payment.id}>
                  <div className="px-6 py-4 flex items-center">
                    <div className="min-w-0 flex-1 flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-gray-500" />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1 px-4">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {payment.customer_name}
                        </p>
                        <p className="mt-1 text-sm text-gray-500 truncate">
                          Due on {new Date(payment.due_date).toLocaleDateString()} - {formatCurrency(payment.amount)}
                        </p>
                      </div>
                    </div>
                    <div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        payment.status === 'PAID' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {payment.status}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            renderNoDataPlaceholder('payments')
          )}
        </div>
      </div>
    </div>
  );
}