import React, { useState, useRef, useEffect } from 'react';
import { Mail, Calendar, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { Customer } from '../../contexts/CustomerContext';

interface CustomerCardProps {
    customer: Customer;
}

const CustomerCard: React.FC<CustomerCardProps> = ({ customer }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    
    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }

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
        <div className="bg-white dark:bg-protribe-gray-700 border border-gray-200 dark:border-protribe-gray-600 rounded-lg shadow-sm flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-protribe-green-light flex items-center justify-center font-bold text-protribe-green-dark flex-shrink-0">
                    {getInitials(customer.name)}
                </div>
                <div>
                    <h3 className="font-semibold text-protribe-gray-extradark dark:text-white">{customer.name}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-protribe-gray-dark dark:text-protribe-gray-light mt-1">
                        <div className="flex items-center gap-1.5">
                            <Mail size={12} />
                            <span>{customer.email}</span>
                        </div>
                         <div className="flex items-center gap-1.5">
                            <Calendar size={12} />
                            <span>Joined: {new Date(customer.signUpDate).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="relative" ref={menuRef}>
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-protribe-gray-600 text-gray-500 dark:text-protribe-gray-light">
                    <MoreVertical size={20} />
                </button>
                 {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-protribe-gray-800 rounded-md shadow-lg border dark:border-protribe-gray-600 z-10">
                        <button className="w-full text-left flex items-center px-4 py-2 text-sm text-protribe-gray-dark dark:text-protribe-gray-light hover:bg-gray-100 dark:hover:bg-protribe-gray-700">
                            <Edit size={14} className="mr-2" /> View Details
                        </button>
                        <div className="border-t border-gray-100 dark:border-protribe-gray-700 my-1"></div>
                        <button className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50">
                            <Trash2 size={14} className="mr-2" /> Delete Customer
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerCard;
