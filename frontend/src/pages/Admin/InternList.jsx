import React, { useEffect, useState } from 'react';
import { getInternList } from '../../services/adminApi';

const InternList = () => {
    const [interns, setInterns] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchInterns = async () => {
        try {
            const response = await getInternList();
            if (response.success) {
                setInterns(response.data);
            }
        } catch (err) {
            console.error("Failed to fetch interns", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInterns();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading PG list...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">PG List (Interns)</h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase">
                            <th className="p-4 font-semibold">Full Name</th>
                            <th className="p-4 font-semibold">Registration No</th>
                            <th className="p-4 font-semibold">Email</th>
                            <th className="p-4 font-semibold">Batch</th>
                            <th className="p-4 font-semibold">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {interns.map(intern => (
                            <tr key={intern._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                <td className="p-4 font-medium text-gray-900">{intern.fullName}</td>
                                <td className="p-4 font-mono text-sm text-gray-600">{intern.regNo || 'N/A'}</td>
                                <td className="p-4 text-gray-600">{intern.email}</td>
                                <td className="p-4">
                                    {intern.batchId ? (
                                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-semibold">
                                            {intern.batchId.name}
                                        </span>
                                    ) : (
                                        <span className="text-gray-400 text-sm">Unassigned</span>
                                    )}
                                </td>
                                <td className="p-4">
                                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${intern.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {intern.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {interns.length === 0 && (
                            <tr>
                                <td colSpan="5" className="p-8 text-center text-gray-400">No PGs found. Create a batch to add interns.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InternList;
