const mongoose = require('mongoose');
const WetLabEvaluation = require('../models/WetlabEvaluation');

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

        // Auto-Grading & Streak Logic
        // Max Score: 5 * 4 items = 20
        const totalScore = (procedureSteps || 0) + (tissueHandling || 0) + (timeManagement || 0) + (outcome || 0);
        const maxScore = 20;
        const percentage = (totalScore / maxScore) * 100;

        let grade = 'Poor';
        if (percentage >= 80) grade = 'Excellent';
        else if (percentage >= 50) grade = 'Average';

        // Pass Definition: Grade is Excellent or Average
        const isPass = (grade === 'Excellent' || grade === 'Average');

        // Basic Status
        const status = 'PENDING_ACK';

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
            totalScore,
            grade,
            status,
            remarks
        };

        evalDoc.attempts.push(newAttempt);
        await evalDoc.save();

        res.status(201).json({
            success: true,
            data: {
                ...newAttempt,
                currentStreak: consecutiveStr
            }
        });
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
