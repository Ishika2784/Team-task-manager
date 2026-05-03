const Task = require('../models/Task');
const Activity = require('../models/Activity');
const Project = require('../models/Project');
const Notification = require('../models/Notification');

const getTasks = async (req, res) => {
  try {
    const { status, priority, project, search, assignee, page = 1, limit = 50 } = req.query;

    let query = {};

    if (req.user.role !== 'Admin') {
      const userProjects = await Project.find({ members: req.user._id }).select('_id');
      const projectIds = userProjects.map(p => p._id);
      query.project = { $in: projectIds };
    }

    if (status) query.status = { $in: status.split(',') }; // Support multiple
    if (priority) query.priority = { $in: priority.split(',') };
    if (assignee) query.assignee = { $in: assignee.split(',') };
    if (project) query.project = project;
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const tasks = await Task.find(query)
      .populate('project', 'name')
      .populate('assignee', 'name email')
      .sort({ dueDate: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Task.countDocuments(query);

    res.json({
      success: true,
      message: 'Tasks fetched',
      data: {
        tasks,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, project, assignee } = req.body;

    const task = new Task({
      title,
      description,
      status: status || 'Pending',
      priority: priority || 'Medium',
      dueDate,
      project,
      assignee,
      createdBy: req.user._id,
    });

    const createdTask = await task.save();

    await Activity.create({
      action: 'Task Created',
      details: `${req.user.name} created task "${title}"`,
      user: req.user._id,
      project: project,
      task: createdTask._id,
    });

    // Notify assignee
    if (assignee) {
      await Notification.create({
        user: assignee,
        message: `You have been assigned to a new task: ${title}`,
        type: 'assignment',
        link: `/projects/${project}`
      });
    }

    res.status(201).json({ success: true, message: 'Task created', data: createdTask });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (req.user.role !== 'Admin') {
      if (task.assignee && task.assignee.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized to update this task' });
      }
      if (req.body.title || req.body.priority || req.body.dueDate) {
        return res.status(403).json({ success: false, message: 'Members can only update task status' });
      }
    }

    const updates = [];
    const fieldsToTrack = ['status', 'priority', 'assignee', 'title'];

    fieldsToTrack.forEach(field => {
      if (req.body[field] !== undefined && req.body[field] !== task[field]?.toString()) {
        updates.push({
          field,
          oldValue: task[field]?.toString() || 'Unassigned',
          newValue: req.body[field]?.toString() || 'Unassigned'
        });
      }
    });

    const oldAssignee = task.assignee;
    const { title, description, status, priority, dueDate, assignee } = req.body;

    task.title = title || task.title;
    task.description = description || task.description;
    task.status = status || task.status;
    task.priority = priority || task.priority;
    task.dueDate = dueDate || task.dueDate;
    if (req.user.role === 'Admin' && assignee !== undefined) {
      task.assignee = assignee;
    }

    const updatedTask = await task.save();

    if (updates.length > 0) {
      await Activity.create({
        action: 'Task Updated',
        details: `${req.user.name} updated task "${task.title}"`,
        updates,
        user: req.user._id,
        project: task.project,
        task: updatedTask._id,
      });
    }

    // Notify new assignee if changed
    if (assignee && oldAssignee?.toString() !== assignee.toString()) {
      await Notification.create({
        user: assignee,
        message: `You have been assigned to task: ${task.title}`,
        type: 'assignment',
        link: `/projects/${task.project}`
      });
    }

    res.json({ success: true, message: 'Task updated', data: updatedTask });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    await task.deleteOne();

    await Activity.create({
      action: 'Task Deleted',
      details: `${req.user.name} deleted task "${task.title}"`,
      user: req.user._id,
      project: task.project,
    });

    res.json({ success: true, message: 'Task removed', data: null });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTaskStats = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'Admin') {
      const userProjects = await Project.find({ members: req.user._id }).select('_id');
      const projectIds = userProjects.map(p => p._id);
      query.project = { $in: projectIds };
    }

    const tasks = await Task.find(query).populate('project', 'name');
    
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'Completed').length;
    const pendingTasks = tasks.filter(t => t.status === 'Pending').length;
    const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
    
    const today = new Date();
    
    // Detailed overdue list
    const overdueTasksList = tasks
      .filter(t => new Date(t.dueDate) < today && t.status !== 'Completed')
      .map(t => ({
        _id: t._id,
        title: t.title,
        projectName: t.project ? t.project.name : 'Unknown Project',
        dueDate: t.dueDate
      }))
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5); // Limit to top 5

    const overdueTasks = overdueTasksList.length;

    // Project Progress Calculation
    const projectMap = {};
    tasks.forEach(t => {
      if (!t.project) return;
      const pId = t.project._id.toString();
      if (!projectMap[pId]) {
        projectMap[pId] = {
          _id: pId,
          name: t.project.name,
          total: 0,
          completed: 0,
          inProgress: 0,
          toDo: 0
        };
      }
      projectMap[pId].total++;
      if (t.status === 'Completed') projectMap[pId].completed++;
      if (t.status === 'In Progress') projectMap[pId].inProgress++;
      if (t.status === 'Pending') projectMap[pId].toDo++;
    });

    const projectProgress = Object.values(projectMap).map(p => ({
      ...p,
      progressPercentage: p.total > 0 ? Math.round((p.completed / p.total) * 100) : 0
    }));

    const priorityData = [
      { name: 'High', count: tasks.filter(t => t.priority === 'High').length },
      { name: 'Medium', count: tasks.filter(t => t.priority === 'Medium').length },
      { name: 'Low', count: tasks.filter(t => t.priority === 'Low').length },
    ];

    res.json({
      success: true,
      data: {
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks,
        overdueTasks,
        overdueTasksList,
        projectProgress,
        priorityData
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats,
};
