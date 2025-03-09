// src/app/dashboard/customers/add/page.tsx
"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import { createCustomer } from '@/lib/supabase/db';
import { ArrowLeft, CheckCircle, Loader2, User, UserPlus } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import LoanCalculator from '@/components/LoanCalculator';

type CustomerFormData = {
  first_name: string;
  last_name: string;
  phone?: string;
  is_existing: boolean;
  principal?: number;
  interest_rate?: number;
  duration_months?: number;
  disbursement_date?: Date;
  current_month?: number;
};

export default function AddCustomerPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExistingCustomer, setIsExistingCustomer] = useState(false);
  const [showLoanCalculator, setShowLoanCalculator] = useState(false);
  const [loanCalculated, setLoanCalculated] = useState(false);
  const [loanDetails, setLoanDetails] = useState<any>(null);
  
  
  const router = useRouter();
  
  const { 
    register, 
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isValid } 
  } = useForm<CustomerFormData>({
    mode: 'onChange',
    defaultValues: {
      first_name: '',
      last_name: '',
      phone: '',
      is_existing: false,
      disbursement_date: new Date(),
    }
  });

  
  // Handle loan calculation results
  const handleLoanCalculation = (results: any[], totalInterest: number, totalAmount: number) => {
    setLoanCalculated(true);
    setLoanDetails({
      results,
      totalInterest,
      totalAmount,
      principal: Number(results[0]?.remainingPrincipal || 0),
      interestRate: Number(watch('interest_rate')),
      durationMonths: Number(watch('duration_months')),
      disbursementDate: watch('disbursement_date')
    });
  };
  
  const onSubmit = async (data: CustomerFormData) => {
    try {
      setIsSubmitting(true);
      
      if (!loanCalculated && !isExistingCustomer) {
        toast.error('Please calculate the loan details first');
        setIsSubmitting(false);
        return;
      }
      
      // Prepare customer data
      const customerData = {
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
      };
      
      // Create customer
      const newCustomer = await createCustomer(customerData);
      
      // If we have loan details, create the loan
      if (loanDetails) {
        // Create loan for the customer
        const loanData = {
          customer_id: newCustomer.id,
          principal: loanDetails.principal,
          interest_rate: loanDetails.interestRate,
          duration_months: loanDetails.durationMonths,
          disbursement_date: formatDate(loanDetails.disbursementDate),
        };
        
        // Make API call to create loan and payment schedule
        const response = await fetch('/api/loans', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...loanData,
            paymentSchedule: loanDetails.results.map((item: any) => ({
              month: item.month,
              principal: item.principal,
              interest: item.interest,
              amount: item.amount,
              dueDate: formatDate(item.dueDate),
              // For existing customers, mark previous months as paid
              status: isExistingCustomer && item.month < (data.current_month || 1) ? 'PAID' : 'NOT_PAID'
            }))
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to create loan');
        }
      }
      
      toast.success('Customer created successfully!');
      router.push(`/dashboard/customers/${newCustomer.id}`);
    } catch (error) {
      console.error('Error creating customer:', error);
      toast.error('Failed to create customer. Please check console for details.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const toggleCustomerType = (isExisting: boolean) => {
    setIsExistingCustomer(isExisting);
    setValue('is_existing', isExisting);
    setLoanCalculated(false);
    setLoanDetails(null);
  };
  
  return (
    <div>
      <div className="mb-6">
        <button 
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Back</span>
        </button>
      </div>
      
      <div className="bg-white shadow-sm rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 flex items-center">
          <div className="bg-brand-blue-50 p-2 rounded-full mr-3">
            <User className="h-5 w-5 text-brand-blue" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Add New Customer</h1>
        </div>
        
        {/* Customer Type Selection */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Customer Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => toggleCustomerType(false)}
              className={`flex items-center p-4 border rounded-lg hover:border-brand-blue hover:bg-brand-blue-50 transition-colors ${
                !isExistingCustomer ? 'border-brand-blue bg-brand-blue-50' : 'border-gray-200'
              }`}
            >
              <UserPlus className={`h-6 w-6 mr-3 ${!isExistingCustomer ? 'text-brand-blue' : 'text-gray-400'}`} />
              <div className="text-left">
                <h3 className={`font-medium ${!isExistingCustomer ? 'text-brand-blue' : 'text-gray-900'}`}>
                  New Customer
                </h3>
                <p className="text-sm text-gray-500">
                  Add a new customer with a new loan
                </p>
              </div>
            </button>
            
            <button
              type="button"
              onClick={() => toggleCustomerType(true)}
              className={`flex items-center p-4 border rounded-lg hover:border-brand-blue hover:bg-brand-blue-50 transition-colors ${
                isExistingCustomer ? 'border-brand-blue bg-brand-blue-50' : 'border-gray-200'
              }`}
            >
              <User className={`h-6 w-6 mr-3 ${isExistingCustomer ? 'text-brand-blue' : 'text-gray-400'}`} />
              <div className="text-left">
                <h3 className={`font-medium ${isExistingCustomer ? 'text-brand-blue' : 'text-gray-900'}`}>
                  Existing Customer
                </h3>
                <p className="text-sm text-gray-500">
                  Add a customer with an existing loan and payment history
                </p>
              </div>
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                id="first_name"
                type="text"
                className={`w-full rounded-lg border ${
                  errors.first_name ? 'border-red-500' : 'border-gray-300'
                } px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent`}
                placeholder="Enter first name"
                {...register('first_name', { required: 'First name is required' })}
              />
              {errors.first_name && (
                <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                id="last_name"
                type="text"
                className={`w-full rounded-lg border ${
                  errors.last_name ? 'border-red-500' : 'border-gray-300'
                } px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent`}
                placeholder="Enter last name"
                {...register('last_name', { required: 'Last name is required' })}
              />
              {errors.last_name && (
                <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                placeholder="Enter phone number"
                {...register('phone')}
              />
            </div>
          </div>
          
          {/* Loan Information Section */}
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Loan Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label htmlFor="principal" className="block text-sm font-medium text-gray-700 mb-1">
                  Principal Amount <span className="text-red-500">*</span>
                </label>
                <input
                  id="principal"
                  type="number"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                  placeholder="e.g. 500000"
                  {...register('principal', { 
                    required: 'Principal is required',
                    valueAsNumber: true,
                    min: { value: 1000, message: 'Minimum amount is 1,000' }
                  })}
                />
                {errors.principal && (
                  <p className="mt-1 text-sm text-red-600">{errors.principal.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="interest_rate" className="block text-sm font-medium text-gray-700 mb-1">
                  Interest Rate (%) <span className="text-red-500">*</span>
                </label>
                <input
                  id="interest_rate"
                  type="number"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                  placeholder="e.g. 10"
                  {...register('interest_rate', { 
                    required: 'Interest rate is required',
                    valueAsNumber: true,
                    min: { value: 1, message: 'Minimum rate is 1%' },
                    max: { value: 100, message: 'Maximum rate is 100%' }
                  })}
                />
                {errors.interest_rate && (
                  <p className="mt-1 text-sm text-red-600">{errors.interest_rate.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="duration_months" className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (Months) <span className="text-red-500">*</span>
                </label>
                <input
                  id="duration_months"
                  type="number"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                  placeholder="e.g. 6"
                  {...register('duration_months', { 
                    required: 'Duration is required',
                    valueAsNumber: true,
                    min: { value: 1, message: 'Minimum duration is 1 month' },
                    max: { value: 60, message: 'Maximum duration is 60 months' }
                  })}
                />
                {errors.duration_months && (
                  <p className="mt-1 text-sm text-red-600">{errors.duration_months.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="disbursement_date" className="block text-sm font-medium text-gray-700 mb-1">
                  Disbursement Date <span className="text-red-500">*</span>
                </label>
                <Controller
                  control={control}
                  name="disbursement_date"
                  rules={{ required: 'Disbursement date is required' }}
                  render={({ field }) => (
                    <DatePicker
                      selected={field.value}
                      onChange={(date) => field.onChange(date)}
                      dateFormat="dd/MM/yyyy"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                      placeholderText="Select date"
                      wrapperClassName="w-full"
                    />
                  )}
                />
                {errors.disbursement_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.disbursement_date.message}</p>
                )}
              </div>
              
              {/* For existing customers only */}
              {isExistingCustomer && (
                <div>
                  <label htmlFor="current_month" className="block text-sm font-medium text-gray-700 mb-1">
                    Current Payment Month <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="current_month"
                    type="number"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                    placeholder="e.g. 3"
                    {...register('current_month', { 
                      required: isExistingCustomer ? 'Current month is required' : false,
                      valueAsNumber: true,
                      min: { value: 1, message: 'Minimum is 1' },
                      max: { value: Number(watch('duration_months') || 60), message: 'Cannot exceed duration' }
                    })}
                  />
                  {errors.current_month && (
                    <p className="mt-1 text-sm text-red-600">{errors.current_month.message}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    All previous months will be marked as paid
                  </p>
                </div>
              )}
            </div>
            
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setShowLoanCalculator(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue transition-colors"
              >
                Calculate Loan
              </button>
              
              {loanCalculated && (
                <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Loan Calculated
                </span>
              )}
            </div>
          </div>
          
          {/* Loan Calculator (conditionally rendered) */}
          {showLoanCalculator && (
            <div className="mb-6">
              <LoanCalculator 
                onCalculate={handleLoanCalculation}
                initialPrincipal={Number(watch('principal'))}
                initialInterestRate={Number(watch('interest_rate'))}
                initialDuration={Number(watch('duration_months'))}
                initialDisbursementDate={watch('disbursement_date')}
                onClose={() => setShowLoanCalculator(false)}
              />
            </div>
          )}
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="bg-white py-3 px-6 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue mr-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white ${
                isValid
                  ? 'bg-brand-blue hover:bg-brand-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue'
                  : 'bg-gray-400 cursor-not-allowed'
              } transition-colors`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle className="-ml-1 mr-2 h-4 w-4" />
                  Create Customer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}