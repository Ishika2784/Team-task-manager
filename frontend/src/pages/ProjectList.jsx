import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Users, CheckSquare, Folder, MoreHorizontal } from 'lucide-react';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Projects</h1>
          <p className="text-slate-500 mt-1 text-sm">Manage and track all your team projects</p>
        </div>
        {user.role === 'Admin' && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-semibold shadow-sm"
          >
            <Plus size={16} />
            New Project
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400 bg-white border border-dashed border-slate-300 rounded-xl">
            <Folder size={48} className="mb-4 text-slate-300" />
            <h3 className="text-base font-semibold text-slate-600">No projects found</h3>
            <p className="text-sm mt-1">Get started by creating a new project.</p>
          </div>
        ) : (
          projects.map(project => (
            <div key={project._id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col h-64">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-50 rounded flex items-center justify-center text-indigo-600 border border-indigo-100">
                    <Folder size={16} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 truncate">{project.name}</h3>
                </div>
                <button className="text-slate-400 hover:text-slate-600">
                  <MoreHorizontal size={20} />
                </button>
              </div>
              
              <p className="text-slate-500 text-sm line-clamp-2 mb-4 flex-1">
                {project.description}
              </p>
              
              <div className="flex items-center gap-4 text-xs font-medium text-slate-500 mb-6">
                <div className="flex items-center gap-1.5">
                  <CheckSquare size={14} className="text-slate-400" />
                  <span>{project.totalTasks || 0} tasks</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users size={14} className="text-slate-400" />
                  <span>{project.members.length} members</span>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-600">Progress</span>
                  <span className="text-slate-600">{project.progressPercentage || 0}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600 rounded-full"
                    style={{ width: `${project.progressPercentage || 0}%` }}
                  ></div>
                </div>
              </div>

              <Link 
                to={`/projects/${project._id}`}
                className="w-full text-center py-2 text-sm font-semibold text-indigo-600 border-t border-slate-100 hover:text-indigo-800 transition-colors"
              >
                View project
              </Link>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <CreateProjectModal 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => {
            setIsModalOpen(false);
            fetchProjects();
          }} 
        />
      )}
    </div>
  );
};

const CreateProjectModal = ({ onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/projects', { name, description });
      onSuccess();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">Create New Project</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Project Name</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-colors shadow-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Platform Redesign"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea
              required
              rows="3"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-colors shadow-sm resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Full redesign of the core product..."
            ></textarea>
          </div>
          <div className="flex gap-3 justify-end pt-4 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-sm"
            >
              {submitting ? 'Creating...' : 'New Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectList;
