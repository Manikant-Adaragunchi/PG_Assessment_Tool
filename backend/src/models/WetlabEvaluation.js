const mongoose = require('mongoose');

const WetlabEvaluationSchema = new mongoose.Schema({
    internId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    moduleCode: {
        type: String,
        required: true,
        default: 'WETLAB'
    },
    topicName: { // Mapped to 'Activity Name' in items
        type: String,
        required: true
    },
    scores: [{
        type: Number,
        min: 0,
        max: 5
    }], // Array of numbers corresponding to items

    totalScore: Number,
    grade: String,
    remarksOverall: String,

    facultyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    status: {
        type: String,
        enum: ['TEMPORARY', 'PENDING_ACK', 'ACKNOWLEDGED'],
        default: 'TEMPORARY'
    },

    acknowledgedBy: {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        fullName: String
    },
    acknowledgedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('WetlabEvaluation', WetlabEvaluationSchema);
