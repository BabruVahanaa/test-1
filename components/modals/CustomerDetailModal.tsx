import React, { useState, useMemo } from 'react';
import { useCustomer, Customer } from '../../contexts/CustomerContext';
import { useEvents } from '../../contexts/EventContext';
import { useSettings, currencySymbols, type Currency } from '../../contexts/SettingsContext';
import { X, User, Mail, Calendar, Hash, Briefcase, CreditCard, FileText, ShoppingBag, Plus, Clock, DollarSign, Edit, Euro, PoundSterling, JapaneseYen } from 'lucide-react';

interface EnrichedCustomer extends Customer {
    upcomingBookings: number;
    pastBookings: number;
    totalBookings: number;
}

interface CustomerDetailModalProps {
    customer: EnrichedCustomer;
    onClose: () => void;
    onEditTags: () => void;
}

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; }> = ({ icon, label, value }) => (
    <div className="flex items-center p-3 bg-white dark:bg-protribe-gray-800 rounded-lg">
        <div className="flex-shrink-0 mr-3 text-protribe-teal">{icon}</div>
        <div>
            <div className="text-sm text-protribe-gray-dark dark:text-protribe-gray-light">{label}</div>
            <div className="text-lg font-bold text-protribe-gray-extradark dark:text-white">{value}</div>
        </div>
    </div>
);

const TabButton: React.FC<{ icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void; }> = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex-1 md:flex-none md:w-auto flex items-center justify-center md:justify-start space-x-3 px-4 py-3 text-sm font-medium rounded-md transition-colors ${
            isActive
                ? 'bg-protribe-green-light dark:bg-protribe-green-dark/30 text-protribe-teal'
                : 'text-protribe-gray-dark dark:text-protribe-gray-light hover:bg-protribe-gray-extralight dark:hover:bg-protribe-gray-800'
        }`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({ customer, onClose, onEditTags }) => {
    const { bookings, purchases } = useEvents();
    const { addCustomerNote } = useCustomer();
    const { currency } = useSettings();
    const [activeTab, setActiveTab] = useState<'bookings' | 'purchases' | 'notes'>('bookings');
    const [newNote, setNewNote] = useState('');

    const customerBookings = useMemo(() => {
        return bookings
            .filter(b => b.customerId === customer.id)
            .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
    }, [bookings, customer.id]);
    
    const customerPurchases = useMemo(() => {
         return purchases
            .filter(p => p.customerId === customer.id)
            .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
    }, [purchases, customer.id]);

    const totalSpent = useMemo(() => {
        return customerPurchases.reduce((sum, p) => sum + parseFloat(p.price), 0);
    }, [customerPurchases]);

    const CurrencyIcon: React.FC<{ currency: Currency }> = ({ currency }) => {
        switch (currency) {
            case 'EUR':
                return <Euro size={20} />;
            case 'GBP':
                return <PoundSterling size={20} />;
            case 'JPY':
                return <JapaneseYen size={20} />;
            case 'USD':
            default:
                return <DollarSign size={20} />;
        }
    };

    const handleAddNote = () => {
        addCustomerNote(customer.id, newNote);
        setNewNote('');
    };

    const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

    const renderBookings = () => {
        const now = new Date();
        const upcoming = customerBookings.filter(b => new Date(b.eventDate + 'T23:59:59Z') >= now);
        const past = customerBookings.filter(b => new Date(b.eventDate + 'T23:59:59Z') < now);

        const BookingList: React.FC<{ title: string; bookings: typeof customerBookings }> = ({ title, bookings }) => (
            <div>
                <h4 className="font-semibold text-protribe-gray-extradark dark:text-white mb-2">{title} ({bookings.length})</h4>
                {bookings.length > 0 ? (
                    <ul className="space-y-3">
                        {bookings.map(b => (
                            <li key={b.id} className="p-3 bg-protribe-gray-extralight dark:bg-protribe-gray-800 rounded-md">
                                <p className="font-semibold text-protribe-gray-dark dark:text-protribe-gray-light">{b.serviceTitle}</p>
                                <div className="flex items-center gap-4 text-sm text-protribe-gray dark:text-protribe-gray-400 mt-1">
                                    <div className="flex items-center gap-1.5"><Calendar size={14} /><span>{new Date(b.eventDate + 'T00:00:00Z').toLocaleDateString('en-US', { dateStyle: 'long', timeZone: 'UTC' })}</span></div>
                                    {b.eventTime && <div className="flex items-center gap-1.5"><Clock size={14} /><span>{new Date('1970-01-01T' + b.eventTime).toLocaleTimeString([], { hour: 'numeric', minute:'2-digit' })}</span></div>}
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : <p className="text-sm text-protribe-gray dark:text-protribe-gray-400">No {title.toLowerCase()} bookings.</p>}
            </div>
        );

        return (
            <div className="space-y-6">
                <BookingList title="Upcoming" bookings={upcoming} />
                <BookingList title="Past" bookings={past} />
            </div>
        );
    };
    
    const renderPurchases = () => (
        <div>
            {customerPurchases.length > 0 ? (
                <ul className="space-y-3">
                    {customerPurchases.map(p => (
                        <li key={p.id} className="flex justify-between items-center p-3 bg-protribe-gray-extralight dark:bg-protribe-gray-800 rounded-md">
                            <div>
                                <p className="font-semibold text-protribe-gray-dark dark:text-protribe-gray-light">{p.itemName}</p>
                                <p className="text-sm text-protribe-gray dark:text-protribe-gray-400">
                                    {new Date(p.purchaseDate).toLocaleDateString('en-US', { dateStyle: 'long' })}
                                </p>
                            </div>
                            <div className="font-bold text-protribe-gray-extradark dark:text-white">
                                {currencySymbols[currency]}{p.price}
                            </div>
                        </li>
                    ))}
                </ul>
            ) : <p className="text-sm text-protribe-gray dark:text-protribe-gray-400">No purchase history found.</p>}
        </div>
    );
    
    const renderNotes = () => (
        <div>
            <div className="mb-4">
                <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={4}
                    placeholder="Add a new note..."
                    className="w-full p-2 bg-white dark:bg-protribe-gray-800 border border-gray-300 dark:border-protribe-gray-500 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-protribe-teal/50"
                ></textarea>
                <button onClick={handleAddNote} className="mt-2 flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-protribe-teal rounded-md hover:bg-protribe-green-dark">
                    <Plus size={16} /> Add Note
                </button>
            </div>
            <h4 className="font-semibold text-protribe-gray-extradark dark:text-white mb-2">History</h4>
            {customer.notes.length > 0 ? (
                 <ul className="space-y-3">
                    {customer.notes.map((note, index) => (
                        <li key={index} className="p-3 bg-protribe-gray-extralight dark:bg-protribe-gray-800 rounded-md">
                            <p className="text-sm text-protribe-gray-dark dark:text-protribe-gray-light whitespace-pre-wrap">{note.text}</p>
                            <p className="text-xs text-protribe-gray dark:text-protribe-gray-400 mt-2">
                                {new Date(note.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                            </p>
                        </li>
                    ))}
                 </ul>
            ) : <p className="text-sm text-protribe-gray dark:text-protribe-gray-400">No notes yet.</p>}
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4" role="dialog" aria-modal="true" aria-labelledby="customer-detail-title">
            <div className="relative bg-protribe-gray-extralight dark:bg-protribe-gray-900 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-3 right-3 z-20 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-protribe-gray-800">
                    <X size={24} className="text-protribe-gray-dark dark:text-protribe-gray-light" />
                </button>
                
                {/* Left Sidebar */}
                <div className="w-full md:w-1/3 bg-white dark:bg-protribe-gray-700 p-4 md:p-6 border-b md:border-b-0 md:border-r border-gray-200 dark:border-protribe-gray-600 flex flex-col flex-shrink-0">
                    <div className="text-center mb-4 md:mb-6">
                        <div className="w-20 h-20 rounded-full bg-protribe-green-light flex items-center justify-center font-bold text-protribe-green-dark text-3xl mx-auto md:w-24 md:h-24 md:text-4xl">
                            {getInitials(customer.name)}
                        </div>
                        <h2 id="customer-detail-title" className="text-xl md:text-2xl font-bold text-protribe-gray-extradark dark:text-white mt-3 md:mt-4">{customer.name}</h2>
                        <p className="text-sm text-protribe-gray-dark dark:text-protribe-gray-light">{customer.email}</p>
                        <p className="text-xs text-protribe-gray dark:text-protribe-gray-400 mt-1">
                            Customer since {new Date(customer.signUpDate).toLocaleDateString([], { year: 'numeric', month: 'long'})}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-auto md:mt-0">
                        <StatCard icon={<Briefcase size={20} />} label="Total Bookings" value={customer.totalBookings} />
                        <StatCard icon={<CurrencyIcon currency={currency} />} label="Total Spent" value={`${currencySymbols[currency]}${totalSpent.toFixed(2)}`} />
                    </div>

                    <div className="mt-4 md:mt-6">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-sm font-semibold uppercase text-protribe-gray dark:text-protribe-gray-400">Tags</h3>
                            <button onClick={onEditTags} className="text-protribe-teal hover:text-protribe-green-dark text-xs font-semibold flex items-center gap-1 p-1 rounded hover:bg-protribe-green-light dark:hover:bg-protribe-green-dark/20">
                                <Edit size={14} />
                                <span>Edit</span>
                            </button>
                        </div>
                         <div className="flex flex-wrap gap-2">
                            {customer.tags.map(tag => (
                                <span key={tag} className="px-2 py-1 text-xs font-medium bg-protribe-teal/20 text-protribe-teal-dark dark:bg-protribe-teal/30 dark:text-protribe-teal-light rounded-md">{tag}</span>
                            ))}
                            {customer.tags.length === 0 && <span className="text-xs text-protribe-gray">No tags</span>}
                        </div>
                    </div>
                </div>

                {/* Right Content */}
                <div className="w-full md:w-2/3 flex flex-col min-h-0">
                    <div className="flex-shrink-0 p-4 md:p-6 flex items-center border-b border-gray-200 dark:border-protribe-gray-800">
                        <nav className="flex items-center gap-2 md:gap-4 w-full">
                            <TabButton label="Bookings" icon={<Calendar size={16} />} isActive={activeTab === 'bookings'} onClick={() => setActiveTab('bookings')} />
                            <TabButton label="Purchases" icon={<ShoppingBag size={16} />} isActive={activeTab === 'purchases'} onClick={() => setActiveTab('purchases')} />
                            <TabButton label="Notes" icon={<FileText size={16} />} isActive={activeTab === 'notes'} onClick={() => setActiveTab('notes')} />
                        </nav>
                    </div>
                    <div className="flex-grow p-4 md:p-6 overflow-y-auto">
                        {activeTab === 'bookings' && renderBookings()}
                        {activeTab === 'purchases' && renderPurchases()}
                        {activeTab === 'notes' && renderNotes()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerDetailModal;