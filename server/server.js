import 'dotenv/config';
import app from './app.js';
import connectDB from './src/config/db.js';

const start = async () => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not configured');
  await connectDB();
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`Server running on port ${port}`));
};

start().catch((error) => {
  console.error(`Server startup failed: ${error.message}`);
  process.exit(1);
});
