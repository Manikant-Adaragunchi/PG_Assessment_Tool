import React, { useState, useEffect } from 'react';
import { addWetlabAttempt, getWetlabAttempts, validateIntern, updateWetlabAttempt } from '../../services/evaluationApi';
import { Award, AlertCircle, CheckCircle, UserCheck, Activity, Scissors, PenTool, HeartPulse, Stethoscope, ArrowLeft } from 'lucide-react';

const WetLabModule = () => {
    // State
    const [internIdInput, setInternIdInput] = useState('');
    const [validatedIntern, setValidatedIntern] = useState(null);
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // UI Flow State
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [editingAttempt, setEditingAttempt] = useState(null);

    // Form
    const [formData, setFormData] = useState({
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
                // Reset flow
                setSelectedExercise(null);
                setEditingAttempt(null);
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
            if (res.success) setAttempts(res.data || []);
        } catch (e) {
            console.error(e);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleEditClick = (attempt) => {
        setEditingAttempt(attempt);
        setSelectedExercise(attempt.exerciseName);
        setFormData({
            procedureSteps: attempt.scores?.procedureSteps || 0,
            tissueHandling: attempt.scores?.tissueHandling || 0,
            timeManagement: attempt.scores?.timeManagement || 0,
            outcome: attempt.scores?.outcome || 0,
            remarks: attempt.remarks || ''
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingAttempt(null);
        setSelectedExercise(null);
        resetForm();
    };

    const resetForm = () => {
        setFormData({
            procedureSteps: 0,
            tissueHandling: 0,
            timeManagement: 0,
            outcome: 0,
            remarks: ''
        });
    };

    const handleSubmit = async () => {
        if (!validatedIntern) return alert('Please verify an intern first.');
        if (!selectedExercise) return alert('Select Exercise');

        const payload = { ...formData, exerciseName: selectedExercise };

        try {
            if (editingAttempt) {
                // UPDATE
                await updateWetlabAttempt(validatedIntern._id, editingAttempt.attemptNumber, payload);
                alert('Updated Successfully!');
                setEditingAttempt(null);
                setSelectedExercise(null); // Return to cards
            } else {
                // NEW
                const res = await addWetlabAttempt(validatedIntern._id, payload);
                if (res.success) {
                    alert(`Saved! Result: ${res.data.grade || 'N/A'}`);
                    setSelectedExercise(null);
                }
            }

            loadAttempts(validatedIntern._id);
            resetForm();
        } catch (e) {
            console.error('Save Error:', e);
            alert('Error: ' + (e.error || e.message || 'Operation failed'));
        }
    };

    // Card Configuration
    const EXERCISES = [
        { id: 'Suturing Basics', label: 'Suturing Basics', icon: <Scissors size={32} />, color: 'bg-indigo-100 text-indigo-600 border-indigo-200' },
        { id: 'Knot Tying', label: 'Knot Tying', icon: <Activity size={32} />, color: 'bg-pink-100 text-pink-600 border-pink-200' },
        { id: 'Laparoscopic Simulation', label: 'Laparoscopic Sim', icon: <PenTool size={32} />, color: 'bg-cyan-100 text-cyan-600 border-cyan-200' }, // PenTool looks a bit like a lap instrument
        { id: 'Bowel Anastomosis', label: 'Bowel Anastomosis', icon: <Stethoscope size={32} />, color: 'bg-amber-100 text-amber-600 border-amber-200' },
        { id: 'Catheterization', label: 'Catheterization', icon: <Activity size={32} />, color: 'bg-emerald-100 text-emerald-600 border-emerald-200' },
        { id: 'Basic Life Support', label: 'Basic Life Support', icon: <HeartPulse size={32} />, color: 'bg-rose-100 text-rose-600 border-rose-200' },
    ];

    const getExerciseLabel = (name) => EXERCISES.find(e => e.id === name)?.label || name;

    return (
        <div className="max-w-7xl mx-auto p-2">
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
                </div>
            )}

            {validatedIntern ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* LEFT COLUMN: SELECTION OR FORM */}
                    <div>
                        {!selectedExercise ? (
                            // SELECTION VIEW (Cards)
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-fade-in">
                                {EXERCISES.map(ex => (
                                    <button
                                        key={ex.id}
                                        onClick={() => setSelectedExercise(ex.id)}
                                        className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all hover:scale-105 shadow-sm hover:shadow-md ${ex.color} bg-white border-transparent hover:border-current min-h-[140px]`}
                                    >
                                        <div className={`p-2 rounded-full ${ex.color.split(' ')[0]}`}>{ex.icon}</div>
                                        <span className="font-bold text-sm text-center text-gray-800 leading-tight">{ex.label}</span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            // FORM VIEW
                            <div className="bg-white p-6 rounded-xl shadow-card border border-surface-200 animate-slide-up">
                                <h3 className="font-bold text-lg mb-4 text-surface-800 border-b pb-2 flex justify-between items-center">
                                    <span className="flex items-center gap-2">
                                        <button onClick={() => { setSelectedExercise(null); setEditingAttempt(null); resetForm(); }} className="mr-2 text-gray-500 hover:text-gray-800">
                                            <ArrowLeft size={20} />
                                        </button>
                                        {EXERCISES.find(e => e.id === selectedExercise)?.icon}
                                        {editingAttempt ? `Edit ${getExerciseLabel(selectedExercise)}` : `New ${getExerciseLabel(selectedExercise)}`}
                                    </span>
                                    {editingAttempt && (
                                        <button onClick={handleCancelEdit} className="text-xs text-red-600 hover:text-red-800 underline">Cancel Edit</button>
                                    )}
                                </h3>

                                <div className="space-y-6 mb-8">
                                    {['Procedure Steps', 'Tissue Handling', 'Time Management', 'Outcome'].map((label, idx) => {
                                        const keys = ['procedureSteps', 'tissueHandling', 'timeManagement', 'outcome'];
                                        const key = keys[idx];
                                        const val = formData[key];

                                        const colorClass = val < 3 ? 'accent-red-500' : 'accent-green-600';

                                        return (
                                            <div key={key}>
                                                <div className="flex justify-between mb-2">
                                                    <span className="text-sm font-medium text-surface-700">{label}</span>
                                                    <span className={`font-bold ${val < 3 ? 'text-red-500' : 'text-green-600'}`}>{val}/5</span>
                                                </div>
                                                <input
                                                    type="range" min="0" max="5" step="1"
                                                    className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer ${colorClass}`}
                                                    value={val}
                                                    onChange={(e) => handleChange(key, parseInt(e.target.value))}
                                                />
                                                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
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
                                        className="input-field h-24 resize-none w-full p-2 border rounded focus:ring-2 focus:ring-blue-100 outline-none"
                                        value={formData.remarks}
                                        onChange={(e) => handleChange('remarks', e.target.value)}
                                        placeholder="Observations..."
                                    />
                                </div>

                                <div className="flex justify-between items-center text-xs text-gray-500 mb-4 bg-gray-50 p-2 rounded border border-gray-100">
                                    <span>Auto-Grading: &ge;16 Ex | &ge;10 Avg</span>
                                    <span className="font-bold">Total: {Object.values(formData).reduce((a, b) => typeof b === 'number' ? a + b : a, 0)}/20</span>
                                </div>

                                <button onClick={handleSubmit} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 shadow flex justify-center items-center gap-2">
                                    <CheckCircle size={18} /> {editingAttempt ? 'Update Assessment' : 'Save Assessment'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: HISTORY */}
                    <div className="bg-white p-6 rounded-xl shadow-card border border-surface-200 h-fit">
                        <h3 className="font-bold text-lg mb-4 text-surface-800 border-b pb-2">History</h3>
                        {attempts.length === 0 ? (
                            <p className="text-surface-400 text-sm text-center py-8">No records found for this intern.</p>
                        ) : (
                            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                                {attempts.map((att, idx) => (
                                    <div key={idx} className="p-4 rounded-lg bg-surface-50 border border-surface-200 hover:border-blue-200 transition-colors group relative">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-bold text-surface-800">{att.exerciseName}</h4>
                                                <span className="text-xs text-surface-500">{new Date(att.date).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-end flex-col">
                                                <span className={`badge ${att.grade === 'Excellent' ? 'bg-green-100 text-green-700' : att.grade === 'Average' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'} px-2 py-0.5 rounded text-[10px] font-bold uppercase mb-1`}>
                                                    {att.grade || 'N/A'}
                                                </span>
                                                <span className="text-xs font-bold text-blue-600">
                                                    {att.totalScore}/20
                                                </span>
                                            </div>
                                        </div>

                                        <p className="text-xs text-surface-600 italic mt-2 border-t border-surface-200 pt-2">
                                            "{att.remarks || 'No remarks'}"
                                        </p>

                                        <button
                                            onClick={() => handleEditClick(att)}
                                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded hover:bg-blue-200 transition-opacity font-medium"
                                        >
                                            Edit
                                        </button>
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
