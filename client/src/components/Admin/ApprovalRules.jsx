import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, GitMerge, ListOrdered, Users, CheckCircle, Percent } from 'lucide-react';
import clsx from 'clsx';

const ApprovalRules = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [existingRules, setExistingRules] = useState([]);
  
  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState('sequential');
  const [conditionType, setConditionType] = useState('percentage');
  const [percentageThreshold, setPercentageThreshold] = useState(100);
  const [specificApproverId, setSpecificApproverId] = useState('');
  const [selectedApprovers, setSelectedApprovers] = useState([]);

  useEffect(() => {
    fetchUsers();
    fetchExistingRules();
  }, []);

  const fetchExistingRules = async () => {
    try {
      const resp = await axios.get('http://localhost:5000/api/admin/approval-rules');
      setExistingRules(resp.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/all-users');
      // Only allow those who CAN approve
      setUsers(response.data.filter(u => u.isManagerApprover || u.role === 'admin' || u.role === 'manager'));
    } catch (error) {
      console.error('Error fetching users', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleApprover = (userId) => {
    const existing = selectedApprovers.find(a => a.userId === userId);
    if (existing) {
      setSelectedApprovers(selectedApprovers.filter(a => a.userId !== userId));
    } else {
      setSelectedApprovers([...selectedApprovers, { userId, sequence: selectedApprovers.length + 1 }]);
    }
  };

  const updateSequence = (userId, newSeq) => {
    setSelectedApprovers(selectedApprovers.map(a => 
      a.userId === userId ? { ...a, sequence: parseInt(newSeq) || 1 } : a
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    
    if (selectedApprovers.length === 0) {
      alert("Please select at least one approver.");
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/admin/approval-rules', {
        name,
        type,
        approvers: selectedApprovers,
        conditionType: type === 'sequential' ? undefined : conditionType,
        percentageThreshold: (type !== 'sequential' && ['percentage', 'hybrid'].includes(conditionType)) ? parseFloat(percentageThreshold) : undefined,
        specificApproverId: (type !== 'sequential' && ['specific', 'hybrid'].includes(conditionType)) ? specificApproverId : undefined
      });
      setSuccessMsg(`Rule "${name}" created successfully!`);
      // Reset
      setName('');
      setSelectedApprovers([]);
      fetchExistingRules();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to create rule');
    }
  };

  if (loading) return <div className="p-20 text-center flex justify-center"><div className="w-8 h-8 rounded-full border-4 border-t-purple-500 animate-spin"></div></div>;

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="mb-8 border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-bold text-slate-800">Approval Workflow Rules</h1>
        <p className="text-slate-500 mt-2">Design complex, multi-layered approval chains for company expenses.</p>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl mb-6 font-semibold flex items-center gap-3 border border-emerald-100">
           <CheckCircle size={20} /> {successMsg}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section 1: Basic Info */}
          <div>
             <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><ListOrdered className="text-purple-500" size={20}/> 1. Basic Information</h3>
             <label className="block text-sm font-semibold text-slate-700 mb-2">Rule Name</label>
             <input 
                required
                value={name} onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                placeholder="e.g. Executive Travel Protocol"
             />
          </div>

          <hr className="border-slate-100" />

          {/* Section 2: Rule Strategy */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><GitMerge className="text-purple-500" size={20}/> 2. Resolution Strategy</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               {['sequential', 'conditional', 'hybrid'].map((t) => (
                 <div 
                   key={t}
                   onClick={() => setType(t)}
                   className={clsx(
                     "border-2 rounded-xl p-4 cursor-pointer transition-all hover:-translate-y-1",
                     type === t ? 'border-purple-500 bg-purple-50/50' : 'border-slate-100 bg-slate-50 hover:border-purple-200'
                   )}
                 >
                   <p className="font-bold text-slate-800 capitalize mb-1">{t}</p>
                   <p className="text-xs text-slate-500 leading-relaxed">
                     {t === 'sequential' && 'Strict ordered one-by-one queue.'}
                     {t === 'conditional' && 'Requires complex rules (%, specific person).'}
                     {t === 'hybrid' && 'Ordered queue but skips if conditions met.'}
                   </p>
                 </div>
               ))}
            </div>

            {type !== 'sequential' && (
               <div className="mt-6 p-6 bg-slate-50 rounded-xl border border-slate-100 space-y-4">
                  <h4 className="font-semibold text-slate-800 text-sm uppercase tracking-wider">Condition Setup</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Condition Type</label>
                    <select 
                       value={conditionType} onChange={(e) => setConditionType(e.target.value)}
                       className="w-full md:w-1/2 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none bg-white font-medium"
                    >
                       <option value="percentage">Percentage Threshold</option>
                       <option value="specific">Specific Approver Bypass</option>
                       <option value="hybrid">Percentage OR Specific Approver</option>
                    </select>
                  </div>

                  {['percentage', 'hybrid'].includes(conditionType) && (
                     <div>
                       <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1.5"><Percent size={14}/> Auto-Approve if X% say yes</label>
                       <input 
                         type="number" min="1" max="100"
                         value={percentageThreshold} onChange={(e) => setPercentageThreshold(e.target.value)}
                         className="w-full md:w-1/2 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none font-medium"
                       />
                     </div>
                  )}

                  {['specific', 'hybrid'].includes(conditionType) && (
                     <div>
                       <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1.5"><Shield size={14}/> The "Golden Ticket" Approver</label>
                       <select 
                         value={specificApproverId} onChange={(e) => setSpecificApproverId(e.target.value)}
                         className="w-full md:w-1/2 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none bg-white font-medium"
                       >
                         <option value="">Select an Executive / VIP</option>
                         {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.role})</option>)}
                       </select>
                       <p className="text-xs text-slate-500 mt-2">If this specific person approves, the whole chain is auto-approved.</p>
                     </div>
                  )}
               </div>
            )}
          </div>

          <hr className="border-slate-100" />

          {/* Section 3: Pool Selection */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Users className="text-purple-500" size={20}/> 3. Assigned Approvers</h3>
            <p className="text-sm text-slate-500 mb-4">Select users who are part of this approval queue. Adjust Sequence for ordering.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto custom-scrollbar pr-2">
               {users.map(u => {
                 const isSelected = selectedApprovers.find(a => a.userId === u._id);
                 return (
                   <div key={u._id} className={clsx("flex items-center justify-between p-3 rounded-xl border transition-all", isSelected ? 'border-purple-300 bg-purple-50' : 'border-slate-100 bg-white hover:border-purple-200')}>
                     <div className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          checked={!!isSelected}
                          onChange={() => toggleApprover(u._id)}
                          className="w-5 h-5 text-purple-600 rounded border-slate-300 focus:ring-purple-500 cursor-pointer"
                        />
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{u.name}</p>
                          <p className="text-xs text-slate-500 uppercase">{u.role}</p>
                        </div>
                     </div>
                     {isSelected && (
                        <div className="flex items-center gap-2">
                           <span className="text-xs font-semibold text-purple-700">Seq:</span>
                           <input 
                             type="number" min="1"
                             value={isSelected.sequence}
                             onChange={(e) => updateSequence(u._id, e.target.value)}
                             className="w-16 px-2 py-1 text-sm rounded bg-white border border-purple-200 focus:ring-2 focus:ring-purple-500 outline-none font-bold text-center text-purple-800"
                           />
                        </div>
                     )}
                   </div>
                 );
               })}
            </div>
          </div>

          <div className="pt-6">
             <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl mb-4 text-sm text-blue-800 flex gap-2">
                 <Shield className="shrink-0 text-blue-500" size={20} />
                 <span><strong>Universal Admin Override Active:</strong> As an Admin, you inherently have final authority. If an Admin approves an expense manually, it instantly bypasses all selected workflow rules.</span>
             </div>
             <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold flex items-center justify-center gap-2 py-4 rounded-xl shadow-xl shadow-slate-900/20 transition-all transform hover:-translate-y-0.5">
               Save Workflow Strategy
             </button>
          </div>

        </form>
      </div>

      {/* Existing Rules Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3"><ListOrdered className="text-slate-500"/> Previously Created Rules</h2>
        {existingRules.length === 0 ? (
          <div className="p-8 text-center font-medium text-slate-500 bg-white rounded-2xl border border-dashed border-slate-300 shadow-sm">No custom rules have been built yet.</div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {existingRules.map(r => (
               <div key={r._id} className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4 hover:shadow-md transition-shadow">
                 <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                   <h3 className="font-bold text-xl text-slate-800">{r.name}</h3>
                   <span className="bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">{r.type} Rule</span>
                 </div>
                 
                 {r.type !== 'sequential' && (
                   <div className="text-sm text-slate-700 mb-2 p-3 bg-purple-50/50 rounded-xl border border-purple-100/50">
                     <p className="font-semibold text-purple-800 mb-1">Conditions:</p>
                     {r.percentageThreshold && <p className="text-purple-600 text-xs flex items-center gap-1.5"><CheckCircle size={12}/> Auto-Approve if {r.percentageThreshold}% say yes.</p>}
                     {r.specificApproverId && <p className="text-purple-600 text-xs flex items-center gap-1.5"><Shield size={12}/> {r.specificApproverId.name} ({r.specificApproverId.role}) acts as Golden Ticket override.</p>}
                   </div>
                 )}

                 <div className="text-sm text-slate-700">
                    <p className="font-bold mb-3 text-slate-500 uppercase text-xs tracking-wider">Queue Assigned Sequencing:</p>
                    <ul className="space-y-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                      {r.approvers.sort((a,b)=>a.sequence - b.sequence).map(app => (
                        <li key={app._id} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 m-0">
                          <span className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white shadow-sm">{app.sequence}</span>
                          <span className="font-semibold text-slate-800 truncate">{app.userId?.name}</span> 
                          <span className="text-[10px] px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-500 font-bold uppercase tracking-widest">{app.userId?.role}</span>
                        </li>
                      ))}
                    </ul>
                 </div>
                 <div className="bg-blue-50/80 text-blue-800 text-xs font-medium p-3 rounded-lg flex gap-2 items-center mt-2 border border-blue-100/50">
                    <Shield size={16} className="shrink-0" /> Rest assured: Your Admin account has master authority to instantly override this workflow at any queue stage.
                 </div>
               </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default ApprovalRules;
