const mongoose = require('mongoose')

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('mongoDB connected');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        process.exit(1); // stop the app if DB fails — no point running without data access
    }
};
module.exports = connectDB;
