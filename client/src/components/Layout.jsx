import React, { useContext } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Home, FilePlus, Users, Settings, Briefcase } from 'lucide-react';
import clsx from 'clsx';

const Layout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { label: 'My Expenses', path: '/employee/history', icon: Home, roles: ['employee', 'manager', 'admin'] },
    { label: 'Submit Claim', path: '/employee/submit', icon: FilePlus, roles: ['employee', 'manager', 'admin'] },
    // Only show approval queue to users who are managers, admins, or strictly set as approvers (in a real-world scenario could just conditionally render, here we render for Manager/Admin)
    { label: 'Approvals', path: '/manager/approvals', icon: Briefcase, roles: ['manager', 'admin', 'employee'] },
    { label: 'Manage Users', path: '/admin/users', icon: Users, roles: ['admin'] },
    { label: 'Approval Rules', path: '/admin/rules', icon: Settings, roles: ['admin'] },
  ];

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-2xl z-20 transition-all duration-300">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-xl shadow-lg">
            R
          </div>
          <span className="font-semibold text-lg tracking-wide">ReimburseApp</span>
        </div>
        
        <div className="px-6 py-4 flex flex-col items-center border-b border-slate-700/50 mb-4">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-2xl font-bold mb-3 shadow-inner">
            {user?.name?.charAt(0)}
          </div>
          <p className="font-medium text-slate-200">{user?.name}</p>
          <span className="text-xs px-2 py-1 mt-1 rounded-full bg-slate-800 text-slate-400 capitalize">
            {user?.role}
          </span>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.filter(item => item.roles.includes(user?.role)).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden",
                  isActive ? "bg-blue-600/10 text-blue-400" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                )}
              >
                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-md"></div>}
                <Icon size={20} className={clsx("transition-transform duration-200", isActive ? "scale-110" : "group-hover:scale-110")} />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto bg-slate-50">
        <div className="absolute top-0 left-0 right-0 h-64 bg-slate-900 pointer-events-none"></div>
        <div className="relative z-10 p-8 min-h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
