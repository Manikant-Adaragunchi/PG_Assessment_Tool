import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getInternPerformance, downloadInternReport } from '../../services/adminApi';
import { ArrowLeft, BookOpen, Activity, User, Scissors, GraduationCap } from 'lucide-react';

const InternPerformance = () => {
    const { studentId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [data, setData] = useState(null);
    const [activeTab, setActiveTab] = useState('opd');
    const [error, setError] = useState(null);

    const handleDownloadReport = async (id) => {
        try {
            setDownloading(true);
            await downloadInternReport(id);
        } catch (error) {
            alert("Failed to download report: " + error);
        } finally {
            setDownloading(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getInternPerformance(studentId);
                setData(response);
            } catch (err) {
                setError("Failed to load performance data.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [studentId]);

    if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading performance data...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
    if (!data) return <div className="p-8 text-center text-gray-500">No data found.</div>;

    const { student, performance } = data;

    const tabs = [
        { id: 'opd', label: 'OPD', icon: <User size={18} /> },
        { id: 'wetlab', label: 'Wet Lab', icon: <Activity size={18} /> },
        { id: 'surgery', label: 'Surgery', icon: <Scissors size={18} /> },
        { id: 'academic', label: 'Academic', icon: <GraduationCap size={18} /> },
    ];

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/admin/interns')}
                    className="flex items-center text-gray-500 hover:text-gray-700 mb-4 transition-colors"
                >
                    <ArrowLeft size={16} className="mr-1" /> Back to List
                </button>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{student.firstName} {student.lastName}</h1>
                        <p className="text-gray-500 mt-1">Reg No: <span className="font-mono text-gray-700">{student.registrationNumber || 'N/A'}</span> • Batch: <span className="font-medium text-gray-700">{student.batch?.name || 'Unassigned'}</span></p>
                    </div>
                    <div className="mt-4 md:mt-0">
                        <button
                            onClick={() => handleDownloadReport(studentId)}
                            disabled={downloading}
                            className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <BookOpen size={16} />
                            {downloading ? 'Downloading...' : 'Download Report'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6 bg-white rounded-t-xl px-4 pt-2">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center py-4 px-6 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        <span className="mr-2">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[400px]">
                {activeTab === 'opd' && <OpdTable data={performance.opd} />}
                {activeTab === 'wetlab' && <WetlabTable data={performance.wetlab} />}
                {activeTab === 'surgery' && <SurgeryTable data={performance.surgery} />}
                {activeTab === 'academic' && <AcademicTable data={performance.academic} />}
            </div>
        </div>
    );
};

// Sub-components for Tables

const EmptyState = ({ message }) => (
    <div className="p-12 text-center text-gray-400 flex flex-col items-center">
        <BookOpen size={48} className="mb-4 opacity-20" />
        <p>{message}</p>
    </div>
);

const OpdTable = ({ data }) => {
    if (!data || data.length === 0) return <EmptyState message="No OPD evaluations recorded." />;
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b border-gray-200">
                    <tr>
                        <th className="p-4">Date</th>
                        <th className="p-4">Module Code</th>
                        <th className="p-4">Result</th>
                        <th className="p-4">Faculty</th>
                        <th className="p-4">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {data.map((item) => (
                        <tr key={item._id} className="hover:bg-gray-50">
                            <td className="p-4">{new Date(item.attemptDate).toLocaleDateString()}</td>
                            <td className="p-4 font-mono text-sm">{item.moduleCode}</td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${item.result === 'PASS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                    {item.result}
                                </span>
                            </td>
                            <td className="p-4 text-gray-600">{item.faculty}</td>
                            <td className="p-4 text-xs text-gray-500">{item.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const WetlabTable = ({ data }) => {
    if (!data || data.length === 0) return <EmptyState message="No Wet Lab evaluations recorded." />;
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b border-gray-200">
                    <tr>
                        <th className="p-4">Date</th>
                        <th className="p-4">Topic</th>
                        <th className="p-4">Score</th>
                        <th className="p-4">Grade</th>
                        <th className="p-4">Faculty</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {data.map((item) => (
                        <tr key={item._id} className="hover:bg-gray-50">
                            <td className="p-4">{new Date(item.createdAt).toLocaleDateString()}</td>
                            <td className="p-4 font-medium">{item.topicName}</td>
                            <td className="p-4">{item.totalScore}</td>
                            <td className="p-4">
                                <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded font-mono text-xs font-bold">
                                    {item.grade}
                                </span>
                            </td>
                            <td className="p-4 text-gray-600">{item.faculty}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const SurgeryTable = ({ data }) => {
    if (!data || data.length === 0) return <EmptyState message="No Surgery evaluations recorded." />;
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b border-gray-200">
                    <tr>
                        <th className="p-4">Date</th>
                        <th className="p-4">Surgery / Patient</th>
                        <th className="p-4">Score</th>
                        <th className="p-4">Grade</th>
                        <th className="p-4">Faculty</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {data.map((item) => (
                        <tr key={item._id} className="hover:bg-gray-50">
                            <td className="p-4">{new Date(item.attemptDate).toLocaleDateString()}</td>
                            <td className="p-4">
                                <div className="font-medium text-gray-900">{item.surgeryName || 'Unknown Surgery'}</div>
                                <div className="text-xs text-gray-500">{item.patientName}</div>
                            </td>
                            <td className="p-4 text-gray-700">{item.totalScore}</td>
                            <td className="p-4">
                                <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded font-mono text-xs font-bold">
                                    {item.grade}
                                </span>
                            </td>
                            <td className="p-4 text-gray-600">{item.faculty}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const AcademicTable = ({ data }) => {
    if (!data || data.length === 0) return <EmptyState message="No Academic evaluations recorded." />;
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b border-gray-200">
                    <tr>
                        <th className="p-4">Date</th>
                        <th className="p-4">Module</th>
                        <th className="p-4">Topic</th>
                        <th className="p-4">Score</th>
                        <th className="p-4">Grade</th>
                        <th className="p-4">Faculty</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {data.map((item) => (
                        <tr key={item._id} className="hover:bg-gray-50">
                            <td className="p-4">{new Date(item.createdAt).toLocaleDateString()}</td>
                            <td className="p-4 text-xs font-mono text-gray-500">{item.moduleCode}</td>
                            <td className="p-4 font-medium">{item.topicName}</td>
                            <td className="p-4">{item.totalScore}</td>
                            <td className="p-4">
                                <span className="bg-yellow-50 text-yellow-700 px-2 py-1 rounded font-mono text-xs font-bold">
                                    {item.grade}
                                </span>
                            </td>
                            <td className="p-4 text-gray-600">{item.faculty}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default InternPerformance;
