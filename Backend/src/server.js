require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`FitVision backend is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server startup aborted because MongoDB could not connect.');
    process.exit(1);
  }
};

startServer();
