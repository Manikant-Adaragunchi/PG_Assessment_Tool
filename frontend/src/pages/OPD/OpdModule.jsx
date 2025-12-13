import React, { useState, useEffect } from 'react';
import MatrixEvaluation from '../../components/matrix/MatrixEvaluation';
import { opdQuestions } from '../../utils/mockData';
import { getOpdAttempts, addOpdAttempt } from '../../services/evaluationApi';

const OpdModule = () => {
    // Config
    const MODULE_CODE = 'GENERAL_SURGERY_OPD'; // Ideally from route or props
    const [internId, setInternId] = useState('');
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch attempts
    useEffect(() => {
        if (!internId) return;

        const loadAttempts = async () => {
            setLoading(true);
            try {
                const data = await getOpdAttempts(MODULE_CODE, internId);
                // Backend: { attemptNumber, date, status, answers: [{itemKey, ynValue, remark}], result }
                if (data.success) {
                    const mapped = data.data.map(a => ({
                        attemptNumber: a.attemptNumber,
                        attemptDate: a.date || a.attemptDate, // Fix key from backend schema
                        status: a.status,
                        remarksOverall: `Result: ${a.result}`, // OPD doesn't have overall remarks field in schema, usually derived
                        answers: a.answers.map(ans => ({
                            itemKey: ans.itemKey,
                            // Matrix component expects value in a specific field?
                            // For type="yesno", it reads value directly?
                            // Let's check MatrixEvaluation logic.
                            // Actually, let's just stick to a consistent field like 'value' or 'result'
                            // Matrix usually checks attempt.answers.find().[field]
                            // In OpdModule, we used 'value' in previous code?
                            // Previous: answer[field] = value.
                            // Let's map ynValue to 'value' or 'ynValue' and ensure Matrix uses it.
                            ynValue: ans.ynValue,
                            remark: ans.remark
                        }))
                    }));
                    setAttempts(mapped);
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load attempts');
            } finally {
                setLoading(false);
            }
        };
        loadAttempts();
    }, [internId]);

    const handleAddAttempt = () => {
        const newAttempt = {
            attemptNumber: attempts.length + 1,
            attemptDate: new Date().toISOString(),
            status: 'PENDING_ACK',
            answers: [],
            remarksOverall: '',
            isNew: true
        };
        setAttempts([...attempts, newAttempt]);
    };

    const handleUpdateCell = (attemptIndex, itemKey, field, value) => {
        const newAttempts = [...attempts];
        const attempt = newAttempts[attemptIndex];

        if (itemKey === 'OVERALL') {
            attempt[field] = value;
        } else {
            let answer = attempt.answers.find(a => a.itemKey === itemKey);
            if (!answer) {
                answer = { itemKey };
                attempt.answers.push(answer);
            }
            // For OPD, field is likely 'ynValue' or 'remark'
            answer[field] = value;
        }
        setAttempts(newAttempts);
    };

    const handleSave = async () => {
        const attemptToSave = attempts.find(a => a.isNew === true);
        if (!attemptToSave) {
            alert("No new attempt to save.");
            return;
        }
        if (!internId) {
            alert("Please enter Intern ID.");
            return;
        }

        // Map to backend payload
        const payload = {
            attemptDate: attemptToSave.attemptDate,
            answers: attemptToSave.answers.map(a => ({
                itemKey: a.itemKey,
                ynValue: a.ynValue,
                remark: a.remark || ''
            }))
        };

        try {
            await addOpdAttempt(MODULE_CODE, internId, payload);
            alert("OPD Evaluation Saved!");
            // Refresh
            // Re-trigger effect or manual fetch
            // manual fetch copy:
            const data = await getOpdAttempts(MODULE_CODE, internId);
            if (data.success) {
                const mapped = data.data.map(a => ({
                    attemptNumber: a.attemptNumber,
                    attemptDate: a.date || a.attemptDate,
                    status: a.status,
                    remarksOverall: `Result: ${a.result}`,
                    answers: a.answers.map(ans => ({
                        itemKey: ans.itemKey,
                        ynValue: ans.ynValue,
                        remark: ans.remark
                    }))
                }));
                setAttempts(mapped);
            }
        } catch (err) {
            alert("Error saving: " + (err.error || err.message));
        }
    };

    return (
        <div>
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">OPD Evaluation</h2>
                    <p className="text-gray-500">Unit: General Surgery OPD</p>
                </div>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Intern ID"
                        className="border p-2 rounded"
                        value={internId}
                        onChange={(e) => setInternId(e.target.value)}
                    />
                </div>
            </div>

            <div className="h-[600px]">
                <MatrixEvaluation
                    type="yesno"
                    questions={opdQuestions}
                    attempts={attempts}
                    onAddAttempt={handleAddAttempt}
                    onUpdateCell={handleUpdateCell}
                />
            </div>
            <div className="mt-4 flex justify-end">
                <button
                    onClick={handleSave}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-semibold shadow-sm"
                >
                    Save Latest Attempt
                </button>
            </div>
        </div>
    );
};

export default OpdModule;
