const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  assignTo:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description:{ type: String, maxlength: 100, required: true },
  unit:       { type: String, required: true },
  status:     { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
  createdAt:  { type: Date, default: Date.now }
});

module.exports = mongoose.model('Task', taskSchema);