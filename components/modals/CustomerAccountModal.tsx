import React, { useState, useMemo } from 'react';
import { X, Calendar, Clock, RefreshCw } from 'lucide-react';
import { useCustomer } from '../../contexts/CustomerContext';
import { useEvents, Booking, Session, Class, AppointmentType } from '../../contexts/EventContext';
import RescheduleModal from './RescheduleModal';

interface CustomerAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CustomerAccountModal: React.FC<CustomerAccountModalProps> = ({ isOpen, onClose }) => {
    const { currentCustomer, logout } = useCustomer();
    const { bookings, sessions, classes, appointmentTypes, rescheduleBooking, cancelBooking } = useEvents();

    const [bookingToReschedule, setBookingToReschedule] = useState<Booking | null>(null);

    if (!isOpen || !currentCustomer) return null;

    const myBookings = bookings
        .filter(b => b.customerId === currentCustomer.id)
        .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());

    const getServiceForBooking = (booking: Booking): Session | Class | AppointmentType | undefined => {
        if (booking.serviceType === 'session') return sessions.find(s => s.id === booking.serviceId);
        if (booking.serviceType === 'class') return classes.find(c => c.id === booking.serviceId);
        if (booking.serviceType === 'appointment') return appointmentTypes.find(a => a.id === booking.serviceId);
        return undefined;
    };

    const isReschedulable = (booking: Booking): boolean => {
        const service = getServiceForBooking(booking);
        if (!service || booking.status === 'cancelled') return false;
        
        const policy = 'allowRescheduling' in service ? service : null;
        if (!policy || !policy.allowRescheduling) return false;

        const eventDateTime = new Date(`${booking.eventDate}T${booking.eventTime || '00:00:00'}`);
        const now = new Date();
        
        if (eventDateTime < now) return false;

        const hoursUntilEvent = (eventDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

        return hoursUntilEvent > policy.rescheduleHours;
    };
    
    const handleLogout = () => {
        logout();
        onClose();
    };

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
                <div className="bg-white dark:bg-protribe-gray-700 rounded-lg shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                    <div className="p-6 border-b border-gray-200 dark:border-protribe-gray-600 relative">
                        <h2 className="text-xl font-bold text-protribe-gray-extradark dark:text-white">My Account</h2>
                        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-protribe-gray-light dark:hover:text-white">
                            <X size={24} />
                        </button>
                        <p className="text-sm text-protribe-gray-dark dark:text-protribe-gray-light">{currentCustomer.email}</p>
                    </div>
                    <div className="p-6 max-h-96 overflow-y-auto">
                        <h3 className="font-semibold mb-4 text-protribe-gray-extradark dark:text-white">My Bookings</h3>
                        {myBookings.length > 0 ? (
                            <ul className="space-y-3">
                                {myBookings.map(booking => (
                                    <li key={booking.id} className="p-3 bg-gray-50 dark:bg-protribe-gray-800 rounded-md">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className={`font-semibold text-protribe-gray-extradark dark:text-white ${booking.status === 'cancelled' ? 'line-through' : ''}`}>{booking.serviceTitle}</p>
                                                <div className="flex items-center gap-4 text-sm text-protribe-gray-dark dark:text-protribe-gray-light mt-1">
                                                    <div className="flex items-center gap-1.5"><Calendar size={14} /><span>{new Date(booking.eventDate + 'T00:00:00Z').toLocaleDateString([], { dateStyle: 'long', timeZone: 'UTC' })}</span></div>
                                                    {booking.eventTime && <div className="flex items-center gap-1.5"><Clock size={14} /><span>{new Date('1970-01-01T' + booking.eventTime).toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})}</span></div>}
                                                </div>
                                            </div>
                                            {isReschedulable(booking) && (
                                                <button onClick={() => setBookingToReschedule(booking)} className="flex items-center gap-1.5 text-sm text-protribe-teal font-semibold hover:underline">
                                                    <RefreshCw size={14} /> Reschedule
                                                </button>
                                            )}
                                        </div>
                                        {booking.status === 'cancelled' && <p className="text-xs font-bold text-red-500 dark:text-red-400 mt-2">CANCELLED</p>}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-protribe-gray-dark dark:text-protribe-gray-light">You have no upcoming bookings.</p>
                        )}
                    </div>
                    <div className="p-6 bg-gray-50 dark:bg-protribe-gray-800 border-t border-gray-200 dark:border-protribe-gray-600 flex justify-end">
                        <button onClick={handleLogout} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">
                            Log Out
                        </button>
                    </div>
                </div>
            </div>
            {bookingToReschedule && (
                <RescheduleModal
                    isOpen={!!bookingToReschedule}
                    onClose={() => setBookingToReschedule(null)}
                    booking={bookingToReschedule}
                    onReschedule={rescheduleBooking}
                />
            )}
        </>
    );
};

export default CustomerAccountModal;