const mongoose = require('mongoose');

const OpdAttemptSchema = new mongoose.Schema({
    attemptNumber: { type: Number, required: true },
    attemptDate: { type: Date, required: true },
    facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    answers: [{
        itemKey: { type: String, required: true },
        ynValue: { type: String, enum: ['Y', 'N'], required: true },
        remark: { type: String }
    }],

    status: {
        type: String,
        enum: ['TEMPORARY', 'PENDING_ACK', 'ACKNOWLEDGED'],
        default: 'TEMPORARY'
    },

    result: { type: String, enum: ['PASS', 'FAIL'], default: 'FAIL' }, // Derived from Y/N

    acknowledgedBy: {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        fullName: String
    },
    acknowledgedAt: { type: Date }
}, { timestamps: true });

const OpdEvaluationSchema = new mongoose.Schema({
    internId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    moduleCode: {
        type: String,
        required: true // e.g., "OPD_LASERS_GREEN"
    },
    attempts: [OpdAttemptSchema]
}, { timestamps: true });

module.exports = mongoose.model('OpdEvaluation', OpdEvaluationSchema);
