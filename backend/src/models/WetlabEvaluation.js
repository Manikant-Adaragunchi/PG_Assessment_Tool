const mongoose = require('mongoose');

const WetlabEvaluationSchema = new mongoose.Schema({
    internId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    attempts: [{
        attemptNumber: { type: Number, default: 1 },
        exerciseName: { type: String, required: true },
        date: { type: Date, default: Date.now },
        scores: {
            procedureSteps: Number,
            tissueHandling: Number,
            timeManagement: Number,
            outcome: Number
        },
        totalScore: Number,
        grade: String,
        remarks: String,
        facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: {
            type: String,
            enum: ['TEMPORARY', 'PENDING_ACK', 'ACKNOWLEDGED', 'PERMANENT', 'COMPLETED'],
            default: 'PENDING_ACK'
        },
        acknowledgedBy: {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            fullName: String
        },
        acknowledgedAt: { type: Date }
    }]
}, { timestamps: true });

module.exports = mongoose.models.WetlabEvaluation || mongoose.model('WetlabEvaluation', WetlabEvaluationSchema);
