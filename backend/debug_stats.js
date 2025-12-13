const mongoose = require('mongoose');
const User = require('./src/models/User');
const Batch = require('./src/models/Batch');
require('dotenv').config();

const debugStats = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        // 1. Check distinct roles
        const roles = await User.distinct('role');
        console.log('Distinct Roles in DB:', roles);

        // 2. Count by role
        for (const r of roles) {
            const count = await User.countDocuments({ role: r });
            console.log(`Role [${r}]: ${count}`);
        }

        // 3. Batches
        const batchCount = await Batch.countDocuments();
        const batches = await Batch.find({}, 'name _id');
        console.log('Batch Count:', batchCount);
        console.log('Batches:', batches);

        // 4. Check for Orphans
        const interns = await User.find({ role: 'INTERN' }, 'fullName email batchId');
        console.log('Total Interns Found:', interns.length);

        interns.forEach(i => {
            console.log(`- ${i.email} | BatchId: ${i.batchId}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

debugStats();
