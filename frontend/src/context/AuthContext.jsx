import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';


const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Init: Check local storage
    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (token && userData) {
            // Optional: Verify token expiry
            setUser(JSON.parse(userData));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        console.log("AuthContext: Attempting login for", email);
        try {
            const response = await api.post('/auth/login', { email, password });
            console.log("AuthContext: Response Received", response.data);

            if (response.data.success) {
                const { token, user } = response.data;
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                setUser(user);
                return true;
            }
        } catch (error) {
            console.error("AuthContext: Login failed", error);
            throw error.response?.data?.error || 'Login Failed';
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
