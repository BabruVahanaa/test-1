
import React, { Fragment } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Calendar, CalendarPlus, Users, Package, CreditCard, Store, LayoutDashboard, UserCircle, Eye, X } from 'lucide-react';

interface SidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    onPreviewClick: () => void;
}

const mainNav = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Schedule', href: '/schedule', icon: Calendar },
    { name: 'Events', href: '/events', icon: CalendarPlus },
    { name: 'Customers', href: '/customers', icon: Users },
];

const salesNav = [
    { name: 'Bundles', href: '/bundles', icon: Package },
    { name: 'Memberships', href: '/memberships', icon: CreditCard },
];

const settingsNav = [
    { name: 'Storefront', href: '/storefront', icon: Store },
    { name: 'Payments', href: '/payments', icon: LayoutDashboard },
    { name: 'Accounts', href: '/accounts', icon: UserCircle },
];

const NavItem: React.FC<{item: {name: string, href: string, icon: React.ElementType}, onClick: () => void}> = ({ item, onClick }) => (
    <NavLink
        to={item.href}
        onClick={onClick}
        className={({ isActive }) =>
            `flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${
                isActive
                    ? 'bg-protribe-teal text-white'
                    : 'text-protribe-gray-dark dark:text-protribe-gray-light hover:bg-protribe-gray-light dark:hover:bg-protribe-gray-600'
            }`
        }
    >
        <item.icon className="mr-3 h-5 w-5" aria-hidden="true" />
        {item.name}
    </NavLink>
);

const SidebarContent: React.FC<{onClick: () => void, onPreviewClick: () => void}> = ({ onClick, onPreviewClick }) => {
    return (
        <div className="flex flex-col flex-1 h-full bg-white dark:bg-protribe-gray-700 border-r border-gray-200 dark:border-protribe-gray-800">
             <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-protribe-gray-800">
                <span className="text-xl font-bold text-protribe-teal">protribe</span>
                <button
                    onClick={() => onClick()}
                    className="text-protribe-gray-dark dark:text-protribe-gray-light md:hidden"
                >
                    <X size={24} />
                </button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
                <nav className="flex-1 space-y-1">
                    {mainNav.map((item) => <NavItem key={item.name} item={item} onClick={onClick} />)}
                </nav>
                <div className="mt-6">
                    <h3 className="px-3 text-xs font-semibold text-protribe-gray dark:text-protribe-gray-400 uppercase tracking-wider">
                        Sales
                    </h3>
                    <nav className="mt-2 space-y-1">
                        {salesNav.map((item) => <NavItem key={item.name} item={item} onClick={onClick} />)}
                    </nav>
                </div>
                <div className="mt-6">
                    <h3 className="px-3 text-xs font-semibold text-protribe-gray dark:text-protribe-gray-400 uppercase tracking-wider">
                        Settings
                    </h3>
                    <nav className="mt-2 space-y-1">
                        {settingsNav.map((item) => <NavItem key={item.name} item={item} onClick={onClick} />)}
                    </nav>
                </div>
            </div>
            <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-protribe-gray-800">
                 <button
                    onClick={() => {
                        onPreviewClick();
                        onClick(); // Also closes the sidebar on mobile
                    }}
                    className="w-full flex items-center text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light hover:bg-protribe-gray-light dark:hover:bg-protribe-gray-600 p-2 rounded-md"
                >
                    <Eye className="mr-3 h-5 w-5" aria-hidden="true" />
                    Preview Storefront
                </button>
            </div>
        </div>
    );
};


const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen, onPreviewClick }) => {
    return (
        <Fragment>
            {/* Mobile sidebar */}
            <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
                <div className="relative flex-1 flex flex-col max-w-xs w-full">
                     <SidebarContent onClick={() => setSidebarOpen(false)} onPreviewClick={onPreviewClick} />
                </div>
                 <div className="flex-shrink-0 w-14" aria-hidden="true" onClick={() => setSidebarOpen(false)}>
                    {/* Dummy element to close sidebar on click outside */}
                </div>
            </div>

            {/* Static sidebar for desktop */}
            <div className="hidden md:flex md:flex-shrink-0">
                <div className="flex flex-col w-64">
                    <SidebarContent onClick={() => {}} onPreviewClick={onPreviewClick} />
                </div>
            </div>
        </Fragment>
    );
};

export default Sidebar;