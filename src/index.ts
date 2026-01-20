import express from 'express';
import cors from 'cors';
import { config } from './config';
import { connectDB } from './config/database';
import notesRoutes from './routes/notes';

const app = express();

// Middleware
app.use(cors({
  origin: config.cors.origin === '*' ? true : config.cors.origin.split(','),
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Notu API is running', version: '1.0.0' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

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
