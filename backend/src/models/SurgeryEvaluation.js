const mongoose = require('mongoose');

const AttemptSchema = new mongoose.Schema({
    attemptNumber: { type: Number, required: true },
    attemptDate: { type: Date, required: true },
    facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Surgery Specifics
    patientName: { type: String },
    surgeryName: { type: String },
    gradeOfCataract: { type: String },
    draping: { type: String },

    // Matrix of answers
    answers: [{
        itemKey: { type: String, required: true },
        scoreValue: { type: Number, min: 0, max: 5, required: true },
        remark: { type: String } // Required if score < 3 (enforced in controller logic)
    }],

    totalScore: { type: Number },
    grade: { type: String },
    remarksOverall: { type: String },

    status: {
        type: String,
        enum: ['TEMPORARY', 'PENDING_ACK', 'ACKNOWLEDGED', 'PERMANENT', 'COMPLETED'],
        required: true,
        default: 'TEMPORARY'
    },

    acknowledgedBy: {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        fullName: String
    },
    acknowledgedAt: { type: Date }
}, { timestamps: true });

const SurgeryEvaluationSchema = new mongoose.Schema({
    internId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    moduleCode: {
        type: String,
        required: true, // Should be "SURGERY"
        default: 'SURGERY'
    },
    attempts: [AttemptSchema]
}, { timestamps: true });

module.exports = mongoose.models.SurgeryEvaluation || mongoose.model('SurgeryEvaluation', SurgeryEvaluationSchema);
