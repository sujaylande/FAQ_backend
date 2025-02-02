const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require("./config/db.js");
const faqRoutes = require("./routes/faqRoutes.js");
const {connectRedis} = require("./config/redis.js");



dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();
connectRedis();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use("/api/faqs", faqRoutes);


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;