const mongoose = require('mongoose');

const BatchSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true // e.g., "2024-25"
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'COMPLETED', 'ARCHIVED', 'DELETED'],
        default: 'ACTIVE'
    },
    interns: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        fullName: String,
        email: String,
        regNo: String
    }]
}, { timestamps: true });

// Validation to ensure strictly 4 interns could be done here or in controller
// Mongoose middleware example for generic validation (though controller is often better for business logic errors)
BatchSchema.pre('validate', function (next) {
    if (this.interns && this.interns.length > 4) {
        next(new Error('Batch cannot have more than 4 interns'));
    } else {
        next();
    }
});

module.exports = mongoose.model('Batch', BatchSchema);
