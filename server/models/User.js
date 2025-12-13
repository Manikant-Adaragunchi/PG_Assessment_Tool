const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    firebaseUid: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        enum: ['admin', 'student'],
        default: 'student'
    },
    profileData: {
        name: String,
        phoneNumber: String
    }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
