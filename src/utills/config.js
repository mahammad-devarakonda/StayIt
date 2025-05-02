const mongoose = require('mongoose')
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DB_CONNECTION_STRING,{
            ssl: true
        })

        console.log("✅ MongoDB Connection Established...");
    } catch (err) {
        console.error('Connection error:', err.message);
    }
}


module.exports = connectDB