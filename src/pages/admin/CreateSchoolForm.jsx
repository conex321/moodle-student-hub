import React, { useState } from 'react';
import { AdminLayout } from "@/components/layout/admin-layout";

import axios from 'axios';

const CreateSchoolForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    baseUrl: '',
    token: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post('https://ungradedassignmentsendpoint.myeducrm.net/create-school', formData); // change the URL to your endpoint
      if(response.status === 200){
      setMessage('School created successfully!');
      setFormData({ name: '', baseUrl: '', token: '' });
      }
    } catch (err) {
      setMessage('Failed to create school.');
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <AdminLayout>
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-semibold mb-4">Create School</h2>
      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="name">School Name</label>
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="baseUrl">Base URL</label>
          <input
            type="text"
            name="baseUrl"
            id="baseUrl"
            value={formData.baseUrl}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="token">Token</label>
          <input
            type="text"
            name="token"
            id="token"
            value={formData.token}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
          />
        </div>

        <button
            type="submit"
            disabled={loading}
            style={{
                width: '100%',
                padding: '10px',
                backgroundColor: loading ? '#999' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.3s ease'
            }}
            >
            {loading ? 'Submitting...' : 'Submit'}
            </button>



        {message && (
          <p className="text-center mt-2 text-sm text-gray-700">{message}</p>
        )}
        
      </form>
    </div>
    </AdminLayout>
  );
};

export default CreateSchoolForm;
