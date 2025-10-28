import React, { useState, useRef, useEffect, useMemo } from 'react';
import { CreditCard, MoreVertical, Edit, Trash2, Play, Pause } from 'lucide-react';
import { Membership, Session, Class, AppointmentType } from '../../contexts/EventContext';
import { useSettings, currencySymbols } from '../../contexts/SettingsContext';

interface MembershipCardProps {
    membership: Membership;
    onEdit: (membership: Membership) => void;
    onDelete: (id: number) => void;
    onTogglePause: (id: number) => void;
    allEvents: {
        sessions: Session[];
        classes: Class[];
        appointmentTypes: AppointmentType[];
    };
}

const MembershipCard: React.FC<MembershipCardProps> = ({ membership, onEdit, onDelete, onTogglePause }) => {
    const { currency } = useSettings();
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
    
    const currentStatus = statusStyles[membership.status];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const includedItemsSummary = useMemo(() => {
        const sessions = membership.includedSessionIds.length;
        const classes = membership.includedClassIds.length;
        const appointments = membership.includedAppointments.length;
        
        return [
            sessions > 0 && `${sessions} Session(s)`,
            classes > 0 && `${classes} Class(es)`,
            appointments > 0 && `${appointments} Appointment(s)`
        ].filter(Boolean).join(' • ');
    }, [membership]);


    return (
        <div className={`bg-white dark:bg-protribe-gray-700 border-l-4 ${currentStatus.borderColor} border border-gray-200 dark:border-protribe-gray-600 rounded-lg shadow-sm flex flex-col`}>
            <div className="p-4 flex-grow">
                <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-lg text-protribe-gray-extradark dark:text-white flex-1 pr-2">{membership.title}</h3>
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
                                    <button onClick={() => { onEdit(membership); setIsMenuOpen(false); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-protribe-gray-dark dark:text-protribe-gray-light hover:bg-gray-100 dark:hover:bg-protribe-gray-700">
                                        <Edit size={14} className="mr-2" /> Edit
                                    </button>
                                     <button onClick={() => { onTogglePause(membership.id); setIsMenuOpen(false); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-protribe-gray-dark dark:text-protribe-gray-light hover:bg-gray-100 dark:hover:bg-protribe-gray-700">
                                        {membership.status === 'active' ? <Pause size={14} className="mr-2" /> : <Play size={14} className="mr-2" />}
                                        {membership.status === 'active' ? 'Pause' : 'Resume'}
                                    </button>
                                    <div className="border-t border-gray-100 dark:border-protribe-gray-700 my-1"></div>
                                    <button onClick={() => { onDelete(membership.id); setIsMenuOpen(false); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50">
                                        <Trash2 size={14} className="mr-2" /> Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                 <p className="text-sm text-protribe-gray-dark dark:text-protribe-gray-light mt-1 mb-4 line-clamp-2">{membership.description || "No description provided."}</p>
                 <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span className="text-3xl font-bold text-protribe-gray-extradark dark:text-white">{currencySymbols[currency]}{membership.price}</span>
                    <span className="text-md font-medium text-protribe-gray">/ {membership.billingInterval === 'monthly' ? 'month' : 'year'}</span>
                 </div>
            </div>
            <div className="p-4 bg-protribe-gray-extralight dark:bg-protribe-gray-800/50 border-t border-gray-200 dark:border-protribe-gray-600 rounded-b-lg">
                <div className="flex items-center space-x-1.5 text-sm text-protribe-gray-dark dark:text-protribe-gray-light">
                    <CreditCard size={14} className="flex-shrink-0" />
                    <span className="truncate font-medium">{includedItemsSummary || "No items included"}</span>
                </div>
            </div>
        </div>
    );
};

export default MembershipCard;