// src/app/customers/add/page.tsx
"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { createCustomer } from '@/lib/supabase/db';
import { User, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';

type CustomerFormData = {
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
  address?: string;
};

export default function AddCustomerPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isValid } 
  } = useForm<CustomerFormData>({
    mode: 'onChange',
    defaultValues: {
      first_name: '',
      last_name: '',
      phone: '',
      email: '',
      address: ''
    }
  });
  
  const onSubmit = async (data: CustomerFormData) => {
    try {
      setIsSubmitting(true);
      
      const newCustomer = await createCustomer(data);
      
      toast.success('Customer created successfully!');
      router.push(`/customers/${newCustomer.id}`);
    } catch (error) {
      console.error('Error creating customer:', error);
    } finally {
      setIsSubmitting(false);
    }
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
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                className={`w-full rounded-lg border ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                } px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent`}
                placeholder="Enter email address"
                {...register('email', {
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                id="address"
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                placeholder="Enter address"
                {...register('address')}
              ></textarea>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="bg-white py-3 px-6 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue mr-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isValid}
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