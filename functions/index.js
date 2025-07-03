// Firebase-compatible Express app for MoMo API
const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const accessToken = require("./routes/TokenGeneration.js");
const requestToPayRoutes = require("./routes/requesttopay.js");
const apiUserRoutes = require("./routes/apiuser.js");
const authRoutes = require("./routes/index.js");





const app = express();
const MONGO_URI = process.env.MONGO_URI;

app.use(
  cors({
    origin: "http://localhost:5173", // ✅ your Vite/React frontend
    credentials: true,
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

//database connection
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("mongodb is connected"))
  .catch((e) => console.log(e));

// Routes
app.use("/momo", accessToken);
app.use("/momo", requestToPayRoutes);
app.use("/momo", apiUserRoutes);
app.use("/auth", authRoutes);


// Global error handler
app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong",
  });
});

// Export Express app as Firebase Function
exports.api = functions.https.onRequest(app);

// For local testing, ensure Firebase emulator is started with --host 0.0.0.0
// Example: firebase emulators:start --only functions --host 0.0.0.0
