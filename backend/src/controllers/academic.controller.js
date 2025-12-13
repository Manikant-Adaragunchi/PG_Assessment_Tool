const mongoose = require('mongoose');
const AcademicEvaluation = require('../models/AcademicEvaluation');
const User = require('../models/User');

// POST /academic/:internId/attempts
exports.addAttempt = async (req, res) => {
    try {
        const { internId } = req.params;
        const { topic, presentationQuality, content, qaHandling, slidesQuality, timing, remarks } = req.body;

        const facultyId = req.user._id;

        // Validation ?

        let evalDoc = await AcademicEvaluation.findOne({ internId });
        if (!evalDoc) {
            evalDoc = new AcademicEvaluation({ internId, attempts: [] });
        }

        const newAttempt = {
            date: new Date(),
            facultyId,
            topic,
            scores: {
                presentationQuality,
                content,
                qaHandling,
                slidesQuality,
                timing
            },
            remarks
        };

        evalDoc.attempts.push(newAttempt);
        await evalDoc.save();

        res.status(201).json({ success: true, data: newAttempt });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// GET /academic/:internId
exports.getAttempts = async (req, res) => {
    try {
        const { internId } = req.params;
        const evalDoc = await AcademicEvaluation.findOne({ internId }).populate('attempts.facultyId', 'fullName email');

        if (!evalDoc) {
            return res.status(200).json({ success: true, data: [] });
        }

        res.status(200).json({ success: true, data: evalDoc.attempts });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
