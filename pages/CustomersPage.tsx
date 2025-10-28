import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useCustomer, Customer } from '../contexts/CustomerContext';
import { useEvents } from '../contexts/EventContext';
import { Search, MoreVertical, Edit, Trash2, X, Tag, Plus, ChevronDown, Download } from 'lucide-react';
import CustomerDetailModal from '../components/modals/CustomerDetailModal';
import AddCustomerModal from '../components/modals/AddCustomerModal';

interface EnrichedCustomer extends Customer {
    upcomingBookings: number;
    pastBookings: number;
    totalBookings: number;
}

const EditTagsModal: React.FC<{
    customer: EnrichedCustomer | null;
    allTags: string[];
    onClose: () => void;
    onSave: (customerId: number, tags: string[]) => void;
}> = ({ customer, allTags, onClose, onSave }) => {
    const [tags, setTags] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState('');
    
    useEffect(() => {
        if (customer) {
            setTags(customer.tags.sort());
        }
    }, [customer]);

    if (!customer) return null;

    const handleAddTag = (tag: string) => {
        const newTag = tag.trim();
        if (newTag && !tags.includes(newTag)) {
            setTags([...tags, newTag].sort());
        }
        setInputValue('');
    };
    
    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag(inputValue);
        }
    };
    
    const handleSave = () => {
        onSave(customer.id, tags);
        onClose();
    };

    const suggestedTags = allTags.filter(t => !tags.includes(t) && t.toLowerCase().includes(inputValue.toLowerCase()));

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-protribe-gray-700 rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-200 dark:border-protribe-gray-600">
                    <h2 className="text-xl font-bold text-protribe-gray-extradark dark:text-white">Edit Tags</h2>
                    <p className="text-sm text-protribe-gray-dark dark:text-protribe-gray-light">For {customer.name}</p>
                </div>
                <div className="p-6">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light mb-2">Add or create tags</label>
                        <div className="relative">
                           <input
                                type="text"
                                value={inputValue}
                                onChange={e => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Type to add a tag..."
                                className="w-full pl-3 pr-10 py-2 bg-white dark:bg-protribe-gray-800 border border-gray-300 dark:border-protribe-gray-500 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-protribe-teal/50"
                           />
                           <button onClick={() => handleAddTag(inputValue)} className="absolute inset-y-0 right-0 px-3 flex items-center text-protribe-teal hover:text-protribe-green-dark">
                               <Plus size={18} />
                           </button>
                        </div>
                         {inputValue && suggestedTags.length > 0 && (
                            <div className="border border-gray-300 dark:border-protribe-gray-500 bg-white dark:bg-protribe-gray-800 rounded-md mt-1 max-h-32 overflow-y-auto">
                                {suggestedTags.map(tag => (
                                    <button key={tag} onClick={() => handleAddTag(tag)} className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-protribe-gray-600">
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light mb-2">Current Tags</h3>
                        <div className="flex flex-wrap gap-2 p-3 min-h-[40px] bg-protribe-gray-extralight dark:bg-protribe-gray-800 rounded-md border border-gray-200 dark:border-protribe-gray-600">
                            {tags.length > 0 ? tags.map(tag => (
                                <span key={tag} className="flex items-center gap-1.5 bg-protribe-teal/20 text-protribe-teal-dark dark:bg-protribe-teal/30 dark:text-protribe-teal-light text-sm font-medium px-2 py-1 rounded-md">
                                    {tag}
                                    <button onClick={() => handleRemoveTag(tag)} className="text-protribe-teal hover:text-protribe-green-dark"><X size={14}/></button>
                                </span>
                            )) : <p className="text-sm text-protribe-gray">No tags assigned.</p>}
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-protribe-gray-800 border-t border-gray-200 dark:border-protribe-gray-600 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium bg-white dark:bg-protribe-gray-700 border border-gray-300 dark:border-protribe-gray-500 rounded-md hover:bg-gray-50 dark:hover:bg-protribe-gray-600">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-protribe-teal rounded-md hover:bg-protribe-green-dark">Save Changes</button>
                </div>
            </div>
        </div>
    );
};

const TagFilterDropdown: React.FC<{
    allTags: string[];
    selectedTags: string[];
    onChange: (tags: string[]) => void;
}> = ({ allTags, selectedTags, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleTagToggle = (tag: string) => {
        const newSelected = selectedTags.includes(tag)
            ? selectedTags.filter(t => t !== tag)
            : [...selectedTags, tag];
        onChange(newSelected);
    };

    return (
        <div ref={dropdownRef} className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full md:w-auto flex items-center justify-between gap-2 px-3 py-2 bg-white dark:bg-protribe-gray-800 border border-gray-300 dark:border-protribe-gray-500 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-protribe-teal/50"
            >
                <Tag size={16} className="text-gray-400" />
                <span>Filter by Tag</span>
                {selectedTags.length > 0 && (
                    <span className="bg-protribe-teal text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{selectedTags.length}</span>
                )}
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-protribe-gray-800 rounded-md shadow-lg border dark:border-protribe-gray-600 z-20">
                    <div className="p-2 max-h-60 overflow-y-auto">
                        {allTags.map(tag => (
                            <label key={tag} className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-protribe-gray-700 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedTags.includes(tag)}
                                    onChange={() => handleTagToggle(tag)}
                                    className="h-4 w-4 rounded border-gray-300 text-protribe-teal focus:ring-protribe-teal"
                                />
                                <span className="text-sm">{tag}</span>
                            </label>
                        ))}
                    </div>
                    {selectedTags.length > 0 && (
                        <div className="p-2 border-t border-gray-100 dark:border-protribe-gray-700">
                             <button onClick={() => onChange([])} className="w-full text-center text-sm text-protribe-teal hover:underline">Clear selection</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};


const ActionMenu: React.FC<{ customer: EnrichedCustomer; onEditTags: () => void; onViewDetails: () => void; }> = ({ customer, onEditTags, onViewDetails }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-protribe-gray-600 text-gray-500 dark:text-protribe-gray-light">
                <MoreVertical size={20} />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-protribe-gray-800 rounded-md shadow-lg border dark:border-protribe-gray-600 z-10">
                    <button onClick={() => { onViewDetails(); setIsOpen(false); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-protribe-gray-dark dark:text-protribe-gray-light hover:bg-gray-100 dark:hover:bg-protribe-gray-700">
                        <Edit size={14} className="mr-2" /> View Details
                    </button>
                    <button onClick={() => { onEditTags(); setIsOpen(false); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-protribe-gray-dark dark:text-protribe-gray-light hover:bg-gray-100 dark:hover:bg-protribe-gray-700">
                        <Tag size={14} className="mr-2" /> Edit Tags
                    </button>
                    <div className="border-t border-gray-100 dark:border-protribe-gray-700 my-1"></div>
                    <button onClick={() => { console.log("Delete customer"); setIsOpen(false); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50">
                        <Trash2 size={14} className="mr-2" /> Delete Customer
                    </button>
                </div>
            )}
        </div>
    );
};

const CustomersPage: React.FC = () => {
    const { customers, updateCustomerTags, addCustomer } = useCustomer();
    const { bookings, purchases } = useEvents();

    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [editingCustomer, setEditingCustomer] = useState<EnrichedCustomer | null>(null);
    const [viewingCustomer, setViewingCustomer] = useState<EnrichedCustomer | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

    const tagColorStyles = (tag: string) => {
        let hash = 0;
        for (let i = 0; i < tag.length; i++) {
            hash = tag.charCodeAt(i) + ((hash << 5) - hash);
        }
        const hue = hash % 360;
        return {
            backgroundColor: `hsl(${hue}, 70%, 92%)`,
            color: `hsl(${hue}, 60%, 30%)`,
        };
    };

    const enrichedCustomers = useMemo(() => {
        return customers.map(customer => {
            const customerBookings = bookings.filter(b => b.customerId === customer.id);
            const now = new Date();
            now.setHours(0, 0, 0, 0);

            const upcomingBookings = customerBookings.filter(b => new Date(b.eventDate + 'T00:00:00Z') >= now).length;
            const pastBookings = customerBookings.length - upcomingBookings;
            return { ...customer, upcomingBookings, pastBookings, totalBookings: customerBookings.length };
        }).sort((a, b) => new Date(b.signUpDate).getTime() - new Date(a.signUpDate).getTime());
    }, [customers, bookings]);
    
    useEffect(() => {
        if (viewingCustomer) {
            const updatedCustomer = enrichedCustomers.find(c => c.id === viewingCustomer.id);
            if (updatedCustomer && JSON.stringify(updatedCustomer) !== JSON.stringify(viewingCustomer)) {
                setViewingCustomer(updatedCustomer);
            }
        }
    }, [customers, enrichedCustomers, viewingCustomer]);

    const allUniqueTags = useMemo(() => {
        const tagsSet = new Set<string>();
        enrichedCustomers.forEach(c => c.tags.forEach(tag => tagsSet.add(tag)));
        return Array.from(tagsSet).sort();
    }, [enrichedCustomers]);

    const filteredCustomers = useMemo(() => {
        return enrichedCustomers
            .filter(customer => {
                const searchLower = searchTerm.toLowerCase();
                return customer.name.toLowerCase().includes(searchLower) || customer.email.toLowerCase().includes(searchLower);
            })
            .filter(customer => {
                const signUpDate = new Date(customer.signUpDate);
                const startDate = dateFilter.start ? new Date(dateFilter.start) : null;
                const endDate = dateFilter.end ? new Date(dateFilter.end) : null;
                if (startDate && signUpDate < startDate) return false;
                if (endDate) {
                    endDate.setHours(23, 59, 59, 999);
                    if (signUpDate > endDate) return false;
                }
                return true;
            })
            .filter(customer => {
                if (selectedTags.length === 0) return true;
                return selectedTags.every(tag => customer.tags.includes(tag));
            });
    }, [enrichedCustomers, searchTerm, dateFilter, selectedTags]);
    
    const resetFilters = () => {
        setSearchTerm('');
        setDateFilter({ start: '', end: '' });
        setSelectedTags([]);
    };

    const handleEditTagsFromDetail = () => {
        if (viewingCustomer) {
            setEditingCustomer(viewingCustomer);
            setViewingCustomer(null);
        }
    };

    const handleDownloadData = () => {
        const headers = [
            'ID', 'Name', 'Email', 'SignUpDate', 'Tags', 
            'TotalBookings', 'UpcomingBookings', 'PastBookings', 
            'TotalSpent', 'Notes'
        ];

        const escapeCsvCell = (cellData: any) => {
            const stringData = String(cellData);
            if (stringData.includes(',') || stringData.includes('"') || stringData.includes('\n')) {
                return `"${stringData.replace(/"/g, '""')}"`;
            }
            return stringData;
        };

        const rows = customers.map(customer => {
            const customerBookings = bookings.filter(b => b.customerId === customer.id);
            const now = new Date();
            const upcomingBookings = customerBookings.filter(b => new Date(b.eventDate + 'T23:59:59Z') >= now).length;
            const pastBookings = customerBookings.length - upcomingBookings;
            
            const customerPurchases = purchases.filter(p => p.customerId === customer.id);
            const totalSpent = customerPurchases.reduce((sum, p) => sum + parseFloat(p.price), 0);

            const formattedNotes = customer.notes
                .map(note => `[${new Date(note.date).toLocaleString()}]: ${note.text.replace(/\n/g, ' ')}`)
                .join(' | ');

            return [
                customer.id,
                customer.name,
                customer.email,
                customer.signUpDate,
                customer.tags.join(', '),
                customerBookings.length,
                upcomingBookings,
                pastBookings,
                totalSpent.toFixed(2),
                formattedNotes
            ].map(escapeCsvCell).join(',');
        });

        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        const today = new Date().toISOString().split('T')[0];
        link.setAttribute("href", url);
        link.setAttribute("download", `protribe-customers-${today}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <h1 className="text-3xl font-bold text-protribe-gray-extradark dark:text-white">Customers</h1>
                    <div className="flex items-center gap-2">
                        <button onClick={handleDownloadData} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light bg-white dark:bg-protribe-gray-700 border border-gray-300 dark:border-protribe-gray-500 rounded-md hover:bg-gray-50 dark:hover:bg-protribe-gray-600 shadow-sm whitespace-nowrap">
                            <Download size={16} />
                            Download Data
                        </button>
                        <button onClick={() => setIsAddModalOpen(true)} className="px-4 py-2 text-sm font-medium text-white bg-protribe-teal rounded-md hover:bg-protribe-green-dark shadow-sm whitespace-nowrap">
                            + Add Customer
                        </button>
                    </div>
                </div>
                
                <div className="bg-white dark:bg-protribe-gray-700 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-protribe-gray-600 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="relative lg:col-span-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-protribe-gray-800 border border-gray-300 dark:border-protribe-gray-500 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-protribe-teal/50"
                            />
                        </div>
                        <div className="flex-grow lg:col-span-2 flex flex-col sm:flex-row items-center gap-2">
                             <TagFilterDropdown allTags={allUniqueTags} selectedTags={selectedTags} onChange={setSelectedTags} />
                             <div className="flex items-center gap-2 w-full">
                                <label className="text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light whitespace-nowrap hidden lg:inline">Joined:</label>
                                <input
                                    type="date"
                                    value={dateFilter.start}
                                    onChange={(e) => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
                                    className="w-full px-3 py-2 bg-white dark:bg-protribe-gray-800 border border-gray-300 dark:border-protribe-gray-500 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-protribe-teal/50"
                                />
                                <span className="text-sm text-protribe-gray-dark dark:text-protribe-gray-light">to</span>
                                <input
                                    type="date"
                                    value={dateFilter.end}
                                    onChange={(e) => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
                                    className="w-full px-3 py-2 bg-white dark:bg-protribe-gray-800 border border-gray-300 dark:border-protribe-gray-500 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-protribe-teal/50"
                                />
                                <button onClick={resetFilters} title="Reset filters" className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-protribe-gray-600">
                                    <X size={20} />
                                </button>
                             </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-protribe-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-protribe-gray-600 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-protribe-gray-dark dark:text-protribe-gray-light">
                            <thead className="text-xs text-protribe-gray dark:text-protribe-gray-400 uppercase bg-protribe-gray-extralight dark:bg-protribe-gray-800">
                                <tr>
                                    <th scope="col" className="p-4">Customer</th>
                                    <th scope="col" className="p-4">Date Joined</th>
                                    <th scope="col" className="p-4">Activity</th>
                                    <th scope="col" className="p-4">Tags</th>
                                    <th scope="col" className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCustomers.map(customer => (
                                    <tr key={customer.id} onClick={() => setViewingCustomer(customer)} className="bg-white dark:bg-protribe-gray-700 border-b dark:border-protribe-gray-600 hover:bg-gray-50 dark:hover:bg-protribe-gray-600/50 cursor-pointer">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-protribe-green-light flex items-center justify-center font-bold text-protribe-green-dark flex-shrink-0">
                                                    {getInitials(customer.name)}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-protribe-gray-extradark dark:text-white">{customer.name}</div>
                                                    <div className="text-xs text-protribe-gray">{customer.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 whitespace-nowrap">
                                            {new Date(customer.signUpDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </td>
                                        <td className="p-4">
                                            {customer.totalBookings > 0 ? (
                                                <div>
                                                    <span className="font-semibold">{customer.totalBookings}</span> Total Bookings
                                                    <div className="text-xs text-protribe-gray">
                                                        (<span className="text-green-600 dark:text-green-400">{customer.upcomingBookings} Upcoming</span>, {customer.pastBookings} Past)
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-protribe-gray">No bookings yet</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                                                {customer.tags.map(tag => (
                                                    <span key={tag} style={tagColorStyles(tag)} className="px-2 py-0.5 text-xs font-semibold rounded-full dark:text-opacity-90">
                                                        {tag}
                                                    </span>
                                                ))}
                                                {customer.tags.length === 0 && <span className="text-xs text-protribe-gray">No tags</span>}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right" onClick={e => e.stopPropagation()}>
                                            <ActionMenu customer={customer} onEditTags={() => setEditingCustomer(customer)} onViewDetails={() => setViewingCustomer(customer)} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredCustomers.length === 0 && (
                        <div className="text-center p-12 text-sm text-protribe-gray-dark dark:text-protribe-gray-light">
                            {customers.length > 0 ? "No customers match your search or filter criteria." : "You haven't added any customers yet."}
                        </div>
                    )}
                </div>
            </div>
            <AddCustomerModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={(name, email) => addCustomer(name, email)}
            />
            {editingCustomer && (
                <EditTagsModal
                    customer={editingCustomer}
                    allTags={allUniqueTags}
                    onClose={() => setEditingCustomer(null)}
                    onSave={updateCustomerTags}
                />
            )}
            {viewingCustomer && (
                <CustomerDetailModal
                    customer={viewingCustomer}
                    onClose={() => setViewingCustomer(null)}
                    onEditTags={handleEditTagsFromDetail}
                />
            )}
        </>
    );
};

export default CustomersPage;