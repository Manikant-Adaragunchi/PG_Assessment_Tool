import React, { useState, useEffect } from 'react';
import {
    getOpdAttempts,
    acknowledgeOpdAttempt,
    getSurgeryAttempts,
    acknowledgeSurgeryAttempt,
    getWetlabAttempts,
    acknowledgeWetlabAttempt,
    getAcademicAttempts,
    acknowledgeAcademicAttempt
} from '../../services/evaluationApi';
import { useAuth } from '../../context/AuthContext';
import {
    Activity,
    Clipboard,
    BookOpen,
    Beaker,
    CheckCircle,
    Clock,
    AlertCircle
} from 'lucide-react';

const PgMyEvaluation = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('opd');
    const [data, setData] = useState({
        opd: [],
        surgery: [],
        wetlab: [],
        academic: []
    });
    const [loading, setLoading] = useState(false);

    // Mock Module Code for OPd - in real app, might be dynamic or fixed per rotation
    const OPD_MODULE_CODE = 'GENERAL_SURGERY_OPD';

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch based on active tab to save bandwidth, or fetch all?
                // Fetching all allows for badges/counts on tabs. Let's fetch active for now to be safe on errors.

                let res;
                switch (activeTab) {
                    case 'opd':
                        res = await getOpdAttempts(OPD_MODULE_CODE, user._id);
                        if (res.success) setData(prev => ({ ...prev, opd: res.data }));
                        break;
                    case 'surgery':
                        res = await getSurgeryAttempts(user._id);
                        if (res.success) setData(prev => ({ ...prev, surgery: res.data || [] }));
                        break;
                    case 'wetlab':
                        res = await getWetlabAttempts(user._id);
                        if (res.success) setData(prev => ({ ...prev, wetlab: res.data || [] }));
                        break;
                    case 'academic':
                        res = await getAcademicAttempts(user._id);
                        if (res.success) setData(prev => ({ ...prev, academic: res.data || [] }));
                        break;
                    default:
                        break;
                }
            } catch (err) {
                console.error("Error fetching data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, activeTab]);

    const handleAcknowledgeOpd = async (attemptNumber) => {
        if (!window.confirm("Acknowledge this evaluation? This cannot be undone.")) return;
        try {
            await acknowledgeOpdAttempt(OPD_MODULE_CODE, user._id, attemptNumber);
            // Optimistic update
            setData(prev => ({
                ...prev,
                opd: prev.opd.map(a => a.attemptNumber === attemptNumber ? { ...a, status: 'ACKNOWLEDGED' } : a)
            }));
        } catch (err) {
            alert("Error: " + (err.error || err.message));
        }
    };

    const handleAcknowledgeSurgery = async (attemptNumber) => {
        if (!window.confirm("Acknowledge this evaluation? This cannot be undone.")) return;
        try {
            await acknowledgeSurgeryAttempt(user._id, attemptNumber);
            setData(prev => ({
                ...prev,
                surgery: prev.surgery.map(a => a.attemptNumber === attemptNumber ? { ...a, status: 'ACKNOWLEDGED' } : a)
            }));
        } catch (err) {
            alert("Error: " + (err.error || err.message));
        }
    };

    const handleAcknowledgeWetlab = async (attemptNumber) => {
        if (!window.confirm("Acknowledge this evaluation? This cannot be undone.")) return;
        try {
            await acknowledgeWetlabAttempt(user._id, attemptNumber);
            setData(prev => ({
                ...prev,
                wetlab: prev.wetlab.map(a => a.attemptNumber === attemptNumber ? { ...a, status: 'ACKNOWLEDGED' } : a)
            }));
        } catch (err) {
            alert("Error: " + (err.error || err.message));
        }
    };

    const handleAcknowledgeAcademic = async (attemptNumber) => {
        if (!window.confirm("Acknowledge this evaluation? This cannot be undone.")) return;
        try {
            await acknowledgeAcademicAttempt(user._id, attemptNumber);
            setData(prev => ({
                ...prev,
                academic: prev.academic.map(a => a.attemptNumber === attemptNumber ? { ...a, status: 'ACKNOWLEDGED' } : a)
            }));
        } catch (err) {
            alert("Error: " + (err.error || err.message));
        }
    };

    const TABS = [
        { id: 'opd', label: 'OPD Log', icon: <Activity size={18} /> },
        { id: 'surgery', label: 'Surgery Log', icon: <Clipboard size={18} /> },
        { id: 'wetlab', label: 'Wet Lab', icon: <Beaker size={18} /> },
        { id: 'academic', label: 'Academics', icon: <BookOpen size={18} /> },
    ];

    return (
        <div className="max-w-7xl mx-auto p-4">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">My Evaluations</h1>

            {/* Tabs */}
            <div className="flex bg-white rounded-xl shadow-sm border border-gray-200 p-1 mb-6 overflow-x-auto">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${activeTab === tab.id
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="animate-fade-in">
                    {/* OPD CONTENT */}
                    {activeTab === 'opd' && (
                        <div className="space-y-4">
                            {data.opd.length === 0 && <EmptyState message="No OPD evaluations found." />}
                            {data.opd.map((att, idx) => (
                                <div key={idx} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 card-hover">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-gray-800 text-lg">Attempt #{att.attemptNumber}</span>
                                                <StatusBadge status={att.status} />
                                            </div>
                                            <p className="text-gray-500 text-sm flex items-center gap-1">
                                                <Clock size={14} /> {new Date(att.attemptDate || att.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-sm font-bold text-gray-700">Result</span>
                                            <span className={`text-lg font-bold ${att.result === 'PASS' ? 'text-green-600' : 'text-red-500'}`}>{att.result}</span>
                                        </div>
                                    </div>
                                    {att.status === 'PENDING_ACK' && (
                                        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                                            <button
                                                onClick={() => handleAcknowledgeOpd(att.attemptNumber)}
                                                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition"
                                            >
                                                Acknowledge Evaluation
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* SURGERY CONTENT */}
                    {activeTab === 'surgery' && (
                        <div className="space-y-4">
                            {data.surgery.length === 0 && <EmptyState message="No Surgery logs found." />}
                            {data.surgery.map((att, idx) => (
                                <div key={idx} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 card-hover">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-800">{att.surgeryName}</h3>
                                            <p className="text-sm text-gray-500">{new Date(att.date || att.attemptDate).toLocaleDateString()} • {att.patientName || att.patientId}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <StatusBadge status={att.status} />
                                            <GradeBadge grade={att.grade} />
                                        </div>
                                    </div>
                                    <div className="mt-4 border-t border-gray-100 pt-3">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Detailed Assessment</h4>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                                                    <tr>
                                                        <th className="px-3 py-2 text-left rounded-l-lg">Step</th>
                                                        <th className="px-3 py-2 text-center">Score</th>
                                                        <th className="px-3 py-2 text-left rounded-r-lg">Remarks</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50">
                                                    {att.answers && att.answers.map((ans, i) => (
                                                        <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                                            <td className="px-3 py-2 font-medium text-gray-700">{ans.itemKey.replace(/_/g, ' ')}</td>
                                                            <td className="px-3 py-2 text-center font-bold text-blue-600">{ans.scoreValue}/5</td>
                                                            <td className="px-3 py-2 text-gray-500 italic">{ans.remark || '-'}</td>
                                                        </tr>
                                                    ))}
                                                    <tr className="bg-blue-50/50 font-bold">
                                                        <td className="px-3 py-2 text-blue-800 text-right">Total</td>
                                                        <td className="px-3 py-2 text-center text-blue-800">
                                                            {att.answers ? att.answers.reduce((sum, a) => sum + (a.scoreValue || 0), 0) : 0}
                                                            <span className="text-xs font-normal text-blue-600">/25</span>
                                                        </td>
                                                        <td></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    {att.remarks && <p className="mt-3 text-sm text-gray-600 italic">"{att.remarks}"</p>}
                                    {att.status === 'PENDING_ACK' && (
                                        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                                            <button
                                                onClick={() => handleAcknowledgeSurgery(att.attemptNumber)}
                                                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition"
                                            >
                                                Acknowledge Evaluation
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* WET LAB CONTENT */}
                    {activeTab === 'wetlab' && (
                        <div className="space-y-4">
                            {data.wetlab.length === 0 && <EmptyState message="No Wet Lab exercises found." />}
                            {data.wetlab.map((att, idx) => (
                                <div key={idx} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 card-hover">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-800">{att.exerciseName}</h3>
                                            <p className="text-sm text-gray-500">{new Date(att.date).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <StatusBadge status={att.status} />
                                            <GradeBadge grade={att.grade} />
                                        </div>
                                    </div>
                                    <div className="flex gap-2 text-sm mt-3 overflow-x-auto pb-2">
                                        {Object.entries(att.scores || {}).map(([k, v]) => (
                                            <div key={k} className="px-3 py-1 bg-gray-50 rounded border border-gray-100 whitespace-nowrap">
                                                <span className="text-xs text-gray-500 uppercase mr-2">{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                <span className="font-bold">{v}/5</span>
                                            </div>
                                        ))}
                                    </div>
                                    {att.status === 'PENDING_ACK' && (
                                        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                                            <button
                                                onClick={() => handleAcknowledgeWetlab(att.attemptNumber)}
                                                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition"
                                            >
                                                Acknowledge Evaluation
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ACADEMIC CONTENT */}
                    {activeTab === 'academic' && (
                        <div className="space-y-4">
                            {data.academic.map((att, idx) => (
                                <div key={idx} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 card-hover group relative">
                                    <div className="flex justify-between items-start mb-1">
                                        <div>
                                            <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 mb-2 inline-block">
                                                {att.evaluationType || 'SEMINAR'}
                                            </span>
                                            <h3 className="font-bold text-lg text-gray-800">{att.topic}</h3>
                                            <p className="text-sm text-gray-500">{new Date(att.date).toLocaleDateString()}</p>
                                        </div>
                                        <StatusBadge status={att.status || 'PENDING_ACK'} />
                                    </div>
                                    <div className="grid grid-cols-5 gap-1 mt-3">
                                        {Object.entries(att.scores || {}).map(([k, v]) => (
                                            <div key={k} className="text-center bg-gray-50 p-1 rounded">
                                                <div className={`text-sm font-bold ${v < 3 ? 'text-red-500' : 'text-gray-700'}`}>{v}</div>
                                                <div className="text-[9px] text-gray-400 uppercase truncate">{k.slice(0, 4)}</div>
                                            </div>
                                        ))}
                                    </div>
                                    {att.remarks && <p className="mt-3 text-sm text-gray-600 italic">"{att.remarks}"</p>}
                                    {att.status === 'PENDING_ACK' && (
                                        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                                            <button
                                                onClick={() => handleAcknowledgeAcademic(att.attemptNumber)}
                                                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition"
                                            >
                                                Acknowledge Evaluation
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {data.academic.length === 0 && <EmptyState message="No Academic evaluations found." />}
                        </div>
                    )}
                </div>
            )
            }
        </div >
    );
};

// Helper Components
const EmptyState = ({ message }) => (
    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
        <div className="text-gray-400 mb-2"><AlertCircle className="mx-auto" size={32} /></div>
        <p className="text-gray-500 font-medium">{message}</p>
    </div>
);

const StatusBadge = ({ status }) => {
    let color = 'bg-gray-100 text-gray-700';
    if (status === 'ACKNOWLEDGED' || status === 'COMPLETED' || status === 'PERMANENT') color = 'bg-green-100 text-green-700';
    if (status === 'PENDING_ACK' || status === 'TEMPORARY') color = 'bg-orange-100 text-orange-700';

    return (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${color}`}>
            {status}
        </span>
    );
};

const GradeBadge = ({ grade }) => {
    if (!grade) return null;
    let color = 'bg-gray-100 text-gray-700';
    if (grade === 'Excellent') color = 'bg-green-100 text-green-700';
    if (grade === 'Good') color = 'bg-blue-100 text-blue-700';
    if (grade === 'Average') color = 'bg-orange-100 text-orange-700';
    if (grade === 'Below Average' || grade === 'Poor') color = 'bg-red-100 text-red-700';

    return (
        <span className={`text-xs font-bold px-2 py-1 rounded ${color}`}>
            {grade}
        </span>
    );
};

export default PgMyEvaluation;
