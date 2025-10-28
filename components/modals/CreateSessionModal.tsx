import React, { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronUp, MapPin, Users, Lock, Unlock, Briefcase, Info } from 'lucide-react';
// FIX: Updated import path for Session type to resolve circular dependency.
import type { Session } from '../../contexts/EventContext';
import { useSettings, currencySymbols } from '../../contexts/SettingsContext';

interface CreateSessionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (session: Omit<Session, 'id' | 'status'> & { id?: number }) => void;
    sessionToEdit?: Session | null;
    defaultDate?: Date | null;
}

const initialSessionState: Omit<Session, 'id' | 'status'> = {
    title: '',
    description: '',
    date: '',
    time: '',
    duration: '60',
    price: '50',
    sessionType: '1-on-1',
    location: '',
    isVirtual: false,
    maxEntries: 1,
    isPublic: true,
    allowCash: true,
    allowStripe: false,
    allowRescheduling: false,
    rescheduleHours: 24,
};

const inputClasses = "w-full bg-white dark:bg-protribe-gray-800 border border-gray-300 dark:border-protribe-gray-600 rounded-md shadow-sm text-protribe-gray-extradark dark:text-protribe-gray-light placeholder-protribe-gray focus:outline-none focus:ring-2 focus:ring-protribe-green-light focus:border-protribe-teal sm:text-sm transition-shadow";

const Toggle: React.FC<{name: string; checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;}> = ({ name, checked, onChange }) => (
    <label htmlFor={name} className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" id={name} name={name} checked={checked} onChange={onChange} className="sr-only peer" />
        <div className="w-11 h-6 bg-gray-200 dark:bg-protribe-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-teal-300 dark:peer-focus:ring-protribe-teal peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-protribe-teal"></div>
    </label>
);

const CreateSessionModal: React.FC<CreateSessionModalProps> = ({ isOpen, onClose, onSave, sessionToEdit, defaultDate }) => {
    const [sessionData, setSessionData] = useState(initialSessionState);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const { currency } = useSettings();
    const isEditing = !!sessionToEdit;

    useEffect(() => {
        if (isEditing) {
            setSessionData(sessionToEdit);
        } else {
            const newInitialState = { ...initialSessionState };
            if (defaultDate) {
                newInitialState.date = defaultDate.toISOString().split('T')[0];
            }
            setSessionData(newInitialState);
        }
    }, [sessionToEdit, isEditing, isOpen, defaultDate]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        let newState = { ...sessionData };

        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            newState = { ...newState, [name]: checked };
        } else {
            const parsedValue = (e.target as HTMLInputElement).type === 'number' ? parseInt(value, 10) || 0 : value;
            newState = { ...newState, [name]: parsedValue };
        }

        if (name === 'sessionType') {
            if (value === '1-on-1') {
                newState.maxEntries = 1;
            } else if (value === 'Group' && sessionData.maxEntries <= 1) {
                newState.maxEntries = 10;
            }
        }
        
        setSessionData(newState);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(sessionData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-protribe-gray-700 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="sticky top-0 bg-white dark:bg-protribe-gray-700 p-6 border-b border-gray-200 dark:border-protribe-gray-600 flex justify-between items-center z-10">
                    <h2 className="text-xl font-bold text-protribe-gray-extradark dark:text-white">{isEditing ? 'Edit Session' : 'Create New Session'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-protribe-gray-light dark:hover:text-white">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-5">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light mb-1">Session Title</label>
                            <input type="text" id="title" name="title" value={sessionData.title} onChange={handleChange} required className={`${inputClasses} px-3 py-2`} />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light mb-1">Description</label>
                            <textarea id="description" name="description" value={sessionData.description} onChange={handleChange} rows={4} className={`${inputClasses} px-3 py-2 resize-none`}></textarea>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="date" className="block text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light mb-1">Date</label>
                                <input type="date" id="date" name="date" value={sessionData.date} onChange={handleChange} required className={`${inputClasses} px-3 py-2`} />
                            </div>
                            <div>
                                <label htmlFor="time" className="block text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light mb-1">Time</label>
                                <input type="time" id="time" name="time" value={sessionData.time} onChange={handleChange} required className={`${inputClasses} px-3 py-2`} />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="duration" className="block text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light mb-1">Duration (minutes)</label>
                                <input type="number" id="duration" name="duration" value={sessionData.duration} onChange={handleChange} required className={`${inputClasses} px-3 py-2`} />
                            </div>
                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light mb-1">Price ({currencySymbols[currency]})</label>
                                <input type="number" id="price" name="price" value={sessionData.price} onChange={handleChange} required className={`${inputClasses} px-3 py-2`} />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="sessionType" className="block text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light mb-1">Session Type</label>
                                <select id="sessionType" name="sessionType" value={sessionData.sessionType} onChange={handleChange} className={`${inputClasses} px-3 py-2`}>
                                    <option>1-on-1</option>
                                    <option>Group</option>
                                </select>
                            </div>
                            {sessionData.sessionType === 'Group' && (
                                <div>
                                    <label htmlFor="maxEntries" className="block text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light mb-1">Max Entries</label>
                                    <input type="number" id="maxEntries" name="maxEntries" value={sessionData.maxEntries} onChange={handleChange} min="1" required className={`${inputClasses} px-3 py-2`} />
                                </div>
                            )}
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label htmlFor="location" className="block text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light">Location</label>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-protribe-gray-dark dark:text-protribe-gray-light">Virtual</span>
                                    <Toggle name="isVirtual" checked={sessionData.isVirtual} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="relative">
                                <input type="text" id="location" name="location" value={sessionData.location} onChange={handleChange} placeholder={sessionData.isVirtual ? "e.g., Zoom Link" : "e.g., 123 Main St, Anytown"} className={`${inputClasses} pl-9 pr-3 py-2`} />
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                            </div>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light mb-2">Payment Options</label>
                            <div className="flex items-center space-x-6">
                               <div className="flex items-center space-x-2">
                                    <Toggle name="allowCash" checked={sessionData.allowCash} onChange={handleChange} />
                                    <span className="text-sm text-protribe-gray-dark dark:text-protribe-gray-light">Accept Cash</span>
                               </div>
                               <div className="flex items-center space-x-2">
                                    <Toggle name="allowStripe" checked={sessionData.allowStripe} onChange={handleChange} />
                                    <span className="text-sm text-protribe-gray-dark dark:text-protribe-gray-light">Accept Stripe</span>
                               </div>
                            </div>
                        </div>
                        <div>
                            <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center space-x-1 text-sm font-medium text-protribe-teal hover:underline">
                                {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                <span>Advanced Settings</span>
                            </button>
                        </div>

                        {showAdvanced && (
                             <div className="space-y-5 pt-4 border-t border-gray-200 dark:border-protribe-gray-600">
                                <div className="flex items-center justify-between">
                                     <label htmlFor="isPublic" className="flex items-center space-x-2 text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light cursor-pointer">
                                        {sessionData.isPublic ? <Unlock size={16} /> : <Lock size={16} />}
                                        <span>{sessionData.isPublic ? 'Public Session' : 'Private Session'}</span>
                                        {/* FIX: The `title` prop is not supported on lucide-react icons. Wrapped the icon in a span to provide a tooltip. */}
                                        <span title="Public sessions are visible on your storefront.">
                                            <Info size={14} className="text-gray-400" />
                                        </span>
                                     </label>
                                     <Toggle name="isPublic" checked={sessionData.isPublic} onChange={handleChange} />
                                </div>

                                <div className="flex items-center justify-between">
                                     <label htmlFor="allowRescheduling" className="flex items-center space-x-2 text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light cursor-pointer">
                                        <Briefcase size={16} />
                                        <span>Allow Rescheduling</span>
                                     </label>
                                     <Toggle name="allowRescheduling" checked={sessionData.allowRescheduling} onChange={handleChange} />
                                </div>

                                {sessionData.allowRescheduling && (
                                     <div>
                                        <label htmlFor="rescheduleHours" className="block text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light mb-1">Clients can reschedule up to (hours before)</label>
                                        <input type="number" id="rescheduleHours" name="rescheduleHours" value={sessionData.rescheduleHours} onChange={handleChange} min="1" required className={`${inputClasses} px-3 py-2`} />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="sticky bottom-0 bg-gray-50 dark:bg-protribe-gray-800 p-6 border-t border-gray-200 dark:border-protribe-gray-600 flex justify-end items-center space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light bg-white dark:bg-protribe-gray-700 border border-gray-300 dark:border-protribe-gray-500 rounded-md hover:bg-gray-50 dark:hover:bg-protribe-gray-600 shadow-sm">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-protribe-teal rounded-md hover:bg-protribe-green-dark shadow-sm">
                            {isEditing ? 'Update Session' : 'Save Session'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateSessionModal;