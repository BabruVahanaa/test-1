import React, { useState, useMemo } from 'react';
import { X, Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Session, Class, AppointmentType, useEvents, Booking } from '../../contexts/EventContext';
import { useCustomer } from '../../contexts/CustomerContext';
import { getValidClassDates, getAvailableSlots } from '../../utils/booking-helpers';

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    service: Session | Class | AppointmentType | null;
}

const isSession = (s: any): s is Session => s && 'date' in s && 'time' in s;
const isClass = (s: any): s is Class => s && 'schedule' in s;
const isAppointment = (s: any): s is AppointmentType => s && 'customLink' in s;

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, service }) => {
    const { bookings, addBooking } = useEvents();
    const { currentCustomer } = useCustomer();
    
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [step, setStep] = useState(1); // 1: Select, 2: Confirm, 3: Success

    // Reset state when modal opens/closes or service changes
    React.useEffect(() => {
        if (isOpen) {
            setSelectedDate(null);
            setSelectedTime(null);
            setStep(1);
            if (isClass(service) && service.schedule.startDate) {
                setCurrentMonth(new Date(service.schedule.startDate + 'T00:00:00Z'));
            } else if (isAppointment(service)) {
                setCurrentMonth(new Date());
            }
        }
    }, [isOpen, service]);
    
    const availableSlots = useMemo(() => {
        if (isAppointment(service) && selectedDate) {
            return getAvailableSlots(service, bookings, selectedDate);
        }
        return [];
    }, [service, selectedDate, bookings]);

    const validClassDates = useMemo(() => isClass(service) ? getValidClassDates(service) : [], [service]);

    const handleConfirmBooking = () => {
        if (!currentCustomer || !service) {
             alert("Please log in to book.");
             return;
        }
        let eventDate = '';
        let eventTime;

        if (isSession(service)) {
            eventDate = service.date;
            eventTime = service.time;
        } else if (isClass(service) && selectedDate) {
            eventDate = selectedDate.toISOString().split('T')[0];
            eventTime = service.schedule.startTime;
        } else if (isAppointment(service) && selectedDate && selectedTime) {
            eventDate = selectedDate.toISOString().split('T')[0];
            const [time, period] = selectedTime.split(' ');
            let [hours, minutes] = time.split(':').map(Number);
            if (period === 'PM' && hours < 12) hours += 12;
            if (period === 'AM' && hours === 12) hours = 0;
            eventTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        } else {
            return;
        }
        
        addBooking({
            customerId: currentCustomer.id,
            serviceId: service.id,
            serviceType: isSession(service) ? 'session' : isClass(service) ? 'class' : 'appointment',
            serviceTitle: service.title,
            eventDate,
            eventTime,
            status: 'confirmed',
        });
        setStep(3);
    };
    
    const CalendarGrid: React.FC<{forAppointment?: boolean}> = ({ forAppointment = false }) => {
        const year = currentMonth.getUTCFullYear();
        const month = currentMonth.getUTCMonth();
        const daysInMonth = new Date(year, month + 1, 0).getUTCDate();
        const firstDayOfMonth = new Date(Date.UTC(year, month, 1)).getUTCDay();
        const dates = Array.from({ length: daysInMonth }, (_, i) => i + 1);
        const classValidDateStrings = isClass(service) ? validClassDates.map(d => d.toISOString().split('T')[0]) : [];

        return (
            <div>
                 <div className="flex justify-between items-center mb-2">
                    <button onClick={() => setCurrentMonth(new Date(Date.UTC(year, month - 1, 1)))}><ChevronLeft/></button>
                    <h4 className="font-semibold">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric', timeZone: 'UTC' })}</h4>
                    <button onClick={() => setCurrentMonth(new Date(Date.UTC(year, month + 1, 1)))}><ChevronRight/></button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-sm">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i} className="font-medium text-gray-500">{d}</div>)}
                    {Array.from({length: firstDayOfMonth}).map((_, i) => <div key={`empty-${i}`}/>)}
                    {dates.map(date => {
                        const d = new Date(Date.UTC(year, month, date));
                        const dString = d.toISOString().split('T')[0];
                        const isValid = forAppointment || classValidDateStrings.includes(dString);
                        const isSelected = selectedDate?.toISOString().split('T')[0] === dString;
                        return (
                            <button key={date} disabled={!isValid} onClick={() => { setSelectedDate(d); setSelectedTime(null); }} 
                                className={`w-8 h-8 rounded-full transition-colors disabled:text-gray-300 dark:disabled:text-gray-600 ${
                                    isSelected ? 'bg-protribe-teal text-white' : 
                                    isValid ? 'hover:bg-protribe-green-light dark:hover:bg-protribe-gray-600' : ''
                                }`}>
                                {date}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    if (!isOpen || !service) return null;

    const renderContent = () => {
        if (step === 3) return (
            <div className="text-center p-8">
                <h3 className="text-xl font-bold">Booking Confirmed!</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300">Your booking has been successfully made. Check your account for details.</p>
                <button onClick={onClose} className="mt-6 w-full py-2 bg-protribe-teal text-white font-semibold rounded-md">Done</button>
            </div>
        )

        return (
            <>
                 <div className="p-6">
                    <h3 className="text-xl font-bold text-protribe-gray-extradark dark:text-white">{service.title}</h3>
                    <p className="text-sm text-protribe-gray-dark dark:text-protribe-gray-light mt-2">{service.description}</p>
                    <div className="mt-4 border-t pt-4">
                        {isSession(service) && <p className="text-protribe-gray-dark dark:text-protribe-gray-light">Date & Time: {new Date(service.date + 'T' + service.time).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })}</p>}
                        {isClass(service) && (
                            <>
                                <h4 className="font-semibold mb-2 text-protribe-gray-extradark dark:text-white">Select a Date:</h4>
                                <CalendarGrid />
                            </>
                        )}
                        {isAppointment(service) && (
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="sm:w-1/2">
                                    <h4 className="font-semibold mb-2 text-protribe-gray-extradark dark:text-white">Select a Date:</h4>
                                    <CalendarGrid forAppointment={true}/>
                                </div>
                                <div className="sm:w-1/2">
                                    <h4 className="font-semibold mb-2 text-protribe-gray-extradark dark:text-white">{selectedDate ? selectedDate.toLocaleDateString([], {weekday: 'long', month: 'long', day: 'numeric'}) : 'Select a Time:'}</h4>
                                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2">
                                        {selectedDate && availableSlots.length > 0 ? availableSlots.map(slot => (
                                            <button key={slot} onClick={() => setSelectedTime(slot)} className={`p-2 border rounded-md text-sm ${selectedTime === slot ? 'bg-protribe-teal text-white border-protribe-teal' : 'hover:bg-gray-100 dark:hover:bg-protribe-gray-600 dark:border-protribe-gray-500'}`}>
                                                {slot}
                                            </button>
                                        )) : <p className="text-sm text-gray-500 col-span-2">{selectedDate ? "No slots available." : "Select a date to see times."}</p>}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                 </div>
                 <div className="p-6 bg-gray-50 dark:bg-protribe-gray-800 border-t flex justify-end">
                    <button 
                        onClick={handleConfirmBooking}
                        disabled={!currentCustomer || (isSession(service) ? false : !selectedDate) || (isAppointment(service) && !selectedTime)}
                        className="px-6 py-2 bg-protribe-teal text-white font-semibold rounded-md disabled:bg-gray-400 dark:disabled:bg-protribe-gray-600 transition-colors">
                        {currentCustomer ? 'Confirm Booking' : 'Log in to Book'}
                    </button>
                 </div>
            </>
        )
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-protribe-gray-700 rounded-lg shadow-xl w-full max-w-lg sm:max-w-xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="font-bold text-protribe-gray-extradark dark:text-white">Book Service</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
                </div>
                {renderContent()}
            </div>
        </div>
    )
};

export default BookingModal;