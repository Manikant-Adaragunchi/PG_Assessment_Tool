import React, { useState, useEffect } from 'react';
import { getOpdAttempts, acknowledgeOpdAttempt } from '../../services/evaluationApi';
import { useAuth } from '../../context/AuthContext';

const PgMyEvaluation = () => {
    const { user } = useAuth(); // Assume user contains _id
    const [activeTab, setActiveTab] = useState('opd');
    const [opdAttempts, setOpdAttempts] = useState([]);
    const [loading, setLoading] = useState(false);

    // Mock Module Code for OPd
    const OPD_MODULE_CODE = 'GENERAL_SURGERY_OPD';

    useEffect(() => {
        if (!user) return; // Wait for auth

        // In a real app we might fetch all modules. 
        // For demo, we just fetch OPD.
        const fetchOpd = async () => {
            setLoading(true);
            try {
                const data = await getOpdAttempts(OPD_MODULE_CODE, user._id); // Assuming user._id is what we need. 
                // Note: In Mock Auth, user object might need checking.
                if (data.success) {
                    setOpdAttempts(data.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (activeTab === 'opd') {
            fetchOpd();
        }
    }, [user, activeTab]);

    const handleAcknowledge = async (attemptNumber) => {
        if (!window.confirm("Acknowledge this evaluation? This cannot be undone.")) return;

        try {
            await acknowledgeOpdAttempt(OPD_MODULE_CODE, user._id, attemptNumber);
            alert("Acknowledged Successfully!");

            // Optimistic update or refetch
            setOpdAttempts(prev => prev.map(a =>
                a.attemptNumber === attemptNumber ? { ...a, status: 'ACKNOWLEDGED' } : a
            ));

        } catch (err) {
            alert("Error: " + (err.error || err.message));
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">My Evaluations</h1>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
                <button
                    className={`px-6 py-3 font-medium ${activeTab === 'opd' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('opd')}
                >
                    OPD Evaluations
                </button>
                <button
                    className={`px-6 py-3 font-medium ${activeTab === 'surgery' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('surgery')}
                >
                    Surgery Logs
                </button>
            </div>

            {loading ? <div>Loading...</div> : (
                <div className="space-y-4">
                    {activeTab === 'opd' && opdAttempts.length === 0 && <p className="text-gray-500">No evaluations found.</p>}

                    {activeTab === 'opd' && opdAttempts.map(attempt => (
                        <div key={attempt.attemptNumber} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="font-bold text-gray-800">Attempt #{attempt.attemptNumber}</span>
                                    <span className={`text-xs px-2 py-1 rounded font-bold ${attempt.status === 'ACKNOWLEDGED' ? 'bg-green-100 text-green-700' :
                                            attempt.status === 'PENDING_ACK' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {attempt.status}
                                    </span>
                                    <span className="text-sm text-gray-500">{new Date(attempt.attemptDate || attempt.date).toLocaleDateString()}</span>
                                </div>
                                <p className="text-gray-600">Result: <strong>{attempt.result}</strong></p>
                            </div>

                            {attempt.status === 'PENDING_ACK' ? (
                                <button
                                    onClick={() => handleAcknowledge(attempt.attemptNumber)}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-semibold"
                                >
                                    Acknowledge
                                </button>
                            ) : (
                                <div className="text-sm text-gray-400 italic">
                                    {attempt.status === 'ACKNOWLEDGED' ? 'Acknowledged' : 'Temporary / Failed'}
                                </div>
                            )}
                        </div>
                    ))}

                    {activeTab === 'surgery' && (
                        <div className="p-8 text-center bg-gray-50 rounded-lg">
                            Surgery Logs view placeholder (Same logic as OPD)
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PgMyEvaluation;
