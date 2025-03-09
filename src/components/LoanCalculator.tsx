// src/components/LoanCalculator.tsx
"use client"

import { useState, useRef, useEffect } from 'react';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { 
  DollarSign, 
  Calculator, 
  ArrowRight, 
  Calendar,
  CheckCircle,
  Loader,
  X
} from 'lucide-react';

type LoanResult = {
  month: number;
  principal: number;
  interest: number;
  amount: number;
  remainingPrincipal: number;
  dueDate: Date;
};

interface LoanCalculatorProps {
  onCalculate?: (results: LoanResult[], totalInterest: number, totalAmount: number) => void;
  onClose?: () => void;
  customerId?: string;
  isNewLoan?: boolean;
  initialPrincipal?: number;
  initialInterestRate?: number;
  initialDuration?: number;
  initialDisbursementDate?: Date;
}

export default function LoanCalculator({ 
  onCalculate, 
  onClose,
  customerId, 
  isNewLoan = false,
  initialPrincipal,
  initialInterestRate,
  initialDuration,
  initialDisbursementDate
}: LoanCalculatorProps) {
  const [principal, setPrincipal] = useState(initialPrincipal ? String(initialPrincipal) : '');
  const [interestRate, setInterestRate] = useState(initialInterestRate ? String(initialInterestRate) : '10');
  const [duration, setDuration] = useState(initialDuration ? String(initialDuration) : '');
  const [disbursementDate, setDisbursementDate] = useState<Date | null>(initialDisbursementDate || new Date());
  const [results, setResults] = useState<LoanResult[]>([]);
  const [totalPrincipal, setTotalPrincipal] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingLoan, setIsCreatingLoan] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Update the form when props change
  useEffect(() => {
    if (initialPrincipal) setPrincipal(String(initialPrincipal));
    if (initialInterestRate) setInterestRate(String(initialInterestRate));
    if (initialDuration) setDuration(String(initialDuration));
    if (initialDisbursementDate) setDisbursementDate(initialDisbursementDate);
  }, [initialPrincipal, initialInterestRate, initialDuration, initialDisbursementDate]);

  const calculateLoan = () => {
    if (!principal || !duration || !disbursementDate) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsLoading(true);
    
    // Simulate calculation time for better UX
    setTimeout(() => {
      try {
        const principalValue = parseInt(principal);
        const interestRateValue = parseInt(interestRate);
        const durationValue = parseInt(duration);
        
        if (isNaN(principalValue) || isNaN(interestRateValue) || isNaN(durationValue)) {
          toast.error('Please enter valid numbers');
          setIsLoading(false);
          return;
        }
        
        const monthlyPrincipal = Math.floor(principalValue / durationValue); // No decimals
        let remainingPrincipal = principalValue;
        const calculationResults: LoanResult[] = [];
        let totalInterestSum = 0;
        
        for (let month = 1; month <= durationValue; month++) {
          // Calculate interest on remaining principal
          const monthlyInterest = Math.floor((remainingPrincipal * interestRateValue) / 100);
          const monthlyAmount = monthlyPrincipal + monthlyInterest;
          
          // Calculate due date for this month
          const dueDate = new Date(disbursementDate as Date);
          dueDate.setMonth(dueDate.getMonth() + month);
          
          calculationResults.push({
            month,
            principal: monthlyPrincipal,
            interest: monthlyInterest,
            amount: monthlyAmount,
            remainingPrincipal,
            dueDate
          });
          
          // Update remaining principal for next iteration
          remainingPrincipal -= monthlyPrincipal;
          totalInterestSum += monthlyInterest;
        }
        
        setResults(calculationResults);
        setTotalPrincipal(principalValue);
        setTotalInterest(totalInterestSum);
        setTotalAmount(principalValue + totalInterestSum);
        
        if (onCalculate) {
          onCalculate(calculationResults, totalInterestSum, principalValue + totalInterestSum);
        }
        
        toast.success('Loan calculation completed!');
        
        // Scroll to results
        if (resultsRef.current) {
          resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } catch (error) {
        console.error('Calculation error:', error);
        toast.error('An error occurred during calculation');
      } finally {
        setIsLoading(false);
      }
    }, 500);
  };

  const createLoan = async () => {
    if (!customerId || results.length === 0) {
      toast.error('Missing required data for loan creation');
      return;
    }

    setIsCreatingLoan(true);

    try {
      const loanData = {
        customerId,
        principal: totalPrincipal,
        interestRate: parseInt(interestRate),
        durationMonths: parseInt(duration),
        disbursementDate: disbursementDate?.toISOString(),
        paymentSchedule: results.map(item => ({
          month: item.month,
          principal: item.principal,
          interest: item.interest, 
          amount: item.amount,
          dueDate: item.dueDate.toISOString(),
          status: 'NOT_PAID'
        }))
      };

      const response = await fetch('/api/loans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loanData),
      });

      if (!response.ok) {
        throw new Error('Failed to create loan');
      }

      const data = await response.json();
      toast.success('Loan created successfully!');
      return data;
    } catch (error) {
      console.error('Error creating loan:', error);
      toast.error('Failed to create loan');
      throw error;
    } finally {
      setIsCreatingLoan(false);
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-xl overflow-hidden">
      <div className="bg-gradient-to-r from-brand-blue to-brand-blue-light p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle cx="12" cy="12" r="9" />
            <line x1="8" y1="7" x2="8" y2="17" />
            <line x1="16" y1="7" x2="16" y2="17" />
            <line x1="7" y1="10.5" x2="17" y2="10.5" />
            <line x1="7" y1="13.5" x2="17" y2="13.5" />
            <line x1="8" y1="7" x2="16" y2="17" />
          </svg>
        </div>

        <div className="relative z-10 flex justify-between items-start">
          <div>
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white mb-2">Loan Calculator</h1>
              <div className="ml-3 px-2 py-1 bg-brand-orange text-white text-xs font-bold uppercase rounded-full">
                Reducing Balance
              </div>
            </div>
            <p className="text-blue-100 max-w-xl">
              Calculate loan repayments using the reducing balance method for fair and transparent interest rates
            </p>
          </div>
          
          {onClose && (
            <button 
              onClick={onClose}
              className="text-white hover:text-blue-200 focus:outline-none"
            >
              <X className="h-6 w-6" />
            </button>
          )}
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand-blue text-white text-sm mr-2">1</span>
          Enter Loan Information
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="principal">
              Principal Amount <span className="text-red-500">*</span>
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                id="principal"
                className="focus:ring-brand-blue focus:border-brand-blue block w-full pl-10 pr-12 py-3 sm:text-sm border-gray-300 rounded-md"
                placeholder="e.g. 500000"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">NGN</span>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="interestRate">
              Interest Rate (%) <span className="text-red-500">*</span>
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calculator className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                id="interestRate"
                className="focus:ring-brand-blue focus:border-brand-blue block w-full pl-10 pr-12 py-3 sm:text-sm border-gray-300 rounded-md"
                placeholder="e.g. 10"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">%</span>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="duration">
              Duration (Months) <span className="text-red-500">*</span>
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                type="number"
                id="duration"
                className="focus:ring-brand-blue focus:border-brand-blue block w-full pl-10 pr-12 py-3 sm:text-sm border-gray-300 rounded-md"
                placeholder="e.g. 6"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">Months</span>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="disbursementDate">
              Disbursement Date <span className="text-red-500">*</span>
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <DatePicker
                selected={disbursementDate}
                onChange={(date) => setDisbursementDate(date)}
                dateFormat="dd/MM/yyyy"
                className="focus:ring-brand-blue focus:border-brand-blue block w-full pl-10 py-3 sm:text-sm border-gray-300 rounded-md"
                wrapperClassName="w-full"
              />
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={calculateLoan}
            disabled={isLoading}
            className={`relative overflow-hidden bg-gradient-to-r from-brand-blue to-brand-blue-light text-white font-medium py-3 px-6 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-lg transition-all ${
              isLoading ? "opacity-75 cursor-not-allowed" : "hover:shadow-xl hover:-translate-y-1"
            }`}
          >
            {isLoading ? (
              <>
                <Loader className="animate-spin -ml-1 mr-2 h-5 w-5 inline-block" />
                Calculating...
              </>
            ) : (
              <>
                Calculate Loan
                <ArrowRight className="ml-2 h-5 w-5 inline-block" />
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Results section */}
      {results.length > 0 && (
        <div className="p-6 border-t border-gray-200" ref={resultsRef}>
          <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand-blue text-white text-sm mr-2">2</span>
            Payment Schedule
          </h3>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-200 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <h4 className="text-blue-800 font-medium">Total Principal</h4>
                <div className="p-2 bg-blue-200 rounded-lg">
                  <DollarSign className="h-5 w-5 text-blue-700" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-800">
                {formatCurrency(totalPrincipal)}
              </p>
              <p className="text-sm text-blue-700 mt-1">Loan amount to be repaid</p>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-xl border border-orange-200 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <h4 className="text-orange-800 font-medium">Total Interest</h4>
                <div className="p-2 bg-orange-200 rounded-lg">
                  <Calculator className="h-5 w-5 text-orange-700" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-800">
                {formatCurrency(totalInterest)}
              </p>
              <p className="text-sm text-orange-700 mt-1">Total interest applied</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl border border-green-200 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <h4 className="text-green-800 font-medium">Total Amount</h4>
                <div className="p-2 bg-green-200 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-700" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-800">
                {formatCurrency(totalAmount)}
              </p>
              <p className="text-sm text-green-700 mt-1">Final amount to be repaid</p>
            </div>
          </div>
          
          {/* Results Table */}
          <div className="bg-white overflow-x-auto shadow rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Month
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Principal (₦)
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Interest (₦)
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount (₦)
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Remaining Principal (₦)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.map((result, index) => (
                  <tr 
                    key={result.month}
                    className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100 transition-colors`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {result.month}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {result.principal.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {result.interest.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium text-right">
                      {result.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {result.dueDate.toLocaleDateString('en-NG', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {result.remainingPrincipal.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50">
                  <th className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left">
                    TOTAL
                  </th>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                    {totalPrincipal.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                    {totalInterest.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                    {totalAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    -
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    -
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          <div className="mt-6 p-5 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-gray-800">About This Calculation</h4>
                <p className="mt-1 text-sm text-gray-600">
                  This calculator uses the reducing balance method. Interest is calculated monthly on the remaining principal balance.
                  The principal payment stays constant throughout the term.
                </p>
              </div>
            </div>
          </div>
          
          {isNewLoan && customerId && (
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                disabled={isCreatingLoan}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                  isCreatingLoan 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-brand-orange hover:bg-brand-orange-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-orange'
                }`}
                onClick={createLoan}
              >
                {isCreatingLoan ? (
                  <>
                    <Loader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Creating Loan...
                  </>
                ) : (
                  <>
                    Create Loan
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}