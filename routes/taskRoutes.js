const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createTask,
  getAssignedToMe,
  getRaisedByMe,
  updateTaskStatus,
  getAssigneesByUnit
} = require('../controllers/taskController');

router.get('/assignees/:unit', protect, getAssigneesByUnit);
router.post('/', protect, createTask);
router.get('/assigned-to-me', protect, getAssignedToMe);
router.get('/raised-by-me', protect, getRaisedByMe);
router.patch('/:id/status', protect, updateTaskStatus);

module.exports = router;