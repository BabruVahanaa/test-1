import React, { useState, useRef, useEffect } from 'react';
import { Clock, Link, MoreVertical, Edit, Trash2, Play, Pause, Copy } from 'lucide-react';
// FIX: Updated import path for AppointmentType to resolve circular dependency.
import type { AppointmentType } from '../../contexts/EventContext';

interface AppointmentCardProps {
    appointmentType: AppointmentType;
    onEdit: (appointmentType: AppointmentType) => void;
    onDelete: (id: number) => void;
    onTogglePause: (id: number) => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointmentType, onEdit, onDelete, onTogglePause }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const statusStyles = {
        active: {
            borderColor: 'border-protribe-teal',
            badgeBg: 'bg-green-100 dark:bg-green-900',
            badgeText: 'text-green-800 dark:text-green-200',
            label: 'Active'
        },
        paused: {
            borderColor: 'border-protribe-gray',
            badgeBg: 'bg-yellow-100 dark:bg-yellow-900',
            badgeText: 'text-yellow-800 dark:text-yellow-200',
            label: 'Paused'
        }
    };
    
    const currentStatus = statusStyles[appointmentType.status];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fullLink = `protribe.io/your-name/${appointmentType.customLink}`;
    const handleCopyLink = () => {
        navigator.clipboard.writeText(fullLink);
        // Optional: Show a toast notification
        setIsMenuOpen(false);
    };

    return (
        <div className={`bg-white dark:bg-protribe-gray-700 border-l-4 ${currentStatus.borderColor} border border-gray-200 dark:border-protribe-gray-600 rounded-lg shadow-sm flex flex-col`}>
            <div className="p-4 flex-grow">
                <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-lg text-protribe-gray-extradark dark:text-white flex-1 pr-2">{appointmentType.title}</h3>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                         <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${currentStatus.badgeBg} ${currentStatus.badgeText}`}>
                            {currentStatus.label}
                        </span>
                        <div className="relative" ref={menuRef}>
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-protribe-gray-600 text-gray-500 dark:text-protribe-gray-light">
                                <MoreVertical size={20} />
                            </button>
                            {isMenuOpen && (
                                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-protribe-gray-800 rounded-md shadow-lg border dark:border-protribe-gray-600 z-10">
                                    <button onClick={handleCopyLink} className="w-full text-left flex items-center px-4 py-2 text-sm text-protribe-gray-dark dark:text-protribe-gray-light hover:bg-gray-100 dark:hover:bg-protribe-gray-700">
                                        <Copy size={14} className="mr-2" /> Copy Link
                                    </button>
                                    <button onClick={() => { onEdit(appointmentType); setIsMenuOpen(false); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-protribe-gray-dark dark:text-protribe-gray-light hover:bg-gray-100 dark:hover:bg-protribe-gray-700">
                                        <Edit size={14} className="mr-2" /> Edit
                                    </button>
                                     <button onClick={() => { onTogglePause(appointmentType.id); setIsMenuOpen(false); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-protribe-gray-dark dark:text-protribe-gray-light hover:bg-gray-100 dark:hover:bg-protribe-gray-700">
                                        {appointmentType.status === 'active' ? <Pause size={14} className="mr-2" /> : <Play size={14} className="mr-2" />}
                                        {appointmentType.status === 'active' ? 'Pause' : 'Resume'}
                                    </button>
                                    <div className="border-t border-gray-100 dark:border-protribe-gray-700 my-1"></div>
                                    <button onClick={() => { onDelete(appointmentType.id); setIsMenuOpen(false); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50">
                                        <Trash2 size={14} className="mr-2" /> Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <p className="text-sm text-protribe-gray-dark dark:text-protribe-gray-light mt-1 line-clamp-2">{appointmentType.description || "No description provided."}</p>
            </div>
            <div className="p-4 bg-protribe-gray-extralight dark:bg-protribe-gray-800/50 border-t border-gray-200 dark:border-protribe-gray-600 rounded-b-lg flex flex-wrap gap-x-6 gap-y-3 items-center">
                 <div className="flex items-center space-x-1.5 text-sm text-protribe-gray-dark dark:text-protribe-gray-light">
                    <Clock size={14} className="flex-shrink-0" />
                    <span className="truncate">{appointmentType.duration} min</span>
                </div>
                 <div className="flex items-center space-x-1.5 text-sm text-protribe-teal hover:underline">
                    <Link size={14} className="flex-shrink-0" />
                    <a href="#" className="truncate" onClick={(e) => e.preventDefault()}>{fullLink}</a>
                </div>
            </div>
        </div>
    );
};

export default AppointmentCard;