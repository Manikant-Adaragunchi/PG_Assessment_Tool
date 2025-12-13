import React, { useEffect, useState } from 'react';
import { getFacultyList } from '../../services/adminApi';

const FacultyList = () => {
    const [faculty, setFaculty] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ fullName: '', email: '', role: 'FACULTY' });

    const fetchFaculty = async () => {
        try {
            const response = await getFacultyList();
            if (response.success) {
                setFaculty(response.data);
            }
        } catch (err) {
            console.error("Failed to fetch faculty", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFaculty();
    }, []);

    const handleOpenAdd = () => {
        setEditingId(null);
        setFormData({ fullName: '', email: '', role: 'FACULTY' });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (facultyMember) => {
        setEditingId(facultyMember._id);
        setFormData({
            fullName: facultyMember.fullName,
            email: facultyMember.email,
            role: facultyMember.role
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { createFaculty, updateFaculty } = await import('../../services/adminApi');

            if (editingId) {
                await updateFaculty(editingId, formData);
                alert("Faculty updated successfully!");
            } else {
                await createFaculty(formData);
                alert("Faculty added successfully!");
            }

            setIsModalOpen(false);
            fetchFaculty();
        } catch (err) {
            alert("Operation failed: " + (err.error || err));
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading faculty list...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Department Faculty</h1>
                <button
                    onClick={handleOpenAdd}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm"
                >
                    + Add Faculty
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase">
                            <th className="p-4 font-semibold">Name</th>
                            <th className="p-4 font-semibold">Email</th>
                            <th className="p-4 font-semibold">Role</th>
                            <th className="p-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {faculty.map(f => (
                            <tr key={f._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                <td className="p-4 font-medium text-gray-900">{f.fullName}</td>
                                <td className="p-4 text-gray-600">{f.email}</td>
                                <td className="p-4">
                                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${f.role === 'HOD' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {f.role}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <button
                                        onClick={() => handleOpenEdit(f)}
                                        className="text-gray-400 hover:text-blue-600 mr-3 transition-colors"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={async () => {
                                            if (window.confirm('Are you sure you want to remove this faculty member?')) {
                                                try {
                                                    const { deleteFaculty } = await import('../../services/adminApi');
                                                    await deleteFaculty(f._id);
                                                    fetchFaculty();
                                                } catch (e) {
                                                    alert('Failed to delete: ' + e);
                                                }
                                            }
                                        }}
                                        className="text-gray-400 hover:text-red-600 transition-colors"
                                    >
                                        Remove
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {faculty.length === 0 && (
                            <tr>
                                <td colSpan="4" className="p-8 text-center text-gray-400">No faculty members found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md animate-scale-in">
                        <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Faculty' : 'Add New Faculty'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                                    value={formData.fullName}
                                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                                >
                                    {editingId ? 'Update Faculty' : 'Create & Send Code'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacultyList;
