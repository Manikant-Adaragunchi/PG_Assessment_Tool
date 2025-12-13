const mongoose = require('mongoose');

const AcademicEvaluationSchema = new mongoose.Schema({
    internId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    attempts: [{
        attemptNumber: Number,
        date: { type: Date, default: Date.now },
        facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        topic: String,
        scores: {
            presentationQuality: Number,
            content: Number,
            qaHandling: Number,
            slidesQuality: Number,
            timing: Number
        },
        remarks: String,
        status: {
            type: String,
            enum: ['TEMPORARY', 'PENDING_ACK', 'ACKNOWLEDGED'],
            default: 'PENDING_ACK'
        }
    }]
}, { timestamps: true });

module.exports = mongoose.models.AcademicEvaluation || mongoose.model('AcademicEvaluation', AcademicEvaluationSchema);
