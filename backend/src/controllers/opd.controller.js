const mongoose = require('mongoose');
const OpdEvaluation = require('../models/OpdEvaluation');
const OpdCompetency = require('../models/OpdCompetency');
const User = require('../models/User');
const logger = require('../config/logger');

// POST /opd/:moduleCode/:internId/attempts
// POST /opd/:moduleCode/:internId/attempts
exports.addAttempt = async (req, res) => {
    // const session = await mongoose.startSession();
    // session.startTransaction();
    try {
        console.log('OPD Add Attempt Request:', req.params, req.body); // Debug Log
        const { moduleCode, internId } = req.params;
        const { attemptDate, answers, grade, procedureName } = req.body; // Added grade & procedureName

        // 1. Validation & Result Calculation
        let isPass = true;
        for (const ans of answers) {
            if (ans.ynValue === 'N') {
                isPass = false;
            }
        }
        const result = isPass ? 'PASS' : 'FAIL';
        console.log('Calculated Result:', result); // Debug Log

        // 2. Find/Create Evaluation Doc
        let evalDoc = await OpdEvaluation.findOne({ internId, moduleCode });
        if (!evalDoc) {
            evalDoc = new OpdEvaluation({ internId, moduleCode, attempts: [] });
        }

        // 3. Calculate Consecutive Streak (Retroactive + Current) for THIS PROCEDURE
        let consecutiveStr = 0;

        // We only care about streak if current is PASS. If current Fail, streak is 0.
        if (isPass) {
            consecutiveStr = 1; // Current one
            // Look backwards
            for (let i = evalDoc.attempts.length - 1; i >= 0; i--) {
                // Only consider attempts for the same procedure
                if (evalDoc.attempts[i].procedureName === procedureName) {
                    if (evalDoc.attempts[i].result === 'PASS') {
                        consecutiveStr++;
                    } else {
                        break; // Streak broken
                    }
                }
            }
        } else {
            consecutiveStr = 0;
        }
        console.log(`Calculated Streak for ${procedureName}:`, consecutiveStr); // Debug Log

        // 4. Determine Status
        const status = (consecutiveStr >= 3) ? 'PERMANENT' : 'TEMPORARY';
        console.log('Determined Status:', status); // Debug Log

        // 5. Add Attempt
        const attempt = {
            attemptNumber: evalDoc.attempts.length + 1,
            attemptDate: attemptDate || new Date(),
            facultyId: req.user._id,
            procedureName, // Save the Procedure Name!
            answers,
            status: status,
            result: result,
            grade: grade || 'Average'
        };

        evalDoc.attempts.push(attempt);
        await evalDoc.save();
        console.log('OpdEvaluation Saved.'); // Debug Log

        if (status === 'PERMANENT') {
            await OpdCompetency.findOneAndUpdate(
                { internId, moduleCode },
                { consecutiveSuccessCount: consecutiveStr, competent: true, achievedAt: new Date() },
                { upsert: true }
            );
            console.log('OpdCompetency Updated (PERMANENT).'); // Debug Log
        } else {
            // Update count but not competent
            await OpdCompetency.findOneAndUpdate(
                { internId, moduleCode },
                { consecutiveSuccessCount: consecutiveStr, competent: false },
                { upsert: true }
            );
            console.log('OpdCompetency Updated (TEMPORARY).'); // Debug Log
        }

        // await session.commitTransaction();

        // Return attempt with streak info
        res.status(201).json({
            success: true,
            data: {
                ...attempt,
                currentStreak: consecutiveStr
            }
        });

    } catch (error) {
        // await session.abortTransaction();
        console.error('OPD Add Attempt Trace Error:', error); // Detailed Error Log
        logger.error('OPD Add Attempt Error:', error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        // session.endSession();
    }
};

// POST /opd/:moduleCode/:internId/attempts/:attemptNumber/acknowledge (INTERN ONLY)
exports.acknowledgeAttempt = async (req, res) => {
    // const session = await mongoose.startSession();
    // session.startTransaction();
    try {
        const { moduleCode, internId, attemptNumber } = req.params;

        if (req.user._id.toString() !== internId) {
            return res.status(403).json({ success: false, error: 'Cannot acknowledge another intern\'s evaluation' });
        }

        const evalDoc = await OpdEvaluation.findOne({ internId, moduleCode });
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

        if (attempt.result === 'PASS') {
            let compDoc = await OpdCompetency.findOne({ internId, moduleCode });
            if (!compDoc) {
                compDoc = new OpdCompetency({ internId, moduleCode, consecutiveSuccessCount: 0 });
            }

            compDoc.consecutiveSuccessCount += 1;

            if (compDoc.consecutiveSuccessCount >= 3) {
                compDoc.competent = true;
                if (!compDoc.achievedAt) compDoc.achievedAt = new Date();
            }
            await compDoc.save();
        } else {
            await OpdCompetency.findOneAndUpdate(
                { internId, moduleCode },
                { consecutiveSuccessCount: 0, competent: false },
                { upsert: true }
            );
        }

        // await session.commitTransaction();
        res.status(200).json({ success: true, data: attempt });

    } catch (error) {
        // await session.abortTransaction();
        res.status(500).json({ success: false, error: error.message });
    } finally {
        // session.endSession();
    }
};

exports.getAttempts = async (req, res) => {
    try {
        const { internId, moduleCode } = req.params;
        const evaluation = await OpdEvaluation.findOne({ internId, moduleCode })
            .populate('attempts.facultyId', 'fullName');

        if (!evaluation) {
            return res.status(200).json({ success: true, count: 0, data: [] });
        }

        res.status(200).json({ success: true, count: evaluation.attempts.length, data: evaluation.attempts });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
