import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface StorefrontSettings {
    title: string;
    slug: string;
    logoUrl: string;
    coverImageUrl: string;
    welcomeMessage: string;
    sections: {
        services: boolean;
        bundles: boolean;
        memberships: boolean;
    };
    socialLinks: {
        instagram: string;
        twitter: string;
        facebook: string;
    };
}

interface StorefrontContextType {
    settings: StorefrontSettings;
    setSettings: (settings: StorefrontSettings) => void;
}

const StorefrontContext = createContext<StorefrontContextType | undefined>(undefined);

const initialSettings: StorefrontSettings = {
    title: 'Your Coaching Business',
    slug: 'your-name',
    logoUrl: '',
    coverImageUrl: 'https://images.unsplash.com/photo-1517502884422-41ea045b7848?q=80&w=2070&auto=format&fit=crop',
    welcomeMessage: 'Welcome to my official scheduling page! Here you can book sessions, purchase packages, and subscribe to memberships. I look forward to working with you.',
    sections: {
        services: true,
        bundles: true,
        memberships: true,
    },
    socialLinks: {
        instagram: '',
        twitter: '',
        facebook: '',
    }
};

export const StorefrontProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [settings, setSettingsState] = useState<StorefrontSettings>(() => {
        try {
            const savedSettings = localStorage.getItem('storefrontSettings');
            return savedSettings ? JSON.parse(savedSettings) : initialSettings;
        } catch (error) {
            console.error('Failed to parse storefront settings from localStorage', error);
            return initialSettings;
        }
    });

    const setSettings = (newSettings: StorefrontSettings) => {
        setSettingsState(newSettings);
        localStorage.setItem('storefrontSettings', JSON.stringify(newSettings));
    };

    return (
        <StorefrontContext.Provider value={{ settings, setSettings }}>
            {children}
        </StorefrontContext.Provider>
    );
};

export const useStorefront = (): StorefrontContextType => {
    const context = useContext(StorefrontContext);
    if (context === undefined) {
        throw new Error('useStorefront must be used within a StorefrontProvider');
    }
    return context;
};