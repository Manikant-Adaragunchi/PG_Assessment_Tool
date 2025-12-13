import React, { useState, useEffect } from 'react';
import MatrixEvaluation from '../../components/matrix/MatrixEvaluation';
import { surgeryQuestions } from '../../utils/mockData';
import { getSurgeryAttempts, addSurgeryAttempt } from '../../services/evaluationApi';

const SurgeryModule = () => {
    const [internId, setInternId] = useState('');
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Form Fields for New Attempt
    const [formData, setFormData] = useState({
        patientName: '',
        surgeryName: '',
        gradeOfCataract: '',
        draping: ''
    });

    // Load attempts when internId is set
    useEffect(() => {
        if (!internId) return;
        const loadAttempts = async () => {
            setLoading(true);
            try {
                const data = await getSurgeryAttempts(internId);
                if (data.success) {
                    const mapped = data.data.map(a => ({
                        attemptNumber: a.attemptNumber,
                        attemptDate: a.date,
                        status: a.status,
                        remarksOverall: a.remarks,
                        answers: a.scores.map(s => ({
                            itemKey: s.questionId,
                            scoreValue: s.score,
                            remark: s.remarks
                        })),
                        // New Fields from backend
                        patientName: a.patientName,
                        surgeryName: a.surgeryName,
                        gradeOfCataract: a.gradeOfCataract,
                        draping: a.draping,
                        grade: a.grade,
                        totalScore: a.totalScore
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
            // Header Data
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
            alert("No new attempt to save.");
            return;
        }

        if (!internId) {
            alert("Please enter an Intern ID first.");
            return;
        }

        // Validate all 19 items are scored
        if (attemptToSave.answers.length < surgeryQuestions.length) {
            const missed = surgeryQuestions.length - attemptToSave.answers.length;
            if (!window.confirm(`You have only scored ${attemptToSave.answers.length} out of ${surgeryQuestions.length} items. Are you sure?`)) return;
        }

        const payload = {
            date: attemptToSave.attemptDate,
            scores: attemptToSave.answers.map(a => ({
                questionId: a.itemKey,
                score: a.scoreValue,
                remarks: a.remark || ''
            })),
            remarks: attemptToSave.remarksOverall,
            // New Payload Fields
            patientName: attemptToSave.patientName,
            surgeryName: attemptToSave.surgeryName,
            gradeOfCataract: attemptToSave.gradeOfCataract,
            draping: attemptToSave.draping
        };

        try {
            await addSurgeryAttempt(internId, payload);
            alert("Evaluation Saved Successfully!");
            // Reset Form
            setFormData({ patientName: '', surgeryName: '', gradeOfCataract: '', draping: '' });

            // Refresh
            const data = await getSurgeryAttempts(internId);
            if (data.success) {
                // ... mapping logic repeated (ideal to refactor to getter)
                const mapped = data.data.map(a => ({
                    attemptNumber: a.attemptNumber,
                    attemptDate: a.date,
                    status: a.status,
                    remarksOverall: a.remarks,
                    answers: a.scores.map(s => ({
                        itemKey: s.questionId,
                        scoreValue: s.score,
                        remark: s.remarks
                    })),
                    patientName: a.patientName,
                    surgeryName: a.surgeryName,
                    gradeOfCataract: a.gradeOfCataract,
                    draping: a.draping,
                    grade: a.grade,
                    totalScore: a.totalScore
                }));
                setAttempts(mapped);
            }
        } catch (err) {
            alert("Error saving: " + (err.error || err.message));
        }
    };

    // Check if assessment is already completed (Strict 1 attempt)
    const assessmentCompleted = attempts.length > 0;
    const latestAttempt = attempts[attempts.length - 1];

    return (
        <div>
            <div className="flex flex-col gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Surgery Evaluation</h2>
                    <p className="text-sm text-gray-500">Enter Intern ID to manage evaluations. (Strict: Single Attempt Only)</p>
                </div>

                <div className="flex gap-4 items-end bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Intern ID</label>
                        <input
                            type="text"
                            placeholder="Enter Intern Mongo ID"
                            className="border p-2 rounded w-64"
                            value={internId}
                            onChange={(e) => setInternId(e.target.value)}
                        />
                    </div>
                </div>

                {/* SHOW REPORT IF COMPLETED */}
                {assessmentCompleted && latestAttempt && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 shadow-sm mb-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-green-800 flex items-center gap-2">
                                ✅ Assessment Completed
                            </h3>
                            <div className="text-right">
                                <span className="block text-xs uppercase font-bold text-gray-500">Date</span>
                                <span className="font-mono text-gray-700">{new Date(latestAttempt.attemptDate).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white p-4 rounded-md border border-green-100">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase">Patient Name</label>
                                <p className="text-lg font-semibold text-gray-900">{latestAttempt.patientName || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase">Surgery</label>
                                <p className="text-lg font-semibold text-gray-900">{latestAttempt.surgeryName || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase">Total Score</label>
                                <p className="text-2xl font-bold text-blue-600">{latestAttempt.totalScore} <span className="text-sm text-gray-400 font-normal">/ 95</span></p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase">Grade</label>
                                <span className={`inline-block px-3 py-1 rounded text-sm font-bold ${latestAttempt.grade === 'Excellent' ? 'bg-green-100 text-green-700' :
                                    latestAttempt.grade === 'Average' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                    {latestAttempt.grade || 'Pending'}
                                </span>
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="block text-xs font-bold text-gray-500 uppercase">Faculty Remarks</label>
                            <p className="text-gray-700 italic border-l-4 border-gray-300 pl-3 py-1 bg-gray-50/50 mt-1">
                                {latestAttempt.remarksOverall || "No remarks provided."}
                            </p>
                        </div>
                    </div>
                )}

                {/* SHOW FORM INPUTS ONLY IF NOT COMPLETED */}
                {!assessmentCompleted && internId && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <h3 className="text-sm font-bold text-blue-800 uppercase mb-3">New Surgery Details</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <input
                                type="text" placeholder="Patient Name"
                                className="border p-2 rounded text-sm"
                                value={formData.patientName} onChange={e => setFormData({ ...formData, patientName: e.target.value })}
                            />
                            <input
                                type="text" placeholder="Surgery Name"
                                className="border p-2 rounded text-sm"
                                value={formData.surgeryName} onChange={e => setFormData({ ...formData, surgeryName: e.target.value })}
                            />
                            <input
                                type="text" placeholder="Grade of Cataract"
                                className="border p-2 rounded text-sm"
                                value={formData.gradeOfCataract} onChange={e => setFormData({ ...formData, gradeOfCataract: e.target.value })}
                            />
                            <input
                                type="text" placeholder="Draping"
                                className="border p-2 rounded text-sm"
                                value={formData.draping} onChange={e => setFormData({ ...formData, draping: e.target.value })}
                            />
                        </div>
                    </div>
                )}
            </div>

            {loading && <div>Loading records...</div>}

            {!loading && !assessmentCompleted && (
                <div className="h-[600px] overflow-auto">
                    {/* Matrix View */}
                    <MatrixEvaluation
                        type="score"
                        questions={surgeryQuestions}
                        attempts={attempts}
                        onAddAttempt={handleAddAttempt}
                        onUpdateCell={handleUpdateCell}
                    />
                </div>
            )}

            <div className="mt-4 flex justify-between items-center text-sm text-gray-600 bg-gray-50 p-3 rounded">
                <div>
                    <strong>Grading Scale:</strong> &ge;80% Excellent | &ge;50% Average | &lt;50% Poor
                </div>
                {!assessmentCompleted && (
                    <button
                        onClick={handleSave}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-semibold shadow-sm"
                    >
                        Save Evaluation
                    </button>
                )}
            </div>
        </div>
    );
};

export default SurgeryModule;
