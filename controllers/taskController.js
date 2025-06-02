// controllers/taskController.js

const Task = require('../models/Task');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// @desc Get list of assignees by unit
exports.getAssigneesByUnit = async (req, res) => {
  const { unit } = req.params;

  try {
    let users = [];

    if (unit === 'City Office') {
      users = await User.find({ firstName: 'Suresh' });
    } else {
      users = await User.find({ unit }).sort({ firstName: 1 });
    }

    const result = users.map(u => ({
      id: u._id,
      name: `${u.firstName} ${u.lastName}`,
      email: u.email
    }));

    res.json(result);
  } catch (err) {
    console.error('Error fetching assignees:', err);
    res.status(500).json({ message: 'Failed to fetch assignees' });
  }
};

// @desc Create new task
exports.createTask = async (req, res) => {
  const { assignTo, description } = req.body;

  if (!assignTo || !description) {
    return res.status(400).json({ message: 'Assign To and Description are required' });
  }

  try {
    const assignee = await User.findById(assignTo);
    if (!assignee) {
      return res.status(404).json({ message: 'Assigned user not found' });
    }

    const task = await Task.create({
      assignTo,
      assignedBy: req.user._id,       // ✅ correct field name
      description,
      unit: assignee.unit             // ✅ required by schema
    });

    await sendEmail(
      assignee.email,
      'New Task Assigned',
      `A new task has been assigned to you: "${description}".`
    );

    res.status(201).json(task);
  } catch (err) {
    console.error('Task creation error:', err);
    res.status(500).json({ message: 'Task creation failed', error: err.message });
  }
};

// @desc Get tasks assigned to current user
exports.getAssignedToMe = async (req, res) => {
  try {
    const tasks = await Task.find({ assignTo: req.user._id }).populate('assignedBy', 'firstName lastName');
    res.json(tasks);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
};

// @desc Get tasks raised by current user
exports.getRaisedByMe = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedBy: req.user._id }).populate('assignTo', 'firstName lastName');
    res.json(tasks);
  } catch (err) {
    console.error('Error fetching raised tasks:', err);
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
};

// @desc Update task status
exports.updateTaskStatus = async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  try {
    const task = await Task.findById(id).populate('assignedBy', 'email');

    if (!task) return res.status(404).json({ message: 'Task not found' });

    task.status = status;
    await task.save();

    await sendEmail(
      task.assignedBy.email,
      'Task Status Updated',
      `The status of your task "${task.description}" has been updated to "${status}".`
    );

    res.json({ message: 'Task updated' });
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ message: 'Failed to update task' });
  }
};
