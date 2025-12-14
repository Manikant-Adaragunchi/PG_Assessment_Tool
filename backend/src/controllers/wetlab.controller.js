const mongoose = require('mongoose');
const WetLabEvaluation = require('../models/WetlabEvaluation');

// POST /wetlab/:internId/attempts
exports.addAttempt = async (req, res) => {
    try {
        const { internId } = req.params;
        const { exerciseName, procedureSteps, tissueHandling, timeManagement, outcome, remarks } = req.body;
        const facultyId = req.user._id;

        console.log('Add WetLab Attempt:', { internId, facultyId, exerciseName, body: req.body });

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
                ...newAttempt
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// PUT /wetlab/:internId/attempts/:attemptNumber
exports.editAttempt = async (req, res) => {
    try {
        const { internId, attemptNumber } = req.params;
        const { exerciseName, procedureSteps, tissueHandling, timeManagement, outcome, remarks } = req.body;

        // Find the document
        const evalDoc = await WetLabEvaluation.findOne({ internId });
        if (!evalDoc) {
            return res.status(404).json({ success: false, error: 'Evaluation record not found' });
        }

        // Find Attempt
        const attemptIndex = evalDoc.attempts.findIndex(a => a.attemptNumber.toString() === attemptNumber);
        if (attemptIndex === -1) {
            return res.status(404).json({ success: false, error: 'Attempt not found' });
        }

        const attempt = evalDoc.attempts[attemptIndex];

        // Recalculate Grade if scores changed
        const totalScore = (procedureSteps || 0) + (tissueHandling || 0) + (timeManagement || 0) + (outcome || 0);
        const maxScore = 20;
        const percentage = (totalScore / maxScore) * 100;

        let grade = 'Poor';
        if (percentage >= 80) grade = 'Excellent';
        else if (percentage >= 50) grade = 'Average';

        // Update fields
        attempt.exerciseName = exerciseName || attempt.exerciseName;
        attempt.scores = {
            procedureSteps,
            tissueHandling,
            timeManagement,
            outcome
        };
        attempt.totalScore = totalScore;
        attempt.grade = grade;
        attempt.remarks = remarks || attempt.remarks;
        // Keep original date & facultyId for now, or update 'updatedAt' if schema supported it.

        evalDoc.attempts[attemptIndex] = attempt;
        await evalDoc.save();

        res.status(200).json({ success: true, data: attempt });

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

// POST /wetlab/:internId/attempts/:attemptNumber/acknowledge
exports.acknowledgeAttempt = async (req, res) => {
    try {
        const { internId, attemptNumber } = req.params;

        if (req.user._id.toString() !== internId) {
            return res.status(403).json({ success: false, error: 'Cannot acknowledge another intern\'s evaluation' });
        }

        const evalDoc = await WetLabEvaluation.findOne({ internId });
        if (!evalDoc) return res.status(404).json({ success: false, error: 'Evaluation not found' });

        const attempt = evalDoc.attempts.find(a => a.attemptNumber === parseInt(attemptNumber));
        if (!attempt) return res.status(404).json({ success: false, error: 'Attempt not found' });

        if (attempt.status !== 'PENDING_ACK') {
            return res.status(400).json({ success: false, error: `Cannot acknowledge attempt with status ${attempt.status}` });
        }

        attempt.status = 'ACKNOWLEDGED';
        attempt.acknowledgedBy = { userId: req.user._id, fullName: req.user.fullName };
        attempt.acknowledgedAt = new Date();

        await evalDoc.save();

        res.status(200).json({ success: true, data: attempt });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

