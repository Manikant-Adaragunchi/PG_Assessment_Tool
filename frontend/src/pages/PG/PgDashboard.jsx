import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const PgDashboard = () => {
    // Mock Stats - In real app, fetch from an API like /intern/dashboard-stats
    const stats = {
        pendingAck: 2,
        completed: 15,
        averageScore: '85%'
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">My Dashboard</h1>
            <p className="text-gray-500 mb-8">Welcome back, Dr. Intern</p>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100 bg-gradient-to-br from-orange-50 to-white">
                    <h3 className="text-gray-500 text-sm uppercase tracking-wide">Pending Acknowledgments</h3>
                    <p className="text-4xl font-bold text-orange-500 mt-2">{stats.pendingAck}</p>
                    <Link to="/pg/my-evaluations" className="text-sm text-orange-600 font-medium mt-4 inline-block hover:underline">View Pending &rarr;</Link>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 bg-gradient-to-br from-blue-50 to-white">
                    <h3 className="text-gray-500 text-sm uppercase tracking-wide">Completed Logs</h3>
                    <p className="text-4xl font-bold text-blue-600 mt-2">{stats.completed}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100 bg-gradient-to-br from-green-50 to-white">
                    <h3 className="text-gray-500 text-sm uppercase tracking-wide">Competency Progress</h3>
                    <p className="text-4xl font-bold text-green-600 mt-2">Good</p>
                </div>
            </div>

            {/* Recent Activity / Quick Links */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-bold text-gray-800 mb-4">Recent Evaluations</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                            <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded">SURGERY</span>
                            <h4 className="font-semibold text-gray-800 mt-1">Appendectomy Procedure</h4>
                            <p className="text-xs text-gray-500">Yesterday by Dr. Rajesh Kumar</p>
                        </div>
                        <span className="text-sm font-bold text-green-600">Score: 4/5</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-100">
                        <div>
                            <span className="text-xs font-bold bg-purple-100 text-purple-700 px-2 py-1 rounded">OPD</span>
                            <h4 className="font-semibold text-gray-800 mt-1">History Taking (Unit 1)</h4>
                            <p className="text-xs text-gray-500">2 days ago by Dr. Anita Desai</p>
                        </div>
                        <button className="text-xs font-bold bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600">
                            Acknowledge
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PgDashboard;
