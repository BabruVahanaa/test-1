import React, { useState, useEffect } from 'react';
import { X, MapPin, Link, Plus, Trash2, Calendar, Clock, Briefcase, Info, ChevronUp, ChevronDown } from 'lucide-react';
// FIX: Updated import paths for types to resolve circular dependency.
import type { AppointmentType, WeeklyAvailability, AvailabilitySlot } from '../../contexts/EventContext';
import { useSettings, currencySymbols } from '../../contexts/SettingsContext';

interface CreateAppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (appointment: Omit<AppointmentType, 'id' | 'status'> & { id?: number }) => void;
    appointmentToEdit?: AppointmentType | null;
}

const allDays: WeeklyAvailability['day'][] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const getDefaultAvailability = (): WeeklyAvailability[] =>
  allDays.map(day => ({
    day,
    slots: [{ from: '09:00', to: '17:00' }],
    enabled: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(day),
  }));


const initialAppointmentState: Omit<AppointmentType, 'id' | 'status'> = {
    title: '',
    description: '',
    duration: 30,
    price: '0',
    location: '',
    isVirtual: false,
    customLink: '',
    dateRangeDays: 60,
    weeklyAvailability: getDefaultAvailability(),
    dateOverrides: [],
    allowRescheduling: false,
    rescheduleHours: 24,
};

const inputClasses = "w-full bg-white dark:bg-protribe-gray-800 border border-gray-300 dark:border-protribe-gray-600 rounded-md shadow-sm text-protribe-gray-extradark dark:text-protribe-gray-light placeholder-protribe-gray focus:outline-none focus:ring-2 focus:ring-protribe-green-light focus:border-protribe-teal sm:text-sm transition-shadow";

const Toggle: React.FC<{name: string; checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;}> = ({ name, checked, onChange }) => (
    <label htmlFor={name} className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" id={name} name={name} checked={checked} onChange={onChange} className="sr-only peer" />
        <div className="w-9 h-5 bg-gray-200 dark:bg-protribe-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-teal-300 dark:peer-focus:ring-protribe-teal peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-protribe-teal"></div>
    </label>
);

const Section: React.FC<{title: string, children: React.ReactNode, border?: boolean}> = ({title, children, border = true}) => (
    <div className={border ? 'pt-5' : ''}>
        <h3 className="text-md font-semibold text-protribe-gray-extradark dark:text-white mb-3">{title}</h3>
        <div className="space-y-4">{children}</div>
    </div>
);

const CreateAppointmentModal: React.FC<CreateAppointmentModalProps> = ({ isOpen, onClose, onSave, appointmentToEdit }) => {
    const [appointmentData, setAppointmentData] = useState(initialAppointmentState);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const { currency } = useSettings();
    const isEditing = !!appointmentToEdit;

    useEffect(() => {
        setAppointmentData(isEditing ? appointmentToEdit : initialAppointmentState);
    }, [appointmentToEdit, isEditing, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setAppointmentData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (e.target.type === 'number' ? parseInt(value, 10) || 0 : value)
        }));
    };
    
    const handleAvailabilityChange = (day: WeeklyAvailability['day'], field: keyof AvailabilitySlot, value: string, slotIndex: number) => {
        setAppointmentData(prev => ({
            ...prev,
            weeklyAvailability: prev.weeklyAvailability.map(d => 
                d.day === day 
                ? { ...d, slots: d.slots.map((s, i) => i === slotIndex ? {...s, [field]: value} : s) }
                : d
            )
        }));
    };
    
    const handleDayToggle = (day: WeeklyAvailability['day']) => {
        setAppointmentData(prev => ({
            ...prev,
            weeklyAvailability: prev.weeklyAvailability.map(d => d.day === day ? {...d, enabled: !d.enabled} : d)
        }))
    }
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(appointmentData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-protribe-gray-700 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="sticky top-0 bg-white dark:bg-protribe-gray-700 p-6 border-b border-gray-200 dark:border-protribe-gray-600 flex justify-between items-center z-10">
                    <h2 className="text-xl font-bold text-protribe-gray-extradark dark:text-white">{isEditing ? 'Edit Appointment Type' : 'New Appointment Type'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-protribe-gray-light dark:hover:text-white">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <Section title="What event is this?" border={false}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-2">
                                    <label htmlFor="title" className="block text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light mb-1">Event Name*</label>
                                    <input type="text" id="title" name="title" value={appointmentData.title} onChange={handleChange} required className={`${inputClasses} px-3 py-2`} />
                                </div>
                                <div>
                                    <label htmlFor="price" className="block text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light mb-1">Price ({currencySymbols[currency]})</label>
                                    <input type="number" id="price" name="price" value={appointmentData.price} onChange={handleChange} required className={`${inputClasses} px-3 py-2`} />
                                </div>
                            </div>
                             <div>
                                <label htmlFor="description" className="block text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light mb-1">Description</label>
                                <textarea id="description" name="description" value={appointmentData.description} onChange={handleChange} rows={3} className={`${inputClasses} px-3 py-2 resize-none`}></textarea>
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label htmlFor="location" className="block text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light">Location</label>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-protribe-gray-dark dark:text-protribe-gray-light">Virtual</span>
                                        <input type="checkbox" name="isVirtual" id="isVirtual" checked={appointmentData.isVirtual} onChange={handleChange} className="h-4 w-4 text-protribe-teal border-gray-300 rounded focus:ring-protribe-teal"/>
                                    </div>
                                </div>
                                <div className="relative">
                                    <input type="text" id="location" name="location" value={appointmentData.location} onChange={handleChange} placeholder={appointmentData.isVirtual ? "e.g., Zoom Link" : "e.g., 123 Main St, Anytown"} className={`${inputClasses} pl-9 pr-3 py-2`} />
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="customLink" className="block text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light mb-1">Event Link*</label>
                                <div className="flex items-center">
                                    <span className="inline-flex items-center px-3 h-10 border border-r-0 border-gray-300 dark:border-protribe-gray-600 bg-gray-50 dark:bg-protribe-gray-800 rounded-l-md text-sm text-gray-500 dark:text-protribe-gray-light">protribe.io/your-name/</span>
                                    <input type="text" id="customLink" name="customLink" value={appointmentData.customLink} onChange={handleChange} required className={`${inputClasses} rounded-l-none h-10 px-3 py-2`} />
                                </div>
                            </div>
                        </Section>

                        <Section title="When can people book this event?">
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="duration" className="block text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light mb-1">Duration</label>
                                    <select id="duration" name="duration" value={appointmentData.duration} onChange={handleChange} className={`${inputClasses} px-3 py-2`}>
                                        <option value={15}>15 min</option>
                                        <option value={30}>30 min</option>
                                        <option value={45}>45 min</option>
                                        <option value={60}>60 min</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="dateRangeDays" className="block text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light mb-1">Date range</label>
                                    <div className="flex items-center">
                                        <input type="number" id="dateRangeDays" name="dateRangeDays" value={appointmentData.dateRangeDays} onChange={handleChange} className={`${inputClasses} rounded-r-none h-10 px-3 py-2 text-center`} />
                                        <span className="inline-flex items-center px-3 h-10 border border-l-0 border-gray-300 dark:border-protribe-gray-600 bg-gray-50 dark:bg-protribe-gray-800 rounded-r-md text-sm text-gray-500 dark:text-protribe-gray-light">days in the future</span>
                                    </div>
                                </div>
                            </div>
                        </Section>

                        <Section title="Availability">
                            <h4 className="font-medium text-protribe-gray-dark dark:text-protribe-gray-light">Set your weekly recurring hours</h4>
                            <div className="space-y-3">
                                {appointmentData.weeklyAvailability.map(({ day, slots, enabled }) => (
                                    <div key={day} className="grid grid-cols-12 items-center gap-2">
                                        <div className="col-span-3 sm:col-span-2 flex items-center">
                                            <input type="checkbox" id={`day-${day}`} checked={enabled} onChange={() => handleDayToggle(day)} className="h-4 w-4 text-protribe-teal border-gray-300 rounded focus:ring-protribe-teal" />
                                            <label htmlFor={`day-${day}`} className="ml-2 text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light">{day}</label>
                                        </div>
                                        {enabled ? (
                                            <div className="col-span-9 sm:col-span-10 flex items-center gap-2">
                                                <input type="time" value={slots[0].from} onChange={(e) => handleAvailabilityChange(day, 'from', e.target.value, 0)} className={`${inputClasses} px-2 py-1 h-9`} />
                                                <span>-</span>
                                                <input type="time" value={slots[0].to} onChange={(e) => handleAvailabilityChange(day, 'to', e.target.value, 0)} className={`${inputClasses} px-2 py-1 h-9`} />
                                            </div>
                                        ) : (
                                            <div className="col-span-9 sm:col-span-10 text-sm text-gray-500">Unavailable</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </Section>
                        
                        <Section title="Booking Policy">
                             <div className="flex items-center justify-between">
                                 <label htmlFor="allowRescheduling" className="flex items-center space-x-2 text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light cursor-pointer">
                                    <Briefcase size={16} />
                                    <span>Allow Rescheduling</span>
                                 </label>
                                 <input type="checkbox" id="allowRescheduling" name="allowRescheduling" checked={appointmentData.allowRescheduling} onChange={handleChange} className="h-4 w-4 text-protribe-teal border-gray-300 rounded focus:ring-protribe-teal" />
                            </div>

                            {appointmentData.allowRescheduling && (
                                 <div>
                                    <label htmlFor="rescheduleHours" className="block text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light mb-1">Clients can reschedule up to (hours before)</label>
                                    <input type="number" id="rescheduleHours" name="rescheduleHours" value={appointmentData.rescheduleHours} onChange={handleChange} min="1" required className={`${inputClasses} px-3 py-2`} />
                                </div>
                            )}
                        </Section>
                    </div>

                    <div className="sticky bottom-0 bg-gray-50 dark:bg-protribe-gray-800 p-6 border-t border-gray-200 dark:border-protribe-gray-600 flex justify-end items-center space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light bg-white dark:bg-protribe-gray-700 border border-gray-300 dark:border-protribe-gray-500 rounded-md hover:bg-gray-50 dark:hover:bg-protribe-gray-600 shadow-sm">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-protribe-teal rounded-md hover:bg-protribe-green-dark shadow-sm">
                            {isEditing ? 'Save Changes' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateAppointmentModal;