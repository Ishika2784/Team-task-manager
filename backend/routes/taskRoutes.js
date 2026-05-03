const express = require('express');
const router = express.Router();
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats
} = require('../controllers/taskController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getTasks)
  .post(protect, admin, createTask);

router.route('/stats').get(protect, getTaskStats);

router.route('/:id')
  .put(protect, updateTask) // Members can update status
  .delete(protect, admin, deleteTask);

module.exports = router;
