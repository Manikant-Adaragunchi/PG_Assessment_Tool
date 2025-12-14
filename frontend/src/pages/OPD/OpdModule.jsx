import React, { useState, useEffect } from 'react';
import { opdQuestions } from '../../utils/mockData';
import { getOpdAttempts, addOpdAttempt, validateIntern } from '../../services/evaluationApi';
import { CheckCircle, AlertCircle, Award, Plus, ArrowLeft, Activity, History } from 'lucide-react';

const OPD_PROCEDURES = [
    { id: 'LASER_GREEN', name: 'LASERS - GREEN', color: 'bg-green-50 border-green-200 text-green-700' },
    { id: 'LASER_YAG_CAP', name: 'LASERS - Nd: YAG CAPSULOTOMY', color: 'bg-red-50 border-red-200 text-red-700' },
    { id: 'LASER_YAG_IRI', name: 'LASERS - Nd: YAG IRIDOTOMY', color: 'bg-orange-50 border-orange-200 text-orange-700' },
    { id: 'SLIT_LAMP', name: 'SLIT LAMP EXAMINATION', color: 'bg-blue-50 border-blue-200 text-blue-700' },
    { id: 'DIRECT_OPHTH', name: 'DIRECT OPHTHALMOSCOPY', color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
    { id: 'INDIRECT_OPHTH', name: 'INDIRECT OPHTHALMOSCOPY', color: 'bg-purple-50 border-purple-200 text-purple-700' },
    { id: 'GOLDMAN', name: 'GOLDMAN APPLANATION TONOMETER', color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
    { id: 'GONIOSCOPY', name: 'GONIOSCOPY', color: 'bg-cyan-50 border-cyan-200 text-cyan-700' },
];

const OpdModule = () => {
    const MODULE_CODE = 'GENERAL_SURGERY_OPD';

    // State
    const [internIdInput, setInternIdInput] = useState('');
    const [validatedIntern, setValidatedIntern] = useState(null);
    const [attempts, setAttempts] = useState([]);
    const [streaks, setStreaks] = useState({}); // { 'PROCEDURE_NAME': 3 }
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [view, setView] = useState('list'); // 'list' | 'selection' | 'form'

    // Form State
    const [selectedProcedure, setSelectedProcedure] = useState(null);
    const [answers, setAnswers] = useState({}); // { key: { ynValue: '', remark: '' } }

    const handleValidate = async () => {
        if (!internIdInput) return;
        setLoading(true);
        setError(null);
        try {
            const res = await validateIntern(internIdInput);
            if (res.success) {
                setValidatedIntern(res.data);
                loadAttempts(res.data._id);
                setView('list');
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
                const fetchedAttempts = data.data || [];
                setAttempts(fetchedAttempts);
                calculateStreaks(fetchedAttempts);
            }
        } catch (err) {
            console.error("Failed to load attempts", err);
        }
    };

    const calculateStreaks = (allAttempts) => {
        const newStreaks = {};

        OPD_PROCEDURES.forEach(proc => {
            // Filter attempts for this procedure
            const procAttempts = allAttempts.filter(a => a.procedureName === proc.name);
            // Sort by date ascending
            const sorted = procAttempts.sort((a, b) => new Date(a.attemptDate) - new Date(b.attemptDate));

            let streak = 0;
            // Iterate backwards
            for (let i = sorted.length - 1; i >= 0; i--) {
                if (sorted[i].result === 'PASS') {
                    streak++;
                } else {
                    break;
                }
            }
            newStreaks[proc.name] = streak;
        });

        setStreaks(newStreaks);
    };

    const handleNewEvaluation = () => {
        setView('selection');
    };

    const handleProcedureSelect = (proc) => {
        setSelectedProcedure(proc);
        // Initialize answers
        const initAnswers = {};
        opdQuestions.forEach(q => {
            initAnswers[q.key] = { ynValue: '', remark: '' };
        });
        setAnswers(initAnswers);
        setView('form');
    };

    const handleAnswerChange = (key, field, value) => {
        setAnswers(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                [field]: value
            }
        }));
    };

    const handleSave = async () => {
        if (!validatedIntern) return;

        // Auto-Calculate Grade
        const totalQuestions = opdQuestions.length;
        let yesCount = 0;
        let allAnswered = true;

        Object.keys(answers).forEach(k => {
            if (!answers[k].ynValue) allAnswered = false;
            if (answers[k].ynValue === 'Y') yesCount++;
        });

        if (!allAnswered) {
            if (!window.confirm("Some items are not marked. Assume 'No' for unmarked?")) return;
        }

        let calculatedGrade = 'Below Average';
        let result = 'FAIL';

        if (yesCount === totalQuestions) {
            calculatedGrade = 'Excellent';
            result = 'PASS';
        } else if (yesCount >= totalQuestions * 0.8) {
            calculatedGrade = 'Good';
            result = 'PASS';
        } else if (yesCount >= totalQuestions * 0.5) {
            calculatedGrade = 'Average';
            result = 'FAIL'; // Only Excellent/Good is PASS usually? Or Average is PASS? 
            // Let's assume Average is PASS for now, or maybe PASS needs 80%? 
            // Previous logic in opd.controller said: if (grade === 'Average') result = 'FAIL'? 
            // Actually, let's stick to simple: >= 50% is PASS but streak usually requires Excellent/Good?
            // Let's set PASS if >= 50% (Average+) for now unless user specified stricter.
            result = 'PASS';
        }

        // However, standard Competency usually requires 100% or high standard. 
        // Let's strictly follow: Excellent/Good = PASS, Average/Below = FAIL for streaks?
        // For now, I'll pass 'result' calculated here or let backend calc it?
        // Backend 'addAttempt' logic:
        // const addAttempt = async (req, res) => { ... let isPass = true; ... if (ans.ynValue === 'N') isPass = false; ... }
        // Wait, backend logic in `opd.controller.js` (which I viewed earlier) calculates result based on 'N'.
        // "if (ans.ynValue === 'N') isPass = false;" -> So ANY 'N' means FAIL.
        // So my frontend calc grade is just for display, backend determines PASS/FAIL.
        // I will rely on backend result.

        const payload = {
            attemptDate: new Date().toISOString(),
            procedureName: selectedProcedure.name,
            grade: calculatedGrade, // Backend might overwrite this or use it
            answers: Object.keys(answers).map(k => ({
                itemKey: k,
                ynValue: answers[k].ynValue || 'N',
                remark: answers[k].remark || ''
            }))
        };

        try {
            console.log("Sending payload:", payload);
            const res = await addOpdAttempt(MODULE_CODE, validatedIntern._id, payload);
            console.log("Response:", res);
            if (res.success) {
                alert(`Saved Successfully!\nResult: ${res.data.result}\nStatus: ${res.data.status}`);
                loadAttempts(validatedIntern._id);
                setView('list');
            } else {
                alert("Save failed: " + (res.error || "Unknown error"));
            }
        } catch (err) {
            console.error("Save Error:", err);
            alert("Error saving: " + (err.error || err.message));
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">OPD Evaluation</h2>
                    <p className="text-gray-500 text-sm">Unit: General Surgery OPD</p>
                </div>
            </div>

            {/* Validation Bar */}
            {!validatedIntern ? (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center max-w-md mx-auto mt-12">
                    <h3 className="text-lg font-bold text-gray-700 mb-4">Select Intern</h3>
                    <div className="flex gap-2">
                        <input
                            className="flex-1 border p-2 rounded outline-none focus:ring-2 ring-blue-500"
                            placeholder="Registration No / ID"
                            value={internIdInput}
                            onChange={(e) => setInternIdInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleValidate()}
                        />
                        <button onClick={handleValidate} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700">
                            {loading ? '...' : 'Verify'}
                        </button>
                    </div>
                    {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
                </div>
            ) : (
                <div className="flex flex-col gap-6">
                    {/* Header Card */}
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-200 text-blue-800 w-10 h-10 rounded-full flex items-center justify-center font-bold">
                                {validatedIntern.fullName[0]}
                            </div>
                            <div>
                                <h3 className="font-bold text-blue-900">{validatedIntern.fullName}</h3>
                                <p className="text-xs text-blue-700">Reg: {validatedIntern.regNo}</p>
                            </div>
                        </div>
                    </div>

                    {/* VIEW: LIST */}
                    {view === 'list' && (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                                    <History size={18} /> OPD History
                                </h3>
                                <button
                                    onClick={handleNewEvaluation}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
                                >
                                    <Plus size={18} /> New Evaluation
                                </button>
                            </div>

                            {attempts.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-500">
                                    No evaluations yet. Click "New Evaluation" to start.
                                </div>
                            ) : (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase border-b border-gray-200">
                                            <tr>
                                                <th className="p-4">#</th>
                                                <th className="p-4">Date</th>
                                                <th className="p-4">Procedure</th>
                                                <th className="p-4">Grade</th>
                                                <th className="p-4">Result</th>
                                                <th className="p-4">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {attempts.map((att, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50">
                                                    <td className="p-4 font-mono text-xs text-gray-500">{att.attemptNumber}</td>
                                                    <td className="p-4 text-sm">{new Date(att.attemptDate).toLocaleDateString()}</td>
                                                    <td className="p-4 font-medium text-gray-800">{att.procedureName || 'General OPD'}</td>
                                                    <td className="p-4">
                                                        <span className={`text-xs px-2 py-1 rounded font-bold ${att.grade === 'Excellent' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                            {att.grade}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`text-xs font-bold ${att.result === 'PASS' ? 'text-green-600' : 'text-red-500'}`}>
                                                            {att.result}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-xs text-gray-500">{att.status}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* VIEW: SELECTION */}
                    {view === 'selection' && (
                        <div className="animate-fade-in">
                            <div className="mb-4 flex items-center gap-4">
                                <button onClick={() => setView('list')} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
                                    <ArrowLeft size={20} />
                                </button>
                                <h3 className="font-bold text-xl text-gray-800">Select Procedure</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {OPD_PROCEDURES.map(proc => (
                                    <button
                                        key={proc.id}
                                        onClick={() => handleProcedureSelect(proc)}
                                        className={`p-6 rounded-xl border-2 transition-all hover:scale-105 active:scale-95 text-left flex flex-col justify-between h-40 ${proc.color} hover:shadow-md cursor-pointer relative overflow-hidden`}
                                    >
                                        <div className="font-bold text-sm tracking-wide uppercase pr-8 mb-2 whitespace-normal break-words h-12 flex items-start">
                                            {proc.name}
                                        </div>

                                        <div className="flex justify-between items-end mt-4">
                                            <div className="bg-white/80 p-2 rounded-lg text-xs font-bold flex flex-col items-center shadow-sm">
                                                <span className="text-gray-500 text-[10px] uppercase">Streak</span>
                                                <span className={`text-lg leading-none ${streaks[proc.name] > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                                                    {streaks[proc.name] || 0}
                                                </span>
                                            </div>
                                            <div className="bg-white/50 p-2 rounded-full">
                                                <Activity size={20} />
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* VIEW: FORM */}
                    {view === 'form' && selectedProcedure && (
                        <div className="animate-fade-in">
                            <div className="mb-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setView('selection')} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
                                        <ArrowLeft size={20} />
                                    </button>
                                    <div>
                                        <h3 className="font-bold text-xl text-gray-800">New Evaluation</h3>
                                        <p className="text-blue-600 font-medium text-sm">{selectedProcedure.name}</p>
                                    </div>
                                </div>
                                <div className="bg-yellow-50 px-4 py-2 rounded-lg border border-yellow-100 flex items-center gap-2">
                                    <Award size={18} className="text-yellow-600" />
                                    <span className="text-sm font-bold text-yellow-800">
                                        Streak: {streaks[selectedProcedure.name] || 0}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="p-4 bg-gray-50 border-b border-gray-200 font-bold text-gray-700 flex justify-between">
                                    <span>Core Competencies Check</span>
                                    <span className="text-xs font-normal text-gray-500 bg-gray-200 px-2 py-1 rounded">Yes/No Required</span>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {opdQuestions.map(q => (
                                        <div key={q.key} className="p-4 flex flex-col md:flex-row gap-4 md:items-center hover:bg-gray-50/50">
                                            <div className="flex-1 font-medium text-gray-800">{q.label}</div>
                                            <div className="flex gap-4 items-center">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleAnswerChange(q.key, 'ynValue', 'Y')}
                                                        className={`px-4 py-2 rounded border font-bold text-sm transition-colors ${answers[q.key]?.ynValue === 'Y' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                                                    >
                                                        YES
                                                    </button>
                                                    <button
                                                        onClick={() => handleAnswerChange(q.key, 'ynValue', 'N')}
                                                        className={`px-4 py-2 rounded border font-bold text-sm transition-colors ${answers[q.key]?.ynValue === 'N' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                                                    >
                                                        NO
                                                    </button>
                                                </div>
                                                <input
                                                    className="border p-2 rounded text-sm w-48 outline-none focus:ring-1 focus:ring-blue-500"
                                                    placeholder="Remarks..."
                                                    value={answers[q.key]?.remark || ''}
                                                    onChange={(e) => handleAnswerChange(q.key, 'remark', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end">
                                    <button
                                        onClick={handleSave}
                                        className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 font-bold shadow-lg shadow-green-200 transition-all flex items-center gap-2"
                                    >
                                        <CheckCircle size={20} />
                                        Complete Evaluation
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default OpdModule;
