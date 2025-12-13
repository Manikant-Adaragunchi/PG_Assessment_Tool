const mongoose = require('mongoose');
const OpdEvaluation = require('../models/OpdEvaluation');
const OpdCompetency = require('../models/OpdCompetency');
const User = require('../models/User');
const logger = require('../config/logger');

// POST /opd/:moduleCode/:internId/attempts
exports.addAttempt = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { moduleCode, internId } = req.params;
        const { attemptDate, answers } = req.body; // Answers: [{ itemKey, ynValue, remark }]

        // 1. Validation
        let isPass = true;
        for (const ans of answers) {
            if (ans.ynValue === 'N') {
                isPass = false;
            }
        }

        let status = isPass ? 'PENDING_ACK' : 'TEMPORARY';

        // 2. Find/Create Evaluation Doc
        let evalDoc = await OpdEvaluation.findOne({ internId, moduleCode }).session(session);
        if (!evalDoc) {
            evalDoc = new OpdEvaluation({ internId, moduleCode, attempts: [] });
        }

        // 3. Add Attempt
        const attempt = {
            attemptNumber: evalDoc.attempts.length + 1,
            attemptDate: attemptDate || new Date(),
            facultyId: req.user._id,
            answers,
            status,
            result: isPass ? 'PASS' : 'FAIL'
        };

        evalDoc.attempts.push(attempt);
        await evalDoc.save({ session });

        // 4. Competency Logic for Failures
        if (status === 'TEMPORARY' || !isPass) {
            await OpdCompetency.findOneAndUpdate(
                { internId, moduleCode },
                { consecutiveSuccessCount: 0, competent: false },
                { upsert: true, session }
            );
        }

        await session.commitTransaction();
        res.status(201).json({ success: true, data: evalDoc.attempts[evalDoc.attempts.length - 1] });
    } catch (error) {
        await session.abortTransaction();
        logger.error('OPD Add Attempt Error:', error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        session.endSession();
    }
};

// POST /opd/:moduleCode/:internId/attempts/:attemptNumber/acknowledge (INTERN ONLY)
exports.acknowledgeAttempt = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { moduleCode, internId, attemptNumber } = req.params;

        if (req.user._id.toString() !== internId) {
            return res.status(403).json({ success: false, error: 'Cannot acknowledge another intern\'s evaluation' });
        }

        const evalDoc = await OpdEvaluation.findOne({ internId, moduleCode }).session(session);
        if (!evalDoc) return res.status(404).json({ success: false, error: 'Evaluation not found' });

        const attempt = evalDoc.attempts.find(a => a.attemptNumber === parseInt(attemptNumber));
        if (!attempt) return res.status(404).json({ success: false, error: 'Attempt not found' });

        if (attempt.status !== 'PENDING_ACK') {
            return res.status(400).json({ success: false, error: `Cannot acknowledge attempt with status ${attempt.status}` });
        }

        attempt.status = 'ACKNOWLEDGED';
        attempt.acknowledgedBy = { userId: req.user._id, fullName: req.user.fullName };
        attempt.acknowledgedAt = new Date();
        await evalDoc.save({ session });

        if (attempt.result === 'PASS') {
            let compDoc = await OpdCompetency.findOne({ internId, moduleCode }).session(session);
            if (!compDoc) {
                compDoc = new OpdCompetency({ internId, moduleCode, consecutiveSuccessCount: 0 });
            }

            compDoc.consecutiveSuccessCount += 1;

            if (compDoc.consecutiveSuccessCount >= 3) {
                compDoc.competent = true;
                if (!compDoc.achievedAt) compDoc.achievedAt = new Date();
            }
            await compDoc.save({ session });
        } else {
            await OpdCompetency.findOneAndUpdate(
                { internId, moduleCode },
                { consecutiveSuccessCount: 0, competent: false },
                { upsert: true, session }
            );
        }

        await session.commitTransaction();
        res.status(200).json({ success: true, data: attempt });

    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ success: false, error: error.message });
    } finally {
        session.endSession();
    }
};

exports.getAttempts = async (req, res) => {
    try {
        const { internId, moduleCode } = req.params;
        const evaluation = await OpdEvaluation.findOne({ internId, moduleCode });

        if (!evaluation) {
            return res.status(200).json({ success: true, count: 0, data: [] });
        }

        res.status(200).json({ success: true, count: evaluation.attempts.length, data: evaluation.attempts });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
