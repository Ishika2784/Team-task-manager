import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { formatDistanceToNow } from 'date-fns';
import { AlertTriangle, CheckSquare, Clock, Folder, Users, LayoutList } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [projectsCount, setProjectsCount] = useState(0);
  const [usersCount, setUsersCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsRes, activitiesRes, projectsRes] = await Promise.all([
          api.get('/tasks/stats'),
          api.get('/activities?page=1&limit=10'),
          api.get('/projects'),
        ]);
        
        setStats(statsRes.data.data);
        setActivities(activitiesRes.data.data.activities);
        setProjectsCount(projectsRes.data.data.length);
        
        if (user?.role === 'Admin') {
          try {
            const usersRes = await api.get('/auth/users');
            setUsersCount(usersRes.data.data.length);
          } catch (e) {
            console.error(e);
          }
        } else {
          // If member, just count distinct members from their projects
          const uniqueMembers = new Set();
          projectsRes.data.data.forEach(p => {
            p.members.forEach(m => uniqueMembers.add(m._id));
          });
          setUsersCount(uniqueMembers.size);
        }

      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user]);

  if (loading || !stats) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-slate-500 mt-1 text-sm">Your team's progress at a glance</p>
      </div>

      {/* Stats Row - Exact match to Taskflow */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard title="Total Tasks" value={stats.totalTasks} icon={<LayoutList size={16} className="text-indigo-500" />} />
        <StatCard title="Completed" value={stats.completedTasks} icon={<CheckSquare size={16} className="text-emerald-500" />} />
        <StatCard title="Pending" value={stats.pendingTasks + stats.inProgressTasks} icon={<Clock size={16} className="text-amber-500" />} />
        <StatCard title="Overdue" value={stats.overdueTasks} icon={<AlertTriangle size={16} className="text-red-500" />} />
        <StatCard title="Projects" value={projectsCount} icon={<Folder size={16} className="text-indigo-500" />} />
        <StatCard title="Members" value={usersCount} icon={<Users size={16} className="text-purple-500" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Project Progress */}
        <div className="lg:col-span-3 bg-white border border-slate-200 shadow-sm rounded-xl p-6">
          <h3 className="text-base font-bold text-slate-900 mb-6">Project Progress</h3>
          <div className="space-y-8">
            {stats.projectProgress?.length === 0 ? (
              <p className="text-sm text-slate-500">No active projects found.</p>
            ) : (
              stats.projectProgress?.map((project) => (
                <div key={project._id} className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-slate-800">{project.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 text-xs">{project.completed}/{project.total} tasks</span>
                      <span className="text-slate-500 text-xs w-8 text-right">{project.progressPercentage}%</span>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-indigo-50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${project.progressPercentage}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-indigo-500 font-medium">{project.inProgress} in progress</span>
                    <span className="text-slate-500">{project.toDo} to do</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Overdue Tasks */}
        <div className="lg:col-span-2 bg-white border border-slate-200 shadow-sm rounded-xl p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-slate-900">Overdue Tasks</h3>
            {stats.overdueTasks > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-md">
                {stats.overdueTasks}
              </span>
            )}
          </div>
          <div className="space-y-3 flex-1">
            {stats.overdueTasksList?.length === 0 ? (
              <p className="text-sm text-slate-500">No overdue tasks. Great job!</p>
            ) : (
              stats.overdueTasksList?.map((task) => (
                <div key={task._id} className="p-3 border border-red-100 bg-red-50/30 rounded-lg flex gap-3">
                  <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">{task.title}</h4>
                    <div className="flex items-center gap-2 mt-1 text-xs">
                      <span className="text-slate-500">{task.projectName}</span>
                      <span className="text-red-500 font-medium">Due {formatDistanceToNow(new Date(task.dueDate))} ago</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
        <h3 className="text-base font-bold text-slate-900 mb-6">Recent Activity</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <tbody className="divide-y divide-slate-100">
              {activities.length === 0 ? (
                <tr>
                  <td className="py-4 text-center text-sm text-slate-500">No recent activity found.</td>
                </tr>
              ) : (
                activities.slice(0, 5).map((activity) => {
                  // Attempt to parse out some simulated data from the activity string
                  // In a perfect match we'd change the Activity model to capture exact fields, 
                  // but we can parse the "details" string or just use the current task status.
                  // For the UI, we'll extract relevant text or provide fallbacks to match the visual.
                  const isCreated = activity.action === 'Task Created';
                  const isUpdated = activity.action === 'Task Updated';
                  const isCompleted = activity.details.includes('Completed');
                  
                  let statusLabel = 'To Do';
                  let statusClass = 'border-slate-200 text-slate-600 bg-slate-50';
                  if (isCompleted) {
                    statusLabel = 'Done';
                    statusClass = 'border-emerald-200 text-emerald-600 bg-emerald-50';
                  } else if (isUpdated) {
                    statusLabel = 'In Progress';
                    statusClass = 'border-blue-200 text-blue-600 bg-blue-50';
                  }

                  // Priority pill (simulated based on activity or defaults to medium)
                  // In a real app we'd populate the Task in the Activity model.
                  
                  return (
                    <tr key={activity._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 pr-4 w-32">
                        <span className={`px-2 py-1 border rounded text-[11px] font-bold ${statusClass}`}>
                          {statusLabel}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="font-semibold text-sm text-slate-800">{activity.details.split(' updated task "')[1]?.replace('"', '') || activity.details.split(' created task "')[1]?.replace('"', '') || activity.details}</div>
                        <div className="text-xs text-slate-500 mt-1">System Action</div>
                      </td>
                      <td className="py-4 text-right text-xs text-slate-500 whitespace-nowrap">
                        {formatDistanceToNow(new Date(activity.createdAt))} ago
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

const StatCard = ({ title, value, icon }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between h-24">
      <div className="flex justify-between items-start">
        <span className="text-xs font-semibold text-slate-500">{title}</span>
        <div className="p-1 rounded-md bg-slate-50 border border-slate-100">
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
    </div>
  );
};

export default Dashboard;
