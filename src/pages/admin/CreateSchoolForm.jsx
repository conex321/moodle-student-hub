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

const CreateSchoolForm = () => {
  const [loading, setLoading] = useState(false);

  // Initialize react-hook-form with Zod resolver
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schoolSchema),
    defaultValues: {
      name: '',
      baseUrl: '',
      token: '',
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const response = await axios.post('https://ungradedassignmentsendpoint.myeducrm.net/create-school', data);
      
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
    <div style={{ maxWidth: '400px', margin: '40px auto', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ color: '#333', textAlign: 'center' }}>Create School</h2>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            School Name
          </label>
          <input
            type="text"
            {...register('name')}
            style={{
              width: '100%',
              padding: '10px',
              border: errors.name ? '1px solid #ff4d4f' : '1px solid #ccc',
              borderRadius: '5px',
              fontSize: '16px',
            }}
            placeholder="Enter school name"
            aria-invalid={errors.name ? 'true' : 'false'}
          />
          {errors.name && (
            <p style={{ color: '#ff4d4f', fontSize: '14px', marginTop: '5px' }}>
              {errors.name.message}
            </p>
          )}
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Base URL
          </label>
          <input
            type="text"
            {...register('baseUrl')}
            style={{
              width: '100%',
              padding: '10px',
              border: errors.baseUrl ? '1px solid #ff4d4f' : '1px solid #ccc',
              borderRadius: '5px',
              fontSize: '16px',
            }}
            placeholder="https://example.com"
            aria-invalid={errors.baseUrl ? 'true' : 'false'}
          />
          {errors.baseUrl && (
            <p style={{ color: '#ff4d4f', fontSize: '14px', marginTop: '5px' }}>
              {errors.baseUrl.message}
            </p>
          )}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Token
          </label>
          <input
            type="text"
            {...register('token')}
            style={{
              width: '100%',
              padding: '10px',
              border: errors.token ? '1px solid #ff4d4f' : '1px solid #ccc',
              borderRadius: '5px',
              fontSize: '16px',
            }}
            placeholder="Enter token"
            aria-invalid={errors.token ? 'true' : 'false'}
          />
          {errors.token && (
            <p style={{ color: '#ff4d4f', fontSize: '14px', marginTop: '5px' }}>
              {errors.token.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: loading ? '#999' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.3s ease',
          }}
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