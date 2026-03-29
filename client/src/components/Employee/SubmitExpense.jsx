import React, { useState, useContext, useRef } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { UploadCloud, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const SubmitExpense = () => {
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm();
  const [file, setFile] = useState(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef(null);
  
  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Attempt OCR reading
      setOcrLoading(true);
      const formData = new FormData();
      formData.append('receipt', selectedFile);
      
      try {
        const response = await axios.post('http://localhost:5000/api/expense/ocr-scan', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        const { suggestedAmount, suggestedDate } = response.data.data;
        if (suggestedAmount) {
          setValue('amount', suggestedAmount);
          setMessage({ type: 'success', text: `OCR read amount: $${suggestedAmount}` });
        }
        if (suggestedDate) {
          // Simplistic date format fix for input type="date"
          const parsed = new Date(suggestedDate);
          if (!isNaN(parsed)) {
            setValue('date', parsed.toISOString().split('T')[0]);
          }
        }
      } catch (err) {
        console.error('OCR Error', err);
        setMessage({ type: 'error', text: 'OCR scan failed. Please fill details manually.' });
      } finally {
        setOcrLoading(false);
      }
    }
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    setMessage({ type: '', text: '' });
    
    const formData = new FormData();
    formData.append('amount', data.amount);
    formData.append('currency', data.currency);
    formData.append('category', data.category);
    formData.append('description', data.description);
    formData.append('date', data.date);
    if (file) {
      formData.append('receipt', file);
    }

    try {
      await axios.post('http://localhost:5000/api/expense/submit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage({ type: 'success', text: 'Expense submitted successfully!' });
      reset();
      setFile(null);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Submission failed' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Submit Expense</h1>
        <p className="text-slate-500 mt-2">Upload your receipt and fill in the details.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 relative overflow-hidden">
        {message.text && (
          <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
            {message.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* File Upload Area */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${file ? 'border-blue-400 bg-blue-50/50' : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50'}`}
          >
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileChange}
              accept="image/*"
            />
            {ocrLoading ? (
               <div className="flex flex-col items-center gap-3 text-blue-600">
                  <Loader2 className="animate-spin" size={32} />
                  <span className="font-medium">Scanning receipt with AI...</span>
               </div>
            ) : file ? (
               <div className="flex flex-col items-center gap-2 text-slate-700">
                  <CheckCircle2 className="text-emerald-500" size={32} />
                  <span className="font-medium">{file.name}</span>
                  <span className="text-xs text-slate-400">Click to change</span>
               </div>
            ) : (
              <div className="flex flex-col items-center gap-3 text-slate-500">
                 <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                   <UploadCloud size={32} />
                 </div>
                 <span className="font-medium text-slate-700 text-lg">Click to Upload Receipt</span>
                 <span className="text-sm">JPEG, PNG, JPG (Smart AI Scan Enabled)</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Amount</label>
              <input 
                {...register('amount', { required: 'Amount is required' })}
                type="number" step="0.01"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Currency</label>
              <input 
                {...register('currency', { required: 'Currency is required' })}
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium uppercase"
                placeholder="USD, EUR, INR..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
              <input 
                {...register('date', { required: 'Date is required' })}
                type="date"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
              <select 
                {...register('category', { required: 'Category is required' })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium bg-white"
              >
                <option value="">Select Category</option>
                <option value="Food">Food & Dining</option>
                <option value="Travel">Travel & Transit</option>
                <option value="Accommodation">Accommodation</option>
                <option value="Medical">Medical</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
            <textarea 
              {...register('description')}
              rows="3"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
              placeholder="What was this expense for?"
            ></textarea>
          </div>

          <button 
            disabled={submitting || ocrLoading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold flex items-center justify-center gap-2 py-4 rounded-xl shadow-lg transition-all disabled:opacity-50"
          >
            {submitting ? (
              <><Loader2 className="animate-spin" size={20} /> Submitting...</>
            ) : 'Submit Claim'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubmitExpense;
