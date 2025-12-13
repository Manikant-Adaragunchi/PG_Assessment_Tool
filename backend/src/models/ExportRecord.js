const mongoose = require('mongoose');

const ExportRecordSchema = new mongoose.Schema({
    batchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch'
    },
    internId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    exportType: {
        type: String,
        enum: ['PDF', 'EXCEL', 'ZIP'],
        required: true
    },
    filePaths: {
        pdf: String,
        excel: String,
        zip: String
    }, // Relative paths to storage

    generatedBy: {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        fullName: String
    },
    generatedAt: {
        type: Date,
        default: Date.now
    },

    status: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'FAILED'],
        default: 'PENDING'
    },

    meta: {
        type: Object
    }
}, { timestamps: true });

module.exports = mongoose.model('ExportRecord', ExportRecordSchema);
