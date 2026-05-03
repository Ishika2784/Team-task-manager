import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, MoreHorizontal, Clock, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow, isPast, isToday } from 'date-fns';

const AllTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/tasks`, {
        params: { 
          status: statusFilter, 
          priority: priorityFilter,
          limit: 100 // Fetch a large batch for global view
        }
      });
      setTasks(res.data.data.tasks);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line
  }, [statusFilter, priorityFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tasks</h1>
          <p className="text-slate-500 mt-1 text-sm">All team tasks</p>
        </div>
        
        {user.role === 'Admin' && (
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-semibold shadow-sm"
          >
            <Plus size={16} />
            New Task
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <select 
          className="px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none shadow-sm text-sm font-medium text-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="Pending">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Done</option>
        </select>
        <select 
          className="px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none shadow-sm text-sm font-medium text-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="">All priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-semibold">
                <th className="p-4 pl-6 w-1/3">Task</th>
                <th className="p-4 w-1/6">Project</th>
                <th className="p-4 w-1/6">Assignee</th>
                <th className="p-4 w-32 text-center">Status</th>
                <th className="p-4 w-24 text-center">Priority</th>
                <th className="p-4 w-32">Due</th>
                <th className="p-4 text-right pr-6 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500 text-sm">Loading tasks...</td>
                </tr>
              ) : tasks.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500 text-sm">No tasks found.</td>
                </tr>
              ) : (
                tasks.map(task => {
                  const dueDate = new Date(task.dueDate);
                  const isOverdue = isPast(dueDate) && !isToday(dueDate) && task.status !== 'Completed';

                  let statusLabel = 'To Do';
                  let statusClass = 'border-slate-200 text-slate-600 bg-slate-50';
                  if (task.status === 'Completed') {
                    statusLabel = 'Done';
                    statusClass = 'border-emerald-200 text-emerald-600 bg-emerald-50';
                  } else if (task.status === 'In Progress') {
                    statusLabel = 'In Progress';
                    statusClass = 'border-blue-200 text-blue-600 bg-blue-50';
                  }

                  let priorityClass = 'border-slate-200 text-slate-600 bg-slate-50';
                  if (task.priority === 'High') {
                    priorityClass = 'border-red-200 text-red-600 bg-red-50';
                  } else if (task.priority === 'Medium') {
                    priorityClass = 'border-amber-200 text-amber-600 bg-amber-50';
                  }

                  return (
                    <tr key={task._id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="font-semibold text-sm text-slate-900">{task.title}</div>
                        <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">{task.description}</div>
                      </td>
                      <td className="p-4 text-xs font-medium text-slate-500">
                        {task.project?.name || 'No Project'}
                      </td>
                      <td className="p-4 text-xs font-medium text-slate-500">
                        {task.assignee ? task.assignee.name : 'Unassigned'}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-1 rounded text-[11px] font-bold border inline-block min-w-[70px] ${statusClass}`}>
                          {statusLabel}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold border lowercase ${priorityClass}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className={`text-xs flex items-center gap-1.5 ${isOverdue ? "text-red-500 font-medium" : "text-slate-500"}`}>
                          {isOverdue ? <AlertTriangle size={14} /> : <Clock size={14} />}
                          {isOverdue ? `${formatDistanceToNow(dueDate)} ago` : `in ${formatDistanceToNow(dueDate)}`}
                        </div>
                      </td>
                      <td className="p-4 text-right pr-6 text-slate-400 hover:text-slate-600 cursor-pointer">
                        <MoreHorizontal size={20} className="inline-block" />
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AllTasks;
