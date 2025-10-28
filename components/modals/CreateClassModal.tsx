import React, { useState, useEffect } from 'react';
import { X, MapPin, Users, Lock, Unlock, Briefcase, Info, ChevronUp, ChevronDown } from 'lucide-react';
// FIX: Updated import path for Class type to resolve circular dependency.
import type { Class } from '../../contexts/EventContext';
import { useSettings, currencySymbols } from '../../contexts/SettingsContext';

interface CreateClassModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (classData: Omit<Class, 'id' | 'status'> & { id?: number }) => void;
    classToEdit?: Class | null;
}

const initialClassState: Omit<Class, 'id' | 'status'> = {
    title: '',
    description: '',
    duration: '60',
    price: '50',
    location: '',
    isVirtual: false,
    maxEntries: 10,
    schedule: {
        days: [],
        startTime: '',
        startDate: '',
        endDate: '',
    },
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

const DayButton: React.FC<{ day: string; selected: boolean; onClick: () => void; }> = ({ day, selected, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`w-10 h-10 rounded-full border text-sm font-medium transition-colors ${
            selected 
            ? 'bg-protribe-teal text-white border-protribe-teal' 
            : 'bg-white dark:bg-protribe-gray-800 border-gray-300 dark:border-protribe-gray-600 hover:bg-gray-100 dark:hover:bg-protribe-gray-700'
        }`}
    >
        {day.charAt(0)}
    </button>
)

const CreateClassModal: React.FC<CreateClassModalProps> = ({ isOpen, onClose, onSave, classToEdit }) => {
    const [classData, setClassData] = useState(initialClassState);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const { currency } = useSettings();
    const isEditing = !!classToEdit;
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    useEffect(() => {
        if (isEditing) {
            setClassData(classToEdit);
        } else {
            setClassData(initialClassState);
        }
    }, [classToEdit, isEditing, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        if (name.startsWith('schedule.')) {
            const field = name.split('.')[1];
            setClassData(prev => ({
                ...prev,
                schedule: { ...prev.schedule, [field]: value }
            }));
        } else if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setClassData(prev => ({ ...prev, [name]: checked }));
        } else {
            const parsedValue = (e.target as HTMLInputElement).type === 'number' ? parseInt(value, 10) || 0 : value;
            setClassData(prev => ({ ...prev, [name]: parsedValue }));
        }
    };
    
    const handleDayToggle = (day: string) => {
        const currentDays = classData.schedule.days;
        const newDays = currentDays.includes(day)
            ? currentDays.filter(d => d !== day)
            : [...currentDays, day];
        setClassData(prev => ({
            ...prev,
            schedule: { ...prev.schedule, days: newDays }
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(classData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-protribe-gray-700 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="sticky top-0 bg-white dark:bg-protribe-gray-700 p-6 border-b border-gray-200 dark:border-protribe-gray-600 flex justify-between items-center z-10">
                    <h2 className="text-xl font-bold text-protribe-gray-extradark dark:text-white">{isEditing ? 'Edit Class' : 'Create New Class'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-protribe-gray-light dark:hover:text-white">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-5">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light mb-1">Class Title</label>
                            <input type="text" id="title" name="title" value={classData.title} onChange={handleChange} required className={`${inputClasses} px-3 py-2`} />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light mb-1">Description</label>
                            <textarea id="description" name="description" value={classData.description} onChange={handleChange} rows={3} className={`${inputClasses} px-3 py-2 resize-none`}></textarea>
                        </div>

                        {/* Schedule Section */}
                        <div className="p-4 rounded-md border border-gray-200 dark:border-protribe-gray-600 bg-gray-50 dark:bg-protribe-gray-800/50 space-y-4">
                             <h3 className="font-semibold text-protribe-gray-extradark dark:text-white">Schedule</h3>
                             <div>
                                <label className="block text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light mb-2">Repeats On</label>
                                <div className="flex justify-between">
                                    {daysOfWeek.map(day => (
                                        <DayButton key={day} day={day} selected={classData.schedule.days.includes(day)} onClick={() => handleDayToggle(day)} />
                                    ))}
                                </div>
                             </div>
                             <div>
                                <label htmlFor="schedule.startTime" className="block text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light mb-1">Start Time</label>
                                <input type="time" id="schedule.startTime" name="schedule.startTime" value={classData.schedule.startTime} onChange={handleChange} required className={`${inputClasses} px-3 py-2`} />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="schedule.startDate" className="block text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light mb-1">Start Date</label>
                                    <input type="date" id="schedule.startDate" name="schedule.startDate" value={classData.schedule.startDate} onChange={handleChange} required className={`${inputClasses} px-3 py-2`} />
                                </div>
                                <div>
                                    <label htmlFor="schedule.endDate" className="block text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light mb-1">End Date (Optional)</label>
                                    <input type="date" id="schedule.endDate" name="schedule.endDate" value={classData.schedule.endDate} onChange={handleChange} className={`${inputClasses} px-3 py-2`} />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="duration" className="block text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light mb-1">Duration (min)</label>
                                <input type="number" id="duration" name="duration" value={classData.duration} onChange={handleChange} required className={`${inputClasses} px-3 py-2`} />
                            </div>
                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light mb-1">Price ({currencySymbols[currency]})</label>
                                <input type="number" id="price" name="price" value={classData.price} onChange={handleChange} required className={`${inputClasses} px-3 py-2`} />
                            </div>
                            <div>
                                <label htmlFor="maxEntries" className="block text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light mb-1">Capacity</label>
                                <input type="number" id="maxEntries" name="maxEntries" value={classData.maxEntries} onChange={handleChange} min="1" required className={`${inputClasses} px-3 py-2`} />
                            </div>
                        </div>
                        
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label htmlFor="location" className="block text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light">Location</label>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-protribe-gray-dark dark:text-protribe-gray-light">Virtual</span>
                                    <Toggle name="isVirtual" checked={classData.isVirtual} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="relative">
                                <input type="text" id="location" name="location" value={classData.location} onChange={handleChange} placeholder={classData.isVirtual ? "e.g., Zoom Link" : "e.g., 123 Main St, Anytown"} className={`${inputClasses} pl-9 pr-3 py-2`} />
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light mb-2">Payment Options</label>
                            <div className="flex items-center space-x-6">
                               <div className="flex items-center space-x-2">
                                    <Toggle name="allowCash" checked={classData.allowCash} onChange={handleChange} />
                                    <span className="text-sm text-protribe-gray-dark dark:text-protribe-gray-light">Accept Cash</span>
                               </div>
                               <div className="flex items-center space-x-2">
                                    <Toggle name="allowStripe" checked={classData.allowStripe} onChange={handleChange} />
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
                                        {classData.isPublic ? <Unlock size={16} /> : <Lock size={16} />}
                                        <span>{classData.isPublic ? 'Public Class' : 'Private Class'}</span>
                                        <span title="Public classes are visible on your storefront.">
                                            <Info size={14} className="text-gray-400" />
                                        </span>
                                     </label>
                                     <Toggle name="isPublic" checked={classData.isPublic} onChange={handleChange} />
                                </div>

                                <div className="flex items-center justify-between">
                                     <label htmlFor="allowRescheduling" className="flex items-center space-x-2 text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light cursor-pointer">
                                        <Briefcase size={16} />
                                        <span>Allow Rescheduling</span>
                                     </label>
                                     <Toggle name="allowRescheduling" checked={classData.allowRescheduling} onChange={handleChange} />
                                </div>

                                {classData.allowRescheduling && (
                                     <div>
                                        <label htmlFor="rescheduleHours" className="block text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light mb-1">Clients can reschedule up to (hours before)</label>
                                        <input type="number" id="rescheduleHours" name="rescheduleHours" value={classData.rescheduleHours} onChange={handleChange} min="1" required className={`${inputClasses} px-3 py-2`} />
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
                            {isEditing ? 'Update Class' : 'Save Class'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateClassModal;