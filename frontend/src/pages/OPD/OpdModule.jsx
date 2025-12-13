import React, { useState, useEffect } from 'react';
import MatrixEvaluation from '../../components/matrix/MatrixEvaluation';
import { opdQuestions } from '../../utils/mockData';
import { getOpdAttempts, addOpdAttempt, validateIntern } from '../../services/evaluationApi';
import { CheckCircle, AlertCircle, Award } from 'lucide-react';

const OpdModule = () => {
    // Config
    const MODULE_CODE = 'GENERAL_SURGERY_OPD';

    // State
    const [internIdInput, setInternIdInput] = useState('');
    const [validatedIntern, setValidatedIntern] = useState(null); // { _id, fullName, batch }
    const [attempts, setAttempts] = useState([]);
    const [currentStreak, setCurrentStreak] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [grade, setGrade] = useState('Average'); // Default grade for new attempt

    // Validate Intern
    const handleValidate = async () => {
        if (!internIdInput) return;
        setLoading(true);
        setError(null);
        try {
            const res = await validateIntern(internIdInput);
            if (res.success) {
                setValidatedIntern(res.data);
                // Load attempts for this intern
                loadAttempts(res.data._id);
            }
        } catch (err) {
            setValidatedIntern(null);
            setError(err.error || 'Intern not found');
            setAttempts([]);
        } finally {
            setLoading(false);
        }
    };

    const loadAttempts = async (id) => {
        try {
            const data = await getOpdAttempts(MODULE_CODE, id);
            if (data.success) {
                // Backend return attempts in data.data
                // And we might need to calc streak if backend doesn't return it explicitly in top level
                // But wait, my updated backend addAttempt returns streak, but getAttempts logic was simple findOne.
                // I need to calc streak client side or update backend getAttempts.
                // Let's calc client side correctly from the list.

                const fetchedAttempts = data.data || [];

                // Map to UI format
                const mapped = fetchedAttempts.map(a => ({
                    attemptNumber: a.attemptNumber,
                    attemptDate: a.date || a.attemptDate,
                    status: a.status,
                    remarksOverall: `Result: ${a.result} | Grade: ${a.grade || 'N/A'}`,
                    result: a.result, // Keep result for streak calc
                    grade: a.grade,
                    answers: a.answers.map(ans => ({
                        itemKey: ans.itemKey,
                        ynValue: ans.ynValue,
                        remark: ans.remark
                    }))
                }));

                setAttempts(mapped);

                // Calc Streak
                let streak = 0;
                // Assuming mapped is sorted by date ascending? Backend uses push, so yes usually.
                // Iterate from end
                for (let i = mapped.length - 1; i >= 0; i--) {
                    if (mapped[i].result === 'PASS') {
                        streak++;
                    } else {
                        break;
                    }
                }
                setCurrentStreak(streak);
            }
        } catch (err) {
            console.error("Failed to load attempts", err);
        }
    };

    const handleAddAttempt = () => {
        const newAttempt = {
            attemptNumber: attempts.length + 1,
            attemptDate: new Date().toISOString(),
            status: 'PENDING', // UI only
            answers: [],
            remarksOverall: '',
            isNew: true
        };
        setAttempts([...attempts, newAttempt]);
        setGrade('Average'); // Reset grade
    };

    const handleUpdateCell = (attemptIndex, itemKey, field, value) => {
        const newAttempts = [...attempts];
        const attempt = newAttempts[attemptIndex];

        if (itemKey === 'OVERALL') {
            // Handle overall fields if any matrix component sends them
            // But we use external grade state for simplicity for the NEW attempt
        } else {
            let answer = attempt.answers.find(a => a.itemKey === itemKey);
            if (!answer) {
                answer = { itemKey };
                attempt.answers.push(answer);
            }
            answer[field] = value;
        }
        setAttempts(newAttempts);
    };

    const handleSave = async () => {
        if (!validatedIntern) {
            alert("Please validate an intern first.");
            return;
        }
        const attemptToSave = attempts.find(a => a.isNew === true);
        if (!attemptToSave) {
            alert("No new attempt to save.");
            return;
        }

        // Auto-Calculate Grade
        const totalQuestions = opdQuestions.length;
        let yesCount = 0;

        attemptToSave.answers.forEach(a => {
            if (a.ynValue === 'Y') yesCount++;
        });

        let calculatedGrade = 'Below Average';
        if (yesCount === totalQuestions) {
            calculatedGrade = 'Excellent';
        } else if (yesCount > totalQuestions * 0.8) {
            calculatedGrade = 'Good';
        } else if (yesCount > totalQuestions * 0.5) {
            calculatedGrade = 'Average';
        }

        const payload = {
            attemptDate: attemptToSave.attemptDate,
            grade: calculatedGrade,
            answers: attemptToSave.answers.map(a => ({
                itemKey: a.itemKey,
                ynValue: a.ynValue,
                remark: a.remark || ''
            }))
        };

        try {
            const res = await addOpdAttempt(MODULE_CODE, validatedIntern._id, payload);
            if (res.success) {
                alert(`Saved! Result: ${res.data.result}. Streak: ${res.data.currentStreak}. Status: ${res.data.status}`);
                // Reload to sync everything
                loadAttempts(validatedIntern._id);
            }
        } catch (err) {
            alert("Error saving: " + (err.error || err.message));
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-2">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">OPD Evaluation</h2>
                    <p className="text-gray-500 mt-1">Unit: General Surgery OPD</p>
                </div>

                {/* Validation Section */}
                <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                    <div className="flex gap-2 w-full md:w-auto">
                        <input
                            type="text"
                            placeholder="Enter Reg No or ID"
                            className="border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64"
                            value={internIdInput}
                            onChange={(e) => setInternIdInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleValidate()}
                        />
                        <button
                            onClick={handleValidate}
                            disabled={loading}
                            className="bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors"
                        >
                            {loading ? 'Checking...' : 'Verify'}
                        </button>
                    </div>
                    {error && <p className="text-red-500 text-sm mt-1 flex items-center"><AlertCircle size={14} className="mr-1" />{error}</p>}
                </div>
            </div>

            {/* Intern Details Card */}
            {validatedIntern && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex flex-col sm:flex-row justify-between items-center animate-fade-in">
                    <div className="flex items-center gap-3 mb-2 sm:mb-0">
                        <div className="bg-blue-200 text-blue-700 p-2 rounded-full font-bold">
                            {validatedIntern.fullName.charAt(0)}
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-blue-900">{validatedIntern.fullName}</h3>
                            <p className="text-sm text-blue-700">Reg: {validatedIntern.regNo} • Batch: {validatedIntern.batch}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-center bg-white px-4 py-2 rounded-lg shadow-sm border border-blue-100">
                            <p className="text-xs text-gray-500 uppercase font-semibold">Current Streak</p>
                            <div className="flex items-center justify-center text-green-600 font-bold text-xl">
                                <Award size={20} className="mr-1" /> {currentStreak} / 3
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {validatedIntern ? (
                <>
                    <div className="h-[500px] mb-6">
                        <MatrixEvaluation
                            type="yesno"
                            questions={opdQuestions}
                            attempts={attempts}
                            onAddAttempt={handleAddAttempt}
                            onUpdateCell={handleUpdateCell}
                        />
                    </div>

                    {/* Grade & Save Section - Only show if there is a NEW attempt */}
                    {attempts.some(a => a.isNew) && (
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 animate-slide-up">
                            <div className="text-gray-600 text-sm italic w-full md:w-auto">
                                * Grade is calculated automatically based on competency checks.
                            </div>

                            <button
                                onClick={handleSave}
                                className="w-full md:w-auto bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                                <CheckCircle size={20} />
                                Save & Submit Attempt
                            </button>
                        </div>
                    )}
                </>
            ) : (
                !loading && <div className="text-center p-12 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-500">
                    Verify an intern to view past attempts and start evaluation.
                </div>
            )}
        </div>
    );
};

export default OpdModule;
