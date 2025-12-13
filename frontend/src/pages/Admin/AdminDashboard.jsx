import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '../../services/adminApi';

const AdminDashboard = () => {
    // Stats State
    const [stats, setStats] = useState({
        activeBatches: 0,
        registeredFaculty: 0,
        totalInterns: 0
    });

    // Export Modal State
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [batches, setBatches] = useState([]);
    const [selectedBatchId, setSelectedBatchId] = useState('');
    const [exportLoading, setExportLoading] = useState(false);

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

    const handleOpenExport = async () => {
        try {
            // Fetch batches for the dropdown
            const { getBatches } = await import('../../services/adminApi');
            const data = await getBatches();
            if (data.success) {
                setBatches(data.data);
                if (data.data.length > 0) {
                    setSelectedBatchId(data.data[0]._id);
                }
                setIsExportModalOpen(true);
            }
        } catch (error) {
            alert("Failed to load batches: " + error);
        }
    };

    const handleExportSubmit = async () => {
        if (!selectedBatchId) return;
        setExportLoading(true);
        try {
            const { downloadBatchReport } = await import('../../services/adminApi');
            await downloadBatchReport(selectedBatchId);
            setIsExportModalOpen(false);
        } catch (error) {
            alert("Export failed: " + error);
        } finally {
            setExportLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in relative">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-extrabold text-surface-900 tracking-tight">Admin Dashboard</h1>
                    <p className="text-surface-500 mt-1">Manage residency program, batches, and faculty access.</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card border-l-4 border-l-primary-500 hover:-translate-y-1 hover:shadow-lg transition-transform cursor-default group">
                    <div className="flex justify-between items-center mb-4">
                        <div className="p-2 bg-primary-50 rounded-lg text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        </div>
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
                    <h3 className="text-surface-500 text-sm font-semibold uppercase tracking-wide">Total PG</h3>
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
                    onClick={handleOpenExport}
                    className="card hover:border-green-300 hover:shadow-md group flex flex-col justify-center items-center p-6 transition-all text-center cursor-pointer"
                >
                    <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-green-600 group-hover:text-white transition-colors shadow-sm">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <h3 className="font-bold text-lg text-surface-800 group-hover:text-green-700 transition-colors">Export Batch Report</h3>
                    <p className="text-sm text-surface-500 mt-1">Download Excel summary of active batch</p>
                </div>
            </div>

            {/* Export Modal */}
            {isExportModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm animate-scale-in">
                        <h3 className="text-lg font-bold mb-4">Export Batch Report</h3>
                        <p className="text-sm text-gray-600 mb-4">Select a batch to download the excel report.</p>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Select Batch</label>
                            <select
                                className="w-full border rounded-lg p-2.5 bg-gray-50 focus:ring-2 focus:ring-green-500 outline-none"
                                value={selectedBatchId}
                                onChange={(e) => setSelectedBatchId(e.target.value)}
                            >
                                {batches.map(batch => (
                                    <option key={batch._id} value={batch._id}>
                                        {batch.name} ({new Date(batch.startDate).getFullYear()})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsExportModalOpen(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleExportSubmit}
                                disabled={exportLoading}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                            >
                                {exportLoading ? 'Downloading...' : 'Download Report'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
