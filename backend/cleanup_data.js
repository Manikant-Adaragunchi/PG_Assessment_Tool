const mongoose = require('mongoose');
const User = require('./src/models/User');
const Batch = require('./src/models/Batch');
require('dotenv').config();

const cleanup = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        // 1. Delete Orphan Interns
        const result = await User.deleteMany({ role: 'INTERN', batchId: { $exists: false } });
        console.log(`Deleted ${result.deletedCount} orphan interns (no batchId field).`);

        const result2 = await User.deleteMany({ role: 'INTERN', batchId: null });
        console.log(`Deleted ${result2.deletedCount} orphan interns (null batchId).`);

        // 2. Check Faculty Count again
        const facultyCount = await User.countDocuments({ role: 'FACULTY' });
        console.log('Faculty Count after cleanup:', facultyCount);

        // 3. List all users
        const users = await User.find({}, 'fullName role');
        console.log('All Users:', users.map(u => `${u.fullName} (${u.role})`));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

cleanup();
