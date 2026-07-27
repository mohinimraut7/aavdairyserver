require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const animalRoutes = require("./routes/animalRoutes");
const breedingRoutes = require("./routes/breedingRoutes");
const calfRoutes = require("./routes/calfRoutes");
const medicalRoutes = require("./routes/medicalRoutes");
const vaccinationRoutes = require("./routes/vaccinationRoutes");
const milkRoutes = require("./routes/milkRoutes");
const feedRoutes = require("./routes/feedRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const masterDataRoutes = require("./routes/masterDataRoutes");

connectDB();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "10mb" })); // 10mb to allow base64 animal photos

app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "AVV Dairy Farm API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/animals", animalRoutes);
app.use("/api/breeding", breedingRoutes);
app.use("/api/calves", calfRoutes);
app.use("/api/medical", medicalRoutes);
app.use("/api/vaccinations", vaccinationRoutes);
app.use("/api/milk", milkRoutes);
app.use("/api/feed", feedRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api", masterDataRoutes); // /api/breeds, /api/diseases, /api/suppliers, /api/medicines

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Central error handler (catches anything thrown outside a controller's own try/catch)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Something went wrong on the server" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`AVV Dairy Farm API running on port ${PORT}`));
