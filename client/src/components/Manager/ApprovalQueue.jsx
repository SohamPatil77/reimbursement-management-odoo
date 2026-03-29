import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { MessageSquare, CheckCircle, XCircle, Search, User, Calendar, Tag } from 'lucide-react';

const ApprovalQueue = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionModal, setActionModal] = useState({ open: false, type: '', expenseId: null });
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/approval/pending');
      setExpenses(response.data);
    } catch (error) {
      console.error('Error fetching pending approvals', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!actionModal.type || !actionModal.expenseId) return;
    setSubmitting(true);
    try {
      await axios.post(`http://localhost:5000/api/approval/action/${actionModal.expenseId}`, {
        action: actionModal.type,
        comment
      });
      // Remove from list
      setExpenses(expenses.filter(e => e._id !== actionModal.expenseId));
      setActionModal({ open: false, type: '', expenseId: null });
      setComment('');
    } catch (error) {
      console.error('Error submitting action', error);
      alert(error.response?.data?.error || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Pending Approvals</h1>
          <p className="text-slate-500 mt-2">Review and action expense claims awaiting your approval.</p>
        </div>
        <div className="px-4 py-2 bg-blue-50 text-blue-700 font-semibold rounded-xl text-sm border border-blue-100">
          Showing amounts in {user?.company?.currency}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-blue-500 animate-spin"></div>
        </div>
      ) : expenses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-20 text-center shadow-sm">
           <div className="w-20 h-20 bg-emerald-50 text-emerald-500 flex items-center justify-center rounded-full mx-auto mb-4">
             <CheckCircle size={40} />
           </div>
           <h3 className="text-xl font-bold text-slate-800">All Caught Up!</h3>
           <p className="text-slate-500 mt-2">There are no pending approvals in your queue right now.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {expenses.map((expense) => (
            <div key={expense._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
              
              <div className="flex flex-col lg:flex-row justify-between gap-6">
                
                {/* Info Section */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                      {expense.employeeId?.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{expense.employeeId?.name}</h3>
                      <p className="text-xs text-slate-500">{expense.employeeId?.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Tag size={16} className="text-slate-400" />
                      <span className="font-medium bg-slate-100 px-2 py-0.5 rounded text-slate-700">{expense.category}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar size={16} className="text-slate-400" />
                      <span className="font-medium">{new Date(expense.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 border border-slate-100">
                     <p><strong>Description:</strong> {expense.description || 'No description provided.'}</p>
                  </div>
                </div>

                {/* Amount & Actions */}
                <div className="flex flex-col items-end justify-between min-w-[250px] border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6">
                  <div className="text-right w-full mb-6">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Requested Amount</p>
                    <div className="text-3xl font-black text-slate-900 mb-1 tracking-tight group-hover:text-blue-600 transition-colors">
                      {expense.convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-lg text-slate-500 font-bold">{user?.company?.currency}</span>
                    </div>
                    {expense.currency !== user?.company?.currency && (
                      <p className="text-sm font-medium text-slate-400">
                        Original: {expense.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {expense.currency}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex gap-3 w-full">
                    <button 
                      onClick={() => setActionModal({ open: true, type: 'rejected', expenseId: expense._id })}
                      className="flex-1 py-3 px-4 rounded-xl border-2 border-red-100 text-red-600 font-semibold hover:bg-red-50 hover:border-red-200 transition-all flex items-center justify-center gap-2"
                    >
                      <XCircle size={18} /> Reject
                    </button>
                    <button 
                      onClick={() => setActionModal({ open: true, type: 'approved', expenseId: expense._id })}
                      className="flex-1 py-3 px-4 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={18} /> Approve
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Receipt View if available */}
              {expense.receiptImage && (
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <a href={`http://localhost:5000/${expense.receiptImage.replace(/\\/g, '/')}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-sm font-medium hover:underline flex items-center gap-1">
                    View Attached Receipt
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Action Modal */}
      {actionModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className={`p-6 border-b ${actionModal.type === 'approved' ? 'bg-blue-50 border-blue-100' : 'bg-red-50 border-red-100'}`}>
              <h3 className={`text-xl font-bold flex items-center gap-2 ${actionModal.type === 'approved' ? 'text-blue-800' : 'text-red-800'}`}>
                {actionModal.type === 'approved' ? <CheckCircle /> : <XCircle />} 
                {actionModal.type === 'approved' ? 'Approve Expense' : 'Reject Expense'}
              </h3>
            </div>
            
            <div className="p-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <MessageSquare size={16} /> Add a comment (optional)
              </label>
              <textarea 
                rows="4"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-400 outline-none transition-all resize-none text-slate-700 font-medium"
                placeholder="Reason or notes for this action..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              ></textarea>
            </div>
            
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3 justify-end">
              <button 
                onClick={() => setActionModal({ open: false, type: '', expenseId: null })}
                className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
              <button 
                onClick={handleAction}
                disabled={submitting}
                className={`px-5 py-2.5 rounded-xl font-semibold text-white shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 ${actionModal.type === 'approved' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30' : 'bg-red-600 hover:bg-red-700 shadow-red-500/30'}`}
              >
                {submitting ? 'Processing...' : 'Confirm Action'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalQueue;
