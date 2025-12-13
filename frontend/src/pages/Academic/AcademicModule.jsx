import React, { useState, useEffect } from 'react';
import { addAcademicAttempt, getAcademicAttempts } from '../../services/evaluationApi';

const AcademicModule = () => {
    const [internId, setInternId] = useState('');
    const [attempts, setAttempts] = useState([]); // List of past attempts
    const [formData, setFormData] = useState({
        topic: '',
        presentationQuality: 0,
        content: 0,
        qaHandling: 0,
        slidesQuality: 0,
        timing: 0,
        remarks: ''
    });

    // Fetch Attempts
    useEffect(() => {
        if (!internId) return;
        getAcademicAttempts(internId).then(res => {
            if (res.success) setAttempts(res.data);
        });
    }, [internId]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!internId) return alert('Enter Intern ID');
        try {
            await addAcademicAttempt(internId, formData);
            alert('Saved Successfully!');
            // Refresh
            const res = await getAcademicAttempts(internId);
            if (res.success) setAttempts(res.data);

            // Reset Form
            setFormData({
                topic: '',
                presentationQuality: 0,
                content: 0,
                qaHandling: 0,
                slidesQuality: 0,
                timing: 0,
                remarks: ''
            });
        } catch (e) {
            alert('Error: ' + e.message);
        }
    };

    const isLowScore = Object.entries(formData)
        .filter(([key, val]) => key !== 'topic' && key !== 'remarks')
        .some(([_, val]) => val < 3);

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Academic Evaluation</h2>
                    <p className="text-sm text-gray-500">Seminars, Journal Clubs, Case Presentations.</p>
                </div>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Intern ID"
                        className="input-field"
                        value={internId}
                        onChange={(e) => setInternId(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Form Section */}
                <div className="bg-white p-8 rounded-xl shadow-card border border-surface-100">
                    <h3 className="font-bold text-lg mb-4 text-surface-800 border-b pb-2">New Evaluation</h3>

                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-surface-600 mb-2">Topic / Title</label>
                        <input
                            type="text"
                            className="input-field"
                            value={formData.topic}
                            onChange={(e) => handleChange('topic', e.target.value)}
                            placeholder="e.g. Recent Advances in..."
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
                            className={`input-field h-32 resize-none ${isLowScore && !formData.remarks ? 'border-red-300 bg-red-50' : ''}`}
                            value={formData.remarks}
                            onChange={(e) => handleChange('remarks', e.target.value)}
                            placeholder=" overall feedback..."
                        />
                    </div>

                    <button onClick={handleSubmit} className="w-full btn-primary py-3">
                        Submit Evaluation
                    </button>
                </div>

                {/* History Section */}
                <div className="bg-white p-8 rounded-xl shadow-card border border-surface-100">
                    <h3 className="font-bold text-lg mb-4 text-surface-800 border-b pb-2">Past Evaluations</h3>
                    {attempts.length === 0 ? (
                        <p className="text-surface-400 text-sm text-center py-8">No records found for this intern.</p>
                    ) : (
                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                            {attempts.map((att, idx) => (
                                <div key={idx} className="p-4 rounded-lg bg-surface-50 border border-surface-200 hover:border-primary-200 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-surface-800">{att.topic || 'No Topic'}</h4>
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
                                    <div className="mt-2 text-[10px] text-surface-400 text-right">
                                        By: {att.facultyId?.fullName || 'Unknown'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AcademicModule;
