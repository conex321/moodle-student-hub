import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CreateSchoolForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    baseUrl: '',
    token: ''
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
   const response = await axios.post('https://ungradedassignmentsendpoint.myeducrm.net/create-school', formData); // change the URL to your endpoint
      if(response.status === 200){
      setMessage('School created successfully!');
      setFormData({ name: '', baseUrl: '', token: '' });
      }
    } catch (err) {
      toast.error('Failed to add school.');
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto' }}>
      <h2>Create School</h2>
      <form onSubmit={handleSubmit}>
        <label>
          School Name:
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />
        </label>
        <label>
          Base URL:
          <input
            type="text"
            name="baseUrl"
            value={formData.baseUrl}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />
        </label>
        <label>
          Token:
          <input
            type="text"
            name="token"
            value={formData.token}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', marginBottom: '15px' }}
          />
        </label>

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
      </form>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default CreateSchoolForm;
