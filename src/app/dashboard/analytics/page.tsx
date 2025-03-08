// src/app/(dashboard)/analytics/page.tsx
"use client"

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  DollarSign, 
  Users,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalLoans: 0,
    totalDisbursed: 0,
    totalOutstanding: 0,
    totalInterestEarned: 0,
    overduePayments: 0
  });
  
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const supabase = createClientComponentClient();
  
  useEffect(() => {
    async function fetchAnalyticsData() {
      try {
        setLoading(true);
        
        // Fetch statistics
        // Customers count
        const { count: customersCount, error: customersError } = await supabase
          .from('customers')
          .select('*', { count: 'exact', head: true });
          
        if (customersError) throw customersError;
        
        // Loans data
        const { data: loansData, error: loansError } = await supabase
          .from('loans')
          .select('*');
          
        if (loansError) throw loansError;
        
        // Payments data
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('payments')
          .select('*');
          
        if (paymentsError) throw paymentsError;
        
        // Calculate statistics
        const totalLoans = loansData?.length || 0;
        const totalDisbursed = loansData?.reduce((sum, loan) => sum + loan.principal, 0) || 0;
        
        const totalPaid = paymentsData
          ?.filter(payment => payment.status === 'PAID')
          .reduce((sum, payment) => sum + payment.amount, 0) || 0;
          
        const totalOutstanding = paymentsData
          ?.filter(payment => payment.status !== 'PAID')
          .reduce((sum, payment) => sum + payment.amount, 0) || 0;
          
        const totalInterestEarned = paymentsData
          ?.filter(payment => payment.status === 'PAID')
          .reduce((sum, payment) => sum + payment.interest, 0) || 0;
          
        const today = new Date();
        const overdueCount = paymentsData
          ?.filter(payment => 
            payment.status !== 'PAID' && 
            new Date(payment.due_date) < today
          ).length || 0;
          
        setStats({
          totalCustomers: customersCount || 0,
          totalLoans,
          totalDisbursed,
          totalOutstanding,
          totalInterestEarned,
          overduePayments: overdueCount
        });
        
        // Generate monthly data
        const monthlyMap = new Map();
        
        // Initialize with last 6 months
        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const month = date.toLocaleString('default', { month: 'short' });
          const year = date.getFullYear();
          const key = `${month} ${year}`;
          
          monthlyMap.set(key, {
            name: key,
            disbursed: 0,
            collected: 0,
            interest: 0
          });
        }
        
        // Process loan disbursements
        loansData?.forEach(loan => {
          const date = new Date(loan.disbursement_date);
          const month = date.toLocaleString('default', { month: 'short' });
          const year = date.getFullYear();
          const key = `${month} ${year}`;
          
          if (monthlyMap.has(key)) {
            const monthData = monthlyMap.get(key);
            monthlyMap.set(key, {
              ...monthData,
              disbursed: monthData.disbursed + loan.principal
            });
          }
        });
        
        // Process payments
        paymentsData?.filter(payment => payment.status === 'PAID').forEach(payment => {
          const date = new Date(payment.updated_at);
          const month = date.toLocaleString('default', { month: 'short' });
          const year = date.getFullYear();
          const key = `${month} ${year}`;
          
          if (monthlyMap.has(key)) {
            const monthData = monthlyMap.get(key);
            monthlyMap.set(key, {
              ...monthData,
              collected: monthData.collected + payment.amount,
              interest: monthData.interest + payment.interest
            });
          }
        });
        
        setMonthlyData(Array.from(monthlyMap.values()));
        
        // Calculate payment status distribution
        const paidCount = paymentsData?.filter(payment => payment.status === 'PAID').length || 0;
        const pendingCount = paymentsData?.filter(payment => payment.status === 'PENDING').length || 0;
        const notPaidCount = paymentsData?.filter(payment => payment.status === 'NOT_PAID').length || 0;
        
        setStatusDistribution([
          { name: 'Paid', value: paidCount, color: '#10B981' },
          { name: 'Pending', value: pendingCount, color: '#F59E0B' },
          { name: 'Not Paid', value: notPaidCount, color: '#EF4444' }
        ]);
        
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        toast.error('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    }
    
    fetchAnalyticsData();
  }, [supabase]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen -mt-16">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 text-brand-blue animate-spin mb-4" />
          <p className="text-gray-500">Loading analytics...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Business Analytics</h1>
      
      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-xl hover-lift">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-50 rounded-md p-3">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Customers</dt>
                  <dd className="text-lg font-semibold text-gray-900">{stats.totalCustomers}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="font-medium text-indigo-600">
                {stats.totalLoans} Active Loans
              </span>
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
                  <dd className="text-lg font-semibold text-gray-900">{formatCurrency(stats.totalDisbursed)}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="font-medium text-green-600">
                {formatCurrency(stats.totalInterestEarned)} Interest Earned
              </span>
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
                  <dt className="text-sm font-medium text-gray-500 truncate">Outstanding Balance</dt>
                  <dd className="text-lg font-semibold text-gray-900">{formatCurrency(stats.totalOutstanding)}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="font-medium text-red-600">
                {stats.overduePayments} Overdue Payments
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly trends chart */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Monthly Trends</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `₦${value / 1000}k`} />
                <Tooltip 
                  formatter={(value) => formatCurrency(value as number)} 
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Legend />
                <Bar dataKey="disbursed" name="Disbursed" fill="#3B82F6" />
                <Bar dataKey="collected" name="Collected" fill="#10B981" />
                <Bar dataKey="interest" name="Interest" fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Payment status distribution */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Status Distribution</h2>
          <div className="h-80 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => value} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Additional chart - Cumulative Revenue */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Cumulative Revenue</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={monthlyData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `₦${value / 1000}k`} />
              <Tooltip 
                formatter={(value) => formatCurrency(value as number)} 
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="interest" 
                name="Interest Earned" 
                stroke="#F59E0B" 
                strokeWidth={2}
                activeDot={{ r: 8 }} 
              />
              <Line 
                type="monotone" 
                dataKey="collected" 
                name="Total Collected" 
                stroke="#10B981" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}