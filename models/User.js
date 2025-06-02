const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName:  { type: String, required: true },
  email:     { type: String, required: true, unique: true },
  password:  { type: String, required: true },
  mobile:    { type: String, required: true },
  unit:      { type: String, required: true },
  role:      { type: String, enum: ['user', 'principal', 'suresh'], default: 'user' },
  lastLogin: { type: Date }
});

module.exports = mongoose.model('User', userSchema);
