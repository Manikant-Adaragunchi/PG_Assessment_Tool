import React, { useState, useEffect } from 'react';
import { addWetlabAttempt, getWetlabAttempts } from '../../services/evaluationApi';

const WetLabModule = () => {
    const [internId, setInternId] = useState('');
    const [attempts, setAttempts] = useState([]);
    const [formData, setFormData] = useState({
        exerciseName: '',
        procedureSteps: 0,
        tissueHandling: 0,
        timeManagement: 0,
        outcome: 0,
        remarks: ''
    });

    useEffect(() => {
        if (!internId) return;
        getWetlabAttempts(internId).then(res => {
            if (res.success) setAttempts(res.data);
        });
    }, [internId]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!internId) return alert('Enter Intern ID');
        try {
            await addWetlabAttempt(internId, formData);
            alert('Saved Successfully!');
            const res = await getWetlabAttempts(internId);
            if (res.success) setAttempts(res.data);

            setFormData({
                exerciseName: '',
                procedureSteps: 0,
                tissueHandling: 0,
                timeManagement: 0,
                outcome: 0,
                remarks: ''
            });
        } catch (e) {
            alert('Error: ' + e.message);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Wet Lab Evaluation</h2>
                    <p className="text-sm text-gray-500">Skills Lab / Simulation Exercises.</p>
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
                <div className="bg-white p-8 rounded-xl shadow-card border border-surface-100">
                    <h3 className="font-bold text-lg mb-4 text-surface-800 border-b pb-2">New Assessment</h3>

                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-surface-600 mb-2">Exercise Name</label>
                        <select
                            className="input-field"
                            value={formData.exerciseName}
                            onChange={(e) => handleChange('exerciseName', e.target.value)}
                        >
                            <option value="">Select Exercise...</option>
                            <option value="Suturing Basics">Suturing Basics</option>
                            <option value="Knot Tying">Knot Tying</option>
                            <option value="Laparoscopic Simulation">Laparoscopic Simulation</option>
                            <option value="Bowel Anastomosis">Bowel Anastomosis</option>
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
                                        className="w-full h-2 bg-surface-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
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
                            className="input-field h-24 resize-none"
                            value={formData.remarks}
                            onChange={(e) => handleChange('remarks', e.target.value)}
                            placeholder="Observations..."
                        />
                    </div>

                    <button onClick={handleSubmit} className="w-full btn-primary py-3">
                        Save Assessment
                    </button>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-card border border-surface-100">
                    <h3 className="font-bold text-lg mb-4 text-surface-800 border-b pb-2">History</h3>
                    {attempts.length === 0 ? (
                        <p className="text-surface-400 text-sm text-center py-8">No records found.</p>
                    ) : (
                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                            {attempts.map((att, idx) => (
                                <div key={idx} className="p-4 rounded-lg bg-surface-50 border border-surface-200 hover:border-primary-200 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-surface-800">{att.exerciseName}</h4>
                                        <span className="text-xs text-surface-500">{new Date(att.date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex gap-2 mb-2">
                                        <span className="badge bg-green-100 text-green-700">Outcome: {att.scores?.outcome}/5</span>
                                        <span className="badge bg-blue-100 text-blue-700">Handling: {att.scores?.tissueHandling}/5</span>
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
        </div>
    );
};

export default WetLabModule;
