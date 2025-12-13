import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import AdminDashboard from './pages/Admin/AdminDashboard';
import CreateBatch from './pages/Admin/CreateBatch';
import BatchList from './pages/Admin/BatchList';
import FacultyList from './pages/Admin/FacultyList';
import InternList from './pages/Admin/InternList';
import SurgeryModule from './pages/Surgery/SurgeryModule';
import OpdModule from './pages/OPD/OpdModule';
import AcademicModule from './pages/Academic/AcademicModule';
import WetLabModule from './pages/WetLab/WetLabModule';
import PgDashboard from './pages/PG/PgDashboard';
import PgMyEvaluation from './pages/PG/PgMyEvaluation';

const PrivateRoute = ({ children }) => {
    const { user } = useAuth();
    // If user is null/undefined, redirect to login
    return user ? children : <Navigate to="/login" />;
};

const DashboardHome = () => (
    <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-2xl font-bold mb-4">Welcome to Dashboard</h2>
        <p className="text-gray-600">Select a module from the sidebar to begin.</p>
    </div>
);



// Need to handle the path structure "/:role/dashboard" vs specific paths in Sidebar
// Sidebar links are absolute "/admin/batches", "/faculty/assessments/surgery"
// So the Route path needs to match.

const AppRoutesFixed = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />

            {/* Admin Dashboard */}
            <Route path="/admin" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="batches" element={<BatchList />} />
                <Route path="batches/create" element={<CreateBatch />} />
                <Route path="faculty" element={<FacultyList />} />
                <Route path="interns" element={<InternList />} />
            </Route>

            {/* Faculty Dashboard */}
            <Route path="/faculty" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
                <Route path="dashboard" element={<DashboardHome />} />
                <Route path="interns" element={<InternList />} />
                <Route path="assessments/surgery" element={<SurgeryModule />} />
                <Route path="assessments/opd" element={<OpdModule />} />
                <Route path="assessments/academic" element={<AcademicModule />} />
                <Route path="assessments/wetlab" element={<WetLabModule />} />
            </Route>

            {/* Intern Dashboard */}
            <Route path="/pg" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
                <Route path="dashboard" element={<PgDashboard />} />
                <Route path="my-evaluations" element={<PgMyEvaluation />} />
                <Route path="pending" element={<PgMyEvaluation />} />
            </Route>

            <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
    );
};

const App = () => (
    <AppRoutesFixed />
);

export default App;
