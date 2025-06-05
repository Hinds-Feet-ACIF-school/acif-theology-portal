import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import router from "./routes/router.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Define allowed origins for CORS
const allowedOrigins = [
    'http://localhost:5173',
    'https://acif-theology-portal.vercel.app'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.error(`CORS blocked for origin: ${origin}`);
      callback(new Error(`CORS policy does not allow access from origin ${origin}`), false);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// Apply middleware
app.use(cors(corsOptions));
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount the main router at '/api'
app.use("/api", router);

// Default route for the root path
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Apostolic LMS API" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  if (err.message.includes('CORS policy does not allow access')) {
     console.error('CORS Error:', err.message);
     return res.status(403).json({ message: "CORS Error: Access denied." });
  }

  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;