const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    action: {
        type: String,
        required: true
    },
    targetType: {
        type: String
    },
    targetId: {
        type: mongoose.Schema.Types.Mixed // ObjectId or String
    },
    meta: {
        type: Object
    },
    ip: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
