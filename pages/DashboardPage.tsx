import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useEvents, Session } from '../contexts/EventContext';
import { useCustomer } from '../contexts/CustomerContext';
import { useSettings, currencySymbols } from '../contexts/SettingsContext';
import { useStorefront } from '../contexts/StorefrontContext';
import { Calendar, UserPlus, DollarSign, ExternalLink, PlusCircle } from 'lucide-react';
import ScheduleForClientModal from '../components/modals/ScheduleForClientModal';
import AddCustomerModal from '../components/modals/AddCustomerModal';
import CreateSessionModal from '../components/modals/CreateSessionModal';

const StatCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    value: string;
    description: string;
}> = ({ icon, title, value, description }) => (
    <div className="bg-white dark:bg-protribe-gray-700 p-5 rounded-lg shadow-sm border border-gray-200 dark:border-protribe-gray-600 flex items-start space-x-4">
        <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center bg-protribe-green-light dark:bg-protribe-green-dark/30 rounded-full text-protribe-teal">
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light">{title}</p>
            <p className="text-3xl font-bold text-protribe-gray-extradark dark:text-white">{value}</p>
            <p className="text-xs text-protribe-gray dark:text-protribe-gray-400">{description}</p>
        </div>
    </div>
);

const QuickActionButton: React.FC<{
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
    href?: string;
    to?: string;
}> = ({ icon, label, onClick, href, to }) => {
    const content = (
        <>
            <div className="h-10 w-10 mb-2 flex items-center justify-center text-protribe-teal">{icon}</div>
            <span className="text-sm font-semibold text-protribe-gray-extradark dark:text-white">{label}</span>
        </>
    );
    
    const commonClasses = "flex flex-col items-center justify-center text-center p-4 bg-white dark:bg-protribe-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-protribe-gray-600 hover:border-protribe-teal hover:shadow-md transition-all duration-200 h-full";
    
    if (to) {
        return (
            <Link to={to} className={commonClasses}>
                {content}
            </Link>
        );
    }
    
    if (href) {
        return (
            <a href={href} target="_blank" rel="noopener noreferrer" className={commonClasses}>
                {content}
            </a>
        );
    }
    
    return (
        <button onClick={onClick} className={commonClasses}>
            {content}
        </button>
    );
};


const DashboardPage: React.FC = () => {
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
    const [isCreateSessionModalOpen, setIsCreateSessionModalOpen] = useState(false);
    
    const { bookings, purchases, saveSession } = useEvents();
    const { customers, addCustomer } = useCustomer();
    const { currency } = useSettings();
    const { settings: storefrontSettings } = useStorefront();

    const storefrontUrl = `${window.location.origin}${window.location.pathname}#/store/${storefrontSettings.slug}`;

    const stats = useMemo(() => {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const bookingsToday = bookings.filter(b => b.eventDate === todayStr).length;

        const newClientsThisWeek = customers.filter(c => new Date(c.signUpDate) >= startOfWeek).length;

        const revenueThisMonth = purchases
            .filter(p => new Date(p.purchaseDate) >= startOfMonth)
            .reduce((sum, p) => sum + parseFloat(p.price), 0);
            
        return { bookingsToday, newClientsThisWeek, revenueThisMonth };
    }, [bookings, customers, purchases]);

    const upcomingBookings = useMemo(() => {
        const now = new Date();
        return bookings
            .filter(b => new Date(b.eventDate + 'T' + (b.eventTime || '23:59')) >= now && b.status === 'confirmed')
            .sort((a, b) => new Date(a.eventDate + 'T' + (a.eventTime || '00:00')).getTime() - new Date(b.eventDate + 'T' + (b.eventTime || '00:00')).getTime())
            .slice(0, 10); // Limit to next 10
    }, [bookings]);
    
     const recentActivity = useMemo(() => {
        const newClientActivities = customers.map(c => ({
            type: 'new_client' as const,
            date: new Date(c.signUpDate),
            data: c,
        }));
        const newBookingActivities = bookings.map(b => ({
            type: 'new_booking' as const,
            date: new Date(b.eventDate + 'T' + (b.eventTime || '00:00')),
            data: b,
        }));

        return [...newClientActivities, ...newBookingActivities]
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .slice(0, 7);
    }, [customers, bookings]);

    const handleSaveSession = (sessionData: Omit<Session, 'id' | 'status'> & { id?: number }) => {
        saveSession(sessionData);
        setIsCreateSessionModalOpen(false);
    };

    return (
        <>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-protribe-gray-extradark dark:text-white">Dashboard</h1>
                        <p className="text-protribe-gray-dark dark:text-protribe-gray-light mt-1">Welcome back, here's a snapshot of your business.</p>
                    </div>
                </div>
                
                {/* Quick Actions */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    <QuickActionButton icon={<Calendar size={24} />} label="View Schedule" to="/schedule" />
                    <QuickActionButton icon={<UserPlus size={24} />} label="Add New Client" onClick={() => setIsAddClientModalOpen(true)} />
                    <QuickActionButton icon={<PlusCircle size={24} />} label="New Session" onClick={() => setIsCreateSessionModalOpen(true)} />
                    <QuickActionButton icon={<ExternalLink size={24} />} label="View Storefront" href={storefrontUrl} />
                    <QuickActionButton icon={<Calendar size={24} />} label="Schedule Client" onClick={() => setIsScheduleModalOpen(true)} />
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StatCard 
                        icon={<Calendar size={24} />} 
                        title="Today's Bookings" 
                        value={stats.bookingsToday.toString()}
                        description="Confirmed bookings for today."
                    />
                    <StatCard 
                        icon={<UserPlus size={24} />} 
                        title="New Clients" 
                        value={stats.newClientsThisWeek.toString()}
                        description="Signed up this week."
                    />
                    <StatCard 
                        icon={<DollarSign size={24} />} 
                        title="Revenue" 
                        value={`${currencySymbols[currency]}${stats.revenueThisMonth.toFixed(2)}`}
                        description="This month so far."
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Upcoming Schedule */}
                    <div className="lg:col-span-2 bg-white dark:bg-protribe-gray-700 border border-gray-200 dark:border-protribe-gray-600 rounded-lg shadow-sm">
                        <div className="p-5 border-b border-gray-200 dark:border-protribe-gray-800">
                            <h2 className="text-lg font-semibold text-protribe-gray-extradark dark:text-white">Upcoming Schedule</h2>
                        </div>
                        <div className="p-3">
                            {upcomingBookings.length > 0 ? (
                                <ul className="space-y-2 max-h-96 overflow-y-auto">
                                    {upcomingBookings.map(booking => {
                                        const customer = customers.find(c => c.id === booking.customerId);
                                        const eventDate = new Date(booking.eventDate + 'T' + (booking.eventTime || '00:00:00Z'));
                                        return (
                                            <li key={booking.id} className="flex items-center justify-between p-3 rounded-md hover:bg-gray-50 dark:hover:bg-protribe-gray-600/50">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-protribe-green-light flex items-center justify-center font-bold text-protribe-green-dark">
                                                        {customer ? customer.name.split(' ').map(n=>n[0]).join('') : '?'}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-protribe-gray-extradark dark:text-white">{booking.serviceTitle}</p>
                                                        <p className="text-sm text-protribe-gray dark:text-protribe-gray-light">with {customer?.name || 'Unknown Client'}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold text-sm text-protribe-gray-extradark dark:text-white">{eventDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</p>
                                                    <p className="text-xs text-protribe-gray dark:text-protribe-gray-light">{eventDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}</p>
                                                </div>
                                            </li>
                                        )
                                    })}
                                </ul>
                            ) : (
                                <div className="text-center p-12 text-sm text-protribe-gray-dark dark:text-protribe-gray-light">
                                    No upcoming bookings.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white dark:bg-protribe-gray-700 border border-gray-200 dark:border-protribe-gray-600 rounded-lg shadow-sm">
                        <div className="p-5 border-b border-gray-200 dark:border-protribe-gray-800">
                            <h2 className="text-lg font-semibold text-protribe-gray-extradark dark:text-white">Recent Activity</h2>
                        </div>
                         <div className="p-3">
                             {recentActivity.length > 0 ? (
                                <ul className="space-y-1 max-h-96 overflow-y-auto">
                                    {recentActivity.map((activity, index) => {
                                         const customer = activity.type === 'new_client' ? activity.data : customers.find(c => c.id === activity.data.customerId);
                                        return (
                                            <li key={index} className="flex items-center gap-3 p-3 rounded-md">
                                                <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center bg-protribe-gray-light dark:bg-protribe-gray-600 rounded-full text-protribe-gray-dark dark:text-protribe-gray-light">
                                                    {activity.type === 'new_client' ? <UserPlus size={16} /> : <Calendar size={16} />}
                                                </div>
                                                <div className="text-sm">
                                                    {activity.type === 'new_client' ? (
                                                        <p><span className="font-semibold text-protribe-gray-extradark dark:text-white">{activity.data.name}</span> just signed up.</p>
                                                    ) : (
                                                         <p>New booking for <span className="font-semibold text-protribe-gray-extradark dark:text-white">{activity.data.serviceTitle}</span> by {customer?.name || 'a client'}.</p>
                                                    )}
                                                    <p className="text-xs text-protribe-gray dark:text-protribe-gray-400">{activity.date.toLocaleDateString()}</p>
                                                </div>
                                            </li>
                                        )
                                    })}
                                </ul>
                             ) : (
                                <div className="text-center p-12 text-sm text-protribe-gray-dark dark:text-protribe-gray-light">
                                    No recent activity.
                                </div>
                            )}
                         </div>
                    </div>
                </div>
            </div>
            <ScheduleForClientModal isOpen={isScheduleModalOpen} onClose={() => setIsScheduleModalOpen(false)} />
            <AddCustomerModal 
                isOpen={isAddClientModalOpen} 
                onClose={() => setIsAddClientModalOpen(false)} 
                onSave={addCustomer}
            />
            <CreateSessionModal 
                isOpen={isCreateSessionModalOpen} 
                onClose={() => setIsCreateSessionModalOpen(false)} 
                onSave={handleSaveSession}
            />
        </>
    );
};

export default DashboardPage;