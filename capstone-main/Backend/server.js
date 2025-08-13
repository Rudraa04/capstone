import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors'; //security feature
import "./lib/firebaseAdmin.js";
import productRoutes from './routes/productRoutes.js';  // Handles all product-related APIs
import squareRestRoutes from "./routes/squareRestRoutes.js"; // Import squareRestRoutes
import reportRoute from './routes/reportRoute.js';
import ordersRouter from "./routes/orderRoutes.js";
import supportticketRoutes from "./routes/supportticketroute.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import lowStockRoutes from "./routes/lowStockRoutes.js";


// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();


app.use(cors()); // Allow requests from different origins (frontend/backend communication) 
app.use(express.json()); // Allow Express to parse JSON bodies in requests

// API Routes (all product APIs will be prefixed with /api/products)
app.use("/", productRoutes);
app.use('/api/reports', reportRoute); //route for reports
app.use("/api", ordersRouter); 
app.use("/api/supporttickets", supportticketRoutes); //route for support ticket
app.use("/api/inventory", lowStockRoutes);
app.use("/api/inventory", inventoryRoutes);

// to fetch mongo string from env
const MONGO_URI = process.env.MONGO_URI;

app.use("/api/square", squareRestRoutes); // Square REST API routes //connection

if (!MONGO_URI) {
  console.error("Missing MONGO_URI in .env file");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI, { //connect to mongo using mongodb
    useNewUrlParser: true,  // Use new URL string parser
    useUnifiedTopology: true, //  uses the modern connection engine to manage MongoDB connections more efficiently.
  })
  .then(() => {
    console.log('MongoDB connected successfully');
    //server starts after mongodb connection
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  });
