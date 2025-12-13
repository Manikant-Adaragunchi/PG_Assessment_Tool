import React, { useState, useEffect } from 'react';
import { addAcademicAttempt, getAcademicAttempts, validateIntern } from '../../services/evaluationApi';
import api from '../../services/api';
import { CheckCircle, AlertCircle, UserCheck, BookOpen, FileText, MonitorPlay, ArrowLeft } from 'lucide-react';

const AcademicModule = () => {
    // State
    const [internIdInput, setInternIdInput] = useState('');
    const [validatedIntern, setValidatedIntern] = useState(null);
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // UI Flow State
    const [selectedType, setSelectedType] = useState(null); // 'SEMINAR', 'CASE_PRESENTATION', 'JOURNAL_CLUB'

    const [formData, setFormData] = useState({
        topic: '',
        presentationQuality: 0,
        content: 0,
        qaHandling: 0,
        slidesQuality: 0,
        timing: 0,
        remarks: ''
    });

    // Editing integration
    const [editingAttempt, setEditingAttempt] = useState(null);

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
                setSelectedType(null);
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
            const res = await getAcademicAttempts(id);
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
        setSelectedType(attempt.evaluationType || 'SEMINAR'); // Fallback if missing
        setFormData({
            topic: attempt.topic || '',
            presentationQuality: attempt.scores?.presentationQuality || 0,
            content: attempt.scores?.content || 0,
            qaHandling: attempt.scores?.qaHandling || 0,
            slidesQuality: attempt.scores?.slidesQuality || 0,
            timing: attempt.scores?.timing || 0,
            remarks: attempt.remarks || ''
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingAttempt(null);
        setSelectedType(null); // Go back to selection
        resetForm();
    };

    const resetForm = () => {
        setFormData({
            topic: '',
            presentationQuality: 0,
            content: 0,
            qaHandling: 0,
            slidesQuality: 0,
            timing: 0,
            remarks: ''
        });
    };

    const handleSubmit = async () => {
        if (!validatedIntern) return alert('Please verify an intern first.');
        if (!formData.topic) return alert('Enter Topic');
        if (!selectedType) return alert('No Evaluation Type Selected');

        const payload = { ...formData, evaluationType: selectedType };

        try {
            if (editingAttempt) {
                // PUT Update
                await api.put(`/academic/${validatedIntern._id}/attempts/${editingAttempt.attemptNumber}`, payload);
                alert('Updated Successfully!');
                setEditingAttempt(null);
                setSelectedType(null); // Return to cards
            } else {
                // Create New
                await addAcademicAttempt(validatedIntern._id, payload);
                alert('Saved Successfully!');
                // keeping type selected for rapid entry? Or reset?
                // Let's reset to allow choosing another type or same.
                setSelectedType(null);
            }

            loadAttempts(validatedIntern._id);
            resetForm();
        } catch (e) {
            alert('Error: ' + (e.response?.data?.error || e.message));
        }
    };

    const isLowScore = Object.entries(formData)
        .filter(([key, val]) => key !== 'topic' && key !== 'remarks')
        .some(([_, val]) => val < 3);

    // Cards Configuration
    const EVAL_TYPES = [
        { id: 'SEMINAR', label: 'Seminar', icon: <MonitorPlay size={32} />, color: 'bg-purple-100 text-purple-600 border-purple-200' },
        { id: 'CASE_PRESENTATION', label: 'Case Presentation', icon: <UserCheck size={32} />, color: 'bg-blue-100 text-blue-600 border-blue-200' },
        { id: 'JOURNAL_CLUB', label: 'Journal Club', icon: <BookOpen size={32} />, color: 'bg-orange-100 text-orange-600 border-orange-200' },
    ];

    const getTypeName = (type) => EVAL_TYPES.find(t => t.id === type)?.label || type;

    return (
        <div className="max-w-7xl mx-auto p-2">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Academic Evaluation</h2>
                    <p className="text-gray-500 mt-1">Select an activity to evaluate.</p>
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
                        {!selectedType ? (
                            // SELECTION VIEW
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                                {EVAL_TYPES.map(type => (
                                    <button
                                        key={type.id}
                                        onClick={() => setSelectedType(type.id)}
                                        className={`p-6 rounded-xl border-2 flex flex-col items-center justify-center gap-3 transition-all hover:scale-105 shadow-sm hover:shadow-md ${type.color} bg-white border-transparent hover:border-current`}
                                    >
                                        <div className={`p-3 rounded-full ${type.color.split(' ')[0]}`}>{type.icon}</div>
                                        <span className="font-bold text-lg text-gray-800">{type.label}</span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            // FORM VIEW
                            <div className="bg-white p-6 rounded-xl shadow-card border border-surface-200 animate-slide-up">
                                <h3 className="font-bold text-lg mb-4 text-surface-800 border-b pb-2 flex justify-between items-center">
                                    <span className="flex items-center gap-2">
                                        <button onClick={() => { setSelectedType(null); setEditingAttempt(null); resetForm(); }} className="mr-2 text-gray-500 hover:text-gray-800">
                                            <ArrowLeft size={20} />
                                        </button>
                                        {EVAL_TYPES.find(t => t.id === selectedType)?.icon}
                                        {editingAttempt ? `Edit ${getTypeName(selectedType)}` : `New ${getTypeName(selectedType)}`}
                                    </span>
                                    {editingAttempt && (
                                        <button onClick={handleCancelEdit} className="text-xs text-red-600 hover:text-red-800 underline">Cancel Edit</button>
                                    )}
                                </h3>

                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-surface-600 mb-2">Topic / Title</label>
                                    <input
                                        type="text"
                                        className="input-field w-full p-2 border rounded"
                                        value={formData.topic}
                                        onChange={(e) => handleChange('topic', e.target.value)}
                                        placeholder="e.g. Overview of..."
                                    />
                                </div>

                                <div className="space-y-6 mb-8">
                                    {['Presentation Quality', 'Content Depth', 'Q&A Handling', 'Slides Quality', 'Timing'].map((label, idx) => {
                                        const keys = ['presentationQuality', 'content', 'qaHandling', 'slidesQuality', 'timing'];
                                        const key = keys[idx];
                                        const val = formData[key];
                                        const low = val < 3 && val > 0;

                                        return (
                                            <div key={key}>
                                                <div className="flex justify-between mb-2">
                                                    <span className={`text-sm font-medium ${low ? 'text-red-600' : 'text-surface-700'}`}>{label}</span>
                                                    <span className="font-bold text-primary-600">{val}/5</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    {[1, 2, 3, 4, 5].map(num => (
                                                        <button
                                                            key={num}
                                                            onClick={() => handleChange(key, num)}
                                                            className={`flex-1 h-9 rounded-lg font-bold text-sm transition-all ${val === num
                                                                ? (num < 3 ? 'bg-red-500 text-white shadow-md' : 'bg-primary-600 text-white shadow-md')
                                                                : 'bg-surface-50 border border-surface-200 hover:bg-surface-100 text-surface-600'
                                                                }`}
                                                        >
                                                            {num}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-surface-600 mb-2">
                                        Remarks
                                        {isLowScore && <span className="text-red-500 text-xs ml-2 font-bold">* Required (Low Score)</span>}
                                    </label>
                                    <textarea
                                        className={`input-field h-32 resize-none w-full p-2 border rounded ${isLowScore && !formData.remarks ? 'border-red-300 bg-red-50' : ''}`}
                                        value={formData.remarks}
                                        onChange={(e) => handleChange('remarks', e.target.value)}
                                        placeholder="Overall feedback..."
                                    />
                                </div>

                                <button onClick={handleSubmit} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 shadow flex justify-center items-center gap-2">
                                    <CheckCircle size={18} /> {editingAttempt ? 'Update Evaluation' : 'Submit Evaluation'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: HISTORY */}
                    <div className="bg-white p-6 rounded-xl shadow-card border border-surface-200 h-fit">
                        <h3 className="font-bold text-lg mb-4 text-surface-800 border-b pb-2">Past Evaluations</h3>
                        {attempts.length === 0 ? (
                            <p className="text-surface-400 text-sm text-center py-8">No records found for this intern.</p>
                        ) : (
                            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                                {attempts.map((att, idx) => (
                                    <div key={idx} className="p-4 rounded-lg bg-surface-50 border border-surface-200 hover:border-blue-200 transition-colors group relative">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 mb-1 block w-fit">
                                                    {getTypeName(att.evaluationType)}
                                                </span>
                                                <h4 className="font-bold text-surface-800">{att.topic || 'No Topic'}</h4>
                                            </div>
                                            <span className="text-xs text-surface-500">{new Date(att.date).toLocaleDateString()}</span>
                                        </div>
                                        {/* Mini Score Grid */}
                                        <div className="grid grid-cols-5 gap-1 mb-3">
                                            {Object.entries(att.scores || {}).map(([k, v]) => (
                                                <div key={k} className="text-center">
                                                    <div className={`text-xs font-bold ${v < 3 ? 'text-red-600' : 'text-primary-600'}`}>{v}</div>
                                                    <div className="text-[9px] uppercase text-surface-400 truncate">{k.slice(0, 4)}</div>
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-xs text-surface-600 italic border-t border-surface-200 pt-2">
                                            "{att.remarks || 'No remarks'}"
                                        </p>

                                        <button
                                            onClick={() => handleEditClick(att)}
                                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded hover:bg-blue-200 transition-opacity"
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
                    Verify an intern to start Academic evaluation.
                </div>
            )}
        </div>
    );
};

export default AcademicModule;
