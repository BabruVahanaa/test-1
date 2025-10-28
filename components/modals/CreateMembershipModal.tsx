import React, { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import { Membership, Session, Class, AppointmentType } from '../../contexts/EventContext';
import { useSettings, currencySymbols } from '../../contexts/SettingsContext';

interface CreateMembershipModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (membership: Omit<Membership, 'id' | 'status'> & { id?: number }) => void;
    membershipToEdit?: Membership | null;
    availableEvents: {
        sessions: Session[];
        classes: Class[];
        appointmentTypes: AppointmentType[];
    };
}

const initialMembershipState: Omit<Membership, 'id' | 'status'> = {
    title: '',
    description: '',
    price: '',
    billingInterval: 'monthly',
    includedSessionIds: [],
    includedClassIds: [],
    includedAppointments: [],
};

const inputClasses = "w-full bg-white dark:bg-protribe-gray-800 border border-gray-300 dark:border-protribe-gray-600 rounded-md shadow-sm text-protribe-gray-extradark dark:text-protribe-gray-light placeholder-protribe-gray focus:outline-none focus:ring-2 focus:ring-protribe-green-light focus:border-protribe-teal sm:text-sm transition-shadow";

const CreateMembershipModal: React.FC<CreateMembershipModalProps> = ({ isOpen, onClose, onSave, membershipToEdit, availableEvents }) => {
    const [membershipData, setMembershipData] = useState(initialMembershipState);
    const [activeTab, setActiveTab] = useState<'sessions' | 'classes' | 'appointments'>('sessions');
    const { currency } = useSettings();
    const isEditing = !!membershipToEdit;

    useEffect(() => {
        setMembershipData(isEditing ? membershipToEdit : initialMembershipState);
    }, [membershipToEdit, isEditing, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setMembershipData(prev => ({ ...prev, [name]: value }));
    };

    const handleInclusionToggle = (type: 'sessions' | 'classes' | 'appointments', id: number) => {
        let key: keyof typeof membershipData;
        if (type === 'sessions') key = 'includedSessionIds';
        else if (type === 'classes') key = 'includedClassIds';
        else key = 'includedAppointments';

        setMembershipData(prev => {
            const currentItems = prev[key] as {id: number, quantity: number | 'unlimited'}[];
            const isIncluded = currentItems.some(item => item.id === id);
            
            const newItems = isIncluded
                ? currentItems.filter(item => item.id !== id)
                : [...currentItems, { id, quantity: 1 }];
            
            return { ...prev, [key]: newItems };
        });
    };
    
    const handleQuantityChange = (type: 'sessions' | 'classes' | 'appointments', id: number, quantity: string) => {
        let key: keyof typeof membershipData;
        if (type === 'sessions') key = 'includedSessionIds';
        else if (type === 'classes') key = 'includedClassIds';
        else key = 'includedAppointments';

        setMembershipData(prev => ({
            ...prev,
            [key]: (prev[key] as {id: number, quantity: any}[]).map(item =>
                item.id === id ? { ...item, quantity: quantity === 'unlimited' ? 'unlimited' : Math.max(1, parseInt(quantity) || 1) } : item
            ),
        }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(membershipData);
        onClose();
    };

    const tabClasses = (isActive: boolean) => 
        `px-4 py-2 text-sm font-medium rounded-t-lg transition-colors focus:outline-none ${
            isActive
                ? 'bg-white dark:bg-protribe-gray-800 text-protribe-teal border-gray-200 dark:border-protribe-gray-600 border-b-0'
                : 'bg-gray-50 dark:bg-protribe-gray-900 text-gray-500 hover:text-gray-700'
        }`;

    if (!isOpen) return null;
    
    const renderInclusionList = (type: 'sessions' | 'classes' | 'appointments') => {
        let items: any[], includedItems: {id: number, quantity: any}[], key: keyof typeof membershipData;

        if (type === 'sessions') {
            items = availableEvents.sessions;
            key = 'includedSessionIds';
            includedItems = membershipData.includedSessionIds;
        } else if (type === 'classes') {
            items = availableEvents.classes;
            key = 'includedClassIds';
            includedItems = membershipData.includedClassIds;
        } else {
            items = availableEvents.appointmentTypes;
            key = 'includedAppointments';
            includedItems = membershipData.includedAppointments;
        }

        return items.map(item => {
            const includedItem = includedItems.find(i => i.id === item.id);
            const isChecked = !!includedItem;
            
            return (
                 <div key={item.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-protribe-gray-700/50">
                    <label className="flex items-center space-x-3 cursor-pointer">
                        <input type="checkbox" checked={isChecked} onChange={() => handleInclusionToggle(type, item.id)} className="h-4 w-4 text-protribe-teal border-gray-300 rounded focus:ring-protribe-teal"/>
                        <span className="text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light">{item.title}</span>
                    </label>
                    {isChecked && (
                        <div className="flex items-center space-x-2">
                             <input
                                type="number"
                                min="1"
                                disabled={includedItem.quantity === 'unlimited'}
                                value={includedItem.quantity === 'unlimited' ? '' : includedItem.quantity}
                                onChange={(e) => handleQuantityChange(type, item.id, e.target.value)}
                                className={`${inputClasses} w-16 text-center px-1 py-1 disabled:bg-gray-200 dark:disabled:bg-protribe-gray-700`}
                                onClick={(e) => e.stopPropagation()}
                            />
                            <label className="flex items-center space-x-1.5 text-sm text-protribe-gray-dark dark:text-protribe-gray-light">
                                <input
                                    type="checkbox"
                                    checked={includedItem.quantity === 'unlimited'}
                                    onChange={(e) => handleQuantityChange(type, item.id, e.target.checked ? 'unlimited' : '1')}
                                    className="h-4 w-4 text-protribe-teal border-gray-300 rounded focus:ring-protribe-teal"
                                />
                                <span>Unlimited</span>
                            </label>
                        </div>
                    )}
                </div>
            )
        })
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-protribe-gray-700 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="sticky top-0 bg-white dark:bg-protribe-gray-700 p-6 border-b border-gray-200 dark:border-protribe-gray-600 flex justify-between items-center z-10">
                    <h2 className="text-xl font-bold text-protribe-gray-extradark dark:text-white">{isEditing ? 'Edit Membership' : 'Create New Membership'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-protribe-gray-light dark:hover:text-white">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-5">
                         <div>
                            <label htmlFor="title" className="block text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light mb-1">Membership Title</label>
                            <input type="text" id="title" name="title" value={membershipData.title} onChange={handleChange} required className={`${inputClasses} px-3 py-2`} />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light mb-1">Description</label>
                            <textarea id="description" name="description" value={membershipData.description} onChange={handleChange} rows={3} className={`${inputClasses} px-3 py-2 resize-none`}></textarea>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light mb-1">Price ({currencySymbols[currency]})</label>
                                <input type="number" id="price" name="price" value={membershipData.price} onChange={handleChange} placeholder="e.g., 99" required className={`${inputClasses} px-3 py-2`} />
                            </div>
                            <div>
                                <label htmlFor="billingInterval" className="block text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light mb-1">Billing Interval</label>
                                <select id="billingInterval" name="billingInterval" value={membershipData.billingInterval} onChange={handleChange} className={`${inputClasses} px-3 py-2`}>
                                    <option value="monthly">Monthly</option>
                                    <option value="yearly">Yearly</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-md font-semibold text-protribe-gray-extradark dark:text-white mb-2">Included Items (per billing period)</h3>
                            <div className="border border-gray-200 dark:border-protribe-gray-600 rounded-lg">
                                <div className="flex border-b border-gray-200 dark:border-protribe-gray-600 bg-gray-50 dark:bg-protribe-gray-900 rounded-t-lg">
                                    <button type="button" onClick={() => setActiveTab('sessions')} className={tabClasses(activeTab === 'sessions')}>Sessions</button>
                                    <button type="button" onClick={() => setActiveTab('classes')} className={tabClasses(activeTab === 'classes')}>Classes</button>
                                    <button type="button" onClick={() => setActiveTab('appointments')} className={tabClasses(activeTab === 'appointments')}>Appointments</button>
                                </div>
                                <div className="p-4 h-48 overflow-y-auto space-y-2 bg-white dark:bg-protribe-gray-800">
                                    {renderInclusionList(activeTab)}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="sticky bottom-0 bg-gray-50 dark:bg-protribe-gray-800 p-6 border-t border-gray-200 dark:border-protribe-gray-600 flex justify-end items-center space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light bg-white dark:bg-protribe-gray-700 border border-gray-300 dark:border-protribe-gray-500 rounded-md hover:bg-gray-50 dark:hover:bg-protribe-gray-600 shadow-sm">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-protribe-teal rounded-md hover:bg-protribe-green-dark shadow-sm">
                            {isEditing ? 'Update Membership' : 'Save Membership'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateMembershipModal;