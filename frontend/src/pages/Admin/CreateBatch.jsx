import React, { useState } from 'react';
import { createBatch } from '../../services/adminApi';
import { useNavigate } from 'react-router-dom';

const CreateBatch = () => {
    const navigate = useNavigate();
    const [batchName, setBatchName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [interns, setInterns] = useState([
        { fullName: '', email: '', regNo: '' },
        { fullName: '', email: '', regNo: '' },
        { fullName: '', email: '', regNo: '' },
        { fullName: '', email: '', regNo: '' }
    ]);

    const handleInternChange = (index, field, value) => {
        const newInterns = [...interns];
        newInterns[index][field] = value;
        setInterns(newInterns);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createBatch({ name: batchName, startDate, interns });
            alert('Batch Created Successfully!');
            navigate('/admin/dashboard');
        } catch (error) {
            console.error(error);
            alert('Error creating batch: ' + (error.error || error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Create New Batch</h1>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">Batch Name (e.g., 2024-2025)</label>
                        <input
                            type="text"
                            required
                            className="w-full border p-2 rounded-lg"
                            value={batchName}
                            onChange={(e) => setBatchName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">Start Date</label>
                        <input
                            type="date"
                            required
                            className="w-full border p-2 rounded-lg"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    Intern Details
                    <span className="text-xs font-normal text-gray-500 ml-2 bg-gray-100 px-2 py-1 rounded">Exactly 4 Interns Required</span>
                </h3>

                <div className="space-y-4 mb-8">
                    {interns.map((intern, idx) => (
                        <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Intern #{idx + 1}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    required
                                    className="border p-2 rounded text-sm"
                                    value={intern.fullName}
                                    onChange={(e) => handleInternChange(idx, 'fullName', e.target.value)}
                                />
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    required
                                    className="border p-2 rounded text-sm"
                                    value={intern.email}
                                    onChange={(e) => handleInternChange(idx, 'email', e.target.value)}
                                />
                                <input
                                    type="text"
                                    placeholder="Registration No."
                                    required
                                    className="border p-2 rounded text-sm"
                                    value={intern.regNo}
                                    onChange={(e) => handleInternChange(idx, 'regNo', e.target.value)}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-100">
                    <button type="button" className="text-gray-600 px-4 py-2 hover:bg-gray-100 rounded-lg mr-2">Cancel</button>
                    <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium">
                        Create & Send Student Codes
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateBatch;
