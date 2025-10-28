import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import SessionCard from '../components/cards/SessionCard';
import ClassCard from '../components/cards/ClassCard';
import AppointmentCard from '../components/cards/AppointmentCard';
import CreateSessionModal from '../components/modals/CreateSessionModal';
import CreateClassModal from '../components/modals/CreateClassModal';
import CreateAppointmentModal from '../components/modals/CreateAppointmentModal';
import EmptyState from '../components/ui/EmptyState';
import InfoBox from '../components/ui/InfoBox';
// FIX: Import types and hook from EventContext to resolve circular dependency
import { useEvents, Session, Class, AppointmentType } from '../contexts/EventContext';


const EventsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'sessions' | 'classes' | 'appointment-types'>('sessions');
    
    // Consume global state and handlers from context
    const {
        sessions, classes, appointmentTypes,
        saveSession, deleteSession, togglePauseSession,
        saveClass, deleteClass, togglePauseClass,
        saveAppointmentType, deleteAppointmentType, togglePauseAppointmentType
    } = useEvents();

    const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
    const [sessionToEdit, setSessionToEdit] = useState<Session | null>(null);

    const [isClassModalOpen, setIsClassModalOpen] = useState(false);
    const [classToEdit, setClassToEdit] = useState<Class | null>(null);

    const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
    const [appointmentToEdit, setAppointmentToEdit] = useState<AppointmentType | null>(null);

    // Search and Filter states
    const [sessionSearch, setSessionSearch] = useState('');
    const [sessionStatusFilter, setSessionStatusFilter] = useState<'all' | 'active' | 'paused'>('all');
    const [sessionTypeFilter, setSessionTypeFilter] = useState<'all' | '1-on-1' | 'Group'>('all');

    const [classSearch, setClassSearch] = useState('');
    const [classStatusFilter, setClassStatusFilter] = useState<'all' | 'active' | 'paused'>('all');

    const [appointmentSearch, setAppointmentSearch] = useState('');
    const [appointmentStatusFilter, setAppointmentStatusFilter] = useState<'all' | 'active' | 'paused'>('all');

    // Memoized filtered lists
    const filteredSessions = useMemo(() => {
        const searchTermLower = sessionSearch.toLowerCase();
        return sessions
            .filter(session => {
                if (sessionStatusFilter !== 'all' && session.status !== sessionStatusFilter) return false;
                if (sessionTypeFilter !== 'all' && session.sessionType !== sessionTypeFilter) return false;
                return true;
            })
            .filter(session =>
                session.title.toLowerCase().includes(searchTermLower) ||
                (session.description && session.description.toLowerCase().includes(searchTermLower))
            );
    }, [sessions, sessionSearch, sessionStatusFilter, sessionTypeFilter]);

    const filteredClasses = useMemo(() => {
        const searchTermLower = classSearch.toLowerCase();
        return classes
            .filter(classItem => {
                if (classStatusFilter !== 'all' && classItem.status !== classStatusFilter) return false;
                return true;
            })
            .filter(classItem =>
                classItem.title.toLowerCase().includes(searchTermLower) ||
                (classItem.description && classItem.description.toLowerCase().includes(searchTermLower))
            );
    }, [classes, classSearch, classStatusFilter]);

    const filteredAppointmentTypes = useMemo(() => {
        const searchTermLower = appointmentSearch.toLowerCase();
        return appointmentTypes
            .filter(appointment => {
                if (appointmentStatusFilter !== 'all' && appointment.status !== appointmentStatusFilter) return false;
                return true;
            })
            .filter(appointment =>
                appointment.title.toLowerCase().includes(searchTermLower) ||
                (appointment.description && appointment.description.toLowerCase().includes(searchTermLower))
            );
    }, [appointmentTypes, appointmentSearch, appointmentStatusFilter]);
    
    // Modal Handlers
    const handleEditSession = (session: Session) => {
        setSessionToEdit(session);
        setIsSessionModalOpen(true);
    };

    const handleSaveSession = (sessionData: Omit<Session, 'id' | 'status'> & { id?: number }) => {
        saveSession(sessionData);
        setSessionToEdit(null);
        setIsSessionModalOpen(false);
    };

    const handleEditClass = (classItem: Class) => {
        setClassToEdit(classItem);
        setIsClassModalOpen(true);
    };

     const handleSaveClass = (classData: Omit<Class, 'id' | 'status'> & { id?: number }) => {
        saveClass(classData);
        setClassToEdit(null);
        setIsClassModalOpen(false);
    };

    const handleEditAppointmentType = (appointment: AppointmentType) => {
        setAppointmentToEdit(appointment);
        setIsAppointmentModalOpen(true);
    };

    const handleSaveAppointmentType = (appointmentData: Omit<AppointmentType, 'id' | 'status'> & { id?: number }) => {
        saveAppointmentType(appointmentData);
        setAppointmentToEdit(null);
        setIsAppointmentModalOpen(false);
    };

    const tabClasses = (isActive: boolean) => 
        `px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            isActive
                ? 'border-protribe-teal text-protribe-teal'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`;

    const renderFilters = () => {
        const selectClasses = "w-full md:w-auto px-3 py-2 bg-white dark:bg-protribe-gray-700 border border-gray-300 dark:border-protribe-gray-600 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-protribe-teal/50";
        const searchInputClasses = "w-full pl-10 pr-4 py-2 bg-white dark:bg-protribe-gray-700 border border-gray-300 dark:border-protribe-gray-600 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-protribe-teal/50";

        if (activeTab === 'sessions') {
            return (
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative w-full md:flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                        <input type="text" placeholder="Search sessions..." value={sessionSearch} onChange={(e) => setSessionSearch(e.target.value)} className={searchInputClasses} />
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                        <select value={sessionStatusFilter} onChange={(e) => setSessionStatusFilter(e.target.value as any)} className={selectClasses}>
                            <option value="all">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="paused">Paused</option>
                        </select>
                        <select value={sessionTypeFilter} onChange={(e) => setSessionTypeFilter(e.target.value as any)} className={selectClasses}>
                            <option value="all">All Types</option>
                            <option value="1-on-1">1-on-1</option>
                            <option value="Group">Group</option>
                        </select>
                    </div>
                </div>
            );
        }

        if (activeTab === 'classes') {
            return (
                 <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative w-full md:flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                        <input type="text" placeholder="Search classes..." value={classSearch} onChange={(e) => setClassSearch(e.target.value)} className={searchInputClasses} />
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                        <select value={classStatusFilter} onChange={(e) => setClassStatusFilter(e.target.value as any)} className={selectClasses}>
                            <option value="all">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="paused">Paused</option>
                        </select>
                    </div>
                </div>
            )
        }
        
        if (activeTab === 'appointment-types') {
             return (
                 <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative w-full md:flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                        <input type="text" placeholder="Search appointment types..." value={appointmentSearch} onChange={(e) => setAppointmentSearch(e.target.value)} className={searchInputClasses} />
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                        <select value={appointmentStatusFilter} onChange={(e) => setAppointmentStatusFilter(e.target.value as any)} className={selectClasses}>
                            <option value="all">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="paused">Paused</option>
                        </select>
                    </div>
                </div>
            )
        }
        return null;
    }

    return (
        <>
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <div className="flex border-b border-gray-200 dark:border-protribe-gray-700">
                    <button onClick={() => setActiveTab('sessions')} className={tabClasses(activeTab === 'sessions')}>
                        Sessions
                    </button>
                    <button onClick={() => setActiveTab('classes')} className={tabClasses(activeTab === 'classes')}>
                        Classes
                    </button>
                    <button onClick={() => setActiveTab('appointment-types')} className={tabClasses(activeTab === 'appointment-types')}>
                        Appointment Types
                    </button>
                </div>
                <div>
                    {activeTab === 'sessions' && (
                        <button onClick={() => { setSessionToEdit(null); setIsSessionModalOpen(true); }} className="px-4 py-2 text-sm font-medium text-white bg-protribe-teal rounded-md hover:bg-protribe-green-dark">
                            + New Session
                        </button>
                    )}
                    {activeTab === 'classes' && (
                        <button onClick={() => { setClassToEdit(null); setIsClassModalOpen(true); }} className="px-4 py-2 text-sm font-medium text-white bg-protribe-teal rounded-md hover:bg-protribe-green-dark">
                            + New Class
                        </button>
                    )}
                     {activeTab === 'appointment-types' && (
                        <button onClick={() => { setAppointmentToEdit(null); setIsAppointmentModalOpen(true); }} className="px-4 py-2 text-sm font-medium text-white bg-protribe-teal rounded-md hover:bg-protribe-green-dark">
                            + New Appointment Type
                        </button>
                    )}
                </div>
            </div>
            
            <div className="mb-6">{renderFilters()}</div>

            {activeTab === 'sessions' && (
                 <InfoBox title="How Sessions Work">
                    Sessions are one-time events, perfect for individual appointments, consultations, or single workshops. Once a client books a session, that specific time slot is filled.
                </InfoBox>
            )}
             {activeTab === 'classes' && (
                 <InfoBox title="How Classes Work">
                    Classes are recurring events that happen on a set schedule (e.g., every Tuesday and Thursday). Clients can join any scheduled occurrence, making them ideal for group fitness or ongoing courses.
                </InfoBox>
            )}
             {activeTab === 'appointment-types' && (
                 <InfoBox title="How Appointment Types Work">
                    Appointment Types are bookable slots based on your availability, much like Calendly. Set your weekly hours, and clients can book appointments with you at their convenience.
                </InfoBox>
            )}

            {activeTab === 'sessions' && (
                filteredSessions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredSessions.map(session => (
                            <SessionCard 
                                key={session.id} 
                                session={session} 
                                onEdit={handleEditSession} 
                                onDelete={deleteSession}
                                onTogglePause={togglePauseSession}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyState message={sessions.length > 0 ? "No sessions match your search or filter criteria." : "You haven't created any sessions yet. Sessions are one-time events like appointments or workshops."} />
                )
            )}

            {activeTab === 'classes' && (
                filteredClasses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredClasses.map(classItem => (
                            <ClassCard 
                                key={classItem.id} 
                                classItem={classItem}
                                onEdit={handleEditClass}
                                onDelete={deleteClass}
                                onTogglePause={togglePauseClass}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyState message={classes.length > 0 ? "No classes match your search or filter criteria." : "You haven't created any classes yet. Classes are recurring events that clients can join on a regular basis."} />
                )
            )}

            {activeTab === 'appointment-types' && (
                filteredAppointmentTypes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredAppointmentTypes.map(appointment => (
                            <AppointmentCard
                                key={appointment.id}
                                appointmentType={appointment}
                                onEdit={handleEditAppointmentType}
                                onDelete={deleteAppointmentType}
                                onTogglePause={togglePauseAppointmentType}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyState message={appointmentTypes.length > 0 ? "No appointment types match your search or filter criteria." : "You haven't created any appointment types yet. These are bookable events your clients can schedule themselves."} />
                )
            )}
            
            <CreateSessionModal
                isOpen={isSessionModalOpen}
                onClose={() => setIsSessionModalOpen(false)}
                onSave={handleSaveSession}
                sessionToEdit={sessionToEdit}
            />

            <CreateClassModal
                isOpen={isClassModalOpen}
                onClose={() => setIsClassModalOpen(false)}
                onSave={handleSaveClass}
                classToEdit={classToEdit}
            />
            
            <CreateAppointmentModal
                isOpen={isAppointmentModalOpen}
                onClose={() => setIsAppointmentModalOpen(false)}
                onSave={handleSaveAppointmentType}
                appointmentToEdit={appointmentToEdit}
            />
        </>
    );
};

export default EventsPage;