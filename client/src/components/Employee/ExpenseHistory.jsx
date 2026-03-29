import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Clock, CheckCircle2, XCircle, Search, FileText } from 'lucide-react';
import clsx from 'clsx';

const ExpenseHistory = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/expense/my-expenses');
      setExpenses(response.data);
    } catch (error) {
      console.error('Error fetching expenses', error);
    } finally {
      setLoading(false);
    }
  };

  const StatusBadge = ({ status }) => {
    const config = {
      pending: { bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock },
      approved: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle2 },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
      draft: { bg: 'bg-slate-100', text: 'text-slate-700', icon: FileText },
    };
    const { bg, text, icon: Icon } = config[status] || config.pending;

    return (
      <span className={clsx(`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold capitalize w-max`, bg, text)}>
        <Icon size={14} /> {status}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">My Expenses</h1>
          <p className="text-slate-500 mt-2">Track and manage your submitted claims.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search claims..." 
            className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-64 shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-500 flex flex-col items-center">
            <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-blue-500 animate-spin mb-4"></div>
            Loading your history...
          </div>
        ) : expenses.length === 0 ? (
          <div className="p-16 text-center text-slate-500 flex flex-col items-center">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <FileText size={32} className="text-slate-300" />
             </div>
             <p className="text-lg font-medium text-slate-700">No expenses found</p>
             <p className="text-sm mt-1">Submit your first expense claim to see it here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-sm font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {expenses.map((expense) => (
                  <tr key={expense._id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium whitespace-nowrap">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-slate-700">{expense.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-600 truncate max-w-xs">{expense.description || '-'}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="font-bold text-slate-800">
                        {expense.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {expense.currency}
                      </div>
                      {expense.currency !== user?.company?.currency && (
                        <div className="text-xs text-slate-400 font-medium">
                          ≈ {expense.convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {user?.company?.currency}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={expense.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseHistory;
