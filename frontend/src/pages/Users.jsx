import { useState, useEffect } from 'react';
import api from '../services/api';
import { MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await api.get('/auth/users');
        setUsers(res.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Users</h1>
          <p className="text-slate-500 mt-1 text-sm">Manage team members and their roles</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-semibold">
                <th className="p-4 pl-6 w-1/3">User</th>
                <th className="p-4 w-1/4">Email</th>
                <th className="p-4 w-1/6">Role</th>
                <th className="p-4 w-1/6">Joined</th>
                <th className="p-4 text-right pr-6 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500 text-sm">Loading users...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500 text-sm">No users found.</td>
                </tr>
              ) : (
                users.map(u => (
                  <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center text-xs uppercase border border-indigo-100">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-slate-900">{u.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-medium text-slate-500">
                      {u.email}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold border lowercase ${
                        u.role === 'Admin' ? 'border-blue-200 text-blue-600 bg-blue-50' : 'border-slate-200 text-slate-600 bg-slate-50'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-500">
                      {formatDistanceToNow(new Date(u.createdAt))} ago
                    </td>
                    <td className="p-4 text-right pr-6 text-slate-400 hover:text-slate-600 cursor-pointer">
                      <MoreHorizontal size={20} className="inline-block" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Users;
