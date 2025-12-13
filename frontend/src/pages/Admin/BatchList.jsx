import React, { useEffect, useState } from 'react';
import { getBatches, deleteBatch } from '../../services/adminApi';
import { Link } from 'react-router-dom';

const BatchList = () => {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBatches = async () => {
        try {
            const response = await getBatches();
            if (response.success) {
                setBatches(response.data);
            }
        } catch (err) {
            console.error("Failed to fetch batches", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBatches();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure? This will delete the batch but keep student records (unassigned).")) return;
        try {
            await deleteBatch(id);
            // Optimistic update
            setBatches(batches.filter(b => b._id !== id));
            alert("Batch deleted.");
        } catch (err) {
            alert("Failed: " + err);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading batches...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Batch Management</h1>
                    <p className="text-gray-500 text-sm mt-1">PGs are listed inside their respective batches.</p>
                </div>
                <Link
                    to="/admin/batches/create"
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm"
                >
                    + Create New Batch
                </Link>
            </div>

            <div className="grid gap-6">
                {batches.map(batch => (
                    <div key={batch._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-bold text-gray-800">{batch.name}</h2>
                                <span className="text-xs text-gray-500">Started: {new Date(batch.startDate).toLocaleDateString()}</span>
                            </div>
                            <button
                                onClick={() => handleDelete(batch._id)}
                                className="text-red-500 hover:text-red-700 text-sm font-medium px-3 py-1 bg-white border border-red-200 rounded hover:bg-red-50 transition-colors"
                            >
                                Delete Batch
                            </button>
                        </div>

                        <div className="p-0">
                            <table className="w-full text-left">
                                <thead className="bg-white text-xs text-gray-400 uppercase font-semibold">
                                    <tr>
                                        <th className="px-6 py-3">Intern Name</th>
                                        <th className="px-6 py-3">Reg No</th>
                                        <th className="px-6 py-3">Email</th>
                                        <th className="px-6 py-3 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {batch.interns && batch.interns.length > 0 ? (
                                        batch.interns.map(intern => (
                                            <tr key={intern._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-3 font-medium text-gray-700">{intern.fullName}</td>
                                                <td className="px-6 py-3 font-mono text-xs text-gray-500">{intern.regNo}</td>
                                                <td className="px-6 py-3 text-sm text-gray-500">{intern.email}</td>
                                                <td className="px-6 py-3 text-right">
                                                    <span className={`inline-block w-2 h-2 rounded-full ${intern.isActive ? 'bg-green-400' : 'bg-red-400'}`}></span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-8 text-center text-gray-400 italic">
                                                No interns assigned to this batch.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}

                {batches.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <p className="text-gray-500 mb-4">No batches found.</p>
                        <Link to="/admin/batches/create" className="text-primary-600 font-medium hover:underline">Create your first batch</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BatchList;
