const mongoose = require('mongoose');

const EvaluationModuleSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['score', 'yesno'],
        required: true
    },
    items: [{
        key: { type: String, required: true },
        label: { type: String, required: true },
        inputType: { type: String }, // 'score', 'yn', 'text'
        group: { type: String } // Optional: for 'COGNITIVE', 'AFFECTIVE', etc.
    }]
}, { timestamps: true });

module.exports = mongoose.model('EvaluationModule', EvaluationModuleSchema);
