
import React, { useState } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AdminLayout } from "@/components/layout/admin-layout";

// Define Zod schema for form validation
const schoolSchema = z.object({
  name: z
    .string()
    .min(3, 'School name must be at least 3 characters')
    .max(100, 'School name must not exceed 100 characters')
    .regex(/^[a-zA-Z0-9\s-]+$/, 'School name can only contain letters, numbers, spaces, and hyphens'),
  baseUrl: z
    .string()
    .url('Please enter a valid URL')
    .regex(/^https?:\/\/[^\s/$.?#].[^\s]*$/, 'URL must be a valid HTTP/HTTPS address'),
  token: z
    .string()
    .min(8, 'Token must be at least 8 characters')
    .max(255, 'Token must not exceed 255 characters')
    .regex(/^[a-zA-Z0-9-_]+$/, 'Token can only contain letters, numbers, hyphens, and underscores'),
});

type SchoolFormData = z.infer<typeof schoolSchema>;

const CreateSchoolForm = () => {
  const [loading, setLoading] = useState(false);

  // Initialize react-hook-form with Zod resolver
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SchoolFormData>({
    resolver: zodResolver(schoolSchema),
    defaultValues: {
      name: '',
      baseUrl: '',
      token: '',
    },
  });

  const onSubmit = async (data: SchoolFormData) => {
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:4005/create-school', data);
      
      if (response.status === 200) {
        toast.success('School created successfully!');
        reset();
      }
    } catch (err) {
      toast.error('Failed to add school.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-lg mx-auto my-10 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Create School</h2>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              School Name
            </label>
            <input
              type="text"
              {...register('name')}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-300 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter school name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Base URL
            </label>
            <input
              type="text"
              {...register('baseUrl')}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-300 ${
                errors.baseUrl ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="https://example.com"
            />
            {errors.baseUrl && (
              <p className="mt-1 text-sm text-red-600">
                {errors.baseUrl.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Token
            </label>
            <input
              type="text"
              {...register('token')}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-300 ${
                errors.token ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter token"
            />
            {errors.token && (
              <p className="mt-1 text-sm text-red-600">
                {errors.token.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 font-medium rounded-md text-white transition-colors ${
              loading ? 'bg-gray-400' : 'bg-primary hover:bg-primary/90'
            }`}
          >
            {loading ? 'Submitting...' : 'Create School'}
          </button>
        </form>

        <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      </div>
    </AdminLayout>
  );
};

export default CreateSchoolForm;
