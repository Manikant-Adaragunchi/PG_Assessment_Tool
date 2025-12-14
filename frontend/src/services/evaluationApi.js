import api from './api';

// Surgery
export const getSurgeryAttempts = async (internId) => {
    try {
        const response = await api.get(`/surgery/${internId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const addSurgeryAttempt = async (internId, attemptData) => {
    try {
        const response = await api.post(`/surgery/${internId}/attempts`, attemptData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const updateSurgeryAttempt = async (internId, attemptNumber, attemptData) => {
    try {
        const response = await api.put(`/surgery/${internId}/attempts/${attemptNumber}`, attemptData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const acknowledgeSurgeryAttempt = async (internId, attemptNumber) => {
    try {
        const response = await api.post(`/surgery/${internId}/attempts/${attemptNumber}/acknowledge`, {});
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// OPD
export const getOpdAttempts = async (moduleCode, internId) => {
    try {
        // Backend doesn't have a specific GET for OPD attempts yet in the routes list I saw?
        // Checking routes: router.get('/surgery/:internId') exists. 
        // Logic for OPD GET seems missing or I missed it. 
        // I'll add a placeholder or assume I need to add that endpoint too.
        // Spec says: router.post('/opd/:moduleCode/:internId/attempts') exists.
        // Let's assume we need to add GET.
        const response = await api.get(`/opd/${moduleCode}/${internId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const addOpdAttempt = async (moduleCode, internId, attemptData) => {
    try {
        const response = await api.post(`/opd/${moduleCode}/${internId}/attempts`, attemptData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const acknowledgeOpdAttempt = async (moduleCode, internId, attemptNumber) => {
    try {
        const response = await api.post(`/opd/${moduleCode}/${internId}/attempts/${attemptNumber}/acknowledge`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// ACADEMIC
export const getAcademicAttempts = async (internId) => {
    try {
        const response = await api.get(`/academic/${internId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const addAcademicAttempt = async (internId, attemptData) => {
    try {
        const response = await api.post(`/academic/${internId}/attempts`, attemptData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const acknowledgeAcademicAttempt = async (internId, attemptNumber) => {
    try {
        const response = await api.post(`/academic/${internId}/attempts/${attemptNumber}/acknowledge`, {});
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// WET LAB
export const getWetlabAttempts = async (internId) => {
    try {
        const response = await api.get(`/wetlab/${internId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const addWetlabAttempt = async (internId, attemptData) => {
    try {
        const response = await api.post(`/wetlab/${internId}/attempts`, attemptData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const updateWetlabAttempt = async (internId, attemptNumber, attemptData) => {
    try {
        const response = await api.put(`/wetlab/${internId}/attempts/${attemptNumber}`, attemptData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const acknowledgeWetlabAttempt = async (internId, attemptNumber) => {
    try {
        const response = await api.post(`/wetlab/${internId}/attempts/${attemptNumber}/acknowledge`, {});
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const validateIntern = async (identifier) => {
    try {
        const response = await api.get(`/interns/validate/${identifier}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
