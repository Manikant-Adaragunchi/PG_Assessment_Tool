import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';

const DashboardLayout = () => {
    return (
        <div className="flex h-screen bg-surface-50 font-sans relative">
            {/* Watermark Background */}
            <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-[0.35]">
                <img
                    src="/hospital-bg.jpg"
                    alt="Watermark"
                    className="w-3/4 max-w-4xl object-contain"
                />
            </div>

            {/* Sidebar Component */}
            <Sidebar />

            {/* Main Content Area with Transparent Overlay if needed, or just let it float over watermark */}
            <main className="flex-1 ml-72 h-screen overflow-y-auto relative z-10 scroll-smooth">
                <div className="p-8 md:p-12 max-w-7xl mx-auto animate-fade-in">
                    {/* Top Bar / Breadcrumb Placeholder could go here */}
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
