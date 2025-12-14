import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Users, Trash, FileText } from 'lucide-react';
import { getInternList, deleteIntern, downloadBatchReport } from '../../services/adminApi';

const InternList = () => {
    const [interns, setInterns] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

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

    const handleDelete = async (intern) => {
        const input = window.prompt(
            `WARNING: This will PERMANENTLY DELETE ${intern.fullName} and ALL their evaluation data (OPD, Surgery, etc.)!\n\nThis action cannot be undone.\n\nType "DELETE" to confirm:`
        );

        if (input !== 'DELETE') {
            if (input !== null) alert("Deletion cancelled. You must type 'DELETE' exactly.");
            return;
        }

        try {
            await deleteIntern(intern._id);
            setInterns(interns.filter(i => i._id !== intern._id));
            alert("Intern deleted successfully.");
        } catch (err) {
            alert("Failed to delete: " + (err.error || err));
        }
    };

    const handleDownloadBatch = async (batchId, batchName) => {
        try {
            await downloadBatchReport(batchId);
            // No alert needed, browser handles download
        } catch (err) {
            alert(`Failed to download report for ${batchName}: ` + (err.error || err.message));
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading PG list...</div>;

    // Group interns by batch
    const groupedInterns = interns.reduce((acc, intern) => {
        const batchName = intern.batchId ? intern.batchId.name : 'Unassigned';

        // Filter out Unassigned interns as per requirement
        if (batchName === 'Unassigned') return acc;

        if (!acc[batchName]) {
            acc[batchName] = [];
        }
        acc[batchName].push(intern);
        return acc;
    }, {});

    const sortedBatchNames = Object.keys(groupedInterns).sort((a, b) => {
        return b.localeCompare(a); // Sort batches desc (newest first usually)
    });

    const getGenderIcon = (gender) => {
        if (gender === 'F') return <span className="text-pink-500 text-lg mr-2" title="Female">👩‍⚕️</span>;
        if (gender === 'O') return <span className="text-purple-500 text-lg mr-2" title="Other">🧑‍⚕️</span>;
        // Default to Male or generic if not specified, assuming M for compatibility or generic
        return <span className="text-blue-500 text-lg mr-2" title="Male">👨‍⚕️</span>;
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">PG List (Interns)</h1>
            </div>

            <div className="space-y-8">
                {sortedBatchNames.map(batchName => (
                    <div key={batchName} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-2">
                            <Users size={18} className="text-gray-500" />
                            <h2 className="font-bold text-lg text-gray-700">{batchName}</h2>
                            <span className="text-xs font-normal text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">{groupedInterns[batchName].length} PGs</span>
                            <div className="flex-1"></div>
                            {batchName !== 'Unassigned' && (
                                <button
                                    onClick={() => {
                                        const batchId = groupedInterns[batchName][0]?.batchId?._id;
                                        if (batchId) handleDownloadBatch(batchId, batchName);
                                    }}
                                    className="flex items-center gap-1 text-sm bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                                >
                                    <FileText size={16} className="text-green-600" />
                                    Download Report
                                </button>
                            )}
                        </div>
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase bg-gray-50/50">
                                    <th className="p-4 font-semibold">Full Name</th>
                                    <th className="p-4 font-semibold">Registration No</th>
                                    <th className="p-4 font-semibold">Email</th>
                                    <th className="p-4 font-semibold">Status</th>
                                    <th className="p-4 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {groupedInterns[batchName].map(intern => (
                                    <tr key={intern._id} className="border-b last:border-0 border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="p-4 font-medium text-gray-900 flex items-center">
                                            {getGenderIcon(intern.gender)}
                                            {intern.fullName}
                                        </td>
                                        <td className="p-4 font-mono text-sm text-gray-600">{intern.regNo || 'N/A'}</td>
                                        <td className="p-4 text-gray-600">{intern.email}</td>
                                        <td className="p-4">
                                            <span className={`text-xs px-2 py-1 rounded-full font-bold ${intern.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {intern.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="p-4 flex items-center gap-2">
                                            <button
                                                onClick={() => navigate(`/admin/intern-performance/${intern._id}`)}
                                                className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-full transition-colors"
                                                title="View Performance"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(intern)}
                                                className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-colors"
                                                title="Delete PG"
                                            >
                                                <Trash size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}

                {sortedBatchNames.length === 0 && (
                    <div className="p-12 text-center text-gray-400 bg-white rounded-xl border border-gray-200">
                        {interns.length > 0 ? "All PGs are currently unassigned to a batch." : "No PGs found. Create a batch to add interns."}
                    </div>
                )}
            </div>
        </div>
    );
};

export default InternList;
