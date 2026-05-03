import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Filter, Clock, CheckCircle2, AlertCircle, LayoutList, Columns3, ChevronLeft, ChevronRight, Activity, Calendar } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const ProjectDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'board'
  
  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const fetchProject = async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTasks = async () => {
    try {
      const limit = viewMode === 'board' ? 200 : 20;
      
      const res = await api.get(`/tasks`, {
        params: { 
          project: id, 
          search, 
          status: statusFilter, 
          priority: priorityFilter,
          assignee: assigneeFilter,
          page,
          limit
        }
      });
      setTasks(res.data.data.tasks);
      setTotalPages(res.data.data.pages);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line
  }, [id, search, statusFilter, priorityFilter, assigneeFilter, page, viewMode]);

  const updateTaskStatusOptimistically = async (taskId, newStatus) => {
    const originalTasks = [...tasks];
    setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
    } catch (error) {
      console.error(error);
      alert('Failed to update task. Reverting...');
      setTasks(originalTasks);
    }
  };

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    updateTaskStatusOptimistically(draggableId, destination.droppableId);
  };

  if (loading && !project) return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
    </div>
  );
  
  if (!project) return <div className="p-8 text-center text-red-500 font-medium">Project not found</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">{project.name}</h1>
          <p className="text-slate-500 mt-1 text-sm">{project.description}</p>
        </div>
        
        {/* View Toggles */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button 
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <LayoutList size={16} /> List
          </button>
          <button 
            onClick={() => { setViewMode('board'); setPage(1); }}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 text-sm font-medium transition-all ${viewMode === 'board' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <Columns3 size={16} /> Board
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row justify-between gap-4">
        <div className="flex flex-wrap gap-3 flex-1">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              className="w-full sm:w-64 pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none shadow-sm transition-colors text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select 
            className="px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none shadow-sm text-sm text-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          <select 
            className="px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none shadow-sm text-sm text-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          <select 
            className="px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none shadow-sm text-sm text-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 max-w-[150px]"
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
          >
            <option value="">All Assignees</option>
            {project.members.map(m => (
              <option key={m._id} value={m._id}>{m.name}</option>
            ))}
          </select>
        </div>
        
        {user.role === 'Admin' && (
          <button 
            onClick={() => { setEditingTask(null); setIsTaskModalOpen(true); }}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 shadow-sm transition-colors whitespace-nowrap"
          >
            <Plus size={16} />
            New Task
          </button>
        )}
      </div>

      {viewMode === 'list' ? (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                  <th className="p-4 pl-6">Task</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Due Date</th>
                  <th className="p-4">Assignee</th>
                  <th className="p-4 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tasks.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-500 text-sm">No tasks found.</td>
                  </tr>
                ) : (
                  tasks.map(task => {
                    const dueDate = new Date(task.dueDate);
                    const isOverdue = isPast(dueDate) && !isToday(dueDate) && task.status !== 'Completed';

                    return (
                      <tr key={task._id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 pl-6">
                          <div className="font-medium text-slate-900">{task.title}</div>
                          <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">{task.description}</div>
                        </td>
                        <td className="p-4">
                          <select 
                            value={task.status}
                            onChange={(e) => updateTaskStatusOptimistically(task._id, e.target.value)}
                            disabled={user.role !== 'Admin' && task.assignee?._id !== user._id}
                            className={`px-2.5 py-1 rounded-md text-xs font-medium border outline-none appearance-none cursor-pointer ${
                              task.status === 'Completed' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                              task.status === 'In Progress' ? "bg-blue-50 text-blue-700 border-blue-200" :
                              "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            task.priority === 'High' ? "bg-red-50 text-red-700 border border-red-100" :
                            task.priority === 'Medium' ? "bg-orange-50 text-orange-700 border border-orange-100" :
                            "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className={`text-xs flex items-center gap-1 ${isOverdue ? "text-red-600 font-medium" : "text-slate-500"}`}>
                            {isOverdue && <AlertCircle size={14} />}
                            {format(dueDate, 'MMM d, yyyy')}
                          </div>
                        </td>
                        <td className="p-4 text-xs font-medium text-slate-600">
                          {task.assignee ? task.assignee.name : <span className="text-slate-400 italic">Unassigned</span>}
                        </td>
                        <td className="p-4 text-right pr-6">
                          <button
                            onClick={() => { setEditingTask(task); setIsTaskModalOpen(true); }}
                            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 bg-white border border-slate-300 rounded text-sm font-medium hover:bg-slate-50 disabled:opacity-50 transition-colors shadow-sm"
              >
                Previous
              </button>
              <span className="text-sm text-slate-500">
                Page {page} of {totalPages}
              </span>
              <button 
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 bg-white border border-slate-300 rounded text-sm font-medium hover:bg-slate-50 disabled:opacity-50 transition-colors shadow-sm"
              >
                Next
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Kanban Board View */
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start h-full">
            {['Pending', 'In Progress', 'Completed'].map((status) => {
              const columnTasks = tasks.filter(t => t.status === status);
              
              const headerColors = {
                'Pending': 'border-amber-200 bg-amber-50 text-amber-700',
                'In Progress': 'border-blue-200 bg-blue-50 text-blue-700',
                'Completed': 'border-emerald-200 bg-emerald-50 text-emerald-700'
              };

              return (
                <Droppable key={status} droppableId={status}>
                  {(provided, snapshot) => (
                    <div 
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`bg-slate-50/50 rounded-xl border border-slate-200 flex flex-col max-h-[80vh] transition-colors duration-200 ${snapshot.isDraggingOver ? 'bg-indigo-50/50 border-indigo-200' : ''}`}
                    >
                      <div className={`px-4 py-3 border-b rounded-t-xl flex justify-between items-center ${headerColors[status]}`}>
                        <h3 className="font-semibold text-sm flex items-center gap-1.5">
                          {status === 'Pending' && <Clock size={16} />}
                          {status === 'In Progress' && <Activity size={16} />}
                          {status === 'Completed' && <CheckCircle2 size={16} />}
                          {status}
                        </h3>
                        <span className="bg-white text-xs font-semibold px-2 py-0.5 rounded text-slate-600 shadow-sm border border-slate-200">
                          {columnTasks.length}
                        </span>
                      </div>

                      <div className="p-3 space-y-3 overflow-y-auto min-h-[300px]">
                        {columnTasks.map((task, index) => {
                          const dueDate = new Date(task.dueDate);
                          const isOverdue = isPast(dueDate) && !isToday(dueDate) && task.status !== 'Completed';

                          return (
                            <Draggable 
                              key={task._id} 
                              draggableId={task._id} 
                              index={index}
                              isDragDisabled={user.role !== 'Admin' && task.assignee?._id !== user._id}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`bg-white p-4 rounded-lg border transition-all duration-200 ${snapshot.isDragging ? 'shadow-lg border-indigo-400 rotate-1' : 'shadow-sm border-slate-200 hover:border-slate-300 hover:shadow'}`}
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${
                                      task.priority === 'High' ? 'bg-red-50 text-red-600' : 
                                      task.priority === 'Medium' ? 'bg-orange-50 text-orange-600' : 
                                      'bg-slate-100 text-slate-600'
                                    }`}>
                                      {task.priority}
                                    </span>
                                    <button 
                                      onClick={() => { setEditingTask(task); setIsTaskModalOpen(true); }}
                                      className="text-slate-400 hover:text-indigo-600"
                                    >
                                      <LayoutList size={14} />
                                    </button>
                                  </div>
                                  <h4 className="font-medium text-sm text-slate-900 mb-1 leading-snug">{task.title}</h4>
                                  
                                  <div className="flex items-center justify-between mt-3">
                                    <div className="text-[11px] font-medium text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                                      {task.assignee ? task.assignee.name.split(' ')[0] : 'Unassigned'}
                                    </div>
                                    <div className={`text-[11px] flex items-center gap-1 ${isOverdue ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
                                      <Calendar size={12} />
                                      {format(dueDate, 'MMM d')}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          )
                        })}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              );
            })}
          </div>
        </DragDropContext>
      )}

      {isTaskModalOpen && (
        <TaskModal 
          task={editingTask} 
          projectId={id}
          members={project.members}
          onClose={() => setIsTaskModalOpen(false)}
          onSuccess={() => {
            setIsTaskModalOpen(false);
            fetchTasks();
          }}
        />
      )}
    </div>
  );
};

const TaskModal = ({ task, projectId, members, onClose, onSuccess }) => {
  const { user } = useAuth();
  const isEditing = !!task;
  const isAdmin = user.role === 'Admin';
  const isMemberEditing = isEditing && !isAdmin;

  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'Pending',
    priority: task?.priority || 'Medium',
    dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
    assignee: task?.assignee?._id || '',
  });

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...formData, project: projectId };
      if (!payload.assignee) delete payload.assignee; 

      if (isEditing) {
        const updatePayload = isMemberEditing ? { status: formData.status } : payload;
        await api.put(`/tasks/${task._id}`, updatePayload);
      } else {
        await api.post('/tasks', payload);
      }
      onSuccess();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to save task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-semibold text-slate-900">{isEditing ? 'Edit Task' : 'Create New Task'}</h2>
          {isMemberEditing && <p className="text-xs text-amber-600 mt-1">You can only update the status of your assigned task.</p>}
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Task Title</label>
            <input
              type="text"
              required
              disabled={isMemberEditing}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-colors shadow-sm disabled:bg-slate-50 disabled:text-slate-500"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea
              required
              rows="3"
              disabled={isMemberEditing}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-colors shadow-sm resize-none disabled:bg-slate-50 disabled:text-slate-500"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            ></textarea>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
              <select
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-colors shadow-sm"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Priority</label>
              <select
                disabled={isMemberEditing}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-colors shadow-sm disabled:bg-slate-50 disabled:text-slate-500"
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Due Date</label>
              <input
                type="date"
                required
                disabled={isMemberEditing}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-colors shadow-sm disabled:bg-slate-50 disabled:text-slate-500"
                value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Assignee</label>
              <select
                disabled={isMemberEditing}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-colors shadow-sm disabled:bg-slate-50 disabled:text-slate-500"
                value={formData.assignee}
                onChange={(e) => setFormData({...formData, assignee: e.target.value})}
              >
                <option value="">Unassigned</option>
                {members.map(member => (
                  <option key={member._id} value={member._id}>{member.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-5 mt-2">
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
              {submitting ? 'Saving...' : 'Save Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectDetails;
