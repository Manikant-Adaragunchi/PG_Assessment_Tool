import React, { useState, useEffect } from 'react';
import { addWetlabAttempt, getWetlabAttempts, validateIntern } from '../../services/evaluationApi';
import { Award, AlertCircle, CheckCircle, UserCheck } from 'lucide-react';

const WetLabModule = () => {
    // State
    const [internIdInput, setInternIdInput] = useState('');
    const [validatedIntern, setValidatedIntern] = useState(null);
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentStreak, setCurrentStreak] = useState(0);

    // Form
    const [formData, setFormData] = useState({
        exerciseName: '',
        procedureSteps: 0,
        tissueHandling: 0,
        timeManagement: 0,
        outcome: 0,
        remarks: ''
    });

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
            const res = await getWetlabAttempts(id);
            if (res.success) {
                const data = res.data || [];
                setAttempts(data);

                // Calc Streak
                let streak = 0;
                for (let i = data.length - 1; i >= 0; i--) {
                    if (data[i].grade === 'Excellent' || data[i].grade === 'Average') {
                        streak++;
                    } else {
                        break; // Strict streak
                    }
                }
                setCurrentStreak(streak);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!validatedIntern) return alert('Please verify an intern first.');
        if (!formData.exerciseName) return alert('Select Exercise');

        try {
            const payload = { ...formData };
            const res = await addWetlabAttempt(validatedIntern._id, payload);

            if (res.success) {
                alert(`Saved! Result: ${res.data.grade || 'N/A'}. Streak: ${res.data.currentStreak}. Status: ${res.data.status}`);
                loadAttempts(validatedIntern._id);
                setFormData({
                    exerciseName: '',
                    procedureSteps: 0,
                    tissueHandling: 0,
                    timeManagement: 0,
                    outcome: 0,
                    remarks: ''
                });
            }
        } catch (e) {
            alert('Error: ' + e.message);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-2">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Wet Lab Evaluation</h2>
                    <p className="text-gray-500 mt-1">Skills Lab / Simulation Exercises.</p>
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
                        {/* Streak Removed */}
                    </div>
                </div>
            )}

            {validatedIntern ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* LEFT COLUMN: FORM */}
                    <div className="bg-white p-6 rounded-xl shadow-card border border-surface-200">
                        <h3 className="font-bold text-lg mb-4 text-surface-800 border-b pb-2 flex items-center gap-2">
                            <UserCheck size={18} /> New Assessment
                        </h3>

                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-surface-600 mb-2">Exercise Name</label>
                            <select
                                className="input-field w-full p-2 border rounded"
                                value={formData.exerciseName}
                                onChange={(e) => handleChange('exerciseName', e.target.value)}
                            >
                                <option value="">Select Exercise...</option>
                                <option value="Suturing Basics">Suturing Basics</option>
                                <option value="Knot Tying">Knot Tying</option>
                                <option value="Laparoscopic Simulation">Laparoscopic Simulation</option>
                                <option value="Bowel Anastomosis">Bowel Anastomosis</option>
                                <option value="Catheterization">Catheterization</option>
                                <option value="Basic Life Support">Basic Life Support</option>
                            </select>
                        </div>

                        <div className="space-y-6 mb-8">
                            {['Procedure Steps', 'Tissue Handling', 'Time Management', 'Outcome'].map((label, idx) => {
                                const keys = ['procedureSteps', 'tissueHandling', 'timeManagement', 'outcome'];
                                const key = keys[idx];
                                const val = formData[key];

                                return (
                                    <div key={key}>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-sm font-medium text-surface-700">{label}</span>
                                            <span className="font-bold text-primary-600">{val}/5</span>
                                        </div>
                                        <input
                                            type="range" min="0" max="5" step="1"
                                            className="w-full h-2 bg-surface-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                            value={val}
                                            onChange={(e) => handleChange(key, parseInt(e.target.value))}
                                        />
                                        <div className="flex justify-between text-[10px] text-surface-400 mt-1">
                                            <span>Poor (0)</span>
                                            <span>Excellent (5)</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-surface-600 mb-2">Remarks</label>
                            <textarea
                                className="input-field h-24 resize-none w-full p-2 border rounded"
                                value={formData.remarks}
                                onChange={(e) => handleChange('remarks', e.target.value)}
                                placeholder="Observations..."
                            />
                        </div>

                        <div className="flex justify-between items-center text-xs text-gray-500 mb-4 bg-gray-50 p-2 rounded">
                            <span>Auto-Grading: &ge;16 Ex | &ge;10 Avg</span>
                        </div>

                        <button onClick={handleSubmit} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 shadow flex justify-center items-center gap-2">
                            <CheckCircle size={18} /> Save Assessment
                        </button>
                    </div>

                    {/* RIGHT COLUMN: HISTORY */}
                    <div className="bg-white p-6 rounded-xl shadow-card border border-surface-200">
                        <h3 className="font-bold text-lg mb-4 text-surface-800 border-b pb-2">History</h3>
                        {attempts.length === 0 ? (
                            <p className="text-surface-400 text-sm text-center py-8">No records found.</p>
                        ) : (
                            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                                {attempts.map((att, idx) => (
                                    <div key={idx} className="p-4 rounded-lg bg-surface-50 border border-surface-200 hover:border-blue-200 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-surface-800">{att.exerciseName}</h4>
                                            <div className="text-right">
                                                <span className="block text-xs text-surface-500">{new Date(att.date).toLocaleDateString()}</span>
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${att.status === 'PERMANENT' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                                                    {att.status || 'TEMPORARY'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 mb-2 flex-wrap">
                                            <span className={`badge ${att.grade === 'Excellent' ? 'bg-green-100 text-green-700' : att.grade === 'Average' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'} px-2 py-1 rounded text-xs font-bold`}>
                                                Grade: {att.grade || 'N/A'}
                                            </span>
                                            <span className="badge bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs border border-blue-100">
                                                Score: {att.totalScore}/20
                                            </span>
                                        </div>
                                        <p className="text-xs text-surface-600 italic">
                                            "{att.remarks || 'No remarks'}"
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                !loading && <div className="text-center p-12 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-500">
                    Verify an intern to start Wet Lab evaluation.
                </div>
            )}
        </div>
    );
};

export default WetLabModule;
