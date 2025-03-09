// src/app/dashboard/analytics/page.tsx
"use client"

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Calendar, 
  ArrowUp, 
  CheckCircle,
  Loader2
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { formatCurrency } from '@/lib/utils';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalLoans: 0,
    totalDisbursed: 0,
    totalRepaid: 0,
    totalOutstanding: 0,
    overdueAmount: 0,
    overdueCount: 0
  });
  
  const [monthlyStats, setMonthlyStats] = useState<any[]>([]);
  const [paymentStatusData, setPaymentStatusData] = useState<any>({});
  const [overduePayments, setOverduePayments] = useState<any[]>([]);
  const [upcomingPayments, setUpcomingPayments] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get dashboard statistics
        const statsResponse = await fetch('/api/analytics/statistics');
        if (!statsResponse.ok) {
          throw new Error('Failed to fetch statistics');
        }
        const statsData = await statsResponse.json();
        setStats(statsData);
        
        // Get monthly performance data
        const monthlyResponse = await fetch('/api/analytics/monthly');
        if (!monthlyResponse.ok) {
          throw new Error('Failed to fetch monthly data');
        }
        const monthlyData = await monthlyResponse.json();
        setMonthlyStats(monthlyData);
        
        // Get payment status distribution
        const statusResponse = await fetch('/api/analytics/payment-status');
        if (!statusResponse.ok) {
          throw new Error('Failed to fetch payment status data');
        }
        const statusData = await statusResponse.json();
        setPaymentStatusData(statusData);
        
        // Get overdue payments
        const overdueResponse = await fetch('/api/payments/overdue');
        if (!overdueResponse.ok) {
          throw new Error('Failed to fetch overdue payments');
        }
        const overdueData = await overdueResponse.json();
        setOverduePayments(overdueData);
        
        // Get upcoming payments
        const upcomingResponse = await fetch('/api/payments/upcoming');
        if (!upcomingResponse.ok) {
          throw new Error('Failed to fetch upcoming payments');
        }
        const upcomingData = await upcomingResponse.json();
        setUpcomingPayments(upcomingData);
        
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        toast.error('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Generate chart data from the fetched stats
  const getMonthlyChartData = () => {
    // Since we might not have real data yet, generate mock data
    // Replace this with actual data when available
    const mockData = monthlyStats.length > 0 ? monthlyStats : Array.from({ length: 6 }, (_, i) => ({
      month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i],
      disbursed: Math.floor(Math.random() * 1000000),
      collected: Math.floor(Math.random() * 800000),
      customers: Math.floor(Math.random() * 10) + 5
    }));
    
    return {
      labels: mockData.map(item => item.month),
      datasets: [
        {
          label: 'Amount Disbursed',
          data: mockData.map(item => item.disbursed),
          borderColor: 'rgba(0, 51, 153, 1)',
          backgroundColor: 'rgba(0, 51, 153, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Amount Collected',
          data: mockData.map(item => item.collected),
          borderColor: 'rgba(0, 204, 102, 1)',
          backgroundColor: 'rgba(0, 204, 102, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    };
  };
  
  const getCustomerGrowthData = () => {
    // Replace with actual data when available
    const mockData = monthlyStats.length > 0 ? monthlyStats : Array.from({ length: 6 }, (_, i) => ({
      month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i],
      customers: Math.floor(Math.random() * 10) + 5
    }));
    
    return {
      labels: mockData.map(item => item.month),
      datasets: [
        {
          label: 'New Customers',
          data: mockData.map(item => item.customers),
          backgroundColor: 'rgba(255, 140, 0, 0.8)',
          barThickness: 20,
          borderRadius: 4
        }
      ]
    };
  };
  
  const getPaymentStatusData = () => {
    // Use actual data if available, or generate mock data
    const statusData = Object.keys(paymentStatusData).length > 0 ? paymentStatusData : {
      paid: 65,
      pending: 20,
      overdue: 15
    };
    
    return {
      labels: ['Paid', 'Pending', 'Overdue'],
      datasets: [
        {
          data: [statusData.paid, statusData.pending, statusData.overdue],
          backgroundColor: [
            'rgba(0, 204, 102, 0.8)',
            'rgba(255, 189, 0, 0.8)',
            'rgba(255, 51, 51, 0.8)'
          ],
          borderColor: [
            'rgba(0, 204, 102, 1)',
            'rgba(255, 189, 0, 1)',
            'rgba(255, 51, 51, 1)'
          ],
          borderWidth: 1
        }
      ]
    };
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen -mt-16">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 text-brand-blue animate-spin mb-4" />
          <p className="text-gray-500">Loading analytics data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
        <p className="text-gray-500">Get insights into your loan business performance</p>
      </div>
      
      {/* Key metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-xl hover-lift">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-brand-blue-50 rounded-md p-3">
                <DollarSign className="h-6 w-6 text-brand-blue" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Disbursed</dt>
                  <dd>
                    <div className="text-lg font-semibold text-gray-900">
                      {formatCurrency(stats.totalDisbursed)}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <div className="font-medium text-brand-blue flex items-center">
                <TrendingUp className="mr-1 h-4 w-4" />
                <span>{stats.totalLoans} active loans</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-xl hover-lift">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-50 rounded-md p-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Repaid</dt>
                  <dd>
                    <div className="text-lg font-semibold text-gray-900">
                      {formatCurrency(stats.totalRepaid)}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <div className="font-medium text-green-600 flex items-center">
                <ArrowUp className="mr-1 h-4 w-4" />
                <span>{Math.round((stats.totalRepaid / stats.totalDisbursed) * 100) || 0}% repayment rate</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-xl hover-lift">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-50 rounded-md p-3">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Customers</dt>
                  <dd>
                    <div className="text-lg font-semibold text-gray-900">
                      {stats.totalCustomers}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <div className="font-medium text-blue-600 flex items-center">
                <TrendingUp className="mr-1 h-4 w-4" />
                <span>Growing customer base</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-xl hover-lift">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-50 rounded-md p-3">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Overdue Payments</dt>
                  <dd>
                    <div className="text-lg font-semibold text-gray-900">
                      {formatCurrency(stats.overdueAmount)}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <div className="font-medium text-red-600 flex items-center">
                <ArrowUp className="mr-1 h-4 w-4" />
                <span>{stats.overdueCount} overdue loans</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly performance chart */}
        <div className="bg-white shadow rounded-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Monthly Performance</h2>
          </div>
          <div className="p-6">
            <div className="h-80">
              <Line 
                data={getMonthlyChartData()} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          return context.dataset.label + ': ₦' + context.parsed.y.toLocaleString();
                        }
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: function(value) {
                          return '₦' + (value as number).toLocaleString();
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
        
        {/* Payment status chart */}
        <div className="bg-white shadow rounded-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Payment Status</h2>
          </div>
          <div className="p-6 flex items-center justify-center">
            <div className="h-80 w-80">
              <Doughnut 
                data={getPaymentStatusData()} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          return context.label + ': ' + context.parsed + '%';
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Customer growth chart */}
      <div className="bg-white shadow rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Customer Growth</h2>
        </div>
        <div className="p-6">
          <div className="h-80">
            <Bar 
              data={getCustomerGrowthData()} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      precision: 0
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
      
      {/* Upcoming and overdue payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming payments */}
        <div className="bg-white shadow rounded-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Upcoming Payments (7 Days)</h2>
          </div>
          
          {upcomingPayments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {upcomingPayments.slice(0, 5).map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {payment.customer_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(payment.due_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatCurrency(payment.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No upcoming payments</h3>
              <p className="text-gray-500">No payments are due in the next 7 days</p>
            </div>
          )}
        </div>
        
        {/* Overdue payments */}
        <div className="bg-white shadow rounded-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Overdue Payments</h2>
          </div>
          
          {overduePayments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Days Overdue
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {overduePayments.slice(0, 5).map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {payment.customer_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(payment.due_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          {payment.days_overdue} days
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center">
              <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No overdue payments</h3>
              <p className="text-gray-500">All payments are up to date</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}