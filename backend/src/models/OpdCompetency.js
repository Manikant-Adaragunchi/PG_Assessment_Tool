const mongoose = require('mongoose');

const OpdCompetencySchema = new mongoose.Schema({
    internId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    moduleCode: {
        type: String,
        required: true,
        index: true
    },
    consecutiveSuccessCount: {
        type: Number,
        default: 0
    },
    competent: {
        type: Boolean,
        default: false
    },
    achievedAt: {
        type: Date
    }
}, { timestamps: true });

module.exports = mongoose.model('OpdCompetency', OpdCompetencySchema);
