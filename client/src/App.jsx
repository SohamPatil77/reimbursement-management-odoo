import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Auth Components
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';

// Employee Components
import SubmitExpense from './components/Employee/SubmitExpense';
import ExpenseHistory from './components/Employee/ExpenseHistory';

// Manager Components
import ApprovalQueue from './components/Manager/ApprovalQueue';

// Admin Components
import ManageUsers from './components/Admin/ManageUsers';
import ApprovalRules from './components/Admin/ApprovalRules';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        <Route path="/" element={
          <ProtectedRoute roles={['employee', 'manager', 'admin']}>
            <Layout />
          </ProtectedRoute>
        }>
          {/* Employee Routes */}
          <Route path="employee/submit" element={<SubmitExpense />} />
          <Route path="employee/history" element={<ExpenseHistory />} />
          
          {/* Manager / Admin Approvals */}
          <Route path="manager/approvals" element={
            <ProtectedRoute roles={['manager', 'admin', 'employee']}>
              <ApprovalQueue />
            </ProtectedRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="admin/users" element={
            <ProtectedRoute roles={['admin']}>
              <ManageUsers />
            </ProtectedRoute>
          } />
          <Route path="admin/rules" element={
            <ProtectedRoute roles={['admin']}>
              <ApprovalRules />
            </ProtectedRoute>
          } />
          
          {/* Default Redirect */}
          <Route index element={<Navigate to="/employee/history" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
