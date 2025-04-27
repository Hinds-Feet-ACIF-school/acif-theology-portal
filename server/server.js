// server.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import cookieParser from 'cookie-parser'; // Import cookie-parser
import router from "./routes/router.js";
import 'dotenv/config';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = ['http://localhost:5173'];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      const msg = `CORS policy does not allow access from origin ${origin}`;
      callback(new Error(msg), false);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// --- Middleware Order ---
app.use(cors(corsOptions)); // CORS first
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Use cookie-parser AFTER CORS, BEFORE routes

// --- Routes ---
app.use("/api", router);

// --- Root & Error Handling ---
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Apostolic LMS API" });
});

app.use((err, req, res, next) => {
  if (err.message.includes('CORS policy does not allow access')) { // More robust check
     console.error('CORS Error:', err.message);
     return res.status(403).json({ message: "CORS Error: Access denied." });
  }

  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

// --- Start Server ---
// Keeping the conditional listen based on your setup
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
} else {
  // In production, you might export app and let another script handle listen
  // or just listen directly depending on your deployment strategy.
  // For now, let's assume direct listen for production too if needed.
   app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app; // Exporting app is good practice