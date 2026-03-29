import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { UserPlus, Shield, User, Search, RefreshCw, X } from 'lucide-react';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/admin/all-users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const onAddUser = async (data) => {
    try {
      await axios.post('http://localhost:5000/api/admin/create-user', {
        ...data,
        isManagerApprover: data.isManagerApprover === 'true',
        managerId: data.managerId || null
      });
      setShowAddModal(false);
      reset();
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to create user');
    }
  };

  const updateUserRole = async (userId, updateData) => {
    try {
      await axios.put('http://localhost:5000/api/admin/update-role', { userId, ...updateData });
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update user');
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="flex justify-between items-end mb-8 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Manage Users</h1>
          <p className="text-slate-500 mt-2">Add, remove, and define roles & managers for your company workspace.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white font-semibold flex items-center justify-center gap-2 px-6 py-3 rounded-xl shadow-lg shadow-slate-900/20 transition-all transform hover:-translate-y-0.5"
        >
          <UserPlus size={18} /> Add New User
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
             <div className="flex justify-center p-20 text-slate-400">
               <RefreshCw className="animate-spin" size={32} />
             </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Name / Email</th>
                  <th className="px-6 py-4">Current Role</th>
                  <th className="px-6 py-4">Manager Authority</th>
                  <th className="px-6 py-4">Assigned Manager</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">{u.name}</div>
                          <div className="text-sm text-slate-500">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select 
                        className="bg-transparent border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={u.role}
                        onChange={(e) => updateUserRole(u._id, { role: e.target.value })}
                        disabled={u.role === 'admin'} // Admin role locked from simple UI
                      >
                        <option value="employee">Employee</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <label className="flex items-center gap-2 cursor-pointer">
                         <input 
                           type="checkbox" 
                           checked={u.isManagerApprover} 
                           onChange={(e) => updateUserRole(u._id, { isManagerApprover: e.target.checked })}
                           className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-slate-300"
                           disabled={u.role === 'admin'}
                         />
                         <span className="text-sm font-medium text-slate-600">Can Approve</span>
                       </label>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select 
                        className="bg-transparent border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 w-48 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={u.managerId?._id || ''}
                        onChange={(e) => updateUserRole(u._id, { managerId: e.target.value || null })}
                      >
                        <option value="">None</option>
                        {users.filter(user => user._id !== u._id).map((manager) => (
                          <option key={manager._id} value={manager._id}>{manager.name} ({manager.role})</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-8 relative">
             <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"><X size={24} /></button>
             <h2 className="text-2xl font-bold text-slate-800 mb-6">Create New User</h2>
             
             <form onSubmit={handleSubmit(onAddUser)} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input {...register('name', { required: true })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                  <input type="email" {...register('email', { required: true })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Temporary Password</label>
                  <input type="password" {...register('password', { required: true, minLength: 6 })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                    <select {...register('role')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                      <option value="employee">Employee</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Approver Privileges</label>
                    <select {...register('isManagerApprover')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                      <option value="false">Cannot Approve</option>
                      <option value="true">Can Approve</option>
                    </select>
                  </div>
                </div>

                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Assign Manager</label>
                   <select {...register('managerId')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                      <option value="">No Manager Assigned</option>
                      {users.map(u => (
                        <option key={u._id} value={u._id}>{u.name} - {u.email}</option>
                      ))}
                   </select>
                </div>

                <div className="pt-4 mt-6 border-t border-slate-100 flex gap-3">
                   <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 px-4 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">Cancel</button>
                   <button type="submit" className="flex-1 py-3 px-4 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all">Create User</button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
