const Project = require('../models/Project');
const Activity = require('../models/Activity');
const Task = require('../models/Task');

const getProjects = async (req, res) => {
  try {
    let projects;
    if (req.user.role === 'Admin') {
      projects = await Project.find({}).populate('members', 'name email').lean();
    } else {
      projects = await Project.find({ members: req.user._id }).populate('members', 'name email').lean();
    }

    // Get task counts for progress bars
    const projectIds = projects.map(p => p._id);
    const taskStats = await Task.aggregate([
      { $match: { project: { $in: projectIds } } },
      { $group: {
          _id: "$project",
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] } }
      }}
    ]);

    const statsMap = {};
    taskStats.forEach(stat => {
      statsMap[stat._id.toString()] = stat;
    });

    const enrichedProjects = projects.map(p => {
      const stats = statsMap[p._id.toString()] || { total: 0, completed: 0 };
      return {
        ...p,
        totalTasks: stats.total,
        completedTasks: stats.completed,
        progressPercentage: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
      };
    });

    res.json({ success: true, message: 'Projects fetched', data: enrichedProjects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('members', 'name email');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (req.user.role !== 'Admin' && !project.members.some(member => member._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this project' });
    }

    res.json({ success: true, message: 'Project fetched', data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createProject = async (req, res) => {
  try {
    const { name, description, members } = req.body;

    let projectMembers = members || [];
    if (!projectMembers.includes(req.user._id.toString())) {
      projectMembers.push(req.user._id);
    }

    const project = new Project({
      name,
      description,
      members: projectMembers,
      createdBy: req.user._id,
    });

    const createdProject = await project.save();

    await Activity.create({
      action: 'Project Created',
      details: `${req.user.name} created project "${name}"`,
      user: req.user._id,
      project: createdProject._id,
    });

    res.status(201).json({ success: true, message: 'Project created', data: createdProject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const { name, description, members } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    project.name = name || project.name;
    project.description = description || project.description;
    if (members) project.members = members;

    const updatedProject = await project.save();

    await Activity.create({
      action: 'Project Updated',
      details: `${req.user.name} updated project "${project.name}"`,
      user: req.user._id,
      project: updatedProject._id,
    });

    res.json({ success: true, message: 'Project updated', data: updatedProject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    await project.deleteOne();
    
    res.json({ success: true, message: 'Project removed', data: null });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Phase 3: Project Insights
const getProjectInsights = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check access
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    if (req.user.role !== 'Admin' && !project.members.some(member => member._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this project' });
    }

    const tasks = await Task.find({ project: id });
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

    // Overloaded user (most assigned pending/in progress tasks)
    const activeTasks = tasks.filter(t => t.status !== 'Completed' && t.assignee);
    const userTaskCount = {};
    activeTasks.forEach(t => {
      userTaskCount[t.assignee] = (userTaskCount[t.assignee] || 0) + 1;
    });
    
    let overloadedUserId = null;
    let maxTasks = 0;
    for (const [userId, count] of Object.entries(userTaskCount)) {
      if (count > maxTasks) {
        maxTasks = count;
        overloadedUserId = userId;
      }
    }

    res.json({
      success: true,
      message: 'Insights fetched',
      data: {
        totalTasks: total,
        completedTasks: completed,
        completionRate,
        overloadedUserId,
        overloadedTaskCount: maxTasks
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectInsights,
};
