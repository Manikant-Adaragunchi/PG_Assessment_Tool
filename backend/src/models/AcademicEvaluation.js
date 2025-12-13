const mongoose = require('mongoose');

const AcademicEvaluationSchema = new mongoose.Schema({
    internId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    moduleCode: {
        type: String,
        required: true, // 'ACADEMIC_SEMINAR', 'ACADEMIC_JCR', 'ACADEMIC_CASE'
        enum: ['ACADEMIC_SEMINAR', 'ACADEMIC_JCR', 'ACADEMIC_CASE']
    },
    topicName: {
        type: String,
        required: true
    },
    scores: [{
        type: Number,
        min: 0,
        max: 5
    }], // Array of 5 numbers

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

module.exports = mongoose.model('AcademicEvaluation', AcademicEvaluationSchema);
