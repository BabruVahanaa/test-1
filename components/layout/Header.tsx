
import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Copy } from 'lucide-react';

interface HeaderProps {
    setSidebarOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ setSidebarOpen }) => {
    const location = useLocation();
    
    const getTitle = () => {
        const path = location.pathname.replace('/', '');
        if (!path) return 'Dashboard';
        return path.charAt(0).toUpperCase() + path.slice(1);
    };

    return (
        <header className="flex items-center justify-between p-4 bg-white dark:bg-protribe-gray-700 border-b border-gray-200 dark:border-protribe-gray-800 sticky top-0 z-30">
            <div className="flex items-center">
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="text-protribe-gray-dark dark:text-protribe-gray-light md:hidden mr-4"
                >
                    <Menu size={24} />
                </button>
                <h1 className="text-xl font-semibold text-protribe-gray-extradark dark:text-white">{getTitle()}</h1>
            </div>
            <div className="flex items-center space-x-4">
                <button className="hidden sm:flex items-center space-x-2 text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light hover:text-protribe-gray-extradark dark:hover:text-white">
                    <Copy size={16} />
                    <span>Copy Link</span>
                </button>
                <div className="w-9 h-9 rounded-full bg-protribe-green-light flex items-center justify-center font-bold text-protribe-green-dark">
                    DS
                </div>
            </div>
        </header>
    );
};

export default Header;