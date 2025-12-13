const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const User = require('./models/User');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to DB
connectDB();

const importData = async () => {
    try {
        // Drop collection to clear old indexes (fixes E11000 duplicate key error on nulls)
        try {
            await User.collection.drop();
        } catch (e) {
            // Ignore if collection doesn't exist
            if (e.code !== 26) {
                console.log('Error dropping collection:', e.message);
            }
        }

        const createdUsers = await User.create([
            {
                fullName: 'Admin User',
                email: 'admin@hospital.com',
                password: 'admin123',
                role: 'HOD',
                isActive: true
            },
            {
                fullName: 'Faculty Member',
                email: 'faculty@hospital.com',
                password: 'password123',
                role: 'FACULTY',
                isActive: true
            },
            {
                fullName: 'Dr. Intern',
                email: 'intern@hospital.com',
                password: 'password123',
                role: 'INTERN',
                regNo: 'PG-2023-001',
                isActive: true
            }
        ]);

        console.log('Data Imported!'.green.inverse);
        process.exit();
    } catch (err) {
        console.error(`${err}`.red.inverse);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await User.deleteMany();

        console.log('Data Destroyed!'.red.inverse);
        process.exit();
    } catch (err) {
        console.error(`${err}`.red.inverse);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
