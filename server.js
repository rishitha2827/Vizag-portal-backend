const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const cors = require('cors');
const cron = require('node-cron');
const Task = require('./models/Task');
const User = require('./models/User');
const sendEmail = require('./utils/sendEmail');

dotenv.config();
connectDB();

const app = express();
const allowedOrigins = [
  'https://vizag-portal-frontend.vercel.app',
  'http://localhost:3000' // Optional for local development
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

app.get('/', (req, res) => res.send('Vizag Portal API running'));

// Cron job to notify tasks older than 3 days
cron.schedule('0 8 * * *', async () => {
  try {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const tasks = await Task.find({ 
      createdAt: { $lte: threeDaysAgo }, 
      status: { $in: ['Pending', 'Yet to Start'] }
    })
    .populate('assignedBy assignTo', 'email firstName lastName');

    for (let task of tasks) {
      if (task.assignTo) {
        await sendEmail(
          task.assignTo.email,
          'Reminder: Task Pending',
          `You have a pending task: "${task.description}", assigned on ${task.createdAt.toDateString()}.`
        );
      }
      if (task.assignedBy) {
        await sendEmail(
          task.assignedBy.email,
          'Reminder: Task Still Pending',
          `Your assigned task: "${task.description}" is still pending with ${task.assignTo?.firstName || 'the assignee'}.`
        );
      }
    }
    console.log(`Sent reminders for ${tasks.length} pending tasks`);
  } catch (error) {
    console.error('Error in cron job:', error);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
