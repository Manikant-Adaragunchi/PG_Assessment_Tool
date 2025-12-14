import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getOpdAttempts, getSurgeryAttempts, getWetlabAttempts, getAcademicAttempts, acknowledgeOpdAttempt, acknowledgeSurgeryAttempt, acknowledgeWetlabAttempt, acknowledgeAcademicAttempt } from '../../services/evaluationApi';
import { Activity, Clipboard, CheckCircle, Clock } from 'lucide-react';

const PgDashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        pendingAck: 0,
        opdCount: 0,
        surgeryCount: 0,
        wetlabCount: 0,
        academicCount: 0,
        recentActivity: []
    });

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            try {
                // Fetch all data for dashboard (Parallel requests)
                const [opdRes, surgeryRes, wetlabRes, academicRes] = await Promise.all([
                    getOpdAttempts('GENERAL_SURGERY_OPD', user._id).catch(() => ({ data: [] })),
                    getSurgeryAttempts(user._id).catch(() => ({ data: [] })),
                    getWetlabAttempts(user._id).catch(() => ({ data: [] })),
                    getAcademicAttempts(user._id).catch(() => ({ data: [] }))
                ]);

                // Calculate Stats
                const opdData = opdRes.data || [];
                const surgeryData = surgeryRes.data || [];
                const wetlabData = wetlabRes.data || [];
                const academicData = academicRes.data || [];

                const pendingAck =
                    opdData.filter(a => a.status === 'PENDING_ACK').length +
                    surgeryData.filter(a => a.status === 'PENDING_ACK').length +
                    wetlabData.filter(a => a.status === 'PENDING_ACK').length +
                    academicData.filter(a => a.status === 'PENDING_ACK').length;

                // Combine for Recent Activity
                // Combine for Recent Activity
                const allActivities = [
                    ...opdData.map(a => ({
                        ...a,
                        type: 'OPD',
                        title: 'OPD Session',
                        date: a.attemptDate || a.date,
                        id: a._id || a.attemptNumber,
                        moduleCode: 'GENERAL_SURGERY_OPD',
                        facultyName: a.facultyId?.fullName || 'Unknown',
                        scoreDisplay: `Grade: ${a.grade || 'N/A'}`
                    })),
                    ...surgeryData.map(a => ({
                        ...a,
                        type: 'SURGERY',
                        title: a.surgeryName,
                        date: a.date,
                        id: a._id,
                        facultyName: a.facultyId?.fullName || 'Unknown',
                        scoreDisplay: `Score: ${a.totalScore || 0} (${a.grade || 'N/A'})`
                    })),
                    ...wetlabData.map(a => ({
                        ...a,
                        type: 'WETLAB',
                        title: a.exerciseName,
                        date: a.date,
                        id: a._id,
                        facultyName: a.facultyId?.fullName || 'Unknown',
                        scoreDisplay: `Score: ${a.totalScore || 0} (${a.grade || 'N/A'})`
                    })),
                    ...academicData.map(a => ({
                        ...a,
                        type: 'ACADEMIC',
                        title: a.topic,
                        date: a.date,
                        id: a._id,
                        facultyName: a.facultyId?.fullName || 'Unknown',
                        scoreDisplay: `Score: ${Object.values(a.scores || {}).reduce((s, v) => s + (v || 0), 0)}`
                    }))
                ];

                // Sort by Priority (Pending Ack first) then Date desc
                allActivities.sort((a, b) => {
                    if (a.status === 'PENDING_ACK' && b.status !== 'PENDING_ACK') return -1;
                    if (a.status !== 'PENDING_ACK' && b.status === 'PENDING_ACK') return 1;
                    return new Date(b.date) - new Date(a.date);
                });

                setStats({
                    pendingAck,
                    opdCount: opdData.length,
                    surgeryCount: surgeryData.length,
                    wetlabCount: wetlabData.length,
                    academicCount: academicData.length,
                    recentActivity: allActivities.slice(0, 5) // Top 5
                });

            } catch (err) {
                console.error("Dashboard fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

    }, [user]);

    const handleAcknowledge = async (item) => {
        if (!window.confirm('Are you sure you want to acknowledge this evaluation?')) return;

        try {
            if (item.type === 'OPD') {
                await acknowledgeOpdAttempt(item.moduleCode, user._id, item.attemptNumber);
            } else if (item.type === 'SURGERY') {
                await acknowledgeSurgeryAttempt(user._id, item.attemptNumber);
            } else if (item.type === 'WETLAB') {
                await acknowledgeWetlabAttempt(user._id, item.attemptNumber);
            } else if (item.type === 'ACADEMIC') {
                await acknowledgeAcademicAttempt(user._id, item.attemptNumber);
            }

            // Update UI locally
            const updatedActivity = stats.recentActivity.map(act => {
                if (act.id === item.id) {
                    return { ...act, status: 'ACKNOWLEDGED' };
                }
                return act;
            });

            setStats(prev => ({
                ...prev,
                recentActivity: updatedActivity,
                pendingAck: Math.max(0, prev.pendingAck - 1)
            }));

        } catch (error) {
            console.error("Acknowledgement failed", error);
            const errMsg = error.error || error.message || JSON.stringify(error) || "Unknown error";
            alert(`Failed to acknowledge: ${errMsg}`);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading Dashboard...</div>;

    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">My Dashboard</h1>
            <p className="text-gray-500 mb-8">Welcome back, {user?.fullName}</p>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                {/* Pending Ack */}
                <div
                    onClick={() => document.getElementById('recent-activity')?.scrollIntoView({ behavior: 'smooth' })}
                    className="bg-white p-6 rounded-xl shadow-sm border border-orange-100 bg-gradient-to-br from-orange-50 to-white cursor-pointer hover:shadow-md transition-shadow">
                    <h3 className="text-gray-500 text-xs uppercase tracking-wide font-bold">Action Required</h3>
                    <div className="flex justify-between items-end mt-2">
                        <div>
                            <p className="text-3xl font-bold text-orange-600">{stats.pendingAck}</p>
                            <span className="text-xs text-orange-700">Pending Acknowledgments</span>
                        </div>
                        <Activity className="text-orange-200" size={32} />
                    </div>
                </div>

                {/* OPD Count */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100 bg-gradient-to-br from-orange-50 to-white">
                    <h3 className="text-gray-500 text-xs uppercase tracking-wide font-bold">OPD Sessions</h3>
                    <div className="flex justify-between items-end mt-2">
                        <div>
                            <p className="text-3xl font-bold text-orange-600">{stats.opdCount}</p>
                            <span className="text-xs text-orange-700">Total Visits</span>
                        </div>
                        <Activity className="text-orange-200" size={32} />
                    </div>
                </div>

                {/* Surgery Count */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 bg-gradient-to-br from-blue-50 to-white">
                    <h3 className="text-gray-500 text-xs uppercase tracking-wide font-bold">Surgeries Logged</h3>
                    <div className="flex justify-between items-end mt-2">
                        <div>
                            <p className="text-3xl font-bold text-blue-600">{stats.surgeryCount}</p>
                            <span className="text-xs text-blue-700">Total Cases</span>
                        </div>
                        <Clipboard className="text-blue-200" size={32} />
                    </div>
                </div>

                {/* Wet Lab */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-teal-100 bg-gradient-to-br from-teal-50 to-white">
                    <h3 className="text-gray-500 text-xs uppercase tracking-wide font-bold">Wet Lab</h3>
                    <div className="flex justify-between items-end mt-2">
                        <div>
                            <p className="text-3xl font-bold text-teal-600">{stats.wetlabCount}</p>
                            <span className="text-xs text-teal-700">Exercises Completed</span>
                        </div>
                        <CheckCircle className="text-teal-200" size={32} />
                    </div>
                </div>

                {/* Academic */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-100 bg-gradient-to-br from-purple-50 to-white">
                    <h3 className="text-gray-500 text-xs uppercase tracking-wide font-bold">Academic</h3>
                    <div className="flex justify-between items-end mt-2">
                        <div>
                            <p className="text-3xl font-bold text-purple-600">{stats.academicCount}</p>
                            <span className="text-xs text-purple-700">Presentations</span>
                        </div>
                        <Clock className="text-purple-200" size={32} />
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div id="recent-activity" className="cols-span-1 md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800">Recent Activity</h3>
                    <Link to="/pg/my-evaluations" className="text-sm text-blue-600 hover:underline">View All</Link>
                </div>
                <div>
                    {stats.recentActivity.length === 0 ? (
                        <p className="p-8 text-center text-gray-500 text-sm">No recent activity found.</p>
                    ) : (
                        stats.recentActivity.map((item, idx) => (
                            <div key={idx} className="p-4 border-b border-gray-50 hover:bg-gray-50 flex justify-between items-center transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs 
                                        ${item.type === 'OPD' ? 'bg-orange-100 text-orange-600' :
                                            item.type === 'SURGERY' ? 'bg-blue-100 text-blue-600' :
                                                item.type === 'WETLAB' ? 'bg-teal-100 text-teal-600' : 'bg-purple-100 text-purple-600'
                                        }`}>
                                        {item.type[0]}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-800 text-sm">{item.title}</h4>
                                        <div className="flex flex-col gap-0.5 mt-1">
                                            <p className="text-xs text-gray-400">{new Date(item.date).toLocaleDateString()}</p>
                                            <p className="text-xs text-gray-500">Evaluator: {item.facultyName}</p>
                                            <p className="text-xs font-semibold text-gray-600">{item.scoreDisplay}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs px-2 py-1 rounded font-bold ${item.status === 'COMPLETED' || item.status === 'PERMANENT' || item.status === 'ACKNOWLEDGED'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {item.status || 'PENDING'}
                                    </span>
                                    {item.status === 'PENDING_ACK' && (
                                        <button
                                            onClick={() => handleAcknowledge(item)}
                                            className="ml-2 text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                                        >
                                            Acknowledge
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default PgDashboard;
