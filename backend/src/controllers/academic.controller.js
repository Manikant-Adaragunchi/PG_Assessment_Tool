const mongoose = require('mongoose');
const AcademicEvaluation = require('../models/AcademicEvaluation');
const User = require('../models/User');

// POST /academic/:internId/attempts
exports.addAttempt = async (req, res) => {
    try {
        const { internId } = req.params;
        const { topic, presentationQuality, content, qaHandling, slidesQuality, timing, remarks } = req.body;
        const facultyId = req.user._id;

        let evalDoc = await AcademicEvaluation.findOne({ internId });
        if (!evalDoc) {
            evalDoc = new AcademicEvaluation({ internId, attempts: [] });
        }

        const newAttempt = {
            attemptNumber: evalDoc.attempts.length + 1,
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
            remarks,
            status: 'PENDING_ACK'
        };

        evalDoc.attempts.push(newAttempt);
        await evalDoc.save();

        res.status(201).json({ success: true, data: newAttempt });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// PUT /academic/:internId/attempts/:attemptNumber
exports.editAttempt = async (req, res) => {
    try {
        const { internId, attemptNumber } = req.params;
        const { topic, presentationQuality, content, qaHandling, slidesQuality, timing, remarks } = req.body;

        const evalDoc = await AcademicEvaluation.findOne({ internId });
        if (!evalDoc) return res.status(404).json({ success: false, error: 'Evaluation record not found' });

        const attemptIndex = evalDoc.attempts.findIndex(a => a.attemptNumber === parseInt(attemptNumber));
        if (attemptIndex === -1) return res.status(404).json({ success: false, error: 'Attempt not found' });

        // Update
        const att = evalDoc.attempts[attemptIndex];
        att.topic = topic;
        att.scores = { presentationQuality, content, qaHandling, slidesQuality, timing };
        att.remarks = remarks;
        att.status = 'PENDING_ACK'; // Reset status or keeping it? Defaulting to PENDING_ACK

        await evalDoc.save();

        res.status(200).json({ success: true, data: att });
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
