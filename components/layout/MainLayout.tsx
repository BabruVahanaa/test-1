
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import StorefrontPreviewModal from '../modals/StorefrontPreviewModal';

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    return (
        <div className="flex h-screen bg-protribe-gray-extralight dark:bg-protribe-gray-800 text-protribe-gray-dark dark:text-protribe-gray-light">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onPreviewClick={() => setIsPreviewOpen(true)} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header setSidebarOpen={setSidebarOpen} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-protribe-gray-extralight dark:bg-protribe-gray-900 p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
             {/* Floating Action Buttons */}
            <div className="fixed bottom-16 right-5 z-40">
                <button className="bg-white p-3 rounded-full shadow-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 4h5v5"/><path d="m15 19-6-6"/><path d="M9 4v5h5"/></svg>
                </button>
            </div>
            <div className="fixed bottom-5 right-5 z-40">
                <button className="bg-white p-3 rounded-full shadow-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z"/><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"/></svg>
                </button>
            </div>
            <StorefrontPreviewModal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} />
        </div>
    );
};

export default MainLayout;