import React, { useState } from 'react';
import { X, User, Mail, Lock } from 'lucide-react';
import { useCustomer } from '../../contexts/CustomerContext';

interface CustomerSignUpModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSwitchToLogin: () => void;
}

const CustomerSignUpModal: React.FC<CustomerSignUpModalProps> = ({ isOpen, onClose, onSwitchToLogin }) => {
    const { signUp } = useCustomer();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        signUp(name, email);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-protribe-gray-700 rounded-lg shadow-xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 text-center border-b border-gray-200 dark:border-protribe-gray-600 relative">
                    <h2 className="text-xl font-bold text-protribe-gray-extradark dark:text-white">Create an Account</h2>
                     <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-protribe-gray-light dark:hover:text-white">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                     <div>
                        <label htmlFor="signup-name" className="sr-only">Full Name</label>
                        <div className="relative">
                            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                id="signup-name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Full Name"
                                required
                                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-protribe-gray-800 border border-gray-300 dark:border-protribe-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-protribe-teal"
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="signup-email" className="sr-only">Email Address</label>
                        <div className="relative">
                            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                id="signup-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email Address"
                                required
                                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-protribe-gray-800 border border-gray-300 dark:border-protribe-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-protribe-teal"
                            />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="signup-password" className="sr-only">Password</label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                id="signup-password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                required
                                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-protribe-gray-800 border border-gray-300 dark:border-protribe-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-protribe-teal"
                            />
                        </div>
                    </div>
                     <button type="submit" className="w-full py-3 text-sm font-semibold text-white bg-protribe-teal rounded-md hover:bg-protribe-green-dark transition-colors">
                        Create Account
                    </button>
                    <p className="text-center text-sm text-protribe-gray-dark dark:text-protribe-gray-light">
                        Already have an account?{' '}
                        <button type="button" onClick={onSwitchToLogin} className="font-semibold text-protribe-teal hover:underline">
                            Sign In
                        </button>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default CustomerSignUpModal;
