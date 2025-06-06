const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  mobile: { type: String, required: true },
  unit: { type: String, required: true, enum: ['VIIT', 'VIEW', 'VIPT', 'WoS', 'VSCPS', 'City Office', 'NA'] },
  role: { type: String, default: 'user' },
  lastLogin: { type: Date }
});

module.exports = mongoose.model('User', userSchema);