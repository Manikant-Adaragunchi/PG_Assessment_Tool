const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    text: { type: String, required: true },
    options: [{ type: String, required: true }], // Array of 4 options
    correctAnswer: { type: Number, required: true } // Index of the correct option (0-3)
});

const AssessmentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    questions: [QuestionSchema],
    duration: { type: Number, required: true }, // In minutes
    createdBy: { type: String, required: true }, // Firebase UID of admin
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Assessment', AssessmentSchema);
