import express  from "express"
// import cors from 'cors'
// import { connectDB } from "./config/db.js"

import 'dotenv/config'

// app config
const app = express()
const port = process.env.PORT || 5010;


// middlewares
app.use(express.json())
const whitelist = ['http://localhost:5173', 'http://localhost:5174'];




// Add preflight options for all routes




// db connection
// connectDB()

// api endpoints


app.get("/", (req, res) => {
    res.send("API Working")
  });
  app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: err.message
    });
});
app.use((req, res) => {
  res.status(404).json({
      success: false,
      message: 'Route not found'
  });
});
app.listen(port, () => console.log(`Server started on http://localhost:${port}`))