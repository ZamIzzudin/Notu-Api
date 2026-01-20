import express from 'express';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import { config } from './src/config';
import { connectDB } from './src/config/database';
import notesRoutes from './src/routes/notes';
import authRoutes from './src/routes/auth';

const app = express();

// Middleware
app.use(cors({
  origin: config.cors.origin === '*' ? true : config.cors.origin.split(','),
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(fileUpload({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  uploadTimeout: 60000,
}));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Notu API is running', version: '1.0.0' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);

// Connect to MongoDB and start server
connectDB().then(() => {
  if (config.server.nodeEnv !== 'production') {
    app.listen(config.server.port, () => {
      console.log(`Server running on port ${config.server.port}`);
    });
  }
});

export default app;
