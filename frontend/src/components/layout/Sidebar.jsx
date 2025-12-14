import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getRoleLinks } from '../../utils/roles';
import loginLogo from '../../assets/login_logo.jpg';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const links = getRoleLinks(user?.role);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className="fixed left-0 top-0 h-screen w-72 bg-surface-900 text-white flex flex-col shadow-2xl z-50 font-sans">
            {/* Logo Area */}
            <div className="p-8 pb-4 flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-glow ring-2 ring-white/10 overflow-hidden shrink-0">
                    <img src={loginLogo} alt="SDM Logo" className="w-full h-full object-cover" />
                </div>
                <div>
                    <h1 className="text-sm font-bold tracking-tight leading-tight">SDM Medical Science<br /><span className="text-primary-400">and Hospital</span></h1>
                    <p className="text-[10px] text-surface-400">Assessment Tool</p>
                </div>
            </div>

            {/* Profile Snippet */}
            <div className="mx-6 mb-6 p-4 bg-surface-800 rounded-xl border border-surface-700/50 flex items-center gap-3 group hover:border-surface-600 transition-colors cursor-default">
                <div className="w-10 h-10 rounded-full bg-primary-700 flex items-center justify-center text-sm font-bold text-primary-100 ring-2 ring-surface-900 group-hover:ring-primary-500/30 transition-all">
                    {user?.fullName?.charAt(0) || 'U'}
                </div>
                <div className="overflow-hidden">
                    <p className="text-sm font-semibold truncate group-hover:text-primary-300 transition-colors">{user?.fullName || 'User'}</p>
                    <p className="text-xs text-surface-400 truncate capitalize">{user?.role?.toLowerCase()}</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                {links.map((link) => (
                    <NavLink
                        key={link.path}
                        to={link.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${isActive
                                ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/20 translate-x-1'
                                : 'text-surface-300 hover:bg-surface-800 hover:text-white hover:translate-x-1'
                            }`
                        }
                    >
                        <span className="opacity-70 group-hover:opacity-100 transition-opacity">
                            {/* Placeholder Icons based on label usually, but generic for now */}
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
                        </span>
                        {link.label}
                    </NavLink>
                ))}
            </nav>

            {/* Footer Actions */}
            <div className="p-4 border-t border-surface-800">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-3 text-sm font-medium text-surface-400 hover:text-red-400 hover:bg-surface-800 rounded-lg transition-all"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    Sign Out
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
