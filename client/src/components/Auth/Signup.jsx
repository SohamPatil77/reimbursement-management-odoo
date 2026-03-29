import React, { useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Signup = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await axios.post('http://localhost:5000/api/auth/signup', data);
      login(response.data.user, response.data.token);
      navigate('/');
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden py-10">
      <div className="absolute w-[600px] h-[600px] bg-purple-600 rounded-full blur-[120px] opacity-20 top-0 left-0 pointer-events-none"></div>
      <div className="absolute w-[400px] h-[400px] bg-blue-600 rounded-full blur-[100px] opacity-20 bottom-10 right-10 pointer-events-none"></div>
      
      <div className="w-full max-w-lg p-8 glass rounded-2xl relative z-10 mx-4">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 mx-auto flex items-center justify-center text-white font-bold text-3xl shadow-xl shadow-purple-500/30 mb-4 transform hover:scale-105 transition-transform">
            R
          </div>
          <h2 className="text-3xl font-bold text-slate-900">Create Account</h2>
          <p className="text-slate-500 mt-2">Setup a new company workspace as Admin.</p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 border border-red-200 text-sm font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Your Name</label>
              <input 
                {...register('name', { required: 'Name is required' })}
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none bg-white/50"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
              <input 
                {...register('companyName', { required: 'Company is required' })}
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none bg-white/50"
                placeholder="Acme Corp"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
            <input 
              {...register('country', { required: 'Country is required' })}
              type="text"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none bg-white/50"
              placeholder="United States"
            />
            <p className="text-xs text-slate-500 mt-1">Currency is automatically detected based on the country</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input 
              {...register('email', { required: 'Email is required' })}
              type="email"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none bg-white/50"
              placeholder="admin@company.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input 
              {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })}
              type="password"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none bg-white/50"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <button 
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 mt-2"
          >
            {loading ? 'Creating...' : 'Create Company Workspace'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-600">
          Already have an account? <Link to="/login" className="text-purple-600 font-semibold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
