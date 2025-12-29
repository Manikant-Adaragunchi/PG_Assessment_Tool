const mongoose = require('mongoose');
const SurgeryEvaluation = require('../models/SurgeryEvaluation');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const logger = require('../config/logger');

// POST /surgery/:internId/attempts
exports.addAttempt = async (req, res) => {
    try {
        const { internId } = req.params;
        const { attemptDate, answers, remarksOverall, patientName, surgeryName, gradeOfCataract, draping } = req.body;

        // 1. Verify Intern
        const intern = await User.findById(internId);
        if (!intern || intern.role !== 'INTERN') {
            return res.status(404).json({ success: false, error: 'Intern not found' });
        }

        // 2. Find or Create Surgery Doc
        let evalDoc = await SurgeryEvaluation.findOne({ internId, moduleCode: 'SURGERY' });
        if (!evalDoc) {
            evalDoc = new SurgeryEvaluation({
                internId,
                moduleCode: 'SURGERY',
                attempts: []
            });
        }

        // 3. ONE ATTEMPT CHECK: Check if this Patient Name already has an evaluation for this Intern
        // We case-insensitive check to avoid 'John Doe' vs 'john doe' duplicates if desired, or exact match.
        // Assuming exact match for now, or lenient check.
        // If patientName is provided, check duplicates.
        if (patientName) {
            const duplicate = evalDoc.attempts.find(a => a.patientName && a.patientName.toLowerCase() === patientName.toLowerCase());
            if (duplicate) {
                return res.status(400).json({
                    success: false,
                    error: `An evaluation for patient '${patientName}' already exists. Only one attempt allowed per surgery.`
                });
            }
        }

        // 4. Validate Answers & Score Logic
        let status = 'PENDING_ACK'; // Default good path
        let totalScore = 0;
        let hasLowScore = false;

        for (const ans of answers) {
            totalScore += ans.scoreValue;
            if (ans.scoreValue < 3) {
                hasLowScore = true;
                if (!ans.remark || ans.remark.trim() === '') {
                    return res.status(400).json({
                        success: false,
                        error: `Remark is required for item '${ans.itemKey}' because score is less than 3`
                    });
                }
            }
        }

        if (hasLowScore) {
            status = 'TEMPORARY';
        }

        // Calculate Grade based on Percentage
        // Max Score = 19 * 5 = 95
        const maxScore = 95;
        const percentage = (totalScore / maxScore) * 100;
        let grade = 'Poor';
        if (percentage >= 80) grade = 'Excellent';
        else if (percentage >= 50) grade = 'Average'; // Adjusted threshold

        let isPass = (grade === 'Excellent' || grade === 'Average');
        if (hasLowScore) isPass = false; // Fail if any item < 3? (Low score sets status=TEMPORARY usually, treating as Fail for streak?)
        // Let's assume Low Score (<3) implies NOT Competent for that specific skill, so streak breaks.

        // Determine Final Status
        if (hasLowScore) {
            status = 'PENDING_ACK'; // Was TEMPORARY, now PENDING_ACK for visibility
        } else {
            status = 'PENDING_ACK';
        }

        // 5. Add Attempt
        const newAttemptNumber = evalDoc.attempts.length + 1;

        const attempt = {
            attemptNumber: newAttemptNumber,
            attemptDate: attemptDate || new Date(),
            facultyId: req.user._id,
            answers,
            totalScore,
            status,
            remarksOverall,
            // New Fields
            patientName,
            surgeryName,
            gradeOfCataract,
            draping,
            grade // Calculated grade
        };

        evalDoc.attempts.push(attempt);
        await evalDoc.save();

        res.status(201).json({
            success: true,
            data: {
                ...attempt
            }
        });

    } catch (error) {
        logger.error('Surgery Add Attempt Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// PUT /surgery/:internId/attempts/:attemptNumber
exports.editAttempt = async (req, res) => {
    try {
        const { internId, attemptNumber } = req.params;
        const { answers, remarksOverall } = req.body;

        const evalDoc = await SurgeryEvaluation.findOne({ internId, moduleCode: 'SURGERY' });
        if (!evalDoc) return res.status(404).json({ success: false, error: 'Evaluation record not found' });

        const attemptIndex = evalDoc.attempts.findIndex(a => a.attemptNumber === parseInt(attemptNumber));
        if (attemptIndex === -1) return res.status(404).json({ success: false, error: 'Attempt not found' });

        // Logic check: Only Faculty/HOD can edit (Middleware handles this, but good to note)

        let status = 'PENDING_ACK';
        let totalScore = 0;
        let hasLowScore = false;

        for (const ans of answers) {
            totalScore += ans.scoreValue;
            if (ans.scoreValue < 3) {
                hasLowScore = true;
                if (!ans.remark) {
                    return res.status(400).json({
                        success: false,
                        error: `Remark is required for item '${ans.itemKey}'`
                    });
                }
            }
        }

        if (hasLowScore) status = 'PENDING_ACK';

        // Apply Updates
        evalDoc.attempts[attemptIndex].answers = answers;
        evalDoc.attempts[attemptIndex].totalScore = totalScore;
        evalDoc.attempts[attemptIndex].status = status; // Reset status on edit
        evalDoc.attempts[attemptIndex].remarksOverall = remarksOverall;
        evalDoc.attempts[attemptIndex].acknowledgedAt = undefined; // Reset Ack
        evalDoc.attempts[attemptIndex].acknowledgedBy = undefined;

        await evalDoc.save();

        // Audit Log
        await AuditLog.create({
            userId: req.user._id,
            action: 'EDIT_SURGERY_ATTEMPT',
            targetType: 'SurgeryEvaluation',
            targetId: evalDoc._id,
            meta: { internId, attemptNumber, newStatus: status }
        });

        res.status(200).json({ success: true, data: evalDoc.attempts[attemptIndex] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};


exports.getAttempts = async (req, res) => {
    try {
        const { internId } = req.params;
        const evalDoc = await SurgeryEvaluation.find({ internId, moduleCode: 'SURGERY' })
            .populate('attempts.facultyId', 'fullName');

        // Visibility Filter: If Intern, filter out TEMPORARY?
        // Spec: "TEMPORARY attempts are visible only to faculty/admin; frontend should hide them from interns."
        // We can filter here or let frontend handle it. Secure approach is here.

        if (!evalDoc) return res.status(200).json({ success: true, data: [] });

        // If simple find, we assume one doc per intern per module in this schema logic
        // But `find` returns array. 
        const doc = evalDoc[0];
        if (!doc) return res.status(200).json({ success: true, data: [] });

        let attempts = doc.attempts;

        if (req.user.role === 'INTERN') {
            attempts = attempts.filter(a => a.status !== 'TEMPORARY');
        }

        res.status(200).json({ success: true, data: attempts });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// POST /surgery/:internId/attempts/:attemptNumber/acknowledge
exports.acknowledgeAttempt = async (req, res) => {
    try {
        const { internId, attemptNumber } = req.params;

        if (req.user._id.toString() !== internId) {
            return res.status(403).json({ success: false, error: 'Cannot acknowledge another intern\'s evaluation' });
        }

        const evalDoc = await SurgeryEvaluation.findOne({ internId, moduleCode: 'SURGERY' });
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

