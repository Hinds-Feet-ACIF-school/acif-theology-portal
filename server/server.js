import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import cookieParser from 'cookie-parser';
import router from "./routes/router.js";
import 'dotenv/config';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
    'http://localhost:5173',
    'https://acif-theology-portall.vercel.app' // Add your Vercel URL here
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      console.log(`CORS allowed for origin: ${origin}`);
      callback(null, true);
    } else {
      console.error(`CORS blocked for origin: ${origin}`);
      callback(new Error(`CORS policy does not allow access from origin ${origin}`), false);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api", router);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to Apostolic LMS API" });
});

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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;