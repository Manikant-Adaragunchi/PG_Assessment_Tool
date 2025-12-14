import React, { useState, useEffect } from 'react';
import { getSurgeryAttempts, addSurgeryAttempt, validateIntern } from '../../services/evaluationApi';
import { Plus, CheckCircle, AlertCircle, History, ArrowLeft, FileText } from 'lucide-react';

const REDUCED_SURGERY_QUESTIONS = [
    { key: 'incision', label: 'Incision & Tunnel Construction' },
    { key: 'capsulorrhexis', label: 'Capsulorrhexis (CCC)' },
    { key: 'nucleus_management', label: 'Nucleus Management & Extraction' },
    { key: 'iol_implantation', label: 'IOL Implantation' },
    { key: 'wound_closure', label: 'Wound Closure & Integrity' }
];

const SurgeryModule = () => {
    const [internIdInput, setInternIdInput] = useState('');
    const [validatedIntern, setValidatedIntern] = useState(null);
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [view, setView] = useState('list'); // 'list' | 'form'

    // Form State
    const [formData, setFormData] = useState({
        patientName: '',
        surgeryName: '',
        gradeOfCataract: '',
        draping: '',
        scores: {}, // { key: { score: 0, remark: '' } }
        remarksOverall: ''
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
            const data = await getSurgeryAttempts(id);
            if (data.success) {
                setAttempts(data.data);
            }
        } catch (err) {
            console.error(err);
            setError('Failed to load attempts');
        }
    };

    const handleNewEvaluation = () => {
        setFormData({
            patientName: '',
            surgeryName: '',
            gradeOfCataract: '',
            draping: '',
            scores: REDUCED_SURGERY_QUESTIONS.reduce((acc, q) => ({ ...acc, [q.key]: { score: 0, remark: '' } }), {}),
            remarksOverall: ''
        });
        setView('form');
    };

    const handleScoreChange = (key, field, value) => {
        setFormData(prev => ({
            ...prev,
            scores: {
                ...prev.scores,
                [key]: {
                    ...prev.scores[key],
                    [field]: field === 'score' ? parseInt(value) : value
                }
            }
        }));
    };

    const handleSubmit = async () => {
        if (!formData.patientName || !formData.surgeryName) {
            alert('Please enter Patient Name and Surgery Name');
            return;
        }

        // Convert scores to array format matching backend schema if needed
        // Backend expects: items array with itemKey, scoreValue, remark
        const answers = Object.keys(formData.scores).map(key => ({
            itemKey: key,
            scoreValue: formData.scores[key].score,
            remark: formData.scores[key].remark
        }));

        const payload = {
            attemptDate: new Date().toISOString(),
            patientName: formData.patientName,
            surgeryName: formData.surgeryName,
            gradeOfCataract: formData.gradeOfCataract,
            draping: formData.draping,
            answers,
            remarksOverall: formData.remarksOverall
        };

        try {
            const res = await addSurgeryAttempt(validatedIntern._id, payload);
            if (res.success) {
                alert('Surgery Logged Successfully!');
                loadAttempts(validatedIntern._id);
                setView('list');
            }
        } catch (err) {
            alert('Error: ' + (err.error || err.message));
        }
    };

    const getGradeColor = (grade) => {
        if (grade === 'Excellent') return 'bg-green-100 text-green-700';
        if (grade === 'Good') return 'bg-blue-100 text-blue-700';
        if (grade === 'Average') return 'bg-yellow-100 text-yellow-700';
        return 'bg-red-100 text-red-700';
    };

    return (
        <div className="max-w-7xl mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Surgery Evaluations</h2>
                    <p className="text-gray-500 text-sm">Unit: General Surgery</p>
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
                        <button onClick={() => setValidatedIntern(null)} className="text-sm text-blue-600 hover:underline">Change Intern</button>
                    </div>

                    {/* Content Area */}
                    {view === 'list' && (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                                    <History size={18} /> Surgery History
                                </h3>
                                <button
                                    onClick={handleNewEvaluation}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
                                >
                                    <Plus size={18} /> New Evaluation
                                </button>
                            </div>

                            {attempts.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-500">
                                    No surgeries logged yet. Click "New Evaluation" to start.
                                </div>
                            ) : (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase border-b border-gray-200">
                                            <tr>
                                                <th className="p-4">#</th>
                                                <th className="p-4">Date</th>
                                                <th className="p-4">Surgery</th>
                                                <th className="p-4">Patient</th>
                                                <th className="p-4">Grade</th>
                                                <th className="p-4">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {attempts.map((att, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50">
                                                    <td className="p-4 font-mono text-xs text-gray-500">Surgery {att.attemptNumber}</td>
                                                    <td className="p-4 text-sm">{new Date(att.date || att.attemptDate).toLocaleDateString()}</td>
                                                    <td className="p-4 font-medium text-gray-800">{att.surgeryName || '-'}</td>
                                                    <td className="p-4 text-sm text-gray-600">{att.patientName || '-'}</td>
                                                    <td className="p-4">
                                                        <span className={`text-xs px-2 py-1 rounded font-bold ${getGradeColor(att.grade)}`}>
                                                            {att.grade || 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                            {att.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {view === 'form' && (
                        <div className="animate-fade-in">
                            <div className="mb-4 flex items-center gap-4">
                                <button onClick={() => setView('list')} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
                                    <ArrowLeft size={20} />
                                </button>
                                <h3 className="font-bold text-xl text-gray-800">
                                    New Evaluation: Surgery {attempts.length + 1}
                                </h3>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
                                <h4 className="text-sm font-bold text-gray-500 uppercase mb-4">Case Details</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500">Surgery Name</label>
                                        <input
                                            className="w-full border p-2 rounded mt-1 outline-none focus:ring-1 focus:ring-blue-500"
                                            value={formData.surgeryName}
                                            onChange={e => setFormData({ ...formData, surgeryName: e.target.value })}
                                            placeholder="e.g. Cataract Surgery"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500">Patient Name</label>
                                        <input
                                            className="w-full border p-2 rounded mt-1 outline-none focus:ring-1 focus:ring-blue-500"
                                            value={formData.patientName}
                                            onChange={e => setFormData({ ...formData, patientName: e.target.value })}
                                            placeholder="Patient Name"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500">Grade of Cataract</label>
                                        <input
                                            className="w-full border p-2 rounded mt-1 outline-none focus:ring-1 focus:ring-blue-500"
                                            value={formData.gradeOfCataract}
                                            onChange={e => setFormData({ ...formData, gradeOfCataract: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500">Draping</label>
                                        <input
                                            className="w-full border p-2 rounded mt-1 outline-none focus:ring-1 focus:ring-blue-500"
                                            value={formData.draping}
                                            onChange={e => setFormData({ ...formData, draping: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
                                <h4 className="text-sm font-bold text-gray-500 uppercase mb-4">Skills Assessment</h4>
                                <div className="space-y-4">
                                    {REDUCED_SURGERY_QUESTIONS.map((q) => (
                                        <div key={q.key} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-3 border rounded-lg hover:border-blue-200 transition-colors">
                                            <div className="font-medium text-gray-700">{q.label}</div>
                                            <div>
                                                <label className="text-xs text-gray-400 block mb-1">Score (0-5)</label>
                                                <input
                                                    type="number" min="0" max="5"
                                                    className="border p-2 rounded w-20 text-center font-bold"
                                                    value={formData.scores[q.key]?.score || 0}
                                                    onChange={e => handleScoreChange(q.key, 'score', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-400 block mb-1">Remarks</label>
                                                <input
                                                    className="border p-2 rounded w-full text-sm"
                                                    placeholder="Optional remark..."
                                                    value={formData.scores[q.key]?.remark || ''}
                                                    onChange={e => handleScoreChange(q.key, 'remark', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
                                <h4 className="text-sm font-bold text-gray-500 uppercase mb-2">Detailed Feedback</h4>
                                <textarea
                                    className="w-full border p-3 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 h-24 resize-none"
                                    placeholder="Enter overall feedback or specific areas for improvement..."
                                    value={formData.remarksOverall}
                                    onChange={e => setFormData({ ...formData, remarksOverall: e.target.value })}
                                />
                            </div>

                            <div className="flex justify-end gap-4">
                                <button
                                    onClick={() => setView('list')}
                                    className="px-6 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    className="bg-green-600 text-white px-8 py-2 rounded-lg hover:bg-green-700 font-bold shadow-lg shadow-green-200 transition-all flex items-center gap-2"
                                >
                                    <CheckCircle size={18} /> Submit Assessment
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SurgeryModule;
