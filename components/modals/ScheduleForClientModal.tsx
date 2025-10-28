import React, { useState, useEffect, useMemo } from 'react';
import { useCustomer, Customer } from '../../contexts/CustomerContext';
import { useEvents, Session, Class, AppointmentType } from '../../contexts/EventContext';
import { X, Search, UserPlus, ArrowLeft, Calendar, Clock, CheckCircle, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { getValidClassDates, getAvailableSlots } from '../../utils/booking-helpers';
import AddCustomerModal from './AddCustomerModal';
import CreateSessionModal from './CreateSessionModal';

type Step = 'client' | 'service' | 'datetime' | 'confirm' | 'success';

interface ScheduleForClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultDate?: Date | null;
}

const isSession = (s: any): s is Session => s && 'date' in s && 'time' in s;
const isClass = (s: any): s is Class => s && 'schedule' in s;
const isAppointment = (s: any): s is AppointmentType => s && 'customLink' in s;


const ScheduleForClientModal: React.FC<ScheduleForClientModalProps> = ({ isOpen, onClose, defaultDate }) => {
    const { customers, addCustomer } = useCustomer();
    const { sessions, classes, appointmentTypes, bookings, addBooking, saveSession } = useEvents();

    const [step, setStep] = useState<Step>('client');
    const [selectedClient, setSelectedClient] = useState<Customer | null>(null);
    const [selectedService, setSelectedService] = useState<Session | Class | AppointmentType | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);

    const [clientSearch, setClientSearch] = useState('');
    const [isAddingClient, setIsAddingClient] = useState(false);
    const [isCreatingCustomSession, setIsCreatingCustomSession] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            // Reset state on close
            setTimeout(() => {
                setStep('client');
                setSelectedClient(null);
                setSelectedService(null);
                setSelectedDate(null);
                setSelectedTime(null);
                setClientSearch('');
            }, 300); // Delay reset to allow for closing animation
        }
    }, [isOpen]);
    
    const handleClientSelect = (client: Customer) => {
        setSelectedClient(client);
        setStep('service');
    };
    
    const handleServiceSelect = (service: Session | Class | AppointmentType) => {
        setSelectedService(service);
        if (isSession(service)) {
            setSelectedDate(new Date(service.date + 'T' + service.time));
            setSelectedTime(service.time);
            setStep('confirm');
        } else {
            setStep('datetime');
        }
    };
    
    const handleDateTimeSelect = (date: Date, time?: string) => {
        setSelectedDate(date);
        setSelectedTime(time || null);
        setStep('confirm');
    }

    const handleConfirm = () => {
        if (!selectedClient || !selectedService || !selectedDate) return;
        
        let eventDate = selectedDate.toISOString().split('T')[0];
        let eventTime;

        if (isSession(selectedService)) {
            eventTime = selectedService.time;
        } else if (isClass(selectedService)) {
            eventTime = selectedService.schedule.startTime;
        } else if (isAppointment(selectedService) && selectedTime) {
             const [time, period] = selectedTime.split(' ');
            let [hours, minutes] = time.split(':').map(Number);
            if (period === 'PM' && hours < 12) hours += 12;
            if (period === 'AM' && hours === 12) hours = 0;
            eventTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        }

        addBooking({
            customerId: selectedClient.id,
            serviceId: selectedService.id,
            serviceType: isSession(selectedService) ? 'session' : isClass(selectedService) ? 'class' : 'appointment',
            serviceTitle: selectedService.title,
            eventDate,
            eventTime,
            status: 'confirmed'
        });
        setStep('success');
    };
    
    const handleCustomSessionSave = (sessionData: Omit<Session, 'id' | 'status'> & { id?: number }) => {
        const newSession = saveSession({...sessionData, isPublic: false }); // Ensure custom sessions are private
        setIsCreatingCustomSession(false);
        handleServiceSelect(newSession);
    }
    
    const filteredClients = useMemo(() => {
        return customers.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase()) || c.email.toLowerCase().includes(clientSearch.toLowerCase()));
    }, [customers, clientSearch]);

    const activeServices = useMemo(() => ({
        sessions: sessions.filter(s => s.status === 'active'),
        classes: classes.filter(c => c.status === 'active'),
        appointmentTypes: appointmentTypes.filter(a => a.status === 'active'),
    }), [sessions, classes, appointmentTypes]);

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
                <div className="bg-white dark:bg-protribe-gray-700 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200 dark:border-protribe-gray-600 flex justify-between items-center flex-shrink-0">
                        <div className="flex items-center gap-2">
                           {step !== 'client' && (
                                <button onClick={() => setStep(step === 'service' ? 'client' : 'service')} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-protribe-gray-600">
                                    <ArrowLeft size={20} />
                                </button>
                            )}
                            <h2 className="text-lg font-bold text-protribe-gray-extradark dark:text-white">Schedule for Client</h2>
                        </div>
                        <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-protribe-gray-600">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Step: Client Selection */}
                    {step === 'client' && (
                        <div className="p-6 space-y-4 flex-grow overflow-y-auto">
                            <div className="flex gap-2">
                                <div className="relative flex-grow">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input type="text" placeholder="Search clients..." value={clientSearch} onChange={e => setClientSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-white dark:bg-protribe-gray-800 border border-gray-300 dark:border-protribe-gray-500 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-protribe-teal/50" />
                                </div>
                                <button onClick={() => setIsAddingClient(true)} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-protribe-teal rounded-md hover:bg-protribe-green-dark whitespace-nowrap">
                                    <UserPlus size={16} /> New Client
                                </button>
                            </div>
                            <div className="max-h-80 overflow-y-auto pr-2 space-y-2">
                                {filteredClients.map(client => (
                                    <button key={client.id} onClick={() => handleClientSelect(client)} className="w-full text-left flex items-center gap-3 p-3 rounded-md hover:bg-gray-100 dark:hover:bg-protribe-gray-600">
                                        <div className="w-10 h-10 rounded-full bg-protribe-green-light flex items-center justify-center font-bold text-protribe-green-dark flex-shrink-0">
                                            {client.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-protribe-gray-extradark dark:text-white">{client.name}</div>
                                            <div className="text-xs text-protribe-gray">{client.email}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    
                     {/* Step: Service Selection */}
                    {step === 'service' && (
                        <div className="p-6 space-y-4 flex-grow overflow-y-auto">
                           <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-protribe-gray-dark dark:text-protribe-gray-light">Scheduling for:</p>
                                    <p className="font-bold text-protribe-gray-extradark dark:text-white">{selectedClient?.name}</p>
                                </div>
                                 <button onClick={() => setIsCreatingCustomSession(true)} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-protribe-teal rounded-md hover:bg-protribe-green-dark whitespace-nowrap">
                                    + Create Custom Session
                                </button>
                           </div>
                           <div className="text-sm text-gray-500">Select an existing service to book.</div>
                           {/* Simplified list for now */}
                            <div className="max-h-80 overflow-y-auto pr-2 space-y-2">
                                {activeServices.sessions.map(s => <button key={`s-${s.id}`} onClick={() => handleServiceSelect(s)} className="w-full text-left p-3 rounded-md hover:bg-gray-100 dark:hover:bg-protribe-gray-600">{s.title} (Session)</button>)}
                                {activeServices.classes.map(c => <button key={`c-${c.id}`} onClick={() => handleServiceSelect(c)} className="w-full text-left p-3 rounded-md hover:bg-gray-100 dark:hover:bg-protribe-gray-600">{c.title} (Class)</button>)}
                                {activeServices.appointmentTypes.map(a => <button key={`a-${a.id}`} onClick={() => handleServiceSelect(a)} className="w-full text-left p-3 rounded-md hover:bg-gray-100 dark:hover:bg-protribe-gray-600">{a.title} (Appointment)</button>)}
                            </div>
                        </div>
                    )}

                    {/* All other steps would be implemented here, simplified for brevity */}
                     {step === 'confirm' && (
                         <div className="p-6 space-y-4 flex-grow">
                             <h3 className="text-lg font-bold">Confirm Booking</h3>
                             <p><strong>Client:</strong> {selectedClient?.name}</p>
                             <p><strong>Service:</strong> {selectedService?.title}</p>
                             <p><strong>Date & Time:</strong> {selectedDate?.toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })}</p>
                             <div className="p-4 bg-gray-50 dark:bg-protribe-gray-800 border-t flex justify-end">
                                 <button onClick={handleConfirm} className="px-6 py-2 bg-protribe-teal text-white font-semibold rounded-md">Confirm</button>
                             </div>
                         </div>
                     )}

                     {step === 'success' && (
                         <div className="p-12 flex flex-col items-center justify-center text-center flex-grow">
                            <CheckCircle size={64} className="text-green-500" />
                            <h3 className="text-2xl font-bold mt-4">Booking Confirmed!</h3>
                            <p className="mt-2 text-gray-600 dark:text-gray-300">
                                {selectedClient?.name} has been scheduled for {selectedService?.title}.
                            </p>
                            <button onClick={onClose} className="mt-6 w-full max-w-xs py-2 bg-protribe-teal text-white font-semibold rounded-md">Done</button>
                         </div>
                     )}
                </div>
            </div>

            {/* Nested Modals */}
             <AddCustomerModal
                isOpen={isAddingClient}
                onClose={() => setIsAddingClient(false)}
                onSave={addCustomer}
                onSuccess={(newCustomer) => {
                    handleClientSelect(newCustomer);
                }}
            />
            <CreateSessionModal 
                isOpen={isCreatingCustomSession}
                onClose={() => setIsCreatingCustomSession(false)}
                onSave={handleCustomSessionSave}
                defaultDate={defaultDate}
            />
        </>
    );
};

export default ScheduleForClientModal;