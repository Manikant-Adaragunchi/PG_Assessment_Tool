import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '../../services/adminApi';
// import { downloadBatchReport } from '../../services/adminApi';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        activeBatches: 0,
        registeredFaculty: 0,
        totalInterns: 0
    });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const data = await getDashboardStats();
            if (data.success) {
                setStats(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch dashboard stats", error);
        }
    };

    const handleBatchExport = async () => {
        // Mock Batch ID for now or we need a dropdown. 
        // For demo, we just export 'default' batch.
        // await downloadBatchReport('123');
        alert("Batch Export requires selecting a batch first. Go to 'Active Batches' page (Future).");
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-extrabold text-surface-900 tracking-tight">Admin Dashboard</h1>
                    <p className="text-surface-500 mt-1">Manage residency program, batches, and faculty access.</p>
                </div>
                {/* <button onClick={handleBatchExport} className="btn-secondary text-sm">Download Master Report</button> */}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card border-l-4 border-l-primary-500 hover:-translate-y-1 hover:shadow-lg transition-transform cursor-default group">
                    <div className="flex justify-between items-center mb-4">
                        <div className="p-2 bg-primary-50 rounded-lg text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        </div>
                        {/* <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded-full">+1 New</span> */}
                    </div>
                    <h3 className="text-surface-500 text-sm font-semibold uppercase tracking-wide">Active Batches</h3>
                    <p className="text-3xl font-bold text-surface-900 mt-1">{stats.activeBatches}</p>
                </div>

                <div className="card border-l-4 border-l-secondary-500 hover:-translate-y-1 hover:shadow-lg transition-transform cursor-default group">
                    <div className="flex justify-between items-center mb-4">
                        <div className="p-2 bg-secondary-50 rounded-lg text-secondary-600 group-hover:bg-secondary-600 group-hover:text-white transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        </div>
                    </div>
                    <h3 className="text-surface-500 text-sm font-semibold uppercase tracking-wide">Registered Faculty</h3>
                    <p className="text-3xl font-bold text-surface-900 mt-1">{stats.registeredFaculty}</p>
                </div>

                <div className="card border-l-4 border-l-purple-500 hover:-translate-y-1 hover:shadow-lg transition-transform cursor-default group">
                    <div className="flex justify-between items-center mb-4">
                        <div className="p-2 bg-purple-50 rounded-lg text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        </div>
                    </div>
                    <h3 className="text-surface-500 text-sm font-semibold uppercase tracking-wide">Total Interns</h3>
                    <p className="text-3xl font-bold text-surface-900 mt-1">{stats.totalInterns}</p>
                </div>
            </div>

            {/* Quick Actions */}
            <h2 className="text-xl font-bold text-surface-800 border-b border-surface-200 pb-2">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/admin/batches" className="card hover:border-primary-300 hover:shadow-md group flex flex-col justify-center items-center p-6 transition-all text-center">
                    <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary-600 group-hover:text-white transition-colors shadow-sm">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    </div>
                    <h3 className="font-bold text-lg text-surface-800 group-hover:text-primary-700 transition-colors">Create New Batch</h3>
                    <p className="text-sm text-surface-500 mt-1">Initialize year & register interns</p>
                </Link>

                <Link to="/admin/faculty" className="card hover:border-secondary-300 hover:shadow-md group flex flex-col justify-center items-center p-6 transition-all text-center">
                    <div className="w-16 h-16 bg-secondary-50 text-secondary-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-secondary-600 group-hover:text-white transition-colors shadow-sm">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                    </div>
                    <h3 className="font-bold text-lg text-surface-800 group-hover:text-secondary-700 transition-colors">Manage Faculty</h3>
                    <p className="text-sm text-surface-500 mt-1">Edit access rights & profiles</p>
                </Link>

                <div
                    onClick={() => downloadBatchReport('123')}
                    className="card hover:border-green-300 hover:shadow-md group flex flex-col justify-center items-center p-6 transition-all text-center cursor-pointer"
                >
                    <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-green-600 group-hover:text-white transition-colors shadow-sm">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <h3 className="font-bold text-lg text-surface-800 group-hover:text-green-700 transition-colors">Export Batch Report</h3>
                    <p className="text-sm text-surface-500 mt-1">Download Excel summary of active batch</p>
                </div>
            </div>
        </div>
    );
};

// Fake implementation for import since checking logic is annoying in overwrite
const downloadBatchReport = (id) => {
    import('../../services/adminApi').then(module => {
        module.downloadBatchReport(id).then(() => alert("Downloading Report...")).catch(e => alert("Error: " + e));
    });
};

export default AdminDashboard;
