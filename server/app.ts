import express from 'express';
import cors from 'cors';
import emailRoutes from './routes/emailRoutes';

const app = express();
const PORT = process.env.PORT || 3001;

// --- CORRECTED CORS CONFIGURATION ---
// We create a list of trusted websites. This allows both your live
// Vercel app and your local development environment to make requests.
const allowedOrigins = [
  'https://bulky-bay.vercel.app', // Your Vercel frontend URL (NO TRAILING SLASH)
  'http://localhost:5173'         // Your local development URL
];

const corsOptions = {
  origin: function (origin, callback) {
    // The 'origin' is the website making the request (e.g., https://bulky-bay.vercel.app)
    // We check if the incoming origin is in our list of trusted websites.
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      // If it is, allow the request.
      callback(null, true);
    } else {
      // If it's not, block the request.
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

// Middleware
app.use(cors(corsOptions)); // Use the new, more robust options
app.use(express.json());

// Routes
app.use('/api', emailRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;