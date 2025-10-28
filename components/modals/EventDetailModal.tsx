import React from 'react';
import { X, Calendar, Clock, User, Edit, XCircle, Users, Repeat, RefreshCw } from 'lucide-react';
import { CalendarEvent } from '../../pages/SchedulePage';
import { Session, Class, Booking, AppointmentType } from '../../contexts/EventContext';

interface EventDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    event: CalendarEvent | null;
    onEdit: (event: CalendarEvent) => void;
    onCancelBooking: (bookingId: number) => void;
    onReschedule: (booking: Booking) => void;
}

const isSession = (e: any): e is Session => e.type === 'session';
const isClass = (e: any): e is Class => e.type === 'class';
const isBookingOfAppointment = (e: any): e is Booking => e.type === 'booking' && e.raw.serviceType === 'appointment';

const EventDetailModal: React.FC<EventDetailModalProps> = ({ isOpen, onClose, event, onEdit, onCancelBooking, onReschedule }) => {
    if (!isOpen || !event) return null;

    const { raw } = event;

    const canEdit = event.type === 'session' || event.type === 'class' || (event.type === 'booking' && (raw as Booking).serviceType !== 'class');
    const canCancel = event.type === 'booking';
    const canReschedule = event.type === 'booking';

    const handleEdit = () => {
        onEdit(event);
    };

    const handleCancel = () => {
        if (event.type === 'booking') {
            onCancelBooking((event.raw as Booking).id);
        }
    };

    const handleReschedule = () => {
        if (event.type === 'booking') {
            onReschedule(event.raw as Booking);
        }
    };
    
    const renderDetails = () => {
        let details: React.ReactNode[] = [];
        if (isSession(raw) || (event.type === 'booking' && (raw as Booking).serviceType === 'session')) {
            const session = (event.type === 'booking' ? null : raw) as Session | null;
            details.push(<p key="type" className="flex items-center gap-2"><Users size={16} /> {session?.sessionType || 'Session'}</p>);
        }
        if (isClass(raw) || (event.type === 'booking' && (raw as Booking).serviceType === 'class')) {
            const classItem = raw as Class;
            details.push(<p key="type" className="flex items-center gap-2"><Repeat size={16} /> Recurring Class</p>);
        }
        if (isBookingOfAppointment(raw) || event.type === 'booking' && (raw as Booking).serviceType === 'appointment') {
             details.push(<p key="type" className="flex items-center gap-2"><Users size={16} /> 1-on-1 Appointment</p>);
        }
        
        return <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-protribe-gray-dark dark:text-protribe-gray-light">{details}</div>;
    };


    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-protribe-gray-700 rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-5 border-b border-gray-200 dark:border-protribe-gray-600 flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold text-protribe-gray-extradark dark:text-white">{event.title}</h2>
                        <div className="mt-2 text-sm text-protribe-gray-dark dark:text-protribe-gray-light">
                             <p className="flex items-center gap-2 mb-1"><Calendar size={16} /> {event.start.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                             <p className="flex items-center gap-2"><Clock size={16} /> {event.start.toLocaleTimeString([], { timeStyle: 'short' })} - {event.end.toLocaleTimeString([], { timeStyle: 'short' })}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-protribe-gray-600">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-5 space-y-4">
                     {event.type === 'booking' && (
                        <div className="p-3 bg-protribe-green-light dark:bg-protribe-green-dark/20 rounded-md">
                            <h3 className="font-semibold text-protribe-gray-extradark dark:text-white flex items-center gap-2"><User size={16} /> Booked by</h3>
                            <p className="text-protribe-gray-dark dark:text-protribe-gray-light mt-1">{event.customerName}</p>
                             {event.bookingStatus === 'cancelled' && (
                                <p className="mt-2 text-sm font-bold text-red-600 dark:text-red-400">This booking has been cancelled.</p>
                            )}
                        </div>
                    )}
                    <div>
                        <h3 className="font-semibold text-protribe-gray-extradark dark:text-white mb-2">Details</h3>
                        {renderDetails()}
                    </div>
                </div>
                 <div className="p-4 bg-gray-50 dark:bg-protribe-gray-800 border-t border-gray-200 dark:border-protribe-gray-600 flex justify-end flex-wrap gap-3">
                    {canEdit && (
                        <button onClick={handleEdit} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white dark:bg-protribe-gray-700 border border-gray-300 dark:border-protribe-gray-500 rounded-md hover:bg-gray-50 dark:hover:bg-protribe-gray-600">
                            <Edit size={14}/> Edit {event.type === 'booking' ? 'Type' : 'Event'}
                        </button>
                    )}
                    {canReschedule && event.bookingStatus !== 'cancelled' && (
                         <button onClick={handleReschedule} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-protribe-teal hover:bg-protribe-green-dark rounded-md">
                           <RefreshCw size={14}/> Reschedule
                        </button>
                    )}
                    {canCancel && event.bookingStatus !== 'cancelled' && (
                        <button onClick={handleCancel} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md">
                           <XCircle size={14}/> Cancel Booking
                        </button>
                    )}
                 </div>
            </div>
        </div>
    );
};

export default EventDetailModal;