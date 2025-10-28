import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Base type for all bookable/purchasable items
interface EventItem {
    id: number;
    status: 'active' | 'paused';
    title: string;
    description?: string;
    price: string;
}

// Specific Types for Events
export interface Session extends EventItem {
    date: string;
    time: string;
    duration: string;
    sessionType: '1-on-1' | 'Group';
    location: string;
    isVirtual: boolean;
    maxEntries: number;
    isPublic: boolean;
    allowCash: boolean;
    allowStripe: boolean;
    allowRescheduling: boolean;
    rescheduleHours: number;
}

export interface Class extends EventItem {
    duration: string;
    location: string;
    isVirtual: boolean;
    maxEntries: number;
    schedule: {
        days: string[];
        startTime: string;
        startDate: string;
        endDate: string;
    };
    isPublic: boolean;
    allowCash: boolean;
    allowStripe: boolean;
    allowRescheduling: boolean;
    rescheduleHours: number;
}

export interface AvailabilitySlot {
    from: string;
    to: string;
}

export interface WeeklyAvailability {
    day: 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';
    slots: AvailabilitySlot[];
    enabled: boolean;
}

export interface DateOverride {
    date: string;
    slots: AvailabilitySlot[];
}

export interface AppointmentType extends EventItem {
    duration: number;
    location: string;
    isVirtual: boolean;
    customLink: string;
    dateRangeDays: number;
    weeklyAvailability: WeeklyAvailability[];
    dateOverrides: DateOverride[];
    allowRescheduling: boolean; // Added for consistency
    rescheduleHours: number; // Added for consistency
}

export interface Bundle extends EventItem {
    includedSessionIds: number[];
    includedClassIds: number[];
    includedAppointments: { id: number; quantity: number }[];
}

export interface Membership extends EventItem {
    billingInterval: 'monthly' | 'yearly';
    includedSessionIds: { id: number; quantity: number | 'unlimited' }[];
    includedClassIds: { id: number; quantity: number | 'unlimited' }[];
    includedAppointments: { id: number; quantity: number | 'unlimited' }[];
}

export interface Booking {
    id: number;
    customerId: number;
    serviceId: number;
    serviceType: 'session' | 'class' | 'appointment';
    serviceTitle: string;
    eventDate: string; // YYYY-MM-DD
    eventTime?: string; // HH:mm
    status: 'confirmed' | 'cancelled';
}

export interface Purchase {
    id: number;
    customerId: number;
    itemId: number;
    itemType: 'bundle' | 'membership';
    itemName: string;
    purchaseDate: string;
    price: string;
}


// Context Type
interface EventContextType {
    sessions: Session[];
    classes: Class[];
    appointmentTypes: AppointmentType[];
    bundles: Bundle[];
    memberships: Membership[];
    bookings: Booking[];
    purchases: Purchase[];
    saveSession: (session: Omit<Session, 'id' | 'status'> & { id?: number }) => Session;
    deleteSession: (id: number) => void;
    togglePauseSession: (id: number) => void;
    saveClass: (classData: Omit<Class, 'id' | 'status'> & { id?: number }) => Class;
    deleteClass: (id: number) => void;
    togglePauseClass: (id: number) => void;
    saveAppointmentType: (appointmentData: Omit<AppointmentType, 'id' | 'status'> & { id?: number }) => AppointmentType;
    deleteAppointmentType: (id: number) => void;
    togglePauseAppointmentType: (id: number) => void;
    saveBundle: (bundleData: Omit<Bundle, 'id' | 'status'> & { id?: number }) => Bundle;
    deleteBundle: (id: number) => void;
    togglePauseBundle: (id: number) => void;
    saveMembership: (membershipData: Omit<Membership, 'id' | 'status'> & { id?: number }) => Membership;
    deleteMembership: (id: number) => void;
    togglePauseMembership: (id: number) => void;
    addBooking: (booking: Omit<Booking, 'id'>) => void;
    cancelBooking: (bookingId: number) => void;
    rescheduleBooking: (bookingId: number, newDate: string, newTime: string) => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

// Helper to get from localStorage
const getFromStorage = <T,>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error reading ${key} from localStorage`, error);
        return defaultValue;
    }
};

// Mock Data
const MOCK_SESSIONS: Session[] = [
    {
        id: 1, status: 'active', title: '1-on-1 Discovery Call', description: 'A 30-minute introductory call to discuss your goals.',
        date: '2025-10-28', time: '14:00', duration: '30', price: '0', sessionType: '1-on-1', location: 'Zoom', isVirtual: true, maxEntries: 1,
        isPublic: true, allowCash: false, allowStripe: true, allowRescheduling: true, rescheduleHours: 24
    },
    {
        id: 2, status: 'paused', title: 'Deep Dive Coaching Session', description: 'A full 90-minute session to work through your challenges.',
        date: '2025-11-05', time: '10:00', duration: '90', price: '150', sessionType: '1-on-1', location: '123 Main St', isVirtual: false, maxEntries: 1,
        isPublic: true, allowCash: true, allowStripe: true, allowRescheduling: true, rescheduleHours: 48
    },
];

const MOCK_CLASSES: Class[] = [
    {
        id: 1, status: 'active', title: 'Weekly Group Mindset Call', description: 'Join our weekly group call to set your intentions and overcome obstacles.',
        duration: '60', price: '25', location: 'Zoom', isVirtual: true, maxEntries: 20, isPublic: true, allowCash: false, allowStripe: true, allowRescheduling: false, rescheduleHours: 24,
        schedule: { days: ['Wed'], startTime: '19:00', startDate: '2025-01-01', endDate: '2025-12-31' }
    }
];

const MOCK_APPOINTMENT_TYPES: AppointmentType[] = [
    {
        id: 1, status: 'active', title: '30-Minute Check-in', description: 'Book a quick 30-minute check-in call with me.',
        duration: 30, price: '75', location: 'Google Meet', isVirtual: true, customLink: 'check-in-30', dateRangeDays: 60,
        allowRescheduling: true, rescheduleHours: 24,
        weeklyAvailability: [
            { day: 'Sun', slots: [], enabled: false },
            { day: 'Mon', slots: [{ from: '09:00', to: '12:00' }], enabled: true },
            { day: 'Tue', slots: [{ from: '09:00', to: '17:00' }], enabled: true },
            { day: 'Wed', slots: [{ from: '09:00', to: '12:00' }], enabled: true },
            { day: 'Thu', slots: [{ from: '09:00', to: '17:00' }], enabled: true },
            { day: 'Fri', slots: [{ from: '13:00', to: '17:00' }], enabled: true },
            { day: 'Sat', slots: [], enabled: false },
        ],
        dateOverrides: [],
    }
];

const MOCK_BUNDLES: Bundle[] = [
    {
        id: 1, status: 'active', title: 'Starter Pack', description: 'Get started with one deep dive session and one 30-minute check-in.',
        price: '200', includedSessionIds: [2], includedClassIds: [], includedAppointments: [{ id: 1, quantity: 1 }]
    }
];

const MOCK_MEMBERSHIPS: Membership[] = [
    {
        id: 1, status: 'active', title: 'All-Access Pass', description: 'Unlimited weekly group calls and one 30-minute check-in per month.',
        price: '99', billingInterval: 'monthly', includedSessionIds: [], includedClassIds: [{id: 1, quantity: 'unlimited'}], includedAppointments: [{id: 1, quantity: 1}]
    }
];

const MOCK_BOOKINGS: Booking[] = [
    { id: 1, customerId: 1, serviceId: 1, serviceType: 'session', serviceTitle: '1-on-1 Discovery Call', eventDate: '2025-10-28', eventTime: '14:00', status: 'confirmed' },
    { id: 2, customerId: 2, serviceId: 2, serviceType: 'session', serviceTitle: 'Deep Dive Coaching Session', eventDate: '2025-11-05', eventTime: '10:00', status: 'confirmed' },
    // A class booking for this week's Wednesday
    { id: 3, customerId: 3, serviceId: 1, serviceType: 'class', serviceTitle: 'Weekly Group Mindset Call', eventDate: new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 3)).toISOString().split('T')[0], eventTime: '19:00', status: 'confirmed' },
    // An appointment for this week's Monday
    { id: 4, customerId: 4, serviceId: 1, serviceType: 'appointment', serviceTitle: '30-Minute Check-in', eventDate: new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 1)).toISOString().split('T')[0], eventTime: '10:30', status: 'confirmed' }, 
    // Another appointment for this week's Monday
    { id: 5, customerId: 1, serviceId: 1, serviceType: 'appointment', serviceTitle: '30-Minute Check-in', eventDate: new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 1)).toISOString().split('T')[0], eventTime: '11:00', status: 'confirmed' },
];


const MOCK_PURCHASES: Purchase[] = [
    { id: 1, customerId: 1, itemId: 1, itemType: 'bundle', itemName: 'Starter Pack', purchaseDate: '2025-09-20T11:00:00Z', price: '200' },
    { id: 2, customerId: 2, itemId: 1, itemType: 'membership', itemName: 'All-Access Pass', purchaseDate: '2025-10-02T10:00:00Z', price: '99' },
    { id: 3, customerId: 4, itemId: 1, itemType: 'membership', itemName: 'All-Access Pass', purchaseDate: '2025-08-22T15:00:00Z', price: '99' },
    { id: 4, customerId: 1, itemId: 1, itemType: 'membership', itemName: 'All-Access Pass', purchaseDate: '2025-10-10T09:00:00Z', price: '99' },
];

export const EventProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [sessions, setSessions] = useState<Session[]>(() => getFromStorage('sessions', MOCK_SESSIONS));
    const [classes, setClasses] = useState<Class[]>(() => getFromStorage('classes', MOCK_CLASSES));
    const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>(() => getFromStorage('appointmentTypes', MOCK_APPOINTMENT_TYPES));
    const [bundles, setBundles] = useState<Bundle[]>(() => getFromStorage('bundles', MOCK_BUNDLES));
    const [memberships, setMemberships] = useState<Membership[]>(() => getFromStorage('memberships', MOCK_MEMBERSHIPS));
    const [bookings, setBookings] = useState<Booking[]>(() => getFromStorage('bookings', MOCK_BOOKINGS));
    const [purchases, setPurchases] = useState<Purchase[]>(() => getFromStorage('purchases', MOCK_PURCHASES));
    
    useEffect(() => { localStorage.setItem('sessions', JSON.stringify(sessions)); }, [sessions]);
    useEffect(() => { localStorage.setItem('classes', JSON.stringify(classes)); }, [classes]);
    useEffect(() => { localStorage.setItem('appointmentTypes', JSON.stringify(appointmentTypes)); }, [appointmentTypes]);
    useEffect(() => { localStorage.setItem('bundles', JSON.stringify(bundles)); }, [bundles]);
    useEffect(() => { localStorage.setItem('memberships', JSON.stringify(memberships)); }, [memberships]);
    useEffect(() => { localStorage.setItem('bookings', JSON.stringify(bookings)); }, [bookings]);
    useEffect(() => { localStorage.setItem('purchases', JSON.stringify(purchases)); }, [purchases]);

    const createSaveHandler = <T extends EventItem | AppointmentType>(setState: React.Dispatch<React.SetStateAction<T[]>>) => 
        (itemData: Omit<T, 'id' | 'status'> & { id?: number }): T => {
            let savedItem: T | undefined;
            setState(prevItems => {
                if (itemData.id) { // Update
                    const newItems = prevItems.map(item => {
                        if (item.id === itemData.id) {
                            savedItem = { ...item, ...itemData } as T;
                            return savedItem;
                        }
                        return item;
                    });
                    return newItems;
                } else { // Create
                    const newId = prevItems.length > 0 ? Math.max(...prevItems.map(i => i.id)) + 1 : 1;
                    const newItem: T = { ...itemData, id: newId, status: 'active' } as T;
                    // Add default rescheduling policy to new appointments if it's missing
                    if ('customLink' in newItem && !('allowRescheduling' in newItem)) {
                        (newItem as AppointmentType).allowRescheduling = false;
                        (newItem as AppointmentType).rescheduleHours = 24;
                    }
                    savedItem = newItem;
                    return [...prevItems, newItem];
                }
            });
            if (!savedItem) {
                // This should not happen in practice with the logic above
                throw new Error("Failed to save the item.");
            }
            return savedItem;
        };

    const createDeleteHandler = <T extends EventItem>(setState: React.Dispatch<React.SetStateAction<T[]>>) => 
        (id: number) => {
            setState(prevItems => prevItems.filter(item => item.id !== id));
        };
        
    const createTogglePauseHandler = <T extends EventItem>(setState: React.Dispatch<React.SetStateAction<T[]>>) => 
        (id: number) => {
            setState(prevItems => prevItems.map(item =>
                item.id === id ? { ...item, status: item.status === 'active' ? 'paused' : 'active' } : item
            ));
        };

    const addBooking = (bookingData: Omit<Booking, 'id'>) => {
        setBookings(prev => {
            const newId = prev.length > 0 ? Math.max(...prev.map(b => b.id)) + 1 : 1;
            return [...prev, { ...bookingData, id: newId }];
        });
    };
    
    const cancelBooking = (bookingId: number) => {
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
    };

    const rescheduleBooking = (bookingId: number, newDate: string, newTime: string) => {
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, eventDate: newDate, eventTime: newTime, status: 'confirmed' } : b));
    };

    const value = {
        sessions, classes, appointmentTypes, bundles, memberships, bookings, purchases,
        saveSession: createSaveHandler(setSessions),
        deleteSession: createDeleteHandler(setSessions),
        togglePauseSession: createTogglePauseHandler(setSessions),
        saveClass: createSaveHandler(setClasses),
        deleteClass: createDeleteHandler(setClasses),
        togglePauseClass: createTogglePauseHandler(setClasses),
        saveAppointmentType: createSaveHandler(setAppointmentTypes),
        deleteAppointmentType: createDeleteHandler(setAppointmentTypes),
        togglePauseAppointmentType: createTogglePauseHandler(setAppointmentTypes),
        saveBundle: createSaveHandler(setBundles),
        deleteBundle: createDeleteHandler(setBundles),
        togglePauseBundle: createTogglePauseHandler(setBundles),
        saveMembership: createSaveHandler(setMemberships),
        deleteMembership: createDeleteHandler(setMemberships),
        togglePauseMembership: createTogglePauseHandler(setMemberships),
        addBooking,
        cancelBooking,
        rescheduleBooking,
    };

    return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
};

export const useEvents = (): EventContextType => {
    const context = useContext(EventContext);
    if (context === undefined) {
        throw new Error('useEvents must be used within an EventProvider');
    }
    return context;
};