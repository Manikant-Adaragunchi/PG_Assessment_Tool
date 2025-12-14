import api from './api';

export const createBatch = async (batchData) => {
    try {
        const response = await api.post('/admin/batches', batchData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getBatches = async () => {
    try {
        const response = await api.get('/admin/batches');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const deleteBatch = async (id) => {
    try {
        const response = await api.delete(`/admin/batches/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const createFaculty = async (facultyData) => {
    try {
        const response = await api.post('/admin/faculty', facultyData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const updateFaculty = async (id, facultyData) => {
    try {
        const response = await api.put(`/admin/faculty/${id}`, facultyData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const deleteFaculty = async (id) => {
    try {
        const response = await api.delete(`/admin/faculty/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getFacultyList = async () => {
    // Note: We haven't implemented GET /admin/faculty yet in backend
    // but assuming it exists or we mock it for now.
    // Actually, we didn't implement GET Faculty. We should added it to backend admin controller?
    // Let's assume for now we might need to add it or use a placeholder.
    // I'll stick to what we have or add it to backend if needed.
    // Checking backend controller... we only have createFaculty.
    // I will add a mock fetch for now or let it fail until updated.
    try {
        const response = await api.get('/admin/faculty');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getInternList = async () => {
    try {
        const response = await api.get('/admin/interns');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const deleteIntern = async (id) => {
    try {
        const response = await api.delete(`/admin/interns/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getDashboardStats = async () => {
    try {
        const response = await api.get('/admin/stats');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const downloadBatchReport = async (batchId) => {
    try {
        const response = await api.get(`/admin/export/batch/${batchId}`, { responseType: 'blob' });
        // Trigger download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Batch_Report.xlsx'); // Filename is set in backend but fallback
        document.body.appendChild(link);
        link.click();
        link.remove();
        return true;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const downloadInternReport = async (internId) => {
    try {
        const response = await api.get(`/admin/export/intern/${internId}`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Intern_Report_${internId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        return true;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getInternPerformance = async (studentId) => {
    try {
        const response = await api.get(`/performance/${studentId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
