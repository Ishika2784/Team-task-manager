import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Folder, CheckSquare, Users, LogOut, Menu, Bell, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../services/api';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        setNotifications(res.data.data.notifications);
        setUnreadCount(res.data.data.unreadCount);
      } catch (error) {
        console.error('Failed to fetch notifications', error);
      }
    };
    
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleMarkAsRead = async () => {
    if (unreadCount === 0) return;
    try {
      await api.post('/notifications/read');
      setUnreadCount(0);
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error(error);
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', path: '/projects', icon: Folder },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'Users', path: '/users', icon: Users },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-slate-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-[#0B132B] text-slate-300 transform transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col sidebar-3d`}>
        <div className="flex items-center h-20 px-6">
          <Link to="/" className="flex items-center gap-3 text-white">
            <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center text-white">
              <CheckSquare size={18} />
            </div>
            <span className="text-xl font-bold tracking-tight">Taskflow</span>
          </Link>
        </div>
        
        <nav className="flex-1 px-3 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            // Precise active logic
            const isActive = location.pathname === item.path || 
                             (item.path !== '/' && location.pathname.startsWith(item.path));
                             
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                  isActive
                    ? 'bg-[#1C2541] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_4px_12px_rgba(0,0,0,0.3)]'
                    : 'text-slate-400 hover:bg-[#1C2541] hover:text-white hover:translate-x-1 hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)]'
                }`}
                style={{ transform: isActive ? 'translateZ(4px)' : undefined }}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                  {item.name}
                </div>
                {isActive && <ChevronRight size={16} className="text-slate-500" />}
              </Link>
            );
          })}
        </nav>

        {/* User Profile at Bottom */}
        <div className="p-4 mt-auto">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-[#1C2541] text-indigo-400 font-bold flex items-center justify-center uppercase text-lg border border-indigo-500/30">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <div className="text-sm font-semibold text-white">{user?.name}</div>
              <div className="text-[10px] uppercase tracking-wider font-bold text-indigo-400 bg-indigo-500/10 inline-block px-1.5 py-0.5 rounded mt-0.5 border border-indigo-500/20">
                {user?.role}
              </div>
            </div>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors w-full px-2 py-2"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white/50">
        {/* Topbar - Minimal, mostly for mobile menu or notifications if needed */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-8 z-10">
          <button 
            className="lg:hidden text-slate-500 hover:text-slate-700"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          
          <div className="flex-1"></div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative hidden sm:block">
              <button 
                onClick={() => {
                  setShowDropdown(!showDropdown);
                  if (!showDropdown) handleMarkAsRead();
                }}
                className="relative p-2 text-indigo-400 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-100"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </button>

              {/* Dropdown */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-semibold text-slate-800 text-sm">Notifications</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-sm text-slate-500">No new notifications</div>
                    ) : (
                      notifications.map(n => (
                        <Link 
                          key={n._id}
                          to={n.link || '#'}
                          className={`block px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors ${!n.isRead ? 'bg-indigo-50/50' : ''}`}
                          onClick={() => setShowDropdown(false)}
                        >
                          <p className="text-sm text-slate-800">{n.message}</p>
                          <span className="text-xs text-slate-500 mt-1 block">
                            {new Date(n.createdAt).toLocaleDateString()}
                          </span>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto px-4 sm:px-8 pb-8">
          {showDropdown && (
            <div className="fixed inset-0 z-0" onClick={() => setShowDropdown(false)}></div>
          )}
          <div className="relative z-10 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
