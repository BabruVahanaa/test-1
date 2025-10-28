import React, { useState, useEffect, useMemo } from 'react';
import { X, BadgePercent } from 'lucide-react';
import { Bundle, Session, Class, AppointmentType } from '../../contexts/EventContext';
import { useSettings, currencySymbols } from '../../contexts/SettingsContext';

interface CreateBundleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (bundle: Omit<Bundle, 'id' | 'status'> & { id?: number }) => void;
    bundleToEdit?: Bundle | null;
    availableEvents: {
        sessions: Session[];
        classes: Class[];
        appointmentTypes: AppointmentType[];
    };
}

const initialBundleState: Omit<Bundle, 'id' | 'status'> = {
    title: '',
    description: '',
    price: '',
    includedSessionIds: [],
    includedClassIds: [],
    includedAppointments: [],
};

const inputClasses = "w-full bg-white dark:bg-protribe-gray-800 border border-gray-300 dark:border-protribe-gray-600 rounded-md shadow-sm text-protribe-gray-extradark dark:text-protribe-gray-light placeholder-protribe-gray focus:outline-none focus:ring-2 focus:ring-protribe-green-light focus:border-protribe-teal sm:text-sm transition-shadow";

const CreateBundleModal: React.FC<CreateBundleModalProps> = ({ isOpen, onClose, onSave, bundleToEdit, availableEvents }) => {
    const [bundleData, setBundleData] = useState(initialBundleState);
    const [activeTab, setActiveTab] = useState<'sessions' | 'classes' | 'appointments'>('sessions');
    const { currency } = useSettings();
    const isEditing = !!bundleToEdit;

    useEffect(() => {
        setBundleData(isEditing ? bundleToEdit : initialBundleState);
    }, [bundleToEdit, isEditing, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setBundleData(prev => ({ ...prev, [name]: value }));
    };

    const handleSessionClassToggle = (type: 'sessions' | 'classes', id: number) => {
        const keyMap = { sessions: 'includedSessionIds', classes: 'includedClassIds' };
        const idKey = keyMap[type];
        
        setBundleData(prev => {
            const currentIds = prev[idKey];
            const newIds = currentIds.includes(id)
                ? currentIds.filter(itemId => itemId !== id)
                : [...currentIds, id];
            return { ...prev, [idKey]: newIds };
        });
    };

    const handleAppointmentToggle = (id: number) => {
        setBundleData(prev => {
            const isIncluded = prev.includedAppointments.some(a => a.id === id);
            const newAppointments = isIncluded
                ? prev.includedAppointments.filter(a => a.id !== id)
                : [...prev.includedAppointments, { id, quantity: 1 }];
            return { ...prev, includedAppointments: newAppointments };
        });
    };

    const handleAppointmentQuantityChange = (id: number, quantity: number) => {
        const newQuantity = Math.max(1, quantity); // Ensure quantity is at least 1
        setBundleData(prev => ({
            ...prev,
            includedAppointments: prev.includedAppointments.map(a =>
                a.id === id ? { ...a, quantity: newQuantity } : a
            ),
        }));
    };
    
    const { totalValue, savings, discountPercentage } = useMemo(() => {
        const sessionsValue = availableEvents.sessions
            .filter(s => bundleData.includedSessionIds.includes(s.id))
            .reduce((sum, s) => sum + (parseFloat(s.price) || 0), 0);

        const classesValue = availableEvents.classes
            .filter(c => bundleData.includedClassIds.includes(c.id))
            .reduce((sum, c) => sum + (parseFloat(c.price) || 0), 0);

        const appointmentsValue = bundleData.includedAppointments
            .reduce((sum, includedApp) => {
                const appType = availableEvents.appointmentTypes.find(a => a.id === includedApp.id);
                const price = parseFloat(appType?.price || '0');
                return sum + (price * includedApp.quantity);
            }, 0);
        
        const total = sessionsValue + classesValue + appointmentsValue;
        const bundlePrice = parseFloat(bundleData.price) || 0;
        
        const savedAmount = total > bundlePrice ? total - bundlePrice : 0;
        const discount = total > 0 ? Math.round((savedAmount / total) * 100) : 0;

        return {
            totalValue: total,
            savings: savedAmount,
            discountPercentage: discount
        };
    }, [bundleData, availableEvents]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(bundleData);
        onClose();
    };

    const tabClasses = (isActive: boolean) => 
        `px-4 py-2 text-sm font-medium rounded-t-lg transition-colors focus:outline-none ${
            isActive
                ? 'bg-white dark:bg-protribe-gray-800 text-protribe-teal border-gray-200 dark:border-protribe-gray-600 border-b-0'
                : 'bg-gray-50 dark:bg-protribe-gray-900 text-gray-500 hover:text-gray-700'
        }`;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-protribe-gray-700 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="sticky top-0 bg-white dark:bg-protribe-gray-700 p-6 border-b border-gray-200 dark:border-protribe-gray-600 flex justify-between items-center z-10">
                    <h2 className="text-xl font-bold text-protribe-gray-extradark dark:text-white">{isEditing ? 'Edit Bundle' : 'Create New Bundle'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-protribe-gray-light dark:hover:text-white">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-5">
                         <div>
                            <label htmlFor="title" className="block text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light mb-1">Bundle Title</label>
                            <input type="text" id="title" name="title" value={bundleData.title} onChange={handleChange} required className={`${inputClasses} px-3 py-2`} />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light mb-1">Description</label>
                            <textarea id="description" name="description" value={bundleData.description} onChange={handleChange} rows={3} className={`${inputClasses} px-3 py-2 resize-none`}></textarea>
                        </div>
                        
                        <div>
                            <h3 className="text-md font-semibold text-protribe-gray-extradark dark:text-white mb-2">Included Items</h3>
                            <div className="border border-gray-200 dark:border-protribe-gray-600 rounded-lg">
                                <div className="flex border-b border-gray-200 dark:border-protribe-gray-600 bg-gray-50 dark:bg-protribe-gray-900 rounded-t-lg">
                                    <button type="button" onClick={() => setActiveTab('sessions')} className={tabClasses(activeTab === 'sessions')}>Sessions</button>
                                    <button type="button" onClick={() => setActiveTab('classes')} className={tabClasses(activeTab === 'classes')}>Classes</button>
                                    <button type="button" onClick={() => setActiveTab('appointments')} className={tabClasses(activeTab === 'appointments')}>Appointments</button>
                                </div>
                                <div className="p-4 h-48 overflow-y-auto space-y-2 bg-white dark:bg-protribe-gray-800">
                                    {activeTab === 'sessions' && availableEvents.sessions.map(s => (
                                        <label key={s.id} className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-protribe-gray-700/50 cursor-pointer">
                                            <input type="checkbox" checked={bundleData.includedSessionIds.includes(s.id)} onChange={() => handleSessionClassToggle('sessions', s.id)} className="h-4 w-4 text-protribe-teal border-gray-300 rounded focus:ring-protribe-teal"/>
                                            <span className="text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light">{s.title} ({currencySymbols[currency]}{s.price})</span>
                                        </label>
                                    ))}
                                    {activeTab === 'classes' && availableEvents.classes.map(c => (
                                        <label key={c.id} className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-protribe-gray-700/50 cursor-pointer">
                                            <input type="checkbox" checked={bundleData.includedClassIds.includes(c.id)} onChange={() => handleSessionClassToggle('classes', c.id)} className="h-4 w-4 text-protribe-teal border-gray-300 rounded focus:ring-protribe-teal"/>
                                            <span className="text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light">{c.title} ({currencySymbols[currency]}{c.price})</span>
                                        </label>
                                    ))}
                                    {activeTab === 'appointments' && availableEvents.appointmentTypes.map(a => {
                                        const includedAppointment = bundleData.includedAppointments.find(item => item.id === a.id);
                                        const isChecked = !!includedAppointment;
                                        return (
                                            <div key={a.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-protribe-gray-700/50">
                                                <label className="flex items-center space-x-3 cursor-pointer">
                                                    <input type="checkbox" checked={isChecked} onChange={() => handleAppointmentToggle(a.id)} className="h-4 w-4 text-protribe-teal border-gray-300 rounded focus:ring-protribe-teal"/>
                                                    <span className="text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light">{a.title} ({currencySymbols[currency]}{a.price})</span>
                                                </label>
                                                {isChecked && (
                                                    <div className="flex items-center space-x-2">
                                                        <label htmlFor={`quantity-${a.id}`} className="text-sm text-protribe-gray-dark dark:text-protribe-gray-light">Qty:</label>
                                                        <input
                                                            type="number"
                                                            id={`quantity-${a.id}`}
                                                            min="1"
                                                            value={includedAppointment.quantity}
                                                            onChange={(e) => handleAppointmentQuantityChange(a.id, parseInt(e.target.value, 10))}
                                                            className={`${inputClasses} w-16 text-center px-1 py-1`}
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light mb-1">Bundle Price ({currencySymbols[currency]})</label>
                            <input type="number" id="price" name="price" value={bundleData.price} onChange={handleChange} placeholder="e.g., 299" required className={`${inputClasses} px-3 py-2`} />
                        </div>
                         <div className="p-4 rounded-md border border-protribe-teal/50 bg-protribe-green-light dark:bg-protribe-green-dark/20 space-y-3">
                             <h3 className="font-semibold text-protribe-gray-extradark dark:text-white flex items-center gap-2"><BadgePercent size={18}/> Pricing Summary</h3>
                             <div className="flex justify-between items-center text-sm">
                                <span className="text-protribe-gray-dark dark:text-protribe-gray-light">Total Value of Items:</span>
                                <span className="font-medium text-protribe-gray-extradark dark:text-white">{currencySymbols[currency]}{totalValue.toFixed(2)}</span>
                             </div>
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-protribe-gray-dark dark:text-protribe-gray-light">Your Bundle Price:</span>
                                <span className="font-medium text-protribe-gray-extradark dark:text-white">{currencySymbols[currency]}{(parseFloat(bundleData.price) || 0).toFixed(2)}</span>
                             </div>
                             <div className="border-t border-protribe-teal/20 dark:border-protribe-green-dark/50 my-2"></div>
                             <div className="flex justify-between items-center text-md font-bold text-protribe-green-dark dark:text-protribe-green-light">
                                <span>Customer Savings:</span>
                                <span>{currencySymbols[currency]}{savings.toFixed(2)} ({discountPercentage}%)</span>
                             </div>
                         </div>
                    </div>
                    <div className="sticky bottom-0 bg-gray-50 dark:bg-protribe-gray-800 p-6 border-t border-gray-200 dark:border-protribe-gray-600 flex justify-end items-center space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light bg-white dark:bg-protribe-gray-700 border border-gray-300 dark:border-protribe-gray-500 rounded-md hover:bg-gray-50 dark:hover:bg-protribe-gray-600 shadow-sm">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-protribe-teal rounded-md hover:bg-protribe-green-dark shadow-sm">
                            {isEditing ? 'Update Bundle' : 'Save Bundle'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateBundleModal;