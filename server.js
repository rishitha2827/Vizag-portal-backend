// server.js

const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const { protect } = require('./middleware/authMiddleware'); // destructure protect
const cors = require('cors');
const cron = require('node-cron');
const Task = require('./models/Task');
const sendEmail = require('./utils/sendEmail');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/tasks', protect, taskRoutes); // use protect middleware here

app.get('/', (req, res) => res.send('Vizag Portal API running'));

// Cron job to notify tasks older than 3 days
cron.schedule('0 8 * * *', async () => {
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  const tasks = await Task.find({ createdAt: { $lte: threeDaysAgo }, status: 'Yet to Start' })
    .populate('assignTo assignBy', 'email firstName lastName');

  for (let task of tasks) {
    await sendEmail(
      task.assignTo.email,
      'Reminder: Task Pending',
      `You have a pending task: "${task.description}", assigned on ${task.createdAt.toDateString()}.`
    );
    await sendEmail(
      task.assignBy.email,
      'Reminder: Task Still Pending',
      `Your assigned task: "${task.description}" is still not started by ${task.assignTo.firstName}.`
    );
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
