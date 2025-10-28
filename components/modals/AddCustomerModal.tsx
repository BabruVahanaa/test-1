import React, { useState, useEffect } from 'react';
import { X, User, Mail } from 'lucide-react';
import { Customer } from '../../contexts/CustomerContext';

interface AddCustomerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string, email: string) => { success: boolean, message?: string, customer?: Customer };
    onSuccess?: (customer: Customer) => void;
}

const AddCustomerModal: React.FC<AddCustomerModalProps> = ({ isOpen, onClose, onSave, onSuccess }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setName('');
            setEmail('');
            setError('');
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!name.trim() || !email.trim()) {
            setError('Name and email are required.');
            return;
        }
        const result = onSave(name, email);
        if (result.success && result.customer) {
            if (onSuccess) {
                onSuccess(result.customer);
            }
            onClose();
        } else if (result.message) {
            setError(result.message);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-protribe-gray-700 rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-200 dark:border-protribe-gray-600 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-protribe-gray-extradark dark:text-white">Add New Customer</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-protribe-gray-light dark:hover:text-white">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        {error && <p className="text-sm text-red-600 bg-red-100 dark:bg-red-900/50 p-3 rounded-md">{error}</p>}
                        <div>
                            <label htmlFor="customer-name" className="block text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light mb-1">Full Name</label>
                            <div className="relative">
                                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input id="customer-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-protribe-gray-800 border border-gray-300 dark:border-protribe-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-protribe-teal" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="customer-email" className="block text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light mb-1">Email Address</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input id="customer-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-protribe-gray-800 border border-gray-300 dark:border-protribe-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-protribe-teal" />
                            </div>
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-protribe-gray-800 border-t border-gray-200 dark:border-protribe-gray-600 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium bg-white dark:bg-protribe-gray-700 border border-gray-300 dark:border-protribe-gray-500 rounded-md hover:bg-gray-50 dark:hover:bg-protribe-gray-600">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-protribe-teal rounded-md hover:bg-protribe-green-dark">Save Customer</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCustomerModal;