const Assessment = require('../models/Assessment');

// Create a new assessment
exports.createAssessment = async (req, res) => {
    try {
        const { title, description, questions, duration, createdBy } = req.body;
        // Basic validation
        if (!title || !questions || !duration) {
            return res.status(400).json({ message: 'Title, questions, and duration are required' });
        }

        const newAssessment = new Assessment({
            title,
            description,
            questions,
            duration,
            createdBy: createdBy || 'admin_placeholder' // Temporary until Auth is ready
        });

        const savedAssessment = await newAssessment.save();
        res.status(201).json(savedAssessment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all assessments
exports.getAllAssessments = async (req, res) => {
    try {
        const assessments = await Assessment.find().sort({ createdAt: -1 });
        res.status(200).json(assessments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single assessment by ID
exports.getAssessmentById = async (req, res) => {
    try {
        const assessment = await Assessment.findById(req.params.id);
        if (!assessment) return res.status(404).json({ message: 'Assessment not found' });
        res.status(200).json(assessment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete assessment
exports.deleteAssessment = async (req, res) => {
    try {
        const assessment = await Assessment.findByIdAndDelete(req.params.id);
        if (!assessment) return res.status(404).json({ message: 'Assessment not found' });
        res.status(200).json({ message: 'Assessment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
