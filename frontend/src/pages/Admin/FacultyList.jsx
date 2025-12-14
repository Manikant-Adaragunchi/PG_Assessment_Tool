import React, { useEffect, useState } from 'react';
import { getFacultyList } from '../../services/adminApi';

const FacultyList = () => {
    const [faculty, setFaculty] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ fullName: '', email: '', role: 'FACULTY', gender: 'M', areaOfExpertise: '' });

    // Notification State
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' }); // type: success | error

    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ ...notification, show: false }), 3000);
    };

    const fetchFaculty = async () => {
        try {
            const response = await getFacultyList();
            if (response.success) {
                setFaculty(response.data);
            }
        } catch (err) {
            console.error("Failed to fetch faculty", err);
            showNotification("Failed to fetch faculty list", 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFaculty();
    }, []);

    const handleOpenAdd = () => {
        setEditingId(null);
        setFormData({ fullName: '', email: '', role: 'FACULTY', gender: 'M', areaOfExpertise: '' });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (facultyMember) => {
        setEditingId(facultyMember._id);
        setFormData({
            fullName: facultyMember.fullName,
            email: facultyMember.email,
            role: facultyMember.role,
            gender: facultyMember.gender || 'M',
            areaOfExpertise: facultyMember.areaOfExpertise || ''
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { createFaculty, updateFaculty } = await import('../../services/adminApi');

            if (editingId) {
                await updateFaculty(editingId, formData);
                showNotification("Faculty updated successfully!");
            } else {
                await createFaculty(formData);
                showNotification("Faculty added successfully!");
            }

            setIsModalOpen(false);
            fetchFaculty();
        } catch (err) {
            showNotification("Operation failed: " + (err.error || err), 'error');
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading faculty list...</div>;

    const getGenderIcon = (gender) => {
        if (gender === 'F') return <span className="text-pink-500 text-lg mr-2" title="Female">👩‍⚕️</span>;
        if (gender === 'O') return <span className="text-purple-500 text-lg mr-2" title="Other">🧑‍⚕️</span>;
        return <span className="text-blue-500 text-lg mr-2" title="Male">👨‍⚕️</span>;
    };

    return (
        <div className="relative">
            {/* Notification Toast */}
            {notification.show && (
                <div className={`fixed top-4 right-4 z-[100] px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 transform transition-all duration-300 animate-fade-in-down ${notification.type === 'success'
                        ? 'bg-green-500 text-white shadow-green-500/30'
                        : 'bg-red-500 text-white shadow-red-500/30'
                    }`}>
                    {notification.type === 'success' ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    )}
                    <div>
                        <h4 className="font-bold text-sm uppercase tracking-wide">{notification.type === 'success' ? 'Success' : 'Error'}</h4>
                        <p className="text-sm font-medium opacity-90">{notification.message}</p>
                    </div>
                    <button onClick={() => setNotification({ ...notification, show: false })} className="ml-2 hover:bg-white/20 rounded-full p-1 transition">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            )}

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
                            <th className="p-4 font-semibold">Role & Expertise</th>
                            <th className="p-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {faculty.map(f => (
                            <tr key={f._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                <td className="p-4 font-medium text-gray-900 flex items-center">
                                    {getGenderIcon(f.gender)}
                                    {f.fullName}
                                </td>
                                <td className="p-4 text-gray-600">{f.email}</td>
                                <td className="p-4">
                                    <div className="flex flex-col gap-1">
                                        <span className={`text-xs px-2 py-1 rounded-full font-bold w-fit ${f.role === 'HOD' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {f.role}
                                        </span>
                                        {f.areaOfExpertise && (
                                            <span className="text-xs text-gray-500 font-medium">
                                                {f.areaOfExpertise}
                                            </span>
                                        )}
                                    </div>
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
                                                    showNotification("Faculty deleted successfully");
                                                } catch (e) {
                                                    showNotification('Failed to delete: ' + e, 'error');
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
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                <select
                                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                                    value={formData.gender}
                                    onChange={e => setFormData({ ...formData, gender: e.target.value })}
                                >
                                    <option value="M">Male</option>
                                    <option value="F">Female</option>
                                    <option value="O">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Area of Expertise</label>
                                <input
                                    type="text"
                                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                                    placeholder="e.g. Cardiology, Neurology"
                                    value={formData.areaOfExpertise}
                                    onChange={e => setFormData({ ...formData, areaOfExpertise: e.target.value })}
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
