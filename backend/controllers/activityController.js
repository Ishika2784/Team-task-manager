const Activity = require('../models/Activity');
const Project = require('../models/Project');

const getActivities = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    let query = {};

    if (req.user.role !== 'Admin') {
      const userProjects = await Project.find({ members: req.user._id }).select('_id');
      const projectIds = userProjects.map(p => p._id);
      query.project = { $in: projectIds };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const activities = await Activity.find(query)
      .populate('user', 'name')
      .populate('project', 'name')
      .populate('task', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Activity.countDocuments(query);

    res.json({
      success: true,
      message: 'Activities fetched',
      data: {
        activities,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getActivities,
};
