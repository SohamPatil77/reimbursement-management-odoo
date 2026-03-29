import React, { useState, useContext } from 'react';
import { useForm as useRHForm } from 'react-hook-form';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useRHForm();
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', data);
      login(response.data.user, response.data.token);
      navigate('/');
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden text-slate-800">
      <div className="absolute w-[500px] h-[500px] bg-blue-600 rounded-full blur-[100px] opacity-20 -top-20 -left-20 pointer-events-none"></div>
      <div className="absolute w-[400px] h-[400px] bg-indigo-600 rounded-full blur-[100px] opacity-20 bottom-10 right-10 pointer-events-none"></div>
      
      <div className="w-full max-w-md p-8 glass rounded-2xl relative z-10 mx-4">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 mx-auto flex items-center justify-center text-white font-bold text-3xl shadow-xl shadow-blue-500/30 mb-4 transform hover:scale-105 transition-transform">
            R
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-gray-100">Welcome Back</h2>
          <p className="text-slate-500 mt-2">Log in to manage your reimbursements.</p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 border border-red-200 text-sm flex items-center">
            <span className="font-semibold">{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input 
              {...register('email', { required: 'Email is required' })}
              type="email"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-white/50 backdrop-blur-sm"
              placeholder="you@company.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input 
              {...register('password', { required: 'Password is required' })}
              type="password"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-white/50 backdrop-blur-sm"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <button 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-600">
          Don't have an account? <Link to="/signup" className="text-blue-600 font-semibold hover:underline">Register your company</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
