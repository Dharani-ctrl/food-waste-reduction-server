require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const connectDB = require('./config/db');
const User = require('./models/User');
const bcrypt = require('bcrypt');

// Connect to database
connectDB().then(async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin' });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin', salt);
      await User.create({
        name: 'Super Admin',
        email: 'admin',
        password: hashedPassword,
        role: 'admin',
      });
      console.log('Default Admin Account Created (email: admin, pass: admin)');
    }
  } catch (error) {
    console.error('Error seeding default admin:', error);
  }
});

const app = express();
const server = http.createServer(app);
const io = require('./utils/socket').init(server);
const { startCronJobs } = require('./utils/cron');

// Start background jobs
startCronJobs();

// Middleware 
const allowedOrigins = [
  "http://localhost:3000",
  "https://food-waste-reduction-client.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (
      origin.includes("vercel.app") ||
      origin === "http://localhost:3000"
    ) {
      return callback(null, true);
    }

    return callback(null, true); // safer for deployment (avoid blocking)
  },
  credentials: true
}));


app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/donor', require('./routes/donor'));
app.use('/api/ngo', require('./routes/ngo'));

// Basic route for testing
app.get('/', (req, res) => {
  res.send('ZeroWaste API is running...');
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
