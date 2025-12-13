import React, { useState, useEffect } from 'react';
import MatrixEvaluation from '../../components/matrix/MatrixEvaluation';
import { surgeryQuestions } from '../../utils/mockData';
import { getSurgeryAttempts, addSurgeryAttempt, updateSurgeryAttempt, validateIntern } from '../../services/evaluationApi';
import { CheckCircle, AlertCircle, Award, UserCheck } from 'lucide-react';

const SurgeryModule = () => {
    // State
    const [internIdInput, setInternIdInput] = useState('');
    const [validatedIntern, setValidatedIntern] = useState(null);
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentStreak, setCurrentStreak] = useState(0);

    // Form Fields for New Attempt
    const [formData, setFormData] = useState({
        patientName: '',
        surgeryName: '',
        gradeOfCataract: '',
        draping: ''
    });

    // Validate Intern
    const handleValidate = async () => {
        if (!internIdInput) return;
        setLoading(true);
        setError(null);
        try {
            const res = await validateIntern(internIdInput);
            if (res.success) {
                setValidatedIntern(res.data);
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
            const data = await getSurgeryAttempts(id);
            if (data.success) {
                const mapped = data.data.map(a => ({
                    attemptNumber: a.attemptNumber,
                    attemptDate: a.date || a.attemptDate,
                    status: a.status,
                    remarksOverall: a.remarks || a.remarksOverall,
                    answers: a.answers ? a.answers : (a.scores || []).map(s => ({
                        itemKey: s.questionId,
                        scoreValue: s.score,
                        remark: s.remarks
                    })),
                    patientName: a.patientName,
                    surgeryName: a.surgeryName,
                    grade: a.grade,
                    totalScore: a.totalScore
                }));
                setAttempts(mapped);

                // Calc Streak removed

            }
        } catch (err) {
            console.error(err);
            setError('Failed to load attempts');
        }
    };

    const handleEdit = (attempt) => {
        // Populate Form
        setFormData({
            patientName: attempt.patientName,
            surgeryName: attempt.surgeryName,
            gradeOfCataract: attempt.gradeOfCataract,
            draping: attempt.draping
        });

        // Mark this attempt as being edited in the local state
        // We will repurpose 'isNew' or add 'isEditing' flag to the specific attempt object in 'attempts' array?
        // Matrix deals with array. existing attempts are usually read-only.
        // If we set 'isNew: true' on an existing attempt (with an ID/AttemptNumber), handleSave needs to know.

        const newAttempts = attempts.map(a =>
            a.attemptNumber === attempt.attemptNumber
                ? { ...a, isNew: true, isEditing: true } // Mark as editing
                : a
        );
        setAttempts(newAttempts);
    };

    const handleAddAttempt = () => {
        // Validation for header fields
        if (!formData.patientName || !formData.surgeryName) {
            alert("Please enter Patient Name and Surgery Name before starting evaluation.");
            return;
        }

        const newAttempt = {
            attemptNumber: attempts.length + 1,
            attemptDate: new Date().toISOString(),
            status: 'PENDING_ACK',
            answers: [],
            remarksOverall: '',
            isNew: true,
            isEditing: false,
            ...formData
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
            answer[field] = field === 'scoreValue' ? parseInt(value) : value;
        }
        setAttempts(newAttempts);
    };

    const handleSave = async () => {
        const attemptToSave = attempts.find(a => a.isNew === true);
        if (!attemptToSave) {
            alert("No changes to save.");
            return;
        }

        if (!validatedIntern) {
            alert("Please validate an intern first.");
            return;
        }

        const payload = {
            attemptDate: attemptToSave.attemptDate,
            answers: attemptToSave.answers.map(a => ({
                itemKey: a.itemKey,
                scoreValue: a.scoreValue,
                remark: a.remark || ''
            })),
            remarksOverall: attemptToSave.remarksOverall,
            patientName: attemptToSave.patientName,
            surgeryName: attemptToSave.surgeryName,
            gradeOfCataract: attemptToSave.gradeOfCataract,
            draping: attemptToSave.draping
        };

        try {
            let res;
            // Check if Editing existing or Creating new
            if (attemptToSave.isEditing) {
                // Use PUT logic (need to ensure API function exists or use axios directly? 
                // I'll check/add 'updateSurgeryAttempt' in next step if missing, assuming it imports now or I'll fix import.
                // For now, I'll assume I need to add it to imports at top.)
                // Wait, I need to check if 'updateSurgeryAttempt' is imported. It wasn't.
                // I will update the imports in a separate call or same call if possible.
                // To be safe, I'll use a direct API call or assume I'll fix services/evaluationApi.js next.
                // Let's assume `updateSurgeryAttempt` is available.
                // Used top-level import
                res = await updateSurgeryAttempt(validatedIntern._id, attemptToSave.attemptNumber, payload);
            } else {
                res = await addSurgeryAttempt(validatedIntern._id, payload);
            }

            if (res.success) {
                alert(`Saved Successfully! Grade: ${res.data.grade}`);
                setFormData({ patientName: '', surgeryName: '', gradeOfCataract: '', draping: '' });
                loadAttempts(validatedIntern._id);
            }
        } catch (err) {
            console.error(err);
            alert("Error saving: " + (err.error || err.message || err));
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-2">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Surgery Evaluation</h2>
                    <p className="text-gray-500 mt-1">Unit: General Surgery</p>
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
                        {/* Streak Display Removed */}
                    </div>
                </div>
            )}

            {validatedIntern ? (
                <>
                    {/* NEW ATTEMPT HEADER FORM */}
                    {!attempts.some(a => a.isNew) ? (
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4 animate-fade-in">
                            <h3 className="text-sm font-bold text-blue-800 uppercase mb-3 flex items-center gap-2"><UserCheck size={16} /> New Surgery Details</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <input
                                    type="text" placeholder="Patient Name"
                                    className="border p-2 rounded text-sm outline-none focus:ring-1 focus:ring-blue-400"
                                    value={formData.patientName} onChange={e => setFormData({ ...formData, patientName: e.target.value })}
                                />
                                <input
                                    type="text" placeholder="Surgery Name"
                                    className="border p-2 rounded text-sm outline-none focus:ring-1 focus:ring-blue-400"
                                    value={formData.surgeryName} onChange={e => setFormData({ ...formData, surgeryName: e.target.value })}
                                />
                                <input
                                    type="text" placeholder="Grade of Cataract"
                                    className="border p-2 rounded text-sm outline-none focus:ring-1 focus:ring-blue-400"
                                    value={formData.gradeOfCataract} onChange={e => setFormData({ ...formData, gradeOfCataract: e.target.value })}
                                />
                                <input
                                    type="text" placeholder="Draping"
                                    className="border p-2 rounded text-sm outline-none focus:ring-1 focus:ring-blue-400"
                                    value={formData.draping} onChange={e => setFormData({ ...formData, draping: e.target.value })}
                                />
                            </div>
                            {/* Trigger Add Attempt via Matrix indirectly or check if button needed? 
                             The MatrixEvaluation has 'onAddAttempt'. 
                             Actually, let's just show Matrix. 
                         */}
                        </div>
                    ) : (
                        <div className="bg-green-50 p-3 rounded mb-4 border border-green-200 test-sm text-green-800 font-medium">
                            Evaluating: {attempts.find(a => a.isNew).surgeryName} ({attempts.find(a => a.isNew).patientName})
                        </div>
                    )}

                    <div className="h-[600px] overflow-auto">
                        <MatrixEvaluation
                            type="score"
                            questions={surgeryQuestions}
                            attempts={attempts}
                            onAddAttempt={handleAddAttempt}
                            onUpdateCell={handleUpdateCell}
                        />
                    </div>

                    {attempts.some(a => a.isNew) && (
                        <div className="mt-4 flex justify-between items-center text-sm text-gray-600 bg-gray-50 p-3 rounded border border-gray-200">
                            <div>
                                <strong>Grading Scale:</strong> &ge;80% Excellent | &ge;50% Average | &lt;50% Poor
                            </div>
                            <button
                                onClick={handleSave}
                                className="bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                            >
                                <CheckCircle size={18} />
                                Save & Submit
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

export default SurgeryModule;
