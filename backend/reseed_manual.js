const mongoose = require('mongoose');
const User = require('./src/models/User');
const Batch = require('./src/models/Batch');
require('dotenv').config();

const reseed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB.');

        // Clear All
        await User.deleteMany({});
        await Batch.deleteMany({});
        console.log('Cleared Users and Batches.');

        // Create Users
        const users = [
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
                fullName: 'Nita Kulkarni',
                email: 'nita@hospital.com',
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
        ];

        for (const u of users) {
            await User.create(u);
            console.log(`Created: ${u.fullName} (${u.role})`);
        }

        console.log('Reseed Complete.');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

reseed();
