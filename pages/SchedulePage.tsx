import React, { useState, useMemo, Fragment, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Users, Clock, User, Filter, X, Plus } from 'lucide-react';
import { useEvents, Session, Class, AppointmentType, Booking } from '../contexts/EventContext';
import { useCustomer } from '../contexts/CustomerContext';
import ScheduleForClientModal from '../components/modals/ScheduleForClientModal';
import CreateClassModal from '../components/modals/CreateClassModal';
import CreateAppointmentModal from '../components/modals/CreateAppointmentModal';
import EventDetailModal from '../components/modals/EventDetailModal';
import RescheduleModal from '../components/modals/RescheduleModal';


export type CalendarEvent = {
    id: string;
    title: string;
    start: Date;
    end: Date;
    type: 'session' | 'class' | 'booking';
    customerName?: string;
    bookingStatus?: 'confirmed' | 'cancelled';
    raw: Session | Class | Booking;
};

type CalendarView = 'month' | 'week' | 'list';

const dayNameToIndex: { [key: string]: number } = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

const EventColors = {
    session: {
        bg: 'bg-blue-100 dark:bg-blue-900/50',
        border: 'border-blue-400 dark:border-blue-700',
        text: 'text-blue-800 dark:text-blue-200',
        dot: 'bg-blue-500'
    },
    class: {
        bg: 'bg-purple-100 dark:bg-purple-900/50',
        border: 'border-purple-400 dark:border-purple-700',
        text: 'text-purple-800 dark:text-purple-200',
        dot: 'bg-purple-500'
    },
    booking: {
        bg: 'bg-protribe-green-light dark:bg-protribe-green-dark/30',
        border: 'border-protribe-teal dark:border-protribe-green-dark',
        text: 'text-protribe-green-dark dark:text-protribe-green-light',
        dot: 'bg-protribe-teal'
    },
};

const FilterCheckbox: React.FC<{ label: string; colorClass: string; checked: boolean; onChange: () => void; }> = ({ label, colorClass, checked, onChange }) => (
    <label className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-protribe-gray-700 cursor-pointer">
        <input
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className="h-4 w-4 rounded border-gray-300 text-protribe-teal focus:ring-protribe-teal"
        />
        <div className={`w-3 h-3 rounded-full ${colorClass}`}></div>
        <span className="text-sm">{label}</span>
    </label>
);

const SchedulePage: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<CalendarView>('month');
    const { sessions, classes, bookings, appointmentTypes, cancelBooking, saveClass, saveAppointmentType, rescheduleBooking } = useEvents();
    const { customers } = useCustomer();
    
    // Filter States
    const [filtersOpen, setFiltersOpen] = useState(false);
    const filtersRef = useRef<HTMLDivElement>(null);
    const [showOnlyBooked, setShowOnlyBooked] = useState(false);
    const [eventTypeFilters, setEventTypeFilters] = useState({
        session: true,
        class: true,
        booking: true, // Corresponds to appointments booked by clients
    });

    // Modal States
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    
    const [isClassModalOpen, setIsClassModalOpen] = useState(false);
    const [classToEdit, setClassToEdit] = useState<Class | null>(null);

    const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
    const [appointmentToEdit, setAppointmentToEdit] = useState<AppointmentType | null>(null);
    
    const [isEventDetailModalOpen, setIsEventDetailModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    
    const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
    const [bookingToReschedule, setBookingToReschedule] = useState<Booking | null>(null);
    
    const [modalDate, setModalDate] = useState<Date | null>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Only apply this logic for desktop dropdown
            if (window.innerWidth >= 768 && filtersRef.current && !filtersRef.current.contains(event.target as Node)) {
                setFiltersOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const areFiltersActive = useMemo(() => {
        return showOnlyBooked || !eventTypeFilters.session || !eventTypeFilters.class || !eventTypeFilters.booking;
    }, [showOnlyBooked, eventTypeFilters]);

    const { displayedDates, rangeLabel } = useMemo(() => {
        const d = new Date(currentDate);
        d.setHours(0, 0, 0, 0);

        if (view === 'month') {
            const year = d.getFullYear();
            const month = d.getMonth();
            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);
            
            const startDate = new Date(firstDay);
            startDate.setDate(startDate.getDate() - startDate.getDay());

            const endDate = new Date(lastDay);
            endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
            
            const dates = [];
            for (let dt = new Date(startDate); dt <= endDate; dt.setDate(dt.getDate() + 1)) {
                dates.push(new Date(dt));
            }
            
            const label = `${firstDay.toLocaleString('default', { month: 'long' })} ${year}`;
            return { displayedDates: dates, rangeLabel: label };
        } else { // week or list view
            const start = new Date(d);
            start.setDate(start.getDate() - start.getDay());
            const dates = Array.from({ length: 7 }, (_, i) => {
                const date = new Date(start);
                date.setDate(date.getDate() + i);
                return date;
            });
            const end = dates[6];
            const label = `${start.toLocaleString('default', { month: 'short' })} ${start.getDate()} - ${end.toLocaleString('default', { month: 'short' })} ${end.getDate()}, ${end.getFullYear()}`;
            return { displayedDates: dates, rangeLabel: label };
        }
    }, [currentDate, view]);

    const eventsByDate = useMemo(() => {
        const events: { [key: string]: CalendarEvent[] } = {};
        const rangeStart = displayedDates[0];
        const rangeEnd = new Date(displayedDates[displayedDates.length - 1]);
        rangeEnd.setHours(23, 59, 59, 999);

        displayedDates.forEach(d => {
            events[d.toISOString().split('T')[0]] = [];
        });

        const processEvent = (event: CalendarEvent, dateKey: string) => {
            if (events[dateKey]) {
                events[dateKey].push(event);
            }
        };
        
        if (!showOnlyBooked) {
            if (eventTypeFilters.session) {
                sessions.forEach(s => {
                    const eventDate = new Date(s.date + 'T' + s.time);
                    if (eventDate >= rangeStart && eventDate <= rangeEnd) {
                        const endDate = new Date(eventDate.getTime() + parseInt(s.duration) * 60000);
                        processEvent({ id: `s-${s.id}`, title: s.title, start: eventDate, end: endDate, type: 'session', raw: s }, s.date);
                    }
                });
            }
            if (eventTypeFilters.class) {
                classes.forEach(c => {
                    const classDays = c.schedule.days.map(d => dayNameToIndex[d]);
                    displayedDates.forEach(d => {
                        const dString = d.toISOString().split('T')[0];
                        const classStartDate = new Date(c.schedule.startDate + 'T00:00:00Z');
                        const classEndDate = c.schedule.endDate ? new Date(c.schedule.endDate + 'T23:59:59Z') : new Date('9999-12-31');
                        if (classDays.includes(d.getDay()) && d >= classStartDate && d <= classEndDate) {
                            const [hours, minutes] = c.schedule.startTime.split(':').map(Number);
                            const eventDate = new Date(d);
                            eventDate.setHours(hours, minutes, 0, 0);
                            const endDate = new Date(eventDate.getTime() + parseInt(c.duration) * 60000);
                            processEvent({ id: `c-${c.id}-${dString}`, title: c.title, start: eventDate, end: endDate, type: 'class', raw: c }, dString);
                        }
                    });
                });
            }
        }
        
        if (eventTypeFilters.booking) {
            bookings.forEach(b => {
                 const eventStartDate = new Date(b.eventDate + 'T' + (b.eventTime || '00:00'));
                 if (eventStartDate >= rangeStart && eventStartDate <= rangeEnd) {
                    const baseEvent = sessions.find(s => s.id === b.serviceId) || classes.find(c => c.id === b.serviceId) || appointmentTypes.find(a => a.id === b.serviceId);
                    const duration = baseEvent ? ( 'duration' in baseEvent ? Number(baseEvent.duration) : 30 ) : 60;
                    const endDate = new Date(eventStartDate.getTime() + duration * 60000);
                    const customer = customers.find(cust => cust.id === b.customerId);
                    processEvent({ id: `b-${b.id}`, title: b.serviceTitle, start: eventStartDate, end: endDate, type: 'booking', customerName: customer?.name || 'Unknown Client', bookingStatus: b.status, raw: b }, b.eventDate);
                 }
            });
        }

        Object.values(events).forEach(dayEvents => dayEvents.sort((a, b) => a.start.getTime() - b.start.getTime()));
        return events;
    }, [displayedDates, sessions, classes, bookings, customers, appointmentTypes, eventTypeFilters, showOnlyBooked]);

    const handlePrev = () => setCurrentDate(d => {
        const newDate = new Date(d);
        if (view === 'month') newDate.setMonth(newDate.getMonth() - 1);
        else newDate.setDate(newDate.getDate() - 7);
        return newDate;
    });
    const handleNext = () => setCurrentDate(d => {
        const newDate = new Date(d);
        if (view === 'month') newDate.setMonth(newDate.getMonth() + 1);
        else newDate.setDate(newDate.getDate() + 7);
        return newDate;
    });
    
    const openScheduleModal = (date: Date) => {
        setModalDate(date);
        setIsScheduleModalOpen(true);
    };
    
    const handleEventClick = (event: CalendarEvent) => {
        setSelectedEvent(event);
        setIsEventDetailModalOpen(true);
    };

    const handleEditEvent = (event: CalendarEvent) => {
        setIsEventDetailModalOpen(false);
        if (event.type === 'session') {
            openScheduleModal(event.start);
        } else if (event.type === 'class') {
            setClassToEdit(event.raw as Class);
            setIsClassModalOpen(true);
        } else if (event.type === 'booking') {
            const booking = event.raw as Booking;
            const service = appointmentTypes.find(a => a.id === booking.serviceId);
            if (service) {
                setAppointmentToEdit(service);
                setIsAppointmentModalOpen(true);
            }
        }
    };
    
    const handleCancelBooking = (bookingId: number) => {
        cancelBooking(bookingId);
        setIsEventDetailModalOpen(false);
    };

    const handleAdminReschedule = (booking: Booking) => {
        setIsEventDetailModalOpen(false);
        setBookingToReschedule(booking);
        setIsRescheduleModalOpen(true);
    };
    
    const handleEventTypeFilterChange = (type: keyof typeof eventTypeFilters) => {
        setEventTypeFilters(prev => ({...prev, [type]: !prev[type]}));
    };
    
    const resetFilters = () => {
        setShowOnlyBooked(false);
        setEventTypeFilters({ session: true, class: true, booking: true });
    };

    const renderFilterPanelContent = () => (
        <>
            <div className="p-3">
                <h4 className="text-xs font-bold uppercase text-protribe-gray dark:text-protribe-gray-400 mb-2">Event Types</h4>
                <FilterCheckbox label="Sessions" colorClass={EventColors.session.dot} checked={eventTypeFilters.session} onChange={() => handleEventTypeFilterChange('session')} />
                <FilterCheckbox label="Classes" colorClass={EventColors.class.dot} checked={eventTypeFilters.class} onChange={() => handleEventTypeFilterChange('class')} />
                <FilterCheckbox label="Appointments" colorClass={EventColors.booking.dot} checked={eventTypeFilters.booking} onChange={() => handleEventTypeFilterChange('booking')} />
            </div>
            <div className="border-t border-gray-100 dark:border-protribe-gray-700 p-3">
                <label className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 dark:hover:bg-protribe-gray-700 cursor-pointer">
                    <span className="text-sm font-medium">Show only booked events</span>
                    <input type="checkbox" checked={showOnlyBooked} onChange={(e) => setShowOnlyBooked(e.target.checked)} className="h-5 w-9 rounded-full bg-gray-300 dark:bg-protribe-gray-600 appearance-none relative before:absolute before:h-4 before:w-4 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 before:transition-transform checked:bg-protribe-teal checked:before:translate-x-4" />
                </label>
            </div>
            <div className="p-2 border-t border-gray-100 dark:border-protribe-gray-700">
                 <button onClick={resetFilters} className="w-full text-center text-sm text-protribe-teal hover:underline">Reset filters</button>
            </div>
        </>
    );

    const ViewButton: React.FC<{
        targetView: CalendarView;
        children: React.ReactNode
    }> = ({ targetView, children }) => (
        <button onClick={() => setView(targetView)} className={`px-3 py-1.5 text-sm rounded-md transition-colors ${view === targetView ? 'bg-white dark:bg-protribe-gray-600 shadow-sm text-protribe-gray-extradark dark:text-white font-medium' : 'hover:bg-gray-200 dark:hover:bg-protribe-gray-700 text-protribe-gray dark:text-protribe-gray-light'}`}>
            {children}
        </button>
    );

    const timeToPosition = (date: Date) => (date.getHours() + date.getMinutes() / 60) * 4 + 'rem';
    const durationToHeight = (start: Date, end: Date) => ((end.getTime() - start.getTime()) / 3600000) * 4 + 'rem';

    return (
        <>
            <div className="bg-white dark:bg-protribe-gray-700 border border-gray-200 dark:border-protribe-gray-600 rounded-lg shadow-sm p-4 sm:p-6 flex flex-col h-[85vh]">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className="flex items-center space-x-2">
                        <button onClick={handlePrev} className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-protribe-gray-600"><ChevronLeft size={20} /></button>
                        <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1.5 text-sm font-medium border border-gray-300 dark:border-protribe-gray-500 rounded-md hover:bg-gray-100 dark:hover:bg-protribe-gray-600">Today</button>
                        <button onClick={handleNext} className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-protribe-gray-600"><ChevronRight size={20} /></button>
                        <h2 className="text-lg font-semibold text-protribe-gray-extradark dark:text-white ml-2">{rangeLabel}</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="hidden md:flex items-center p-1 bg-gray-100 dark:bg-protribe-gray-800 rounded-md">
                           <ViewButton targetView="month">Month</ViewButton>
                           <ViewButton targetView="week">Week</ViewButton>
                           <ViewButton targetView="list">List</ViewButton>
                        </div>
                        {/* Filters Dropdown */}
                        <div className="relative" ref={filtersRef}>
                            <button onClick={() => setFiltersOpen(!filtersOpen)} className="relative flex items-center justify-center gap-2 h-10 w-10 sm:w-auto sm:px-3 sm:py-2 text-sm font-medium border border-gray-300 dark:border-protribe-gray-500 rounded-md hover:bg-gray-100 dark:hover:bg-protribe-gray-600">
                                <Filter size={18} />
                                <span className="hidden sm:inline">Filters</span>
                                <span className="sr-only">Filters</span>
                                {areFiltersActive && <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-protribe-teal rounded-full border-2 border-white dark:border-protribe-gray-700"></span>}
                            </button>
                            
                            {/* Desktop Dropdown */}
                            {filtersOpen && (
                                <div className="hidden md:block absolute right-0 mt-2 w-64 bg-white dark:bg-protribe-gray-800 rounded-md shadow-lg border dark:border-protribe-gray-600 z-20">
                                    {renderFilterPanelContent()}
                                </div>
                            )}
                        </div>
                        <button onClick={() => openScheduleModal(new Date())} className="flex items-center justify-center gap-2 h-10 w-10 sm:w-auto sm:px-4 sm:py-2 text-sm font-medium text-white bg-protribe-teal rounded-md hover:bg-protribe-green-dark">
                             <Plus size={18} />
                             <span className="hidden sm:inline">Schedule for Client</span>
                             <span className="sr-only">Schedule for Client</span>
                        </button>
                    </div>
                </div>

                {/* --- Mobile Agenda View --- */}
                <div className="flex-1 overflow-auto md:hidden space-y-4">
                    {displayedDates.map(d => {
                        const dateString = d.toISOString().split('T')[0];
                        const dayEvents = eventsByDate[dateString] || [];
                        if (dayEvents.length === 0) return null;
                        return (
                             <div key={dateString}>
                                <h3 className={`font-semibold p-2 sticky top-0 bg-gray-100 dark:bg-protribe-gray-800 z-10 ${new Date().toDateString() === d.toDateString() ? 'text-protribe-teal' : 'text-protribe-gray-extradark dark:text-white'}`}>
                                    {d.toLocaleString('default', { weekday: 'long' })}, {d.getDate()}
                                </h3>
                                <div className="space-y-2 p-2">
                                    {dayEvents.map(event => (
                                        <button key={event.id} onClick={() => handleEventClick(event)} className={`w-full text-left p-3 rounded-lg border-l-4 ${EventColors[event.type].bg} ${EventColors[event.type].border} ${EventColors[event.type].text} ${event.bookingStatus === 'cancelled' ? 'opacity-50' : ''}`}>
                                            <p className="font-bold">{event.title} {event.bookingStatus === 'cancelled' && '(Cancelled)'}</p>
                                            <p className="text-sm flex items-center gap-2"><Clock size={14}/> {event.start.toLocaleTimeString([], {timeStyle: 'short'})} - {event.end.toLocaleTimeString([], {timeStyle: 'short'})}</p>
                                            {event.type === 'booking' && <p className="text-sm flex items-center gap-2"><User size={14}/>{event.customerName}</p>}
                                        </button>
                                    ))}
                                </div>
                             </div>
                        )
                    })}
                </div>
                
                {/* --- Desktop Views --- */}
                <div className="flex-1 overflow-auto hidden md:block">
                    {view === 'month' && (
                        <div className="grid grid-cols-7 grid-rows-[auto,1fr,1fr,1fr,1fr,1fr] h-full">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="text-center py-2 text-xs font-medium text-protribe-gray dark:text-protribe-gray-400 border-b dark:border-protribe-gray-600">{day}</div>)}
                            {displayedDates.map(d => {
                                const dateString = d.toISOString().split('T')[0];
                                const dayEvents = eventsByDate[dateString] || [];
                                const isToday = new Date().toDateString() === d.toDateString();
                                const isCurrentMonth = d.getMonth() === currentDate.getMonth();
                                return (
                                    <div key={dateString} className={`p-1 border-t border-r border-gray-200 dark:border-protribe-gray-600 ${isCurrentMonth ? '' : 'bg-gray-50 dark:bg-protribe-gray-800/50'}`}>
                                        <div className={`text-xs font-semibold ${isToday ? 'bg-protribe-teal text-white rounded-full w-5 h-5 flex items-center justify-center' : ''} ${isCurrentMonth ? 'text-protribe-gray-extradark dark:text-white' : 'text-protribe-gray dark:text-protribe-gray-400'}`}>
                                            {d.getDate()}
                                        </div>
                                        <div className="mt-1 space-y-1">
                                            {dayEvents.slice(0, 3).map(event => (
                                                <button key={event.id} onClick={() => handleEventClick(event)} className={`w-full flex items-center gap-1.5 text-xs p-1 rounded ${EventColors[event.type].bg} ${EventColors[event.type].text} ${event.bookingStatus === 'cancelled' ? 'opacity-50' : ''}`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${EventColors[event.type].dot}`}></div>
                                                    <span className="truncate">{event.title}</span>
                                                </button>
                                            ))}
                                            {dayEvents.length > 3 && <div className="text-xs text-protribe-gray dark:text-protribe-gray-400 text-center">+ {dayEvents.length - 3} more</div>}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {view === 'week' && (
                        <div className="flex flex-col h-full">
                            <div className="grid grid-cols-[auto,1fr,1fr,1fr,1fr,1fr,1fr,1fr] sticky top-0 bg-white dark:bg-protribe-gray-700 z-10">
                                <div className="w-16"></div>
                                {displayedDates.map(d => (
                                    <div key={d.toISOString()} className="text-center py-2 border-b border-l border-gray-200 dark:border-protribe-gray-600">
                                        <div className="text-xs font-medium text-protribe-gray dark:text-protribe-gray-400">{d.toLocaleString('default', { weekday: 'short' })}</div>
                                        <div className={`text-xl font-bold ${new Date().toDateString() === d.toDateString() ? 'text-protribe-teal' : 'text-protribe-gray-extradark dark:text-white'}`}>{d.getDate()}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-[auto,1fr,1fr,1fr,1fr,1fr,1fr,1fr] flex-1">
                                <div className="w-16">
                                    {Array.from({length: 24}).map((_, i) => <div key={i} className="h-16 text-right pr-2 text-xs text-protribe-gray dark:text-protribe-gray-400 border-r dark:border-protribe-gray-600 -translate-y-2">{i > 0 && `${i}:00`}</div>)}
                                </div>
                                {displayedDates.map(d => (
                                    <div key={d.toISOString()} className="relative border-l border-gray-200 dark:border-protribe-gray-600">
                                        {Array.from({length: 24}).map((_, i) => <div key={i} className="h-16 border-b border-gray-200 dark:border-protribe-gray-600"></div>)}
                                        {(eventsByDate[d.toISOString().split('T')[0]] || []).map(event => (
                                            <button key={event.id} onClick={() => handleEventClick(event)} className={`absolute w-[calc(100%-0.5rem)] left-1 p-2 rounded-lg text-xs border ${EventColors[event.type].bg} ${EventColors[event.type].border} ${EventColors[event.type].text} ${event.bookingStatus === 'cancelled' ? 'opacity-50 line-through' : ''}`} style={{ top: timeToPosition(event.start), height: durationToHeight(event.start, event.end) }}>
                                                <p className="font-bold truncate">{event.title}</p>
                                                {event.type === 'booking' && <p className="flex items-center gap-1"><User size={12}/>{event.customerName}</p>}
                                            </button>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {view === 'list' && (
                         <div className="space-y-4">
                            {displayedDates.map(d => {
                                const dateString = d.toISOString().split('T')[0];
                                const dayEvents = eventsByDate[dateString] || [];
                                if (dayEvents.length === 0) return null;
                                return (
                                     <div key={dateString}>
                                        <h3 className={`font-semibold p-2 sticky top-0 bg-gray-100 dark:bg-protribe-gray-800 z-10 ${new Date().toDateString() === d.toDateString() ? 'text-protribe-teal' : 'text-protribe-gray-extradark dark:text-white'}`}>
                                            {d.toLocaleString('default', { weekday: 'long' })}, {d.toLocaleString('default', { month: 'long' })} {d.getDate()}
                                        </h3>
                                        <div className="divide-y divide-gray-200 dark:divide-protribe-gray-600">
                                            {dayEvents.map(event => (
                                                <button key={event.id} onClick={() => handleEventClick(event)} className={`w-full text-left flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-protribe-gray-800/50 ${event.bookingStatus === 'cancelled' ? 'opacity-50' : ''}`}>
                                                    <div className={`w-2 h-2 rounded-full ${EventColors[event.type].dot}`}></div>
                                                    <div className="w-24 font-semibold text-protribe-gray-dark dark:text-protribe-gray-light">{event.start.toLocaleTimeString([], {timeStyle: 'short'})}</div>
                                                    <div className="flex-1">
                                                        <p className={`font-bold ${EventColors[event.type].text} ${event.bookingStatus === 'cancelled' ? 'line-through' : ''}`}>{event.title}</p>
                                                        {event.type === 'booking' && <p className="text-sm flex items-center gap-2 text-protribe-gray dark:text-protribe-gray-400"><User size={14}/>{event.customerName}</p>}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                     </div>
                                )
                            })}
                         </div>
                    )}
                </div>
            </div>

            {/* Mobile Filter Modal */}
            {filtersOpen && (
                <div 
                    className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
                    onClick={() => setFiltersOpen(false)}
                >
                    <div 
                        className="bg-white dark:bg-protribe-gray-800 rounded-lg shadow-xl w-full max-w-xs" 
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-3 border-b dark:border-protribe-gray-600 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-protribe-gray-extradark dark:text-white">Filters</h3>
                            <button onClick={() => setFiltersOpen(false)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-protribe-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        {renderFilterPanelContent()}
                        <div className="p-3 bg-gray-50 dark:bg-protribe-gray-800/50 border-t dark:border-protribe-gray-600">
                            <button onClick={() => setFiltersOpen(false)} className="w-full px-4 py-2 text-sm font-medium text-white bg-protribe-teal rounded-md">
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ScheduleForClientModal
                isOpen={isScheduleModalOpen}
                onClose={() => setIsScheduleModalOpen(false)}
                defaultDate={modalDate}
            />
            {selectedEvent && (
                <EventDetailModal
                    isOpen={isEventDetailModalOpen}
                    onClose={() => setIsEventDetailModalOpen(false)}
                    event={selectedEvent}
                    onEdit={handleEditEvent}
                    onCancelBooking={handleCancelBooking}
                    onReschedule={handleAdminReschedule}
                />
            )}
            <CreateClassModal
                isOpen={isClassModalOpen}
                onClose={() => setIsClassModalOpen(false)}
                onSave={(data) => { saveClass(data); setIsClassModalOpen(false); }}
                classToEdit={classToEdit}
            />
            <CreateAppointmentModal
                isOpen={isAppointmentModalOpen}
                onClose={() => setIsAppointmentModalOpen(false)}
                onSave={(data) => { saveAppointmentType(data); setIsAppointmentModalOpen(false); }}
                appointmentToEdit={appointmentToEdit}
            />
            {bookingToReschedule && (
                <RescheduleModal
                    isOpen={isRescheduleModalOpen}
                    onClose={() => setIsRescheduleModalOpen(false)}
                    booking={bookingToReschedule}
                    onReschedule={rescheduleBooking}
                    isAdmin={true}
                />
            )}
        </>
    );
};

export default SchedulePage;