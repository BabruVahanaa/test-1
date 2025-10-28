import React, { useState, useRef, useEffect } from 'react';
import { Repeat, Clock, Tag, MoreVertical, Users, Edit, Trash2, Play, Pause } from 'lucide-react';
// FIX: Updated import path for Class type to resolve circular dependency.
import type { Class } from '../../contexts/EventContext';
import { useSettings, currencySymbols } from '../../contexts/SettingsContext';

interface ClassCardProps {
    classItem: Class;
    onEdit: (classItem: Class) => void;
    onDelete: (id: number) => void;
    onTogglePause: (id: number) => void;
}

const InfoPill: React.FC<{ icon: React.ElementType, text: string }> = ({ icon: Icon, text }) => (
    <div className="flex items-center space-x-1.5 text-sm text-protribe-gray-dark dark:text-protribe-gray-light">
        <Icon size={14} className="flex-shrink-0" />
        <span className="truncate">{text}</span>
    </div>
);

const ClassCard: React.FC<ClassCardProps> = ({ classItem, onEdit, onDelete, onTogglePause }) => {
    const { currency, timeZone } = useSettings();
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
    
    const currentStatus = statusStyles[classItem.status];

    const getFormattedSchedule = () => {
        const sortedDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const displayDays = classItem.schedule.days
            .sort((a, b) => sortedDays.indexOf(a) - sortedDays.indexOf(b))
            .join(', ');
        return displayDays || "No days selected";
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`bg-white dark:bg-protribe-gray-700 border-l-4 ${currentStatus.borderColor} border border-gray-200 dark:border-protribe-gray-600 rounded-lg shadow-sm flex flex-col`}>
            <div className="p-4 flex-grow">
                <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-lg text-protribe-gray-extradark dark:text-white flex-1 pr-2">{classItem.title}</h3>
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
                                    <button onClick={() => { onEdit(classItem); setIsMenuOpen(false); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-protribe-gray-dark dark:text-protribe-gray-light hover:bg-gray-100 dark:hover:bg-protribe-gray-700">
                                        <Edit size={14} className="mr-2" /> Edit
                                    </button>
                                     <button onClick={() => { onTogglePause(classItem.id); setIsMenuOpen(false); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-protribe-gray-dark dark:text-protribe-gray-light hover:bg-gray-100 dark:hover:bg-protribe-gray-700">
                                        {classItem.status === 'active' ? <Pause size={14} className="mr-2" /> : <Play size={14} className="mr-2" />}
                                        {classItem.status === 'active' ? 'Pause' : 'Resume'}
                                    </button>
                                    <div className="border-t border-gray-100 dark:border-protribe-gray-700 my-1"></div>
                                    <button onClick={() => { onDelete(classItem.id); setIsMenuOpen(false); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50">
                                        <Trash2 size={14} className="mr-2" /> Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <p className="text-sm text-protribe-gray-dark dark:text-protribe-gray-light mt-1 line-clamp-2">{classItem.description || "No description provided."}</p>
            </div>
            <div className="p-4 bg-protribe-gray-extralight dark:bg-protribe-gray-800/50 border-t border-gray-200 dark:border-protribe-gray-600 rounded-b-lg flex flex-wrap gap-x-6 gap-y-3 items-center">
                <InfoPill icon={Repeat} text={getFormattedSchedule()} />
                {classItem.schedule.startTime && (
                     <InfoPill icon={Clock} text={new Date(`1970-01-01T${classItem.schedule.startTime}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: timeZone })} />
                )}
                <InfoPill icon={Tag} text={`${currencySymbols[currency]}${classItem.price} • ${classItem.duration} min`} />
                <InfoPill icon={Users} text={`Group (${classItem.maxEntries} max)`} />
            </div>
        </div>
    );
};

export default ClassCard;