const mongoose = require('mongoose');
const User = require('./src/models/User');
const dotenv = require('dotenv');
dotenv.config();

const checkDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/pg-assessment');
        console.log('MongoDB Connected');

        const count = await User.countDocuments();
        console.log(`Total Users: ${count}`);

        const admin = await User.findOne({ email: 'admin@hospital.com' });
        if (admin) {
            console.log('Admin User Found:', admin.email);
            console.log('Admin Role:', admin.role);
        } else {
            console.log('Admin User NOT Found');
        }
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkDB();
