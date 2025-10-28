import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Customer {
    id: number;
    name: string;
    email: string;
    signUpDate: string;
    tags: string[];
    notes: { text: string; date: string; }[];
}

interface CustomerContextType {
    customers: Customer[];
    currentCustomer: Customer | null;
    login: (email: string) => Customer | null;
    logout: () => void;
    signUp: (name: string, email: string) => Customer;
    updateCustomerTags: (customerId: number, tags: string[]) => void;
    addCustomerNote: (customerId: number, noteText: string) => void;
    addCustomer: (name: string, email: string) => { success: boolean, message?: string, customer?: Customer };
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

const MOCK_CUSTOMERS: Customer[] = [
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com', signUpDate: new Date('2025-09-15T10:00:00Z').toISOString(), tags: ['VIP', 'New Lead'], notes: [{ text: "Interested in the new transformation bundle.", date: "2025-10-09T10:00:00Z" }] },
    { id: 2, name: 'Bob Williams', email: 'bob@example.com', signUpDate: new Date('2025-10-01T14:30:00Z').toISOString(), tags: ['Repeat Client'], notes: [] },
    { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', signUpDate: new Date('2025-10-05T11:00:00Z').toISOString(), tags: ['New Lead', 'Follow-up Needed'], notes: [{ text: "Followed up on 10/08, needs another week to decide.", date: "2025-10-08T15:20:00Z" }] },
    { id: 4, name: 'Diana Prince', email: 'diana@example.com', signUpDate: new Date('2025-08-20T18:00:00Z').toISOString(), tags: ['VIP', 'Long-term'], notes: [] },
    { id: 5, name: 'Ethan Hunt', email: 'ethan@example.com', signUpDate: new Date('2025-10-10T12:00:00Z').toISOString(), tags: [], notes: [] },
];

export const CustomerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [customers, setCustomers] = useState<Customer[]>(() => {
        const saved = localStorage.getItem('customers');
         if (saved) {
            const parsed = JSON.parse(saved);
            return parsed.map((c: any) => ({ ...c, tags: c.tags || [], notes: c.notes || [] }));
        }
        return MOCK_CUSTOMERS;
    });

    const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(() => {
        const saved = sessionStorage.getItem('currentCustomer');
        return saved ? JSON.parse(saved) : null;
    });

    useEffect(() => {
        localStorage.setItem('customers', JSON.stringify(customers));
    }, [customers]);

    useEffect(() => {
        if (currentCustomer) {
            sessionStorage.setItem('currentCustomer', JSON.stringify(currentCustomer));
        } else {
            sessionStorage.removeItem('currentCustomer');
        }
    }, [currentCustomer]);

    const login = (email: string): Customer | null => {
        const customer = customers.find(c => c.email.toLowerCase() === email.toLowerCase());
        if (customer) {
            setCurrentCustomer(customer);
            return customer;
        }
        return null;
    };

    const logout = () => {
        setCurrentCustomer(null);
    };

    const signUp = (name: string, email: string): Customer => {
        const existing = customers.find(c => c.email.toLowerCase() === email.toLowerCase());
        if (existing) {
            // In a real app, you'd throw an error. Here we'll just log them in.
            setCurrentCustomer(existing);
            return existing;
        }
        const newCustomer: Customer = {
            id: customers.length > 0 ? Math.max(...customers.map(c => c.id)) + 1 : 1,
            name,
            email,
            signUpDate: new Date().toISOString(),
            tags: [],
            notes: [],
        };
        setCustomers(prev => [...prev, newCustomer]);
        setCurrentCustomer(newCustomer);
        return newCustomer;
    };

    const updateCustomerTags = (customerId: number, tags: string[]) => {
        setCustomers(prev => 
            prev.map(customer => 
                customer.id === customerId ? { ...customer, tags } : customer
            )
        );
    };

    const addCustomerNote = (customerId: number, noteText: string) => {
       if (!noteText.trim()) return;
       setCustomers(prev =>
           prev.map(customer =>
               customer.id === customerId
                   ? { ...customer, notes: [...customer.notes, { text: noteText, date: new Date().toISOString() }].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()) }
                   : customer
           )
       );
   };

    const addCustomer = (name: string, email: string): { success: boolean, message?: string, customer?: Customer } => {
        const existing = customers.find(c => c.email.toLowerCase() === email.toLowerCase());
        if (existing) {
            return { success: false, message: 'A customer with this email already exists.' };
        }
        if (!name.trim() || !email.trim()) {
            return { success: false, message: 'Name and email are required.' };
        }
        const newCustomer: Customer = {
            id: customers.length > 0 ? Math.max(...customers.map(c => c.id)) + 1 : 1,
            name,
            email,
            signUpDate: new Date().toISOString(),
            tags: [],
            notes: [],
        };
        setCustomers(prev => [newCustomer, ...prev].sort((a, b) => new Date(b.signUpDate).getTime() - new Date(a.signUpDate).getTime()));
        return { success: true, customer: newCustomer };
    };


    const value = { customers, currentCustomer, login, logout, signUp, updateCustomerTags, addCustomerNote, addCustomer };

    return (
        <CustomerContext.Provider value={value}>
            {children}
        </CustomerContext.Provider>
    );
};

export const useCustomer = (): CustomerContextType => {
    const context = useContext(CustomerContext);
    if (context === undefined) {
        throw new Error('useCustomer must be used within a CustomerProvider');
    }
    return context;
};