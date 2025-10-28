import React, { useState, useMemo, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEvents, Booking, Session, Class, AppointmentType } from '../../contexts/EventContext';
import { getValidClassDates, getAvailableSlots } from '../../utils/booking-helpers';

interface RescheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    booking: Booking;
    onReschedule: (bookingId: number, newDate: string, newTime: string) => void;
    isAdmin?: boolean;
}

const isSession = (s: any): s is Session => s && 'date' in s && 'time' in s;
const isClass = (s: any): s is Class => s && 'schedule' in s;
const isAppointment = (s: any): s is AppointmentType => s && 'customLink' in s;

const RescheduleModal: React.FC<RescheduleModalProps> = ({ isOpen, onClose, booking, onReschedule, isAdmin = false }) => {
    const { sessions, classes, appointmentTypes, bookings } = useEvents();

    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [step, setStep] = useState(1);

    const service = useMemo(() => {
        if (booking.serviceType === 'session') return sessions.find(s => s.id === booking.serviceId);
        if (booking.serviceType === 'class') return classes.find(c => c.id === booking.serviceId);
        if (booking.serviceType === 'appointment') return appointmentTypes.find(a => a.id === booking.serviceId);
        return null;
    }, [booking, sessions, classes, appointmentTypes]);
    
    useEffect(() => {
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
            // When rescheduling, we need to exclude the current booking from conflict checks
            const otherBookings = bookings.filter(b => b.id !== booking.id);
            return getAvailableSlots(service, otherBookings, selectedDate);
        }
        return [];
    }, [service, selectedDate, bookings, booking.id]);

    const validClassDates = useMemo(() => isClass(service) ? getValidClassDates(service) : [], [service]);
    
    const handleConfirm = () => {
        if (!service || !selectedDate || (isAppointment(service) && !selectedTime)) return;
        
        let newDate = selectedDate.toISOString().split('T')[0];
        let newTime: string;

        if (isClass(service)) {
            newTime = service.schedule.startTime;
        } else if (isAppointment(service) && selectedTime) {
            const [time, period] = selectedTime.split(' ');
            let [hours, minutes] = time.split(':').map(Number);
            if (period === 'PM' && hours < 12) hours += 12;
            if (period === 'AM' && hours === 12) hours = 0;
            newTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        } else {
            // Should not happen for appointment, but as a fallback
            newTime = booking.eventTime || '00:00';
        }
        
        onReschedule(booking.id, newDate, newTime);
        setStep(2);
    };

    const CalendarGrid: React.FC = () => {
        const year = currentMonth.getUTCFullYear();
        const month = currentMonth.getUTCMonth();
        const daysInMonth = new Date(year, month + 1, 0).getUTCDate();
        const firstDayOfMonth = new Date(Date.UTC(year, month, 1)).getUTCDay();
        const dates = Array.from({ length: daysInMonth }, (_, i) => i + 1);
        const classValidDateStrings = isClass(service) ? validClassDates.map(d => d.toISOString().split('T')[0]) : [];
        const isAppointmentType = isAppointment(service);

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
                        const isValid = isAppointmentType || classValidDateStrings.includes(dString);
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

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-protribe-gray-700 rounded-lg shadow-xl w-full max-w-lg sm:max-w-xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="font-bold text-protribe-gray-extradark dark:text-white">Reschedule Booking</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
                </div>
                
                {step === 1 ? (
                    <>
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-protribe-gray-extradark dark:text-white">{service.title}</h3>
                            <p className="text-sm text-protribe-gray-dark dark:text-protribe-gray-light mt-2">Please select a new date and time for your booking.</p>
                            <div className="mt-4 border-t pt-4">
                                {isClass(service) && <CalendarGrid />}
                                {isAppointment(service) && (
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <div className="sm:w-1/2"><CalendarGrid /></div>
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
                                {!isClass(service) && !isAppointment(service) && <p>This booking type cannot be rescheduled online.</p>}
                            </div>
                        </div>
                        <div className="p-6 bg-gray-50 dark:bg-protribe-gray-800 border-t flex justify-end">
                            <button 
                                onClick={handleConfirm}
                                disabled={!selectedDate || (isAppointment(service) && !selectedTime)}
                                className="px-6 py-2 bg-protribe-teal text-white font-semibold rounded-md disabled:bg-gray-400 dark:disabled:bg-protribe-gray-600 transition-colors">
                                Confirm Reschedule
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="text-center p-8">
                        <h3 className="text-xl font-bold">Booking Rescheduled!</h3>
                        <p className="mt-2 text-gray-600 dark:text-gray-300">Your booking has been successfully updated.</p>
                        <button onClick={onClose} className="mt-6 w-full py-2 bg-protribe-teal text-white font-semibold rounded-md">Done</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RescheduleModal;
