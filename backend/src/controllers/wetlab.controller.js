const mongoose = require('mongoose');
const WetLabEvaluation = require('../models/WetLabEvaluation');

// POST /wetlab/:internId/attempts
exports.addAttempt = async (req, res) => {
    try {
        const { internId } = req.params;
        const { exerciseName, procedureSteps, tissueHandling, timeManagement, outcome, remarks } = req.body;
        const facultyId = req.user._id;

        let evalDoc = await WetLabEvaluation.findOne({ internId });
        if (!evalDoc) {
            evalDoc = new WetLabEvaluation({ internId, attempts: [] });
        }

        const newAttempt = {
            date: new Date(),
            facultyId,
            exerciseName,
            scores: {
                procedureSteps,
                tissueHandling,
                timeManagement,
                outcome
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

// GET /wetlab/:internId
exports.getAttempts = async (req, res) => {
    try {
        const { internId } = req.params;
        const evalDoc = await WetLabEvaluation.findOne({ internId }).populate('attempts.facultyId', 'fullName');

        if (!evalDoc) {
            return res.status(200).json({ success: true, data: [] });
        }

        res.status(200).json({ success: true, data: evalDoc.attempts });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
